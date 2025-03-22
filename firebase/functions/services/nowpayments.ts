import * as admin from 'firebase-admin';

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

// Délai d'expiration des transactions (en millisecondes) - 24 heures par défaut
export const TRANSACTION_EXPIRATION_TIME = 24 * 60 * 60 * 1000; // 24 heures

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
  expiresAt?: string; // Date d'expiration de la transaction
}

/**
 * Vérifie la signature d'un webhook IPN NOWPayments
 * @param signature Signature X-NOWPAYMENTS-SIG de l'en-tête
 * @param body Corps de la requête brut
 * @returns Vrai si la signature est valide
 */
export const verifyIPNSignature = (signature: string, body: string): boolean => {
  // Récupérer la clé secrète IPN depuis les variables d'environnement
  const ipnSecret = process.env.NOWPAYMENTS_IPN_SECRET;
  
  if (!ipnSecret) {
    console.error("NOWPAYMENTS_IPN_SECRET n'est pas configuré");
    return false;
  }
  
  // Créer un HMAC avec la clé secrète
  const crypto = require('crypto');
  const hmac = crypto.createHmac('sha512', ipnSecret);
  
  // Mettre à jour l'HMAC avec le corps de la requête
  hmac.update(body);
  
  // Calculer la signature attendue
  const calculatedSignature = hmac.digest('hex');
  
  // Comparer avec la signature reçue
  return calculatedSignature === signature;
};

/**
 * Vérifie si une transaction a expiré et met à jour son statut
 * @param transactionId ID de la transaction à vérifier
 */
export const checkTransactionExpiration = async (transactionId: string): Promise<void> => {
  try {
    const db = admin.database();
    const transactionRef = db.ref(`transactions/${transactionId}`);
    const transactionSnap = await transactionRef.once('value');
    
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
      await transactionRef.update({
        status: TransactionStatus.EXPIRED,
        updatedAt: now.toISOString()
      });
      
      console.log(`Transaction ${transactionId} marquée comme expirée`);
    }
  } catch (error) {
    console.error('Erreur lors de la vérification de l\'expiration de la transaction:', error);
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
    const db = admin.database();
    const transactionsRef = db.ref('transactions');
    const snapshot = await transactionsRef
      .orderByChild('paymentId')
      .equalTo(paymentId)
      .once('value');
    
    if (!snapshot.exists()) {
      console.error(`Aucune transaction trouvée avec paymentId: ${paymentId}`);
      return false;
    }
    
    let transactionId = '';
    let transactionData: any = null;
    
    // Parcourir les résultats pour trouver la transaction
    snapshot.forEach((childSnap) => {
      transactionId = childSnap.key || '';
      transactionData = childSnap.val();
    });
    
    if (!transactionData || !transactionId) {
      console.error('Transaction non trouvée après récupération');
      return false;
    }
    
    // Mettre à jour la transaction
    const transactionRef = db.ref(`transactions/${transactionId}`);
    await transactionRef.update({
      status: newStatus,
      updatedAt: new Date().toISOString(),
      ...(newStatus === TransactionStatus.FINISHED ? { completedAt: new Date().toISOString() } : {}),
      ...(actualAmount ? { actualAmount } : {})
    });
    
    // Si la transaction est terminée, mettre à jour le portefeuille ou attribuer l'item
    if (newStatus === TransactionStatus.FINISHED) {
      const userId = transactionData.userId;
      
      if (transactionData.type === TransactionType.DEPOSIT) {
        // Créditer le portefeuille
        const walletRef = db.ref(`wallets/${userId}`);
        const walletSnap = await walletRef.once('value');
        
        if (walletSnap.exists()) {
          const currentBalance = walletSnap.val().balance || 0;
          await walletRef.update({
            balance: currentBalance + transactionData.amount,
            lastUpdated: new Date().toISOString()
          });
        } else {
          // Créer un portefeuille si inexistant
          await walletRef.set({
            userId,
            balance: transactionData.amount,
            currency: 'eur',
            lastUpdated: new Date().toISOString()
          });
        }
      } else if (transactionData.type === TransactionType.FORMATION_PURCHASE && transactionData.itemId) {
        // Attribuer la formation à l'utilisateur
        const userFormationsRef = db.ref(`users/${userId}/formations/${transactionData.itemId}`);
        await userFormationsRef.set(true);
      } else if (transactionData.type === TransactionType.TOOL_PURCHASE && transactionData.itemId) {
        // Attribuer l'outil à l'utilisateur
        const userToolsRef = db.ref(`users/${userId}/tools/${transactionData.itemId}`);
        await userToolsRef.set(true);
      }
    }
    
    return true;
  } catch (error) {
    console.error('Erreur lors de la mise à jour du statut de transaction:', error);
    return false;
  }
}; 