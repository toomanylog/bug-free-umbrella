import React, { useState } from 'react';
import { DollarSign, Rocket, Dice5, ChevronRight, ChevronLeft } from 'lucide-react';
import CrashGame from './crash/CrashGame';
import './CasinoManager.css';
import { AuthProvider } from '../../contexts/AuthContext';

interface GameType {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  component: React.ReactNode;
  status: 'active' | 'coming-soon';
}

const CasinoManager: React.FC = () => {
  const [activeGame, setActiveGame] = useState<string | null>(null);
  const [showGameList, setShowGameList] = useState<boolean>(true);
  
  // Liste des jeux disponibles
  const games: GameType[] = [
    {
      id: 'crash',
      name: 'Rocket Crash',
      description: 'Regardez la fusée décoller et encaissez avant le crash pour gagner!',
      icon: <Rocket size={32} />,
      component: <AuthProvider><CrashGame /></AuthProvider>,
      status: 'active'
    },
    {
      id: 'dice',
      name: 'Lucky Dice',
      description: 'Lancez les dés et pariez sur le résultat. Bonus pour les combinaisons!',
      icon: <Dice5 size={32} />,
      component: null,
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
          {selectedGame.component}
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