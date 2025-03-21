import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../firebase/auth';
import FormationManager from './FormationManager';
import UserManager from './UserManager';
import CertificationManager from './CertificationManager';
import ToolManager from './ToolManager';
import AdminWalletManager from './AdminWalletManager';
import { Users, BookOpen, Home, Settings, ArrowLeft, Award, Wrench, Menu, X, CreditCard } from 'lucide-react';
import { getAllFormations } from '../../firebase/formations';
import { getAllUsers } from '../../firebase/auth';
import { getAllCertifications } from '../../firebase/certifications';
import { getAllTools } from '../../firebase/tools';

// Sidebar Item Component
const SidebarItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
  collapsed?: boolean;
}> = ({ icon, label, active, onClick, collapsed }) => (
  <li 
    className={`flex items-center ${collapsed ? 'justify-center' : 'space-x-2'} p-3 rounded-lg cursor-pointer transition-colors ${
      active ? 'bg-blue-600 text-white' : 'hover:bg-gray-700 text-gray-300'
    }`}
    onClick={onClick}
  >
    <div className="text-xl">{icon}</div>
    {!collapsed && <span>{label}</span>}
  </li>
);

const AdminDashboard: React.FC = () => {
  const { userData, isAdmin } = useAuth();
  const [activeSection, setActiveSection] = useState<string>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(window.innerWidth < 768);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [stats, setStats] = useState({
    formations: 0,
    users: 0,
    certifications: 0,
    tools: 0
  });
  
  // Surveiller les changements de taille d'écran
  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth < 768;
      if (isMobile) {
        setSidebarCollapsed(!mobileMenuOpen);
      }
    };
    
    window.addEventListener('resize', handleResize);
    handleResize();
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [mobileMenuOpen]);
  
  // Charger les statistiques
  useEffect(() => {
    const loadStats = async () => {
      try {
        // Charger le nombre de formations
        const formations = await getAllFormations();
        
        // Charger le nombre d'utilisateurs
        const users = await getAllUsers();
        
        // Charger le nombre de certifications
        const certifications = await getAllCertifications();
        
        // Charger le nombre d'outils
        const tools = await getAllTools();
        
        setStats({
          formations: formations.length,
          users: users.length,
          certifications: certifications.length,
          tools: tools.length
        });
      } catch (error) {
        console.error("Erreur lors du chargement des statistiques:", error);
      }
    };
    
    loadStats();
  }, []);

  useEffect(() => {
    // Si l'utilisateur n'est pas admin, rediriger
    if (userData && userData.role !== UserRole.ADMIN) {
      // Rediriger vers le dashboard client
      window.location.href = '/dashboard';
    }
  }, [userData]);

  // Si les données n'ont pas encore été chargées ou si l'utilisateur n'est pas admin
  if (!userData || !isAdmin) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const goToClientDashboard = () => {
    window.location.href = '/';
  };

  const toggleSidebar = () => {
    setMobileMenuOpen(!mobileMenuOpen);
    setSidebarCollapsed(!mobileMenuOpen);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex">
      {/* Overlay pour fermer le menu sur mobile */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => {
            setMobileMenuOpen(false);
            setSidebarCollapsed(true);
          }}
        ></div>
      )}
      
      {/* Sidebar */}
      <div 
        className={`fixed md:static inset-y-0 left-0 z-50 bg-gray-800 text-white transition-all duration-300 ease-in-out ${
          sidebarCollapsed ? 'w-20' : 'w-64'
        } ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >
        <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'space-x-2'} mb-8`}>
          <div className="h-10 w-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center">
            <span className="font-bold">ML</span>
          </div>
          {!sidebarCollapsed && <h1 className="text-xl font-bold">Admin Dashboard</h1>}
        </div>
        
        <nav className="mt-10 px-2">
          <div className={`space-y-2 ${sidebarCollapsed ? 'items-center' : ''}`}>
            <SidebarItem 
              icon={<Home size={20} />}
              label="Tableau de bord"
              active={activeSection === 'dashboard'}
              onClick={() => setActiveSection('dashboard')}
              collapsed={sidebarCollapsed}
            />
            <SidebarItem 
              icon={<BookOpen size={20} />}
              label="Formations"
              active={activeSection === 'formations'}
              onClick={() => setActiveSection('formations')}
              collapsed={sidebarCollapsed}
            />
            <SidebarItem 
              icon={<Award size={20} />}
              label="Certifications"
              active={activeSection === 'certifications'}
              onClick={() => setActiveSection('certifications')}
              collapsed={sidebarCollapsed}
            />
            <SidebarItem 
              icon={<Wrench size={20} />}
              label="Outils"
              active={activeSection === 'tools'}
              onClick={() => setActiveSection('tools')}
              collapsed={sidebarCollapsed}
            />
            <SidebarItem 
              icon={<Users size={20} />}
              label="Utilisateurs"
              active={activeSection === 'users'}
              onClick={() => setActiveSection('users')}
              collapsed={sidebarCollapsed}
            />
            <SidebarItem 
              icon={<Settings size={20} />}
              label="Paramètres"
              active={activeSection === 'settings'}
              onClick={() => setActiveSection('settings')}
              collapsed={sidebarCollapsed}
            />
            <button
              className={`w-full flex items-center py-3 px-4 rounded-lg ${
                activeSection === 'wallet' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-white'
              } transition-colors`}
              onClick={() => setActiveSection('wallet')}
            >
              <CreditCard size={24} className={`${sidebarCollapsed ? 'mx-auto' : 'mr-3'}`} />
              {!sidebarCollapsed && <span>Portefeuilles</span>}
            </button>
          </div>
        </nav>
        
        <div className={`mt-8 pt-4 border-t border-gray-700 ${sidebarCollapsed ? 'text-center' : ''}`}>
          <button 
            onClick={goToClientDashboard}
            className={`flex items-center text-gray-400 hover:text-white transition-colors ${sidebarCollapsed ? 'justify-center w-full' : 'w-full py-2'}`}
          >
            <ArrowLeft size={18} className={sidebarCollapsed ? '' : 'mr-2'} />
            {!sidebarCollapsed && <span>Retour au dashboard client</span>}
          </button>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Header avec bouton de menu */}
        <header className="mb-8 flex items-center">
          <button 
            className="md:hidden mr-4 p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
            onClick={toggleSidebar}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          
          {/* Suppression du bouton pour plier/déplier la sidebar sur desktop */}
          
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">
              {activeSection === 'dashboard' && 'Tableau de bord'}
              {activeSection === 'formations' && 'Gestion des formations'}
              {activeSection === 'certifications' && 'Gestion des certifications'}
              {activeSection === 'tools' && 'Gestion des outils'}
              {activeSection === 'users' && 'Gestion des utilisateurs'}
              {activeSection === 'settings' && 'Paramètres'}
              {activeSection === 'wallet' && 'Gestion des portefeuilles'}
            </h1>
            <p className="text-gray-400 text-sm md:text-base">
              Connecté en tant que {userData.displayName} (Admin)
            </p>
          </div>
        </header>
        
        {/* Dynamic Content */}
        {activeSection === 'dashboard' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
              <h2 className="text-xl font-semibold mb-4">Formations</h2>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold">{stats.formations}</span>
                <BookOpen size={28} className="text-blue-500" />
              </div>
            </div>
            
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
              <h2 className="text-xl font-semibold mb-4">Utilisateurs</h2>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold">{stats.users}</span>
                <Users size={28} className="text-green-500" />
              </div>
            </div>
            
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
              <h2 className="text-xl font-semibold mb-4">Certifications</h2>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold">{stats.certifications}</span>
                <Award size={28} className="text-yellow-500" />
              </div>
            </div>
            
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
              <h2 className="text-xl font-semibold mb-4">Outils</h2>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold">{stats.tools}</span>
                <Wrench size={28} className="text-purple-500" />
              </div>
            </div>
          </div>
        )}
        
        {activeSection === 'formations' && <FormationManager />}
        {activeSection === 'certifications' && <CertificationManager />}
        {activeSection === 'tools' && <ToolManager />}
        {activeSection === 'users' && <UserManager />}
        {activeSection === 'wallet' && <AdminWalletManager />}
        {activeSection === 'settings' && (
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Paramètres du site</h2>
            <p className="text-gray-400 mb-4">Les paramètres seront disponibles prochainement.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard; 