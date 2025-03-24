import React, { useState, useEffect, useRef } from 'react';
import { database } from '../../../firebase/config';
import { ref, onValue, update, push, set, get } from 'firebase/database';
import { useAuth } from '../../../contexts/AuthContext';
import { DollarSign, Dice5, BarChart2, RefreshCw, Plus, Minus, Award, Clock } from 'lucide-react';
import './DiceGame.css';

// Fonction pour récupérer le solde de l'utilisateur avec retry et fallback
const getUserBalance = async (userId: string): Promise<number> => {
  try {
    // Essayer d'abord le chemin principal
    const balanceRef = ref(database, `users/${userId}/balance`);
    const snapshot = await get(balanceRef);
    
    if (snapshot.exists()) {
      return snapshot.val();
    }
    
    // Si pas de solde, chercher dans userData
    const userRef = ref(database, `users/${userId}`);
    const userSnapshot = await get(userRef);
    
    if (userSnapshot.exists()) {
      const userData = userSnapshot.val();
      if (userData.balance !== undefined) {
        return userData.balance;
      } else if (userData.wallet?.balance !== undefined) {
        return userData.wallet.balance;
      }
    }
    
    // Si toujours pas trouvé, initialiser à 100 (valeur par défaut)
    console.log("Initialisation du solde à 100");
    await update(ref(database, `users/${userId}`), { balance: 100 });
    return 100;
  } catch (error) {
    console.error("Erreur lors de la récupération du solde:", error);
    return 0;
  }
};

// Fonction pour mettre à jour le solde de l'utilisateur
const updateBalance = async (userId: string, newBalance: number): Promise<void> => {
  try {
    const userRef = ref(database, `users/${userId}`);
    await update(userRef, { balance: newBalance });
    
    // Mettre à jour également dans wallet si présent
    const userSnapshot = await get(userRef);
    if (userSnapshot.exists()) {
      const userData = userSnapshot.val();
      if (userData.wallet) {
        await update(userRef, { 'wallet/balance': newBalance });
      }
    }
  } catch (error) {
    console.error("Erreur lors de la mise à jour du solde:", error);
    throw error;
  }
};

// Interface pour les statistiques du jeu de dés
interface DiceGameStats {
  totalGames: number;
  totalBets: number;
  totalWagered: number;
  totalPayout: number;
  profitLoss: number;
  biggestWin: number;
}

const DiceGame: React.FC = () => {
  const { currentUser, userData, isAdmin } = useAuth();
  const [balance, setBalance] = useState<number>(0);
  const [betAmount, setBetAmount] = useState<number>(5);
  const [isRolling, setIsRolling] = useState<boolean>(false);
  const [gameResult, setGameResult] = useState<{
    dice1: number;
    dice2: number;
    total: number;
    win: boolean;
    winAmount: number;
  } | null>(null);
  const [gameHistory, setGameHistory] = useState<Array<{
    dice1: number;
    dice2: number;
    total: number;
    bet: number;
    win: boolean;
    winAmount: number;
    timestamp: number;
  }>>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showStats, setShowStats] = useState<boolean>(false);
  const [localStats, setLocalStats] = useState({
    wins: 0,
    losses: 0,
    totalWon: 0,
    totalLost: 0
  });
  const [balanceAnimation, setBalanceAnimation] = useState<string>('');
  const statsContentRef = useRef<HTMLDivElement>(null);
  
  // Références pour l'animation
  const dice1Ref = useRef<HTMLDivElement>(null);
  const dice2Ref = useRef<HTMLDivElement>(null);
  const userBalanceRef = useRef<HTMLDivElement>(null);

  // Configuration du jeu
  const MIN_BET = 5;
  const MAX_BET = 1000;
  const HOUSE_EDGE = 0.05; // 5% d'avantage pour la maison
  
  // Règles de gain
  const PAYOUT_RULES = {
    7: 4,       // 4:1 pour un 7
    2: 30,      // 30:1 pour un 2 (snake eyes)
    12: 30,     // 30:1 pour un 12 (box cars)
    doubles: 8, // 8:1 pour n'importe quelle paire
    other: 0    // Perdant pour les autres valeurs
  };
  
  // Empêcher la fermeture des stats lors du scroll
  useEffect(() => {
    const handleScroll = (e: Event) => {
      // Si on scrolle à l'intérieur du conteneur des stats, empêcher la propagation
      if (statsContentRef.current && statsContentRef.current.contains(e.target as Node)) {
        e.stopPropagation();
      }
    };
    
    // Capture en phase de capture pour intercepter avant la propagation
    document.addEventListener('wheel', handleScroll, { capture: true });
    document.addEventListener('touchmove', handleScroll, { capture: true });
    
    return () => {
      document.removeEventListener('wheel', handleScroll, { capture: true });
      document.removeEventListener('touchmove', handleScroll, { capture: true });
    };
  }, []);
  
  // Mise à jour des statistiques locales quand l'historique change
  useEffect(() => {
    if (gameHistory.length > 0) {
      const stats = gameHistory.reduce((acc, game) => {
        if (game.win) {
          acc.wins++;
          acc.totalWon += game.winAmount;
        } else {
          acc.losses++;
          acc.totalLost += game.bet;
        }
        return acc;
      }, {
        wins: 0,
        losses: 0,
        totalWon: 0,
        totalLost: 0
      });
      
      setLocalStats(stats);
    }
  }, [gameHistory]);
  
  // Animation du changement de solde
  const animateBalanceChange = (type: 'win' | 'lose', amount: number) => {
    setBalanceAnimation(type === 'win' ? 'balance-increase' : 'balance-decrease');
    
    // Réinitialiser l'animation après son exécution
    setTimeout(() => {
      setBalanceAnimation('');
    }, 1500);
  };
  
  // Chargement initial du solde et détection des changements
  useEffect(() => {
    if (currentUser) {
      // Fonction d'initialisation du solde
      const initializeBalance = async () => {
        try {
          // Essayer de trouver le solde dans différents emplacements
          const userBalance = await getUserBalance(currentUser.uid);
          setBalance(userBalance);
        } catch (error) {
          console.error("Erreur lors de l'initialisation du solde:", error);
        }
      };
      
      // Initialiser le solde
      initializeBalance();
      
      // Observer les changements de solde
      const userBalanceRef = ref(database, `users/${currentUser.uid}/balance`);
      const unsubscribeBalance = onValue(userBalanceRef, (snapshot) => {
        if (snapshot.exists()) {
          setBalance(snapshot.val());
        }
      });
      
      // Charger l'historique des parties
      const userGamesRef = ref(database, `users/${currentUser.uid}/games/dice/history`);
      const unsubscribeHistory = onValue(userGamesRef, (snapshot) => {
        if (snapshot.exists()) {
          const historyData = snapshot.val();
          // Convertir l'objet en tableau et trier par timestamp décroissant
          const historyArray = Object.values(historyData)
            .sort((a: any, b: any) => b.timestamp - a.timestamp)
            .slice(0, 10); // Garder les 10 dernières parties
          
          setGameHistory(historyArray as any);
        }
      });
      
      // Si userData est disponible et contient un solde
      if (userData && typeof userData === 'object' && 'balance' in userData) {
        setBalance(userData.balance as number);
      } else if (userData && typeof userData === 'object' && 'wallet' in userData && userData.wallet && typeof userData.wallet === 'object' && 'balance' in userData.wallet) {
        setBalance(userData.wallet.balance as number);
      }
      
      return () => {
        unsubscribeBalance();
        unsubscribeHistory();
      };
    }
  }, [currentUser, userData]);

  // Initialiser les statistiques du jeu si nécessaire
  useEffect(() => {
    const checkAndInitGameStats = async () => {
      if (isAdmin) {
        const statsRef = ref(database, 'diceGame/stats');
        const statsSnapshot = await get(statsRef);
        
        if (!statsSnapshot.exists()) {
          // Initialiser les stats
          await set(statsRef, {
            totalGames: 0,
            totalBets: 0,
            totalWagered: 0,
            totalPayout: 0,
            profitLoss: 0,
            biggestWin: 0
          });
          console.log("Statistiques du jeu de dés initialisées");
        }
      }
    };
    
    checkAndInitGameStats();
  }, [isAdmin]);
  
  // Mettre à jour les statistiques du jeu
  const updateGameStats = async (bet: number, winAmount: number) => {
    try {
      const statsRef = ref(database, 'diceGame/stats');
      const statsSnapshot = await get(statsRef);
      
      if (statsSnapshot.exists()) {
        const currentStats: DiceGameStats = statsSnapshot.val();
        
        // Calculer les nouvelles statistiques
        const isWin = winAmount > 0;
        const payout = isWin ? winAmount : 0;
        const newStats = {
          totalGames: currentStats.totalGames + 1,
          totalBets: currentStats.totalBets + 1,
          totalWagered: currentStats.totalWagered + bet,
          totalPayout: currentStats.totalPayout + payout,
          profitLoss: currentStats.totalWagered + bet - (currentStats.totalPayout + payout),
          biggestWin: Math.max(currentStats.biggestWin, payout)
        };
        
        // Mettre à jour les statistiques
        await update(statsRef, newStats);
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour des statistiques:", error);
    }
  };
  
  // Vérifier si l'utilisateur peut jouer
  const canPlay = () => {
    if (!currentUser) {
      setErrorMessage("Vous devez être connecté pour jouer");
      return false;
    }
    
    if (balance < betAmount) {
      setErrorMessage("Solde insuffisant pour placer cette mise");
      return false;
    }
    
    return true;
  };
  
  // Fonction pour formater un nombre avec séparateur de milliers
  const formatNumber = (num: number) => {
    return num.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
  };
  
  // Calculer le gain en fonction du résultat des dés
  const calculateWinnings = (dice1: number, dice2: number, bet: number): number => {
    const total = dice1 + dice2;
    const isDoubles = dice1 === dice2;
    
    // Appliquer les règles de gain
    if (total === 7) {
      return bet * PAYOUT_RULES[7] * (1 - HOUSE_EDGE);
    } else if (total === 2) {
      return bet * PAYOUT_RULES[2] * (1 - HOUSE_EDGE);
    } else if (total === 12) {
      return bet * PAYOUT_RULES[12] * (1 - HOUSE_EDGE);
    } else if (isDoubles) {
      return bet * PAYOUT_RULES.doubles * (1 - HOUSE_EDGE);
    } else {
      return 0; // Perdant
    }
  };
  
  // Obtenir la description du résultat
  const getResultDescription = (dice1: number, dice2: number) => {
    const total = dice1 + dice2;
    const isDoubles = dice1 === dice2;
    
    if (total === 7) return "Sept! (4:1)";
    if (total === 2) return "Snake Eyes! (30:1)";
    if (total === 12) return "Box Cars! (30:1)";
    if (isDoubles) return "Doubles! (8:1)";
    return "Perdu";
  };
  
  // Réinitialisation des champs
  const resetGame = () => {
    setGameResult(null);
    setErrorMessage(null);
  };
  
  // Augmenter la mise par paliers
  const increaseBet = () => {
    if (betAmount < 10) {
      setBetAmount(prev => Math.min(MAX_BET, prev + 1));
    } else if (betAmount < 50) {
      setBetAmount(prev => Math.min(MAX_BET, prev + 5));
    } else if (betAmount < 100) {
      setBetAmount(prev => Math.min(MAX_BET, prev + 10));
    } else {
      setBetAmount(prev => Math.min(MAX_BET, prev + 50));
    }
  };
  
  // Diminuer la mise par paliers
  const decreaseBet = () => {
    if (betAmount <= 10) {
      setBetAmount(prev => Math.max(MIN_BET, prev - 1));
    } else if (betAmount <= 50) {
      setBetAmount(prev => Math.max(MIN_BET, prev - 5));
    } else if (betAmount <= 100) {
      setBetAmount(prev => Math.max(MIN_BET, prev - 10));
    } else {
      setBetAmount(prev => Math.max(MIN_BET, prev - 50));
    }
  };
  
  // Définir la mise comme un pourcentage du solde
  const setBetAsPercentage = (percentage: number) => {
    const amount = Math.floor(balance * percentage / 100);
    setBetAmount(Math.max(MIN_BET, Math.min(MAX_BET, amount)));
  };
  
  // Ajouter une entrée à l'historique des parties
  const addToHistory = async (result: any) => {
    if (currentUser) {
      try {
        const historyRef = ref(database, `users/${currentUser.uid}/games/dice/history`);
        const newGameRef = push(historyRef);
        await set(newGameRef, {
          ...result,
          timestamp: Date.now()
        });
      } catch (error) {
        console.error("Erreur lors de l'ajout à l'historique:", error);
      }
    }
  };
  
  // Fonction pour lancer les dés
  const rollDice = async () => {
    if (!canPlay()) return;
    
    setIsRolling(true);
    setErrorMessage(null);
    
    // Animation des dés
    if (dice1Ref.current && dice2Ref.current) {
      dice1Ref.current.classList.add('rolling');
      dice2Ref.current.classList.add('rolling');
    }
    
    try {
      // Débiter la mise du solde uniquement si l'utilisateur est connecté
      if (currentUser) {
        // Vérifier à nouveau le solde pour éviter les problèmes de concurrence
        const currentBalance = await getUserBalance(currentUser.uid);
        if (currentBalance < betAmount) {
          setErrorMessage("Solde insuffisant pour placer cette mise");
          setIsRolling(false);
          if (dice1Ref.current && dice2Ref.current) {
            dice1Ref.current.classList.remove('rolling');
            dice2Ref.current.classList.remove('rolling');
          }
          return;
        }
      
        // Débiter la mise
        const newBalance = currentBalance - betAmount;
        await updateBalance(currentUser.uid, newBalance);
        
        // Animer la diminution du solde
        animateBalanceChange('lose', betAmount);
      } else {
        setErrorMessage("Vous devez être connecté pour jouer");
        setIsRolling(false);
        return;
      }
      
      // Attendre la fin de l'animation
      setTimeout(async () => {
        // Générer les résultats des dés
        const dice1Value = Math.floor(Math.random() * 6) + 1;
        const dice2Value = Math.floor(Math.random() * 6) + 1;
        const total = dice1Value + dice2Value;
        
        // Calculer les gains
        const winAmount = calculateWinnings(dice1Value, dice2Value, betAmount);
        const isWin = winAmount > 0;
        
        // Mettre à jour le résultat du jeu
        const result = {
          dice1: dice1Value,
          dice2: dice2Value,
          total,
          bet: betAmount,
          win: isWin,
          winAmount,
          timestamp: Date.now()
        };
        
        setGameResult({
          dice1: dice1Value,
          dice2: dice2Value,
          total,
          win: isWin,
          winAmount
        });
        
        // Si le joueur a gagné, ajouter les gains au solde
        if (isWin && currentUser) {
          // Récupérer le solde actuel pour éviter les problèmes de concurrence
          const updatedBalance = await getUserBalance(currentUser.uid);
          const finalBalance = updatedBalance + winAmount;
          await updateBalance(currentUser.uid, finalBalance);
          
          // Animer l'augmentation du solde
          animateBalanceChange('win', winAmount);
        }
        
        // Arrêter l'animation
        if (dice1Ref.current && dice2Ref.current) {
          dice1Ref.current.classList.remove('rolling');
          dice2Ref.current.classList.remove('rolling');
        }
        
        // Ajouter à l'historique et mettre à jour les statistiques
        if (currentUser) {
          await addToHistory(result);
          await updateGameStats(betAmount, winAmount);
        }
        
        // Terminer le jeu
        setIsRolling(false);
      }, 1500); // Durée de l'animation
    } catch (error) {
      console.error("Erreur lors du lancement des dés:", error);
      setIsRolling(false);
      setErrorMessage("Une erreur est survenue. Veuillez réessayer.");
      
      // Arrêter l'animation en cas d'erreur
      if (dice1Ref.current && dice2Ref.current) {
        dice1Ref.current.classList.remove('rolling');
        dice2Ref.current.classList.remove('rolling');
      }
    }
  };

  // Calcul du temps écoulé
  const getTimeAgo = (timestamp: number) => {
    const secondsAgo = Math.floor((Date.now() - timestamp) / 1000);
    
    if (secondsAgo < 60) return `${secondsAgo}s`;
    if (secondsAgo < 3600) return `${Math.floor(secondsAgo/60)}m`;
    if (secondsAgo < 86400) return `${Math.floor(secondsAgo/3600)}h`;
    return `${Math.floor(secondsAgo/86400)}j`;
  };

  return (
    <div className="dice-game">
      <h1 className="dice-game-title">Lucky Dice</h1>
      
      <div className={`user-balance ${balanceAnimation}`} ref={userBalanceRef}>
        <DollarSign size={18} />
        Solde: {formatNumber(balance)}€
      </div>
      
      <div className="dice-game-container">
        <div className="dice-game-controls">
          <h2>
            <Dice5 size={20} className="icon" />
            Placez votre mise
          </h2>
          
          <div className="bet-controls">
            <div className="bet-amount-control">
              <button 
                className="bet-btn" 
                onClick={decreaseBet}
                disabled={betAmount <= MIN_BET}
              >
                <Minus size={20} />
              </button>
              
              <input 
                type="number" 
                min={MIN_BET}
                max={MAX_BET}
                value={betAmount}
                onChange={(e) => setBetAmount(Number(e.target.value))}
                className="bet-input"
              />
              
              <button 
                className="bet-btn" 
                onClick={increaseBet}
                disabled={betAmount >= MAX_BET}
              >
                <Plus size={20} />
              </button>
            </div>
            
            <div className="bet-percentage-buttons">
              <button onClick={() => setBetAsPercentage(10)}>10%</button>
              <button onClick={() => setBetAsPercentage(25)}>25%</button>
              <button onClick={() => setBetAsPercentage(50)}>50%</button>
              <button onClick={() => setBetAsPercentage(100)}>Max</button>
            </div>
            
            <button 
              className="roll-button"
              disabled={isRolling || !currentUser || balance < betAmount}
              onClick={rollDice}
            >
              {isRolling ? (
                <>
                  <RefreshCw size={18} className="spinning-icon" />
                  Lancement...
                </>
              ) : (
                <>
                  <Dice5 size={18} />
                  Lancer les dés
                </>
              )}
            </button>
            
            {errorMessage && <div className="error-message">{errorMessage}</div>}
          </div>
          
          <div className="game-rules">
            <h3>
              <Award size={18} className="icon" />
              Règles du jeu
            </h3>
            <ul>
              <li>7: Gain 4:1</li>
              <li>2 (Snake Eyes): Gain 30:1</li>
              <li>12 (Box Cars): Gain 30:1</li>
              <li>Doubles: Gain 8:1</li>
              <li>Autres: Perdu</li>
            </ul>
          </div>
          
          <button 
            className="stats-toggle-button"
            onClick={() => setShowStats(!showStats)}
          >
            <BarChart2 size={16} />
            {showStats ? "Masquer mes statistiques" : "Voir mes statistiques"}
          </button>
          
          {showStats && (
            <div className="player-stats" ref={statsContentRef}>
              <div className="stats-grid">
                <div className="stat-item">
                  <span className="stat-label">Parties</span>
                  <span className="stat-value">{localStats.wins + localStats.losses}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Victoires</span>
                  <span className="stat-value win">{localStats.wins}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Défaites</span>
                  <span className="stat-value loss">{localStats.losses}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Total Gagné</span>
                  <span className="stat-value win">{formatNumber(localStats.totalWon)}€</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Total Perdu</span>
                  <span className="stat-value loss">{formatNumber(localStats.totalLost)}€</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Bilan</span>
                  <span className={`stat-value ${localStats.totalWon - localStats.totalLost >= 0 ? 'win' : 'loss'}`}>
                    {formatNumber(localStats.totalWon - localStats.totalLost)}€
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="dice-game-board">
          <div className="dice-container">
            <div className="dice" ref={dice1Ref} data-value={gameResult?.dice1 || 1}></div>
            <div className="dice" ref={dice2Ref} data-value={gameResult?.dice2 || 1}></div>
          </div>
          
          {gameResult && (
            <div className="game-result">
              <h2 className={gameResult.win ? "win-text" : "lose-text"}>
                {gameResult.win ? `Gagné: +${formatNumber(gameResult.winAmount)}€` : "Perdu!"}
              </h2>
              <p className="result-description">
                {getResultDescription(gameResult.dice1, gameResult.dice2)}
              </p>
              <p className="dice-sum">Total: {gameResult.total}</p>
            </div>
          )}
          
          {gameHistory.length > 0 && (
            <div className="game-history">
              <h3>
                <Clock size={18} className="icon" />
                Historique des parties
              </h3>
              <div className="history-list">
                {gameHistory.map((game, index) => (
                  <div key={index} className={`history-item ${game.win ? 'win' : 'loss'}`}>
                    <div className="history-info">
                      <span className="dice-result">{game.dice1 + game.dice2}</span>
                      <span className="dice-detail">({game.dice1}, {game.dice2})</span>
                    </div>
                    <div className="history-middle">
                      <span className="bet-amount">Mise: {game.bet}€</span>
                    </div>
                    <div className="history-right">
                      <span className={`result-amount ${game.win ? 'win' : 'loss'}`}>
                        {game.win ? `+${formatNumber(game.winAmount)}€` : `-${formatNumber(game.bet)}€`}
                      </span>
                      <span className="time-ago">{getTimeAgo(game.timestamp)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DiceGame; 