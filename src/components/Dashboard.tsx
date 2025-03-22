import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { UserRole, updateUserPreferences, assignFormationToUser } from '../firebase/auth';
import { createFormationPurchase } from '../firebase/wallet';
import { TransactionStatus } from '../firebase/services/nowpayments';
import { checkToolAccess } from '../firebase/tools';
import WalletComponent from './WalletComponent';
import {
  Menu,
  X,
  LogOut,
  Settings,
  User,
  Wallet,
  BookOpen,
  Award,
  Wrench,
  Bell,
  ChevronDown,
  ChevronUp,
  Search,
  Check,
  Info,
  AlertTriangle,
  BarChart2,
  Home,
  Clock,
  Zap,
  HelpCircle,
  Lock,
  ArrowRightCircle,
  Compass,
  Pencil
} from 'lucide-react';
// Importer le système de notification partagé
import { useNotification } from './common/NotificationSystem';

// Supprimer la définition du composant Modal qui a été déplacée vers NotificationSystem.tsx

// ... existing code ...

interface DashboardProps {
  onClose: () => void;
}

// ... existing code ...

const Dashboard: React.FC<DashboardProps> = ({ onClose }) => {
  const { currentUser, userData, logout, isAdmin } = useAuth();
  // Utiliser le hook de notification
  const { showNotification, showConfirm, confirmDialog } = useNotification();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState(() => {
    // Persister l'onglet actif en utilisant localStorage
    const savedSection = localStorage.getItem('dashboardActiveSection');
    return savedSection || 'overview';
  });
  const [sidebarCollapsed, setSidebarCollapsed] = useState(window.innerWidth < 768);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Persister l'onglet actif dans le localStorage quand il change
  useEffect(() => {
    localStorage.setItem('dashboardActiveSection', activeSection);
  }, [activeSection]);
  
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const [profileTab, setProfileTab] = useState('info');
  const [userFormations, setUserFormations] = useState<any[]>([]);
  const [formations, setFormations] = useState<any[]>([]);
  const [userCertifications, setUserCertifications] = useState<any[]>([]);
  const [certifications, setCertifications] = useState<any[]>([]);
  const [userTools, setUserTools] = useState<any[]>([]);
  const [tools, setTools] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedModules, setExpandedModules] = useState<{[key: string]: boolean}>({});
  const [progress, setProgress] = useState<{[key: string]: number}>({});
  const [loading, setLoading] = useState({
    formations: false,
    certifications: false,
    tools: false
  });
  
  // Supprimer les états pour les modales qui sont maintenant dans le système partagé
  const [password, setPassword] = useState({
    current: '',
    new: '',
    confirm: ''
  });
  const [profile, setProfile] = useState({
    displayName: currentUser?.displayName || '',
    photoURL: currentUser?.photoURL || '',
    preferences: {
      theme: 'dark',
      notifications: true,
      emailNotifications: true
    }
  });

  // ... existing code ...

  // Remplacer l'alert pour l'acquisition de formation gratuite
  const handleGetFreeFormation = async (formation: any) => {
    if (!currentUser) return;
    
    try {
      // Assigner directement la formation gratuite
      await assignFormationToUser(currentUser.uid, formation.id);
      
      // Rafraîchir les données
      const loadUserFormations = async () => {
        if (!currentUser) return;
        
        try {
          setLoading(prev => ({ ...prev, formations: true }));
          const { getUserFormations } = await import('../firebase/formations');
          const userFormationsData = await getUserFormations(currentUser.uid);
          
          if (Array.isArray(userFormationsData)) {
            // Filtrer pour ne garder que les éléments valides
            const validFormations = userFormationsData
              .filter((item): item is {formation: any; progress: any} => 
                item !== null && item.formation !== null
              );
            setUserFormations(validFormations.map(item => item.formation));
          }
        } catch (error) {
          console.error('Erreur lors du chargement des formations:', error);
        } finally {
          setLoading(prev => ({ ...prev, formations: false }));
        }
      };
      
      await loadUserFormations();
      
      // Afficher un message de succès
      showNotification(
        'Formation acquise', 
        `La formation "${formation.title}" a été ajoutée à votre compte. Elle est maintenant disponible dans "Mes formations".`,
        'success'
      );
    } catch (error) {
      console.error("Erreur lors de l'acquisition de la formation gratuite:", error);
      showNotification(
        'Erreur', 
        "Une erreur s'est produite lors de l'acquisition de la formation. Veuillez réessayer.",
        'error'
      );
    }
  };

  // Ajouter la fonction handleBuyFormation pour gérer l'achat des formations payantes
  const handleBuyFormation = async (formation: any) => {
    if (!currentUser) return;
    
    try {
      // Vérifier si la fonction createFormationPurchase existe
      const confirmed = await confirmDialog(
        `Souhaitez-vous acheter la formation "${formation.title}" pour ${formation.price} € ?`
      );
      
      if (!confirmed) return;
      
      // Créer la transaction d'achat
      const transaction = await createFormationPurchase(currentUser.uid, formation.id, formation.price);
      
      if (transaction) {
        if (transaction.status === TransactionStatus.WAITING) {
          // Afficher les instructions de paiement
          showNotification(
            'Paiement en attente',
            "Votre achat est en attente de paiement. Veuillez compléter la transaction dans la section 'Portefeuille'.",
            'info'
          );
          
          // Ouvrir la section du portefeuille
          setIsWalletOpen(true);
        } else if (transaction.status === TransactionStatus.CONFIRMED) {
          // Afficher un message de succès
          showNotification(
            'Formation acquise',
            `Votre achat de la formation "${formation.title}" a été complété avec succès !`,
            'success'
          );
        }
      }
    } catch (error: any) {
      console.error("Erreur lors de l'achat de la formation:", error);
      
      // Afficher un message d'erreur avec plus de détails
      showNotification(
        'Erreur',
        `Une erreur s'est produite: ${error.message || "Impossible de traiter l'achat. Veuillez réessayer."}`,
        'error'
      );
    }
  };

  // Modifier le code qui utilise window.confirm et alert dans l'interface du catalogue de formations
  const handleFormationAction = async (formation: any) => {
    // Si la formation a un prix supérieur à 0, gérer l'achat
    if (formation.price && formation.price > 0) {
      handleBuyFormation(formation);
    } else {
      // Pour les formations gratuites, demander confirmation avant de l'obtenir
      const confirmed = await confirmDialog(`Souhaitez-vous obtenir la formation "${formation.title}" gratuitement ?`);
      
      if (confirmed) {
        handleGetFreeFormation(formation);
      }
    }
    
    // Fermer le catalogue après l'action, peu importe le résultat
    setIsCatalogOpen(false);
  };

  return (
    <>
      {/* Supprimer les modaux qui sont maintenant gérés par le NotificationProvider */}
      
      <div className="min-h-screen bg-gray-900 text-white">
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
        
        {/* ... existing code ... */}
      </div>
      
      {/* Portefeuille Modal */}
      {isWalletOpen && (
        <WalletComponent onClose={() => setIsWalletOpen(false)} />
      )}
    </>
  );
};

export default Dashboard; 