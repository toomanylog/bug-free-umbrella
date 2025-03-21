import * as functions from 'firebase-functions';
import { handlePaymentWebhook } from './paymentWebhook';
import * as admin from 'firebase-admin';
import axios from 'axios';

// Initialiser l'app Firebase Admin
admin.initializeApp();

/**
 * Fonction de callback pour NOWPayments
 * 
 * Cette fonction est déclenchée par les webhooks de NOWPayments lorsqu'un statut de paiement change.
 * URL de la fonction: https://[votre-région]-[votre-projet].cloudfunctions.net/paymentCallback
 * 
 * Configuration dans NOWPayments:
 * 1. Connectez-vous à votre compte NOWPayments
 * 2. Allez dans Paramètres > Callbacks 
 * 3. Activez les callbacks IPN (Instant Payment Notification)
 * 4. Définissez l'URL IPN à l'URL de cette fonction
 * 5. Activez la signature IPN pour une sécurité renforcée
 * 6. Notez votre clé IPN secrète et ajoutez-la à vos variables d'environnement
 * 
 * Déploiement:
 * firebase deploy --only functions
 */
export const paymentCallback = functions.https.onRequest(handlePaymentWebhook);

/**
 * Fonction programmée pour vérifier les statuts des paiements en attente
 * 
 * Cette fonction s'exécute toutes les 15 minutes pour vérifier les paiements
 * dont le statut est "waiting", "confirming" ou "sending" et les met à jour
 * en interrogeant l'API NOWPayments.
 * 
 * Cela permet d'avoir un mécanisme de secours si les webhooks échouent.
 */
export const checkPendingPayments = functions.pubsub.schedule('every 15 minutes').onRun(async (context) => {
  try {
    const db = admin.firestore();
    
    // Récupérer les transactions en attente
    const pendingPaymentsQuery = db.collection('transactions').where('status', 'in', [
      'waiting', 'confirming', 'sending', 'partially_paid'
    ]);
    
    const pendingPaymentsSnapshot = await pendingPaymentsQuery.get();
    
    if (pendingPaymentsSnapshot.empty) {
      console.log('Aucun paiement en attente à vérifier');
      return null;
    }
    
    // Clé API NOWPayments (à configurer dans les variables d'environnement Firebase)
    const API_KEY = functions.config().nowpayments.api_key || '';
    
    if (!API_KEY) {
      throw new Error('Clé API NOWPayments non configurée');
    }
    
    // Pour chaque transaction en attente
    const batch = db.batch();
    let updatedCount = 0;
    
    for (const doc of pendingPaymentsSnapshot.docs) {
      const transaction = doc.data();
      
      if (!transaction.paymentId) {
        console.log(`Transaction ${doc.id} sans paymentId, ignorée`);
        continue;
      }
      
      try {
        // Vérifier le statut auprès de NOWPayments
        const response = await axios.get(`https://api.nowpayments.io/v1/payment/${transaction.paymentId}`, {
          headers: {
            'x-api-key': API_KEY
          }
        });
        
        if (response.data && response.data.payment_status) {
          // Mettre à jour le statut
          const newStatus = response.data.payment_status;
          const newAmount = response.data.actually_paid || transaction.amount;
          
          if (newStatus !== transaction.status) {
            console.log(`Mise à jour de la transaction ${doc.id} : ${transaction.status} -> ${newStatus}`);
            
            // Mise à jour du document
            batch.update(doc.ref, { 
              status: newStatus,
              updatedAt: admin.firestore.FieldValue.serverTimestamp(),
              amount: newAmount
            });
            
            // Si le paiement est terminé, mettre à jour les données utilisateur
            if (newStatus === 'finished') {
              batch.update(doc.ref, { 
                completedAt: admin.firestore.FieldValue.serverTimestamp()
              });
              
              // Selon le type de transaction, effectuer les actions nécessaires
              if (transaction.type === 'deposit') {
                // Crédit du portefeuille
                const walletRef = db.collection('wallets').doc(transaction.userId);
                const walletSnap = await walletRef.get();
                
                if (walletSnap.exists) {
                  const currentBalance = walletSnap.data()?.balance || 0;
                  batch.update(walletRef, {
                    balance: currentBalance + newAmount,
                    lastUpdated: admin.firestore.FieldValue.serverTimestamp()
                  });
                }
              } else if (transaction.type === 'formation_purchase' && transaction.itemId) {
                // Attribution de la formation
                const userRef = db.collection('users').doc(transaction.userId);
                const userSnap = await userRef.get();
                
                if (userSnap.exists) {
                  const formationsProgress = userSnap.data()?.formationsProgress || [];
                  
                  // Vérifier si la formation n'est pas déjà attribuée
                  const existingProgress = formationsProgress.find(
                    (p: any) => p.formationId === transaction.itemId
                  );
                  
                  if (!existingProgress) {
                    // Ajouter la formation
                    const newProgress = {
                      formationId: transaction.itemId,
                      completedModules: [],
                      startedAt: admin.firestore.FieldValue.serverTimestamp(),
                      lastAccessedAt: admin.firestore.FieldValue.serverTimestamp(),
                      completed: false
                    };
                    
                    batch.update(userRef, {
                      formationsProgress: admin.firestore.FieldValue.arrayUnion(newProgress)
                    });
                  }
                }
              }
            }
            
            updatedCount++;
          }
        }
      } catch (error) {
        console.error(`Erreur lors de la vérification de la transaction ${doc.id}:`, error);
      }
    }
    
    // Appliquer les mises à jour en lot
    if (updatedCount > 0) {
      await batch.commit();
      console.log(`${updatedCount} transactions mises à jour avec succès`);
    } else {
      console.log('Aucune transaction n\'a été mise à jour');
    }
    
    return null;
  } catch (error) {
    console.error('Erreur lors de la vérification des paiements en attente:', error);
    return null;
  }
}); 