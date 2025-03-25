import React, { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, database } from '../firebase/config';
import { ref, get, onValue, off } from 'firebase/database';
import { 
  createWalletDeposit, 
  cancelTransaction,
  Transaction as BaseTransaction, 
  UserWallet
} from '../firebase/services/nowpayments';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Trash, ArrowUp, CheckCircle, XCircle, Clock, X, Plus, Minus } from 'lucide-react';

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
  { id: 'btc', name: 'Bitcoin', symbol: 'BTC' },
  { id: 'eth', name: 'Ethereum', symbol: 'ETH' },
  { id: 'usdt', name: 'Tether', symbol: 'USDT' },
  { id: 'bnb', name: 'BNB', symbol: 'BNB' }
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
    if (!user) return;
    if (!amount || amount <= 0) {
      setError("Veuillez entrer un montant valide.");
      return;
    }

    try {
      setProcessingDeposit(true);
      setError(null);

      const result = await createWalletDeposit(user, amount, selectedCrypto);

      if (result.paymentUrl) {
        setDepositUrl(result.paymentUrl);
        window.open(result.paymentUrl, '_blank');
      } else {
        throw new Error("URL de paiement non disponible");
      }
    } catch (err: any) {
      console.error("Erreur lors de la création du dépôt:", err);
      setError(err.message || "Une erreur est survenue lors de la création du dépôt.");
    } finally {
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
          {transactions.length > 0 ? (
            <div className="transactions-list">
              {transactions.map((t, index) => (
                <div key={index} className="transaction-item">
                  <div className="transaction-info">
                    <span className="transaction-type">
                      {t.type === TRANSACTION_TYPES.DEPOSIT ? 'Dépôt' : 
                       t.type === TRANSACTION_TYPES.OTHER_PURCHASE ? 'Retrait' : 'Achat'}
                    </span>
                    <span className="transaction-date">{formatDate(t.createdAt)}</span>
                  </div>
                  <span className={`transaction-amount ${t.type === TRANSACTION_TYPES.DEPOSIT ? 'positive' : 'negative'}`}>
                    {t.type === TRANSACTION_TYPES.DEPOSIT ? '+' : '-'}{t.amount?.toFixed(2) || "0.00"} €
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-transactions">Aucune transaction récente</div>
          )}
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
                    src={`/images/crypto/${crypto.id}.svg`} 
                    alt={crypto.name} 
                    className="w-6 h-6 mr-2"
                  />
                  {crypto.symbol}
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
          {transactions
            .filter(tx => tx.status === TRANSACTION_STATUS.WAITING && tx.type === TRANSACTION_TYPES.DEPOSIT)
            .map(tx => (
              <div key={tx.id} className="pending-payment-item">
                <div className="payment-header">
                  <h4>Dépôt de {tx.amount} {tx.currency}</h4>
                  <div className="payment-actions">
                    <span className="status-tag">En attente</span>
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