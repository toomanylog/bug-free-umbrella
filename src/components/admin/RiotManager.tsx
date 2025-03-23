import React, { useState, useEffect } from 'react';
import { database } from '../../firebase/config';
import { ref, get, set, remove, update } from 'firebase/database';
import { useAuth } from '../../contexts/AuthContext';
import { Plus, X, Search, Edit, Trash2, RefreshCw, Shield, Users, AlertTriangle, Target, Crosshair, Link, LinkIcon, Swords, Play, Check } from 'lucide-react';
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
  email?: string;
  password?: string;
  login?: string;
  manualRank?: boolean;
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
  order?: number; // Pour l'ordre d'affichage des cartes
  ownedSkins?: string[]; // IDs des skins possédés
  ownedAgents?: string[]; // IDs des agents possédés
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
  { value: 'br', label: 'Brésil' },
  { value: 'tr', label: 'Turquie' }
];

// Clé API Riot
const RIOT_API_KEY = process.env.REACT_APP_RIOT_API_KEY || 'RGAPI-80c93110-b305-4d8d-bbe1-b067038b1e54';

// Ajouter une fonction de chiffrement/déchiffrement simple pour les mots de passe
// Définir un sel pour le chiffrement (idéalement, ce serait dans des variables d'environnement)
const ENCRYPTION_KEY = "valorant-dashboard-secret-key";

// Fonction pour chiffrer un mot de passe
const encryptPassword = (password: string): string => {
  try {
    // Simple encodage en base64 avec un préfixe 
    return `eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.${btoa(password)}`;
  } catch (e) {
    console.error("Erreur lors du chiffrement:", e);
    return password;
  }
};

// Fonction pour déchiffrer un mot de passe
const decryptPassword = (encrypted: string): string => {
  try {
    if (encrypted.startsWith('eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.')) {
      const base64 = encrypted.replace('eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.', '');
      return atob(base64);
    }
    return encrypted;
  } catch (e) {
    console.error("Erreur lors du déchiffrement:", e);
    return encrypted;
  }
};

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
    lastUpdated: Date.now(),
    email: '',
    password: '',
    login: '',
    manualRank: false
  });
  
  // État pour le mode avancé
  const [advancedMode, setAdvancedMode] = useState<boolean>(false);
  
  const [activeTab, setActiveTab] = useState<'accounts' | 'agents' | 'skins'>('accounts');
  const [weapons, setWeapons] = useState<Weapon[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  const [loadingWeapons, setLoadingWeapons] = useState<boolean>(false);
  const [loadingAgents, setLoadingAgents] = useState<boolean>(false);
  const [weaponError, setWeaponError] = useState<string | null>(null);
  const [agentError, setAgentError] = useState<string | null>(null);
  const [selectedWeapon, setSelectedWeapon] = useState<Weapon | null>(null);
  const [selectedSkin, setSelectedSkin] = useState<WeaponSkin | null>(null);
  const [showSkinDetails, setShowSkinDetails] = useState<boolean>(false);
  const [showWeaponDetails, setShowWeaponDetails] = useState<boolean>(false);
  const [showLinkAccountsModal, setShowLinkAccountsModal] = useState<boolean>(false);
  const [accountsToLink, setAccountsToLink] = useState<string[]>([]);
  const [primaryAccountId, setPrimaryAccountId] = useState<string | null>(null);
  const [showVideo, setShowVideo] = useState<string>('');
  // Ajouter après la déclaration des autres états (vers la ligne 156)
  const [copiedField, setCopiedField] = useState<{accountId: string, field: string} | null>(null);
  
  // Ajouter ces états dans la fonction RiotManager (après les autres useState)
  const [accountOrder, setAccountOrder] = useState<string[]>([]);
  const [draggingEnabled, setDraggingEnabled] = useState<boolean>(false);
  const [editingOwnedItems, setEditingOwnedItems] = useState<string | null>(null);
  
  // Ajouter l'état pour la recherche de skins
  const [skinSearchQuery, setSkinSearchQuery] = useState<string>("");
  
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
      lastUpdated: Date.now(),
      email: '',
      password: '',
      login: '',
      manualRank: false
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
      rank: account.rank,
      email: account.email || '',
      password: account.password || '',
      login: account.login || '',
      manualRank: account.manualRank || false
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
        console.warn("Clé API Riot non disponible, mode manuel activé par défaut");
        return {
          username,
          tag,
          region,
          lastUpdated: Date.now()
        };
      }
      
      console.log(`Tentative de récupération des données pour ${username}#${tag} dans la région ${region}`);
      
      // Vérifier que le nom et le tag sont valides avant de faire une requête API
      if (!username || !tag) {
        console.warn("Nom d'utilisateur ou tag manquant");
        return {
          username: username || "",
          tag: tag || "",
          region,
          lastUpdated: Date.now()
        };
      }
      
      // Nettoyage et vérification des valeurs
      const cleanUsername = encodeURIComponent(username.trim());
      const cleanTag = encodeURIComponent(tag.trim());
      
      console.log(`Appel API avec username='${cleanUsername}' et tag='${cleanTag}'`);
      
      try {
      // Recherche du compte par nom et tag
      const accountResponse = await fetch(
        `https://europe.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${cleanUsername}/${cleanTag}`,
        {
          headers: {
            'X-Riot-Token': RIOT_API_KEY
          }
        }
      );
      
      // Vérifier les erreurs spécifiques
      if (!accountResponse.ok) {
        const status = accountResponse.status;
        if (status === 400) {
          console.error('Erreur 400: Vérifiez le format du nom d\'utilisateur et du tag');
            console.warn("Utilisation des données fournies manuellement au lieu de récupérer depuis l'API");
            return {
              username,
              tag,
              region,
              lastUpdated: Date.now()
            };
        } else if (status === 401) {
          console.error('Erreur 401: Clé API Riot non valide ou expirée');
          throw new Error(`Erreur API Riot: Clé API non valide ou expirée`);
        } else if (status === 403) {
          console.error('Erreur 403: Accès refusé à l\'API Riot');
          throw new Error(`Erreur API Riot: Accès refusé`);
        } else if (status === 404) {
          console.error('Erreur 404: Compte non trouvé');
            console.warn("Utilisation des données fournies manuellement au lieu de récupérer depuis l'API");
            return {
              username,
              tag,
              region,
              lastUpdated: Date.now()
            };
        } else {
          console.error(`Erreur API Riot: ${status}`);
          throw new Error(`Erreur API: ${status}`);
        }
      }
      
      const accountData = await accountResponse.json();
      console.log('Données du compte récupérées:', accountData);
      const puuid = accountData.puuid;
      
      // Créer un objet de compte de base
      const baseAccount = {
        riotId: puuid,
        username,
        tag,
        region,
        lastUpdated: Date.now()
      };
      
      return baseAccount;
      } catch (apiError) {
        console.error("Erreur API:", apiError);
        console.warn("Utilisation des données fournies manuellement au lieu de récupérer depuis l'API");
        return {
          username,
          tag,
          region,
          lastUpdated: Date.now()
        };
      }
    } catch (err: any) {
      console.error('Erreur lors de la récupération des données du joueur:', err);
      // Au lieu de lancer une erreur, retourner les données de base pour permettre la création manuelle
      return {
        username,
        tag,
        region,
        lastUpdated: Date.now()
      };
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
      case 'tr': return 'tr';
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
  
  // Modifier la fonction getRankIconByName pour utiliser les liens d'images externes
  const getRankIconByName = (rankName: string): string => {
    // Si pas de rankName ou "Non classé", retourner une icône par défaut
    if (!rankName || rankName.toLowerCase() === "non classé") {
      return "https://i.ibb.co/MDKnWB3w/Iron-1-Rank.png"; // Image par défaut Iron 1
    }

    try {
      // Cas spécial pour "Radiant"
      if (rankName.toLowerCase() === "radiant") {
        return "https://i.ibb.co/ffMr9D1/Radiant-Rank.png";
      }

      // Extraire le nom du rang et le numéro (si présent)
      const parts = rankName.split(' ');
      if (parts.length < 2) {
        console.warn(`Format de rang incomplet: ${rankName}`);
        return "https://i.ibb.co/MDKnWB3w/Iron-1-Rank.png";
      }

      const rank = parts[0];
      const number = parts[1];

      // Utiliser les liens externes selon le rang et le numéro
      const rankImageLinks: Record<string, Record<string, string>> = {
        "Iron": {
          "1": "https://i.ibb.co/MDKnWB3w/Iron-1-Rank.png",
          "2": "https://i.ibb.co/nMh2T11t/Iron-2-Rank.png",
          "3": "https://i.ibb.co/0VndgK5p/Iron-3-Rank.png"
        },
        "Bronze": {
          "1": "https://i.ibb.co/spMqTvDw/Bronze-1-Rank.png",
          "2": "https://i.ibb.co/7xHxz929/Bronze-2-Rank.png",
          "3": "https://i.ibb.co/PGvzzhTw/Bronze-3-Rank.png"
        },
        "Silver": {
          "1": "https://i.ibb.co/Y7mzJCdQ/Silver-1-Rank.png",
          "2": "https://i.ibb.co/MyX1JK9C/Silver-2-Rank.png",
          "3": "https://i.ibb.co/1tbw3xYh/Silver-3-Rank.png"
        },
        "Gold": {
          "1": "https://i.ibb.co/2Yps71Kn/Gold-1-Rank.png",
          "2": "https://i.ibb.co/27KjRckc/Gold-2-Rank.png",
          "3": "https://i.ibb.co/zkZf9pv/Gold-3-Rank.png"
        },
        "Platinum": {
          "1": "https://i.ibb.co/Y4nPcYWz/Platinum-1-Rank.png",
          "2": "https://i.ibb.co/Kc0xdpb8/Platinum-2-Rank.png",
          "3": "https://i.ibb.co/9zbzBK3/Platinum-3-Rank.png"
        },
        "Diamond": {
          "1": "https://i.ibb.co/nMBhbz7X/Diamond-1-Rank.png",
          "2": "https://i.ibb.co/kVrtYDDZ/Diamond-2-Rank.png",
          "3": "https://i.ibb.co/YTwQRtFT/Diamond-3-Rank.png"
        },
        "Ascendant": {
          "1": "https://i.ibb.co/ZsrxFXL/Ascendant-1-Rank.png",
          "2": "https://i.ibb.co/4ZbD6gJf/Ascendant-2-Rank.png",
          "3": "https://i.ibb.co/9kG52C7P/Ascendant-3-Rank.png"
        },
        "Immortal": {
          "1": "https://i.ibb.co/bRmVbSFQ/Immortal-1-Rank.png",
          "2": "https://i.ibb.co/Zzmq5nXv/Immortal-2-Rank.png",
          "3": "https://i.ibb.co/SwDFzvY4/Immortal-3-Rank.png"
        }
      };

      if (rankImageLinks[rank] && rankImageLinks[rank][number]) {
        return rankImageLinks[rank][number];
      }

      console.warn(`Image de rang non trouvée pour: ${rankName}`);
      return "https://i.ibb.co/MDKnWB3w/Iron-1-Rank.png"; // Image par défaut en cas d'erreur
    } catch (error) {
      console.error("Erreur lors de la génération du chemin de l'image de rang:", error);
      return "https://i.ibb.co/MDKnWB3w/Iron-1-Rank.png"; // Image par défaut en cas d'erreur
    }
  };
  
  // Actualiser les données du compte
  const refreshAccountData = async (account: RiotAccount) => {
    try {
      if (!account.riotId) {
        // Si le compte n'a pas d'ID RIOT, essayer de le connecter
        await connectRiotAccount(account);
        return;
      }
      
      setLoading(true);
      setError(null);
      
      // Récupérer les données de rang du joueur
      const valorantRegion = convertRegion(account.region);
      
      const mmrResponse = await fetch(
        `https://${valorantRegion}.api.riotgames.com/val/ranked/v1/by-puuid/mmr/${encodeURIComponent(account.riotId)}`,
        {
          headers: {
            'X-Riot-Token': RIOT_API_KEY
          }
        }
      );
      
      if (mmrResponse.ok) {
        const mmrData = await mmrResponse.json();
        
        if (mmrData && mmrData.data) {
          const currentSeason = mmrData.data.current_data;
          
          account.rank = {
            currentRank: currentSeason?.currenttierpatched || "Non classé",
            currentTier: currentSeason?.currenttier?.toString() || "0",
            rankIcon: getRankIconByName(currentSeason?.currenttierpatched || "Non classé"),
            bestRank: currentSeason?.highesttierpatched || "Non classé",
            bestTier: currentSeason?.highesttier?.toString() || "0"
          };
          
          account.lastUpdated = Date.now();
          
          // Mettre à jour le compte dans la base de données
          const accountRef = ref(database, `riotAccounts/${account.id}`);
          await update(accountRef, {
            lastUpdated: account.lastUpdated,
            rank: account.rank
          });
          
          // Mettre à jour l'état local
          setAccounts(accounts.map(acc => 
            acc.id === account.id ? account : acc
          ));
          
          setSuccess('Données du compte mises à jour avec succès !');
        }
      } else {
        throw new Error(`Erreur API Riot MMR: ${mmrResponse.status}`);
      }
      
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
      
    } catch (err) {
      console.error('Erreur lors de l\'actualisation des données du compte:', err);
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
      
      // Préparer les données du compte
      let accountData: any = {
        ...newAccount,
        lastUpdated: Date.now()
      };
      
      // Si mode avancé, inclure les données supplémentaires
      if (advancedMode) {
        // Filtrer les champs vides
        if (!accountData.email) delete accountData.email;
        if (!accountData.password) delete accountData.password;
        if (!accountData.login) delete accountData.login;
        
        // Si en mode manuel, ne pas récupérer les données d'API
        if (newAccount.manualRank) {
          if (isEditing && selectedAccount) {
            // Mettre à jour un compte existant
            const accountRef = ref(database, `riotAccounts/${selectedAccount.id}`);
            await update(accountRef, accountData);
            
            setAccounts(accounts.map(account => 
              account.id === selectedAccount.id 
                ? { ...account, ...accountData } 
                : account
            ));
            
            setSuccess('Compte RIOT mis à jour avec succès.');
          } else {
            // Créer un nouveau compte
            const newId = uuidv4();
            const accountRef = ref(database, `riotAccounts/${newId}`);
            
            await set(accountRef, accountData);
            
            setAccounts([
              ...accounts,
              {
                id: newId,
                ...accountData
              }
            ]);
            
            setSuccess('Compte RIOT ajouté avec succès.');
          }
          
          // Réinitialiser le formulaire après 2 secondes
          setTimeout(() => {
            resetForm();
            setAdvancedMode(false);
          }, 2000);
          
          return;
        }
      }
      
      // Si le mode manuel n'est pas activé, récupérer les données du joueur depuis l'API
      const playerData = await fetchPlayerData(
        newAccount.username,
        newAccount.tag,
        newAccount.region
      );
      
      // Fusionner les données de l'API avec les données du mode avancé
      const mergedData: Partial<RiotAccount> = {
        ...playerData,
        lastUpdated: Date.now()
      };
      
      if (advancedMode) {
        if (newAccount.email) mergedData.email = newAccount.email;
        if (newAccount.password) mergedData.password = encryptPassword(newAccount.password);
        if (newAccount.login) mergedData.login = newAccount.login;
      }
      
      // S'assurer que riotId existe et est de type string
      if (!mergedData.riotId) {
        mergedData.riotId = newAccount.riotId || uuidv4(); // Utiliser l'ID existant ou en générer un nouveau
      }
      
      // Créer un objet complet de type RiotAccount
      const completeAccountData: RiotAccount = {
        id: isEditing && selectedAccount ? selectedAccount.id : uuidv4(),
        riotId: mergedData.riotId,
        username: mergedData.username || newAccount.username,
        tag: mergedData.tag || newAccount.tag,
        region: mergedData.region || newAccount.region,
        lastUpdated: mergedData.lastUpdated || Date.now(),
        ...(mergedData.rank && { rank: mergedData.rank }),
        ...(mergedData.email && { email: mergedData.email }),
        ...(mergedData.password && { password: mergedData.password }),
        ...(mergedData.login && { login: mergedData.login }),
        ...(mergedData.linked && { linked: mergedData.linked }),
        ...(mergedData.linkedAccounts && { linkedAccounts: mergedData.linkedAccounts }),
        ...(mergedData.manualRank && { manualRank: mergedData.manualRank }),
        order: isEditing && selectedAccount ? (selectedAccount.order || 0) : 0,
        ownedSkins: isEditing && selectedAccount ? selectedAccount.ownedSkins || [] : [],
        ownedAgents: isEditing && selectedAccount ? selectedAccount.ownedAgents || [] : []
      };
      
      if (isEditing && selectedAccount) {
        // Mettre à jour un compte existant
        const accountRef = ref(database, `riotAccounts/${selectedAccount.id}`);
        // Supprimer l'ID avant de mettre à jour (il ne doit pas être inclus dans les données Firebase)
        const { id, ...updateData } = completeAccountData;

        // Nettoyer les propriétés contenant des valeurs undefined
        // Pour rank, vérifier s'il existe et supprimer tous les champs undefined à l'intérieur
        if (updateData.rank) {
          // Utiliser une assertion de type pour éviter les erreurs TypeScript
          const rankObj = updateData.rank as Record<string, unknown>;
          Object.keys(rankObj).forEach(key => {
            if (rankObj[key] === undefined) {
              delete rankObj[key];
            }
          });
          // Si rank est un objet vide après le nettoyage, le supprimer complètement
          if (Object.keys(rankObj).length === 0) {
            delete updateData.rank;
          }
        }

        // Vérifier s'il y a d'autres propriétés undefined au niveau supérieur
        // Utiliser une assertion de type pour éviter les erreurs TypeScript
        const dataObj = updateData as Record<string, unknown>;
        Object.keys(dataObj).forEach(key => {
          if (dataObj[key] === undefined) {
            delete dataObj[key];
          }
        });

        await update(accountRef, updateData);
        
        setAccounts(accounts.map(account => 
          account.id === selectedAccount.id 
            ? completeAccountData 
            : account
        ));
        
        setSuccess('Compte RIOT mis à jour avec succès.');
      } else {
        // Créer un nouveau compte
        const newId = completeAccountData.id;
        const accountRef = ref(database, `riotAccounts/${newId}`);
        
        // Supprimer l'ID avant de sauvegarder (il est déjà utilisé comme clé dans Firebase)
        const { id, ...saveData } = completeAccountData;

        // Même nettoyage pour les nouveaux comptes
        if (saveData.rank) {
          // Utiliser une assertion de type pour éviter les erreurs TypeScript
          const rankObj = saveData.rank as Record<string, unknown>;
          Object.keys(rankObj).forEach(key => {
            if (rankObj[key] === undefined) {
              delete rankObj[key];
            }
          });
          if (Object.keys(rankObj).length === 0) {
            delete saveData.rank;
          }
        }

        // Utiliser une assertion de type pour éviter les erreurs TypeScript
        const dataObj = saveData as Record<string, unknown>;
        Object.keys(dataObj).forEach(key => {
          if (dataObj[key] === undefined) {
            delete dataObj[key];
          }
        });

        await set(accountRef, saveData);
        
        setAccounts([
          ...accounts,
          completeAccountData
        ]);
        
        setSuccess('Compte RIOT ajouté avec succès.');
      }
      
      // Réinitialiser le formulaire après 2 secondes
      setTimeout(() => {
        resetForm();
        setAdvancedMode(false);
      }, 2000);
    } catch (err) {
      console.error('Erreur lors de l\'ajout/mise à jour du compte RIOT:', err);
      setError('Erreur lors de l\'ajout du compte. Vérifiez le nom d\'utilisateur et le tag.');
    } finally {
      setLoading(false);
    }
  };
  
  // Charger les armes depuis l'API Valorant
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
        const weaponsData = data.data;
        console.log(`Armes chargées: ${weaponsData.length}`);
        
        // Transformations pour l'affichage
        const formattedWeapons = weaponsData.map((weapon: Weapon) => {
          // Nettoyer la catégorie pour enlever "EEquippableCategory::"
          const categoryDisplay = weapon.category.replace('EEquippableCategory::', '');
          
          // Filtrer les skins "Standard" et "Random"
          const filteredSkins = weapon.skins.filter((skin: WeaponSkin) => 
            !skin.displayName.includes('Standard') && 
            !skin.displayName.includes('Random') &&
            !skin.displayName.includes('Default')
          );
          
          return {
            uuid: weapon.uuid,
            displayName: weapon.displayName,
            category: formatWeaponCategory(categoryDisplay),
            displayIcon: weapon.displayIcon,
            killStreamIcon: weapon.killStreamIcon,
            skins: filteredSkins
          };
        });
        
        setWeapons(formattedWeapons);
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
  
  // Formater la catégorie d'arme pour l'affichage
  const formatWeaponCategory = (category: string): string => {
    const categories: Record<string, string> = {
      'Heavy': 'Armes lourdes',
      'Rifle': 'Fusils d\'assaut',
      'Shotgun': 'Fusils à pompe',
      'Sidearm': 'Armes de poing',
      'SMG': 'Mitraillettes',
      'Sniper': 'Fusils de précision',
      'Melee': 'Corps-à-corps'
    };
    
    return categories[category] || category;
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
  
  // Charger les agents depuis l'API Valorant
  const loadAgents = async () => {
    try {
      setLoadingAgents(true);
      setAgentError(null);
      
      const response = await fetch('https://valorant-api.com/v1/agents?isPlayableCharacter=true');
      
      if (!response.ok) {
        throw new Error(`Erreur API: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.status === 200) {
        // Pour diagnostic - afficher dans la console le nombre d'agents
        console.log(`Agents chargés: ${data.data.length}`);
        setAgents(data.data);
      } else {
        throw new Error('Erreur lors du chargement des agents');
      }
    } catch (err) {
      console.error('Erreur lors du chargement des agents:', err);
      setAgentError('Impossible de charger les agents Valorant. Veuillez réessayer plus tard.');
    } finally {
      setLoadingAgents(false);
    }
  };
  
  // Charger les agents et armes lors du changement d'onglet
  useEffect(() => {
    if (activeTab === 'agents' && agents.length === 0) {
      loadAgents();
    } else if (activeTab === 'skins' && weapons.length === 0) {
      loadWeapons();
    }
  }, [activeTab, agents.length, weapons.length]);
  
  // Connexion au compte RIOT et récupération des données du joueur
  const connectRiotAccount = async (account: RiotAccount) => {
    try {
      setLoading(true);
      setError(null);
      
      if (!RIOT_API_KEY) {
        throw new Error("Clé API Riot non disponible");
      }
      
      console.log(`Tentative de connexion pour ${account.username}#${account.tag} dans la région ${account.region}`);
      
      // Nettoyage et vérification des valeurs
      const cleanUsername = encodeURIComponent(account.username.trim());
      const cleanTag = encodeURIComponent(account.tag.trim());
      
      console.log(`Appel API avec username='${cleanUsername}' et tag='${cleanTag}'`);
      
      // Recherche du compte par nom et tag
      const accountResponse = await fetch(
        `https://europe.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${cleanUsername}/${cleanTag}`,
        {
          headers: {
            'X-Riot-Token': RIOT_API_KEY
          }
        }
      );
      
      // Vérifier les erreurs spécifiques
      if (!accountResponse.ok) {
        const status = accountResponse.status;
        if (status === 400) {
          throw new Error(`Format de nom d'utilisateur ou tag invalide`);
        } else if (status === 401) {
          throw new Error(`Clé API Riot non valide ou expirée`);
        } else if (status === 403) {
          throw new Error(`Accès refusé à l'API Riot`);
        } else if (status === 404) {
          throw new Error(`Compte non trouvé: ${account.username}#${account.tag}`);
        } else {
          throw new Error(`Erreur API Riot: ${status}`);
        }
      }
      
      const accountData = await accountResponse.json();
      console.log('Données du compte récupérées:', accountData);
      const puuid = accountData.puuid;
      
      // Mettre à jour l'ID Riot dans le compte
      account.riotId = puuid;
      account.lastUpdated = Date.now();
      
      // Pour simplifier, ne pas récupérer le rang pour l'instant
      // Mettre à jour le compte dans la base de données
      const accountRef = ref(database, `riotAccounts/${account.id}`);
      await update(accountRef, {
        riotId: puuid,
        lastUpdated: account.lastUpdated
      });
      
      // Mettre à jour l'état local
      setAccounts(accounts.map(acc => 
        acc.id === account.id ? account : acc
      ));
      
      setSuccess('Compte RIOT connecté avec succès !');
      
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
      
    } catch (err: any) {
      console.error('Erreur lors de la connexion au compte RIOT:', err);
      setError(`Impossible de connecter le compte RIOT: ${err.message}`);
      
      setTimeout(() => {
        setError(null);
      }, 5000);
    } finally {
      setLoading(false);
    }
  };
  
  // Obtenir le tier numérique à partir du nom du rang
  const getRankTier = (rankName: string): number => {
    // Format attendu: "Iron 1", "Platinum 3", "Radiant"
    const ranks = [
      "Non classé", 
      "Iron 1", "Iron 2", "Iron 3",
      "Bronze 1", "Bronze 2", "Bronze 3",
      "Silver 1", "Silver 2", "Silver 3",
      "Gold 1", "Gold 2", "Gold 3",
      "Platinum 1", "Platinum 2", "Platinum 3",
      "Diamond 1", "Diamond 2", "Diamond 3",
      "Ascendant 1", "Ascendant 2", "Ascendant 3",
      "Immortal 1", "Immortal 2", "Immortal 3",
      "Radiant"
    ];
    
    // Trouver l'index du rang
    const index = ranks.indexOf(rankName);
    if (index === -1) return 0; // Non classé par défaut
    
    return index;
  };
  
  // Ajouter une fonction pour réparer/normaliser la structure des comptes existants
  const normalizeAccounts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Récupérer tous les comptes
      const accountsRef = ref(database, 'riotAccounts');
      const snapshot = await get(accountsRef);
      
      if (!snapshot.exists()) {
        setSuccess("Aucun compte à normaliser");
        return;
      }
      
      const updates: {[key: string]: any} = {};
      let normalizedCount = 0;
      
      // Parcourir tous les comptes et normaliser leur structure
      snapshot.forEach((childSnapshot) => {
        const accountId = childSnapshot.key;
        if (!accountId) return;
        
        const accountData = childSnapshot.val();
        let needsUpdate = false;
        
        // Vérifier et normaliser les champs obligatoires
        if (accountData.order === undefined) {
          updates[`riotAccounts/${accountId}/order`] = 999; // Valeur élevée par défaut
          needsUpdate = true;
        }
        
        // Vérifier et normaliser les champs optionnels
        if (accountData.password && typeof accountData.password === 'string' && !accountData.password.startsWith('eyJ')) {
          // Le mot de passe n'est pas chiffré, le chiffrer
          updates[`riotAccounts/${accountId}/password`] = encryptPassword(accountData.password);
          needsUpdate = true;
        }
        
        // Assurer que tous les comptes ont un riotId (même vide)
        if (accountData.riotId === undefined) {
          updates[`riotAccounts/${accountId}/riotId`] = "";
          needsUpdate = true;
        }
        
        if (needsUpdate) {
          normalizedCount++;
        }
      });
      
      // Appliquer les mises à jour si nécessaire
      if (normalizedCount > 0) {
        await update(ref(database), updates);
        console.log(`${normalizedCount} comptes normalisés`);
        setSuccess(`${normalizedCount} comptes ont été normalisés`);
        
        // Recharger manuellement les comptes pour voir les changements
        try {
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
          }
        } catch (err) {
          console.error('Erreur lors du rechargement des comptes après normalisation:', err);
        }
      } else {
        setSuccess("Tous les comptes sont déjà normalisés");
      }
    } catch (err) {
      console.error("Erreur lors de la normalisation des comptes:", err);
      setError("Impossible de normaliser les comptes");
    } finally {
      setLoading(false);
    }
  };
  
  // Ajouter cette fonction qui permet de réorganiser les comptes
  const reorderAccounts = (startIndex: number, endIndex: number) => {
    // Créer une nouvelle liste d'ordre basée sur la liste actuelle
    const newOrder = Array.from(accountOrder);
    // Retirer l'élément à son ancien index
    const [removed] = newOrder.splice(startIndex, 1);
    // Insérer l'élément à son nouvel index
    newOrder.splice(endIndex, 0, removed);
    
    // Mettre à jour l'état local
    setAccountOrder(newOrder);
    
    // Sauvegarder l'ordre dans Firebase
    const updates: {[key: string]: number} = {};
    newOrder.forEach((id, index) => {
      updates[`riotAccounts/${id}/order`] = index;
    });
    
    update(ref(database), updates)
      .then(() => {
        setSuccess('Ordre des comptes mis à jour');
        setTimeout(() => setSuccess(null), 3000);
      })
      .catch(err => {
        console.error('Erreur lors de la mise à jour de l\'ordre:', err);
        setError('Impossible de sauvegarder l\'ordre des comptes');
        setTimeout(() => setError(null), 3000);
      });
  };
  
  // Ajouter cette fonction pour attribuer/retirer un skin à un compte
  const toggleSkinOwnership = async (accountId: string, skinId: string) => {
    try {
      const account = accounts.find(acc => acc.id === accountId);
      if (!account) return;
      
      let ownedSkins = [...(account.ownedSkins || [])];
      
      if (ownedSkins.includes(skinId)) {
        // Retirer le skin
        ownedSkins = ownedSkins.filter(id => id !== skinId);
      } else {
        // Ajouter le skin
        ownedSkins.push(skinId);
      }
      
      // Mettre à jour Firebase
      const accountRef = ref(database, `riotAccounts/${accountId}/ownedSkins`);
      await set(accountRef, ownedSkins);
      
      // Mettre à jour l'état local
      setAccounts(accounts.map(acc => {
        if (acc.id === accountId) {
          return {...acc, ownedSkins};
        }
        return acc;
      }));
      
      // Supprimer les notifications de succès
      // setSuccess(`Skin ${ownedSkins.includes(skinId) ? 'ajouté au' : 'retiré du'} compte`);
    } catch (err) {
      console.error('Erreur lors de la modification des skins:', err);
      setError('Impossible de modifier les skins du compte');
    }
  };
  
  // Ajouter cette fonction pour attribuer/retirer un agent à un compte
  const toggleAgentOwnership = async (accountId: string, agentId: string) => {
    try {
      const account = accounts.find(acc => acc.id === accountId);
      if (!account) return;
      
      let ownedAgents = [...(account.ownedAgents || [])];
      
      if (ownedAgents.includes(agentId)) {
        // Retirer l'agent
        ownedAgents = ownedAgents.filter(id => id !== agentId);
      } else {
        // Ajouter l'agent
        ownedAgents.push(agentId);
      }
      
      // Mettre à jour Firebase
      const accountRef = ref(database, `riotAccounts/${accountId}/ownedAgents`);
      await set(accountRef, ownedAgents);
      
      // Mettre à jour l'état local
      setAccounts(accounts.map(acc => {
        if (acc.id === accountId) {
          return {...acc, ownedAgents};
        }
        return acc;
      }));
      
      // Supprimer les notifications de succès
      // setSuccess(`Agent ${ownedAgents.includes(agentId) ? 'ajouté au' : 'retiré du'} compte`);
    } catch (err) {
      console.error('Erreur lors de la modification des agents:', err);
      setError('Impossible de modifier les agents du compte');
    }
  };
  
  // Ajouter un effet pour initialiser l'ordre des comptes au chargement
  useEffect(() => {
    if (accounts.length > 0 && accountOrder.length === 0) {
      // Trier les comptes par ordre s'il existe, sinon par date de mise à jour
      const sortedAccounts = [...accounts].sort((a, b) => {
        if (a.order !== undefined && b.order !== undefined) {
          return a.order - b.order;
        }
        return b.lastUpdated - a.lastUpdated;
      });
      
      setAccountOrder(sortedAccounts.map(account => account.id));
    }
  }, [accounts, accountOrder.length]);
  
  // Ajouter cette fonction juste après la définition des fonctions toggleAgentOwnership et toggleSkinOwnership
  // Fonction pour gérer le clic sur "Modifier" pour les agents et skins
  const handleEditItemsClick = (type: string, accountId: string) => {
    const isCurrentlyEditing = editingOwnedItems === `${type}-${accountId}`;
    
    if (!isCurrentlyEditing) {
      // Charger les données si elles ne sont pas déjà chargées
      if (type === 'agents' && agents.length === 0) {
        loadAgents();
      } else if (type === 'skins' && weapons.length === 0) {
        loadWeapons();
      }
    }
    
    setEditingOwnedItems(isCurrentlyEditing ? null : `${type}-${accountId}`);
  };
  
  // Corriger la fonction getRankIcon manquante
  // Obtenir l'icône du rang à partir de l'ID de tier
  const getRankIcon = (tier: number): string => {
    // Utiliser les liens externes pour les icônes
    const rankName = getRankName(tier);
    return getRankIconByName(rankName);
  };
  
  // Rendu du composant
  return (
    <div className="p-4">
      {/* En-tête avec titre et boutons */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Gestion des comptes RIOT</h1>
          <p className="text-gray-400 text-sm">Gérez vos comptes RIOT pour accéder aux statistiques de Valorant</p>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={normalizeAccounts}
            className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg flex items-center shadow-md"
            title="Réparer les structures des comptes existants"
          >
            <RefreshCw size={16} className="mr-1" />
            Réparer les comptes
          </button>
          <button
            onClick={() => {
              resetForm();
              setIsEditing(false);
              setShowForm(true);
            }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center shadow-md"
          >
            <Plus size={16} className="mr-1" />
            Ajouter un compte
          </button>
        </div>
      </div>
      
      {/* Tabs de navigation */}
      <div className="border-b border-gray-700 mb-6 flex items-center">
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
        
        {activeTab === 'agents' && (
          <button
            className="py-3 px-4 ml-auto text-sm text-blue-400 hover:text-blue-300 flex items-center"
            onClick={loadAgents}
            disabled={loadingAgents}
          >
            <RefreshCw size={14} className={`mr-1 ${loadingAgents ? 'animate-spin' : ''}`} />
            Actualiser
          </button>
        )}
        
        {activeTab === 'skins' && (
          <button
            className="py-3 px-4 ml-auto text-sm text-blue-400 hover:text-blue-300 flex items-center"
            onClick={loadWeapons}
            disabled={loadingWeapons}
          >
            <RefreshCw size={14} className={`mr-1 ${loadingWeapons ? 'animate-spin' : ''}`} />
            Actualiser
          </button>
        )}
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
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">Organisation des comptes</h3>
                    <button
                      className={`px-4 py-2 rounded-lg text-sm ${draggingEnabled ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}`}
                      onClick={() => setDraggingEnabled(!draggingEnabled)}
                    >
                      {draggingEnabled ? 'Terminer l\'organisation' : 'Organiser les comptes'}
                    </button>
                  </div>
                  
                  {draggingEnabled && (
                    <p className="text-sm text-gray-400 mb-4">
                      Glissez-déposez les cartes pour les réorganiser selon vos préférences. Cliquez sur "Terminer l'organisation" quand vous avez terminé.
                    </p>
                  )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {accountOrder
                      .map(id => accounts.find(account => account.id === id))
                      .filter(Boolean)
                      .filter(account => 
                        account && (account.username.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        account.tag.toLowerCase().includes(searchQuery.toLowerCase()))
                      )
                      .map((account, index) => {
                        if (!account) return null;
                        return (
                          <div 
                            key={account.id} 
                            className={`bg-gray-800 rounded-xl overflow-hidden shadow-lg border ${account.linked ? 'border-purple-500/50' : 'border-gray-700'} ${draggingEnabled ? 'cursor-move' : ''}`}
                            draggable={draggingEnabled}
                            onDragStart={(e) => {
                              if (draggingEnabled) {
                                e.dataTransfer.setData('text/plain', index.toString());
                                e.currentTarget.classList.add('opacity-50');
                              }
                            }}
                            onDragEnd={(e) => {
                              if (draggingEnabled) {
                                e.currentTarget.classList.remove('opacity-50');
                              }
                            }}
                            onDragOver={(e) => {
                              if (draggingEnabled) {
                                e.preventDefault();
                                e.currentTarget.classList.add('border-blue-500');
                              }
                            }}
                            onDragLeave={(e) => {
                              if (draggingEnabled) {
                                e.currentTarget.classList.remove('border-blue-500');
                              }
                            }}
                            onDrop={(e) => {
                              if (draggingEnabled) {
                                e.preventDefault();
                                e.currentTarget.classList.remove('border-blue-500');
                                const startIndex = parseInt(e.dataTransfer.getData('text/plain'));
                                const endIndex = index;
                                if (startIndex !== endIndex) {
                                  reorderAccounts(startIndex, endIndex);
                                }
                              }
                            }}
                          >
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
                        
                              {/* Informations du compte */}
                              <div className="mb-4 p-4 bg-blue-900/20 border border-blue-700/30 rounded-lg">
                                <h4 className="text-sm font-medium text-blue-300 mb-3">Identifiants de connexion</h4>
                                
                                <div className="space-y-2">
                                  {/* Login */}
                                  <div className="relative">
                                    <p className="text-xs text-gray-400 mb-1">Login</p>
                                    <div className="flex rounded-md overflow-hidden">
                                      <div className="flex-1 bg-gray-800 text-sm font-mono px-3 py-2 overflow-hidden text-ellipsis whitespace-nowrap border-l border-t border-b border-gray-700">
                                        {account.login || account.username || "Non défini"}
                                      </div>
                                      <button 
                                        onClick={() => {
                                          const textToCopy = account.login || account.username || "";
                                          navigator.clipboard.writeText(textToCopy);
                                          setCopiedField({accountId: account.id, field: 'login'});
                                          setTimeout(() => setCopiedField(null), 2000);
                                        }}
                                        className={`px-3 py-2 border-r border-t border-b border-gray-700 flex items-center transition-colors ${copiedField?.accountId === account.id && copiedField?.field === 'login' ? 'bg-green-600 text-white' : 'bg-gray-700 hover:bg-gray-600 text-gray-300'}`}
                                        title="Copier le login"
                                      >
                                        {copiedField?.accountId === account.id && copiedField?.field === 'login' ? <Check size={16} className="mr-1" /> : null}
                                        <span className="text-xs font-medium">Copier</span>
                                      </button>
                                    </div>
                                  </div>
                                  
                                  {/* Mot de passe */}
                                  <div className="relative">
                                    <p className="text-xs text-gray-400 mb-1">Mot de passe</p>
                                    <div className="flex rounded-md overflow-hidden">
                                      <div className="flex-1 bg-gray-800 text-sm font-mono px-3 py-2 overflow-hidden text-ellipsis whitespace-nowrap border-l border-t border-b border-gray-700">
                                        {account.password ? "••••••••" : "Non défini"}
                                      </div>
                                      <button 
                                        onClick={() => {
                                          if (account.password) {
                                            const decrypted = decryptPassword(account.password);
                                            navigator.clipboard.writeText(decrypted);
                                            setCopiedField({accountId: account.id, field: 'password'});
                                            setTimeout(() => setCopiedField(null), 2000);
                                          }
                                        }}
                                        className={`px-3 py-2 border-r border-t border-b border-gray-700 flex items-center transition-colors ${copiedField?.accountId === account.id && copiedField?.field === 'password' ? 'bg-green-600 text-white' : 'bg-gray-700 hover:bg-gray-600 text-gray-300'}`}
                                        title="Copier le mot de passe"
                                        disabled={!account.password}
                                      >
                                        {copiedField?.accountId === account.id && copiedField?.field === 'password' ? <Check size={16} className="mr-1" /> : null}
                                        <span className="text-xs font-medium">Copier</span>
                                      </button>
                                    </div>
                                  </div>
                                  
                                  {/* Email */}
                                  {account.email && (
                                    <div className="relative">
                                      <p className="text-xs text-gray-400 mb-1">Email</p>
                                      <div className="flex rounded-md overflow-hidden">
                                        <div className="flex-1 bg-gray-800 text-sm font-mono px-3 py-2 overflow-hidden text-ellipsis whitespace-nowrap border-l border-t border-b border-gray-700">
                                          {account.email}
                                        </div>
                                        <button 
                                          onClick={() => {
                                            navigator.clipboard.writeText(account.email || "");
                                            setCopiedField({accountId: account.id, field: 'email'});
                                            setTimeout(() => setCopiedField(null), 2000);
                                          }}
                                          className={`px-3 py-2 border-r border-t border-b border-gray-700 flex items-center transition-colors ${copiedField?.accountId === account.id && copiedField?.field === 'email' ? 'bg-green-600 text-white' : 'bg-gray-700 hover:bg-gray-600 text-gray-300'}`}
                                          title="Copier l'email"
                                        >
                                          {copiedField?.accountId === account.id && copiedField?.field === 'email' ? <Check size={16} className="mr-1" /> : null}
                                          <span className="text-xs font-medium">Copier</span>
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                              
                              {/* Statistiques de rang */}
                              {account.rank ? (
                                <div className="mb-4 p-3 bg-gray-800 border border-gray-700 rounded-lg">
                                  <h4 className="text-sm font-medium text-blue-300 mb-2">Statistiques de rang</h4>
                                  <div className="flex">
                                    <div className="w-1/2 border-r border-gray-700 pr-3">
                                      <p className="text-xs text-gray-400 mb-1">Rang actuel</p>
                                      <div className="flex items-center">
                                        <div className="w-12 h-12 flex-shrink-0 bg-gray-900 rounded-md overflow-hidden mr-2 flex items-center justify-center">
                                          {account.rank.currentRank && account.rank.currentRank !== "Non classé" ? (
                                            <img 
                                              src={getRankIconByName(account.rank.currentRank)} 
                                              alt={account.rank.currentRank} 
                                              className="w-11 h-11 object-contain"
                                              onError={(e) => {
                                                // En cas d'erreur de chargement d'image, utiliser une image par défaut
                                                const target = e.target as HTMLImageElement;
                                                console.warn(`Impossible de charger l'image: ${target.src}`);
                                                target.src = "/img/rank_png/Iron_1_Rank.png";
                                              }}
                                            />
                                          ) : (
                                            <div className="text-xs text-gray-400">Non classé</div>
                                          )}
                                        </div>
                                        <div>
                                          <p className="font-medium">{account.rank.currentRank || "Non classé"}</p>
                                        </div>
                                      </div>
                                    </div>
                                    
                                    <div className="w-1/2 pl-3">
                                      <p className="text-xs text-gray-400 mb-1">Meilleur rang</p>
                                      <div className="flex items-center">
                                        <div className="w-12 h-12 flex-shrink-0 bg-gray-900 rounded-md overflow-hidden mr-2 flex items-center justify-center">
                                          {account.rank.bestRank && account.rank.bestRank !== "Non classé" ? (
                                            <img 
                                              src={getRankIconByName(account.rank.bestRank)} 
                                              alt={account.rank.bestRank} 
                                              className="w-11 h-11 object-contain"
                                              onError={(e) => {
                                                // En cas d'erreur de chargement d'image, utiliser une image par défaut
                                                const target = e.target as HTMLImageElement;
                                                console.warn(`Impossible de charger l'image: ${target.src}`);
                                                target.src = "/img/rank_png/Iron_1_Rank.png";
                                              }}
                                            />
                                          ) : (
                                            <div className="text-xs text-gray-400">Non classé</div>
                                          )}
                                        </div>
                                        <div>
                                          <p className="font-medium">{account.rank.bestRank || "Non classé"}</p>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  {account.rank.seasonRanks && account.rank.seasonRanks.length > 0 && (
                                    <div className="mt-2 pt-2 border-t border-gray-700">
                                      <p className="text-xs text-gray-400">Dernier épisode: <span className="text-white">{account.rank.seasonRanks[0].rank}</span></p>
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div className="mb-4 p-3 bg-gray-800 border border-gray-700 rounded-lg flex items-center text-gray-400">
                                  <AlertTriangle size={16} className="mr-2 text-yellow-500" />
                                  <p className="text-sm">Données de rang non disponibles</p>
                                </div>
                              )}
                              
                              {/* Aperçu des agents possédés */}
                              <div className="mb-4">
                                <div className="flex justify-between items-center mb-2">
                                  <h4 className="text-sm font-medium text-blue-300">Agents ({account.ownedAgents?.length || 0})</h4>
                                  <button
                                    onClick={() => handleEditItemsClick('agents', account.id)}
                                    className="text-xs text-blue-400 hover:text-blue-300"
                                  >
                                    {editingOwnedItems === `agents-${account.id}` ? 'Terminer' : 'Modifier'}
                                  </button>
                                </div>
                                
                                {editingOwnedItems === `agents-${account.id}` ? (
                                  <div className="p-3 bg-gray-750 border border-gray-600 rounded-lg max-h-60 overflow-y-auto">
                                    <div className="grid grid-cols-4 gap-2">
                                      {agents.map(agent => (
                                        <div 
                                          key={agent.uuid}
                                          className={`p-1 rounded-md cursor-pointer ${
                                            account.ownedAgents?.includes(agent.uuid) 
                                              ? 'bg-blue-900/50 border border-blue-500' 
                                              : 'bg-gray-700 hover:bg-gray-600'
                                          }`}
                                          onClick={() => toggleAgentOwnership(account.id, agent.uuid)}
                                        >
                                          <div className="aspect-square rounded overflow-hidden">
                                            <img 
                                              src={agent.displayIcon} 
                                              alt={agent.displayName} 
                                              className="h-full w-full object-cover"
                                            />
                                          </div>
                                          <p className="text-[10px] text-center mt-1 truncate">{agent.displayName}</p>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                ) : (
                                  <div className="p-3 bg-gray-750 border border-gray-600 rounded-lg">
                                    {account.ownedAgents && account.ownedAgents.length > 0 ? (
                                      <div className="flex flex-wrap gap-1">
                                        {account.ownedAgents.slice(0, 5).map(agentId => {
                                          const agent = agents.find(a => a.uuid === agentId);
                                          return agent ? (
                                            <div key={agentId} className="w-8 h-8 rounded-full overflow-hidden bg-gray-700" title={agent.displayName}>
                                              <img src={agent.displayIcon} alt={agent.displayName} className="h-full w-full object-cover" />
                                            </div>
                                          ) : null;
                                        })}
                                        {account.ownedAgents.length > 5 && (
                                          <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                                            <span className="text-xs">+{account.ownedAgents.length - 5}</span>
                                          </div>
                                        )}
                              </div>
                                    ) : (
                                      <p className="text-xs text-gray-400">Aucun agent attribué à ce compte</p>
                                    )}
                                  </div>
                                )}
                            </div>
                            
                              {/* Aperçu des skins possédés */}
                              <div className="mb-4">
                                <div className="flex justify-between items-center mb-2">
                                  <h4 className="text-sm font-medium text-blue-300">Skins ({account.ownedSkins?.length || 0})</h4>
                                  <button
                                    onClick={() => handleEditItemsClick('skins', account.id)}
                                    className="text-xs text-blue-400 hover:text-blue-300"
                                  >
                                    {editingOwnedItems === `skins-${account.id}` ? 'Terminer' : 'Modifier'}
                                  </button>
                              </div>
                              
                                {editingOwnedItems === `skins-${account.id}` ? (
                                  <div className="p-3 bg-gray-750 border border-gray-600 rounded-lg max-h-80 overflow-y-auto">
                                    {/* Champ de recherche pour les skins */}
                                    <div className="sticky top-0 bg-gray-800 p-2 mb-3 rounded-md z-10">
                                      <div className="relative">
                                        <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                        <input
                                          type="text"
                                          placeholder="Rechercher un skin..."
                                          className="w-full pl-9 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                          value={skinSearchQuery}
                                          onChange={(e) => setSkinSearchQuery(e.target.value)}
                                        />
                                        {skinSearchQuery && (
                                          <button
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                                            onClick={() => setSkinSearchQuery("")}
                                          >
                                            <X size={14} />
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                    
                                    <div className="space-y-3">
                                      {weapons
                                        .filter(weapon => 
                                          weapon.skins.some(skin => 
                                            skin.displayName.toLowerCase().includes(skinSearchQuery.toLowerCase())
                                          )
                                        )
                                        .map(weapon => {
                                          // Filtrer les skins qui correspondent à la recherche
                                          const filteredSkins = weapon.skins.filter(skin => 
                                            skin.displayName.toLowerCase().includes(skinSearchQuery.toLowerCase())
                                          );
                                          
                                          // Ne pas afficher l'arme si aucun skin ne correspond à la recherche
                                          if (filteredSkins.length === 0) return null;
                                          
                                          return (
                                            <div key={weapon.uuid}>
                                              <h5 className="text-xs font-medium mb-2">{weapon.displayName}</h5>
                                              <div className="grid grid-cols-3 gap-2">
                                                {filteredSkins.map(skin => (
                                                  <div 
                                                    key={skin.uuid}
                                                    className={`p-1 rounded-md cursor-pointer ${
                                                      account.ownedSkins?.includes(skin.uuid) 
                                                        ? 'bg-blue-900/50 border border-blue-500' 
                                                        : 'bg-gray-700 hover:bg-gray-600'
                                                    }`}
                                                    onClick={() => toggleSkinOwnership(account.id, skin.uuid)}
                                                  >
                                                    <div className="aspect-video rounded overflow-hidden bg-gray-800 flex items-center justify-center">
                                                      <img 
                                                        src={skin.displayIcon || weapon.displayIcon} 
                                                        alt={skin.displayName} 
                                                        className="h-full max-h-10 object-contain"
                                                      />
                                                    </div>
                                                    <p className="text-[10px] text-center mt-1 truncate">{skin.displayName}</p>
                                                  </div>
                                                ))}
                                              </div>
                                            </div>
                                          );
                                        })
                                        .filter(Boolean)}
                                    </div>
                                  </div>
                                ) : (
                                  <div className="p-3 bg-gray-750 border border-gray-600 rounded-lg">
                                    {account.ownedSkins && account.ownedSkins.length > 0 ? (
                                      <div className="flex flex-wrap gap-2">
                                        {account.ownedSkins.slice(0, 4).map(skinId => {
                                          // Trouver le skin dans tous les weapons
                                          let foundSkin = null;
                                          let weapon = null;
                                          
                                          for (const w of weapons) {
                                            foundSkin = w.skins.find(s => s.uuid === skinId);
                                            if (foundSkin) {
                                              weapon = w;
                                              break;
                                            }
                                          }
                                          
                                          return foundSkin && weapon ? (
                                            <div key={skinId} className="w-14 h-10 rounded overflow-hidden bg-gray-700 flex items-center justify-center" title={`${foundSkin.displayName} (${weapon.displayName})`}>
                                              <img 
                                                src={foundSkin.displayIcon || weapon.displayIcon} 
                                                alt={foundSkin.displayName} 
                                                className="h-full max-h-8 object-contain" 
                                              />
                                            </div>
                                          ) : null;
                                        })}
                                        {account.ownedSkins.length > 4 && (
                                          <div className="w-14 h-10 rounded bg-gray-700 flex items-center justify-center">
                                            <span className="text-xs">+{account.ownedSkins.length - 4}</span>
                          </div>
                        )}
                                      </div>
                                    ) : (
                                      <p className="text-xs text-gray-400">Aucun skin attribué à ce compte</p>
                                    )}
                                  </div>
                                )}
                              </div>
                        
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
                        <div className="flex space-x-2 mt-4">
                          <button
                            onClick={() => {
                              openEditForm(account);
                              setShowForm(true);
                            }}
                            className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm flex items-center justify-center"
                          >
                            <Edit size={16} className="mr-1" />
                            Modifier
                          </button>
                          
                          <button
                            onClick={() => deleteAccount(account.id)}
                            className="flex-1 px-3 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm flex items-center justify-center"
                          >
                            <Trash2 size={16} className="mr-1" />
                            Supprimer
                          </button>
                        </div>
                      </div>
                    </div>
                        );
                      })}
                  </div>
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
      
      {activeTab === 'agents' && (
        <>
          {agentError && (
            <div className="p-3 mb-4 bg-red-900/30 border border-red-700 rounded-lg text-red-400">
              {agentError}
            </div>
          )}
          
          {loadingAgents ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {agents.map(agent => (
                  <div 
                    key={agent.uuid} 
                    className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700 hover:border-blue-500 transition-colors"
                  >
                    <div className="p-4">
                      <div className="flex items-center mb-3">
                        <div className="h-12 w-12 bg-gray-700 rounded-full overflow-hidden mr-3">
                          <img 
                            src={agent.displayIcon} 
                            alt={agent.displayName} 
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div>
                          <h3 className="font-medium">{agent.displayName}</h3>
                          <p className="text-sm text-gray-400">{agent.role?.displayName || "Agent"}</p>
                        </div>
                      </div>
                      <div className="mt-3 bg-gray-700/50 p-3 rounded-lg">
                        <p className="text-xs text-gray-300 line-clamp-3">{agent.description}</p>
                      </div>
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
          <div className="bg-gray-800 rounded-xl p-4 md:p-6 max-w-5xl w-full mx-2 md:mx-4 shadow-2xl border border-gray-700">
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
              <div className="flex flex-col lg:flex-row gap-6">
                <div className="lg:w-1/2 space-y-4">
                  <div className="bg-gray-750 rounded-lg p-4 border border-blue-500/30">
                    <h3 className="text-base font-medium text-blue-400 mb-3">Identifiants RIOT (en jeu)</h3>
                    
                    <div className="grid grid-cols-3 gap-4 mb-3">
                      <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-1">Nom affiché en jeu</label>
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
                </div>
                
                <div className={`lg:w-1/2 ${!advancedMode ? 'hidden lg:block' : ''}`}>
                  <div className="bg-gray-750 rounded-lg p-4 border border-gray-600 h-full">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-base font-medium text-blue-400">Informations supplémentaires (optionnel)</h3>
                      <button 
                        type="button"
                        onClick={() => setAdvancedMode(!advancedMode)}
                        className="text-sm text-blue-400 hover:text-blue-300 lg:hidden flex items-center"
                      >
                        {advancedMode ? "Masquer" : "Afficher"}
                      </button>
                </div>
                
                    <div className="space-y-4">
                    <h3 className="font-medium text-blue-400 mb-2">Identifiants de connexion</h3>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Nom d'utilisateur</label>
                      <input
                          type="text"
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={newAccount.login || ''}
                          onChange={(e) => setNewAccount({...newAccount, login: e.target.value})}
                          placeholder="Nom d'utilisateur pour se connecter au compte RIOT"
                        />
                        <p className="text-xs text-gray-400 mt-1">
                          Identifiant utilisé pour vous connecter au compte RIOT (pas le nom affiché en jeu)
                        </p>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Mot de passe</label>
                      <input
                        type="password"
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={newAccount.password}
                        onChange={(e) => setNewAccount({...newAccount, password: e.target.value})}
                          placeholder="Mot de passe pour ce compte RIOT"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">E-mail (optionnel)</label>
                        <input
                          type="email"
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={newAccount.email}
                          onChange={(e) => setNewAccount({...newAccount, email: e.target.value})}
                          placeholder="Adresse e-mail associée au compte RIOT"
                      />
                      <p className="text-xs text-gray-400 mt-1">
                          Cette information vous aide à retrouver quel e-mail est associé à quel compte.
                        </p>
                      </div>
                      
                      <div className="p-2 bg-blue-900/20 border border-blue-700/30 rounded-lg">
                        <p className="text-xs text-blue-300">
                          Note: Les identifiants sont stockés de manière sécurisée et visibles uniquement par les administrateurs.
                      </p>
                    </div>
                    
                    <div>
                      <div className="flex items-center mt-4 mb-2">
                        <input
                          type="checkbox"
                          id="manualRank"
                          checked={newAccount.manualRank}
                          onChange={(e) => setNewAccount({...newAccount, manualRank: e.target.checked})}
                          className="h-4 w-4 rounded border-gray-600 text-blue-600 focus:ring-blue-500"
                        />
                        <label htmlFor="manualRank" className="ml-2 text-sm text-gray-300">
                          Définir le rang manuellement
                        </label>
                      </div>
                      
                      {newAccount.manualRank && (
                        <div className="mt-3 space-y-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Rang actuel</label>
                            <select
                              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              value={newAccount.rank?.currentRank || "Non classé"}
                              onChange={(e) => {
                                const rankValue = e.target.value;
                                const tierValue = getRankTier(rankValue);
                                setNewAccount({
                                  ...newAccount, 
                                  rank: {
                                    ...newAccount.rank,
                                    currentRank: rankValue,
                                    currentTier: tierValue.toString(),
                                    rankIcon: getRankIcon(tierValue),
                                    bestRank: newAccount.rank?.bestRank || rankValue,
                                    bestTier: newAccount.rank?.bestTier || tierValue.toString()
                                  }
                                });
                              }}
                            >
                              <option value="Non classé">Non classé</option>
                              <option value="Iron 1">Iron 1</option>
                              <option value="Iron 2">Iron 2</option>
                              <option value="Iron 3">Iron 3</option>
                              <option value="Bronze 1">Bronze 1</option>
                              <option value="Bronze 2">Bronze 2</option>
                              <option value="Bronze 3">Bronze 3</option>
                              <option value="Silver 1">Silver 1</option>
                              <option value="Silver 2">Silver 2</option>
                              <option value="Silver 3">Silver 3</option>
                              <option value="Gold 1">Gold 1</option>
                              <option value="Gold 2">Gold 2</option>
                              <option value="Gold 3">Gold 3</option>
                              <option value="Platinum 1">Platinum 1</option>
                              <option value="Platinum 2">Platinum 2</option>
                              <option value="Platinum 3">Platinum 3</option>
                              <option value="Diamond 1">Diamond 1</option>
                              <option value="Diamond 2">Diamond 2</option>
                              <option value="Diamond 3">Diamond 3</option>
                              <option value="Ascendant 1">Ascendant 1</option>
                              <option value="Ascendant 2">Ascendant 2</option>
                              <option value="Ascendant 3">Ascendant 3</option>
                              <option value="Immortal 1">Immortal 1</option>
                              <option value="Immortal 2">Immortal 2</option>
                              <option value="Immortal 3">Immortal 3</option>
                              <option value="Radiant">Radiant</option>
                            </select>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Meilleur rang</label>
                            <select
                              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              value={newAccount.rank?.bestRank || "Non classé"}
                              onChange={(e) => {
                                const rankValue = e.target.value;
                                const tierValue = getRankTier(rankValue);
                                setNewAccount({
                                  ...newAccount, 
                                  rank: {
                                    ...newAccount.rank,
                                    bestRank: rankValue,
                                    bestTier: tierValue.toString()
                                  }
                                });
                              }}
                            >
                              <option value="Non classé">Non classé</option>
                              <option value="Iron 1">Iron 1</option>
                              <option value="Iron 2">Iron 2</option>
                              <option value="Iron 3">Iron 3</option>
                              <option value="Bronze 1">Bronze 1</option>
                              <option value="Bronze 2">Bronze 2</option>
                              <option value="Bronze 3">Bronze 3</option>
                              <option value="Silver 1">Silver 1</option>
                              <option value="Silver 2">Silver 2</option>
                              <option value="Silver 3">Silver 3</option>
                              <option value="Gold 1">Gold 1</option>
                              <option value="Gold 2">Gold 2</option>
                              <option value="Gold 3">Gold 3</option>
                              <option value="Platinum 1">Platinum 1</option>
                              <option value="Platinum 2">Platinum 2</option>
                              <option value="Platinum 3">Platinum 3</option>
                              <option value="Diamond 1">Diamond 1</option>
                              <option value="Diamond 2">Diamond 2</option>
                              <option value="Diamond 3">Diamond 3</option>
                              <option value="Ascendant 1">Ascendant 1</option>
                              <option value="Ascendant 2">Ascendant 2</option>
                              <option value="Ascendant 3">Ascendant 3</option>
                              <option value="Immortal 1">Immortal 1</option>
                              <option value="Immortal 2">Immortal 2</option>
                              <option value="Immortal 3">Immortal 3</option>
                              <option value="Radiant">Radiant</option>
                            </select>
                          </div>
                          
                            <div className="flex space-x-4 mt-4">
                              <div className="text-center">
                                <p className="text-xs text-gray-400 mb-1">Rang actuel</p>
                                <div className="flex items-center justify-center">
                                  <img 
                                    src={getRankIconByName(newAccount.rank?.currentRank || "Non classé")} 
                                    alt={newAccount.rank?.currentRank} 
                                    className="w-12 h-12 mx-auto"
                                  />
                                </div>
                                <p className="font-bold mt-1">{newAccount.rank?.currentRank || "Non classé"}</p>
                              </div>
                              
                              <div className="text-center">
                                <p className="text-xs text-gray-400 mb-1">Meilleur rang</p>
                                <div className="flex items-center justify-center">
                                  <img 
                                    src={getRankIconByName(newAccount.rank?.bestRank || "Non classé")} 
                                    alt={newAccount.rank?.bestRank} 
                                    className="w-12 h-12 mx-auto"
                                  />
                            </div>
                                <p className="font-bold mt-1">{newAccount.rank?.bestRank || "Non classé"}</p>
                        </div>
                    </div>
                  </div>
                )}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Bouton pour afficher/masquer le mode avancé sur mobile/tablette */}
                <div className="lg:hidden">
                  <button 
                    type="button"
                    onClick={() => setAdvancedMode(!advancedMode)}
                    className="w-full mt-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center justify-center"
                  >
                    {advancedMode ? "Masquer les options avancées" : "Afficher les options avancées"}
                  </button>
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
                            <div className="mt-2">
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setShowVideo(level.streamedVideo || '');
                                }}
                                className="text-xs text-blue-400 hover:text-blue-300 flex items-center"
                              >
                                <Play size={14} className="mr-1" />
                                Voir la vidéo
                              </button>
                            </div>
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
      
      {/* Modal vidéo */}
      {showVideo && (
        <div 
          className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[60] flex justify-center items-center p-4" 
          onClick={() => setShowVideo('')}
        >
          <div className="relative w-full max-w-4xl">
            <button 
              className="absolute -top-10 right-0 text-white hover:text-gray-300"
              onClick={() => setShowVideo('')}
            >
              <X size={24} />
            </button>
            <div className="aspect-video w-full bg-black">
              <iframe
                src={showVideo}
                className="w-full h-full"
                allowFullScreen
                title="Aperçu du skin"
              ></iframe>
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