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

interface CrashGameStats {
  totalGames: number;
  totalBets: number;
  totalWagered: number;
  totalPayout: number;
  profitLoss: number;
  avgMultiplier: number;
  biggestWin: number;
}

// Interface pour les statistiques du jeu de dés (similaire à Crash mais sans avgMultiplier)
interface DiceGameStats {
  totalGames: number;
  totalBets: number;
  totalWagered: number;
  totalPayout: number;
  profitLoss: number;
  biggestWin: number;
}

const CasinoManager: React.FC = () => {
  const { userData } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'crash' | 'dice' | 'settings'>('overview');
  const [gameConfigs, setGameConfigs] = useState<Record<string, GameConfig>>({
    crash: {
      name: 'Rocket Crash',
      minBet: 5,
      maxBet: 5000,
      houseEdge: 5,
      enabled: true
    },
    dice: {
      name: 'Lucky Dice',
      minBet: 5,
      maxBet: 1000,
      houseEdge: 5,
      enabled: true
    }
  });
  const [crashStats, setCrashStats] = useState<CrashGameStats>({
    totalGames: 0,
    totalBets: 0,
    totalWagered: 0,
    totalPayout: 0,
    profitLoss: 0,
    avgMultiplier: 0,
    biggestWin: 0
  });
  const [diceStats, setDiceStats] = useState<DiceGameStats>({
    totalGames: 0,
    totalBets: 0,
    totalWagered: 0,
    totalPayout: 0,
    profitLoss: 0,
    biggestWin: 0
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' | null }>({ text: '', type: null });

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
        // Crash game stats
        const crashStatsRef = ref(database, 'crashGame/stats');
        const crashStatsSnapshot = await get(crashStatsRef);

        if (!crashStatsSnapshot.exists()) {
          // Créer les statistiques initiales pour Crash
          await set(crashStatsRef, {
            totalGames: 0,
            totalBets: 0,
            totalWagered: 0,
            totalPayout: 0,
            profitLoss: 0,
            avgMultiplier: 0,
            biggestWin: 0
          });
        }
        
        // Dice game stats
        const diceStatsRef = ref(database, 'diceGame/stats');
        const diceStatsSnapshot = await get(diceStatsRef);

        if (!diceStatsSnapshot.exists()) {
          // Créer les statistiques initiales pour Dice
          await set(diceStatsRef, {
            totalGames: 0,
            totalBets: 0,
            totalWagered: 0,
            totalPayout: 0,
            profitLoss: 0,
            biggestWin: 0
          });
        }
        
        // Charger les configurations
        const configRef = ref(database, 'casinoConfig');
        const configSnapshot = await get(configRef);
        
        if (configSnapshot.exists()) {
          setGameConfigs(configSnapshot.val());
        } else {
          // Si les configurations n'existent pas, créer les configurations par défaut
          await set(configRef, gameConfigs);
        }
        
        // Charger les statistiques du jeu Crash
        const crashStatsRef2 = ref(database, 'crashGame/stats');
        const crashStatsSnapshot2 = await get(crashStatsRef2);
        
        if (crashStatsSnapshot2.exists()) {
          setCrashStats(crashStatsSnapshot2.val());
        }
        
        // Charger les statistiques du jeu Dice
        const diceStatsRef2 = ref(database, 'diceGame/stats');
        const diceStatsSnapshot2 = await get(diceStatsRef2);
        
        if (diceStatsSnapshot2.exists()) {
          setDiceStats(diceStatsSnapshot2.val());
        }
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error);
        setMessage({ text: 'Erreur lors du chargement des données', type: 'error' });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [userData]);

  // Mettre à jour les configurations
  const saveConfigs = async () => {
    setIsSaving(true);
    try {
      await set(ref(database, 'casinoConfig'), gameConfigs);
      setMessage({ text: 'Configurations sauvegardées avec succès', type: 'success' });
      
      // Effacer le message après 3 secondes
      setTimeout(() => {
        setMessage({ text: '', type: null });
      }, 3000);
    } catch (error) {
      console.error("Erreur lors de la sauvegarde des configurations:", error);
      setMessage({ text: 'Erreur lors de la sauvegarde des configurations', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  // Réinitialiser les statistiques
  const resetStats = async (game: string) => {
    if (!confirm('Êtes-vous sûr de vouloir réinitialiser les statistiques? Cette action est irréversible.')) {
      return;
    }
    
    try {
      if (game === 'crash') {
        await set(ref(database, 'crashGame/stats'), {
          totalGames: 0,
          totalBets: 0,
          totalWagered: 0,
          totalPayout: 0,
          profitLoss: 0,
          avgMultiplier: 0,
          biggestWin: 0
        });
        
        setCrashStats({
          totalGames: 0,
          totalBets: 0,
          totalWagered: 0,
          totalPayout: 0,
          profitLoss: 0,
          avgMultiplier: 0,
          biggestWin: 0
        });
        
        setMessage({ text: 'Statistiques réinitialisées avec succès', type: 'success' });
      } else if (game === 'dice') {
        await set(ref(database, 'diceGame/stats'), {
          totalGames: 0,
          totalBets: 0,
          totalWagered: 0,
          totalPayout: 0,
          profitLoss: 0,
          biggestWin: 0
        });
        
        setDiceStats({
          totalGames: 0,
          totalBets: 0,
          totalWagered: 0,
          totalPayout: 0,
          profitLoss: 0,
          biggestWin: 0
        });
        
        setMessage({ text: 'Statistiques réinitialisées avec succès', type: 'success' });
      }
    } catch (error) {
      console.error("Erreur lors de la réinitialisation des statistiques:", error);
      setMessage({ text: 'Erreur lors de la réinitialisation des statistiques', type: 'error' });
    }
  };

  // Mettre à jour une configuration
  const handleConfigChange = (game: string, field: keyof GameConfig, value: any) => {
    setGameConfigs(prev => ({
      ...prev,
      [game]: {
        ...prev[game],
        [field]: field === 'enabled' ? value : Number(value)
      }
    }));
  };

  // Rendu de l'aperçu du casino
  const renderOverview = () => {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold mb-2">Profits/Pertes Totaux</h3>
            <div className="flex items-center justify-between">
              <span className={`text-3xl font-bold ${(crashStats.profitLoss + diceStats.profitLoss) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {(crashStats.profitLoss + diceStats.profitLoss).toFixed(2)} €
              </span>
              <DollarSign size={28} className="text-blue-500" />
            </div>
          </div>
          
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold mb-2">Parties jouées</h3>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold">{crashStats.totalGames + diceStats.totalGames}</span>
              <Rocket size={28} className="text-green-500" />
            </div>
          </div>
          
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold mb-2">Montant total misé</h3>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold">{(crashStats.totalWagered + diceStats.totalWagered).toFixed(2)} €</span>
              <DollarSign size={28} className="text-yellow-500" />
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

  // Rendu des détails du jeu Crash
  const renderCrashGame = () => {
    return (
      <div className="space-y-6">
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold">Statistiques du jeu Crash</h3>
            <button 
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md text-sm flex items-center gap-2"
              onClick={() => resetStats('crash')}
            >
              <RefreshCcw size={16} />
              Réinitialiser
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gray-700/50 p-4 rounded-lg">
              <p className="text-sm text-gray-400 mb-1">Parties jouées</p>
              <p className="text-2xl font-bold">{crashStats.totalGames}</p>
            </div>
            
            <div className="bg-gray-700/50 p-4 rounded-lg">
              <p className="text-sm text-gray-400 mb-1">Nombre de mises</p>
              <p className="text-2xl font-bold">{crashStats.totalBets}</p>
            </div>
            
            <div className="bg-gray-700/50 p-4 rounded-lg">
              <p className="text-sm text-gray-400 mb-1">Montant total misé</p>
              <p className="text-2xl font-bold">{crashStats.totalWagered.toFixed(2)} €</p>
            </div>
            
            <div className="bg-gray-700/50 p-4 rounded-lg">
              <p className="text-sm text-gray-400 mb-1">Montant total payé</p>
              <p className="text-2xl font-bold">{crashStats.totalPayout.toFixed(2)} €</p>
            </div>
            
            <div className="bg-gray-700/50 p-4 rounded-lg">
              <p className="text-sm text-gray-400 mb-1">Profits/Pertes</p>
              <p className={`text-2xl font-bold ${crashStats.profitLoss >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {crashStats.profitLoss.toFixed(2)} €
              </p>
            </div>
            
            <div className="bg-gray-700/50 p-4 rounded-lg">
              <p className="text-sm text-gray-400 mb-1">Multiplicateur moyen</p>
              <p className="text-2xl font-bold">{crashStats.avgMultiplier.toFixed(2)}x</p>
            </div>
            
            <div className="bg-gray-700/50 p-4 rounded-lg">
              <p className="text-sm text-gray-400 mb-1">Plus gros gain</p>
              <p className="text-2xl font-bold">{crashStats.biggestWin.toFixed(2)} €</p>
            </div>
            
            <div className="bg-gray-700/50 p-4 rounded-lg">
              <p className="text-sm text-gray-400 mb-1">Avantage maison</p>
              <p className="text-2xl font-bold">{gameConfigs.crash?.houseEdge || 5}%</p>
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
                value={gameConfigs.crash?.name || 'Rocket Crash'}
                onChange={(e) => handleConfigChange('crash', 'name', e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 rounded-md border border-gray-600 focus:border-blue-500 focus:outline-none"
              />
            </div>
            
            <div>
              <label className="block text-sm text-gray-400 mb-1">Avantage maison (%)</label>
              <input 
                type="number" 
                min="1"
                max="20"
                value={gameConfigs.crash?.houseEdge || 5}
                onChange={(e) => handleConfigChange('crash', 'houseEdge', e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 rounded-md border border-gray-600 focus:border-blue-500 focus:outline-none"
              />
            </div>
            
            <div>
              <label className="block text-sm text-gray-400 mb-1">Mise minimale (€)</label>
              <input 
                type="number" 
                min="1"
                max="100"
                value={gameConfigs.crash?.minBet || 5}
                onChange={(e) => handleConfigChange('crash', 'minBet', e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 rounded-md border border-gray-600 focus:border-blue-500 focus:outline-none"
              />
            </div>
            
            <div>
              <label className="block text-sm text-gray-400 mb-1">Mise maximale (€)</label>
              <input 
                type="number" 
                min="100"
                max="10000"
                value={gameConfigs.crash?.maxBet || 5000}
                onChange={(e) => handleConfigChange('crash', 'maxBet', e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 rounded-md border border-gray-600 focus:border-blue-500 focus:outline-none"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={gameConfigs.crash?.enabled || false}
                  onChange={(e) => handleConfigChange('crash', 'enabled', e.target.checked)}
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
      </div>
    );
  };

  // Rendu des détails du jeu Dice
  const renderDiceGame = () => {
    return (
      <div className="space-y-6">
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold">Statistiques du jeu de dés</h3>
            <button 
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md text-sm flex items-center gap-2"
              onClick={() => resetStats('dice')}
            >
              <RefreshCcw size={16} />
              Réinitialiser
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gray-700/50 p-4 rounded-lg">
              <p className="text-sm text-gray-400 mb-1">Parties jouées</p>
              <p className="text-2xl font-bold">{diceStats.totalGames}</p>
            </div>
            
            <div className="bg-gray-700/50 p-4 rounded-lg">
              <p className="text-sm text-gray-400 mb-1">Nombre de mises</p>
              <p className="text-2xl font-bold">{diceStats.totalBets}</p>
            </div>
            
            <div className="bg-gray-700/50 p-4 rounded-lg">
              <p className="text-sm text-gray-400 mb-1">Montant total misé</p>
              <p className="text-2xl font-bold">{diceStats.totalWagered.toFixed(2)} €</p>
            </div>
            
            <div className="bg-gray-700/50 p-4 rounded-lg">
              <p className="text-sm text-gray-400 mb-1">Montant total payé</p>
              <p className="text-2xl font-bold">{diceStats.totalPayout.toFixed(2)} €</p>
            </div>
            
            <div className="bg-gray-700/50 p-4 rounded-lg">
              <p className="text-sm text-gray-400 mb-1">Profits/Pertes</p>
              <p className={`text-2xl font-bold ${diceStats.profitLoss >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {diceStats.profitLoss.toFixed(2)} €
              </p>
            </div>
            
            <div className="bg-gray-700/50 p-4 rounded-lg">
              <p className="text-sm text-gray-400 mb-1">Plus gros gain</p>
              <p className="text-2xl font-bold">{diceStats.biggestWin.toFixed(2)} €</p>
            </div>
            
            <div className="bg-gray-700/50 p-4 rounded-lg">
              <p className="text-sm text-gray-400 mb-1">Avantage maison</p>
              <p className="text-2xl font-bold">{gameConfigs.dice?.houseEdge || 5}%</p>
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
                value={gameConfigs.dice?.name || 'Lucky Dice'}
                onChange={(e) => handleConfigChange('dice', 'name', e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 rounded-md border border-gray-600 focus:border-blue-500 focus:outline-none"
              />
            </div>
            
            <div>
              <label className="block text-sm text-gray-400 mb-1">Avantage maison (%)</label>
              <input 
                type="number" 
                min="1"
                max="20"
                value={gameConfigs.dice?.houseEdge || 5}
                onChange={(e) => handleConfigChange('dice', 'houseEdge', e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 rounded-md border border-gray-600 focus:border-blue-500 focus:outline-none"
              />
            </div>
            
            <div>
              <label className="block text-sm text-gray-400 mb-1">Mise minimale (€)</label>
              <input 
                type="number" 
                min="1"
                max="100"
                value={gameConfigs.dice?.minBet || 5}
                onChange={(e) => handleConfigChange('dice', 'minBet', e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 rounded-md border border-gray-600 focus:border-blue-500 focus:outline-none"
              />
            </div>
            
            <div>
              <label className="block text-sm text-gray-400 mb-1">Mise maximale (€)</label>
              <input 
                type="number" 
                min="100"
                max="10000"
                value={gameConfigs.dice?.maxBet || 1000}
                onChange={(e) => handleConfigChange('dice', 'maxBet', e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 rounded-md border border-gray-600 focus:border-blue-500 focus:outline-none"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={gameConfigs.dice?.enabled || false}
                  onChange={(e) => handleConfigChange('dice', 'enabled', e.target.checked)}
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

  return (
    <div>
      {message.type && (
        <div className={`p-4 mb-6 rounded-md ${message.type === 'success' ? 'bg-green-900/50 border border-green-700' : 'bg-red-900/50 border border-red-700'}`}>
          {message.text}
        </div>
      )}
      
      <div className="mb-6 flex flex-wrap gap-2">
        <button 
          className={`px-4 py-2 rounded-md flex items-center gap-2 ${activeTab === 'overview' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}
          onClick={() => setActiveTab('overview')}
        >
          <AlignLeft size={16} />
          Aperçu
        </button>
        
        <button 
          className={`px-4 py-2 rounded-md flex items-center gap-2 ${activeTab === 'crash' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}
          onClick={() => setActiveTab('crash')}
        >
          <Rocket size={16} />
          Crash Game
        </button>
        
        <button 
          className={`px-4 py-2 rounded-md flex items-center gap-2 ${activeTab === 'dice' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}
          onClick={() => setActiveTab('dice')}
        >
          <Dice5 size={16} />
          Dice Game
        </button>
        
        <button 
          className={`px-4 py-2 rounded-md flex items-center gap-2 ${activeTab === 'settings' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}
          onClick={() => setActiveTab('settings')}
        >
          <Settings size={16} />
          Paramètres
        </button>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'crash' && renderCrashGame()}
          {activeTab === 'dice' && renderDiceGame()}
          {activeTab === 'settings' && renderSettings()}
        </>
      )}
    </div>
  );
};

export default CasinoManager; 