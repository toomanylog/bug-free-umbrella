import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { database } from '../../../firebase/config';
import { ref, set, get, push, update } from 'firebase/database';
import { Check, Coins, CreditCard, DollarSign, History, Info, Keyboard, Trophy, Users, Volume2, VolumeX } from 'lucide-react';
import './CrashGame.css';
import { User } from 'firebase/auth';
import { UserData } from '../../../firebase/auth';

// Types
interface BetHistory {
  id: string;
  userId: string;
  userName: string;
  amount: number;
  cashoutMultiplier?: number;
  profit?: number;
  timestamp: number;
  isCashedOut: boolean;
}

interface UserBet {
  id: string;
  userId: string;
  amount: number;
  timestamp: number;
  autoCashout?: number;
}

interface CrashState {
  status: 'waiting' | 'running' | 'crashed';
  startTime: number | null;
  crashTime: number | null;
  crashMultiplier: number | null;
  bets: UserBet[];
  crashHistory: number[];
}

const DEFAULT_STATE: CrashState = {
  status: 'waiting',
  startTime: null,
  crashTime: null,
  crashMultiplier: null,
  bets: [],
  crashHistory: []
};

const SOUNDS = {
  betPlace: `/sounds/bet-place.mp3`,
  cashOut: `/sounds/cash-out.mp3`,
  crash: `/sounds/crash.mp3`,
  success: `/sounds/success.mp3`,
  gameStart: `/sounds/game-start.mp3`
};

const HOUSE_EDGE = 0.15; // 15% d'avantage pour la maison
const MIN_BET = 5; // Mise minimale en EUR
const MAX_BET = 5000; // Mise maximale en EUR
const GAME_TIMER = 5; // Secondes d'attente entre les parties
const MAX_MULTIPLIER = 100; // Multiplicateur maximum théorique

// Composant de secours en cas d'erreur d'authentification
const AuthErrorFallback = () => (
  <div className="crash-game-error bg-gray-800 text-white p-4 rounded-lg">
    <h2 className="text-xl font-bold mb-2">Erreur de chargement</h2>
    <p>Impossible de charger le contexte d'authentification. Veuillez rafraîchir la page ou vous reconnecter.</p>
    <div className="mt-4">
      <a href="/" className="text-blue-400 hover:text-blue-300">Retour à l'accueil</a>
    </div>
  </div>
);

// Composant de secours pour utilisateur non connecté
const LoginRequired = () => (
  <div className="crash-game-error bg-gray-800 text-white p-4 rounded-lg">
    <h2 className="text-xl font-bold mb-2">Connexion requise</h2>
    <p>Vous devez être connecté pour jouer. Veuillez vous connecter ou créer un compte.</p>
    <div className="mt-4">
      <a href="/login" className="text-blue-400 hover:text-blue-300">Se connecter</a>
    </div>
  </div>
);

// Initialiser les sons - déplacé à l'extérieur du composant pour éviter les problèmes de références
const initializeSounds = () => {
  const soundElements: { [key: string]: HTMLAudioElement } = {};
  const soundFiles = [
    { id: 'betPlace', file: '/bet-place.mp3', fallback: '/success.mp3' },
    { id: 'cashOut', file: '/cash-out.mp3', fallback: '/success.mp3' },
    { id: 'crash', file: '/crash.mp3', fallback: '/success.mp3' },
    { id: 'success', file: '/success.mp3', fallback: '/success.mp3' },
    { id: 'gameStart', file: '/game-start.mp3', fallback: '/success.mp3' }
  ];

  soundFiles.forEach(({ id, file, fallback }) => {
    try {
      const audio = new Audio(`${process.env.PUBLIC_URL}/sounds${file}`);
      // Vérifier si le son existe, sinon utiliser le fallback
      audio.addEventListener('error', () => {
        console.warn(`Erreur lors du chargement du son ${file}, utilisation du son de fallback`);
        soundElements[id] = new Audio(`${process.env.PUBLIC_URL}/sounds${fallback}`);
      });
      soundElements[id] = audio;
    } catch (error) {
      console.warn(`Erreur lors de l'initialisation du son ${file}:`, error);
      try {
        // Utiliser le fallback si le son principal a échoué
        soundElements[id] = new Audio(`${process.env.PUBLIC_URL}/sounds${fallback}`);
      } catch (fallbackError) {
        console.error(`Erreur avec le son de fallback ${fallback}:`, fallbackError);
      }
    }
  });

  return {
    playSound: (id: string) => {
      try {
        if (soundElements[id]) {
          soundElements[id].currentTime = 0;
          const playPromise = soundElements[id].play();
          if (playPromise !== undefined) {
            playPromise.catch(error => {
              console.warn(`Erreur lors de la lecture du son ${id}:`, error);
            });
          }
        }
      } catch (error) {
        console.warn(`Erreur lors de la lecture du son ${id}:`, error);
      }
    }
  };
};

const CrashGame: React.FC = () => {
  try {
    // On récupère le contexte d'authentification de manière sécurisée
    const auth = useAuth();
    const currentUser: User | null = auth?.currentUser || null;
    const userData: UserData | null = auth?.userData || null;
    const isAdmin: boolean = auth?.isAdmin || false;
    
    // Si l'utilisateur n'est pas connecté, afficher le message approprié
    if (!currentUser) {
      return <LoginRequired />;
    }
    
    // État du jeu
    const [gameState, setGameState] = useState<CrashState>(DEFAULT_STATE);
    const [betAmount, setBetAmount] = useState<number>(MIN_BET);
    const [autoCashout, setAutoCashout] = useState<number | null>(null);
    const [currentMultiplier, setCurrentMultiplier] = useState<number>(1.00);
    const [userBet, setUserBet] = useState<UserBet | null>(null);
    const [isCashedOut, setIsCashedOut] = useState<boolean>(false);
    const [betHistory, setBetHistory] = useState<BetHistory[]>([]);
    const [userBalance, setUserBalance] = useState<number>(0);
    const [countDown, setCountDown] = useState<number | null>(null);
    const [message, setMessage] = useState<{text: string, type: 'error' | 'success' | 'info'} | null>(null);
    const [isMuted, setIsMuted] = useState<boolean>(false);
    const [hotBets, setHotBets] = useState<number[]>([10, 50, 100, 200]);
    const [showHistory, setShowHistory] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [timeUntilNextGame, setTimeUntilNextGame] = useState<number>(0);
    const [animation, setAnimation] = useState<any>(null);
    const [crashHistory, setCrashHistory] = useState<number[]>([]);
    const [liveBets, setLiveBets] = useState<UserBet[]>([]);
    const [showMessage, setShowMessage] = useState<{show: boolean, type: string, message: string}>({show: false, type: '', message: ''});

    const animationRef = useRef<number | null>(null);
    const lastUpdateTimeRef = useRef<number>(0);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const crashTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const { playSound } = useMemo(() => initializeSounds(), []);
  
    // Charger les données du portefeuille de l'utilisateur
    const loadUserBalance = useCallback(async () => {
      if (!currentUser) return;
      
      try {
        const walletRef = ref(database, `wallets/${currentUser.uid}`);
        const snapshot = await get(walletRef);
        
        if (snapshot.exists()) {
          const walletData = snapshot.val();
          setUserBalance(walletData.balance || 0);
        } else {
          setUserBalance(0);
        }
      } catch (error) {
        console.error("Erreur lors du chargement du solde:", error);
      }
    }, [currentUser]);

    // Initialiser le jeu
    useEffect(() => {
      loadUserBalance();
      loadGameState();
      loadBetHistory();
      
      // Nettoyer les ressources lors du démontage
      return () => {
        if (crashTimeoutRef.current) {
          clearTimeout(crashTimeoutRef.current);
        }
        if (animationRef.current !== null) {
          window.cancelAnimationFrame(animationRef.current);
        }
      };
    }, [currentUser, loadUserBalance]);

    // Charger l'état actuel du jeu
    const loadGameState = async () => {
      try {
        setIsLoading(true);
        const gameStateRef = ref(database, 'crashGame/currentGame');
        const snapshot = await get(gameStateRef);
        
        if (snapshot.exists()) {
          const state = snapshot.val() as CrashState;
          // S'assurer que bets est toujours un tableau
          if (!state.bets) state.bets = [];
          setGameState(state);
          
          // Si le jeu est en cours, commencer l'animation
          if (state.status === 'running' && state.startTime) {
            startAnimation();
          }
          
          // Vérifier si l'utilisateur a déjà un pari en cours
          if (currentUser && state.bets) {
            // Stocker l'ID de l'utilisateur dans une constante pour éviter l'erreur TypeScript
            const userId = currentUser.uid;
            const userBetFound = state.bets.find(bet => bet.userId === userId);
            if (userBetFound) {
              setUserBet(userBetFound);
              setBetAmount(userBetFound.amount);
              setAutoCashout(userBetFound.autoCashout || null);
            }
          }
          
          // Charger l'historique des crashs
          if (state.crashHistory) {
            setGameState(prev => ({
              ...prev,
              crashHistory: state.crashHistory
            }));
          }
        } else {
          // Créer un nouvel état de jeu
          await initializeNewGame();
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error("Erreur lors du chargement de l'état du jeu:", error);
        setIsLoading(false);
      }
    };

    // Initialiser un nouveau jeu
    const initializeNewGame = async () => {
      const newState: CrashState = {
        status: 'waiting',
        startTime: null,
        crashTime: null,
        crashMultiplier: null,
        bets: [],
        crashHistory: gameState.crashHistory || []
      };
      
      await set(ref(database, 'crashGame/currentGame'), newState);
      setGameState(newState);
      startCountdown();
    };

    // Charger l'historique des paris
    const loadBetHistory = async () => {
      try {
        const historyRef = ref(database, 'crashGame/betHistory');
        const snapshot = await get(historyRef);
        
        if (snapshot.exists()) {
          const history = snapshot.val();
          const historyArray: BetHistory[] = Object.values(history);
          
          // Trier par timestamp descendant (plus récent en premier)
          historyArray.sort((a, b) => b.timestamp - a.timestamp);
          
          // Limiter à 50 entrées
          setBetHistory(historyArray.slice(0, 50));
        }
      } catch (error) {
        console.error("Erreur lors du chargement de l'historique:", error);
      }
    };

    // Démarrer le compte à rebours
    const startCountdown = () => {
      setCountDown(GAME_TIMER);
      
      const timer = setInterval(() => {
        setCountDown(prev => {
          if (prev === null || prev <= 1) {
            clearInterval(timer);
            startGame();
            return null;
          }
          return prev - 1;
        });
      }, 1000);
    };

    // Démarrer le jeu
    const startGame = async () => {
      if (!isMuted) playSound('gameStart');
      
      // Générer un crashpoint aléatoire avec l'avantage de la maison
      const crashPoint = generateCrashPoint();
      const startTime = Date.now();
      const crashTimeMs = calculateCrashTimeFromMultiplier(crashPoint);
      
      const updatedState: CrashState = {
        ...gameState,
        status: 'running',
        startTime,
        crashTime: startTime + crashTimeMs,
        crashMultiplier: crashPoint,
      };
      
      await update(ref(database, 'crashGame/currentGame'), {
        status: 'running',
        startTime,
        crashTime: startTime + crashTimeMs,
        crashMultiplier: crashPoint
      });
      
      setGameState(updatedState);
      startAnimation();
      
      // Programmer le crash
      crashTimeoutRef.current = setTimeout(() => {
        handleCrash(crashPoint);
      }, crashTimeMs);
    };

    // Générer un point de crash aléatoire
    const generateCrashPoint = (): number => {
      // Formule pour générer des crashpoints réalistes avec l'avantage de la maison
      // Plus la valeur est élevée, plus elle est rare
      
      // Chance de crasher à 1.00x (jeu immédiatement perdu)
      // C'est une partie de l'avantage de la maison
      if (Math.random() < 0.01) return 1.00;
      
      const rand = Math.random();
      // Utiliser une distribution exponentielle pour créer la courbe typique des jeux crash
      const multiplier = 0.9 / (rand * (1 - HOUSE_EDGE)) + 1;
      
      // Limiter le multiplicateur maximum possible
      return Math.min(multiplier, MAX_MULTIPLIER);
    };

    // Calculer le temps jusqu'au crash basé sur le multiplicateur
    const calculateCrashTimeFromMultiplier = (multiplier: number): number => {
      // Temps en ms. Plus le multiplicateur est élevé, plus le temps est long
      // Logarithmique pour avoir une courbe exponentielle typique
      const baseTime = 1500; // Temps de base en ms
      const logBase = 1.1; // Base logarithmique pour contrôler la vitesse d'accélération
      
      if (multiplier <= 1) return 0;
      
      // Formule logarithmique pour une courbe exponentielle
      const timeMs = baseTime * Math.log(multiplier) / Math.log(logBase);
      return Math.max(1000, Math.round(timeMs)); // Au moins 1 seconde
    };

    // Démarrer l'animation de la courbe
    const startAnimation = () => {
      if (!gameState.startTime) return;
      
      lastUpdateTimeRef.current = performance.now();
      setCurrentMultiplier(1.00);
      
      const animate = (timestamp: number) => {
        const elapsed = timestamp - lastUpdateTimeRef.current;
        lastUpdateTimeRef.current = timestamp;
        
        if (gameState.status === 'running' && gameState.startTime) {
          const timeSinceStart = Date.now() - gameState.startTime;
          const newMultiplier = calculateMultiplierAtTime(timeSinceStart);
          
          setCurrentMultiplier(newMultiplier);
          drawCurve(newMultiplier);
          
          // Vérifier l'auto-cashout
          if (userBet && autoCashout && newMultiplier >= autoCashout && !isCashedOut) {
            cashOut();
          }
          
          animationRef.current = window.requestAnimationFrame(animate);
        }
      };
      
      animationRef.current = window.requestAnimationFrame(animate);
    };

    // Calculer le multiplicateur à un moment donné
    const calculateMultiplierAtTime = (timeMs: number): number => {
      // Formule logarithmique inverse de calculateCrashTimeFromMultiplier
      const baseTime = 1500;
      const logBase = 1.1;
      
      const multiplier = Math.pow(logBase, timeMs / baseTime);
      return Math.max(1, parseFloat(multiplier.toFixed(2)));
    };

    // Dessiner la courbe sur le canvas
    const drawCurve = (currentMultiplier: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      // Redimensionner le canvas pour correspondre à sa taille affichée
      const rect = canvas.getBoundingClientRect();
      if (canvas.width !== rect.width || canvas.height !== rect.height) {
        canvas.width = rect.width;
        canvas.height = rect.height;
      }
      
      const width = canvas.width;
      const height = canvas.height;
      
      // Effacer le canvas
      ctx.clearRect(0, 0, width, height);
      
      // Dessiner le fond
      ctx.fillStyle = 'rgba(17, 24, 39, 0.7)';
      ctx.fillRect(0, 0, width, height);
      
      // Points pour dessiner la courbe
      const points: [number, number][] = [];
      
      // Calculer les points de la courbe
      const numPoints = 100;
      const maxShownMultiplier = Math.max(currentMultiplier, 2); // Au moins montrer jusqu'à 2x
      
      for (let i = 0; i <= numPoints; i++) {
        const multiplier = 1 + (i / numPoints) * (maxShownMultiplier - 1);
        const x = (i / numPoints) * width;
        // Inverser l'axe Y car les coordonnées du canvas commencent en haut
        const y = height - ((multiplier - 1) / (maxShownMultiplier - 1)) * height * 0.8;
        points.push([x, y]);
      }
      
      // Dessiner la courbe
      ctx.beginPath();
      ctx.moveTo(0, height);
      
      // Ajouter le point de départ à (0, height - 0)
      points.unshift([0, height]);
      
      // Dessiner la courbe à travers tous les points
      for (let i = 0; i < points.length; i++) {
        ctx.lineTo(points[i][0], points[i][1]);
      }
      
      // Dessiner le gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, 'rgba(59, 130, 246, 0.8)'); // Bleu en haut
      gradient.addColorStop(1, 'rgba(17, 24, 39, 0.1)'); // Transparent en bas
      
      ctx.lineTo(width, height);
      ctx.closePath();
      ctx.fillStyle = gradient;
      ctx.fill();
      
      // Dessiner la ligne de la courbe
      ctx.beginPath();
      ctx.moveTo(points[1][0], points[1][1]); // Premier point après le point d'ancrage
      
      for (let i = 2; i < points.length; i++) {
        ctx.lineTo(points[i][0], points[i][1]);
      }
      
      ctx.strokeStyle = 'rgba(96, 165, 250, 0.8)';
      ctx.lineWidth = 3;
      ctx.stroke();
      
      // Dessiner le point actuel
      const currentPointX = width;
      const currentPointY = points[points.length - 1][1];
      
      ctx.beginPath();
      ctx.arc(currentPointX, currentPointY, 8, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(239, 68, 68, 0.9)';
      ctx.fill();
      
      // Dessiner le texte du multiplicateur
      ctx.font = 'bold 32px Inter, sans-serif';
      ctx.fillStyle = isCashedOut ? '#10B981' : '#F59E0B';
      ctx.textAlign = 'center';
      
      const multiplierText = `${currentMultiplier.toFixed(2)}×`;
      ctx.fillText(multiplierText, width / 2, height / 2);
      
      // Dessiner le message sous le multiplicateur
      ctx.font = '16px Inter, sans-serif';
      ctx.fillStyle = '#E5E7EB';
      
      let statusText = '';
      if (gameState.status === 'waiting') {
        statusText = 'En attente de la prochaine partie...';
      } else if (gameState.status === 'running') {
        if (userBet && !isCashedOut) {
          statusText = 'Cliquez sur ENCAISSER pour sécuriser vos gains!';
        } else if (isCashedOut) {
          statusText = 'Gains sécurisés!';
        } else {
          statusText = 'La fusée décolle!';
        }
      } else if (gameState.status === 'crashed') {
        statusText = 'CRASH!';
      }
      
      ctx.fillText(statusText, width / 2, height / 2 + 30);
    };

    // Gérer le crash
    const handleCrash = async (crashPoint: number) => {
      if (!isMuted) playSound('crash');
      
      // Arrêter l'animation
      if (animationRef.current !== null) {
        window.cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      
      // Mettre à jour l'état du jeu
      await update(ref(database, 'crashGame/currentGame'), {
        status: 'crashed',
        crashMultiplier: crashPoint
      });
      
      setGameState(prev => {
        // Ajouter ce crash à l'historique
        const updatedHistory = [crashPoint, ...(prev.crashHistory || [])].slice(0, 10);
        
        // Mettre à jour la base de données avec le nouvel historique
        update(ref(database, 'crashGame/currentGame'), {
          crashHistory: updatedHistory
        });
        
        return {
          ...prev,
          status: 'crashed',
          crashMultiplier: crashPoint,
          crashHistory: updatedHistory
        };
      });
      
      // Mettre à jour l'interface avec le multiplicateur final
      setCurrentMultiplier(crashPoint);
      drawCurve(crashPoint);
      
      // Après un délai, préparer la prochaine partie
      setTimeout(() => {
        initializeNewGame();
        setUserBet(null);
        setIsCashedOut(false);
        loadBetHistory();
        loadUserBalance();
      }, 2000);
    };

    // Placer un pari
    const placeBet = async () => {
      if (!currentUser) {
        setMessage({ text: "Veuillez vous connecter pour jouer", type: 'error' });
        return;
      }
      
      if (gameState.status !== 'waiting') {
        setMessage({ text: "Les paris ne sont acceptés qu'avant le début de la partie", type: 'error' });
        return;
      }
      
      if (betAmount < MIN_BET) {
        setMessage({ text: `La mise minimale est de ${MIN_BET} €`, type: 'error' });
        return;
      }
      
      if (betAmount > MAX_BET) {
        setMessage({ text: `La mise maximale est de ${MAX_BET} €`, type: 'error' });
        return;
      }
      
      if (betAmount > userBalance) {
        setMessage({ text: "Solde insuffisant", type: 'error' });
        return;
      }
      
      try {
        // Vérifier si l'utilisateur a déjà un pari en cours
        const userId = currentUser.uid;
        const existingBet = gameState.bets?.find(bet => bet.userId === userId);
        if (existingBet) {
          setMessage({ text: "Vous avez déjà placé un pari pour cette partie", type: 'error' });
          return;
        }
        
        if (!isMuted) playSound('betPlace');
        
        // Créer un nouveau pari
        const newBet: UserBet = {
          id: `${currentUser.uid}-${Date.now()}`,
          userId: currentUser.uid,
          amount: betAmount,
          timestamp: Date.now(),
          autoCashout: autoCashout || undefined
        };
        
        // Mettre à jour l'état du jeu avec le nouveau pari
        const updatedBets = [...(gameState.bets || []), newBet];
        
        await update(ref(database, 'crashGame/currentGame'), {
          bets: updatedBets
        });
        
        // Débiter le solde du joueur
        const walletRef = ref(database, `wallets/${currentUser.uid}`);
        const walletSnapshot = await get(walletRef);
        
        if (walletSnapshot.exists()) {
          const walletData = walletSnapshot.val();
          const newBalance = (walletData.balance || 0) - betAmount;
          
          await update(walletRef, {
            balance: newBalance,
            lastUpdated: new Date().toISOString()
          });
          
          setUserBalance(newBalance);
        }
        
        setUserBet(newBet);
        setGameState(prev => ({
          ...prev,
          bets: updatedBets
        }));
        
        setMessage({ text: "Pari placé avec succès", type: 'success' });
      } catch (error) {
        console.error("Erreur lors du placement du pari:", error);
        setMessage({ text: "Une erreur est survenue lors du placement du pari", type: 'error' });
      }
    };

    // Encaisser les gains
    const cashOut = async () => {
      if (!currentUser || !userBet || isCashedOut || gameState.status !== 'running') {
        return;
      }
      
      try {
        if (!isMuted) playSound('cashOut');
        
        // Calculer les gains
        const profit = userBet.amount * (currentMultiplier - 1);
        const totalWin = userBet.amount + profit;
        
        // Mettre à jour le solde du joueur
        const walletRef = ref(database, `wallets/${currentUser.uid}`);
        const walletSnapshot = await get(walletRef);
        
        if (walletSnapshot.exists()) {
          const walletData = walletSnapshot.val();
          const newBalance = (walletData.balance || 0) + totalWin;
          
          await update(walletRef, {
            balance: newBalance,
            lastUpdated: new Date().toISOString()
          });
          
          setUserBalance(newBalance);
        }
        
        // Enregistrer dans l'historique des paris
        const betHistoryRef = ref(database, 'crashGame/betHistory');
        const newHistoryRef = push(betHistoryRef);
        
        const historyEntry: BetHistory = {
          id: newHistoryRef.key || '',
          userId: currentUser.uid,
          userName: userData?.displayName || currentUser.email || 'Joueur',
          amount: userBet.amount,
          cashoutMultiplier: currentMultiplier,
          profit: profit,
          timestamp: Date.now(),
          isCashedOut: true
        };
        
        await set(newHistoryRef, historyEntry);
        
        setIsCashedOut(true);
        if (!isMuted) playSound('success');
        setMessage({ text: `Vous avez gagné ${profit.toFixed(2)} €!`, type: 'success' });
      } catch (error) {
        console.error("Erreur lors de l'encaissement:", error);
        setMessage({ text: "Une erreur est survenue lors de l'encaissement", type: 'error' });
      }
    };

    // Gérer le changement de mise
    const handleBetAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = parseInt(e.target.value);
      if (!isNaN(value)) {
        setBetAmount(value);
      } else {
        setBetAmount(0);
      }
    };

    // Gérer le changement d'auto-cashout
    const handleAutoCashoutChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = parseFloat(e.target.value);
      if (!isNaN(value)) {
        setAutoCashout(value);
      } else {
        setAutoCashout(null);
      }
    };

    // Formater le nombre avec 2 décimales
    const formatNumber = (num: number): string => {
      return num.toFixed(2);
    };

    // Formater un nombre avec une taille plus réduite
    const formatCompactNumber = (num: number): string => {
      if (num >= 1000000) {
        return `${(num / 1000000).toFixed(1)}M`;
      }
      if (num >= 1000) {
        return `${(num / 1000).toFixed(1)}K`;
      }
      return num.toString();
    };

    // Convertir un timestamp en heure locale
    const formatTime = (timestamp: number): string => {
      return new Date(timestamp).toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    };

    // Définir la couleur du multiplicateur
    const getMultiplierColor = (multiplier: number): string => {
      if (multiplier < 1.5) return 'text-red-500';
      if (multiplier < 2) return 'text-yellow-500';
      if (multiplier < 3) return 'text-green-500';
      if (multiplier < 5) return 'text-blue-500';
      return 'text-purple-500';
    };

    // Nettoyer les messages
    useEffect(() => {
      if (message) {
        const timer = setTimeout(() => {
          setMessage(null);
        }, 3000);
        
        return () => clearTimeout(timer);
      }
    }, [message]);

    // Mettre à jour le canvas quand le multiplicateur change
    useEffect(() => {
      drawCurve(currentMultiplier);
    }, [currentMultiplier]);

    // Gérer le changement de statut audio
    const toggleMute = () => {
      setIsMuted(!isMuted);
    };

    // Mise rapide avec montants prédéfinis
    const handleQuickBet = (amount: number) => {
      setBetAmount(amount);
    };

    // Initialisation du son optimisée pour ne pas bloquer en cas d'erreur
    useEffect(() => {
      const soundsManager = initializeSounds();
      
      return () => {
        // Cleanup des sons si nécessaire
        if (animationRef.current !== null) {
          window.cancelAnimationFrame(animationRef.current);
          animationRef.current = null;
        }
      };
    }, []);

    return (
      <div className="crash-game">
        {isLoading && (
          <div className="loading-overlay">
            <div className="loading-spinner"></div>
            <p>Chargement du jeu...</p>
          </div>
        )}
        
        <div className="crash-game-container">
          <div className="game-header">
            <h1 className="game-title">Rocket Crash</h1>
            
            <div className="game-controls">
              <button 
                className="control-button"
                onClick={toggleMute} 
                aria-label={isMuted ? "Activer le son" : "Couper le son"}
              >
                {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
              </button>
              
              <button 
                className="control-button"
                onClick={() => setShowHistory(!showHistory)}
                aria-label={showHistory ? "Masquer l'historique" : "Afficher l'historique"}
              >
                <History size={20} />
              </button>
              
              <button 
                className="control-button"
                aria-label="Aide"
                onClick={() => setMessage({ 
                  text: "Placez une mise, attendez que la fusée décolle et encaissez vos gains avant le crash!", 
                  type: 'info' 
                })}
              >
                <Info size={20} />
              </button>
            </div>
          </div>
          
          <div className="game-main">
            <div className="game-canvas-container">
              <canvas 
                ref={canvasRef} 
                className="game-canvas"
              ></canvas>
              
              {countDown !== null && (
                <div className="countdown-overlay">
                  <div className="countdown">{countDown}</div>
                  <p>Prochaine partie dans...</p>
                </div>
              )}
            </div>
            
            <div className="game-sidebar">
              <div className="user-balance">
                <h3>
                  <CreditCard size={16} className="inline-icon" />
                  <span>Solde</span>
                </h3>
                <p className="balance-amount">{formatNumber(userBalance)} €</p>
              </div>
              
              <div className="bet-controls">
                <h3>Votre mise</h3>
                
                <div className="bet-input-container">
                  <input
                    type="number"
                    min={MIN_BET}
                    max={MAX_BET}
                    value={betAmount}
                    onChange={handleBetAmountChange}
                    disabled={gameState.status !== 'waiting' || userBet !== null}
                    className="bet-input"
                  />
                  <span className="bet-currency">€</span>
                </div>
                
                <div className="quick-bet-buttons">
                  {hotBets.map(amount => (
                    <button
                      key={amount}
                      onClick={() => handleQuickBet(amount)}
                      disabled={gameState.status !== 'waiting' || userBet !== null}
                      className="quick-bet-button"
                    >
                      {amount}€
                    </button>
                  ))}
                </div>
                
                <h3 className="mt-4">Auto-encaissement (optionnel)</h3>
                <div className="autocashout-container">
                  <input
                    type="number"
                    min="1.01"
                    step="0.01"
                    placeholder="ex: 2.00"
                    value={autoCashout || ''}
                    onChange={handleAutoCashoutChange}
                    disabled={gameState.status !== 'waiting' || userBet !== null}
                    className="autocashout-input"
                  />
                  <span className="autocashout-symbol">×</span>
                </div>
                
                <div className="action-buttons">
                  {!userBet && gameState.status === 'waiting' && (
                    <button
                      onClick={placeBet}
                      disabled={!currentUser || betAmount < MIN_BET || betAmount > MAX_BET || betAmount > userBalance}
                      className="bet-button"
                    >
                      <Coins size={18} className="inline-icon" />
                      Placer la mise
                    </button>
                  )}
                  
                  {userBet && gameState.status === 'running' && !isCashedOut && (
                    <button
                      onClick={cashOut}
                      className="cashout-button"
                    >
                      <Check size={18} className="inline-icon" />
                      Encaisser <span className="multiplier">x{currentMultiplier.toFixed(2)}</span>
                    </button>
                  )}
                </div>
              </div>
              
              <div className="crash-history">
                <h3>Historique des crashs</h3>
                <div className="crash-history-items">
                  {gameState.crashHistory?.map((multiplier, index) => (
                    <div
                      key={index}
                      className={`crash-history-item ${getMultiplierColor(multiplier)}`}
                      title={`Crash à ${multiplier.toFixed(2)}×`}
                    >
                      {multiplier.toFixed(2)}×
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          <div className="game-bottom">
            <div className="live-bets">
              <div className="section-header">
                <h3>
                  <Users size={16} className="inline-icon" />
                  Mises en cours
                </h3>
              </div>
              <div className="live-bets-list">
                {!gameState.bets || gameState.bets.length === 0 ? (
                  <p className="empty-message">Aucune mise pour cette partie.</p>
                ) : (
                  gameState.bets.map(bet => (
                    <div key={bet.id} className="live-bet-item">
                      <div className="bet-user">
                        {bet.userId === currentUser?.uid ? 'Vous' : 'Joueur'}
                      </div>
                      <div className="bet-amount">
                        <DollarSign size={14} className="inline-icon" />
                        {formatCompactNumber(bet.amount)}
                      </div>
                      {bet.autoCashout && (
                        <div className="auto-cashout-indicator" title={`Auto-encaissement à ${bet.autoCashout}×`}>
                          Auto: {bet.autoCashout}×
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
            
            {showHistory && (
              <div className="bet-history">
                <div className="section-header">
                  <h3>
                    <Trophy size={16} className="inline-icon" />
                    Historique des gains
                  </h3>
                </div>
                <div className="bet-history-list">
                  {betHistory.length === 0 ? (
                    <p className="empty-message">Aucun historique disponible.</p>
                  ) : (
                    betHistory.filter(bet => bet.isCashedOut).slice(0, 10).map(bet => (
                      <div key={bet.id} className="bet-history-item">
                        <div className="history-user">
                          {bet.userId === currentUser?.uid ? 'Vous' : bet.userName}
                        </div>
                        <div className="history-bet">
                          {formatCompactNumber(bet.amount)} €
                        </div>
                        <div className={`history-multiplier ${getMultiplierColor(bet.cashoutMultiplier || 1)}`}>
                          {bet.cashoutMultiplier?.toFixed(2)}×
                        </div>
                        <div className="history-profit">
                          +{formatCompactNumber(bet.profit || 0)} €
                        </div>
                        <div className="history-time">
                          {formatTime(bet.timestamp)}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
        
        {message && (
          <div className={`game-message ${message.type}`}>
            {message.text}
          </div>
        )}
        
        <div className="game-footer">
          <div className="key-indicators">
            <div className="key-indicator">
              <Keyboard size={14} className="inline-icon" />
              <span>MIN: {MIN_BET}€</span>
            </div>
            <div className="key-indicator">
              <Keyboard size={14} className="inline-icon" />
              <span>MAX: {MAX_BET}€</span>
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Erreur lors de l'initialisation du jeu crash:", error);
    return <AuthErrorFallback />;
  }
};

export default CrashGame; 