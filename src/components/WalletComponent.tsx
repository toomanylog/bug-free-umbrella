import React, { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, database } from '../firebase/config';
import { ref, get, onValue, off, update, set } from 'firebase/database';
import { 
  createWalletDeposit, 
  cancelTransaction,
  Transaction as BaseTransaction, 
  UserWallet,
  checkPaymentStatus,
  checkTransactionExpiration,
  TransactionStatus,
  TransactionType
} from '../firebase/services/nowpayments';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Trash, ArrowUp, CheckCircle, XCircle, Clock, X, Plus, Minus } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

// Styles
import './WalletComponent.css';

// Interface pour étendre le type Transaction
interface Transaction extends BaseTransaction {
  paymentDetails?: {
    pay_address: string;
    pay_amount: number;
    pay_currency: string;
    paymentUrl: string;
  };
  expiresAt?: string;
}

// Interface pour les props du composant
interface WalletComponentProps {
  isAdmin?: boolean;
  userWallet?: UserWallet | null;
  onWalletUpdate?: (newWallet: UserWallet) => void;
  isDepositActive?: boolean;
  initialDepositAmount?: string;
}

// Constantes pour les cryptos supportées
const CRYPTOCURRENCIES = [
  { id: 'btc', name: 'Bitcoin', symbol: 'BTC', icon: 'https://cryptologos.cc/logos/bitcoin-btc-logo.svg' },
  { id: 'eth', name: 'Ethereum', symbol: 'ETH', icon: 'https://cryptologos.cc/logos/ethereum-eth-logo.svg' },
  { id: 'ltc', name: 'Litecoin', symbol: 'LTC', icon: 'https://cryptologos.cc/logos/litecoin-ltc-logo.svg' },
  { id: 'bch', name: 'Bitcoin Cash', symbol: 'BCH', icon: 'https://cryptologos.cc/logos/bitcoin-cash-bch-logo.svg' },
  { id: 'xrp', name: 'Ripple', symbol: 'XRP', icon: 'https://cryptologos.cc/logos/xrp-xrp-logo.svg' },
  { id: 'doge', name: 'Dogecoin', symbol: 'DOGE', icon: 'https://cryptologos.cc/logos/dogecoin-doge-logo.svg' },
  { id: 'trx', name: 'TRON', symbol: 'TRX', icon: 'https://cryptologos.cc/logos/tron-trx-logo.svg' },
  { id: 'usdt', name: 'Tether', symbol: 'USDT', icon: 'https://cryptologos.cc/logos/tether-usdt-logo.svg' },
  { id: 'bnb', name: 'Binance Coin', symbol: 'BNB', icon: 'https://cryptologos.cc/logos/bnb-bnb-logo.svg' },
  { id: 'sol', name: 'Solana', symbol: 'SOL', icon: 'https://cryptologos.cc/logos/solana-sol-logo.svg' }
];

// Types de transaction
const TRANSACTION_TYPES = {
  DEPOSIT: 'deposit',
  WITHDRAWAL: 'withdrawal',
  FORMATION_PURCHASE: 'formation_purchase',
  TOOL_PURCHASE: 'tool_purchase',
  OTHER_PURCHASE: 'other_purchase'
} as const;

// Statuts de transaction
const TRANSACTION_STATUS = {
  WAITING: 'waiting',
  CONFIRMING: 'confirming',
  CONFIRMED: 'confirmed',
  SENDING: 'sending',
  PARTIALLY_PAID: 'partially_paid',
  FINISHED: 'finished',
  FAILED: 'failed',
  REFUNDED: 'refunded',
  EXPIRED: 'expired',
  CANCELLED: 'cancelled'
} as const;

// Ajouter ces fonctions utilitaires après les constantes
const getStatusColor = (status: TransactionStatus): string => {
  switch (status) {
    case TransactionStatus.FINISHED:
      return 'text-green-500';
    case TransactionStatus.WAITING:
    case TransactionStatus.CONFIRMING:
      return 'text-yellow-500';
    case TransactionStatus.FAILED:
    case TransactionStatus.EXPIRED:
    case TransactionStatus.CANCELLED:
      return 'text-red-500';
    default:
      return 'text-gray-500';
  }
};

const getStatusText = (status: TransactionStatus): string => {
  switch (status) {
    case TransactionStatus.WAITING:
      return 'En attente';
    case TransactionStatus.CONFIRMING:
      return 'Confirmation en cours';
    case TransactionStatus.CONFIRMED:
      return 'Confirmé';
    case TransactionStatus.SENDING:
      return 'Envoi en cours';
    case TransactionStatus.PARTIALLY_PAID:
      return 'Partiellement payé';
    case TransactionStatus.FINISHED:
      return 'Terminé';
    case TransactionStatus.FAILED:
      return 'Échoué';
    case TransactionStatus.REFUNDED:
      return 'Remboursé';
    case TransactionStatus.EXPIRED:
      return 'Expiré';
    case TransactionStatus.CANCELLED:
      return 'Annulé';
    default:
      return 'Inconnu';
  }
};

const WalletComponent: React.FC<WalletComponentProps> = ({ 
  isAdmin = false,
  userWallet,
  onWalletUpdate,
  isDepositActive = false,
  initialDepositAmount = ''
}) => {
  const [user] = useAuthState(auth);
  const [wallet, setWallet] = useState<UserWallet | null>(userWallet || null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [amount, setAmount] = useState<number>(0);
  const [depositUrl, setDepositUrl] = useState<string | null>(null);
  const [processingDeposit, setProcessingDeposit] = useState<boolean>(false);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [selectedCrypto, setSelectedCrypto] = useState<string>('btc');
  const [cancellationLoading, setCancellationLoading] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState<boolean>(false);
  const [showWithdraw, setShowWithdraw] = useState<boolean>(false);
  const [autoCheckEnabled, setAutoCheckEnabled] = useState<boolean>(false);
  const [checkingTransactions, setCheckingTransactions] = useState<Set<string>>(new Set());

  // Options de montants prédéfinis pour les dépôts
  const predefinedAmounts = [50, 100, 200, 500, 1000];

  // Charger les données du portefeuille et des transactions
  useEffect(() => {
    if (!user) return;
    if (userWallet) {
      setWallet(userWallet);
      return;
    }

    setLoading(true);
    setError(null);

    // Référence au portefeuille de l'utilisateur
    const walletRef = ref(database, `wallets/${user.uid}`);
    
    // Écouter les changements du portefeuille
    const walletListener = onValue(walletRef, (snapshot) => {
      if (snapshot.exists()) {
        const walletData = snapshot.val();
        const updatedWallet = {
          userId: user.uid,
          balance: walletData.balance || 0,
          currency: walletData.currency || 'EUR',
          lastUpdated: walletData.lastUpdated || new Date().toISOString()
        };
        setWallet(updatedWallet);
        // Notifier le composant parent si la fonction onWalletUpdate est fournie
        if (onWalletUpdate) {
          onWalletUpdate(updatedWallet);
        }
      } else {
        // Si le portefeuille n'existe pas encore, créer un objet vide
        const emptyWallet = {
          userId: user.uid,
          balance: 0,
          currency: 'EUR',
          lastUpdated: new Date().toISOString()
        };
        setWallet(emptyWallet);
        // Notifier le composant parent si la fonction onWalletUpdate est fournie
        if (onWalletUpdate) {
          onWalletUpdate(emptyWallet);
        }
      }
      setLoading(false);
    }, (error) => {
      console.error("Erreur lors du chargement du portefeuille:", error);
      setError("Impossible de charger les données du portefeuille.");
      setLoading(false);
    });

    // Référence aux transactions de l'utilisateur
    const transactionsRef = ref(database, `transactions`);
    
    // Écouter les changements des transactions
    const transactionsListener = onValue(transactionsRef, (snapshot) => {
      if (snapshot.exists()) {
        const transactionsData = snapshot.val();
        const userTransactions: Transaction[] = [];
        
        // Filtrer les transactions de l'utilisateur actuel
        Object.entries(transactionsData).forEach(([key, transaction]: [string, any]) => {
          if (transaction.userId === user.uid) {
            userTransactions.push({
              ...transaction,
              id: key
            });
          }
        });
        
        // Trier les transactions par date de création (plus récentes en premier)
        userTransactions.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        
        setTransactions(userTransactions);
      } else {
        setTransactions([]);
      }
    });

    // Nettoyage des écouteurs lorsque le composant est démonté
    return () => {
      off(walletRef);
      off(transactionsRef);
    };
  }, [user, userWallet, onWalletUpdate]);

  // Vérifier l'état des transactions en attente toutes les 30 secondes
  useEffect(() => {
    if (!user) return;

    const intervalId = setInterval(() => {
      // Vérifier les transactions en attente
      const pendingTransactions = transactions.filter(
        tx => tx.status === TRANSACTION_STATUS.WAITING || 
             tx.status === TRANSACTION_STATUS.CONFIRMING
      );

      if (pendingTransactions.length > 0) {
        console.log("Vérification des transactions en attente...");
        // La mise à jour des transactions est gérée par l'écouteur en temps réel
      }
    }, 30000);

    return () => clearInterval(intervalId);
  }, [transactions, user]);

  // Utiliser initialDepositAmount s'il est fourni
  useEffect(() => {
    if (initialDepositAmount) {
      const parsedAmount = parseFloat(initialDepositAmount);
      if (!isNaN(parsedAmount) && parsedAmount > 0) {
        setAmount(parsedAmount);
        setSelectedAmount(parsedAmount);
      }
    }
  }, [initialDepositAmount]);
  
  // Activer le formulaire de dépôt si isDepositActive est true
  useEffect(() => {
    if (isDepositActive && amount > 0) {
      // Démarrer automatiquement le processus de dépôt si un montant est déjà défini
      // Cette partie est optionnelle, on peut simplement afficher le formulaire
      // handleDeposit();
    }
  }, [isDepositActive]);

  // Ajouter la fonction pour créer un dépôt
  const handleDeposit = async () => {
    if (!user || !amount || !selectedCrypto) {
      setError('Veuillez remplir tous les champs requis');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setProcessingDeposit(true);

      console.log('Début de la création du dépôt:', {
        amount,
        selectedCrypto,
        userId: user.uid
      });

      const deposit = await createWalletDeposit(user, amount, selectedCrypto);
      
      if (!deposit || !deposit.transactionId) {
        throw new Error('Transaction non créée');
      }

      // Utiliser directement l'URL de paiement retournée
      if (deposit.paymentUrl) {
        setDepositUrl(deposit.paymentUrl);
      }

      setSuccessMessage('Dépôt créé avec succès ! Veuillez procéder au paiement.');
      setShowAdd(false);
      setAmount(0);
      setSelectedAmount(null);
    } catch (error) {
      console.error('Erreur lors de la création du dépôt:', error);
      setError(error instanceof Error ? error.message : 'Une erreur est survenue lors de la création du dépôt');
    } finally {
      setLoading(false);
      setProcessingDeposit(false);
    }
  };

  // Ajouter la fonction pour annuler une transaction
  const handleCancelTransaction = async (transactionId: string) => {
    if (!user) return;
    
    try {
      setCancellationLoading(transactionId);
      await cancelTransaction(user, transactionId);
      setSuccessMessage("Transaction annulée avec succès.");
      
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err: any) {
      console.error("Erreur lors de l'annulation de la transaction:", err);
      setError(err.message || "Une erreur est survenue lors de l'annulation de la transaction.");
      
      setTimeout(() => {
        setError(null);
      }, 3000);
    } finally {
      setCancellationLoading(null);
    }
  };

  // Fonction pour formater la date
  const formatDate = (dateString: string): string => {
    try {
      return format(new Date(dateString), 'dd MMMM yyyy à HH:mm', { locale: fr });
    } catch (error) {
      return dateString;
    }
  };

  // Fonction pour afficher l'état d'une transaction
  const getStatusLabel = (status: string): string => {
    switch (status) {
      case TRANSACTION_STATUS.WAITING:
        return "En attente";
      case TRANSACTION_STATUS.CONFIRMING:
        return "En cours de confirmation";
      case TRANSACTION_STATUS.CONFIRMED:
        return "Confirmé";
      case TRANSACTION_STATUS.SENDING:
        return "En cours d'envoi";
      case TRANSACTION_STATUS.PARTIALLY_PAID:
        return "Partiellement payé";
      case TRANSACTION_STATUS.FINISHED:
        return "Terminé";
      case TRANSACTION_STATUS.FAILED:
        return "Échoué";
      case TRANSACTION_STATUS.REFUNDED:
        return "Remboursé";
      case TRANSACTION_STATUS.EXPIRED:
        return "Expiré";
      case TRANSACTION_STATUS.CANCELLED:
        return "Annulé";
      default:
        return status;
    }
  };

  // Fonction pour obtenir l'icône d'état d'une transaction
  const getStatusIcon = (status: string) => {
    switch (status) {
      case TRANSACTION_STATUS.FINISHED:
        return <CheckCircle className="status-icon success" />;
      case TRANSACTION_STATUS.FAILED:
      case TRANSACTION_STATUS.EXPIRED:
      case TRANSACTION_STATUS.CANCELLED:
        return <XCircle className="status-icon error" />;
      case TRANSACTION_STATUS.WAITING:
      case TRANSACTION_STATUS.CONFIRMING:
      case TRANSACTION_STATUS.SENDING:
      case TRANSACTION_STATUS.PARTIALLY_PAID:
        return <Clock className="status-icon pending" />;
      default:
        return null;
    }
  };

  // Fonction pour afficher le type de transaction
  const getTransactionTypeLabel = (transaction: Transaction): string => {
    switch (transaction.type) {
      case TRANSACTION_TYPES.DEPOSIT:
        return "Dépôt";
      case TRANSACTION_TYPES.FORMATION_PURCHASE:
        return "Achat de formation";
      case TRANSACTION_TYPES.TOOL_PURCHASE:
        return "Achat d'outil";
      case TRANSACTION_TYPES.OTHER_PURCHASE:
        return "Autre achat";
      default:
        return transaction.type || "Inconnu";
    }
  };

  // Fonction pour sélectionner un montant prédéfini
  const handleAmountSelection = (selectedValue: number) => {
    setSelectedAmount(selectedValue);
    setAmount(selectedValue);
  };

  // Ajouter la fonction de vérification de paiement
  const handleCheckPayment = async (transactionId: string) => {
    try {
      setCheckingTransactions(prev => new Set(prev).add(transactionId));
      
      // Trouver la transaction dans la liste
      const transaction = transactions.find(t => t.id === transactionId);
      if (!transaction || !transaction.paymentId) {
        throw new Error('Transaction non trouvée ou ID de paiement manquant');
      }

      const result = await checkPaymentStatus(transaction.paymentId);
      
      // Mettre à jour le statut de la transaction localement
      setTransactions(prev => prev.map(t => 
        t.id === transactionId 
          ? { ...t, status: result.status }
          : t
      ));
    } catch (error) {
      console.error('Erreur lors de la vérification du paiement:', error);
      setError(error instanceof Error ? error.message : 'Erreur lors de la vérification du paiement');
    } finally {
      setCheckingTransactions(prev => {
        const newSet = new Set(prev);
        newSet.delete(transactionId);
        return newSet;
      });
    }
  };

  // Ajouter l'effet pour la vérification automatique
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (autoCheckEnabled) {
      intervalId = setInterval(() => {
        transactions
          .filter(tx => 
            tx.status === TRANSACTION_STATUS.WAITING || 
            tx.status === TRANSACTION_STATUS.CONFIRMING || 
            tx.status === TRANSACTION_STATUS.SENDING || 
            tx.status === TRANSACTION_STATUS.PARTIALLY_PAID
          )
          .forEach(tx => handleCheckPayment(tx.id));
      }, 30000); // Vérifier toutes les 30 secondes
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [autoCheckEnabled, transactions]);

  // Ajouter l'effet pour vérifier l'expiration des transactions
  useEffect(() => {
    if (!user) return;

    const checkExpiredTransactions = async () => {
      const pendingTransactions = transactions.filter(
        tx => tx.status === TRANSACTION_STATUS.WAITING
      );

      for (const transaction of pendingTransactions) {
        await checkTransactionExpiration(transaction.id);
      }
    };

    // Vérifier toutes les 5 minutes
    const intervalId = setInterval(checkExpiredTransactions, 5 * 60 * 1000);

    // Vérifier immédiatement au chargement
    checkExpiredTransactions();

    return () => clearInterval(intervalId);
  }, [transactions, user]);

  // Ajouter le composant PaymentDetails
  const PaymentDetails: React.FC<{ transaction: Transaction }> = ({ transaction }) => {
    const { paymentDetails } = transaction;
    if (!paymentDetails) return null;

    return (
      <div className="payment-details bg-gray-800 p-6 rounded-lg shadow-lg">
        <h3 className="text-xl font-semibold mb-4 text-white">Détails du paiement</h3>
        
        <div className="mb-6 flex justify-center">
          <QRCodeSVG 
            value={paymentDetails.pay_address}
            size={200}
            level="H"
            includeMargin={true}
            className="bg-white p-2 rounded"
          />
        </div>

        <div className="space-y-4">
          <div className="bg-gray-700 p-4 rounded">
            <p className="text-sm text-gray-300 mb-1">Adresse de paiement :</p>
            <p className="text-white font-mono break-all">{paymentDetails.pay_address}</p>
          </div>

          <div className="bg-gray-700 p-4 rounded">
            <p className="text-sm text-gray-300 mb-1">Montant à envoyer :</p>
            <p className="text-white font-bold">
              {paymentDetails.pay_amount} {paymentDetails.pay_currency.toUpperCase()}
            </p>
          </div>

          <div className="bg-gray-700 p-4 rounded">
            <p className="text-sm text-gray-300 mb-1">Montant en EUR :</p>
            <p className="text-white font-bold">{transaction.amount} EUR</p>
          </div>

          <div className="mt-6">
            <button
              onClick={() => handleCheckPayment(transaction.id)}
              disabled={checkingTransactions.has(transaction.id)}
              className="check-payment-button w-full"
            >
              {checkingTransactions.has(transaction.id) ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Vérification en cours...
                </span>
              ) : (
                'Vérifier le paiement'
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Modifier la section qui affiche les transactions pour inclure PaymentDetails
  const renderTransactions = () => {
    if (loading) {
      return <div className="text-center">Chargement...</div>;
    }

    if (transactions.length === 0) {
      return <div className="text-center text-gray-500">Aucune transaction</div>;
    }

    return (
      <div className="space-y-4">
        {transactions.map((transaction) => (
          <div key={transaction.id} className="bg-gray-800 rounded-lg p-4">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-lg font-semibold">
                  {transaction.type === TransactionType.DEPOSIT ? 'Dépôt' : 'Achat'}
                </p>
                <p className="text-sm text-gray-400">
                  {format(new Date(transaction.createdAt), 'dd MMMM yyyy HH:mm', { locale: fr })}
                </p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold">
                  {transaction.amount} {transaction.currency}
                </p>
                <p className={`text-sm ${getStatusColor(transaction.status as TransactionStatus)}`}>
                  {getStatusText(transaction.status as TransactionStatus)}
                </p>
              </div>
            </div>

            {/* Afficher les détails de paiement pour les transactions en attente */}
            {(transaction.status === TransactionStatus.WAITING || 
              transaction.status === TransactionStatus.CONFIRMING) && 
              transaction.type === TransactionType.DEPOSIT && (
              <PaymentDetails transaction={transaction} />
            )}

            {/* Boutons d'action */}
            <div className="flex justify-end space-x-2 mt-4">
              {(transaction.status === TransactionStatus.WAITING) && (
                <button
                  onClick={() => handleCancelTransaction(transaction.id)}
                  disabled={cancellationLoading === transaction.id}
                  className="cancel-transaction-button"
                >
                  Annuler
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="wallet-container">
        <div className="wallet-card">
          <div className="wallet-content">
            <div className="wallet-header">
              <h2>Mon Portefeuille</h2>
              <div className="wallet-balance">
                <div className="animate-pulse bg-gray-700 h-8 w-32 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="wallet-container">
      <div className="wallet-card">
        <div className="wallet-content">
          <div className="wallet-header">
            <h2>Mon Portefeuille</h2>
            <div className="wallet-balance">
              <span className="balance-amount">{wallet?.balance?.toFixed(2) || "0.00"} €</span>
            </div>
          </div>
          
          <div className="wallet-actions">
            <button className="wallet-button" onClick={() => setShowAdd(true)}>
              <Plus size={18} /> Ajouter des fonds
            </button>
            <button className="wallet-button" onClick={() => setShowWithdraw(true)}>
              <Minus size={18} /> Retirer des fonds
            </button>
          </div>
        </div>
        
        <div className="transactions-section">
          <h3>Dernières Transactions</h3>
          {renderTransactions()}
        </div>
      </div>
      
      {error && (
        <div className="wallet-error">
          {error}
          <button 
            className="error-close-btn" 
            onClick={() => setError(null)}
          >
            <X size={16} />
          </button>
        </div>
      )}
      
      {successMessage && (
        <div className="wallet-success">
          {successMessage}
          <button 
            className="success-close-btn" 
            onClick={() => setSuccessMessage(null)}
          >
            <X size={16} />
          </button>
        </div>
      )}
      
      {/* Solde du portefeuille */}
      <div className="wallet-balance-container">
        <h2>Mon portefeuille</h2>
        <div className="wallet-balance">
          <span className="balance-amount">{wallet?.balance || 0}</span>
          <span className="balance-currency">{wallet?.currency || 'EUR'}</span>
        </div>
        {wallet?.lastUpdated && (
          <div className="balance-last-updated">
            Dernière mise à jour: {formatDate(wallet.lastUpdated.toString())}
          </div>
        )}
      </div>

      {/* Section de dépôt */}
      {!depositUrl ? (
        <div className="deposit-section">
          <h3>Recharger mon portefeuille</h3>
          
          <div className="predefined-amounts">
            {predefinedAmounts.map(predefinedAmount => (
              <button
                key={predefinedAmount}
                className={`amount-button ${selectedAmount === predefinedAmount ? 'selected' : ''}`}
                onClick={() => handleAmountSelection(predefinedAmount)}
              >
                {predefinedAmount} €
              </button>
            ))}
          </div>
          
          <div className="custom-amount">
            <label htmlFor="custom-amount">Ou entrez un montant personnalisé:</label>
            <div className="input-with-icon">
              <input
                id="custom-amount"
                type="number"
                min="1"
                value={amount || ''}
                onChange={(e) => {
                  const value = parseFloat(e.target.value);
                  setAmount(value);
                  setSelectedAmount(null);
                }}
                placeholder="Montant en EUR"
              />
              <span className="currency-symbol">€</span>
            </div>
          </div>
          
          <div className="crypto-selection">
            <label>Choisissez votre crypto-monnaie:</label>
            <div className="crypto-options">
              {CRYPTOCURRENCIES.map(crypto => (
                <button
                  key={crypto.id}
                  className={`crypto-button ${selectedCrypto === crypto.id ? 'selected' : ''}`}
                  onClick={() => setSelectedCrypto(crypto.id)}
                >
                  <img 
                    src={crypto.icon} 
                    alt={crypto.name} 
                    className="crypto-icon"
                  />
                  <span className="crypto-symbol">{crypto.symbol}</span>
                </button>
              ))}
            </div>
            <p className="crypto-note">
              Vous paierez en équivalent {CRYPTOCURRENCIES.find(c => c.id === selectedCrypto)?.name}
            </p>
          </div>
          
          <button 
            className="deposit-button"
            onClick={handleDeposit}
            disabled={processingDeposit || !amount || amount <= 0}
          >
            {processingDeposit ? 'Traitement en cours...' : 'Déposer des fonds'}
          </button>
        </div>
      ) : (
        <div className="payment-redirect">
          <h3>Paiement en attente</h3>
          <p>Vous allez être redirigé vers la page de paiement.</p>
          <p>Si la redirection ne fonctionne pas, cliquez sur le bouton ci-dessous:</p>
          <button 
            className="redirect-button" 
            onClick={() => window.open(depositUrl, '_blank')}
          >
            Aller à la page de paiement
          </button>
          <button 
            className="cancel-button" 
            onClick={() => setDepositUrl(null)}
          >
            Annuler
          </button>
        </div>
      )}

      {/* Afficher les transactions en attente avec les détails de paiement */}
      {transactions.filter(tx => tx.status === TRANSACTION_STATUS.WAITING && tx.type === TRANSACTION_TYPES.DEPOSIT).length > 0 && (
        <div className="pending-payments">
          <h3>Paiements en attente</h3>
          <div className="auto-check-toggle">
            <label>
              <input
                type="checkbox"
                checked={autoCheckEnabled}
                onChange={(e) => setAutoCheckEnabled(e.target.checked)}
              />
              Vérification automatique (toutes les 30 secondes)
            </label>
          </div>
          {transactions
            .filter(tx => tx.status === TRANSACTION_STATUS.WAITING && tx.type === TRANSACTION_TYPES.DEPOSIT)
            .map(tx => (
              <div key={tx.id} className="pending-payment-item">
                <div className="payment-header">
                  <h4>Dépôt de {tx.amount} {tx.currency}</h4>
                  <div className="payment-actions">
                    <span className="status-tag">En attente</span>
                    <button
                      className="check-payment-button"
                      onClick={() => handleCheckPayment(tx.id)}
                      disabled={checkingTransactions.has(tx.id)}
                    >
                      {checkingTransactions.has(tx.id) ? 'Vérification...' : 'Vérifier l\'état du paiement'}
                    </button>
                    <button
                      className="cancel-tx-button"
                      onClick={() => handleCancelTransaction(tx.id)}
                      disabled={!!cancellationLoading}
                    >
                      {cancellationLoading === tx.id ? 'Annulation...' : 'Annuler'}
                    </button>
                  </div>
                </div>
                
                {tx.paymentDetails && (
                  <div className="payment-details">
                    <p>Pour finaliser votre paiement, veuillez envoyer:</p>
                    <div className="crypto-amount">
                      <strong>{tx.paymentDetails.pay_amount}</strong> {tx.paymentDetails.pay_currency.toUpperCase()}
                    </div>
                    
                    <div className="crypto-address">
                      <label>Adresse {tx.paymentDetails.pay_currency.toUpperCase()}:</label>
                      <div className="address-wrapper">
                        <input 
                          type="text"
                          readOnly
                          value={tx.paymentDetails.pay_address}
                          className="address-field"
                        />
                        <button 
                          className="copy-button"
                          onClick={() => {
                            navigator.clipboard.writeText(tx.paymentDetails?.pay_address || '');
                            alert('Adresse copiée dans le presse-papier');
                          }}
                        >
                          Copier
                        </button>
                      </div>
                    </div>
                    
                    {tx.paymentDetails.paymentUrl && (
                      <div className="payment-url">
                        <a 
                          href={tx.paymentDetails.paymentUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="payment-link"
                        >
                          Payer via le portail de paiement
                        </a>
                      </div>
                    )}
                    
                    <div className="expiration-info">
                      {tx.expiresAt && (
                        <p className="expiration-text">
                          Cette transaction expirera le {formatDate(tx.expiresAt)}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
        </div>
      )}

      {/* Historique des transactions */}
      <div className="transactions-history">
        <h3>Historique des transactions</h3>
        
        {transactions.length === 0 ? (
          <div className="no-transactions">Aucune transaction trouvée.</div>
        ) : (
          <ul className="transactions-list">
            {transactions.map(transaction => (
              <li key={transaction.id} className={`transaction-item ${transaction.status}`}>
                <div className="transaction-icon">
                  {transaction.type === TRANSACTION_TYPES.DEPOSIT ? <ArrowUp /> : <Trash />}
                </div>
                <div className="transaction-details">
                  <div className="transaction-type">
                    {getTransactionTypeLabel(transaction)}
                  </div>
                  <div className="transaction-date">
                    {formatDate(transaction.createdAt)}
                  </div>
                </div>
                <div className="transaction-amount">
                  {transaction.type === TRANSACTION_TYPES.DEPOSIT ? '+' : '-'}
                  {transaction.amount} {transaction.currency}
                </div>
                <div className="transaction-status">
                  {getStatusIcon(transaction.status)}
                  <span>{getStatusLabel(transaction.status)}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default WalletComponent; 