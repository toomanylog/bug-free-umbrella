import React, { useState, useEffect } from 'react';
import { CreditCard, DollarSign, Clock, Check, X, ChevronDown, ChevronsUp, Download, ExternalLink, RefreshCw } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { 
  createWalletDeposit, 
  getUserWallet, 
  getUserTransactions,
  Transaction,
  TransactionStatus,
  TransactionType,
  updateTransactionStatus
} from '../firebase/services/nowpayments';
import axios from 'axios';

interface WalletComponentProps {
  onClose?: () => void;
}

const WalletComponent: React.FC<WalletComponentProps> = ({ onClose }) => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'solde' | 'transactions' | 'recharger'>('solde');
  const [wallet, setWallet] = useState<{ balance: number; currency: string } | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [depositAmount, setDepositAmount] = useState<number>(50);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [isDepositing, setIsDepositing] = useState(false);
  const [depositUrl, setDepositUrl] = useState<string>('');
  const [depositId, setDepositId] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [expandedTransaction, setExpandedTransaction] = useState<string | null>(null);
  const [isCheckingPayment, setIsCheckingPayment] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);

  useEffect(() => {
    const loadWalletData = async () => {
      if (!currentUser) return;
      
      try {
        setLoading(true);
        const userWallet = await getUserWallet(currentUser.uid);
        
        if (userWallet) {
          setWallet({
            balance: userWallet.balance,
            currency: userWallet.currency
          });
        } else {
          setWallet({
            balance: 0,
            currency: 'EUR'
          });
        }
        
        // Charger les transactions
        const userTransactions = await getUserTransactions(currentUser.uid);
        setTransactions(userTransactions);
      } catch (error) {
        console.error('Erreur lors du chargement des données du portefeuille:', error);
        setError('Impossible de charger vos données de portefeuille.');
      } finally {
        setLoading(false);
      }
    };
    
    loadWalletData();
  }, [currentUser]);

  // Effet pour vérifier périodiquement les transactions en attente
  useEffect(() => {
    if (!autoRefresh || !currentUser || !transactions.length) return;
    
    // Identifier les transactions qui sont en attente de confirmation
    const pendingTransactions = transactions.filter(tx => 
      tx.paymentId && 
      tx.status !== TransactionStatus.FINISHED &&
      tx.status !== TransactionStatus.FAILED &&
      tx.status !== TransactionStatus.EXPIRED
    );
    
    if (!pendingTransactions.length) {
      setAutoRefresh(false);
      return;
    }
    
    // Créer un intervalle pour vérifier toutes les 30 secondes
    const interval = setInterval(async () => {
      for (const tx of pendingTransactions) {
        if (tx.paymentId) {
          await checkPaymentStatus(tx.paymentId);
        }
      }
    }, 30000); // 30 secondes
    
    return () => clearInterval(interval);
  }, [autoRefresh, transactions, currentUser]);

  const handleDeposit = async () => {
    if (!currentUser) return;
    
    // Utiliser le montant personnalisé s'il est défini, sinon utiliser le montant prédéfini
    const amount = customAmount ? parseFloat(customAmount) : depositAmount;
    
    if (isNaN(amount) || amount <= 0) {
      setError('Veuillez entrer un montant valide.');
      return;
    }
    
    try {
      setIsDepositing(true);
      setError('');
      
      const result = await createWalletDeposit(currentUser, amount);
      
      if (result && result.paymentUrl) {
        setDepositUrl(result.paymentUrl);
        setDepositId(result.paymentId);
      } else {
        throw new Error('Erreur lors de la création du paiement');
      }
    } catch (error: any) {
      console.error('Erreur lors du dépôt:', error);
      setError(error.message || 'Une erreur s\'est produite lors de la création du paiement.');
    } finally {
      setIsDepositing(false);
    }
  };

  const handleAmountSelect = (amount: number) => {
    setDepositAmount(amount);
    setCustomAmount('');
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Permettre seulement les nombres et un point décimal
    if (value === '' || /^\d+(\.\d{0,2})?$/.test(value)) {
      setCustomAmount(value);
      setDepositAmount(0); // Réinitialiser le montant prédéfini
    }
  };

  const getStatusLabel = (status: TransactionStatus) => {
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

  const getTypeLabel = (type: TransactionType) => {
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

  const formatDate = (date: Date) => {
    try {
      if (!date) return 'N/A';
      if (typeof date === 'object' && date !== null && 'toDate' in date && typeof date.toDate === 'function') {
        // Gérer le cas des Timestamps Firestore
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

  const toggleTransactionDetails = (transactionId: string) => {
    if (expandedTransaction === transactionId) {
      setExpandedTransaction(null);
    } else {
      setExpandedTransaction(transactionId);
    }
  };

  // Fonction pour vérifier le statut d'un paiement directement via l'API NOWPayments
  const checkPaymentStatus = async (paymentId: string) => {
    if (!paymentId) return;
    
    try {
      setIsCheckingPayment(true);
      
      // Endpoint pour vérifier le statut d'un paiement
      // Note: Cela doit normalement être fait via un backend sécurisé
      // Cette implémentation est pour démonstration seulement
      const response = await axios.get(`https://api.nowpayments.io/v1/payment/${paymentId}`, {
        headers: {
          'x-api-key': process.env.REACT_APP_NOWPAYMENTS_API_KEY || '09CARKN-MS64CEK-G9BGJ62-8QSSJ7M'
        }
      });
      
      if (response.data && response.data.payment_status) {
        const newStatus = mapNowPaymentsStatusToEnum(response.data.payment_status);
        
        // Mettre à jour la transaction dans Firestore
        await updateTransactionStatus(paymentId, newStatus, response.data.actually_paid);
        
        // Recharger les données du portefeuille
        const userWallet = await getUserWallet(currentUser!.uid);
        if (userWallet) {
          setWallet({
            balance: userWallet.balance,
            currency: userWallet.currency
          });
        }
        
        // Recharger les transactions
        const userTransactions = await getUserTransactions(currentUser!.uid);
        setTransactions(userTransactions);
        
        // Notification à l'utilisateur
        if (newStatus === TransactionStatus.FINISHED) {
          alert('Votre paiement a été confirmé!');
        } else if (newStatus === TransactionStatus.FAILED || newStatus === TransactionStatus.EXPIRED) {
          alert('Votre paiement a échoué. Veuillez réessayer.');
        }
      }
    } catch (error) {
      console.error('Erreur lors de la vérification du statut du paiement:', error);
    } finally {
      setIsCheckingPayment(false);
    }
  };
  
  // Fonction pour mapper le statut NOWPayments à notre enum
  const mapNowPaymentsStatusToEnum = (status: string): TransactionStatus => {
    switch (status) {
      case 'waiting': return TransactionStatus.WAITING;
      case 'confirming': return TransactionStatus.CONFIRMING;
      case 'confirmed': return TransactionStatus.CONFIRMED;
      case 'sending': return TransactionStatus.SENDING;
      case 'partially_paid': return TransactionStatus.PARTIALLY_PAID;
      case 'finished': return TransactionStatus.FINISHED;
      case 'failed': return TransactionStatus.FAILED;
      case 'refunded': return TransactionStatus.REFUNDED;
      case 'expired': return TransactionStatus.EXPIRED;
      default: return TransactionStatus.WAITING;
    }
  };

  return (
    <div className="bg-gray-900 text-white">
      {/* En-tête */}
      <div className="px-4 py-6 border-b border-gray-800">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Portefeuille</h1>
          {onClose && (
            <button 
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-800 transition-colors"
            >
              <X size={24} />
            </button>
          )}
        </div>
        <p className="text-gray-400">Gérez vos paiements et transactions</p>
      </div>

      {/* Navigation */}
      <div className="flex border-b border-gray-800">
        <button
          className={`px-4 py-3 flex-1 font-medium ${activeTab === 'solde' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-white'}`}
          onClick={() => setActiveTab('solde')}
        >
          Solde
        </button>
        <button
          className={`px-4 py-3 flex-1 font-medium ${activeTab === 'transactions' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-white'}`}
          onClick={() => setActiveTab('transactions')}
        >
          Transactions
        </button>
        <button
          className={`px-4 py-3 flex-1 font-medium ${activeTab === 'recharger' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-white'}`}
          onClick={() => setActiveTab('recharger')}
        >
          Recharger
        </button>
      </div>

      {/* Contenu */}
      <div className="p-4">
        {loading ? (
          <div className="py-10 text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-400 mx-auto mb-4"></div>
            <p className="text-gray-400">Chargement des données...</p>
          </div>
        ) : (
          <>
            {error && (
              <div className="bg-red-900/20 border border-red-800 text-red-100 px-4 py-3 rounded-lg mb-4">
                {error}
              </div>
            )}

            {activeTab === 'solde' && (
              <div className="space-y-6">
                <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-medium text-gray-300">Solde actuel</h2>
                    <DollarSign className="text-green-400" size={24} />
                  </div>
                  <div className="mb-2">
                    <span className="text-3xl font-bold">{wallet?.balance.toFixed(2)}</span>
                    <span className="text-xl ml-2">{wallet?.currency}</span>
                  </div>
                  <p className="text-gray-400 text-sm">
                    Votre solde disponible pour l'achat de formations et d'outils
                  </p>
                  <button
                    onClick={() => setActiveTab('recharger')}
                    className="mt-4 w-full py-2 bg-green-600 hover:bg-green-700 transition-colors rounded-lg font-medium"
                  >
                    Recharger mon compte
                  </button>
                </div>

                <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
                  <h2 className="text-lg font-medium text-gray-300 mb-4">Dernières transactions</h2>
                  
                  {transactions.length === 0 ? (
                    <p className="text-gray-400 text-center py-4">Aucune transaction récente</p>
                  ) : (
                    <div className="space-y-3">
                      {transactions.slice(0, 3).map(transaction => (
                        <div key={transaction.id} className="flex items-center justify-between py-2 border-b border-gray-700">
                          <div>
                            <p className="font-medium">{getTypeLabel(transaction.type)}</p>
                            <p className="text-sm text-gray-400">{formatDate(transaction.createdAt)}</p>
                          </div>
                          <div className="text-right">
                            <p className={`font-medium ${transaction.type === TransactionType.DEPOSIT ? 'text-green-400' : 'text-red-400'}`}>
                              {transaction.type === TransactionType.DEPOSIT ? '+' : '-'}{transaction.amount} {transaction.currency}
                            </p>
                            <div>{getStatusLabel(transaction.status)}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {transactions.length > 3 && (
                    <button
                      onClick={() => setActiveTab('transactions')}
                      className="mt-4 w-full py-2 bg-gray-700 hover:bg-gray-600 transition-colors rounded-lg font-medium text-sm"
                    >
                      Voir toutes les transactions
                    </button>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'transactions' && (
              <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
                <h2 className="text-lg font-medium text-gray-300 mb-4">Historique des transactions</h2>
                
                {transactions.length === 0 ? (
                  <div className="text-center py-10">
                    <Clock className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">Aucune transaction</h3>
                    <p className="text-gray-400">
                      Vous n'avez pas encore effectué de transaction.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {transactions.map(transaction => (
                      <div key={transaction.id} className="bg-gray-700/30 rounded-lg overflow-hidden">
                        <div 
                          className="p-4 cursor-pointer hover:bg-gray-700/50 transition-colors"
                          onClick={() => toggleTransactionDetails(transaction.id)}
                        >
                          <div className="flex justify-between items-center">
                            <div className="flex items-center space-x-3">
                              <div className={`p-2 rounded-full ${
                                transaction.type === TransactionType.DEPOSIT 
                                  ? 'bg-green-500/20 text-green-400' 
                                  : 'bg-blue-500/20 text-blue-400'
                              }`}>
                                {transaction.type === TransactionType.DEPOSIT ? (
                                  <ChevronsUp size={18} />
                                ) : transaction.type === TransactionType.FORMATION_PURCHASE ? (
                                  <Download size={18} />
                                ) : (
                                  <CreditCard size={18} />
                                )}
                              </div>
                              <div>
                                <p className="font-medium">{getTypeLabel(transaction.type)}</p>
                                <p className="text-sm text-gray-400">{formatDate(transaction.createdAt)}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-4">
                              <div className="text-right">
                                <p className={`font-medium ${transaction.type === TransactionType.DEPOSIT ? 'text-green-400' : 'text-red-400'}`}>
                                  {transaction.type === TransactionType.DEPOSIT ? '+' : '-'}{transaction.amount} {transaction.currency}
                                </p>
                                <div>{getStatusLabel(transaction.status)}</div>
                              </div>
                              <ChevronDown 
                                size={18} 
                                className={`transition-transform ${expandedTransaction === transaction.id ? 'rotate-180' : ''}`} 
                              />
                            </div>
                          </div>
                        </div>
                        
                        {expandedTransaction === transaction.id && (
                          <div className="p-4 bg-gray-700/50 border-t border-gray-600">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm text-gray-400">ID Transaction</p>
                                <p className="font-mono text-sm">{transaction.id.substring(0, 10)}...</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-400">Statut</p>
                                <p>{getStatusLabel(transaction.status)}</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-400">Date de création</p>
                                <p>{formatDate(transaction.createdAt)}</p>
                              </div>
                              {transaction.completedAt && (
                                <div>
                                  <p className="text-sm text-gray-400">Date de complétion</p>
                                  <p>{formatDate(transaction.completedAt)}</p>
                                </div>
                              )}
                              {transaction.paymentId && (
                                <div className="col-span-2">
                                  <p className="text-sm text-gray-400">ID Paiement</p>
                                  <p className="font-mono text-sm">{transaction.paymentId}</p>
                                </div>
                              )}
                              {transaction.paymentUrl && (
                                <div className="col-span-2 mt-2">
                                  <a 
                                    href={transaction.paymentUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center space-x-2 text-blue-400 hover:underline"
                                  >
                                    <span>Voir le détail du paiement</span>
                                    <ExternalLink size={14} />
                                  </a>
                                </div>
                              )}
                              
                              {/* Bouton pour vérifier manuellement l'état du paiement */}
                              {transaction.paymentId && transaction.status !== TransactionStatus.FINISHED && 
                               transaction.status !== TransactionStatus.FAILED && transaction.status !== TransactionStatus.EXPIRED && (
                                <div className="col-span-2 mt-4">
                                  <button
                                    onClick={() => checkPaymentStatus(transaction.paymentId!)}
                                    disabled={isCheckingPayment}
                                    className="flex items-center justify-center w-full py-2 bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50"
                                  >
                                    {isCheckingPayment ? (
                                      <>
                                        <RefreshCw size={14} className="mr-2 animate-spin" />
                                        <span>Vérification en cours...</span>
                                      </>
                                    ) : (
                                      <>
                                        <RefreshCw size={14} className="mr-2" />
                                        <span>Vérifier l'état du paiement</span>
                                      </>
                                    )}
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'recharger' && (
              <div className="space-y-6">
                {depositUrl ? (
                  <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
                    <div className="text-center">
                      <div className="bg-green-500/20 p-3 rounded-full inline-block mb-4">
                        <CreditCard className="h-8 w-8 text-green-400" />
                      </div>
                      <h2 className="text-xl font-bold mb-2">Paiement créé</h2>
                      <p className="text-gray-400 mb-6">
                        Votre demande de paiement a été créée avec succès. Veuillez suivre les instructions sur la page de paiement.
                      </p>
                      
                      <div className="bg-gray-700/50 p-4 rounded-lg mb-6">
                        <p className="text-sm text-gray-300 mb-2">ID de transaction</p>
                        <p className="font-mono bg-gray-800 p-2 rounded text-sm mb-4">{depositId}</p>
                      </div>
                      
                      <div className="space-y-4">
                        <a
                          href={depositUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block w-full py-3 bg-blue-600 hover:bg-blue-700 transition-colors rounded-lg font-medium"
                        >
                          Continuer vers la page de paiement
                        </a>
                        <button
                          onClick={() => {
                            setDepositUrl('');
                            setDepositId('');
                            setActiveTab('solde');
                          }}
                          className="block w-full py-3 bg-gray-700 hover:bg-gray-600 transition-colors rounded-lg font-medium"
                        >
                          Retour au portefeuille
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
                    <h2 className="text-lg font-medium text-gray-300 mb-4">Recharger mon compte</h2>
                    
                    <div className="space-y-4">
                      <p className="text-gray-400">
                        Sélectionnez un montant à ajouter à votre portefeuille ou entrez un montant personnalisé.
                      </p>
                      
                      <div className="grid grid-cols-3 gap-3">
                        {[10, 25, 50, 100, 200, 500].map(amount => (
                          <button
                            key={amount}
                            onClick={() => handleAmountSelect(amount)}
                            className={`py-3 rounded-lg font-medium ${
                              depositAmount === amount && !customAmount
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            }`}
                          >
                            {amount} €
                          </button>
                        ))}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Ou entrez un montant personnalisé
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={customAmount}
                            onChange={handleCustomAmountChange}
                            placeholder="0.00"
                            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                            <span className="text-gray-400">€</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-6">
                        <button
                          onClick={handleDeposit}
                          disabled={isDepositing || (!depositAmount && !customAmount)}
                          className="w-full py-3 bg-green-600 hover:bg-green-700 transition-colors rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isDepositing ? 'Création du paiement...' : 'Recharger mon compte'}
                        </button>
                      </div>
                      
                      <div className="mt-4 text-sm text-gray-400">
                        <p className="mb-2">Méthodes de paiement acceptées:</p>
                        <div className="flex flex-wrap gap-2">
                          <span className="px-2 py-1 bg-gray-700 rounded text-xs">Bitcoin (BTC)</span>
                          <span className="px-2 py-1 bg-gray-700 rounded text-xs">Ethereum (ETH)</span>
                          <span className="px-2 py-1 bg-gray-700 rounded text-xs">Litecoin (LTC)</span>
                          <span className="px-2 py-1 bg-gray-700 rounded text-xs">+ 50 autres</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="bg-blue-900/20 rounded-xl p-6 border border-blue-800/30">
                  <h3 className="text-lg font-medium text-blue-300 mb-2">À savoir sur les paiements crypto</h3>
                  <ul className="space-y-2 text-sm text-gray-300">
                    <li className="flex items-start space-x-2">
                      <Check size={16} className="text-blue-400 mt-1 shrink-0" />
                      <span>Les transactions en cryptomonnaie sont sécurisées et irréversibles.</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <Check size={16} className="text-blue-400 mt-1 shrink-0" />
                      <span>Le taux de change est fixé au moment de la création du paiement.</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <Check size={16} className="text-blue-400 mt-1 shrink-0" />
                      <span>Le crédit est ajouté à votre compte une fois que la transaction est confirmée sur la blockchain.</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <Check size={16} className="text-blue-400 mt-1 shrink-0" />
                      <span>Pour toute question, contactez notre support à support@misalinux.com.</span>
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {/* Ajouter un toggle pour la vérification automatique des paiements */}
            {transactions.some(tx => 
              tx.paymentId && 
              tx.status !== TransactionStatus.FINISHED &&
              tx.status !== TransactionStatus.FAILED &&
              tx.status !== TransactionStatus.EXPIRED
            ) && (
              <div className="mt-4 flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                <div className="flex items-center">
                  <RefreshCw size={16} className={`mr-2 ${autoRefresh ? 'text-blue-400 animate-spin' : 'text-gray-400'}`} />
                  <span className="text-sm">Vérification automatique des paiements</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={autoRefresh} 
                    onChange={() => setAutoRefresh(!autoRefresh)}
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-gray-300 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default WalletComponent; 