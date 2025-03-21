import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../firebase/auth';
import FormationManager from './FormationManager';
import UserManager from './UserManager';
import CertificationManager from './CertificationManager';
import ToolManager from './ToolManager';
import { Users, BookOpen, Home, Settings, ArrowLeft, Award, Wrench } from 'lucide-react';
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
}> = ({ icon, label, active, onClick }) => (
  <li 
    className={`flex items-center space-x-2 p-3 rounded-lg cursor-pointer transition-colors ${
      active ? 'bg-blue-600 text-white' : 'hover:bg-gray-700 text-gray-300'
    }`}
    onClick={onClick}
  >
    <div className="text-xl">{icon}</div>
    <span>{label}</span>
  </li>
);

const AdminDashboard: React.FC = () => {
  const { userData, isAdmin } = useAuth();
  const [activeSection, setActiveSection] = useState<string>('dashboard');
  const [stats, setStats] = useState({
    formations: 0,
    users: 0,
    certifications: 0,
    tools: 0
  });
  
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

  return (
    <div className="min-h-screen bg-gray-900 text-white flex">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 border-r border-gray-700 p-4">
        <div className="flex items-center space-x-2 mb-8">
          <div className="h-10 w-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center">
            <span className="font-bold">ML</span>
          </div>
          <h1 className="text-xl font-bold">Admin Dashboard</h1>
        </div>
        
        <ul className="space-y-2">
          <SidebarItem 
            icon={<Home size={20} />}
            label="Tableau de bord"
            active={activeSection === 'dashboard'}
            onClick={() => setActiveSection('dashboard')}
          />
          <SidebarItem 
            icon={<BookOpen size={20} />}
            label="Formations"
            active={activeSection === 'formations'}
            onClick={() => setActiveSection('formations')}
          />
          <SidebarItem 
            icon={<Award size={20} />}
            label="Certifications"
            active={activeSection === 'certifications'}
            onClick={() => setActiveSection('certifications')}
          />
          <SidebarItem 
            icon={<Wrench size={20} />}
            label="Outils"
            active={activeSection === 'tools'}
            onClick={() => setActiveSection('tools')}
          />
          <SidebarItem 
            icon={<Users size={20} />}
            label="Utilisateurs"
            active={activeSection === 'users'}
            onClick={() => setActiveSection('users')}
          />
          <SidebarItem 
            icon={<Settings size={20} />}
            label="Paramètres"
            active={activeSection === 'settings'}
            onClick={() => setActiveSection('settings')}
          />
        </ul>
        
        <div className="mt-8 pt-4 border-t border-gray-700">
          <button 
            onClick={goToClientDashboard}
            className="flex items-center text-gray-400 hover:text-white transition-colors w-full py-2"
          >
            <ArrowLeft size={18} className="mr-2" />
            <span>Retour au dashboard client</span>
          </button>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 p-8 overflow-y-auto">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold">
            {activeSection === 'dashboard' && 'Tableau de bord'}
            {activeSection === 'formations' && 'Gestion des formations'}
            {activeSection === 'certifications' && 'Gestion des certifications'}
            {activeSection === 'tools' && 'Gestion des outils'}
            {activeSection === 'users' && 'Gestion des utilisateurs'}
            {activeSection === 'settings' && 'Paramètres'}
          </h1>
          <p className="text-gray-400">
            Connecté en tant que {userData.displayName} (Admin)
          </p>
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