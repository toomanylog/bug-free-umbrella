import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../firebase/auth';
import FormationManager from './FormationManager';
import UserManager from './UserManager';
import CertificationManager from './CertificationManager';
import ToolManager from './ToolManager';
import AdminWalletManager from './AdminWalletManager';
import { Users, BookOpen, Home, Settings, ArrowLeft, Award, Wrench, Menu, X, CreditCard, Activity, DollarSign, UserCheck, Clock } from 'lucide-react';
import { getAllFormations } from '../../firebase/formations';
import { getAllUsers } from '../../firebase/auth';
import { getAllCertifications } from '../../firebase/certifications';
import { getAllTools } from '../../firebase/tools';
import { ref, get, query, orderByChild, limitToLast } from 'firebase/database';
import { database } from '../../firebase/config';
import { TransactionStatus, TransactionType } from '../../firebase/services/nowpayments';

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
  const [advancedStats, setAdvancedStats] = useState({
    activeUsers: 0,
    totalTransactions: 0,
    totalRevenue: 0,
    completedFormations: 0
  });
  const [recentLogs, setRecentLogs] = useState<any[]>([]);
  
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

        // Charger les statistiques avancées
        await loadAdvancedStats(users);
        
        // Charger les logs récents
        await loadRecentLogs();
      } catch (error) {
        console.error("Erreur lors du chargement des statistiques:", error);
      }
    };
    
    loadStats();
  }, []);

  // Charger les statistiques avancées
  const loadAdvancedStats = async (users: any[]) => {
    try {
      // Compter les utilisateurs actifs (selon une certaine définition, par exemple ceux qui se sont connectés récemment)
      const activeUsers = users.length; // Simplification pour l'exemple
      
      // Calculer le nombre total de transactions
      const transactionsRef = ref(database, 'transactions');
      const transactionsSnapshot = await get(transactionsRef);
      const totalTransactions = transactionsSnapshot.exists() ? Object.keys(transactionsSnapshot.val()).length : 0;
      
      // Calculer le revenu total (somme des transactions terminées)
      let totalRevenue = 0;
      if (transactionsSnapshot.exists()) {
        const transactions = transactionsSnapshot.val();
        Object.values(transactions).forEach((tx: any) => {
          if (tx.status === TransactionStatus.FINISHED && tx.type !== TransactionType.DEPOSIT) {
            totalRevenue += parseFloat(tx.amount) || 0;
          }
        });
      }
      
      // Calculer le nombre de formations terminées
      const usersRef = ref(database, 'users');
      const usersSnapshot = await get(usersRef);
      let completedFormations = 0;
      
      if (usersSnapshot.exists()) {
        const usersData = usersSnapshot.val();
        Object.values(usersData).forEach((user: any) => {
          if (user.formationsProgress) {
            Object.values(user.formationsProgress).forEach((progress: any) => {
              if (progress.completed) {
                completedFormations++;
              }
            });
          }
        });
      }
      
      setAdvancedStats({
        activeUsers,
        totalTransactions,
        totalRevenue,
        completedFormations
      });
    } catch (error) {
      console.error("Erreur lors du chargement des statistiques avancées:", error);
    }
  };

  // Charger les logs récents (transactions, connexions, etc.)
  const loadRecentLogs = async () => {
    try {
      // Récupérer les 10 dernières transactions
      const transactionsRef = ref(database, 'transactions');
      const recentTransactionsQuery = query(transactionsRef, orderByChild('createdAt'), limitToLast(10));
      const transactionsSnapshot = await get(recentTransactionsQuery);
      
      if (transactionsSnapshot.exists()) {
        const transactions = transactionsSnapshot.val();
        const transactionsArray = Object.entries(transactions).map(([id, data]: [string, any]) => ({
          id,
          ...data,
          type: 'transaction'
        }));
        
        // Trier par date (plus récent en premier)
        const sortedLogs = transactionsArray.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        
        setRecentLogs(sortedLogs.slice(0, 10));
      }
    } catch (error) {
      console.error("Erreur lors du chargement des logs récents:", error);
    }
  };

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
        className={`fixed md:static inset-y-0 left-0 z-50 bg-gray-800 text-white transition-all duration-300 ease-in-out flex flex-col ${
          sidebarCollapsed ? 'w-20' : 'w-64'
        } ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >
        <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'space-x-2'} p-4 mb-6 mt-2`}>
          <div className="h-10 w-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center">
            <span className="font-bold">ML</span>
          </div>
          {!sidebarCollapsed && <h1 className="text-xl font-bold">Admin Dashboard</h1>}
        </div>
        
        <nav className="flex-1 px-2">
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
              icon={<CreditCard size={20} />}
              label="Portefeuilles"
              active={activeSection === 'wallet'}
              onClick={() => setActiveSection('wallet')}
              collapsed={sidebarCollapsed}
            />
            <SidebarItem 
              icon={<Settings size={20} />}
              label="Paramètres"
              active={activeSection === 'settings'}
              onClick={() => setActiveSection('settings')}
              collapsed={sidebarCollapsed}
            />
          </div>
        </nav>
        
        <div className={`p-3 pb-5 mt-auto border-t border-gray-700 ${sidebarCollapsed ? 'text-center' : ''}`}>
          <button 
            onClick={goToClientDashboard}
            className={`flex items-center px-3 py-2 rounded-lg bg-gray-700 hover:bg-blue-600 text-white transition-colors ${sidebarCollapsed ? 'justify-center w-full' : 'w-full'}`}
          >
            <ArrowLeft size={18} className={sidebarCollapsed ? '' : 'mr-2'} />
            {!sidebarCollapsed && <span>Retour au dashboard client</span>}
          </button>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 overflow-auto p-4 md:p-6">
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
              {activeSection === 'tools' && 'Outils'}
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
          <div className="space-y-8">
            {/* Statistiques de base */}
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

            {/* Statistiques avancées */}
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
              <h2 className="text-xl font-semibold mb-6">Statistiques avancées</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gray-700/50 p-5 rounded-lg">
                  <div className="flex items-center mb-2">
                    <UserCheck className="h-6 w-6 text-blue-400 mr-2" />
                    <h3 className="text-lg font-medium">Utilisateurs actifs</h3>
                  </div>
                  <p className="text-3xl font-bold">{advancedStats.activeUsers}</p>
                </div>
                
                <div className="bg-gray-700/50 p-5 rounded-lg">
                  <div className="flex items-center mb-2">
                    <Activity className="h-6 w-6 text-green-400 mr-2" />
                    <h3 className="text-lg font-medium">Transactions</h3>
                  </div>
                  <p className="text-3xl font-bold">{advancedStats.totalTransactions}</p>
                </div>
                
                <div className="bg-gray-700/50 p-5 rounded-lg">
                  <div className="flex items-center mb-2">
                    <DollarSign className="h-6 w-6 text-yellow-400 mr-2" />
                    <h3 className="text-lg font-medium">Revenu total</h3>
                  </div>
                  <p className="text-3xl font-bold">{advancedStats.totalRevenue.toFixed(2)} €</p>
                </div>
                
                <div className="bg-gray-700/50 p-5 rounded-lg">
                  <div className="flex items-center mb-2">
                    <BookOpen className="h-6 w-6 text-purple-400 mr-2" />
                    <h3 className="text-lg font-medium">Formations terminées</h3>
                  </div>
                  <p className="text-3xl font-bold">{advancedStats.completedFormations}</p>
                </div>
              </div>
            </div>
            
            {/* Logs récents */}
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
              <h2 className="text-xl font-semibold mb-6">Activité récente</h2>
              <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                {recentLogs.length === 0 ? (
                  <p className="text-gray-400 text-center py-4">Aucune activité récente</p>
                ) : (
                  recentLogs.map((log) => (
                    <div key={log.id} className="bg-gray-700/50 p-4 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">
                            {log.adminAdjustment 
                              ? (log.transactionType === 'credit' 
                                ? `Ajout de fonds par ${log.adminName}` 
                                : `Retrait de fonds par ${log.adminName}`)
                              : log.type === TransactionType.DEPOSIT 
                                ? 'Dépôt'
                                : log.type === TransactionType.FORMATION_PURCHASE 
                                  ? 'Achat de formation'
                                  : log.type === TransactionType.TOOL_PURCHASE 
                                    ? 'Achat d\'outil'
                                    : 'Transaction'
                            }
                          </p>
                          <p className="text-sm text-gray-400 mt-1">{log.description || 'Pas de description'}</p>
                        </div>
                        <div className="text-right">
                          <p className={`font-medium ${log.transactionType === 'credit' ? 'text-green-400' : 'text-red-400'}`}>
                            {log.transactionType === 'credit' ? '+' : '-'}{log.amount} {log.currency}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(log.createdAt).toLocaleDateString('fr-FR', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center mt-2">
                        <Clock size={14} className="text-gray-400 mr-1" />
                        <span className="text-xs text-gray-400">
                          {log.status === TransactionStatus.FINISHED 
                            ? 'Terminée' 
                            : log.status === TransactionStatus.WAITING 
                              ? 'En attente'
                              : log.status === TransactionStatus.FAILED
                                ? 'Échouée'
                                : 'En cours'
                          }
                        </span>
                      </div>
                    </div>
                  ))
                )}
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