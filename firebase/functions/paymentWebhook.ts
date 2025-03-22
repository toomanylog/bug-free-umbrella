import * as functions from 'firebase-functions';
import { verifyIPNSignature, updateTransactionStatus, TransactionStatus } from './services/nowpayments';

/**
 * Interface pour les données de callback NOWPayments
 * https://nowpayments.io/help/what-is-ipn
 */
interface NOWPaymentsCallback {
  payment_id: string;
  payment_status: string;
  pay_address: string;
  price_amount: number;
  price_currency: string;
  pay_amount: number;
  actually_paid: number;
  pay_currency: string;
  order_id: string;
  order_description: string;
  purchase_id: string;
  created_at: string;
  updated_at: string;
  outcome_amount: number;
  outcome_currency: string;
}

/**
 * Fonction pour traiter les webhooks de NOWPayments
 * Cette fonction est conçue pour être déployée comme une fonction Cloud Firebase
 * 
 * URL à configurer dans le dashboard NOWPayments:
 * https://[votre-région]-[votre-projet].cloudfunctions.net/paymentCallback
 */
export const handlePaymentWebhook = async (
  req: functions.https.Request,
  res: functions.Response
): Promise<void> => {
  try {
    // Récupérer et valider les données
    const callbackData: NOWPaymentsCallback = req.body;
    
    if (!callbackData || !callbackData.payment_id) {
      console.error('Données de callback invalides:', callbackData);
      res.status(400).send('Données de callback invalides');
      return;
    }
    
    // Vérifier la signature (X-NOWPAYMENTS-SIG)
    const signature = req.headers['x-nowpayments-sig'] as string;
    const rawBody = JSON.stringify(req.body);
    
    if (signature && !verifyIPNSignature(signature, rawBody)) {
      console.error('Signature IPN invalide');
      res.status(401).send('Signature non valide');
      return;
    }
    
    // Mapper le statut NOWPayments vers notre enum TransactionStatus
    let transactionStatus: TransactionStatus;
    switch (callbackData.payment_status) {
      case 'waiting':
        transactionStatus = TransactionStatus.WAITING;
        break;
      case 'confirming':
        transactionStatus = TransactionStatus.CONFIRMING;
        break;
      case 'confirmed':
        transactionStatus = TransactionStatus.CONFIRMED;
        break;
      case 'sending':
        transactionStatus = TransactionStatus.SENDING;
        break;
      case 'partially_paid':
        transactionStatus = TransactionStatus.PARTIALLY_PAID;
        break;
      case 'finished':
        transactionStatus = TransactionStatus.FINISHED;
        break;
      case 'failed':
        transactionStatus = TransactionStatus.FAILED;
        break;
      case 'refunded':
        transactionStatus = TransactionStatus.REFUNDED;
        break;
      case 'expired':
        transactionStatus = TransactionStatus.EXPIRED;
        break;
      default:
        // Statut inconnu, on utilise WAITING par défaut
        transactionStatus = TransactionStatus.WAITING;
    }
    
    // Mettre à jour le statut de la transaction dans la base de données
    const updated = await updateTransactionStatus(
      callbackData.payment_id,
      transactionStatus,
      callbackData.actually_paid
    );
    
    if (updated) {
      console.log(`Transaction ${callbackData.payment_id} mise à jour avec succès: ${transactionStatus}`);
      res.status(200).send('OK');
    } else {
      console.error(`Impossible de mettre à jour la transaction ${callbackData.payment_id}`);
      res.status(500).send('Erreur lors de la mise à jour de la transaction');
    }
  } catch (error) {
    console.error('Erreur lors du traitement du webhook:', error);
    res.status(500).send('Erreur serveur');
  }
};

/**
 * Note sur le déploiement:
 * 
 * Pour déployer cette fonction comme une Cloud Function Firebase:
 * 
 * 1. Créez un fichier index.ts qui exporte la fonction:
 *    
 *    export const paymentCallback = functions.https.onRequest(handlePaymentWebhook);
 * 
 * 2. Assurez-vous que votre firebase.json inclut cette fonction:
 *    Dans "functions": { "source": "functions" }
 * 
 * 3. Déployez avec la commande:
 *    firebase deploy --only functions
 * 
 * 4. Configurez l'URL du webhook dans le tableau de bord NOWPayments
 */ 