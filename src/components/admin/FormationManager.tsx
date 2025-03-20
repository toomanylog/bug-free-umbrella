import React, { useState, useEffect } from 'react';
import { 
  getAllFormations, 
  createFormation, 
  updateFormation, 
  deleteFormation, 
  Formation
} from '../../firebase/formations';
import { Plus, Edit, Trash2, Eye, X, Check } from 'lucide-react';

const EMPTY_FORMATION: Formation = {
  id: '',
  title: '',
  description: '',
  imageUrl: '',
  published: false,
  modules: [],
  createdAt: Date.now(),
  updatedAt: Date.now()
};

const FormationManager: React.FC = () => {
  const [formations, setFormations] = useState<Formation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [currentFormation, setCurrentFormation] = useState<Formation>({...EMPTY_FORMATION});
  const [feedback, setFeedback] = useState<{message: string, isError: boolean} | null>(null);

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
        await updateFormation(currentFormation);
        setFormations(prev => 
          prev.map(f => f.id === currentFormation.id ? currentFormation : f)
        );
        showFeedback("Formation mise à jour avec succès");
      } else {
        // Création
        const newFormation = await createFormation({
          ...currentFormation,
          createdAt: Date.now(),
          updatedAt: Date.now()
        });
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
          
          <button
            className="px-3 py-2 bg-green-600 hover:bg-green-700 rounded-lg flex items-center"
            onClick={() => {
              setCurrentFormation({...EMPTY_FORMATION});
              setIsEditing(false);
            }}
          >
            <Plus size={18} className="mr-1" />
            Nouvelle formation
          </button>
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
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          className="p-1 hover:text-red-400 transition-colors"
                          onClick={() => handleDelete(formation.id)}
                        >
                          <Trash2 size={16} />
                        </button>
                        <button 
                          className="p-1 hover:text-green-400 transition-colors"
                        >
                          <Eye size={16} />
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