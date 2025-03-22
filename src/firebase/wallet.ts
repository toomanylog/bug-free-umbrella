import { ref, push, set, get, update, remove } from 'firebase/database';
import { database } from './config';
import { 
  Transaction, 
  TransactionStatus, 
  TransactionType, 
  createWalletDeposit,
  getUserWallet
} from './services/nowpayments';

/**
 * Crée une transaction pour l'achat d'une formation
 * @param userId ID de l'utilisateur
 * @param formationId ID de la formation
 * @param amount Montant de la formation
 * @returns Transaction créée
 */
export const createFormationPurchase = async (
  userId: string, 
  formationId: string, 
  amount: number
): Promise<Transaction> => {
  try {
    // Vérifier si l'utilisateur a suffisamment de fonds
    const userWallet = await getUserWallet(userId);
    
    if (userWallet && userWallet.balance >= amount) {
      // L'utilisateur a suffisamment de fonds, créer une transaction directe
      const transactionsRef = ref(database, 'transactions');
      const newTransactionRef = push(transactionsRef);
      
      const transaction: Transaction = {
        id: newTransactionRef.key || '',
        userId,
        amount,
        currency: 'EUR',
        status: TransactionStatus.CONFIRMED,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
        type: TransactionType.FORMATION_PURCHASE,
        itemId: formationId
      };
      
      // Enregistrer la transaction
      await set(newTransactionRef, transaction);
      
      // Mettre à jour le solde du portefeuille
      const walletRef = ref(database, `wallets/${userId}`);
      const walletSnapshot = await get(walletRef);
      
      if (walletSnapshot.exists()) {
        const wallet = walletSnapshot.val();
        const newBalance = wallet.balance - amount;
        
        await update(walletRef, {
          balance: newBalance,
          updatedAt: new Date().toISOString()
        });
      }
      
      // Assigner la formation à l'utilisateur
      const { assignFormationToUser } = await import('./auth');
      await assignFormationToUser(userId, formationId);
      
      return transaction;
    } else {
      // L'utilisateur n'a pas assez de fonds, créer une transaction en attente
      // Proposer de recharger le portefeuille
      return {
        id: '',
        userId,
        amount,
        currency: 'EUR',
        status: TransactionStatus.WAITING,
        createdAt: new Date().toISOString(),
        type: TransactionType.FORMATION_PURCHASE,
        itemId: formationId
      };
    }
  } catch (error) {
    console.error("Erreur lors de la création de l'achat de formation:", error);
    throw error;
  }
}; 