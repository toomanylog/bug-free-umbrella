import axios from 'axios';
import { auth, database } from '../config';
import { ref, set, get, push, update, query as dbQuery, orderByChild, equalTo, remove } from 'firebase/database';
import { User } from 'firebase/auth';

// Clé API NOWPayments
const API_KEY = '09CARKN-MS64CEK-G9BGJ62-8QSSJ7M';
const PUBLIC_KEY = '467c714f-5bb9-44d0-a611-97888b03cae7';
const API_URL = 'https://api.nowpayments.io/v1';

// Clé IPN pour la vérification des webhooks - à configurer dans les variables d'environnement
const IPN_SECRET_KEY = process.env.REACT_APP_NOWPAYMENTS_IPN_KEY || 'aR65dL1KfqswL0Hmmke46GbDNvdlqggp';

// Délai d'expiration des transactions (en millisecondes) - 24 heures par défaut
export const TRANSACTION_EXPIRATION_TIME = 24 * 60 * 60 * 1000; // 24 heures

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
  EXPIRED = 'expired',
  CANCELLED = 'cancelled'
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
  createdAt: string;
  updatedAt?: string;
  completedAt?: string;
  type: TransactionType;
  itemId?: string; // ID de la formation, outil, etc.
  paymentUrl?: string;
  paymentDetails?: {
    pay_address: string;
    pay_amount: number;
    pay_currency: string;
    paymentUrl: string;
  };
  expiresAt?: string;
}

export interface UserWallet {
  userId: string;
  balance: number;
  currency: string;
  lastUpdated: string;
}

// Liste des cryptomonnaies supportées par NOWPayments
export const SUPPORTED_CRYPTOCURRENCIES = [
  { id: 'btc', name: 'Bitcoin', symbol: 'BTC' },
  { id: 'eth', name: 'Ethereum', symbol: 'ETH' },
  { id: 'ltc', name: 'Litecoin', symbol: 'LTC' },
  { id: 'bch', name: 'Bitcoin Cash', symbol: 'BCH' },
  { id: 'xrp', name: 'Ripple', symbol: 'XRP' },
  { id: 'doge', name: 'Dogecoin', symbol: 'DOGE' },
  { id: 'trx', name: 'TRON', symbol: 'TRX' },
  { id: 'usdt', name: 'Tether', symbol: 'USDT' },
  { id: 'bnb', name: 'Binance Coin', symbol: 'BNB' },
  { id: 'sol', name: 'Solana', symbol: 'SOL' }
];

/**
 * Crée un paiement pour recharger le portefeuille
 * @param user Utilisateur actuel
 * @param amount Montant en EUR
 * @param payCurrency Crypto-monnaie choisie pour le paiement (btc par défaut)
 * @returns URL de paiement et informations sur le paiement
 */
export const createWalletDeposit = async (
  user: User, 
  amount: number, 
  payCurrency: string = 'btc'
): Promise<{ paymentUrl: string; transactionId: string }> => {
  try {
    // Vérifier si le montant est valide
    if (!amount || amount <= 0) {
      throw new Error('Le montant doit être supérieur à 0');
    }

    // Vérifier si la crypto est supportée
    const isValidCrypto = SUPPORTED_CRYPTOCURRENCIES.some(crypto => crypto.id === payCurrency);
    if (!isValidCrypto) {
      throw new Error('Crypto-monnaie non supportée');
    }

    // Créer un paiement via l'API NOWPayments
    const response = await axios.post(
      `${API_URL}/payment`,
      {
        price_amount: amount,
        price_currency: 'eur',
        pay_currency: payCurrency,
        ipn_callback_url: process.env.REACT_APP_NOWPAYMENTS_IPN_CALLBACK_URL,
        order_id: `deposit_${user.uid}_${Date.now()}`,
        order_description: `Dépôt de ${amount} EUR pour ${user.email || ''}`
      },
      {
        headers: {
          'x-api-key': API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );

    // Si la création du paiement a réussi
    if (response.data && response.data.payment_id) {
      // S'assurer que tous les champs nécessaires sont présents
      const paymentUrl = response.data.invoice_url || '';
      const payAddress = response.data.pay_address || '';
      const payAmount = response.data.pay_amount || 0;
      const payCurrency = response.data.pay_currency || 'btc';
      
      // Créer une nouvelle transaction dans la base de données
      const transactionsRef = ref(database, 'transactions');
      const transactionRef = push(transactionsRef);
      const newTransaction = {
        id: transactionRef.key,
        userId: user.uid,
        amount: amount,
        currency: 'EUR',
        status: TransactionStatus.WAITING,
        type: TransactionType.DEPOSIT,
        paymentId: response.data.payment_id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        paymentDetails: {
          pay_address: payAddress,
          pay_amount: payAmount,
          pay_currency: payCurrency,
          paymentUrl: paymentUrl
        },
        expiresAt: new Date(Date.now() + TRANSACTION_EXPIRATION_TIME).toISOString() // Ajouter date d'expiration
      };

      // Enregistrer la transaction dans la base de données
      await set(transactionRef, newTransaction);

      // Planifier une vérification d'expiration
      setTimeout(() => {
        checkTransactionExpiration(transactionRef.key || '');
      }, TRANSACTION_EXPIRATION_TIME);

      return {
        paymentUrl: paymentUrl,
        transactionId: transactionRef.key || ''
      };
    } else {
      throw new Error('Erreur lors de la création du paiement: réponse incomplète de l\'API');
    }
  } catch (error) {
    console.error('Erreur lors de la création du paiement:', error);
    throw error;
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
    const userWalletRef = ref(database, `wallets/${user.uid}`);
    const userWalletSnap = await get(userWalletRef);
    
    if (userWalletSnap.exists() && userWalletSnap.val().balance >= formationPrice) {
      // Utiliser le solde du portefeuille
      const newBalance = userWalletSnap.val().balance - formationPrice;
      
      // Créer une transaction interne
      const transactionsRef = ref(database, 'transactions');
      const transactionRef = push(transactionsRef);
      const transaction = {
        id: transactionRef.key,
        userId: user.uid,
        amount: formationPrice,
        currency: 'eur',
        status: TransactionStatus.FINISHED,
        type: TransactionType.FORMATION_PURCHASE,
        itemId: formationId,
        createdAt: new Date().toISOString(),
        completedAt: new Date().toISOString()
      };
      
      await set(transactionRef, transaction);
      
      // Mettre à jour le portefeuille
      await update(ref(database, `wallets/${user.uid}`), {
        balance: newBalance,
        lastUpdated: new Date().toISOString()
      });
      
      // Assigner la formation à l'utilisateur
      const { assignFormationToUser } = await import('../auth');
      await assignFormationToUser(user.uid, formationId);
      
      return {
        paymentUrl: '', // Pas d'URL car payé avec le solde
        paymentId: transactionRef.key || ''
      };
    } else {
      // Créer un paiement via NOWPayments
      const response = await axios.post(`${API_URL}/payment`, {
        price_amount: formationPrice,
        price_currency: 'eur',
        pay_currency: 'btc',
        ipn_callback_url: process.env.REACT_APP_NOWPAYMENTS_IPN_CALLBACK_URL,
        order_id: `formation_${formationId}_${user.uid}_${Date.now()}`,
        order_description: `Achat de formation ${formationId} pour ${user.email || ''}`
      }, {
        headers: {
          'x-api-key': API_KEY,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data && response.data.payment_id) {
        // Enregistrer la transaction
        const transactionsRef = ref(database, 'transactions');
        const transactionRef = push(transactionsRef);
        const transaction = {
          id: transactionRef.key,
          userId: user.uid,
          amount: formationPrice,
          currency: 'eur',
          status: TransactionStatus.WAITING,
          type: TransactionType.FORMATION_PURCHASE,
          itemId: formationId,
          paymentId: response.data.payment_id,
          createdAt: new Date().toISOString(),
          paymentUrl: response.data.invoice_url || response.data.pay_address
        };
        
        await set(transactionRef, transaction);
        
        return {
          paymentUrl: response.data.invoice_url || '',
          paymentId: transactionRef.key || ''
        };
      } else {
        throw new Error('Réponse invalide de l\'API de paiement');
      }
    }
  } catch (error) {
    console.error('Erreur lors de l\'achat de formation:', error);
    throw error;
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
    const userWalletRef = ref(database, `wallets/${user.uid}`);
    const userWalletSnap = await get(userWalletRef);
    
    if (userWalletSnap.exists() && userWalletSnap.val().balance >= toolPrice) {
      // Utiliser le solde du portefeuille
      const newBalance = userWalletSnap.val().balance - toolPrice;
      
      // Créer une transaction interne
      const transactionsRef = ref(database, 'transactions');
      const transactionRef = push(transactionsRef);
      const transaction = {
        id: transactionRef.key,
        userId: user.uid,
        amount: toolPrice,
        currency: 'eur',
        status: TransactionStatus.FINISHED,
        type: TransactionType.TOOL_PURCHASE,
        itemId: toolId,
        createdAt: new Date().toISOString(),
        completedAt: new Date().toISOString()
      };
      
      await set(transactionRef, transaction);
      
      // Mettre à jour le portefeuille
      await update(userWalletRef, {
        balance: newBalance,
        lastUpdated: new Date().toISOString()
      });
      
      // Logique d'attribution de l'outil à l'utilisateur à implémenter
      // TODO: Implémenter la logique d'attribution d'outil
      
      return {
        paymentUrl: '', // Pas d'URL car payé avec le solde
        paymentId: transactionRef.key || ''
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
        const transactionsRef = ref(database, 'transactions');
        const transactionRef = push(transactionsRef);
        const transaction = {
          id: transactionRef.key,
          userId: user.uid,
          amount: toolPrice,
          currency: 'eur',
          status: TransactionStatus.WAITING,
          type: TransactionType.TOOL_PURCHASE,
          itemId: toolId,
          paymentId: response.data.payment_id,
          createdAt: new Date().toISOString(),
          paymentUrl: response.data.invoice_url || response.data.pay_address
        };
        
        await set(transactionRef, transaction);
        
        return {
          paymentUrl: response.data.invoice_url || '',
          paymentId: transactionRef.key || ''
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
    const walletRef = ref(database, `wallets/${userId}`);
    const walletSnap = await get(walletRef);
    
    if (walletSnap.exists()) {
      const walletData = walletSnap.val();
      return {
        userId: userId,
        balance: walletData.balance || 0,
        currency: walletData.currency || 'eur',
        lastUpdated: walletData.lastUpdated || new Date().toISOString()
      };
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
    const transactionsRef = ref(database, 'transactions');
    const userTransactionsQuery = dbQuery(transactionsRef, orderByChild('userId'), equalTo(userId));
    const transactionsSnap = await get(userTransactionsQuery);
    
    if (!transactionsSnap.exists()) {
      return [];
    }
    
    const transactions: Transaction[] = [];
    
    transactionsSnap.forEach((childSnap) => {
      const transactionData = childSnap.val();
      transactions.push({
        id: childSnap.key || '',
        ...transactionData
      });
    });
    
    // Trier par date décroissante (plus récent en premier)
    return transactions.sort((a, b) => {
      // Convertir les dates en objets Date pour comparaison
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateB - dateA;
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
    const transactionsRef = ref(database, 'transactions');
    const q = dbQuery(transactionsRef, orderByChild('paymentId'), equalTo(paymentId));
    const transactionsSnap = await get(q);
    
    if (!transactionsSnap.exists()) {
      console.error(`Aucune transaction trouvée avec paymentId: ${paymentId}`);
      return false;
    }
    
    let transactionId = '';
    let transactionData: any = null;
    
    // Parcourir les résultats pour trouver la transaction
    transactionsSnap.forEach((childSnap) => {
      transactionId = childSnap.key || '';
      transactionData = childSnap.val();
    });
    
    if (!transactionData || !transactionId) {
      console.error('Transaction non trouvée après récupération');
      return false;
    }
    
    const transaction: Transaction = {
      id: transactionId,
      ...transactionData
    };
    
    // Mettre à jour la transaction
    const transactionRef = ref(database, `transactions/${transactionId}`);
    await update(transactionRef, {
      status: newStatus,
      updatedAt: new Date().toISOString(),
      ...(newStatus === TransactionStatus.FINISHED ? { completedAt: new Date().toISOString() } : {}),
      ...(actualAmount ? { actualAmount } : {})
    });
    
    // Si la transaction est terminée, mettre à jour le portefeuille ou attribuer l'item
    if (newStatus === TransactionStatus.FINISHED) {
      const userId = transaction.userId;
      
      if (transaction.type === TransactionType.DEPOSIT) {
        // Créditer le portefeuille
        const walletRef = ref(database, `wallets/${userId}`);
        const walletSnap = await get(walletRef);
        
        if (walletSnap.exists()) {
          const currentBalance = walletSnap.val().balance || 0;
          await update(walletRef, {
            balance: currentBalance + transaction.amount,
            lastUpdated: new Date().toISOString()
          });
        } else {
          // Créer un portefeuille si inexistant
          await set(walletRef, {
            userId,
            balance: transaction.amount,
            currency: 'eur',
            lastUpdated: new Date().toISOString()
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

/**
 * Annule une transaction en attente
 * @param user Utilisateur actuel
 * @param transactionId ID de la transaction à annuler
 * @returns Un booléen indiquant si l'annulation a réussi
 */
export const cancelTransaction = async (user: User, transactionId: string): Promise<boolean> => {
  try {
    // Vérifier si la transaction existe et appartient à l'utilisateur
    const transactionRef = ref(database, `transactions/${transactionId}`);
    const transactionSnap = await get(transactionRef);
    
    if (!transactionSnap.exists()) {
      throw new Error('Transaction non trouvée');
    }
    
    const transaction = transactionSnap.val();
    
    // Vérifier que c'est bien la transaction de l'utilisateur
    if (transaction.userId !== user.uid) {
      throw new Error('Vous n\'êtes pas autorisé à annuler cette transaction');
    }
    
    // Vérifier que la transaction est en attente
    if (transaction.status !== TransactionStatus.WAITING) {
      throw new Error('Seules les transactions en attente peuvent être annulées');
    }
    
    // Mettre à jour le statut de la transaction
    await update(transactionRef, {
      status: TransactionStatus.CANCELLED,
      updatedAt: new Date().toISOString()
    });
    
    return true;
  } catch (error) {
    console.error('Erreur lors de l\'annulation de la transaction:', error);
    throw error;
  }
};

/**
 * Vérifie si une transaction a expiré et met à jour son statut
 * @param transactionId ID de la transaction à vérifier
 */
export const checkTransactionExpiration = async (transactionId: string): Promise<void> => {
  try {
    const transactionRef = ref(database, `transactions/${transactionId}`);
    const transactionSnap = await get(transactionRef);
    
    if (!transactionSnap.exists()) {
      return;
    }
    
    const transaction = transactionSnap.val();
    
    // Ne vérifier que les transactions en attente
    if (transaction.status !== TransactionStatus.WAITING) {
      return;
    }
    
    // Vérifier si la transaction a expiré
    const now = new Date();
    const expiryDate = transaction.expiresAt ? new Date(transaction.expiresAt) : null;
    
    if (expiryDate && now > expiryDate) {
      // Mettre à jour le statut à expiré
      await update(transactionRef, {
        status: TransactionStatus.EXPIRED,
        updatedAt: now.toISOString()
      });
      
      console.log(`Transaction ${transactionId} marquée comme expirée`);
    }
  } catch (error) {
    console.error('Erreur lors de la vérification de l\'expiration de la transaction:', error);
  }
}; 