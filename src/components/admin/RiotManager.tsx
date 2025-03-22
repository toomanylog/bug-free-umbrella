import React, { useState, useEffect } from 'react';
import { database } from '../../firebase/config';
import { ref, get, set, remove, update } from 'firebase/database';
import { useAuth } from '../../contexts/AuthContext';
import { Plus, X, Search, Edit, Trash2, RefreshCw, Shield, Users, AlertTriangle, Target, Crosshair, Link, LinkIcon, Swords } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface RiotAccount {
  id: string;
  riotId: string;
  username: string;
  tag: string;
  region: string;
  lastUpdated: number;
  linked?: boolean;
  linkedAccounts?: string[];
  rank?: {
    currentRank?: string;
    currentTier?: string;
    rankIcon?: string;
    bestRank?: string;
    bestTier?: string;
    seasonRanks?: Array<{
      season: string;
      rank: string;
      tier: string;
    }>;
  };
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface PlayerStats {
  rank: string;
  tier: string;
  leaguePoints?: number;
  wins?: number;
  losses?: number;
  winrate?: number;
  rankIcon?: string;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface Agent {
  uuid: string;
  displayName: string;
  description: string;
  displayIcon: string;
  role?: {
    uuid: string;
    displayName: string;
    description: string;
    displayIcon: string;
  };
  abilities: Array<{
    slot: string;
    displayName: string;
    description: string;
    displayIcon: string;
  }>;
}

interface Weapon {
  uuid: string;
  displayName: string;
  category: string;
  displayIcon: string;
  killStreamIcon: string;
  skins: WeaponSkin[];
}

interface WeaponSkin {
  uuid: string;
  displayName: string;
  themeUuid: string;
  contentTierUuid: string;
  displayIcon: string;
  wallpaper: string | null;
  chromas: Array<{
    uuid: string;
    displayName: string;
    displayIcon: string;
    fullRender: string;
    swatch: string | null;
    streamedVideo: string | null;
  }>;
  levels: Array<{
    uuid: string;
    displayName: string;
    levelItem: string | null;
    displayIcon: string | null;
    streamedVideo: string | null;
  }>;
}

// Définir les régions disponibles pour Valorant
const REGIONS = [
  { value: 'eu', label: 'Europe' },
  { value: 'na', label: 'Amérique du Nord' },
  { value: 'ap', label: 'Asie-Pacifique' },
  { value: 'kr', label: 'Corée' },
  { value: 'latam', label: 'Amérique latine' },
  { value: 'br', label: 'Brésil' }
];

// Clé API Riot
const RIOT_API_KEY = process.env.REACT_APP_RIOT_API_KEY || 'RGAPI-80c93110-b305-4d8d-bbe1-b067038b1e54';

// Composant principal
const RiotManager: React.FC = () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { userData } = useAuth();
  const [accounts, setAccounts] = useState<RiotAccount[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // État du formulaire
  const [showForm, setShowForm] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [selectedAccount, setSelectedAccount] = useState<RiotAccount | null>(null);
  
  // État du nouveau compte
  const [newAccount, setNewAccount] = useState<Omit<RiotAccount, 'id'>>({
    riotId: '',
    username: '',
    tag: '',
    region: 'eu',
    lastUpdated: Date.now()
  });
  
  const [activeTab, setActiveTab] = useState<'accounts' | 'agents' | 'skins'>('accounts');
  const [weapons, setWeapons] = useState<Weapon[]>([]);
  const [loadingWeapons, setLoadingWeapons] = useState<boolean>(false);
  const [weaponError, setWeaponError] = useState<string | null>(null);
  const [selectedWeapon, setSelectedWeapon] = useState<Weapon | null>(null);
  const [selectedSkin, setSelectedSkin] = useState<WeaponSkin | null>(null);
  const [showSkinDetails, setShowSkinDetails] = useState<boolean>(false);
  const [showWeaponDetails, setShowWeaponDetails] = useState<boolean>(false);
  const [showLinkAccountsModal, setShowLinkAccountsModal] = useState<boolean>(false);
  const [accountsToLink, setAccountsToLink] = useState<string[]>([]);
  const [primaryAccountId, setPrimaryAccountId] = useState<string | null>(null);
  
  // Chargement des comptes depuis Firebase
  useEffect(() => {
    const loadAccounts = async () => {
      try {
        setLoading(true);
        const riotAccountsRef = ref(database, 'riotAccounts');
        const snapshot = await get(riotAccountsRef);
        
        if (snapshot.exists()) {
          const accountsData = snapshot.val();
          const accountsArray: RiotAccount[] = Object.entries(accountsData).map(
            ([id, data]: [string, any]) => ({
              id,
              ...data
            })
          );
          
          setAccounts(accountsArray);
        } else {
          setAccounts([]);
        }
      } catch (err) {
        console.error('Erreur lors du chargement des comptes RIOT:', err);
        setError('Impossible de charger les comptes RIOT. Veuillez réessayer plus tard.');
      } finally {
        setLoading(false);
      }
    };
    
    loadAccounts();
    
    // Vérifier si la clé API est chargée depuis les variables d'environnement
    if (!process.env.REACT_APP_RIOT_API_KEY && process.env.NODE_ENV === 'production') {
      console.warn('⚠️ La clé API Riot est utilisée à partir de la fallback. Il est recommandé de configurer la variable d\'environnement REACT_APP_RIOT_API_KEY.');
    }
  }, []);
  
  // Filtrer les comptes basés sur la recherche
  const filteredAccounts = accounts.filter(account => 
    account.username.toLowerCase().includes(searchQuery.toLowerCase()) || 
    account.tag.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Réinitialiser le formulaire
  const resetForm = () => {
    setNewAccount({
      riotId: '',
      username: '',
      tag: '',
      region: 'eu',
      lastUpdated: Date.now()
    });
    setIsEditing(false);
    setSelectedAccount(null);
  };
  
  // Ouvrir le formulaire d'édition
  const openEditForm = (account: RiotAccount) => {
    setIsEditing(true);
    setSelectedAccount(account);
    setNewAccount({
      riotId: account.riotId,
      username: account.username,
      tag: account.tag,
      region: account.region,
      lastUpdated: account.lastUpdated,
      rank: account.rank
    });
    setShowForm(true);
  };
  
  // Supprimer un compte
  const deleteAccount = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce compte RIOT ?')) {
      try {
        const accountRef = ref(database, `riotAccounts/${id}`);
        await remove(accountRef);
        
        setAccounts(accounts.filter(account => account.id !== id));
        setSuccess('Compte RIOT supprimé avec succès.');
        
        setTimeout(() => {
          setSuccess(null);
        }, 3000);
      } catch (err) {
        console.error('Erreur lors de la suppression du compte:', err);
        setError('Impossible de supprimer le compte. Veuillez réessayer plus tard.');
        
        setTimeout(() => {
          setError(null);
        }, 3000);
      }
    }
  };
  
  // Récupérer les données d'un joueur Valorant depuis l'API Riot
  const fetchPlayerData = async (username: string, tag: string, region: string) => {
    try {
      // Vérifier que la clé API existe
      if (!RIOT_API_KEY) {
        throw new Error("Clé API Riot non disponible");
      }
      
      // Recherche du compte par nom et tag
      const accountResponse = await fetch(
        `https://europe.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(username)}/${encodeURIComponent(tag)}`,
        {
          headers: {
            'X-Riot-Token': RIOT_API_KEY
          }
        }
      );
      
      if (!accountResponse.ok) {
        throw new Error(`Erreur API: ${accountResponse.status}`);
      }
      
      const accountData = await accountResponse.json();
      const puuid = accountData.puuid;
      
      // Convertir la région pour les API Valorant (différentes régions dans l'API Valorant)
      const valorantRegion = convertRegion(region);
      
      // Récupérer les données de rang du joueur
      const rankResponse = await fetch(
        `https://${valorantRegion}.api.riotgames.com/val/ranked/v1/leaderboards/by-puuid/${puuid}`,
        {
          headers: {
            'X-Riot-Token': RIOT_API_KEY
          }
        }
      );
      
      // Si nous ne pouvons pas obtenir les données de rang, retourner juste les informations du compte
      if (!rankResponse.ok) {
        return {
          riotId: puuid,
          username,
          tag,
          region,
          lastUpdated: Date.now()
        };
      }
      
      const rankData = await rankResponse.json();
      
      // Créer l'objet de rang
      const rankInfo = {
        currentRank: getRankName(rankData.tier),
        currentTier: rankData.tier.toString(),
        rankIcon: getRankIcon(rankData.tier),
        // Ces valeurs devraient être mises à jour avec les vraies données si disponibles
        bestRank: getRankName(rankData.tier),
        bestTier: rankData.tier.toString()
      };
      
      return {
        riotId: puuid,
        username,
        tag,
        region,
        lastUpdated: Date.now(),
        rank: rankInfo
      };
    } catch (err) {
      console.error('Erreur lors de la récupération des données du joueur:', err);
      throw err;
    }
  };
  
  // Convertir la région pour l'API Valorant
  const convertRegion = (region: string): string => {
    switch (region) {
      case 'eu': return 'eu'; 
      case 'na': return 'na';
      case 'ap': return 'ap';
      case 'kr': return 'kr';
      case 'latam': return 'latam';
      case 'br': return 'br';
      default: return 'eu';
    }
  };
  
  // Obtenir le nom du rang à partir de l'ID de tier
  const getRankName = (tier: number): string => {
    // Cette fonction devrait être adaptée aux rangs de Valorant
    const ranks = [
      'Iron', 'Bronze', 'Silver', 'Gold', 'Platinum',
      'Diamond', 'Ascendant', 'Immortal', 'Radiant'
    ];
    
    // Convertir le tier en nom de rang (approximation)
    const rankIndex = Math.floor((tier - 3) / 3);
    return ranks[Math.max(0, Math.min(rankIndex, ranks.length - 1))];
  };
  
  // Obtenir l'icône du rang à partir de l'ID de tier
  const getRankIcon = (tier: number): string => {
    // Cette fonction devrait retourner l'URL de l'icône du rang
    // On pourrait utiliser valorant-api.com pour obtenir ces icônes
    const rankName = getRankName(tier).toLowerCase();
    return `https://dash.valorant-api.com/assets/ranks/${rankName}.png`;
  };
  
  // Rafraîchir les données d'un compte
  const refreshAccountData = async (account: RiotAccount) => {
    try {
      setLoading(true);
      
      // Récupérer les données mises à jour
      const updatedData = await fetchPlayerData(account.username, account.tag, account.region);
      
      // Mettre à jour dans Firebase
      const accountRef = ref(database, `riotAccounts/${account.id}`);
      await update(accountRef, updatedData);
      
      // Mettre à jour l'état local
      setAccounts(accounts.map(acc => 
        acc.id === account.id ? { ...acc, ...updatedData } : acc
      ));
      
      setSuccess('Données du compte mises à jour avec succès.');
      
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err) {
      console.error('Erreur lors de la mise à jour des données du compte:', err);
      setError('Impossible de mettre à jour les données du compte. Veuillez réessayer plus tard.');
      
      setTimeout(() => {
        setError(null);
      }, 3000);
    } finally {
      setLoading(false);
    }
  };
  
  // Soumettre le formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation basique
    if (!newAccount.username || !newAccount.tag) {
      setError('Veuillez fournir un nom d\'utilisateur et un tag.');
      return;
    }
    
    try {
      setError(null);
      setLoading(true);
      
      // Récupérer les données du joueur à partir de l'API Riot
      const playerData = await fetchPlayerData(
        newAccount.username,
        newAccount.tag,
        newAccount.region
      );
      
      if (isEditing && selectedAccount) {
        // Mettre à jour un compte existant
        const accountRef = ref(database, `riotAccounts/${selectedAccount.id}`);
        await update(accountRef, {
          ...playerData,
          lastUpdated: Date.now()
        });
        
        setAccounts(accounts.map(account => 
          account.id === selectedAccount.id 
            ? { ...account, ...playerData, lastUpdated: Date.now() } 
            : account
        ));
        
        setSuccess('Compte RIOT mis à jour avec succès.');
      } else {
        // Créer un nouveau compte
        const newId = uuidv4();
        const accountRef = ref(database, `riotAccounts/${newId}`);
        
        await set(accountRef, {
          ...playerData,
          lastUpdated: Date.now()
        });
        
        setAccounts([
          ...accounts,
          {
            id: newId,
            ...playerData,
            lastUpdated: Date.now()
          }
        ]);
        
        setSuccess('Compte RIOT ajouté avec succès.');
      }
      
      // Réinitialiser le formulaire après 2 secondes
      setTimeout(() => {
        resetForm();
      }, 2000);
    } catch (err) {
      console.error('Erreur lors de l\'ajout/mise à jour du compte RIOT:', err);
      setError('Erreur lors de l\'ajout du compte. Vérifiez le nom d\'utilisateur et le tag.');
    } finally {
      setLoading(false);
    }
  };
  
  // Charger les armes et leurs skins depuis l'API Valorant
  const loadWeapons = async () => {
    try {
      setLoadingWeapons(true);
      setWeaponError(null);
      
      const response = await fetch('https://valorant-api.com/v1/weapons');
      
      if (!response.ok) {
        throw new Error(`Erreur API: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.status === 200) {
        setWeapons(data.data);
      } else {
        throw new Error('Erreur lors du chargement des armes');
      }
    } catch (err) {
      console.error('Erreur lors du chargement des armes:', err);
      setWeaponError('Impossible de charger les armes Valorant. Veuillez réessayer plus tard.');
    } finally {
      setLoadingWeapons(false);
    }
  };
  
  // Afficher les détails d'une arme
  const showWeaponDetailsModal = (weapon: Weapon) => {
    setSelectedWeapon(weapon);
    setShowWeaponDetails(true);
  };
  
  // Afficher les détails d'un skin
  const showSkinDetailsModal = (skin: WeaponSkin) => {
    setSelectedSkin(skin);
    setShowSkinDetails(true);
  };
  
  // Ouvrir le modal de liaison de comptes
  const openLinkAccountsModal = (accountId: string) => {
    setPrimaryAccountId(accountId);
    const account = accounts.find(acc => acc.id === accountId);
    setAccountsToLink(account?.linkedAccounts || []);
    setShowLinkAccountsModal(true);
  };
  
  // Lier des comptes ensemble
  const linkAccounts = async () => {
    if (!primaryAccountId) return;
    
    try {
      setLoading(true);
      
      // Mettre à jour le compte principal
      const primaryAccountRef = ref(database, `riotAccounts/${primaryAccountId}`);
      await update(primaryAccountRef, {
        linked: true,
        linkedAccounts: accountsToLink
      });
      
      // Mettre à jour tous les comptes liés
      for (const linkedAccountId of accountsToLink) {
        const linkedAccountRef = ref(database, `riotAccounts/${linkedAccountId}`);
        await update(linkedAccountRef, {
          linked: true,
          linkedAccounts: [primaryAccountId, ...accountsToLink.filter(id => id !== linkedAccountId)]
        });
      }
      
      // Mettre à jour l'état local
      setAccounts(accounts.map(account => {
        if (account.id === primaryAccountId) {
          return {
            ...account,
            linked: true,
            linkedAccounts: accountsToLink
          };
        } else if (accountsToLink.includes(account.id)) {
          return {
            ...account,
            linked: true,
            linkedAccounts: [primaryAccountId, ...accountsToLink.filter(id => id !== account.id)]
          };
        }
        return account;
      }));
      
      setSuccess('Comptes liés avec succès.');
      setShowLinkAccountsModal(false);
      
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err) {
      console.error('Erreur lors de la liaison des comptes:', err);
      setError('Impossible de lier les comptes. Veuillez réessayer plus tard.');
      
      setTimeout(() => {
        setError(null);
      }, 3000);
    } finally {
      setLoading(false);
    }
  };
  
  // Charger les agents et armes lors du changement d'onglet
  useEffect(() => {
    if (activeTab === 'agents') {
      // Pour l'instant, on charge les armes aussi pour l'onglet agents
      loadWeapons();
    } else if (activeTab === 'skins') {
      loadWeapons();
    }
  }, [activeTab]);
  
  // Rendu du composant
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">Gestion des comptes RIOT</h2>
          <p className="text-gray-400 text-sm">Gérez vos comptes RIOT pour accéder aux statistiques de Valorant</p>
        </div>
        
        {activeTab === 'accounts' && (
          <button 
            onClick={() => { resetForm(); setShowForm(true); }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center w-full sm:w-auto justify-center"
            disabled={loading}
          >
            <Plus size={18} className="mr-2" />
            Ajouter un compte
          </button>
        )}
      </div>
      
      {/* Tabs de navigation */}
      <div className="flex border-b border-gray-700 mb-6">
        <button
          className={`py-3 px-6 font-medium text-sm ${activeTab === 'accounts' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-400 hover:text-white'}`}
          onClick={() => setActiveTab('accounts')}
        >
          <Users size={16} className="inline mr-2" />
          Comptes
        </button>
        <button
          className={`py-3 px-6 font-medium text-sm ${activeTab === 'agents' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-400 hover:text-white'}`}
          onClick={() => setActiveTab('agents')}
        >
          <Shield size={16} className="inline mr-2" />
          Agents
        </button>
        <button
          className={`py-3 px-6 font-medium text-sm ${activeTab === 'skins' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-400 hover:text-white'}`}
          onClick={() => setActiveTab('skins')}
        >
          <Swords size={16} className="inline mr-2" />
          Skins
        </button>
      </div>
      
      {/* Messages d'erreur et de succès */}
      {error && (
        <div className="p-3 mb-4 bg-red-900/30 border border-red-700 rounded-lg text-red-400">
          {error}
        </div>
      )}
      
      {success && (
        <div className="p-3 mb-4 bg-green-900/30 border border-green-700 rounded-lg text-green-400">
          {success}
        </div>
      )}
      
      {activeTab === 'accounts' && (
        <>
          {/* Barre de recherche */}
          <div className="mb-6">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un compte par nom ou tag..."
                className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          {/* Liste des comptes */}
          {loading && accounts.length === 0 ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <>
              {filteredAccounts.length === 0 ? (
                <div className="bg-gray-800 rounded-xl p-8 text-center">
                  <p className="text-gray-400">
                    {searchQuery 
                      ? "Aucun compte ne correspond à votre recherche." 
                      : "Aucun compte RIOT n'a été ajouté pour le moment."}
                  </p>
                  {searchQuery && (
                    <button
                      className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white"
                      onClick={() => setSearchQuery('')}
                    >
                      Effacer la recherche
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredAccounts.map(account => (
                    <div key={account.id} className={`bg-gray-800 rounded-xl overflow-hidden shadow-lg border ${account.linked ? 'border-purple-500/50' : 'border-gray-700'}`}>
                      <div className="p-5">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-lg font-semibold">{account.username}</h3>
                            <p className="text-sm text-gray-400">#{account.tag}</p>
                          </div>
                          
                          {/* Indicateur de région */}
                          <span className="px-2 py-1 bg-gray-700 text-xs rounded-full">
                            {REGIONS.find(r => r.value === account.region)?.label || account.region}
                          </span>
                        </div>
                        
                        {/* Indicateur de comptes liés */}
                        {account.linked && (
                          <div className="mb-3 p-2 bg-purple-900/30 border border-purple-700/50 rounded-lg flex items-center">
                            <LinkIcon size={14} className="mr-2 text-purple-400" />
                            <p className="text-xs text-purple-400">
                              {account.linkedAccounts?.length === 1 
                                ? "Compte lié à 1 autre compte" 
                                : `Compte lié à ${account.linkedAccounts?.length} autres comptes`}
                            </p>
                          </div>
                        )}
                        
                        {/* Statistiques de rang */}
                        {account.rank ? (
                          <div className="mb-4 p-4 bg-gray-700/40 rounded-lg">
                            <div className="flex items-center mb-3">
                              {account.rank.rankIcon && (
                                <img 
                                  src={account.rank.rankIcon} 
                                  alt={account.rank.currentRank} 
                                  className="w-12 h-12 mr-3"
                                />
                              )}
                              <div>
                                <p className="text-sm text-gray-400">Rang actuel</p>
                                <p className="font-bold">{account.rank.currentRank}</p>
                              </div>
                            </div>
                            
                            <div className="text-sm grid grid-cols-2 gap-2">
                              <div>
                                <p className="text-gray-400">Meilleur rang</p>
                                <p>{account.rank.bestRank || "Non disponible"}</p>
                              </div>
                              
                              {account.rank.seasonRanks && account.rank.seasonRanks.length > 0 && (
                                <div>
                                  <p className="text-gray-400">Dernier épisode</p>
                                  <p>{account.rank.seasonRanks[0].rank}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="mb-4 p-4 bg-gray-700/40 rounded-lg flex items-center text-gray-400">
                            <AlertTriangle size={18} className="mr-2" />
                            <p>Données de rang non disponibles</p>
                          </div>
                        )}
                        
                        {/* Date de dernière mise à jour */}
                        <p className="text-xs text-gray-500 mb-4">
                          Dernière mise à jour: {new Date(account.lastUpdated).toLocaleDateString('fr-FR', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                        
                        {/* Actions */}
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => refreshAccountData(account)}
                            className="flex-1 min-w-[80px] px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center justify-center text-sm"
                            disabled={loading}
                          >
                            <RefreshCw size={16} className="mr-1" />
                            Actualiser
                          </button>
                          
                          <button
                            onClick={() => openEditForm(account)}
                            className="flex-1 min-w-[80px] px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center justify-center text-sm"
                          >
                            <Edit size={16} className="mr-1" />
                            Modifier
                          </button>
                          
                          <button
                            onClick={() => openLinkAccountsModal(account.id)}
                            className="flex-1 min-w-[80px] px-3 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg flex items-center justify-center text-sm"
                          >
                            <Link size={16} className="mr-1" />
                            Lier
                          </button>
                          
                          <button
                            onClick={() => deleteAccount(account.id)}
                            className="px-3 py-2 bg-red-600/30 hover:bg-red-600/50 text-red-400 rounded-lg flex items-center justify-center text-sm"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </>
      )}
      
      {activeTab === 'skins' && (
        <>
          {weaponError && (
            <div className="p-3 mb-4 bg-red-900/30 border border-red-700 rounded-lg text-red-400">
              {weaponError}
            </div>
          )}
          
          {loadingWeapons ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {weapons.map(weapon => (
                  <div 
                    key={weapon.uuid} 
                    className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700 hover:border-blue-500 transition-colors cursor-pointer"
                    onClick={() => showWeaponDetailsModal(weapon)}
                  >
                    <div className="p-4">
                      <div className="flex items-center mb-3">
                        <img 
                          src={weapon.displayIcon} 
                          alt={weapon.displayName} 
                          className="h-12 w-20 object-contain mr-3"
                        />
                        <div>
                          <h3 className="font-medium">{weapon.displayName}</h3>
                          <p className="text-sm text-gray-400">{weapon.category}</p>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mb-3">{weapon.skins.length} skins disponibles</p>
                      <button className="w-full px-3 py-2 bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 rounded-lg text-sm">
                        Voir les skins
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}
      
      {/* Formulaire de création/édition */}
      {showForm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 overflow-y-auto flex justify-center items-start pt-4 md:pt-10 pb-10 md:pb-20">
          <div className="bg-gray-800 rounded-xl p-4 md:p-6 max-w-md w-full mx-2 md:mx-4 shadow-2xl border border-gray-700">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">
                {isEditing ? 'Modifier le compte RIOT' : 'Ajouter un compte RIOT'}
              </h2>
              <button 
                onClick={() => setShowForm(false)}
                className="p-1 hover:bg-gray-700 rounded-full"
              >
                <X size={20} />
              </button>
            </div>
            
            {error && (
              <div className="mb-4 p-3 bg-red-900/30 border border-red-700 rounded-lg text-red-400">
                {error}
              </div>
            )}
            
            {success && (
              <div className="mb-4 p-3 bg-green-900/30 border border-green-700 rounded-lg text-green-400">
                {success}
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Nom d'utilisateur</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={newAccount.username}
                    onChange={(e) => setNewAccount({...newAccount, username: e.target.value})}
                    placeholder="Ex: Valorant123"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Tag</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={newAccount.tag}
                    onChange={(e) => setNewAccount({...newAccount, tag: e.target.value})}
                    placeholder="Ex: EU1"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Région</label>
                  <select
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={newAccount.region}
                    onChange={(e) => setNewAccount({...newAccount, region: e.target.value})}
                  >
                    {REGIONS.map(region => (
                      <option key={region.value} value={region.value}>
                        {region.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="mt-6 flex space-x-2">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center justify-center"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <Edit size={18} className="mr-1" />
                      {isEditing ? 'Mettre à jour' : 'Ajouter'}
                    </>
                  )}
                </button>
                
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Modal de détails d'arme */}
      {showWeaponDetails && selectedWeapon && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 overflow-y-auto flex justify-center items-start pt-4 pb-10">
          <div className="bg-gray-800 rounded-xl p-4 md:p-6 max-w-6xl w-full mx-2 md:mx-4 shadow-2xl border border-gray-700">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold flex items-center">
                <img 
                  src={selectedWeapon.displayIcon} 
                  alt={selectedWeapon.displayName} 
                  className="h-8 w-12 object-contain mr-2"
                />
                {selectedWeapon.displayName}
              </h2>
              <button 
                onClick={() => setShowWeaponDetails(false)}
                className="p-1 hover:bg-gray-700 rounded-full"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="mb-6">
              <h3 className="font-medium text-lg mb-3 pb-2 border-b border-gray-700">Skins disponibles</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-[600px] overflow-y-auto p-1">
                {selectedWeapon.skins.map(skin => (
                  <div 
                    key={skin.uuid} 
                    className="bg-gray-700 rounded-lg overflow-hidden border border-gray-600 hover:border-blue-500 transition-colors cursor-pointer"
                    onClick={() => showSkinDetailsModal(skin)}
                  >
                    <div className="aspect-video bg-gray-900 flex items-center justify-center overflow-hidden">
                      {skin.displayIcon ? (
                        <img 
                          src={skin.displayIcon} 
                          alt={skin.displayName} 
                          className="h-full w-full object-contain"
                        />
                      ) : (
                        <img 
                          src={selectedWeapon.displayIcon} 
                          alt={selectedWeapon.displayName} 
                          className="h-3/4 w-3/4 object-contain opacity-50"
                        />
                      )}
                    </div>
                    <div className="p-3">
                      <h4 className="font-medium text-sm truncate">{skin.displayName}</h4>
                      <p className="text-xs text-gray-400 mt-1">
                        {skin.chromas.length > 0 && `${skin.chromas.length} chromas`}
                        {skin.chromas.length > 0 && skin.levels.length > 0 && ' • '}
                        {skin.levels.length > 0 && `${skin.levels.length} niveaux`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal de détails de skin */}
      {showSkinDetails && selectedSkin && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 overflow-y-auto flex justify-center items-start pt-4 pb-10">
          <div className="bg-gray-800 rounded-xl p-4 md:p-6 max-w-6xl w-full mx-2 md:mx-4 shadow-2xl border border-gray-700">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">{selectedSkin.displayName}</h2>
              <button 
                onClick={() => setShowSkinDetails(false)}
                className="p-1 hover:bg-gray-700 rounded-full"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center mb-4 overflow-hidden">
                  {selectedSkin.displayIcon ? (
                    <img 
                      src={selectedSkin.displayIcon} 
                      alt={selectedSkin.displayName} 
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : selectedSkin.wallpaper ? (
                    <img 
                      src={selectedSkin.wallpaper} 
                      alt={selectedSkin.displayName} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-gray-500 flex items-center justify-center h-full w-full">
                      <Target size={40} />
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <h3 className="font-medium text-lg mb-3">Chromas</h3>
                {selectedSkin.chromas.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
                    {selectedSkin.chromas.map(chroma => (
                      <div key={chroma.uuid} className="bg-gray-700 rounded-lg overflow-hidden">
                        <div className="aspect-video bg-gray-900 flex items-center justify-center">
                          {chroma.fullRender ? (
                            <img 
                              src={chroma.fullRender} 
                              alt={chroma.displayName} 
                              className="h-full w-full object-contain"
                            />
                          ) : chroma.displayIcon ? (
                            <img 
                              src={chroma.displayIcon} 
                              alt={chroma.displayName} 
                              className="h-full w-full object-contain"
                            />
                          ) : (
                            <div className="text-gray-500 flex items-center justify-center h-full w-full">
                              <Target size={24} />
                            </div>
                          )}
                        </div>
                        <div className="p-2">
                          <p className="text-xs text-center truncate">{chroma.displayName}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400 mb-6">Aucun chroma disponible</p>
                )}
                
                <h3 className="font-medium text-lg mb-3">Niveaux</h3>
                {selectedSkin.levels.length > 0 ? (
                  <div className="space-y-3">
                    {selectedSkin.levels.map(level => (
                      <div key={level.uuid} className="bg-gray-700 rounded-lg p-3 flex items-center">
                        {level.displayIcon ? (
                          <img 
                            src={level.displayIcon} 
                            alt="" 
                            className="h-10 w-10 mr-3 object-contain"
                          />
                        ) : (
                          <Crosshair size={24} className="mr-3 text-gray-500" />
                        )}
                        <div>
                          <p className="font-medium text-sm">{level.displayName}</p>
                          {level.streamedVideo && (
                            <a 
                              href={level.streamedVideo} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-xs text-blue-400 hover:text-blue-300 mt-1 inline-block"
                              onClick={(e) => e.stopPropagation()}
                            >
                              Voir la vidéo
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400">Aucun niveau disponible</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal pour lier des comptes */}
      {showLinkAccountsModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 overflow-y-auto flex justify-center items-start pt-4 md:pt-10 pb-10 md:pb-20">
          <div className="bg-gray-800 rounded-xl p-4 md:p-6 max-w-md w-full mx-2 md:mx-4 shadow-2xl border border-gray-700">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Lier des comptes</h2>
              <button 
                onClick={() => setShowLinkAccountsModal(false)}
                className="p-1 hover:bg-gray-700 rounded-full"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <p className="text-sm text-gray-300">
                Sélectionnez les comptes que vous souhaitez lier à ce compte principal.
                Les comptes liés seront regroupés ensemble pour faciliter l'accès.
              </p>
              
              <div className="mt-4 mb-6">
                <h3 className="font-medium text-sm mb-2">Compte principal:</h3>
                {primaryAccountId && (
                  <div className="p-3 bg-gray-700 rounded-lg">
                    {accounts.find(acc => acc.id === primaryAccountId)?.username} 
                    #{accounts.find(acc => acc.id === primaryAccountId)?.tag}
                  </div>
                )}
              </div>
              
              <div className="mb-4">
                <h3 className="font-medium text-sm mb-2">Comptes à lier:</h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {accounts
                    .filter(acc => acc.id !== primaryAccountId)
                    .map(account => (
                      <div key={account.id} className="flex items-center p-2 bg-gray-700 rounded-lg">
                        <input
                          type="checkbox"
                          id={`account-${account.id}`}
                          checked={accountsToLink.includes(account.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setAccountsToLink([...accountsToLink, account.id]);
                            } else {
                              setAccountsToLink(accountsToLink.filter(id => id !== account.id));
                            }
                          }}
                          className="mr-3 h-4 w-4"
                        />
                        <label htmlFor={`account-${account.id}`} className="flex-1 cursor-pointer">
                          <div className="text-sm font-medium">{account.username}</div>
                          <div className="text-xs text-gray-400">#{account.tag}</div>
                        </label>
                      </div>
                    ))}
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex space-x-2">
              <button
                onClick={linkAccounts}
                className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg flex items-center justify-center"
                disabled={loading}
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                ) : (
                  <>
                    <Link size={18} className="mr-1" />
                    Lier les comptes
                  </>
                )}
              </button>
              
              <button
                type="button"
                onClick={() => setShowLinkAccountsModal(false)}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RiotManager; 