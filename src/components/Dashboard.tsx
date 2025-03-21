import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Menu, ChevronDown, LogOut, User, Settings, BarChart2, Wrench, X, BookOpen, Award, Download } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { logoutUser, updateUserProfile, changeUserPassword, getUserData, UserRole, deleteUserAccount, UserFormationProgress } from '../firebase/auth';
import { Link } from 'react-router-dom';
import { getAllTools, checkToolAccess, ToolStatus } from '../firebase/tools';

interface DashboardProps {
  onClose: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onClose }) => {
  const { currentUser, userData } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('overview');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [userProfile, setUserProfile] = useState({
    displayName: currentUser?.displayName || '',
    telegram: ''
  });
  const [password, setPassword] = useState({
    current: '',
    new: '',
    confirm: ''
  });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [buttonPosition, setButtonPosition] = useState({ top: 0, right: 0 });
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [userStats, setUserStats] = useState({
    totalFormations: 0,
    formationsCompleted: 0,
    certificationsObtained: 0,
    lastLogin: new Date().toLocaleDateString('fr-FR')
  });
  const [formations, setFormations] = useState<any[]>([]);
  const [allFormations, setAllFormations] = useState<any[]>([]);
  const [tools, setTools] = useState<any[]>([]);
  const [toolsAccess, setToolsAccess] = useState<{[key: string]: {hasAccess: boolean, missingConditions: string[]}}>({});

  // Charger les données de l'utilisateur depuis Firestore
  useEffect(() => {
    const loadUserData = async () => {
      if (currentUser) {
        try {
          const userData = await getUserData(currentUser.uid);
          if (userData) {
            setUserProfile({
              displayName: currentUser.displayName || userData.displayName || '',
              telegram: userData.telegram || ''
            });
            setIsAdmin(userData.role === UserRole.ADMIN);
          }
        } catch (error) {
          console.error('Erreur lors du chargement des données utilisateur:', error);
        }
      }
    };
    
    loadUserData();
  }, [currentUser]);

  // Charger les statistiques réelles de l'utilisateur
  useEffect(() => {
    const loadUserStats = async () => {
      if (currentUser) {
        try {
          const userData = await getUserData(currentUser.uid);
          if (userData && userData.formationsProgress) {
            const stats = {
              totalFormations: userData.formationsProgress.length,
              formationsCompleted: userData.formationsProgress.filter((f: UserFormationProgress) => f.completed).length,
              certificationsObtained: userData.formationsProgress.filter((f: UserFormationProgress) => f.certificateUrl).length,
              lastLogin: new Date().toLocaleDateString('fr-FR')
            };
            setUserStats(stats);
          }
        } catch (error) {
          console.error('Erreur lors du chargement des statistiques:', error);
        }
      }
    };
    
    loadUserStats();
  }, [currentUser]);

  // Charger les formations de l'utilisateur quand la section formations est active
  useEffect(() => {
    const loadUserFormations = async () => {
      if (activeSection === 'formations' && currentUser) {
        try {
          // Utiliser try/catch pour éviter les erreurs non gérées
          const formationsModule = await import('../firebase/formations').catch(err => {
            console.warn("Erreur lors de l'importation du module formations:", err);
            return { getUserFormations: null };
          });
          
          if (!formationsModule || !formationsModule.getUserFormations) {
            console.warn("Module de formations non disponible");
            return;
          }
          
          try {
            const userFormations = await formationsModule.getUserFormations(currentUser.uid);
            if (Array.isArray(userFormations)) {
              // Utilisation d'une variable intermédiaire avec assertion de type
              const validFormations = userFormations
                .filter((item): item is {formation: any; progress: any} => 
                  item !== null && item.formation !== null
                );
              setFormations(validFormations.map(item => item.formation));
            } else {
              console.warn("Les formations récupérées ne sont pas un tableau:", userFormations);
              setFormations([]);
            }
          } catch (error) {
            console.warn("Erreur lors de la récupération des formations:", error);
            setFormations([]);
          }
        } catch (error) {
          console.warn("Erreur lors du chargement du module formations:", error);
          setFormations([]);
        }
      }
    };
    
    loadUserFormations();
  }, [activeSection, currentUser]);

  // Charger toutes les formations disponibles pour le catalogue
  useEffect(() => {
    const loadCatalogFormations = async () => {
      if (isCatalogOpen && currentUser) {
        try {
          const { getPublishedFormations } = await import('../firebase/formations');
          const publishedFormations = await getPublishedFormations();
          
          // Filtrer pour exclure les formations déjà assignées à l'utilisateur
          const userFormationIds = formations.map(f => f.id);
          const filteredFormations = publishedFormations.filter(
            formation => !userFormationIds.includes(formation.id)
          );
          
          setAllFormations(filteredFormations);
        } catch (error) {
          console.error("Erreur lors du chargement du catalogue de formations:", error);
        }
      }
    };
    
    loadCatalogFormations();
  }, [isCatalogOpen, formations, currentUser]);

  // Après les useEffects existants, corriger l'useEffect pour charger les certifications
  useEffect(() => {
    const loadUserCertifications = async () => {
      if (activeSection === 'formations' && currentUser) {
        try {
          // Vérifier d'abord si le module existe
          const certificationsModule = await import('../firebase/certifications').catch(err => {
            console.error("Erreur lors de l'importation du module de certifications:", err);
            return null;
          });
          
          if (!certificationsModule) {
            console.warn("Module de certifications non disponible");
            return;
          }
          
          // Utiliser une fonction catch pour éviter les erreurs non gérées
          try {
            // Ignorer les erreurs potentielles ici pour ne pas bloquer l'interface
            await certificationsModule.getUserCertifications(currentUser.uid).catch(err => {
              console.warn("Impossible de récupérer les certifications:", err);
              return [];
            });
          } catch (error) {
            console.warn("Erreur lors de l'accès aux certifications:", error);
            // Continuer sans les certifications
          }
        } catch (error) {
          console.warn("Erreur générique lors du chargement des certifications:", error);
        }
      }
    };
    
    loadUserCertifications();
  }, [activeSection, currentUser]);

  // Charger les outils dynamiquement
  useEffect(() => {
    const loadTools = async () => {
      if (activeSection === 'tools' && currentUser) {
        try {
          const toolsData = await getAllTools();
          setTools(toolsData);
          
          // Vérifier les accès pour chaque outil
          const accessChecks: {[key: string]: {hasAccess: boolean, missingConditions: string[]}} = {};
          
          for (const tool of toolsData) {
            const access = await checkToolAccess(currentUser.uid, tool.id);
            accessChecks[tool.id] = access;
          }
          
          setToolsAccess(accessChecks);
        } catch (error) {
          console.error("Erreur lors du chargement des outils:", error);
        }
      }
    };
    
    loadTools();
  }, [activeSection, currentUser]);

  // Fermer le menu quand on clique en dehors
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    
    // Ajouter l'événement quand le menu est ouvert
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    // Nettoyer l'événement quand le composant est démonté
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  const handleMenuToggle = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setButtonPosition({
        top: rect.bottom + window.scrollY,
        right: window.innerWidth - rect.right
      });
    }
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      onClose();
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    
    // Validation côté client
    if (password.new !== password.confirm) {
      setPasswordError('Les mots de passe ne correspondent pas');
      return;
    }
    
    if (password.new.length < 6) {
      setPasswordError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }
    
    try {
      setIsChangingPassword(true);
      setPasswordError('');
      
      await changeUserPassword(currentUser, password.current, password.new);
      
      // Attendre un court instant pour permettre à Firebase de finaliser la mise à jour
      setTimeout(() => {
        setPasswordSuccess('Mot de passe modifié avec succès');
        setPassword({ current: '', new: '', confirm: '' });
        setIsChangingPassword(false);
      }, 1000);
      
    } catch (error: any) {
      console.error('Erreur lors du changement de mot de passe:', error);
      
      // Messages d'erreur en français
      if (error.code === 'auth/wrong-password') {
        setPasswordError('Le mot de passe actuel est incorrect');
      } else if (error.code === 'auth/weak-password') {
        setPasswordError('Le nouveau mot de passe est trop faible');
      } else {
        setPasswordError(error.message || 'Une erreur s\'est produite');
      }
      
      setIsChangingPassword(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) return;
    
    setIsSubmitting(true);
    setProfileError('');
    
    try {
      const updatedDisplayName = userProfile.displayName.trim();
      const updatedTelegram = userProfile.telegram.trim();
      
      await updateUserProfile(currentUser, updatedDisplayName, updatedTelegram);
      
      // Afficher un message de succès
      setProfileSuccess('Profil mis à jour avec succès');
      setIsEditingProfile(false);
      
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      setProfileError(error.message || 'Une erreur s\'est produite lors de la mise à jour du profil');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    
    try {
      setIsDeletingAccount(true);
      setDeleteError('');
      
      await deleteUserAccount(currentUser, deletePassword);
      
      // Déconnexion après suppression réussie
      await logoutUser();
      onClose();
      
    } catch (error: any) {
      console.error('Erreur lors de la suppression du compte:', error);
      setDeleteError(error.message || 'Une erreur s\'est produite lors de la suppression du compte');
      setIsDeletingAccount(false);
    }
  };

  // Données factices pour le dashboard
  const notifications = [
    { id: 1, message: 'Nouvelle formation disponible : "Formation Spam Expert"', date: '21/03/2025', isRead: false },
    { id: 2, message: 'Votre certification pour "Formation PACKID Professionnel" est en cours de validation', date: '20/03/2025', isRead: true },
    { id: 3, message: 'Mise à jour des outils "Vérificateur de Leads" disponible', date: '19/03/2025', isRead: true }
  ];

  // Fonction pour rendre l'icône d'un outil
  const renderToolIcon = (tool: any) => {
    if (tool.iconType === 'lucide') {
      // Utiliser une icône Lucide si disponible
      switch (tool.icon) {
        case 'Wrench':
          return <Wrench className="text-blue-400" size={24} />;
        // Ajoutez d'autres cas pour d'autres icônes
        default:
          return <Wrench className="text-blue-400" size={24} />;
      }
    } else {
      // Rendre un SVG personnalisé
      return (
        <div dangerouslySetInnerHTML={{ __html: tool.icon }} />
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <div className="container px-4 py-12 mx-auto flex-grow">
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-4">
            Bonjour, {userProfile.displayName || 'Utilisateur'}
          </h1>
          <p className="text-gray-400 mb-4">
            Bienvenue sur votre espace formation
          </p>
          {isAdmin && (
            <a 
              href="/admin" 
              className="inline-flex items-center px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 transition-colors text-white font-medium"
            >
              Accéder au Dashboard Admin
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 ml-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </a>
          )}
        </div>
        
        {/* Navigation - Avec Aperçu, Outils et Mes formations */}
        <div className="flex flex-wrap gap-4 mb-8 border-b border-gray-800 pb-4">
          <button 
            onClick={() => setActiveSection('overview')}
            className={`flex items-center px-4 py-2 rounded-lg ${
              activeSection === 'overview' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            <BarChart2 size={18} className="mr-2" />
            Aperçu
          </button>
          <button 
            onClick={() => setActiveSection('tools')}
            className={`flex items-center px-4 py-2 rounded-lg ${
              activeSection === 'tools' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            <Wrench size={18} className="mr-2" />
            Outils
          </button>
          <button 
            onClick={() => setActiveSection('formations')}
            className={`flex items-center px-4 py-2 rounded-lg ${
              activeSection === 'formations' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            <BookOpen size={18} className="mr-2" />
            Mes formations
          </button>
          
          {/* Menu mobile */}
          <div className="relative ml-auto md:hidden">
            <button
              ref={buttonRef}
              onClick={handleMenuToggle}
              className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg flex items-center"
            >
              <Menu size={20} />
              <span className="ml-1">{userProfile.displayName}</span>
              <ChevronDown size={16} className="ml-1" />
            </button>
          </div>
          
          {/* Menu PC */}
          <div className="hidden md:flex ml-auto">
            <button
              ref={buttonRef}
              onClick={handleMenuToggle}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg flex items-center"
            >
              <span className="mr-2">{userProfile.displayName}</span>
              <ChevronDown size={16} />
            </button>
          </div>
        </div>
        
        {/* Contenu principal */}
        <main>
          {activeSection === 'overview' && (
            <div className="space-y-8">
              {/* Statistiques */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-400 mb-2">Formations</h3>
                  <p className="text-3xl font-bold">{userStats.totalFormations}</p>
                </div>
                <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-400 mb-2">Formations terminées</h3>
                  <p className="text-3xl font-bold">{userStats.formationsCompleted}</p>
                </div>
                <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-400 mb-2">Certifications</h3>
                  <p className="text-3xl font-bold">{userStats.certificationsObtained}</p>
                </div>
                <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-400 mb-2">Dernière connexion</h3>
                  <p className="text-xl font-bold">{userStats.lastLogin}</p>
                </div>
              </div>
              
              {/* Notifications récentes */}
              <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
                <h2 className="text-xl font-bold mb-4">Notifications récentes</h2>
                <div className="space-y-4">
                  {notifications.map(notification => (
                    <div 
                      key={notification.id} 
                      className={`p-4 border-l-4 rounded-r-lg ${
                        notification.isRead 
                          ? 'bg-gray-800/50 border-gray-600' 
                          : 'bg-blue-900/20 border-blue-600'
                      }`}
                    >
                      <div className="flex justify-between">
                        <p className={notification.isRead ? 'text-gray-300' : 'font-medium'}>
                          {notification.message}
                        </p>
                        <span className="text-sm text-gray-400">{notification.date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeSection === 'tools' && (
            <div className="space-y-8">
              <h1 className="text-3xl font-bold">Outils spécialisés</h1>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tools.map(tool => {
                  const access = toolsAccess[tool.id] || { hasAccess: false, missingConditions: ['Chargement en cours...'] };
                  
                  return (
                    <div key={tool.id} className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 hover:shadow-lg hover:shadow-blue-900/10 transition-all">
                      <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-blue-900/20 rounded-lg">
                          {renderToolIcon(tool)}
                        </div>
                        {tool.status === ToolStatus.ACTIVE ? (
                          <span className="px-2 py-1 bg-green-900/30 text-green-400 text-xs rounded-full">Actif</span>
                        ) : tool.status === ToolStatus.SOON ? (
                          <span className="px-2 py-1 bg-yellow-900/30 text-yellow-400 text-xs rounded-full">Bientôt</span>
                        ) : tool.status === ToolStatus.UPDATING ? (
                          <span className="px-2 py-1 bg-blue-900/30 text-blue-400 text-xs rounded-full">Mise à jour</span>
                        ) : (
                          <span className="px-2 py-1 bg-red-900/30 text-red-400 text-xs rounded-full">Inactif</span>
                        )}
                      </div>
                      <h3 className="text-xl font-bold mb-2">{tool.name}</h3>
                      <p className="text-gray-400 mb-4">{tool.description}</p>
                      <div className="mb-4">
                        <p className="text-sm text-gray-300 mb-2">Fonctionnalités:</p>
                        <ul className="text-sm text-gray-400 list-disc pl-5 space-y-1">
                          {tool.features.map((feature: string, index: number) => (
                            <li key={index}>{feature}</li>
                          ))}
                        </ul>
                      </div>

                      {tool.status === ToolStatus.ACTIVE ? (
                        access.hasAccess ? (
                          <a 
                            href={tool.downloadLink} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 px-4 py-2 rounded-lg font-medium transition-all duration-300 hover:shadow-lg hover:shadow-blue-600/30 flex items-center justify-center"
                          >
                            <Download size={18} className="mr-2" />
                            Télécharger
                          </a>
                        ) : (
                          <div>
                            <button 
                              disabled 
                              className="w-full bg-gray-700 px-4 py-2 rounded-lg font-medium transition-all duration-300 cursor-not-allowed opacity-70 mb-3"
                            >
                              Accès verrouillé
                            </button>
                            <div className="text-sm text-yellow-400 bg-yellow-900/20 border border-yellow-800/30 rounded-lg p-3">
                              <p className="font-medium mb-1">Conditions requises:</p>
                              <ul className="list-disc pl-5 space-y-1 text-xs">
                                {access.missingConditions.map((condition, index) => (
                                  <li key={index}>{condition}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        )
                      ) : tool.status === ToolStatus.SOON ? (
                        <button className="w-full bg-gray-700 px-4 py-2 rounded-lg font-medium transition-all duration-300 cursor-not-allowed opacity-70">
                          Disponible prochainement
                        </button>
                      ) : tool.status === ToolStatus.UPDATING ? (
                        <button className="w-full bg-gray-700 px-4 py-2 rounded-lg font-medium transition-all duration-300 cursor-not-allowed opacity-70">
                          En cours de mise à jour
                        </button>
                      ) : (
                        <button className="w-full bg-gray-700 px-4 py-2 rounded-lg font-medium transition-all duration-300 cursor-not-allowed opacity-70">
                          Non disponible
                        </button>
                      )}
                    </div>
                  );
                })}
                
                {tools.length === 0 && (
                  <div className="col-span-3 bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-xl p-10 text-center">
                    <div className="flex flex-col items-center">
                      <Wrench className="h-16 w-16 text-blue-500 mb-4" />
                      <h2 className="text-xl font-bold mb-2">Aucun outil disponible</h2>
                      <p className="text-gray-400 max-w-lg mx-auto">
                        Les outils seront disponibles prochainement. Revenez plus tard pour découvrir nos solutions spécialisées.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeSection === 'settings' && (
            <div className="space-y-8">
              <h1 className="text-3xl font-bold">Paramètres</h1>
              
              <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
                <div className="flex items-center justify-center p-8">
                  <div className="text-center">
                    <div className="bg-blue-900/20 p-4 rounded-full inline-block mb-4">
                      <Settings className="text-blue-400 h-12 w-12" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">Fonctionnalité à venir</h2>
                    <p className="text-gray-400 max-w-md mx-auto">
                      Les paramètres de l'application seront bientôt disponibles. Vous pourrez personnaliser votre expérience, gérer vos notifications et configurer vos préférences.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'profile' && (
            <div className="space-y-8">
              <h1 className="text-3xl font-bold">Mon profil</h1>
              
              <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
                <div className="flex flex-col md:flex-row md:items-center gap-6">
                  <div className="w-32 h-32 bg-gradient-to-br from-blue-600/50 to-indigo-700/50 rounded-full flex items-center justify-center">
                    <span className="text-5xl font-bold">{currentUser?.displayName?.charAt(0) || currentUser?.email?.charAt(0) || 'U'}</span>
                  </div>
                  
                  <div className="space-y-4">
                    <h2 className="text-2xl font-bold">{currentUser?.displayName || 'Utilisateur'}</h2>
                    <p className="text-gray-400">{currentUser?.email}</p>
                    <div className="flex space-x-4">
                      <button 
                        onClick={() => {
                          setIsEditingProfile(true);
                          setIsChangingPassword(false);
                        }}
                        className="bg-gradient-to-r from-blue-600 to-indigo-700 px-4 py-2 rounded-lg font-medium transition-all duration-300 hover:shadow-lg hover:shadow-blue-600/30"
                      >
                        Modifier le profil
                      </button>
                      <button 
                        onClick={() => {
                          setIsChangingPassword(true);
                          setIsEditingProfile(false);
                        }}
                        className="bg-transparent border border-gray-700 px-4 py-2 rounded-lg font-medium transition-all duration-300 hover:bg-gray-800/50"
                      >
                        Changer le mot de passe
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              {isEditingProfile && (
                <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 animate-fade-in">
                  <h2 className="text-xl font-bold mb-4">Modifier mon profil</h2>
                  
                  {profileSuccess && (
                    <div className="bg-green-500/20 border border-green-500 text-green-100 px-4 py-2 rounded-lg mb-4">
                      {profileSuccess}
                    </div>
                  )}
                  
                  {profileError && (
                    <div className="bg-red-500/20 border border-red-500 text-red-100 px-4 py-2 rounded-lg mb-4">
                      {profileError}
                    </div>
                  )}
                  
                  <form className="space-y-4" onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Nom complet</label>
                        <input 
                          type="text" 
                          name="displayName"
                          value={userProfile.displayName}
                          onChange={handleProfileChange}
                          className="w-full px-4 py-3 bg-gray-900/80 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
                        <input 
                          type="email" 
                          value={currentUser?.email || ''}
                          disabled
                          className="w-full px-4 py-3 bg-gray-900/80 border border-gray-700 rounded-lg opacity-70 cursor-not-allowed"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">Identifiant Telegram</label>
                      <input 
                        type="text" 
                        name="telegram"
                        value={userProfile.telegram}
                        onChange={handleProfileChange}
                        placeholder="@votre_identifiant_telegram"
                        className="w-full px-4 py-3 bg-gray-900/80 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
                      />
                    </div>
                    <div className="flex space-x-4">
                      <button 
                        type="submit"
                        disabled={isSubmitting}
                        className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-3 rounded-lg font-medium transition-all duration-300 hover:shadow-lg hover:shadow-blue-600/30 disabled:opacity-70"
                      >
                        {isSubmitting ? 'Enregistrement...' : 'Enregistrer les modifications'}
                      </button>
                      <button 
                        type="button"
                        onClick={() => setIsEditingProfile(false)}
                        className="bg-transparent border border-gray-700 px-6 py-3 rounded-lg font-medium transition-all duration-300 hover:bg-gray-800/50"
                      >
                        Annuler
                      </button>
                    </div>
                  </form>
                </div>
              )}
              
              {isChangingPassword && (
                <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 animate-fade-in">
                  <h2 className="text-xl font-bold mb-4">Changer mon mot de passe</h2>
                  
                  {passwordSuccess && (
                    <div className="bg-green-500/20 border border-green-500 text-green-100 px-4 py-2 rounded-lg mb-4">
                      {passwordSuccess}
                    </div>
                  )}
                  
                  {passwordError && (
                    <div className="bg-red-500/20 border border-red-500 text-red-100 px-4 py-2 rounded-lg mb-4">
                      {passwordError}
                    </div>
                  )}
                  
                  <form className="space-y-4" onSubmit={handlePasswordChange}>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">Mot de passe actuel</label>
                      <input 
                        type="password" 
                        name="current"
                        value={password.current}
                        onChange={handlePasswordChange}
                        className="w-full px-4 py-3 bg-gray-900/80 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">Nouveau mot de passe</label>
                      <input 
                        type="password" 
                        name="new"
                        value={password.new}
                        onChange={handlePasswordChange}
                        className="w-full px-4 py-3 bg-gray-900/80 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">Confirmer le nouveau mot de passe</label>
                      <input 
                        type="password" 
                        name="confirm"
                        value={password.confirm}
                        onChange={handlePasswordChange}
                        className="w-full px-4 py-3 bg-gray-900/80 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
                      />
                    </div>
                    <div className="flex space-x-4">
                      <button 
                        type="submit"
                        disabled={isChangingPassword}
                        className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-3 rounded-lg font-medium transition-all duration-300 hover:shadow-lg hover:shadow-blue-600/30 disabled:opacity-70"
                      >
                        {isChangingPassword ? 'Modification...' : 'Changer le mot de passe'}
                      </button>
                      <button 
                        type="button"
                        onClick={() => setIsChangingPassword(false)}
                        className="bg-transparent border border-gray-700 px-6 py-3 rounded-lg font-medium transition-all duration-300 hover:bg-gray-800/50"
                      >
                        Annuler
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {!isEditingProfile && !isChangingPassword && (
                <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
                  <h2 className="text-xl font-bold mb-4">Informations personnelles</h2>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-400 mb-1">Nom complet</p>
                        <p className="px-4 py-3 bg-gray-900/80 border border-gray-700 rounded-lg">
                          {currentUser?.displayName || 'Non défini'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-400 mb-1">Email</p>
                        <p className="px-4 py-3 bg-gray-900/80 border border-gray-700 rounded-lg">
                          {currentUser?.email || 'Non défini'}
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-400 mb-1">Telegram</p>
                      <p className="px-4 py-3 bg-gray-900/80 border border-gray-700 rounded-lg">
                        {userProfile.telegram || 'Non défini'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Section de suppression de compte */}
              <div className="bg-red-900/20 backdrop-blur-sm border border-red-700/50 rounded-xl p-6">
                <h2 className="text-xl font-bold mb-4 text-red-400">Zone de danger</h2>
                <p className="text-gray-400 mb-4">
                  La suppression de votre compte est irréversible. Toutes vos données seront supprimées définitivement.
                </p>
                
                {deleteError && (
                  <div className="bg-red-500/20 border border-red-500 text-red-100 px-4 py-2 rounded-lg mb-4">
                    {deleteError}
                  </div>
                )}
                
                <form onSubmit={handleDeleteAccount} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Confirmez votre mot de passe
                    </label>
                    <input 
                      type="password"
                      value={deletePassword}
                      onChange={(e) => setDeletePassword(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-900/80 border border-red-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 transition-all"
                      required
                    />
                  </div>
                  
                  <button
                    type="submit"
                    disabled={isDeletingAccount}
                    className="bg-red-600 px-6 py-3 rounded-lg font-medium transition-all duration-300 hover:bg-red-700 disabled:opacity-70"
                  >
                    {isDeletingAccount ? 'Suppression...' : 'Supprimer mon compte'}
                  </button>
                </form>
              </div>
            </div>
          )}

          {activeSection === 'formations' && (
            <div className="space-y-6">
              <h1 className="text-3xl font-bold">Mes formations</h1>
              
              {(() => {
                try {
                  return formations.length === 0 ? (
                    <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-xl p-12 text-center">
                      <div className="flex flex-col items-center">
                        <BookOpen className="h-16 w-16 text-blue-500 mb-4" />
                        <h2 className="text-xl font-bold mb-2">Aucune formation assignée</h2>
                        <p className="text-gray-400 max-w-lg mx-auto mb-6">
                          Vous n'avez pas encore de formations assignées à votre compte. 
                          Les formations vous permettent d'acquérir de nouvelles compétences.
                        </p>
                        <button 
                          className="bg-gradient-to-r from-blue-600 to-indigo-700 px-4 py-2 rounded-lg font-medium"
                          onClick={() => setIsCatalogOpen(true)}
                        >
                          Explorer le catalogue de formations
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 mb-8">
                        <div className="flex flex-col md:flex-row items-center justify-between">
                          <div className="mb-4 md:mb-0">
                            <h3 className="text-xl font-bold mb-2">Découvrir plus de formations</h3>
                            <p className="text-gray-400">Explorez notre catalogue complet de formations disponibles</p>
                          </div>
                          <button 
                            className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-3 rounded-lg font-medium transition-all duration-300 hover:shadow-lg hover:shadow-blue-600/30"
                            onClick={() => setIsCatalogOpen(true)}
                          >
                            Voir le catalogue
                          </button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {formations.map(formation => {
                          // Récupérer les infos de progression pour cette formation
                          const userProgress = userData?.formationsProgress?.find(
                            (p: UserFormationProgress) => p.formationId === formation.id
                          );
                          
                          const isCompleted = userProgress?.completed || false;
                          const completedModules = userProgress?.completedModules || [];
                          const modulesLength = formation.modules?.length || 1;
                          const progress = userProgress 
                            ? Math.round((completedModules.length / modulesLength) * 100) 
                            : 0;
                          
                          return (
                            <div key={formation.id} className="group bg-gray-800/60 hover:bg-gray-800/80 rounded-xl overflow-hidden shadow-lg hover:shadow-blue-600/10 border border-gray-700 hover:border-blue-500/30 transition-all duration-300">
                              {formation.imageUrl ? (
                                <div className="h-40 w-full overflow-hidden">
                                  <img 
                                    src={formation.imageUrl} 
                                    alt={formation.title} 
                                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                                  />
                                </div>
                              ) : (
                                <div className="h-40 w-full bg-gradient-to-br from-blue-900/30 to-indigo-900/50 flex items-center justify-center">
                                  <BookOpen className="h-16 w-16 text-blue-400 opacity-60" />
                                </div>
                              )}
                              
                              <div className="p-5">
                                <h3 className="text-xl font-bold mb-2 text-white group-hover:text-blue-400 transition-colors">{formation.title}</h3>
                                <p className="text-gray-400 text-sm mb-4 line-clamp-2">{formation.description}</p>
                                
                                <div className="mb-4">
                                  <div className="flex justify-between text-sm mb-1">
                                    <span className="font-medium text-blue-400">{progress}% complété</span>
                                    <span className="text-gray-400">{completedModules.length}/{modulesLength} modules</span>
                                  </div>
                                  <div className="w-full bg-gray-700/50 rounded-full h-2.5">
                                    <div 
                                      className="bg-gradient-to-r from-blue-600 to-indigo-700 h-2.5 rounded-full" 
                                      style={{ width: `${progress}%` }}
                                    ></div>
                                  </div>
                                </div>
                                
                                <div className="flex flex-wrap gap-2 mt-auto">
                                  {isCompleted && formation.certificationId && !formation.userHasCertification ? (
                                    <>
                                      <Link 
                                        to={`/formation/${formation.id}`} 
                                        className="w-[calc(50%-0.25rem)] px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium flex items-center justify-center shadow-md hover:shadow-green-600/30 transition-all"
                                      >
                                        Revoir la formation
                                      </Link>
                                      
                                      <Link 
                                        to={`/certification/${formation.certificationId}`} 
                                        className="w-[calc(50%-0.25rem)] px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium flex items-center justify-center shadow-md hover:shadow-purple-600/30 transition-all"
                                      >
                                        <Award size={16} className="mr-1" />
                                        Certification
                                      </Link>
                                    </>
                                  ) : (
                                    <Link 
                                      to={`/formation/${formation.id}`} 
                                      className="w-full px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center transition-all shadow-md 
                                        ${isCompleted 
                                          ? 'bg-green-600 hover:bg-green-700 text-white hover:shadow-green-600/30' 
                                          : progress > 0 
                                            ? 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-blue-600/30' 
                                            : 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-blue-600/30'
                                        }"
                                    >
                                      {isCompleted 
                                        ? 'Revoir la formation' 
                                        : progress > 0 
                                          ? "Continuer" 
                                          : 'Commencer'
                                      }
                                    </Link>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  );
                } catch (error) {
                  console.error("Erreur lors du rendu de l'onglet Formations:", error);
                  return (
                    <div className="bg-red-900/20 backdrop-blur-sm border border-red-700/50 rounded-xl p-6 text-center">
                      <div className="flex flex-col items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-red-500 mb-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        <h2 className="text-xl font-bold mb-2">Erreur de chargement</h2>
                        <p className="text-gray-400 max-w-lg mx-auto mb-6">
                          Une erreur s'est produite lors du chargement de vos formations. 
                          Cela peut être dû à un problème temporaire ou à une mise à jour en cours.
                        </p>
                        <button 
                          className="bg-gradient-to-r from-blue-600 to-indigo-700 px-4 py-2 rounded-lg font-medium"
                          onClick={() => window.location.reload()}
                        >
                          Actualiser la page
                        </button>
                      </div>
                    </div>
                  );
                }
              })()}
            </div>
          )}
        </main>
      </div>
      
      {/* Footer - ajout de sticky */}
      <footer className="py-4 md:py-6 bg-gray-900 border-t border-gray-800 mt-auto">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="h-8 w-8 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center">
                <span className="font-bold text-sm">ML</span>
              </div>
              <span className="font-bold text-lg">Misa Linux</span>
            </div>
            
            <div className="flex flex-wrap justify-center gap-3 md:gap-6 mb-4 md:mb-0 items-center">
              <Link to="/cgu" className="hover:text-blue-400 transition-colors text-xs md:text-sm">CGU</Link>
              <Link to="/cgv" className="hover:text-blue-400 transition-colors text-xs md:text-sm">CGV</Link>
              <Link to="/privacy" className="hover:text-blue-400 transition-colors text-xs md:text-sm">Confidentialité</Link>
            </div>
            
            <div className="text-gray-400 text-xs">
              &copy; {new Date().getFullYear()} Misa Linux
            </div>
          </div>
        </div>
      </footer>
      
      {/* Menu Popup Portal */}
      {isMenuOpen && createPortal(
        <div>
          <div 
            className="fixed inset-0 z-[999]" 
            onClick={() => setIsMenuOpen(false)}
          ></div>
          <div 
            className="fixed z-[1000] w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-xl text-white"
            style={{ 
              top: window.innerWidth >= 768 ? `${buttonPosition.top}px` : 'auto',
              bottom: window.innerWidth < 768 ? '70px' : 'auto',
              right: window.innerWidth >= 768 ? `${buttonPosition.right}px` : '10px'
            }}
          >
            <div className="p-2">
              <button 
                className="flex items-center space-x-2 w-full text-left px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors text-white"
                onClick={() => {
                  setActiveSection('profile');
                  setIsMenuOpen(false);
                }}
              >
                <User size={16} />
                <span>Mon profil</span>
              </button>
              <button 
                className="flex items-center space-x-2 w-full text-left px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors text-white"
                onClick={() => {
                  setActiveSection('settings');
                  setIsMenuOpen(false);
                }}
              >
                <Settings size={16} />
                <span>Paramètres</span>
              </button>
              <div className="border-t border-gray-700 my-1"></div>
              <button 
                className="flex items-center space-x-2 w-full text-left px-4 py-2 rounded-lg hover:bg-red-900/30 text-red-400 transition-colors"
                onClick={handleLogout}
              >
                <LogOut size={16} />
                <span>Déconnexion</span>
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Catalogue de formations */}
      {isCatalogOpen && (
        <div className="fixed inset-0 bg-gray-900/75 backdrop-blur-sm z-50 overflow-y-auto">
          <div className="container mx-auto py-12 px-4">
            <div className="max-w-6xl mx-auto bg-gray-800 rounded-xl shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="p-6 border-b border-gray-700 flex justify-between items-center">
                <h2 className="text-2xl font-bold">Catalogue de formations</h2>
                <button 
                  className="p-2 hover:bg-gray-700 rounded-full"
                  onClick={() => setIsCatalogOpen(false)}
                >
                  <X size={24} />
                </button>
              </div>
              
              {/* Content */}
              <div className="p-6">
                {allFormations.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-gray-400 mb-4">Aucune nouvelle formation n'est disponible pour le moment.</div>
                    <div className="text-sm text-gray-500">Revenez bientôt pour découvrir nos nouvelles formations.</div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {allFormations.map(formation => (
                      <div 
                        key={formation.id} 
                        className="bg-gray-700/50 rounded-lg overflow-hidden flex flex-col hover:shadow-lg hover:shadow-blue-500/10 transition-all border border-gray-600"
                      >
                        {formation.imageUrl ? (
                          <div className="h-40 overflow-hidden">
                            <img 
                              src={formation.imageUrl} 
                              alt={formation.title} 
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="h-40 bg-gradient-to-br from-blue-900/50 to-indigo-900/50 flex items-center justify-center">
                            <BookOpen size={48} className="text-blue-400/50" />
                          </div>
                        )}
                        
                        <div className="p-4 flex-1 flex flex-col">
                          <h3 className="text-lg font-bold mb-2">{formation.title}</h3>
                          <p className="text-gray-400 text-sm mb-4 flex-1">
                            {formation.description.length > 100
                              ? `${formation.description.slice(0, 100)}...`
                              : formation.description}
                          </p>
                          <button 
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors w-full mt-auto"
                          >
                            Voir les détails
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard; 