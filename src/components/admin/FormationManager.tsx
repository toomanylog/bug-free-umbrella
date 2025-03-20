import React, { useState, useEffect } from 'react';
import { Formation, UserData } from '../../firebase/auth';
import { 
  getAllFormations, 
  createFormation, 
  updateFormation, 
  deleteFormation
} from '../../firebase/formations';
import { Edit, Trash2, Eye, X, Check, Plus, Users } from 'lucide-react';
import { createPortal } from 'react-dom';
import { getAllUsers, assignFormationToUser } from '../../firebase/auth';

// Déclaration de module pour uuid
declare module 'uuid' {
  export function v4(): string;
}

import { v4 as uuidv4 } from 'uuid';

const EMPTY_FORMATION: Omit<Formation, 'id'> = {
  title: '',
  description: '',
  imageUrl: '',
  published: false,
  modules: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

const EMPTY_MODULE = {
  id: '',
  title: '',
  content: '',
  order: 0
};

const FormationManager: React.FC = () => {
  const [formations, setFormations] = useState<Formation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [currentFormation, setCurrentFormation] = useState<Omit<Formation, 'id'> & { id?: string }>({...EMPTY_FORMATION});
  const [feedback, setFeedback] = useState<{message: string, isError: boolean} | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(false);
  const [previewFormation, setPreviewFormation] = useState<Formation | null>(null);
  const [isAssignOpen, setIsAssignOpen] = useState<boolean>(false);
  const [selectedFormation, setSelectedFormation] = useState<Formation | null>(null);
  const [users, setUsers] = useState<UserData[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [currentModule, setCurrentModule] = useState({...EMPTY_MODULE});
  const [editingModuleIndex, setEditingModuleIndex] = useState<number | null>(null);

  // Charger toutes les formations
  useEffect(() => {
    const loadFormations = async () => {
      try {
        setLoading(true);
        const formationsData = await getAllFormations();
        setFormations(formationsData);
        setError(null);
      } catch (err) {
        setError("Erreur lors du chargement des formations");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadFormations();
  }, []);

  // Charger les utilisateurs quand la fenêtre d'assignation est ouverte
  useEffect(() => {
    if (isAssignOpen) {
      const loadUsers = async () => {
        try {
          const userData = await getAllUsers();
          setUsers(userData);
        } catch (err) {
          console.error("Erreur lors du chargement des utilisateurs:", err);
          showFeedback("Erreur lors du chargement des utilisateurs", true);
        }
      };
      
      loadUsers();
    }
  }, [isAssignOpen]);

  const showFeedback = (message: string, isError: boolean = false) => {
    setFeedback({ message, isError });
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleCreateOrUpdate = async () => {
    try {
      // Validation basique
      if (!currentFormation.title.trim()) {
        return showFeedback("Le titre est requis", true);
      }

      if (currentFormation.id) {
        // Mise à jour
        await updateFormation(currentFormation.id, currentFormation);
        setFormations(prev => 
          prev.map(f => f.id === currentFormation.id ? {...currentFormation, id: currentFormation.id} as Formation : f)
        );
        showFeedback("Formation mise à jour avec succès");
      } else {
        // Création
        const formationId = await createFormation({
          ...currentFormation,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
        
        const newFormation: Formation = {
          ...currentFormation,
          id: formationId
        };
        
        setFormations(prev => [...prev, newFormation]);
        showFeedback("Formation créée avec succès");
      }
      
      resetForm();
    } catch (err) {
      showFeedback("Erreur lors de l'enregistrement", true);
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette formation ?")) {
      return;
    }
    
    try {
      await deleteFormation(id);
      setFormations(formations.filter(f => f.id !== id));
      showFeedback("Formation supprimée avec succès");
    } catch (err) {
      showFeedback("Erreur lors de la suppression", true);
      console.error(err);
    }
  };

  const editFormation = (formation: Formation) => {
    setCurrentFormation({...formation});
    setIsEditing(true);
  };

  const resetForm = () => {
    setCurrentFormation({...EMPTY_FORMATION});
    setIsEditing(false);
  };

  const handlePreview = (formation: Formation) => {
    console.log("Preview formation:", formation);
    setPreviewFormation(formation);
    setIsPreviewOpen(true);
  };

  const closePreview = () => {
    setIsPreviewOpen(false);
    setPreviewFormation(null);
  };

  const openAssignModal = (formation: Formation) => {
    setSelectedFormation(formation);
    setSelectedUsers([]);
    setIsAssignOpen(true);
  };

  const closeAssignModal = () => {
    setIsAssignOpen(false);
    setSelectedFormation(null);
    setSelectedUsers([]);
  };

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId) 
        : [...prev, userId]
    );
  };

  const handleAssignFormation = async () => {
    if (!selectedFormation || selectedUsers.length === 0) {
      return showFeedback("Veuillez sélectionner au moins un utilisateur", true);
    }

    try {
      // Pour chaque utilisateur sélectionné, assigner la formation
      for (const userId of selectedUsers) {
        await assignFormationToUser(userId, selectedFormation.id);
      }
      
      showFeedback(`Formation assignée à ${selectedUsers.length} utilisateur(s)`, false);
      closeAssignModal();
    } catch (err) {
      console.error("Erreur lors de l'assignation de la formation:", err);
      showFeedback("Erreur lors de l'assignation de la formation", true);
    }
  };

  const addModule = () => {
    if (!currentModule.title.trim()) {
      return showFeedback("Le titre du module est requis", true);
    }

    const newModule = {
      ...currentModule,
      id: currentModule.id || uuidv4(),
      order: currentFormation.modules.length
    };

    const updatedModules = editingModuleIndex !== null
      ? currentFormation.modules.map((mod, idx) => idx === editingModuleIndex ? newModule : mod)
      : [...currentFormation.modules, newModule];

    setCurrentFormation(prev => ({
      ...prev,
      modules: updatedModules
    }));

    setCurrentModule({...EMPTY_MODULE});
    setEditingModuleIndex(null);
  };

  const editModule = (index: number) => {
    setCurrentModule({...currentFormation.modules[index]});
    setEditingModuleIndex(index);
  };

  const removeModule = (index: number) => {
    const updatedModules = currentFormation.modules.filter((_, idx) => idx !== index)
      .map((mod, idx) => ({...mod, order: idx}));
    
    setCurrentFormation(prev => ({
      ...prev,
      modules: updatedModules
    }));
  };

  const moveModule = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === currentFormation.modules.length - 1)
    ) {
      return;
    }

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    const updatedModules = [...currentFormation.modules];
    const temp = updatedModules[index];
    updatedModules[index] = updatedModules[newIndex];
    updatedModules[newIndex] = temp;

    // Update order
    updatedModules.forEach((mod, idx) => {
      mod.order = idx;
    });

    setCurrentFormation(prev => ({
      ...prev,
      modules: updatedModules
    }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Feedback */}
      {feedback && (
        <div className={`p-4 mb-4 rounded-lg ${feedback.isError ? 'bg-red-900/50 text-red-200' : 'bg-green-900/50 text-green-200'}`}>
          {feedback.message}
        </div>
      )}
      
      {/* Aperçu de la formation */}
      {isPreviewOpen && previewFormation && createPortal(
        <div className="fixed inset-0 bg-gray-900/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 w-full max-w-3xl rounded-xl shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="p-6 text-white">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">{previewFormation.title}</h2>
                <button 
                  onClick={closePreview}
                  className="p-2 hover:bg-gray-700 rounded-full"
                >
                  <X size={24} />
                </button>
              </div>
              
              {previewFormation.imageUrl && (
                <div className="mb-6">
                  <img 
                    src={previewFormation.imageUrl} 
                    alt={previewFormation.title} 
                    className="w-full h-64 object-cover rounded-lg"
                  />
                </div>
              )}
              
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2 text-white">Description</h3>
                <p className="text-gray-300 whitespace-pre-wrap">{previewFormation.description}</p>
              </div>
              
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2 text-white">Modules ({previewFormation.modules?.length || 0})</h3>
                {previewFormation.modules?.length > 0 ? (
                  <ul className="space-y-2">
                    {previewFormation.modules.map((module, index) => (
                      <li key={module.id} className="border border-gray-700 p-3 rounded-lg">
                        <div className="font-medium text-white">{module.title}</div>
                        {module.content && (
                          <div className="mt-2 text-sm text-gray-300">
                            {module.content.length > 100 
                              ? `${module.content.substring(0, 100)}...` 
                              : module.content}
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-400">Aucun module n'a encore été ajouté à cette formation.</p>
                )}
              </div>
              
              <div className="flex justify-end">
                <button 
                  onClick={closePreview}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Modal d'assignation de formation */}
      {isAssignOpen && selectedFormation && createPortal(
        <div className="fixed inset-0 bg-gray-900/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 w-full max-w-3xl rounded-xl shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="p-6 text-white">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Assigner la formation</h2>
                <button 
                  onClick={closeAssignModal}
                  className="p-2 hover:bg-gray-700 rounded-full"
                >
                  <X size={24} />
                </button>
              </div>
              
              <div className="mb-4">
                <h3 className="text-lg font-medium mb-2">Formation: {selectedFormation.title}</h3>
                <p className="text-gray-400 mb-4">Sélectionnez les utilisateurs auxquels vous souhaitez assigner cette formation.</p>
                
                {users.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    Chargement des utilisateurs...
                  </div>
                ) : (
                  <div className="space-y-2 max-h-80 overflow-y-auto p-2">
                    {users.map(user => (
                      <div 
                        key={user.uid} 
                        className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${
                          selectedUsers.includes(user.uid) 
                            ? 'bg-blue-900/30 border border-blue-600' 
                            : 'hover:bg-gray-700 border border-gray-700'
                        }`}
                        onClick={() => toggleUserSelection(user.uid)}
                      >
                        <div className="h-10 w-10 rounded-full bg-gray-700 flex items-center justify-center mr-3">
                          {user.displayName?.charAt(0) || user.email?.charAt(0) || '?'}
                        </div>
                        <div>
                          <div className="font-medium">{user.displayName || 'Utilisateur'}</div>
                          <div className="text-sm text-gray-400">{user.email}</div>
                        </div>
                        <div className="ml-auto">
                          {selectedUsers.includes(user.uid) && <Check size={18} className="text-blue-400" />}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="flex justify-end space-x-2 mt-4">
                <button 
                  onClick={closeAssignModal}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg"
                >
                  Annuler
                </button>
                <button 
                  onClick={handleAssignFormation}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center"
                  disabled={selectedUsers.length === 0}
                >
                  <Check size={18} className="mr-1" />
                  Assigner ({selectedUsers.length})
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
      
      {/* Formulaire de création/édition */}
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg mb-8">
        <h2 className="text-xl font-semibold mb-4">
          {isEditing ? 'Modifier la formation' : 'Ajouter une formation'}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Titre</label>
            <input
              type="text"
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={currentFormation.title}
              onChange={e => setCurrentFormation({...currentFormation, title: e.target.value})}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Image URL</label>
            <input
              type="text"
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={currentFormation.imageUrl}
              onChange={e => setCurrentFormation({...currentFormation, imageUrl: e.target.value})}
            />
          </div>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-400 mb-1">Description</label>
          <textarea
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
            value={currentFormation.description}
            onChange={e => setCurrentFormation({...currentFormation, description: e.target.value})}
          ></textarea>
        </div>
        
        <div className="flex items-center mb-4">
          <input
            type="checkbox"
            id="published"
            className="mr-2 h-4 w-4"
            checked={currentFormation.published}
            onChange={e => setCurrentFormation({...currentFormation, published: e.target.checked})}
          />
          <label htmlFor="published" className="text-sm font-medium text-gray-400">Publier cette formation</label>
        </div>

        {/* Section des modules */}
        <div className="mb-6 border-t border-gray-700 pt-4 mt-4">
          <h3 className="text-lg font-medium mb-3">Modules</h3>
          
          {/* Liste des modules existants */}
          {currentFormation.modules.length > 0 && (
            <div className="mb-4 space-y-2">
              {currentFormation.modules.map((module, index) => (
                <div key={module.id} className="flex items-center bg-gray-700/50 p-3 rounded-lg">
                  <div className="font-medium flex-1">{module.title}</div>
                  <div className="flex space-x-1">
                    {index > 0 && (
                      <button
                        className="p-1 hover:text-blue-400"
                        onClick={() => moveModule(index, 'up')}
                        title="Déplacer vers le haut"
                      >
                        ↑
                      </button>
                    )}
                    {index < currentFormation.modules.length - 1 && (
                      <button
                        className="p-1 hover:text-blue-400"
                        onClick={() => moveModule(index, 'down')}
                        title="Déplacer vers le bas"
                      >
                        ↓
                      </button>
                    )}
                    <button
                      className="p-1 hover:text-blue-400"
                      onClick={() => editModule(index)}
                      title="Modifier"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      className="p-1 hover:text-red-400"
                      onClick={() => removeModule(index)}
                      title="Supprimer"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Formulaire d'ajout/édition de module */}
          <div className="bg-gray-700/30 p-4 rounded-lg">
            <h4 className="font-medium mb-2 text-sm text-gray-300">
              {editingModuleIndex !== null ? 'Modifier le module' : 'Ajouter un module'}
            </h4>
            
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-400 mb-1">Titre du module</label>
              <input
                type="text"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={currentModule.title}
                onChange={e => setCurrentModule({...currentModule, title: e.target.value})}
              />
            </div>
            
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-400 mb-1">Contenu</label>
              <textarea
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                value={currentModule.content}
                onChange={e => setCurrentModule({...currentModule, content: e.target.value})}
              ></textarea>
            </div>
            
            <div className="flex justify-end">
              {editingModuleIndex !== null && (
                <button
                  className="px-3 py-1.5 mr-2 bg-gray-600 hover:bg-gray-500 rounded-lg text-sm"
                  onClick={() => {
                    setCurrentModule({...EMPTY_MODULE});
                    setEditingModuleIndex(null);
                  }}
                >
                  Annuler
                </button>
              )}
              <button
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm flex items-center"
                onClick={addModule}
              >
                {editingModuleIndex !== null ? 'Mettre à jour' : 'Ajouter'}
              </button>
            </div>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <button
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center"
            onClick={handleCreateOrUpdate}
          >
            <Check size={18} className="mr-1" />
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
      
      {/* Liste des formations */}
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Formations ({formations.length})</h2>
        </div>
        
        {error && (
          <div className="p-4 mb-4 rounded-lg bg-red-900/50 text-red-200">
            {error}
          </div>
        )}
        
        {formations.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            Aucune formation n'a été créée pour le moment
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="px-4 py-3 text-left">Titre</th>
                  <th className="px-4 py-3 text-left">Statut</th>
                  <th className="px-4 py-3 text-left">Modules</th>
                  <th className="px-4 py-3 text-left">Date de création</th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {formations.map(formation => (
                  <tr key={formation.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                    <td className="px-4 py-3">
                      {formation.title}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                        formation.published ? 'bg-green-900/50 text-green-200' : 'bg-yellow-900/50 text-yellow-200'
                      }`}>
                        {formation.published ? 'Publié' : 'Brouillon'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {formation.modules?.length || 0}
                    </td>
                    <td className="px-4 py-3">
                      {new Date(formation.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex space-x-2">
                        <button 
                          className="p-1 hover:text-blue-400 transition-colors"
                          onClick={() => editFormation(formation)}
                          title="Modifier"
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          className="p-1 hover:text-red-400 transition-colors"
                          onClick={() => handleDelete(formation.id)}
                          title="Supprimer"
                        >
                          <Trash2 size={16} />
                        </button>
                        <button 
                          className="p-1 hover:text-green-400 transition-colors"
                          onClick={() => handlePreview(formation)}
                          title="Prévisualiser"
                        >
                          <Eye size={16} />
                        </button>
                        <button 
                          className="p-1 hover:text-purple-400 transition-colors"
                          onClick={() => openAssignModal(formation)}
                          title="Assigner aux utilisateurs"
                        >
                          <Users size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default FormationManager; 