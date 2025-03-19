import React, { useState } from 'react';
import { X, Menu, ChevronDown, LogOut, User, Settings, BarChart2, Book, FileText, Tool } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { logoutUser } from '../firebase/auth';

interface DashboardProps {
  onClose: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onClose }) => {
  const { currentUser } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('overview');

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const handleLogout = async () => {
    try {
      await logoutUser();
      onClose();
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
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
                  onClick={toggleMenu}
                  className="flex items-center space-x-2 bg-gray-800 hover:bg-gray-700 rounded-lg px-4 py-2 transition-colors"
                >
                  <span>{currentUser?.displayName || currentUser?.email}</span>
                  <ChevronDown size={16} className={`transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50">
                    <div className="p-2">
                      <button 
                        className="flex items-center space-x-2 w-full text-left px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                        onClick={() => setActiveSection('profile')}
                      >
                        <User size={16} />
                        <span>Mon profil</span>
                      </button>
                      <button 
                        className="flex items-center space-x-2 w-full text-left px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                        onClick={() => setActiveSection('settings')}
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
                )}
              </div>
            </div>
            
            {/* Mobile Menu Button */}
            <button onClick={toggleMenu} className="md:hidden relative z-20 p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors">
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
              {/* Tool 1 */}
              <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 hover:shadow-lg hover:shadow-blue-900/10 transition-all">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-blue-900/20 rounded-lg">
                    <Tool className="text-blue-400" size={24} />
                  </div>
                  <span className="px-2 py-1 bg-green-900/30 text-green-400 text-xs rounded-full">Actif</span>
                </div>
                <h3 className="text-xl font-bold mb-2">Générateur de Coldmail</h3>
                <p className="text-gray-400 mb-4">Créez rapidement des coldmails efficaces et personnalisés grâce à notre outil d'IA.</p>
                <button className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 px-4 py-2 rounded-lg font-medium transition-all duration-300 hover:shadow-lg hover:shadow-blue-600/30">
                  Utiliser l'outil
                </button>
              </div>
              
              {/* Tool 2 */}
              <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 hover:shadow-lg hover:shadow-blue-900/10 transition-all">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-purple-900/20 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-400">
                      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                    </svg>
                  </div>
                  <span className="px-2 py-1 bg-green-900/30 text-green-400 text-xs rounded-full">Actif</span>
                </div>
                <h3 className="text-xl font-bold mb-2">Vérificateur PACKID</h3>
                <p className="text-gray-400 mb-4">Vérifiez rapidement l'état et la validité de vos PACKID avec notre outil de diagnostic.</p>
                <button className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 px-4 py-2 rounded-lg font-medium transition-all duration-300 hover:shadow-lg hover:shadow-blue-600/30">
                  Utiliser l'outil
                </button>
              </div>
              
              {/* Tool 3 */}
              <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 hover:shadow-lg hover:shadow-blue-900/10 transition-all">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-indigo-900/20 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-400">
                      <rect width="20" height="14" x="2" y="5" rx="2" />
                      <line x1="2" x2="22" y1="10" y2="10" />
                    </svg>
                  </div>
                  <span className="px-2 py-1 bg-yellow-900/30 text-yellow-400 text-xs rounded-full">Bientôt</span>
                </div>
                <h3 className="text-xl font-bold mb-2">Simulateur de Crédit</h3>
                <p className="text-gray-400 mb-4">Simulez vos chances d'obtention de crédit avec notre outil d'analyse prédictive.</p>
                <button className="w-full bg-gray-700 px-4 py-2 rounded-lg font-medium transition-all duration-300 cursor-not-allowed opacity-70">
                  Disponible prochainement
                </button>
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
                    <button className="bg-gradient-to-r from-blue-600 to-indigo-700 px-4 py-2 rounded-lg font-medium transition-all duration-300 hover:shadow-lg hover:shadow-blue-600/30">
                      Modifier le profil
                    </button>
                    <button className="bg-transparent border border-gray-700 px-4 py-2 rounded-lg font-medium transition-all duration-300 hover:bg-gray-800/50">
                      Changer le mot de passe
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
              <h2 className="text-xl font-bold mb-4">Informations personnelles</h2>
              <form className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Nom complet</label>
                    <input 
                      type="text" 
                      value={currentUser?.displayName || ''}
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
                  <label className="block text-sm font-medium text-gray-400 mb-1">Téléphone</label>
                  <input 
                    type="tel" 
                    placeholder="Votre numéro de téléphone"
                    className="w-full px-4 py-3 bg-gray-900/80 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
                  />
                </div>
                <button className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-3 rounded-lg font-medium transition-all duration-300 hover:shadow-lg hover:shadow-blue-600/30">
                  Enregistrer les modifications
                </button>
              </form>
            </div>
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
              <a href="/cgu" className="hover:text-blue-400 transition-colors text-sm">Conditions générales d'utilisation</a>
              <a href="/cgv" className="hover:text-blue-400 transition-colors text-sm">Conditions générales de vente</a>
              <a href="/privacy" className="hover:text-blue-400 transition-colors text-sm">Politique de confidentialité</a>
            </div>
            
            <div className="text-gray-400 text-xs">
              &copy; {new Date().getFullYear()} Misa Linux. Tous droits réservés.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard; 