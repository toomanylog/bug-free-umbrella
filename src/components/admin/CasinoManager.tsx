import React, { useState, useEffect } from 'react';
import { database } from '../../firebase/config';
import { ref, get, update, set } from 'firebase/database';
import { DollarSign, Settings, Rocket, Trash, AlignLeft, RefreshCcw, Save, Dice5 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface GameConfig {
  name: string;
  minBet: number;
  maxBet: number;
  houseEdge: number;
  enabled: boolean;
}

interface SlotsGameStats {
  totalGames: number;
  totalBets: number;
  totalWagered: number;
  totalPayout: number;
  profitLoss: number;
  biggestWin: number;
  jackpotHits: number;
}

interface TopPlayer {
  id: string;
  displayName: string;
  email: string;
  gamesPlayed: number;
  totalWagered: number;
  totalWon: number;
  balance: number;
}

const CasinoManager: React.FC = () => {
  const { userData } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'slots' | 'settings'>('overview');
  const [gameConfigs, setGameConfigs] = useState<Record<string, GameConfig>>({
    slots: {
      name: 'Machines à Sous',
      minBet: 1,
      maxBet: 500,
      houseEdge: 5,
      enabled: false
    }
  });
  const [slotsStats, setSlotsStats] = useState<SlotsGameStats>({
    totalGames: 0,
    totalBets: 0,
    totalWagered: 0,
    totalPayout: 0,
    profitLoss: 0,
    biggestWin: 0,
    jackpotHits: 0
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' | null }>({ text: '', type: null });
  const [topPlayersFilter, setTopPlayersFilter] = useState<'winners' | 'losers'>('winners');
  const [topSlotsPlayers, setTopSlotsPlayers] = useState<TopPlayer[]>([]);

  // Charger les configurations et les statistiques
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Vérifier le rôle de l'utilisateur avant de charger les données
        if (!userData || userData.role !== 'admin') {
          throw new Error('Permission denied');
        }

        // Initialiser les stats s'ils n'existent pas
        // Slots game stats
        const slotsStatsRef = ref(database, 'slotsGame/stats');
        const slotsStatsSnapshot = await get(slotsStatsRef);
        
        if (!slotsStatsSnapshot.exists()) {
          await set(slotsStatsRef, {
            totalGames: 0,
            totalBets: 0,
            totalWagered: 0,
            totalPayout: 0,
            profitLoss: 0,
            biggestWin: 0,
            jackpotHits: 0
          });
        } else {
          setSlotsStats(slotsStatsSnapshot.val());
        }

        // Charger les configurations des jeux
        const gameConfigsRef = ref(database, 'casinoConfig');
        const configsSnapshot = await get(gameConfigsRef);
        
        if (configsSnapshot.exists()) {
          const configData = configsSnapshot.val();
          
          const updatedConfigs: Record<string, GameConfig> = {};
          
          // Configuration pour les slots
          if (configData.slots) {
            updatedConfigs.slots = configData.slots;
          }
          
          setGameConfigs(updatedConfigs);
        }

        setIsLoading(false);
      } catch (error) {
        console.error('Error loading casino data:', error);
        setIsLoading(false);
      }
    };

    const loadTopPlayers = async () => {
      if (!userData || userData.role !== 'admin') return;
      
      try {
        // Charger les utilisateurs et leurs statistiques
        const usersRef = ref(database, 'users');
        const usersSnapshot = await get(usersRef);
        
        if (!usersSnapshot.exists()) return;
        
        const usersData = usersSnapshot.val();
        const playersArray: TopPlayer[] = [];
        
        // Parcourir les utilisateurs et collecter leurs données de jeu
        Object.keys(usersData).forEach(userId => {
          const user = usersData[userId];
          
          // Vérifier si l'utilisateur a des données de jeu pour les slots
          const slotsGames = user.games?.slots?.history ? Object.values(user.games.slots.history) : [];
          
          if (slotsGames.length > 0) {
            // Calculer les statistiques
            const totalWagered = slotsGames.reduce((sum: number, game: any) => sum + game.bet, 0);
            const totalWon = slotsGames.reduce((sum: number, game: any) => sum + (game.win ? game.winAmount : 0), 0);
            
            playersArray.push({
              id: userId,
              displayName: user.displayName || 'Utilisateur anonyme',
              email: user.email || 'Pas d\'email',
              gamesPlayed: slotsGames.length,
              totalWagered,
              totalWon,
              balance: user.balance || 0
            });
          }
        });
        
        // Trier les joueurs selon le filtre
        if (topPlayersFilter === 'winners') {
          playersArray.sort((a, b) => b.totalWon - a.totalWon);
        } else {
          playersArray.sort((a, b) => (b.totalWagered - b.totalWon) - (a.totalWagered - a.totalWon));
        }
        
        // Prendre les 10 premiers
        setTopSlotsPlayers(playersArray.slice(0, 10));
      } catch (error) {
        console.error('Error loading top players:', error);
      }
    };
    
    loadData();
    loadTopPlayers();
  }, [userData, topPlayersFilter]);

  const saveConfigs = async () => {
    if (!userData || userData.role !== 'admin') return;
    
    setIsSaving(true);
    
    try {
      // Mise à jour de la configuration
      await update(ref(database, 'casinoConfig'), gameConfigs);
      
      setMessage({ text: 'Configuration sauvegardée avec succès', type: 'success' });
      setTimeout(() => setMessage({ text: '', type: null }), 3000);
    } catch (error) {
      console.error('Error saving configurations:', error);
      setMessage({ text: 'Erreur lors de la sauvegarde', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  const resetStats = async (game: string) => {
    if (!userData || userData.role !== 'admin') return;
    
    const confirmReset = window.confirm(`Êtes-vous sûr de vouloir réinitialiser les statistiques du jeu ${game}? Cette action est irréversible.`);
    
    if (!confirmReset) return;
    
    setIsSaving(true);
    
    try {
      if (game === 'slots') {
        await set(ref(database, 'slotsGame/stats'), {
          totalGames: 0,
          totalBets: 0,
          totalWagered: 0,
          totalPayout: 0,
          profitLoss: 0,
          biggestWin: 0,
          jackpotHits: 0
        });
        
        setSlotsStats({
          totalGames: 0,
          totalBets: 0,
          totalWagered: 0,
          totalPayout: 0,
          profitLoss: 0,
          biggestWin: 0,
          jackpotHits: 0
        });
        
        setMessage({ text: 'Statistiques des machines à sous réinitialisées', type: 'success' });
      }
      
      setTimeout(() => setMessage({ text: '', type: null }), 3000);
    } catch (error) {
      console.error('Error resetting stats:', error);
      setMessage({ text: 'Erreur lors de la réinitialisation', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfigChange = (game: string, field: keyof GameConfig, value: any) => {
    setGameConfigs(prev => ({
      ...prev,
      [game]: {
        ...prev[game],
        [field]: field === 'enabled' ? Boolean(value) : Number(value)
      }
    }));
  };

  const calculateEV = (multiplier: number, probability: number) => {
    const expectedValue = multiplier * probability;
    return expectedValue.toFixed(4);
  };

  // Rendu de l'aperçu général
  const renderOverview = () => {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold mb-2">Profits/Pertes Totaux</h3>
            <div className="flex items-center justify-between">
              <span className={`text-3xl font-bold ${(slotsStats.profitLoss) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {(slotsStats.profitLoss).toFixed(2)} €
              </span>
              <DollarSign size={28} className="text-blue-500" />
            </div>
          </div>
          
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold mb-2">Parties jouées</h3>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold">{slotsStats.totalGames}</span>
            </div>
          </div>
          
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold mb-2">Montant total misé</h3>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold">{slotsStats.totalWagered.toFixed(2)} €</span>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-semibold mb-4">Jeux actifs</h3>
          <div className="space-y-4">
            {Object.entries(gameConfigs).map(([gameId, config]) => (
              <div 
                key={gameId}
                className={`p-4 rounded-lg border ${config.enabled ? 'border-green-500/30 bg-green-900/10' : 'border-red-500/30 bg-red-900/10'}`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="text-lg font-medium">{config.name}</h4>
                    <p className="text-sm text-gray-400">Edge de la maison: {config.houseEdge}%</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => setActiveTab(gameId as any)}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded-md text-sm"
                    >
                      Voir détails
                    </button>
                    <div className={`w-3 h-3 rounded-full ${config.enabled ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Rendu des détails du jeu Slots
  const renderSlotsGame = () => {
    return (
      <div className="space-y-6">
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold">Statistiques des Machines à Sous</h3>
            <button 
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md text-sm flex items-center gap-2"
              onClick={() => resetStats('slots')}
            >
              <RefreshCcw size={16} />
              Réinitialiser
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gray-700/50 p-4 rounded-lg">
              <p className="text-sm text-gray-400 mb-1">Parties jouées</p>
              <p className="text-2xl font-bold">{slotsStats.totalGames}</p>
            </div>
            
            <div className="bg-gray-700/50 p-4 rounded-lg">
              <p className="text-sm text-gray-400 mb-1">Nombre de mises</p>
              <p className="text-2xl font-bold">{slotsStats.totalBets}</p>
            </div>
            
            <div className="bg-gray-700/50 p-4 rounded-lg">
              <p className="text-sm text-gray-400 mb-1">Montant total misé</p>
              <p className="text-2xl font-bold">{slotsStats.totalWagered.toFixed(2)} €</p>
            </div>
            
            <div className="bg-gray-700/50 p-4 rounded-lg">
              <p className="text-sm text-gray-400 mb-1">Montant total payé</p>
              <p className="text-2xl font-bold">{slotsStats.totalPayout.toFixed(2)} €</p>
            </div>
            
            <div className="bg-gray-700/50 p-4 rounded-lg">
              <p className="text-sm text-gray-400 mb-1">Profits/Pertes</p>
              <p className={`text-2xl font-bold ${slotsStats.profitLoss >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {slotsStats.profitLoss.toFixed(2)} €
              </p>
            </div>
            
            <div className="bg-gray-700/50 p-4 rounded-lg">
              <p className="text-sm text-gray-400 mb-1">Plus gros gain</p>
              <p className="text-2xl font-bold">{slotsStats.biggestWin.toFixed(2)} €</p>
            </div>
            
            <div className="bg-gray-700/50 p-4 rounded-lg">
              <p className="text-sm text-gray-400 mb-1">Jackpots gagnés</p>
              <p className="text-2xl font-bold">{slotsStats.jackpotHits}</p>
            </div>
            
            <div className="bg-gray-700/50 p-4 rounded-lg">
              <p className="text-sm text-gray-400 mb-1">Avantage maison</p>
              <p className="text-2xl font-bold">{gameConfigs.slots?.houseEdge || 5}%</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-semibold mb-4">Configuration du jeu</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Nom du jeu</label>
              <input 
                type="text" 
                value={gameConfigs.slots?.name || 'Machines à Sous'}
                onChange={(e) => handleConfigChange('slots', 'name', e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 rounded-md border border-gray-600 focus:border-blue-500 focus:outline-none"
              />
            </div>
            
            <div>
              <label className="block text-sm text-gray-400 mb-1">Avantage maison (%)</label>
              <input 
                type="number" 
                min="1"
                max="20"
                value={gameConfigs.slots?.houseEdge || 5}
                onChange={(e) => handleConfigChange('slots', 'houseEdge', e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 rounded-md border border-gray-600 focus:border-blue-500 focus:outline-none"
              />
            </div>
            
            <div>
              <label className="block text-sm text-gray-400 mb-1">Mise minimale (€)</label>
              <input 
                type="number" 
                min="1"
                max="100"
                value={gameConfigs.slots?.minBet || 1}
                onChange={(e) => handleConfigChange('slots', 'minBet', e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 rounded-md border border-gray-600 focus:border-blue-500 focus:outline-none"
              />
            </div>
            
            <div>
              <label className="block text-sm text-gray-400 mb-1">Mise maximale (€)</label>
              <input 
                type="number" 
                min="50"
                max="1000"
                value={gameConfigs.slots?.maxBet || 500}
                onChange={(e) => handleConfigChange('slots', 'maxBet', e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 rounded-md border border-gray-600 focus:border-blue-500 focus:outline-none"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={gameConfigs.slots?.enabled || false}
                  onChange={(e) => handleConfigChange('slots', 'enabled', e.target.checked)}
                  className="w-4 h-4 bg-gray-700 rounded border-gray-600 focus:ring-blue-500"
                />
                <span>Activer le jeu</span>
              </label>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end">
            <button 
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={saveConfigs}
              disabled={isSaving}
            >
              <Save size={16} />
              {isSaving ? 'Sauvegarde...' : 'Sauvegarder les configurations'}
            </button>
          </div>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-semibold mb-4">Top Joueurs</h3>
          <div className="flex mb-4">
            <button 
              className={`px-3 py-2 text-sm ${topPlayersFilter === 'winners' ? 'bg-green-600' : 'bg-gray-700'} rounded-l-md`}
              onClick={() => setTopPlayersFilter('winners')}
            >
              Plus grands gagnants
            </button>
            <button 
              className={`px-3 py-2 text-sm ${topPlayersFilter === 'losers' ? 'bg-red-600' : 'bg-gray-700'} rounded-r-md`}
              onClick={() => setTopPlayersFilter('losers')}
            >
              Plus grands perdants
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full bg-gray-700/30 rounded-lg">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Joueur</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Parties</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Misé</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Gagné</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Bilan</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Solde</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {topSlotsPlayers.length > 0 ? (
                  topSlotsPlayers.map((player, index) => (
                    <tr key={player.id} className={index % 2 === 0 ? 'bg-gray-800/30' : ''}>
                      <td className="px-4 py-2 whitespace-nowrap">
                        <div className="text-sm font-medium">{player.displayName}</div>
                        <div className="text-xs text-gray-400">{player.email}</div>
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm">{player.gamesPlayed}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm">{player.totalWagered.toFixed(2)} €</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm">{player.totalWon.toFixed(2)} €</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs ${player.totalWon - player.totalWagered >= 0 ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'}`}>
                          {(player.totalWon - player.totalWagered).toFixed(2)} €
                        </span>
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm">{player.balance.toFixed(2)} €</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-4 py-4 text-center text-sm text-gray-400">
                      Aucun joueur trouvé pour ce jeu
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // Rendu des paramètres généraux
  const renderSettings = () => {
    return (
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
        <h3 className="text-xl font-semibold mb-6">Paramètres généraux du Casino</h3>
        <p className="text-gray-400 mb-4">Cette section sera disponible prochainement. Vous pourrez configurer des paramètres globaux pour tous les jeux du casino.</p>
      </div>
    );
  };

  // Fonction pour le rendu de l'interface utilisateur en fonction de l'onglet actif
  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 md:p-8">
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold">Administration du Casino</h1>
            {message.text && (
              <div className={`px-4 py-2 rounded-md ${message.type === 'success' ? 'bg-green-800' : 'bg-red-800'}`}>
                {message.text}
              </div>
            )}
          </div>
          
          <div className="mb-6 border-b border-gray-700">
            <nav className="-mb-px flex space-x-6 overflow-x-auto">
              <button
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === 'overview' ? 'border-blue-500 text-blue-500' : 'border-transparent text-gray-400 hover:text-gray-300'
                }`}
                onClick={() => setActiveTab('overview')}
              >
                Vue d'ensemble
              </button>
              
              <button
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === 'slots' ? 'border-blue-500 text-blue-500' : 'border-transparent text-gray-400 hover:text-gray-300'
                }`}
                onClick={() => setActiveTab('slots')}
              >
                Machines à Sous
              </button>
              
              <button
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === 'settings' ? 'border-blue-500 text-blue-500' : 'border-transparent text-gray-400 hover:text-gray-300'
                }`}
                onClick={() => setActiveTab('settings')}
              >
                Paramètres
              </button>
            </nav>
          </div>
          
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'slots' && renderSlotsGame()}
          {activeTab === 'settings' && renderSettings()}
        </div>
      )}
    </div>
  );
};

export default CasinoManager; 