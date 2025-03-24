import React, { useState, useEffect, useRef } from 'react';
import { database } from '../../../firebase/config';
import { ref, onValue, update, push, set, get } from 'firebase/database';
import { useAuth } from '../../../contexts/AuthContext';
import './DiceGame.css';

// Fonction pour récupérer le solde de l'utilisateur
const getUserBalance = async (userId: string): Promise<number> => {
  try {
    const balanceRef = ref(database, `users/${userId}/balance`);
    const snapshot = await get(balanceRef);
    return snapshot.exists() ? snapshot.val() : 0;
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
  
  // Références pour l'animation
  const dice1Ref = useRef<HTMLDivElement>(null);
  const dice2Ref = useRef<HTMLDivElement>(null);

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
  
  // Chargement du solde utilisateur et de l'historique des parties
  useEffect(() => {
    if (currentUser) {
      // Charger le solde
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
      
      return () => {
        unsubscribeBalance();
        unsubscribeHistory();
      };
    }
  }, [currentUser]);
  
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
        console.log("Statistiques du jeu mises à jour:", newStats);
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
      // Débiter la mise du solde
      const newBalance = balance - betAmount;
      await updateBalance(currentUser!.uid, newBalance);
      setBalance(newBalance);
      
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
        if (isWin) {
          const finalBalance = newBalance + winAmount;
          await updateBalance(currentUser!.uid, finalBalance);
          setBalance(finalBalance);
        }
        
        // Arrêter l'animation
        if (dice1Ref.current && dice2Ref.current) {
          dice1Ref.current.classList.remove('rolling');
          dice2Ref.current.classList.remove('rolling');
        }
        
        // Ajouter à l'historique et mettre à jour les statistiques
        await addToHistory(result);
        await updateGameStats(betAmount, winAmount);
        
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

  return (
    <div className="dice-game">
      <h1 className="dice-game-title">Lucky Dice</h1>
      
      <div className="user-balance">
        Solde: {balance.toFixed(2)}€
      </div>
      
      <div className="dice-game-container">
        <div className="dice-game-controls">
          <h2>Placez votre mise</h2>
          <div className="bet-controls">
            <div className="bet-amount-control">
              <button className="bet-btn" onClick={() => setBetAmount(prev => Math.max(MIN_BET, prev - 5))}>-</button>
              <input 
                type="number" 
                min={MIN_BET}
                max={MAX_BET}
                value={betAmount}
                onChange={(e) => setBetAmount(Number(e.target.value))}
                className="bet-input"
              />
              <button className="bet-btn" onClick={() => setBetAmount(prev => Math.min(MAX_BET, prev + 5))}>+</button>
            </div>
            
            <button 
              className="roll-button"
              disabled={isRolling || !currentUser || balance < betAmount}
              onClick={rollDice}
            >
              {isRolling ? 'Lancement...' : 'Lancer les dés'}
            </button>
            
            {errorMessage && <div className="error-message">{errorMessage}</div>}
          </div>
          
          <div className="game-rules">
            <h3>Règles du jeu</h3>
            <ul>
              <li>7: Gain 4:1</li>
              <li>2 (Snake Eyes): Gain 30:1</li>
              <li>12 (Box Cars): Gain 30:1</li>
              <li>Doubles: Gain 8:1</li>
              <li>Autres: Perdu</li>
            </ul>
          </div>
        </div>
        
        <div className="dice-game-board">
          <div className="dice-container">
            <div className="dice" ref={dice1Ref} data-value={gameResult?.dice1 || 1}></div>
            <div className="dice" ref={dice2Ref} data-value={gameResult?.dice2 || 1}></div>
          </div>
          
          {gameResult && (
            <div className="game-result">
              <h2 className={gameResult.win ? "win-text" : "lose-text"}>
                {gameResult.win ? `Gagné: +${gameResult.winAmount.toFixed(2)}€` : "Perdu!"}
              </h2>
              <p>Total: {gameResult.total}</p>
            </div>
          )}
          
          {gameHistory.length > 0 && (
            <div className="game-history">
              <h3>Historique des parties</h3>
              <div className="history-list">
                {gameHistory.map((game, index) => (
                  <div key={index} className={`history-item ${game.win ? 'win' : 'loss'}`}>
                    <span className="dice-result">{game.dice1 + game.dice2}</span>
                    <span className="dice-detail">({game.dice1}, {game.dice2})</span>
                    <span className={`result-amount ${game.win ? 'win' : 'loss'}`}>
                      {game.win ? `+${game.winAmount.toFixed(2)}€` : `-${game.bet.toFixed(2)}€`}
                    </span>
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