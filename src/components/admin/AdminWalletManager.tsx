import React, { useState, useEffect } from 'react';
import { Search, Download, EyeIcon, Wallet } from 'lucide-react';
import { database } from '../../firebase/config';
import { ref, get, update, query as dbQuery, orderByChild, equalTo } from 'firebase/database';
import { Transaction, TransactionStatus, TransactionType } from '../../firebase/services/nowpayments';

interface UserWallet {
  userId: string;
  balance: number;
  currency: string;
  lastUpdated: string;
}

const AdminWalletManager: React.FC = () => {
  const [userWallets, setUserWallets] = useState<(UserWallet & { userName: string; email: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [userTransactions, setUserTransactions] = useState<Transaction[]>([]);
  const [isEditingBalance, setIsEditingBalance] = useState(false);
  const [newBalance, setNewBalance] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  // Charger tous les portefeuilles utilisateurs
  useEffect(() => {
    const loadAllWallets = async () => {
      try {
        setLoading(true);
        
        // Récupérer tous les portefeuilles des utilisateurs
        const walletsRef = ref(database, 'wallets');
        const walletsSnap = await get(walletsRef);
        
        if (!walletsSnap.exists()) {
          setUserWallets([]);
          return;
        }
        
        const walletsData = walletsSnap.val();
        const walletsArray: (UserWallet & { userName: string; email: string })[] = [];
        
        // Pour chaque portefeuille, récupérer les informations de l'utilisateur
        for (const userId in walletsData) {
          const walletData = walletsData[userId];
          
          // Récupérer les données utilisateur
          const userRef = ref(database, `users/${userId}`);
          const userSnap = await get(userRef);
          
          let userName = 'Utilisateur inconnu';
          let email = 'Pas d\'email';
          
          if (userSnap.exists()) {
            const userData = userSnap.val();
            userName = userData.displayName || 'Sans nom';
            email = userData.email || 'Pas d\'email';
          }
          
          walletsArray.push({
            userId,
            balance: walletData.balance || 0,
            currency: walletData.currency || 'EUR',
            lastUpdated: walletData.lastUpdated || new Date().toISOString(),
            userName,
            email
          });
        }
        
        setUserWallets(walletsArray);
      } catch (error) {
        console.error('Erreur lors du chargement des portefeuilles:', error);
        setError('Erreur lors du chargement des portefeuilles. Veuillez réessayer.');
      } finally {
        setLoading(false);
      }
    };
    
    loadAllWallets();
  }, []);

  // Charger les transactions d'un utilisateur spécifique
  const loadUserTransactions = async (userId: string) => {
    try {
      setLoading(true);
      setError('');
      
      // Récupérer les transactions de l'utilisateur
      const transactionsRef = ref(database, 'transactions');
      const userTransactionsQuery = dbQuery(transactionsRef, orderByChild('userId'), equalTo(userId));
      const transactionsSnap = await get(userTransactionsQuery);
      
      if (!transactionsSnap.exists()) {
        setUserTransactions([]);
      } else {
        // Récupérer les transactions
        const transactions: Transaction[] = [];
        transactionsSnap.forEach((childSnap) => {
          const transaction = {
            id: childSnap.key,
            ...childSnap.val()
          };
          transactions.push(transaction);
        });
        
        // Trier les transactions par date de création (plus récentes en premier)
        const sortedTransactions = transactions.sort((a, b) => {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
        
        setUserTransactions(sortedTransactions);
      }
      
      setSelectedUser(userId);
    } catch (error) {
      console.error('Erreur lors du chargement des transactions:', error);
      setError('Erreur lors du chargement des transactions. Veuillez réessayer.');
      setUserTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  // Mettre à jour le solde d'un utilisateur
  const updateUserBalance = async (userId: string) => {
    try {
      if (!newBalance.trim() || isNaN(parseFloat(newBalance))) {
        setError('Veuillez entrer un montant valide');
        return;
      }
      
      setLoading(true);
      
      // Récupérer la référence au portefeuille
      const walletRef = ref(database, `wallets/${userId}`);
      
      // Mettre à jour le solde
      await update(walletRef, {
        balance: parseFloat(newBalance),
        lastUpdated: new Date().toISOString()
      });
      
      // Mettre à jour l'affichage
      setUserWallets(prev => 
        prev.map(wallet => 
          wallet.userId === userId 
            ? { ...wallet, balance: parseFloat(newBalance) } 
            : wallet
        )
      );
      
      setSuccess('Solde mis à jour avec succès');
      setIsEditingBalance(false);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du solde:', error);
      setError('Erreur lors de la mise à jour du solde. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  // Filtrer les portefeuilles par recherche
  const filteredWallets = userWallets.filter(wallet => 
    wallet.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    wallet.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    wallet.userId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Formatter la date
  const formatDate = (date: any): string => {
    if (!date) return 'N/A';
    
    try {
      return new Date(date).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Erreur lors du formatage de la date:', error);
      return 'Date invalide';
    }
  };

  // Formatter le statut d'une transaction
  const getStatusLabel = (status: TransactionStatus): React.ReactElement => {
    switch(status) {
      case TransactionStatus.WAITING:
        return <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs">En attente</span>;
      case TransactionStatus.CONFIRMING:
        return <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs">Confirmation</span>;
      case TransactionStatus.CONFIRMED:
        return <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs">Confirmé</span>;
      case TransactionStatus.SENDING:
        return <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs">Envoi</span>;
      case TransactionStatus.FINISHED:
        return <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs">Terminé</span>;
      case TransactionStatus.FAILED:
        return <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded-full text-xs">Échoué</span>;
      case TransactionStatus.EXPIRED:
        return <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded-full text-xs">Expiré</span>;
      case TransactionStatus.REFUNDED:
        return <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded-full text-xs">Remboursé</span>;
      case TransactionStatus.PARTIALLY_PAID:
        return <span className="px-2 py-1 bg-orange-500/20 text-orange-400 rounded-full text-xs">Partiellement payé</span>;
      default:
        return <span className="px-2 py-1 bg-gray-500/20 text-gray-400 rounded-full text-xs">Inconnu</span>;
    }
  };

  // Formatter le type de transaction
  const getTypeLabel = (type: TransactionType): string => {
    switch(type) {
      case TransactionType.DEPOSIT:
        return 'Dépôt';
      case TransactionType.FORMATION_PURCHASE:
        return 'Achat de formation';
      case TransactionType.TOOL_PURCHASE:
        return 'Achat d\'outil';
      case TransactionType.OTHER_PURCHASE:
        return 'Autre achat';
      default:
        return 'Transaction';
    }
  };

  return (
    <div className="bg-gray-900 p-6 rounded-lg">
      <h1 className="text-2xl font-bold mb-6">Gestion des Portefeuilles</h1>
      
      {error && (
        <div className="bg-red-900/20 border border-red-800 text-red-100 px-4 py-3 rounded-lg mb-4">
          {error}
          <button 
            className="float-right" 
            onClick={() => setError('')}
          >
            &times;
          </button>
        </div>
      )}
      
      {success && (
        <div className="bg-green-900/20 border border-green-800 text-green-100 px-4 py-3 rounded-lg mb-4">
          {success}
          <button 
            className="float-right" 
            onClick={() => setSuccess('')}
          >
            &times;
          </button>
        </div>
      )}
      
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Rechercher un utilisateur..."
            className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
        </div>
      </div>
      
      {selectedUser ? (
        <div>
          <button
            onClick={() => setSelectedUser(null)}
            className="mb-4 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg flex items-center text-sm"
          >
            ← Retour à la liste des portefeuilles
          </button>
          
          <div className="bg-gray-800 rounded-lg p-4 mb-6">
            <h2 className="text-xl font-semibold mb-4">
              Transactions de l'utilisateur
            </h2>
            
            {loading ? (
              <div className="text-center py-4">
                <div className="animate-spin h-8 w-8 border-t-2 border-b-2 border-blue-500 rounded-full mx-auto"></div>
                <p className="mt-2 text-gray-400">Chargement des transactions...</p>
              </div>
            ) : userTransactions.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-gray-400">Aucune transaction trouvée pour cet utilisateur</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-xs text-gray-400 border-b border-gray-700">
                      <th className="pb-2 font-medium">ID</th>
                      <th className="pb-2 font-medium">Type</th>
                      <th className="pb-2 font-medium">Montant</th>
                      <th className="pb-2 font-medium">Date</th>
                      <th className="pb-2 font-medium">Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userTransactions.map(transaction => (
                      <tr key={transaction.id} className="border-b border-gray-700/50 hover:bg-gray-700/20">
                        <td className="py-3 text-sm font-mono">{transaction.id?.substring(0, 8)}</td>
                        <td className="py-3 text-sm">{getTypeLabel(transaction.type)}</td>
                        <td className="py-3 text-sm">
                          <span className={transaction.type === TransactionType.DEPOSIT ? 'text-green-400' : 'text-red-400'}>
                            {transaction.type === TransactionType.DEPOSIT ? '+' : '-'}{transaction.amount} {transaction.currency}
                          </span>
                        </td>
                        <td className="py-3 text-sm">{formatDate(transaction.createdAt)}</td>
                        <td className="py-3">{getStatusLabel(transaction.status)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4">
            <h2 className="text-xl font-semibold mb-4">
              Modifier le solde de l'utilisateur
            </h2>
            
            {isEditingBalance ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Nouveau solde
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={newBalance}
                    onChange={(e) => setNewBalance(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500"
                    placeholder="Montant"
                  />
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => updateUserBalance(selectedUser)}
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium disabled:opacity-50"
                  >
                    {loading ? 'Mise à jour...' : 'Enregistrer'}
                  </button>
                  <button
                    onClick={() => setIsEditingBalance(false)}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <p className="mb-4">
                  Solde actuel: <span className="font-bold text-lg">
                    {userWallets.find(w => w.userId === selectedUser)?.balance.toFixed(2)} 
                    {userWallets.find(w => w.userId === selectedUser)?.currency}
                  </span>
                </p>
                <button
                  onClick={() => {
                    setNewBalance(userWallets.find(w => w.userId === selectedUser)?.balance.toString() || '0');
                    setIsEditingBalance(true);
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium"
                >
                  Modifier le solde
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-gray-800 rounded-lg overflow-hidden">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin h-10 w-10 border-t-2 border-b-2 border-blue-500 rounded-full mx-auto"></div>
              <p className="mt-4 text-gray-400">Chargement des portefeuilles...</p>
            </div>
          ) : filteredWallets.length === 0 ? (
            <div className="text-center py-12">
              <Wallet className="h-16 w-16 text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Aucun portefeuille trouvé</h3>
              <p className="text-gray-400">
                {searchTerm ? 'Aucun résultat correspondant à votre recherche' : 'Aucun portefeuille n\'est encore créé dans le système'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs text-gray-400 border-b border-gray-700 bg-gray-800/80">
                    <th className="px-6 py-3 font-medium">Utilisateur</th>
                    <th className="px-6 py-3 font-medium">ID</th>
                    <th className="px-6 py-3 font-medium">Solde</th>
                    <th className="px-6 py-3 font-medium">Dernière mise à jour</th>
                    <th className="px-6 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredWallets.map(wallet => (
                    <tr key={wallet.userId} className="border-b border-gray-700/50 hover:bg-gray-700/20">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium">{wallet.userName}</p>
                          <p className="text-sm text-gray-400">{wallet.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono text-sm text-gray-400">{wallet.userId.substring(0, 8)}...</td>
                      <td className="px-6 py-4 font-medium">{wallet.balance.toFixed(2)} {wallet.currency}</td>
                      <td className="px-6 py-4 text-sm">{formatDate(wallet.lastUpdated)}</td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => loadUserTransactions(wallet.userId)}
                          className="p-2 bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600/30 mr-2"
                          title="Voir les transactions"
                        >
                          <EyeIcon size={16} />
                        </button>
                        <button
                          className="p-2 bg-green-600/20 text-green-400 rounded-lg hover:bg-green-600/30"
                          title="Exporter les transactions"
                        >
                          <Download size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminWalletManager; 