import React, { useState, useContext } from 'react';
import { DollarSign, Rocket, Dice5, ChevronRight, ChevronLeft } from 'lucide-react';
import CrashGame from './crash/CrashGame';
import './CasinoManager.css';
import { AuthProvider, useAuth } from '../../contexts/AuthContext';
import { User } from 'firebase/auth';
import { UserData } from '../../firebase/auth';
import { onAuthStateChanged } from 'firebase/auth';
import { auth as firebaseAuth } from '../../firebase/config';
import { ref, get } from 'firebase/database';
import { database } from '../../firebase/config';

interface GameType {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  status: 'active' | 'coming-soon';
}

// Composant qui sert de wrapper pour les jeux
const CasinoManager: React.FC = () => {
  const [activeGame, setActiveGame] = useState<string | null>(null);
  const [showGameList, setShowGameList] = useState<boolean>(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Utiliser useEffect pour surveiller l'état de l'authentification directement
  React.useEffect(() => {
    try {
      const unsubscribe = onAuthStateChanged(firebaseAuth, (user) => {
        setCurrentUser(user);
        setIsLoading(false);
      });
      
      // Nettoyer la souscription quand le composant est démonté
      return () => unsubscribe();
    } catch (error) {
      console.error("Erreur d'authentification:", error);
      setIsLoading(false);
    }
  }, []);
  
  // Liste des jeux disponibles
  const games: GameType[] = [
    {
      id: 'crash',
      name: 'Rocket Crash',
      description: 'Regardez la fusée décoller et encaissez avant le crash pour gagner!',
      icon: <Rocket size={32} />,
      status: 'active'
    },
    {
      id: 'dice',
      name: 'Lucky Dice',
      description: 'Lancez les dés et pariez sur le résultat. Bonus pour les combinaisons!',
      icon: <Dice5 size={32} />,
      status: 'coming-soon'
    }
  ];
  
  // Sélectionner un jeu
  const selectGame = (gameId: string) => {
    setActiveGame(gameId);
    setShowGameList(false);
  };
  
  // Retourner à la liste des jeux
  const backToGameList = () => {
    setActiveGame(null);
    setShowGameList(true);
  };
  
  // Afficher la liste des jeux
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
              className={`game-card ${game.status === 'coming-soon' ? 'coming-soon' : ''}`}
              onClick={() => game.status === 'active' && selectGame(game.id)}
            >
              <div className="game-card-icon">
                {game.icon}
              </div>
              
              <div className="game-card-content">
                <h3 className="game-card-title">
                  {game.name}
                  {game.status === 'coming-soon' && <span className="coming-soon-tag">Bientôt disponible</span>}
                </h3>
                <p className="game-card-description">{game.description}</p>
              </div>
              
              {game.status === 'active' && (
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
      </div>
    );
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
          {selectedGame.id === 'crash' ? (
            <CrashGame />
          ) : (
            <div>Jeu de dés en développement</div>
          )}
        </div>
      </div>
    );
  };
  
  return (
    <div className="casino-manager">
      {showGameList ? renderGameList() : renderGame()}
    </div>
  );
};

export default CasinoManager; 