import React, { useState, useEffect } from 'react';
import { Search, Download, EyeIcon, Wallet } from 'lucide-react';
import { db } from '../../firebase/config';
import { collection, query, getDocs, doc, updateDoc, where } from 'firebase/firestore';
import { getUserWallet, UserWallet, Transaction, TransactionStatus, TransactionType } from '../../firebase/services/nowpayments';

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
        
        // Récupérer tous les utilisateurs qui ont un portefeuille
        const walletsRef = collection(db, 'wallets');
        const walletsSnap = await getDocs(walletsRef);
        
        // Récupérer les informations utilisateur correspondantes
        const walletsWithUserInfo = await Promise.all(
          walletsSnap.docs.map(async (walletDoc) => {
            const walletData = walletDoc.data() as UserWallet;
            const userId = walletData.userId;
            
            // Récupérer les données utilisateur
            const userSnap = await getDocs(query(collection(db, 'users'), where('uid', '==', userId)));
            
            let userName = 'Utilisateur inconnu';
            let email = 'Pas d\'email';
            
            if (!userSnap.empty) {
              const userData = userSnap.docs[0].data();
              userName = userData.displayName || 'Sans nom';
              email = userData.email || 'Pas d\'email';
            }
            
            return {
              ...walletData,
              userName,
              email
            };
          })
        );
        
        setUserWallets(walletsWithUserInfo);
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
      
      // Récupérer directement les transactions de l'utilisateur dans la collection transactions
      const transactionsQuery = query(
        collection(db, 'transactions'),
        where('userId', '==', userId)
      );
      const transactionsSnap = await getDocs(transactionsQuery);
      
      if (transactionsSnap.empty) {
        setUserTransactions([]);
      } else {
        // Récupérer les transactions
        const transactions = transactionsSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Transaction[];
        
        // Simplifier la logique de tri pour éviter les problèmes de type
        const sortedTransactions = [...transactions].sort((a, b) => {
          // Utiliser toString() pour comparer les dates en string, ce qui est suffisant pour le tri
          return (b.createdAt as any).toString().localeCompare((a.createdAt as any).toString());
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
      const walletRef = doc(db, 'wallets', userId);
      
      // Mettre à jour le solde
      await updateDoc(walletRef, {
        balance: parseFloat(newBalance),
        lastUpdated: new Date()
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
      if (typeof date === 'object' && date !== null && 'toDate' in date && typeof date.toDate === 'function') {
        return date.toDate().toLocaleDateString('fr-FR', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      }
      
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
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="w-5 h-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full p-4 pl-10 bg-gray-800 border border-gray-700 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            placeholder="Rechercher par nom, email ou ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      {selectedUser ? (
        // Affichage des transactions d'un utilisateur spécifique
        <div>
          <button
            className="mb-4 flex items-center text-blue-400 hover:underline"
            onClick={() => setSelectedUser(null)}
          >
            &larr; Retour à la liste des portefeuilles
          </button>
          
          <div className="mb-6 bg-gray-800 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold">
                  {userWallets.find(w => w.userId === selectedUser)?.userName || 'Utilisateur'}
                </h2>
                <p className="text-gray-400">
                  {userWallets.find(w => w.userId === selectedUser)?.email || 'Sans email'}
                </p>
              </div>
              
              <div className="text-right">
                {isEditingBalance ? (
                  <div className="flex items-center">
                    <input
                      type="number"
                      className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg mr-2 w-32"
                      value={newBalance}
                      onChange={(e) => setNewBalance(e.target.value)}
                      placeholder="Nouveau solde"
                    />
                    <button
                      className="bg-green-600 hover:bg-green-700 px-3 py-2 rounded-lg mr-2"
                      onClick={() => updateUserBalance(selectedUser)}
                    >
                      Confirmer
                    </button>
                    <button
                      className="bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded-lg"
                      onClick={() => setIsEditingBalance(false)}
                    >
                      Annuler
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="text-2xl font-bold">
                      {userWallets.find(w => w.userId === selectedUser)?.balance.toFixed(2) || '0.00'} €
                    </div>
                    <button
                      className="text-blue-400 hover:underline text-sm"
                      onClick={() => {
                        setNewBalance(userWallets.find(w => w.userId === selectedUser)?.balance.toString() || '0');
                        setIsEditingBalance(true);
                      }}
                    >
                      Modifier le solde
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <h3 className="text-xl font-bold mb-4">Historique des transactions</h3>
          
          {userTransactions.length === 0 ? (
            <div className="text-center py-8 bg-gray-800 rounded-lg">
              <Wallet className="mx-auto h-12 w-12 text-gray-600 mb-3" />
              <p className="text-gray-400">Aucune transaction trouvée pour cet utilisateur</p>
            </div>
          ) : (
            <div className="bg-gray-800 rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-800">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Type
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Montant
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Statut
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-gray-800 divide-y divide-gray-700">
                  {userTransactions.map(transaction => (
                    <tr key={transaction.id} className="hover:bg-gray-700/50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {formatDate(transaction.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {getTypeLabel(transaction.type)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={transaction.type === TransactionType.DEPOSIT ? 'text-green-400' : 'text-red-400'}>
                          {transaction.type === TransactionType.DEPOSIT ? '+' : '-'}{transaction.amount} {transaction.currency}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {getStatusLabel(transaction.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button className="text-blue-400 hover:text-blue-300 mr-3">
                          <EyeIcon className="h-5 w-5" />
                        </button>
                        <button className="text-blue-400 hover:text-blue-300">
                          <Download className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        // Liste de tous les portefeuilles
        <div className="bg-gray-800 rounded-lg overflow-hidden">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-400 mx-auto mb-4"></div>
              <p className="text-gray-400">Chargement des portefeuilles...</p>
            </div>
          ) : filteredWallets.length === 0 ? (
            <div className="text-center py-12">
              <Wallet className="mx-auto h-12 w-12 text-gray-600 mb-3" />
              <p className="text-gray-400">Aucun portefeuille trouvé</p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-800">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Utilisateur
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Solde
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Dernière mise à jour
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-700">
                {filteredWallets.map(wallet => (
                  <tr key={wallet.userId} className="hover:bg-gray-700/50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-200">
                            {wallet.userName}
                          </div>
                          <div className="text-sm text-gray-400">
                            {wallet.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-200 font-medium">
                        {wallet.balance.toFixed(2)} {wallet.currency}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {formatDate(wallet.lastUpdated)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        className="text-blue-400 hover:text-blue-300"
                        onClick={() => loadUserTransactions(wallet.userId)}
                      >
                        Voir les transactions
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminWalletManager; 