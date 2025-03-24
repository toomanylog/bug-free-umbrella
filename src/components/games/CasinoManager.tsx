import React, { useState, useCallback, useEffect } from 'react';
import { DollarSign, Rocket, Dice5, ChevronRight, ChevronLeft, AlertCircle } from 'lucide-react';
import CrashGame from './crash/CrashGame';
import './CasinoManager.css';
import { useAuth } from '../../contexts/AuthContext';
import { User } from 'firebase/auth';
import { database } from '../../firebase/config';
import { ref, get, set, update, onValue } from 'firebase/database';

interface GameType {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  status: 'active' | 'coming-soon' | 'disabled';
  disabledReason?: string;
}

// Composant qui sert de wrapper pour les jeux
const CasinoManager: React.FC = () => {
  const [activeGame, setActiveGame] = useState<string | null>(null);
  const [showGameList, setShowGameList] = useState<boolean>(true);
  const [gameConfigs, setGameConfigs] = useState<{[key: string]: any}>({});
  
  // Récupérer le contexte d'authentification de façon sécurisée
  const auth = useAuth();
  const { currentUser, isLoading } = auth;
  const isAdmin = auth?.isAdmin || false;

  // Charger la configuration des jeux depuis Firebase
  useEffect(() => {
    const casinoConfigRef = ref(database, 'casinoConfig/games');
    
    const unsubscribe = onValue(casinoConfigRef, (snapshot) => {
      if (snapshot.exists()) {
        console.log("Configuration du casino chargée");
        setGameConfigs(snapshot.val());
      } else {
        // Initialiser la configuration par défaut si elle n'existe pas
        const defaultConfig = {
          crash: { status: 'active', updatedAt: new Date().toISOString() },
          dice: { status: 'coming-soon', updatedAt: new Date().toISOString() }
        };
        set(casinoConfigRef, defaultConfig);
        setGameConfigs(defaultConfig);
      }
    });
    
    return () => unsubscribe();
  }, []);

  // Liste des jeux disponibles avec statut dynamique
  const games: GameType[] = [
    {
      id: 'crash',
      name: 'Rocket Crash',
      description: 'Regardez la fusée décoller et encaissez avant le crash pour gagner!',
      icon: <Rocket size={32} />,
      status: isAdmin 
        ? 'active' // Les admins peuvent toujours accéder aux jeux
        : (gameConfigs?.crash?.status || 'active'),
      disabledReason: gameConfigs?.crash?.disabledReason || 'Ce jeu est temporairement désactivé pour maintenance.'
    },
    {
      id: 'dice',
      name: 'Lucky Dice',
      description: 'Lancez les dés et pariez sur le résultat. Bonus pour les combinaisons!',
      icon: <Dice5 size={32} />,
      status: gameConfigs?.dice?.status || 'coming-soon',
      disabledReason: gameConfigs?.dice?.disabledReason
    }
  ];
  
  // Navigation sécurisée
  const navigateTo = useCallback((gameId: string | null) => {
    try {
      console.log(`Navigation vers: ${gameId || 'liste des jeux'}`);
      setActiveGame(gameId);
      setShowGameList(gameId === null);
    } catch (error) {
      console.error("Erreur de navigation:", error);
    }
  }, []);
  
  // Sélectionner un jeu
  const selectGame = useCallback((gameId: string) => {
    navigateTo(gameId);
  }, [navigateTo]);
  
  // Retourner à la liste des jeux
  const backToGameList = useCallback(() => {
    navigateTo(null);
  }, [navigateTo]);
  
  // Gestionnaire de clic sécurisé pour les cartes de jeu
  const handleGameCardClick = useCallback((game: GameType) => {
    if (game.status === 'active' || (isAdmin && game.status === 'disabled')) {
      selectGame(game.id);
    }
  }, [selectGame, isAdmin]);
  
  // Afficher la liste des jeux avec une approche simplifiée
  const renderGameList = () => {
    return (
      <div className="casino-game-list">
        <h1 className="casino-title">
          <DollarSign size={28} className="casino-title-icon" />
          Casino MisaLinux
        </h1>
        
        <p className="casino-description">
          Bienvenue dans le casino MisaLinux! Jouez et gagnez des récompenses dans nos différents jeux.
        </p>
        
        <div className="game-cards">
          {games.map(game => (
            <div 
              key={game.id}
              className={`game-card ${game.status !== 'active' ? game.status : ''} ${game.status === 'disabled' ? 'offline' : ''}`}
              onClick={() => game.status === 'active' || (isAdmin && game.status === 'disabled') ? handleGameCardClick(game) : null}
            >
              <div className="game-card-icon">
                {game.icon}
              </div>
              
              <div className="game-card-content">
                <h3 className="game-card-title">
                  {game.name}
                  {game.status === 'coming-soon' && <span className="coming-soon-tag">Bientôt disponible</span>}
                  {game.status === 'disabled' && <span className="disabled-tag">Offline</span>}
                  {game.status === 'disabled' && isAdmin && <span className="admin-access-tag">Accès Admin</span>}
                </h3>
                <p className="game-card-description">{game.description}</p>
                
                {game.status === 'disabled' && game.disabledReason && (
                  <p className="game-disabled-reason">
                    <AlertCircle size={14} className="inline-icon" />
                    {game.disabledReason}
                  </p>
                )}
              </div>
              
              {(game.status === 'active' || (isAdmin && game.status === 'disabled')) && (
                <div className="game-card-action">
                  <ChevronRight size={20} />
                </div>
              )}
            </div>
          ))}
        </div>
        
        <div className="casino-rules">
          <h2>Règles du casino</h2>
          <ul>
            <li>Tous les jeux sont réservés aux utilisateurs inscrits et connectés.</li>
            <li>Les mises sont débitées directement de votre portefeuille.</li>
            <li>Les gains sont automatiquement ajoutés à votre portefeuille.</li>
            <li>La mise minimale varie selon les jeux.</li>
            <li>Les administrateurs se réservent le droit de modifier ou annuler toute transaction en cas de détection de fraude.</li>
            <li>Jouez de manière responsable. Ne misez que ce que vous pouvez vous permettre de perdre.</li>
          </ul>
        </div>
        
        {isAdmin && (
          <div className="admin-controls">
            <h2>Contrôles administrateur</h2>
            <div className="admin-control-buttons">
              <button 
                className="admin-button"
                onClick={() => toggleGameStatus('crash')}
              >
                {gameConfigs?.crash?.status === 'disabled' ? 'Activer' : 'Désactiver'} Rocket Crash
              </button>
              <button 
                className="admin-button"
                onClick={() => toggleGameStatus('dice')}
                disabled={gameConfigs?.dice?.status === 'coming-soon'}
              >
                {gameConfigs?.dice?.status === 'disabled' ? 'Activer' : 'Désactiver'} Lucky Dice
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };
  
  // Fonction pour activer/désactiver un jeu (admin uniquement)
  const toggleGameStatus = async (gameId: string) => {
    if (!isAdmin) return;
    
    try {
      const gameRef = ref(database, `casinoConfig/games/${gameId}`);
      const snapshot = await get(gameRef);
      
      if (snapshot.exists()) {
        const gameConfig = snapshot.val();
        const newStatus = gameConfig.status === 'disabled' ? 'active' : 'disabled';
        
        await update(gameRef, {
          status: newStatus,
          updatedAt: new Date().toISOString()
        });
        
        console.log(`Statut du jeu ${gameId} modifié à: ${newStatus}`);
      }
    } catch (error) {
      console.error(`Erreur lors de la modification du statut du jeu ${gameId}:`, error);
    }
  };
  
  // Afficher le jeu sélectionné
  const renderGame = () => {
    const selectedGame = games.find(game => game.id === activeGame);
    
    if (!selectedGame) return null;
    
    if (isLoading) {
      return (
        <div className="casino-game-container">
          <div className="game-header">
            <button className="back-button" onClick={backToGameList}>
              <ChevronLeft size={20} />
              <span>Retour aux jeux</span>
            </button>
            <h2 className="game-title">{selectedGame.name}</h2>
          </div>
          <div className="game-content">
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          </div>
        </div>
      );
    }
    
    if (!currentUser) {
      return (
        <div className="casino-game-container">
          <div className="game-header">
            <button className="back-button" onClick={backToGameList}>
              <ChevronLeft size={20} />
              <span>Retour aux jeux</span>
            </button>
            <h2 className="game-title">{selectedGame.name}</h2>
          </div>
          <div className="game-content">
            <div className="bg-gray-800 text-white p-4 rounded-lg">
              <h2 className="text-xl font-bold mb-2">Connexion requise</h2>
              <p>Vous devez être connecté pour jouer. Veuillez vous connecter ou créer un compte.</p>
              <div className="mt-4">
                <a href="/login" className="text-blue-400 hover:text-blue-300">Se connecter</a>
              </div>
            </div>
          </div>
        </div>
      );
    }
    
    // Vérifier si le jeu est désactivé pour les non-admins
    if (selectedGame.status === 'disabled' && !isAdmin) {
      return (
        <div className="casino-game-container">
          <div className="game-header">
            <button className="back-button" onClick={backToGameList}>
              <ChevronLeft size={20} />
              <span>Retour aux jeux</span>
            </button>
            <h2 className="game-title">{selectedGame.name}</h2>
          </div>
          <div className="game-content">
            <div className="game-disabled-message">
              <AlertCircle size={48} className="disabled-icon" />
              <h2>Jeu temporairement désactivé</h2>
              <p>{selectedGame.disabledReason || "Ce jeu est temporairement indisponible. Veuillez réessayer plus tard."}</p>
              <button className="back-to-games-button" onClick={backToGameList}>
                Retour aux jeux
              </button>
            </div>
          </div>
        </div>
      );
    }
    
    // Si le jeu est "coming soon", afficher un message approprié
    if (selectedGame.status === 'coming-soon') {
      return (
        <div className="casino-game-container">
          <div className="game-header">
            <button className="back-button" onClick={backToGameList}>
              <ChevronLeft size={20} />
              <span>Retour aux jeux</span>
            </button>
            <h2 className="game-title">{selectedGame.name}</h2>
          </div>
          <div className="game-content">
            <div className="game-coming-soon-message">
              <h2>Bientôt disponible</h2>
              <p>Ce jeu est actuellement en développement et sera disponible prochainement.</p>
              <button className="back-to-games-button" onClick={backToGameList}>
                Retour aux jeux
              </button>
            </div>
          </div>
        </div>
      );
    }
    
    return (
      <div className="casino-game-container">
        <div className="game-header">
          <button className="back-button" onClick={backToGameList}>
            <ChevronLeft size={20} />
            <span>Retour aux jeux</span>
          </button>
          <h2 className="game-title">
            {selectedGame.name}
            {selectedGame.status === 'disabled' && isAdmin && <span className="admin-mode-indicator">Mode Admin</span>}
          </h2>
        </div>
        
        <div className="game-content">
          {selectedGame.id === 'crash' && (
            <CrashGame key={`crash-game-${Date.now()}`} />
          )}
          {selectedGame.id === 'dice' && (
            <div>Jeu de dés en développement</div>
          )}
        </div>
      </div>
    );
  };
  
  // Le rendu principal avec gestion d'erreur
  return (
    <div className="casino-manager">
      {showGameList ? renderGameList() : renderGame()}
    </div>
  );
};

export default CasinoManager; 