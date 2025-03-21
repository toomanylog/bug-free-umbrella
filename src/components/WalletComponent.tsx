import React, { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, database } from '../firebase/config';
import { ref, get, onValue, off } from 'firebase/database';
import { 
  createWalletDeposit, 
  cancelTransaction,
  Transaction as BaseTransaction, 
  TransactionStatus, 
  UserWallet, 
  SUPPORTED_CRYPTOCURRENCIES 
} from '../firebase/services/nowpayments';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Trash, ArrowUp, CheckCircle, XCircle, Clock, X } from 'lucide-react';

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
}

const WalletComponent: React.FC<WalletComponentProps> = ({ isAdmin = false }) => {
  const [user] = useAuthState(auth);
  const [wallet, setWallet] = useState<UserWallet | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [amount, setAmount] = useState<number>(0);
  const [depositUrl, setDepositUrl] = useState<string | null>(null);
  const [processingDeposit, setProcessingDeposit] = useState<boolean>(false);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [selectedCrypto, setSelectedCrypto] = useState<string>('btc');
  const [cancellationLoading, setCancellationLoading] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Options de montants prédéfinis pour les dépôts
  const predefinedAmounts = [50, 100, 200, 500, 1000];

  // Charger les données du portefeuille et des transactions
  useEffect(() => {
    if (!user) return;

    setLoading(true);
    setError(null);

    // Référence au portefeuille de l'utilisateur
    const walletRef = ref(database, `wallets/${user.uid}`);
    
    // Écouter les changements du portefeuille
    const walletListener = onValue(walletRef, (snapshot) => {
      if (snapshot.exists()) {
        const walletData = snapshot.val();
        setWallet({
          userId: user.uid,
          balance: walletData.balance || 0,
          currency: walletData.currency || 'EUR',
          lastUpdated: walletData.lastUpdated || new Date().toISOString()
        });
      } else {
        // Si le portefeuille n'existe pas encore, créer un objet vide
        setWallet({
          userId: user.uid,
          balance: 0,
          currency: 'EUR',
          lastUpdated: new Date().toISOString()
        });
      }
      setLoading(false);
    }, (error) => {
      console.error("Erreur lors du chargement du portefeuille:", error);
      setError("Impossible de charger les données du portefeuille.");
      setLoading(false);
    });

    // Référence aux transactions de l'utilisateur
    const transactionsRef = ref(database, 'transactions');
    
    // Écouter les changements des transactions
    const transactionsListener = onValue(transactionsRef, (snapshot) => {
      if (snapshot.exists()) {
        const transactionsData = snapshot.val();
        const userTransactions: Transaction[] = [];
        
        // Filtrer les transactions de l'utilisateur actuel
        Object.keys(transactionsData).forEach(key => {
          const transaction = transactionsData[key];
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
    }, (error) => {
      console.error("Erreur lors du chargement des transactions:", error);
      setError("Impossible de charger l'historique des transactions.");
    });

    // Nettoyage des écouteurs lorsque le composant est démonté
    return () => {
      off(walletRef);
      off(transactionsRef);
    };
  }, [user]);

  // Vérifier l'état des transactions en attente toutes les 30 secondes
  useEffect(() => {
    if (!user) return;

    const intervalId = setInterval(() => {
      // Vérifier les transactions en attente
      const pendingTransactions = transactions.filter(
        tx => tx.status === TransactionStatus.WAITING || 
             tx.status === TransactionStatus.CONFIRMING
      );

      if (pendingTransactions.length > 0) {
        console.log("Vérification des transactions en attente...");
        // La mise à jour des transactions est gérée par l'écouteur en temps réel
      }
    }, 30000);

    return () => clearInterval(intervalId);
  }, [transactions, user]);

  // Fonction pour gérer un dépôt
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
      setDepositUrl(result.paymentUrl);
    } catch (err) {
      console.error("Erreur lors de la création du dépôt:", err);
      setError("Une erreur est survenue lors de la création du dépôt.");
    } finally {
      setProcessingDeposit(false);
    }
  };

  // Fonction pour annuler une transaction en attente
  const handleCancelTransaction = async (transactionId: string) => {
    if (!user) return;
    
    try {
      setCancellationLoading(transactionId);
      await cancelTransaction(user, transactionId);
      setSuccessMessage("Transaction annulée avec succès.");
      
      // Le changement sera automatiquement reflété dans l'interface grâce à l'écouteur onValue
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
  const getStatusLabel = (status: TransactionStatus): string => {
    switch (status) {
      case TransactionStatus.WAITING:
        return "En attente";
      case TransactionStatus.CONFIRMING:
        return "En cours de confirmation";
      case TransactionStatus.CONFIRMED:
        return "Confirmé";
      case TransactionStatus.SENDING:
        return "En cours d'envoi";
      case TransactionStatus.PARTIALLY_PAID:
        return "Partiellement payé";
      case TransactionStatus.FINISHED:
        return "Terminé";
      case TransactionStatus.FAILED:
        return "Échoué";
      case TransactionStatus.REFUNDED:
        return "Remboursé";
      case TransactionStatus.EXPIRED:
        return "Expiré";
      case TransactionStatus.CANCELLED:
        return "Annulé";
      default:
        return status;
    }
  };

  // Fonction pour obtenir l'icône d'état d'une transaction
  const getStatusIcon = (status: TransactionStatus) => {
    switch (status) {
      case TransactionStatus.FINISHED:
        return <CheckCircle className="status-icon success" />;
      case TransactionStatus.FAILED:
      case TransactionStatus.EXPIRED:
      case TransactionStatus.CANCELLED:
        return <XCircle className="status-icon error" />;
      case TransactionStatus.WAITING:
      case TransactionStatus.CONFIRMING:
      case TransactionStatus.SENDING:
      case TransactionStatus.PARTIALLY_PAID:
        return <Clock className="status-icon pending" />;
      default:
        return null;
    }
  };

  // Fonction pour afficher le type de transaction
  const getTransactionTypeLabel = (transaction: Transaction): string => {
    switch (transaction.type) {
      case 'deposit':
        return "Dépôt";
      case 'formation_purchase':
        return "Achat de formation";
      case 'tool_purchase':
        return "Achat d'outil";
      case 'other_purchase':
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
    return <div className="wallet-loading">Chargement du portefeuille...</div>;
  }

  return (
    <div className="wallet-container">
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
              {SUPPORTED_CRYPTOCURRENCIES.map(crypto => (
                <button
                  key={crypto.id}
                  className={`crypto-button ${selectedCrypto === crypto.id ? 'selected' : ''}`}
                  onClick={() => setSelectedCrypto(crypto.id)}
                >
                  {crypto.symbol}
                </button>
              ))}
            </div>
            <p className="crypto-note">
              Vous paierez en équivalent {SUPPORTED_CRYPTOCURRENCIES.find(c => c.id === selectedCrypto)?.name || selectedCrypto.toUpperCase()}
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
          <button className="redirect-button" onClick={() => window.open(depositUrl, '_blank')}>
            Aller à la page de paiement
          </button>
          <button className="cancel-button" onClick={() => setDepositUrl(null)}>
            Annuler
          </button>
        </div>
      )}

      {/* Afficher les transactions en attente avec les détails de paiement */}
      {transactions.filter(tx => tx.status === TransactionStatus.WAITING && tx.type === 'deposit').length > 0 && (
        <div className="pending-payments">
          <h3>Paiements en attente</h3>
          {transactions
            .filter(tx => tx.status === TransactionStatus.WAITING && tx.type === 'deposit')
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
                  {transaction.type === 'deposit' ? <ArrowUp /> : <Trash />}
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
                  {transaction.type === 'deposit' ? '+' : '-'}
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