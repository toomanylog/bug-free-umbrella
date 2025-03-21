import axios from 'axios';
import { auth, database, db } from '../config';
import { doc, updateDoc, setDoc, getDoc, collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { User } from 'firebase/auth';

// Clé API NOWPayments
const API_KEY = '09CARKN-MS64CEK-G9BGJ62-8QSSJ7M';
const PUBLIC_KEY = '467c714f-5bb9-44d0-a611-97888b03cae7';
const API_URL = 'https://api.nowpayments.io/v1';

// Clé IPN pour la vérification des webhooks - à configurer dans les variables d'environnement
const IPN_SECRET_KEY = process.env.REACT_APP_NOWPAYMENTS_IPN_KEY || 'aR65dL1KfqswL0Hmmke46GbDNvdlqggp';

// Types pour les transactions
export enum TransactionStatus {
  WAITING = 'waiting',
  CONFIRMING = 'confirming',
  CONFIRMED = 'confirmed',
  SENDING = 'sending',
  PARTIALLY_PAID = 'partially_paid',
  FINISHED = 'finished',
  FAILED = 'failed',
  REFUNDED = 'refunded',
  EXPIRED = 'expired'
}

export enum TransactionType {
  DEPOSIT = 'deposit',
  FORMATION_PURCHASE = 'formation_purchase',
  TOOL_PURCHASE = 'tool_purchase',
  OTHER_PURCHASE = 'other_purchase'
}

export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  status: TransactionStatus;
  paymentId?: string;
  invoiceId?: string;
  createdAt: Date;
  updatedAt?: Date;
  completedAt?: Date;
  type: TransactionType;
  itemId?: string; // ID de la formation, outil, etc.
  paymentUrl?: string;
}

export interface UserWallet {
  userId: string;
  balance: number;
  currency: string;
  lastUpdated: Date;
  transactions: string[]; // IDs des transactions
}

/**
 * Crée un paiement pour recharger le portefeuille
 * @param user Utilisateur actuel
 * @param amount Montant en EUR
 * @returns URL de paiement et informations sur le paiement
 */
export const createWalletDeposit = async (user: User, amount: number): Promise<{ paymentUrl: string, paymentId: string }> => {
  try {
    // Créer une demande de paiement via NOWPayments
    const response = await axios.post(`${API_URL}/payment`, {
      price_amount: amount,
      price_currency: 'eur',
      pay_currency: 'btc', // Par défaut Bitcoin, peut être modifié
      ipn_callback_url: `${process.env.REACT_APP_API_URL}/api/payment-callback`,
      order_id: `wallet_deposit_${user.uid}_${Date.now()}`,
      order_description: `Rechargement de portefeuille pour ${user.email || user.uid}`,
    }, {
      headers: {
        'x-api-key': API_KEY,
        'Content-Type': 'application/json'
      }
    });

    if (response.data && response.data.payment_id && response.data.pay_address) {
      // Enregistrer la transaction dans Firestore
      const transaction: Omit<Transaction, 'id'> = {
        userId: user.uid,
        amount: amount,
        currency: 'eur',
        status: TransactionStatus.WAITING,
        paymentId: response.data.payment_id,
        createdAt: new Date(),
        type: TransactionType.DEPOSIT,
        paymentUrl: response.data.invoice_url || response.data.pay_address
      };

      const transactionRef = await addDoc(collection(db, 'transactions'), transaction);

      // Mettre à jour le portefeuille utilisateur
      const userWalletRef = doc(db, 'wallets', user.uid);
      const userWalletSnap = await getDoc(userWalletRef);

      if (userWalletSnap.exists()) {
        // Mettre à jour le portefeuille existant
        await updateDoc(userWalletRef, {
          lastUpdated: new Date(),
          transactions: [...userWalletSnap.data().transactions, transactionRef.id]
        });
      } else {
        // Créer un nouveau portefeuille
        await setDoc(userWalletRef, {
          userId: user.uid,
          balance: 0, // Le solde sera mis à jour une fois le paiement confirmé
          currency: 'eur',
          lastUpdated: new Date(),
          transactions: [transactionRef.id]
        });
      }

      return {
        paymentUrl: response.data.invoice_url || '',
        paymentId: response.data.payment_id
      };
    } else {
      throw new Error('Réponse invalide de l\'API de paiement');
    }
  } catch (error: any) {
    console.error('Erreur lors de la création d\'un dépôt:', error);
    throw new Error(`Erreur lors de la création du paiement: ${error.message}`);
  }
};

/**
 * Crée un paiement pour acheter une formation
 * @param user Utilisateur actuel
 * @param formationId ID de la formation
 * @param formationPrice Prix de la formation
 * @returns URL de paiement et informations sur le paiement
 */
export const createFormationPurchase = async (
  user: User, 
  formationId: string, 
  formationPrice: number
): Promise<{ paymentUrl: string, paymentId: string }> => {
  try {
    // Vérifier si l'utilisateur a suffisamment dans son portefeuille
    const userWalletRef = doc(db, 'wallets', user.uid);
    const userWalletSnap = await getDoc(userWalletRef);
    
    if (userWalletSnap.exists() && userWalletSnap.data().balance >= formationPrice) {
      // Utiliser le solde du portefeuille
      const newBalance = userWalletSnap.data().balance - formationPrice;
      
      // Créer une transaction interne
      const transaction: Omit<Transaction, 'id'> = {
        userId: user.uid,
        amount: formationPrice,
        currency: 'eur',
        status: TransactionStatus.FINISHED,
        createdAt: new Date(),
        completedAt: new Date(),
        type: TransactionType.FORMATION_PURCHASE,
        itemId: formationId
      };
      
      const transactionRef = await addDoc(collection(db, 'transactions'), transaction);
      
      // Mettre à jour le portefeuille
      await updateDoc(userWalletRef, {
        balance: newBalance,
        lastUpdated: new Date(),
        transactions: [...userWalletSnap.data().transactions, transactionRef.id]
      });
      
      // Assigner la formation à l'utilisateur
      const { assignFormationToUser } = await import('../auth');
      await assignFormationToUser(user.uid, formationId);
      
      return {
        paymentUrl: '', // Pas d'URL car payé avec le solde
        paymentId: transactionRef.id
      };
    } else {
      // Créer un nouveau paiement via NOWPayments
      const response = await axios.post(`${API_URL}/payment`, {
        price_amount: formationPrice,
        price_currency: 'eur',
        pay_currency: 'btc', // Par défaut Bitcoin, peut être modifié
        ipn_callback_url: `${process.env.REACT_APP_API_URL}/api/payment-callback`,
        order_id: `formation_${formationId}_${user.uid}_${Date.now()}`,
        order_description: `Achat de formation ${formationId} pour ${user.email || user.uid}`,
      }, {
        headers: {
          'x-api-key': API_KEY,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data && response.data.payment_id) {
        // Enregistrer la transaction
        const transaction: Omit<Transaction, 'id'> = {
          userId: user.uid,
          amount: formationPrice,
          currency: 'eur',
          status: TransactionStatus.WAITING,
          paymentId: response.data.payment_id,
          createdAt: new Date(),
          type: TransactionType.FORMATION_PURCHASE,
          itemId: formationId,
          paymentUrl: response.data.invoice_url || response.data.pay_address
        };
        
        const transactionRef = await addDoc(collection(db, 'transactions'), transaction);
        
        // Mettre à jour ou créer le portefeuille utilisateur
        if (userWalletSnap.exists()) {
          await updateDoc(userWalletRef, {
            lastUpdated: new Date(),
            transactions: [...userWalletSnap.data().transactions, transactionRef.id]
          });
        } else {
          await setDoc(userWalletRef, {
            userId: user.uid,
            balance: 0,
            currency: 'eur',
            lastUpdated: new Date(),
            transactions: [transactionRef.id]
          });
        }
        
        return {
          paymentUrl: response.data.invoice_url || '',
          paymentId: response.data.payment_id
        };
      } else {
        throw new Error('Réponse invalide de l\'API de paiement');
      }
    }
  } catch (error: any) {
    console.error('Erreur lors de l\'achat d\'une formation:', error);
    throw new Error(`Erreur lors de la création du paiement: ${error.message}`);
  }
};

/**
 * Crée un paiement pour acheter un outil
 * @param user Utilisateur actuel
 * @param toolId ID de l'outil
 * @param toolPrice Prix de l'outil
 * @returns URL de paiement et informations sur le paiement
 */
export const createToolPurchase = async (
  user: User,
  toolId: string,
  toolPrice: number
): Promise<{ paymentUrl: string, paymentId: string }> => {
  try {
    // Logique similaire à createFormationPurchase
    // Vérifier si l'utilisateur a suffisamment dans son portefeuille
    const userWalletRef = doc(db, 'wallets', user.uid);
    const userWalletSnap = await getDoc(userWalletRef);
    
    if (userWalletSnap.exists() && userWalletSnap.data().balance >= toolPrice) {
      // Utiliser le solde du portefeuille
      const newBalance = userWalletSnap.data().balance - toolPrice;
      
      // Créer une transaction interne
      const transaction: Omit<Transaction, 'id'> = {
        userId: user.uid,
        amount: toolPrice,
        currency: 'eur',
        status: TransactionStatus.FINISHED,
        createdAt: new Date(),
        completedAt: new Date(),
        type: TransactionType.TOOL_PURCHASE,
        itemId: toolId
      };
      
      const transactionRef = await addDoc(collection(db, 'transactions'), transaction);
      
      // Mettre à jour le portefeuille
      await updateDoc(userWalletRef, {
        balance: newBalance,
        lastUpdated: new Date(),
        transactions: [...userWalletSnap.data().transactions, transactionRef.id]
      });
      
      // Logique d'attribution de l'outil à l'utilisateur à implémenter
      // TODO: Implémenter la logique d'attribution d'outil
      
      return {
        paymentUrl: '', // Pas d'URL car payé avec le solde
        paymentId: transactionRef.id
      };
    } else {
      // Créer un nouveau paiement via NOWPayments
      const response = await axios.post(`${API_URL}/payment`, {
        price_amount: toolPrice,
        price_currency: 'eur',
        pay_currency: 'btc', // Par défaut Bitcoin, peut être modifié
        ipn_callback_url: `${process.env.REACT_APP_API_URL}/api/payment-callback`,
        order_id: `tool_${toolId}_${user.uid}_${Date.now()}`,
        order_description: `Achat d'outil ${toolId} pour ${user.email || user.uid}`,
      }, {
        headers: {
          'x-api-key': API_KEY,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data && response.data.payment_id) {
        // Enregistrer la transaction
        const transaction: Omit<Transaction, 'id'> = {
          userId: user.uid,
          amount: toolPrice,
          currency: 'eur',
          status: TransactionStatus.WAITING,
          paymentId: response.data.payment_id,
          createdAt: new Date(),
          type: TransactionType.TOOL_PURCHASE,
          itemId: toolId,
          paymentUrl: response.data.invoice_url || response.data.pay_address
        };
        
        const transactionRef = await addDoc(collection(db, 'transactions'), transaction);
        
        // Mettre à jour ou créer le portefeuille utilisateur
        if (userWalletSnap.exists()) {
          await updateDoc(userWalletRef, {
            lastUpdated: new Date(),
            transactions: [...userWalletSnap.data().transactions, transactionRef.id]
          });
        } else {
          await setDoc(userWalletRef, {
            userId: user.uid,
            balance: 0,
            currency: 'eur',
            lastUpdated: new Date(),
            transactions: [transactionRef.id]
          });
        }
        
        return {
          paymentUrl: response.data.invoice_url || '',
          paymentId: response.data.payment_id
        };
      } else {
        throw new Error('Réponse invalide de l\'API de paiement');
      }
    }
  } catch (error: any) {
    console.error('Erreur lors de l\'achat d\'un outil:', error);
    throw new Error(`Erreur lors de la création du paiement: ${error.message}`);
  }
};

/**
 * Obtenir l'information du portefeuille utilisateur
 * @param userId ID de l'utilisateur
 * @returns Données du portefeuille ou null si non existant
 */
export const getUserWallet = async (userId: string): Promise<UserWallet | null> => {
  try {
    const walletRef = doc(db, 'wallets', userId);
    const walletSnap = await getDoc(walletRef);
    
    if (walletSnap.exists()) {
      return walletSnap.data() as UserWallet;
    }
    return null;
  } catch (error) {
    console.error('Erreur lors de la récupération du portefeuille:', error);
    return null;
  }
};

/**
 * Obtenir l'historique des transactions d'un utilisateur
 * @param userId ID de l'utilisateur
 * @returns Liste des transactions
 */
export const getUserTransactions = async (userId: string): Promise<Transaction[]> => {
  try {
    const wallet = await getUserWallet(userId);
    
    if (!wallet || !wallet.transactions || wallet.transactions.length === 0) {
      return [];
    }
    
    const transactions: Transaction[] = [];
    
    for (const transactionId of wallet.transactions) {
      const transactionRef = doc(db, 'transactions', transactionId);
      const transactionSnap = await getDoc(transactionRef);
      
      if (transactionSnap.exists()) {
        transactions.push({
          id: transactionSnap.id,
          ...transactionSnap.data()
        } as Transaction);
      }
    }
    
    // Trier par date décroissante (plus récent en premier)
    return transactions.sort((a, b) => {
      return (b.createdAt as any).toMillis() - (a.createdAt as any).toMillis();
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des transactions:', error);
    return [];
  }
};

/**
 * Mettre à jour le statut d'une transaction
 * Pour être utilisé par le webhook de callback
 */
export const updateTransactionStatus = async (
  paymentId: string, 
  newStatus: TransactionStatus, 
  actualAmount?: number
): Promise<boolean> => {
  try {
    // Récupérer la transaction par paymentId
    // Note: Nécessiterait un index sur paymentId dans les transactions
    
    // 1. Trouver la transaction en utilisant les méthodes de Firestore v9
    const transactionsCollection = collection(db, 'transactions');
    const q = query(transactionsCollection, where('paymentId', '==', paymentId));
    const transactionDocs = await getDocs(q);
    
    if (transactionDocs.empty) {
      console.error(`Aucune transaction trouvée avec paymentId: ${paymentId}`);
      return false;
    }
    
    const transactionDoc = transactionDocs.docs[0];
    const transaction = { id: transactionDoc.id, ...transactionDoc.data() } as Transaction;
    
    // 2. Mettre à jour la transaction
    const transactionRef = doc(db, 'transactions', transaction.id);
    await updateDoc(transactionRef, {
      status: newStatus,
      updatedAt: new Date(),
      ...(newStatus === TransactionStatus.FINISHED ? { completedAt: new Date() } : {}),
      ...(actualAmount ? { actualAmount } : {})
    });
    
    // 3. Si la transaction est terminée, mettre à jour le portefeuille ou attribuer l'item
    if (newStatus === TransactionStatus.FINISHED) {
      const userId = transaction.userId;
      
      if (transaction.type === TransactionType.DEPOSIT) {
        // Créditer le portefeuille
        const walletRef = doc(db, 'wallets', userId);
        const walletSnap = await getDoc(walletRef);
        
        if (walletSnap.exists()) {
          const currentBalance = walletSnap.data().balance || 0;
          await updateDoc(walletRef, {
            balance: currentBalance + transaction.amount,
            lastUpdated: new Date()
          });
        }
      } else if (transaction.type === TransactionType.FORMATION_PURCHASE && transaction.itemId) {
        // Attribuer la formation à l'utilisateur
        const { assignFormationToUser } = await import('../auth');
        await assignFormationToUser(userId, transaction.itemId);
      } else if (transaction.type === TransactionType.TOOL_PURCHASE && transaction.itemId) {
        // Logique d'attribution d'outil
        // TODO: Implémenter l'attribution d'outil
      }
    }
    
    return true;
  } catch (error) {
    console.error('Erreur lors de la mise à jour du statut de transaction:', error);
    return false;
  }
};

/**
 * Vérifie la signature d'un webhook IPN NOWPayments
 * Note: Cette fonction est un stub côté client. 
 * La vérification réelle des signatures IPN doit être effectuée sur le serveur.
 * @param signature Signature X-NOWPAYMENTS-SIG de l'en-tête
 * @param body Corps de la requête brut
 * @returns Toujours true dans l'environnement client
 */
export const verifyIPNSignature = (signature: string, body: string): boolean => {
  // Dans un environnement client, nous ne pouvons pas vérifier la signature de manière sécurisée
  console.warn('Vérification de signature IPN non disponible côté client');
  return true; // Cette logique devrait être implémentée côté serveur dans une Cloud Function
}; 