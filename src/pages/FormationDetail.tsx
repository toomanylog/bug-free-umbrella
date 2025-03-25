import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronDown, ChevronUp, Check, Award, Wrench } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getFormationById } from '../firebase/formations';
import { updateFormationProgress, Formation } from '../firebase/auth';
import { getAllTools } from '../firebase/tools';
import ReactMarkdown from 'react-markdown';

const FormationDetail: React.FC = () => {
  const { formationId } = useParams<{ formationId: string }>();
  const { userData } = useAuth();
  const navigate = useNavigate();
  const [formation, setFormation] = useState<Formation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [completedModules, setCompletedModules] = useState<Set<string>>(new Set());
  const [relatedTools, setRelatedTools] = useState<any[]>([]);
  const [formationCompleted, setFormationCompleted] = useState(false);
  const [userHasCertification, setUserHasCertification] = useState(false);

  // Charger les détails de la formation
  useEffect(() => {
    const loadFormation = async () => {
      if (!formationId) return;
      
      try {
        setLoading(true);
        const formationData = await getFormationById(formationId);
        
        if (!formationData) {
          setError("Formation non trouvée");
          setLoading(false);
          return;
        }
        
        setFormation(formationData);
        
        // Charger les modules déjà complétés par l'utilisateur
        if (userData && userData.formationsProgress) {
          const userProgress = userData.formationsProgress.find(
            progress => progress.formationId === formationId
          );
          
          if (userProgress) {
            if (userProgress.completedModules) {
              setCompletedModules(new Set(userProgress.completedModules));
            }
            
            // Vérifier si l'utilisateur a obtenu la certification pour cette formation
            if (userProgress.certificateUrl) {
              setUserHasCertification(true);
            }
          }
        }
        
      } catch (err) {
        console.error("Erreur lors du chargement de la formation:", err);
        setError("Erreur lors du chargement de la formation");
      } finally {
        setLoading(false);
      }
    };
    
    loadFormation();
  }, [formationId, userData]);

  // Charger les outils liés à cette formation
  useEffect(() => {
    const loadRelatedTools = async () => {
      if (!formationId) return;
      
      try {
        const allTools = await getAllTools();
        
        // Filtrer les outils qui ont cette formation comme condition
        const related = allTools.filter(tool => {
          if (!tool.conditions) return false;
          
          return tool.conditions.some((condition: any) => 
            condition.type === 'formation_completed' && 
            condition.value === formationId
          );
        });
        
        setRelatedTools(related);
      } catch (err) {
        console.error("Erreur lors du chargement des outils liés:", err);
      }
    };
    
    loadRelatedTools();
  }, [formationId]);

  // Vérifier si la formation est complétée
  useEffect(() => {
    if (formation && formation.modules.length > 0) {
      const isCompleted = formation.modules.every(module => completedModules.has(module.id));
      setFormationCompleted(isCompleted);
    }
  }, [formation, completedModules]);

  // Fonction pour basculer l'état d'expansion d'un module
  const toggleModuleExpand = (moduleId: string) => {
    setExpandedModules(prev => {
      const newSet = new Set(prev);
      if (newSet.has(moduleId)) {
        newSet.delete(moduleId);
      } else {
        newSet.add(moduleId);
      }
      return newSet;
    });
  };

  // Fonction pour marquer un module comme complété
  const markModuleAsCompleted = async (e: React.MouseEvent, moduleId: string) => {
    // Ne pas utiliser preventDefault car cela peut causer d'autres problèmes
    // Mais conserver la position de scroll actuelle
    const scrollPosition = window.scrollY;
    
    if (!formationId || !userData || completedModules.has(moduleId)) return;
    
    try {
      // Mettre à jour l'état local
      setCompletedModules(prev => {
        const newSet = new Set(Array.from(prev));
        newSet.add(moduleId);
        return newSet;
      });
      
      // Sauvegarder dans la base de données
      await updateFormationProgress(userData.uid, formationId, moduleId);
      
      // Restaurer la position de scroll
      setTimeout(() => {
        window.scrollTo({
          top: scrollPosition,
          behavior: "auto"
        });
      }, 10);
      
    } catch (err) {
      console.error("Erreur lors de la mise à jour de la progression:", err);
      // Annuler la mise à jour locale en cas d'erreur
      setCompletedModules(prev => {
        const newSet = new Set(Array.from(prev));
        newSet.delete(moduleId);
        return newSet;
      });
    }
  };

  // Fonction pour calculer la progression globale
  const calculateProgress = (): number => {
    if (!formation || !formation.modules.length) return 0;
    return (completedModules.size / formation.modules.length) * 100;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !formation) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
        <div className="text-red-400 text-xl mb-4">{error || "Formation non disponible"}</div>
        <button 
          onClick={() => navigate(-1)} 
          className="px-4 py-2 bg-gray-800 rounded-lg hover:bg-gray-700 flex items-center"
        >
          <ArrowLeft size={16} className="mr-2" />
          Retour
        </button>
      </div>
    );
  }

  const progress = calculateProgress();

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header avec titre et bouton retour */}
      <header className="sticky top-0 z-30 w-full bg-gray-900/70 backdrop-blur-sm border-b border-gray-800 p-4">
        <div className="container mx-auto flex items-center">
          <button 
            onClick={() => navigate(-1)} 
            className="p-2 mr-4 hover:bg-gray-800 rounded-lg"
            aria-label="Retour"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-bold truncate">{formation.title}</h1>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Bannière de la formation */}
        {formation.imageUrl && (
          <div className="w-full h-48 md:h-64 rounded-xl overflow-hidden mb-6">
            <img 
              src={formation.imageUrl} 
              alt={formation.title} 
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Informations de la formation */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">{formation.title}</h1>
          <p className="text-gray-300 whitespace-pre-wrap mb-6">{formation.description}</p>
          
          {/* Barre de progression */}
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span>Progression</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500 rounded-full" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Liste des modules */}
        <h2 className="text-xl font-bold mb-4">Modules ({formation.modules.length})</h2>
        
        <div className="space-y-4">
          {formation.modules.map((module, index) => (
            <div 
              key={module.id} 
              className="border border-gray-700 rounded-xl overflow-hidden bg-gray-800/50"
            >
              {/* En-tête du module */}
              <div 
                className={`p-4 flex justify-between items-center cursor-pointer ${
                  expandedModules.has(module.id) ? 'border-b border-gray-700' : ''
                }`}
                onClick={() => toggleModuleExpand(module.id)}
              >
                <div className="flex items-center">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 ${
                    completedModules.has(module.id) 
                      ? 'bg-green-500 text-white' 
                      : 'bg-gray-700 text-gray-400'
                  }`}>
                    {completedModules.has(module.id) ? <Check size={14} /> : (index + 1)}
                  </div>
                  <h3 className="font-medium">{module.title}</h3>
                </div>
                <div>
                  {expandedModules.has(module.id) 
                    ? <ChevronUp size={18} className="text-gray-400" />
                    : <ChevronDown size={18} className="text-gray-400" />
                  }
                </div>
              </div>
              
              {/* Contenu du module */}
              {expandedModules.has(module.id) && (
                <div className="p-4 bg-gray-800/30">
                  <div className="prose prose-invert max-w-none mb-4">
                    <ReactMarkdown>{module.content}</ReactMarkdown>
                  </div>
                  
                  {!completedModules.has(module.id) && (
                    <button
                      onClick={(e) => markModuleAsCompleted(e, module.id)}
                      className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center"
                    >
                      <Check size={16} className="mr-2" />
                      Marquer comme terminé
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Afficher boutons si la formation est terminée */}
        {formationCompleted && (
          <div className="mt-8 p-6 bg-green-900/20 border border-green-700/50 rounded-xl">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center mr-3">
                <Check size={24} className="text-white" />
              </div>
              <h3 className="text-xl font-semibold text-green-400">Formation terminée !</h3>
            </div>
            
            <p className="text-gray-300 mb-6">Félicitations, vous avez terminé cette formation. Vous pouvez maintenant explorer les ressources liées.</p>
            
            <div className="flex flex-wrap gap-4">
              {formation.certificationId && !userHasCertification && (
                <button
                  onClick={() => navigate(`/certification/${formation.certificationId}`)}
                  className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-lg flex items-center"
                >
                  <Award size={20} className="mr-2" />
                  Passer la certification
                </button>
              )}
              
              {formation.certificationId && userHasCertification && (
                <button
                  onClick={() => navigate(`/certification/${formation.certificationId}`)}
                  className="px-5 py-3 bg-green-600 hover:bg-green-700 rounded-lg flex items-center"
                >
                  <Award size={20} className="mr-2" />
                  Voir ma certification
                </button>
              )}
              
              {relatedTools.length > 0 && (
                <button
                  onClick={() => navigate('/dashboard', { state: { activeSection: 'tools' } })}
                  className="px-5 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center"
                >
                  <Wrench size={20} className="mr-2" />
                  Accéder aux outils liés
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FormationDetail; 