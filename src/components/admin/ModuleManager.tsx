import React, { useState, useEffect } from 'react';
import { Formation, Module } from '../../firebase/auth';
import { 
  getFormationById,
  addModuleToFormation,
  updateModule,
  deleteModule
} from '../../firebase/formations';
import { ArrowLeft, PlusCircle, Save, Trash2, ChevronUp, ChevronDown, X } from 'lucide-react';

interface ModuleManagerProps {
  formationId: string;
  onBack: () => void;
}

const EMPTY_MODULE: Omit<Module, 'id'> = {
  title: '',
  content: '',
  order: 0
};

const ModuleManager: React.FC<ModuleManagerProps> = ({ formationId, onBack }) => {
  const [formation, setFormation] = useState<Formation | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [currentModule, setCurrentModule] = useState<Omit<Module, 'id'> & { id?: string }>(EMPTY_MODULE);
  const [feedback, setFeedback] = useState<{message: string, isError: boolean} | null>(null);

  // Charger la formation
  useEffect(() => {
    const loadFormation = async () => {
      try {
        setLoading(true);
        const formationData = await getFormationById(formationId);
        
        if (!formationData) {
          setError("Formation non trouvée");
          return;
        }
        
        // Trier les modules par ordre
        if (formationData.modules) {
          formationData.modules.sort((a, b) => a.order - b.order);
        }
        
        setFormation(formationData);
        setError(null);
      } catch (err) {
        setError("Erreur lors du chargement de la formation");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadFormation();
  }, [formationId]);

  const showFeedback = (message: string, isError: boolean = false) => {
    setFeedback({ message, isError });
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleCreateOrUpdate = async () => {
    try {
      // Validation basique
      if (!currentModule.title.trim()) {
        return showFeedback("Le titre est requis", true);
      }

      if ('id' in currentModule && currentModule.id) {
        // Mise à jour
        await updateModule(formationId, currentModule.id, {
          title: currentModule.title,
          content: currentModule.content,
          order: currentModule.order
        });
        
        if (formation) {
          const updatedModules = formation.modules.map((m: Module) => 
            m.id === currentModule.id ? {...currentModule, id: currentModule.id} as Module : m
          );
          setFormation({...formation, modules: updatedModules});
        }
        
        showFeedback("Module mis à jour avec succès");
      } else {
        // Création
        const moduleToAdd = {
          ...currentModule,
          order: formation?.modules?.length || 0
        };
        
        const moduleId = await addModuleToFormation(formationId, moduleToAdd);
        const newModule: Module = {
          ...moduleToAdd,
          id: moduleId
        };
        
        if (formation) {
          setFormation({
            ...formation, 
            modules: [...(formation.modules || []), newModule]
          });
        }
        
        showFeedback("Module créé avec succès");
      }
      
      resetForm();
    } catch (err) {
      showFeedback("Erreur lors de l'enregistrement", true);
      console.error(err);
    }
  };

  const handleDelete = async (moduleId: string) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce module ?")) {
      return;
    }
    
    try {
      await deleteModule(formationId, moduleId);
      
      if (formation) {
        const updatedModules = formation.modules.filter(m => m.id !== moduleId);
        setFormation({...formation, modules: updatedModules});
      }
      
      showFeedback("Module supprimé avec succès");
    } catch (err) {
      showFeedback("Erreur lors de la suppression", true);
      console.error(err);
    }
  };

  const editModule = (module: Module) => {
    setCurrentModule({...module});
    setIsEditing(true);
  };

  const resetForm = () => {
    setCurrentModule({...EMPTY_MODULE});
    setIsEditing(false);
  };

  const moveModule = async (moduleId: string, direction: 'up' | 'down') => {
    if (!formation || !formation.modules) return;
    
    const moduleIndex = formation.modules.findIndex((m: Module) => m.id === moduleId);
    if (moduleIndex === -1) return;
    
    const newIndex = direction === 'up' ? moduleIndex - 1 : moduleIndex + 1;
    
    // Vérifier que le nouvel index est valide
    if (newIndex < 0 || newIndex >= formation.modules.length) return;
    
    const updatedModules = [...formation.modules];
    
    // Échanger les ordres
    const tempOrder = updatedModules[moduleIndex].order;
    updatedModules[moduleIndex].order = updatedModules[newIndex].order;
    updatedModules[newIndex].order = tempOrder;
    
    // Échanger les positions dans le tableau
    [updatedModules[moduleIndex], updatedModules[newIndex]] = 
      [updatedModules[newIndex], updatedModules[moduleIndex]];
    
    // Mettre à jour localement
    setFormation({...formation, modules: updatedModules});
    
    // Mettre à jour la base de données
    try {
      await updateModule(formationId, updatedModules[moduleIndex].id, {
        order: updatedModules[moduleIndex].order
      });
      
      await updateModule(formationId, updatedModules[newIndex].id, {
        order: updatedModules[newIndex].order
      });
    } catch (err) {
      console.error("Erreur lors du déplacement du module", err);
      showFeedback("Erreur lors du déplacement du module", true);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !formation) {
    return (
      <div className="bg-red-900/50 text-red-200 p-4 rounded-lg">
        {error || "Une erreur inattendue s'est produite"}
        <button 
          className="mt-4 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center"
          onClick={onBack}
        >
          <ArrowLeft size={18} className="mr-2" />
          Retour aux formations
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Header avec navigation */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button 
            className="p-2 mr-4 bg-gray-700 hover:bg-gray-600 rounded-lg"
            onClick={onBack}
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-2xl font-bold">{formation.title}</h2>
            <p className="text-gray-400">Gestion des modules</p>
          </div>
        </div>
      </div>
      
      {/* Feedback */}
      {feedback && (
        <div className={`p-4 mb-4 rounded-lg ${feedback.isError ? 'bg-red-900/50 text-red-200' : 'bg-green-900/50 text-green-200'}`}>
          {feedback.message}
        </div>
      )}
      
      {/* Formulaire d'ajout/édition de module */}
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg mb-8">
        <h3 className="text-xl font-semibold mb-4">
          {isEditing ? 'Modifier le module' : 'Ajouter un nouveau module'}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Titre</label>
            <input
              type="text"
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={currentModule.title}
              onChange={e => setCurrentModule({...currentModule, title: e.target.value})}
            />
          </div>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-400 mb-1">Contenu</label>
          <textarea
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[200px]"
            value={currentModule.content}
            onChange={e => setCurrentModule({...currentModule, content: e.target.value})}
          ></textarea>
        </div>
        
        <div className="flex space-x-2">
          <button
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center"
            onClick={handleCreateOrUpdate}
          >
            <Save size={18} className="mr-1" />
            {isEditing ? 'Mettre à jour' : 'Créer'}
          </button>
          
          {isEditing && (
            <button
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center"
              onClick={resetForm}
            >
              <X size={18} className="mr-1" />
              Annuler
            </button>
          )}
        </div>
      </div>
      
      {/* Liste des modules */}
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">Modules ({formation.modules?.length || 0})</h3>
          
          <button
            className="px-3 py-2 bg-green-600 hover:bg-green-700 rounded-lg flex items-center"
            onClick={resetForm}
          >
            <PlusCircle size={18} className="mr-1" />
            Nouveau module
          </button>
        </div>
        
        {!formation.modules || formation.modules.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            Aucun module n'a été créé pour cette formation
          </div>
        ) : (
          <div className="space-y-3">
            {formation.modules.map((module, index) => (
              <div key={module.id} className="bg-gray-700 p-4 rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold text-lg">{module.title}</h4>
                  </div>
                  
                  <div className="flex space-x-2">
                    {index > 0 && (
                      <button
                        className="p-1 hover:text-blue-400 transition-colors"
                        onClick={() => moveModule(module.id, 'up')}
                      >
                        <ChevronUp size={18} />
                      </button>
                    )}
                    
                    {index < formation.modules.length - 1 && (
                      <button
                        className="p-1 hover:text-blue-400 transition-colors"
                        onClick={() => moveModule(module.id, 'down')}
                      >
                        <ChevronDown size={18} />
                      </button>
                    )}
                    
                    <button
                      className="p-1 hover:text-blue-400 transition-colors"
                      onClick={() => editModule(module)}
                    >
                      <Save size={18} />
                    </button>
                    
                    <button
                      className="p-1 hover:text-red-400 transition-colors"
                      onClick={() => handleDelete(module.id)}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
                
                {module.content && (
                  <div className="mt-3 text-gray-300">
                    <div className="bg-gray-800 p-3 rounded-lg text-sm max-h-32 overflow-y-auto">
                      {module.content.length > 200 
                        ? `${module.content.substring(0, 200)}...` 
                        : module.content}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ModuleManager; 