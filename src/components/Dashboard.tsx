import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Menu, ChevronDown, LogOut, User, Settings, BarChart2, Book, FileText, Wrench } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { logoutUser, updateUserProfile, changeUserPassword, getUserData } from '../firebase/auth';
import { Link } from 'react-router-dom';

interface DashboardProps {
  onClose: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onClose }) => {
  const { currentUser } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('overview');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
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
          }
        } catch (error) {
          console.error('Erreur lors du chargement des données utilisateur:', error);
        }
      }
    };
    
    loadUserData();
  }, [currentUser]);

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

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPassword(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) {
      alert('Vous devez être connecté pour modifier votre profil.');
      return;
    }
    
    setIsLoading(true);
    setSuccessMessage('');
    
    try {
      await updateUserProfile(
        currentUser,
        userProfile.displayName,
        userProfile.telegram
      );
      
      setSuccessMessage('Profil mis à jour avec succès!');
      setTimeout(() => {
        setIsEditingProfile(false);
        setSuccessMessage('');
      }, 2000);
      
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      alert('Une erreur est survenue lors de la mise à jour du profil.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) {
      alert('Vous devez être connecté pour changer votre mot de passe.');
      return;
    }
    
    // Vérifier que les mots de passe correspondent
    if (password.new !== password.confirm) {
      alert('Les nouveaux mots de passe ne correspondent pas.');
      return;
    }
    
    setIsLoading(true);
    setSuccessMessage('');
    
    try {
      await changeUserPassword(
        currentUser,
        password.current,
        password.new
      );
      
      setSuccessMessage('Mot de passe changé avec succès!');
      setTimeout(() => {
        setIsChangingPassword(false);
        setSuccessMessage('');
        setPassword({ current: '', new: '', confirm: '' });
      }, 2000);
      
    } catch (error: any) {
      console.error('Erreur lors du changement de mot de passe:', error);
      
      if (error.code === 'auth/wrong-password') {
        alert('Le mot de passe actuel est incorrect.');
      } else {
        alert('Une erreur est survenue lors du changement de mot de passe.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Données factices pour le dashboard
  const userStats = {
    totalFormations: 3,
    formationsCompleted: 1,
    certificationsObtained: 1,
    lastLogin: new Date().toLocaleDateString('fr-FR')
  };

  const formations = [
    { id: 1, title: 'Masterclass Obtention de Crédit', progress: 45, totalModules: 12, completedModules: 5 },
    { id: 2, title: 'PACKID Professionnel', progress: 20, totalModules: 8, completedModules: 2 },
    { id: 3, title: 'Coldmail Expert', progress: 10, totalModules: 10, completedModules: 1 }
  ];

  const notifications = [
    { id: 1, message: 'Nouvelle formation disponible : "Techniques avancées de Coldmail"', date: '21/03/2025', isRead: false },
    { id: 2, message: 'Votre certification pour "PACKID Professionnel" est en cours de validation', date: '20/03/2025', isRead: true },
    { id: 3, message: 'Mise à jour des outils de PACKID disponible', date: '19/03/2025', isRead: true }
  ];

  // Outils disponibles
  const tools = [
    {
      id: 1,
      name: "Vérificateur de Leads",
      description: "Analysez vos listes d'emails et de numéros pour déterminer le taux de bounce, les leads détectés comme leaks, spam traps ou à risque.",
      icon: <Wrench className="text-blue-400" size={24} />,
      status: "active",
      features: ["Détection de bounce", "Identification de spam traps", "Analyse de risques", "Statistiques détaillées", "Export de rapports"]
    },
    {
      id: 2,
      name: "Email Sender Pro",
      description: "Système d'envoi d'emails rotatif avancé avec rotation de sujets, noms d'expéditeur, adresses, templates HTML et variables personnalisées.",
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-400">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>,
      status: "active",
      features: ["Rotation de SMTP", "Templates HTML dynamiques", "Variables personnalisables", "Gestion de bouncing", "Limitation de débit"]
    },
    {
      id: 3,
      name: "Credential Cracker",
      description: "Détectez les identifiants de connexion exposés dans des listes d'IP ou de domaines pour identifier les SMTP vulnérables et les clés API.",
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-400">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
              <rect x="8" y="16" width="8" height="6" rx="1"></rect>
            </svg>,
      status: "soon",
      features: ["Scan d'IP et domaines", "Détection de SMTP", "Recherche de clés API", "Analyse de vulnérabilités", "Export de résultats"]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-900/90 backdrop-blur-md py-4 shadow-xl border-b border-gray-800">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="h-12 w-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center transform rotate-12">
                <span className="font-bold text-xl">ML</span>
              </div>
              <span className="font-bold text-2xl bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">Misa Linux</span>
            </div>
            
            {/* Navigation - Desktop */}
            <nav className="hidden md:flex space-x-8">
              <button 
                onClick={() => setActiveSection('overview')}
                className={`relative hover:text-blue-400 transition-colors group ${activeSection === 'overview' ? 'text-blue-400' : ''}`}
              >
                Tableau de bord
                <span className={`absolute bottom-0 left-0 h-0.5 bg-blue-400 transition-all duration-300 ${activeSection === 'overview' ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
              </button>
              <button 
                onClick={() => setActiveSection('formations')}
                className={`relative hover:text-blue-400 transition-colors group ${activeSection === 'formations' ? 'text-blue-400' : ''}`}
              >
                Mes formations
                <span className={`absolute bottom-0 left-0 h-0.5 bg-blue-400 transition-all duration-300 ${activeSection === 'formations' ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
              </button>
              <button 
                onClick={() => setActiveSection('tools')}
                className={`relative hover:text-blue-400 transition-colors group ${activeSection === 'tools' ? 'text-blue-400' : ''}`}
              >
                Outils
                <span className={`absolute bottom-0 left-0 h-0.5 bg-blue-400 transition-all duration-300 ${activeSection === 'tools' ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
              </button>
            </nav>
            
            {/* User Menu */}
            <div className="hidden md:flex items-center space-x-4">
              <div className="relative">
                <button 
                  ref={buttonRef}
                  onClick={handleMenuToggle}
                  className="flex items-center space-x-2 bg-gray-800 hover:bg-gray-700 rounded-lg px-4 py-2 transition-colors"
                >
                  <span>{currentUser?.displayName || currentUser?.email}</span>
                  <ChevronDown size={16} className={`transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} />
                </button>
              </div>
            </div>
            
            {/* Mobile Menu Button */}
            <button onClick={handleMenuToggle} className="md:hidden relative z-20 p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors">
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
          
          {/* Mobile Menu */}
          <div className={`fixed inset-0 bg-gray-900/95 backdrop-blur-md z-10 flex items-center justify-center transition-all duration-500 md:hidden ${
            isMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
          }`}>
            <nav className="flex flex-col items-center space-y-6 text-center">
              <button 
                onClick={() => {
                  setActiveSection('overview');
                  setIsMenuOpen(false);
                }}
                className={`text-2xl font-bold ${activeSection === 'overview' ? 'text-blue-400' : 'hover:text-blue-400'} transition-colors`}
              >
                Tableau de bord
              </button>
              <button 
                onClick={() => {
                  setActiveSection('formations');
                  setIsMenuOpen(false);
                }}
                className={`text-2xl font-bold ${activeSection === 'formations' ? 'text-blue-400' : 'hover:text-blue-400'} transition-colors`}
              >
                Mes formations
              </button>
              <button 
                onClick={() => {
                  setActiveSection('tools');
                  setIsMenuOpen(false);
                }}
                className={`text-2xl font-bold ${activeSection === 'tools' ? 'text-blue-400' : 'hover:text-blue-400'} transition-colors`}
              >
                Outils
              </button>
              <button 
                onClick={() => {
                  setActiveSection('profile');
                  setIsMenuOpen(false);
                }}
                className={`text-2xl font-bold ${activeSection === 'profile' ? 'text-blue-400' : 'hover:text-blue-400'} transition-colors`}
              >
                Mon profil
              </button>
              <button 
                onClick={handleLogout}
                className="mt-8 bg-gradient-to-r from-blue-600 to-indigo-700 px-8 py-3 rounded-lg font-medium transition-all duration-300 hover:shadow-lg hover:shadow-blue-600/30"
              >
                Déconnexion
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {activeSection === 'overview' && (
          <div className="space-y-8">
            <h1 className="text-3xl font-bold">Bienvenue, {currentUser?.displayName || 'Utilisateur'} !</h1>
            
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 hover:shadow-lg hover:shadow-blue-900/10 transition-all">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-gray-400 text-sm">Formations totales</p>
                    <h3 className="text-2xl font-bold mt-1">{userStats.totalFormations}</h3>
                  </div>
                  <div className="p-3 bg-blue-500/10 rounded-lg">
                    <Book className="text-blue-400" size={24} />
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 hover:shadow-lg hover:shadow-blue-900/10 transition-all">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-gray-400 text-sm">Formations terminées</p>
                    <h3 className="text-2xl font-bold mt-1">{userStats.formationsCompleted}</h3>
                  </div>
                  <div className="p-3 bg-green-500/10 rounded-lg">
                    <FileText className="text-green-400" size={24} />
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 hover:shadow-lg hover:shadow-blue-900/10 transition-all">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-gray-400 text-sm">Certifications</p>
                    <h3 className="text-2xl font-bold mt-1">{userStats.certificationsObtained}</h3>
                  </div>
                  <div className="p-3 bg-purple-500/10 rounded-lg">
                    <BarChart2 className="text-purple-400" size={24} />
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 hover:shadow-lg hover:shadow-blue-900/10 transition-all">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-gray-400 text-sm">Dernière connexion</p>
                    <h3 className="text-xl font-bold mt-1">{userStats.lastLogin}</h3>
                  </div>
                  <div className="p-3 bg-indigo-500/10 rounded-lg">
                    <User className="text-indigo-400" size={24} />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Progress Section */}
            <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
              <h2 className="text-xl font-bold mb-4">Progression des formations</h2>
              <div className="space-y-6">
                {formations.map(formation => (
                  <div key={formation.id} className="space-y-2">
                    <div className="flex justify-between">
                      <span>{formation.title}</span>
                      <span className="text-blue-400">{formation.progress}%</span>
                    </div>
                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-600 to-indigo-700" 
                        style={{ width: `${formation.progress}%` }}
                      ></div>
                    </div>
                    <div className="text-sm text-gray-400">
                      {formation.completedModules} sur {formation.totalModules} modules complétés
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Notifications */}
            <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
              <h2 className="text-xl font-bold mb-4">Notifications récentes</h2>
              <div className="space-y-4">
                {notifications.map(notification => (
                  <div 
                    key={notification.id} 
                    className={`p-4 border ${notification.isRead ? 'border-gray-700/50 bg-gray-800/30' : 'border-blue-500/30 bg-blue-900/10'} rounded-lg`}
                  >
                    <div className="flex justify-between items-start">
                      <p className={notification.isRead ? 'text-gray-300' : 'text-white font-medium'}>
                        {notification.message}
                      </p>
                      {!notification.isRead && (
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      )}
                    </div>
                    <p className="text-sm text-gray-400 mt-2">{notification.date}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeSection === 'formations' && (
          <div className="space-y-8">
            <h1 className="text-3xl font-bold">Mes formations</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {formations.map(formation => (
                <div key={formation.id} className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-xl overflow-hidden hover:shadow-lg hover:shadow-blue-900/10 transition-all">
                  <div className="h-40 bg-gradient-to-br from-blue-900/40 to-indigo-900/40 flex items-center justify-center">
                    <Book size={64} className="text-blue-400 opacity-50" />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-2">{formation.title}</h3>
                    <div className="flex justify-between text-sm text-gray-400 mb-3">
                      <span>Progression: {formation.progress}%</span>
                      <span>{formation.completedModules}/{formation.totalModules} modules</span>
                    </div>
                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden mb-4">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-600 to-indigo-700" 
                        style={{ width: `${formation.progress}%` }}
                      ></div>
                    </div>
                    <button className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 px-4 py-2 rounded-lg font-medium transition-all duration-300 hover:shadow-lg hover:shadow-blue-600/30">
                      Continuer
                    </button>
                  </div>
                </div>
              ))}
              
              {/* Add New Formation Card */}
              <div className="bg-gray-800/30 backdrop-blur-sm border border-dashed border-gray-700/50 rounded-xl overflow-hidden hover:shadow-lg hover:shadow-blue-900/10 transition-all flex flex-col items-center justify-center p-6 h-full">
                <div className="p-4 bg-blue-900/20 rounded-full mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400">
                    <path d="M5 12h14" />
                    <path d="M12 5v14" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2 text-center">Découvrir plus</h3>
                <p className="text-gray-400 text-center mb-4">Explorez notre catalogue de formations</p>
                <button className="bg-transparent border border-blue-600 px-4 py-2 rounded-lg font-medium transition-all duration-300 hover:bg-blue-900/20">
                  Voir le catalogue
                </button>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'tools' && (
          <div className="space-y-8">
            <h1 className="text-3xl font-bold">Outils spécialisés</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tools.map(tool => (
                <div key={tool.id} className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 hover:shadow-lg hover:shadow-blue-900/10 transition-all">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-blue-900/20 rounded-lg">
                      {tool.icon}
                    </div>
                    {tool.status === "active" ? (
                      <span className="px-2 py-1 bg-green-900/30 text-green-400 text-xs rounded-full">Actif</span>
                    ) : (
                      <span className="px-2 py-1 bg-yellow-900/30 text-yellow-400 text-xs rounded-full">Bientôt</span>
                    )}
                  </div>
                  <h3 className="text-xl font-bold mb-2">{tool.name}</h3>
                  <p className="text-gray-400 mb-4">{tool.description}</p>
                  <div className="mb-4">
                    <p className="text-sm text-gray-300 mb-2">Fonctionnalités:</p>
                    <ul className="text-sm text-gray-400 list-disc pl-5 space-y-1">
                      {tool.features.map((feature, index) => (
                        <li key={index}>{feature}</li>
                      ))}
                    </ul>
                  </div>
                  {tool.status === "active" ? (
                    <button className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 px-4 py-2 rounded-lg font-medium transition-all duration-300 hover:shadow-lg hover:shadow-blue-600/30">
                      Utiliser l'outil
                    </button>
                  ) : (
                    <button className="w-full bg-gray-700 px-4 py-2 rounded-lg font-medium transition-all duration-300 cursor-not-allowed opacity-70">
                      Disponible prochainement
                    </button>
                  )}
                </div>
              ))}
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
                
                {successMessage && (
                  <div className="bg-green-500/20 border border-green-500 text-green-100 px-4 py-2 rounded-lg mb-4">
                    {successMessage}
                  </div>
                )}
                
                <form className="space-y-4" onSubmit={saveProfile}>
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
                      disabled={isLoading}
                      className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-3 rounded-lg font-medium transition-all duration-300 hover:shadow-lg hover:shadow-blue-600/30 disabled:opacity-70"
                    >
                      {isLoading ? 'Enregistrement...' : 'Enregistrer les modifications'}
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
                
                {successMessage && (
                  <div className="bg-green-500/20 border border-green-500 text-green-100 px-4 py-2 rounded-lg mb-4">
                    {successMessage}
                  </div>
                )}
                
                <form className="space-y-4" onSubmit={changePassword}>
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
                      disabled={isLoading}
                      className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-3 rounded-lg font-medium transition-all duration-300 hover:shadow-lg hover:shadow-blue-600/30 disabled:opacity-70"
                    >
                      {isLoading ? 'Modification...' : 'Changer le mot de passe'}
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
          </div>
        )}
      </main>
      
      {/* Footer */}
      <footer className="py-8 bg-gray-900 border-t border-gray-800 mt-auto">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-6 md:mb-0">
              <div className="h-8 w-8 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center">
                <span className="font-bold text-sm">ML</span>
              </div>
              <span className="font-bold text-lg">Misa Linux</span>
            </div>
            
            <div className="flex flex-col md:flex-row gap-6 md:gap-10 mb-6 md:mb-0 items-center">
              <Link to="/cgu" className="hover:text-blue-400 transition-colors text-sm">Conditions générales d'utilisation</Link>
              <Link to="/cgv" className="hover:text-blue-400 transition-colors text-sm">Conditions générales de vente</Link>
              <Link to="/privacy" className="hover:text-blue-400 transition-colors text-sm">Politique de confidentialité</Link>
            </div>
            
            <div className="text-gray-400 text-xs">
              &copy; {new Date().getFullYear()} Misa Linux. Tous droits réservés.
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
              top: `${buttonPosition.top}px`, 
              right: `${buttonPosition.right}px` 
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
              <div className="my-1 border-t border-gray-700"></div>
              <button 
                className="flex items-center space-x-2 w-full text-left px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors text-red-400"
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
    </div>
  );
};

export default Dashboard; 