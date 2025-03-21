import { 
  Home,
  Users,
  Settings,
  Wrench,
  Award,
  Package,
  BookOpen,
  HelpCircle,
  FileText,
  Database
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface SideBarProps {
  activeSection: string;
  onSectionSelect: (section: string) => void;
}

const SideBar: React.FC<SideBarProps> = ({ activeSection, onSectionSelect }) => {
  const { isAdmin } = useAuth();
  
  return (
    <div className="h-full w-64 bg-gray-800 text-white p-4">
      <div className="mb-6">
        <h1 className="text-xl font-bold">Administration</h1>
      </div>
      
      <div className="space-y-1">
        {/* Sections de navigation */}
        <button
          className={`w-full text-left py-2 px-4 rounded ${activeSection === 'dashboard' ? 'bg-blue-600' : 'hover:bg-gray-700'}`}
          onClick={() => onSectionSelect('dashboard')}
        >
          <div className="flex items-center">
            <Home size={18} className="mr-3" />
            <span>Tableau de bord</span>
          </div>
        </button>
        
        {/* Autres options de navigation */}
        <button
          className={`w-full text-left py-2 px-4 rounded ${activeSection === 'tools' ? 'bg-blue-600' : 'hover:bg-gray-700'}`}
          onClick={() => onSectionSelect('tools')}
        >
          <div className="flex items-center">
            <Wrench size={18} className="mr-3" />
            <span>Outils</span>
          </div>
        </button>
        
        <button
          className={`w-full text-left py-2 px-4 rounded ${activeSection === 'certifications' ? 'bg-blue-600' : 'hover:bg-gray-700'}`}
          onClick={() => onSectionSelect('certifications')}
        >
          <div className="flex items-center">
            <Award size={18} className="mr-3" />
            <span>Certifications</span>
          </div>
        </button>
        
        <button
          className={`w-full text-left py-2 px-4 rounded ${activeSection === 'formations' ? 'bg-blue-600' : 'hover:bg-gray-700'}`}
          onClick={() => onSectionSelect('formations')}
        >
          <div className="flex items-center">
            <BookOpen size={18} className="mr-3" />
            <span>Formations</span>
          </div>
        </button>
        
        <button
          className={`w-full text-left py-2 px-4 rounded ${activeSection === 'media' ? 'bg-blue-600' : 'hover:bg-gray-700'}`}
          onClick={() => onSectionSelect('media')}
        >
          <div className="flex items-center">
            <Database size={18} className="mr-3" />
            <span>Médias</span>
          </div>
        </button>
        
        {/* Autres options de navigation */}
        {isAdmin && (
          <button
            className={`w-full text-left py-2 px-4 rounded ${activeSection === 'users' ? 'bg-blue-600' : 'hover:bg-gray-700'}`}
            onClick={() => onSectionSelect('users')}
          >
            <div className="flex items-center">
              <Users size={18} className="mr-3" />
              <span>Utilisateurs</span>
            </div>
          </button>
        )}
      </div>
    </div>
  );
};

export default SideBar; 