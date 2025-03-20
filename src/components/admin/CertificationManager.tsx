import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  Edit, 
  Trash2, 
  Eye, 
  X, 
  Check, 
  Plus, 
  Award, 
  FileText
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import ReactMarkdown from 'react-markdown';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

const EMPTY_CERTIFICATION: Omit<Certification, 'id'> = {
  title: '',
  description: '',
  imageUrl: '',
  published: false,
  requirements: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

const EMPTY_REQUIREMENT: CertificationRequirement = {
  type: RequirementType.COMPLETE_FORMATIONS,
  description: '',
  formationIds: []
};

const EMPTY_QUESTION: Omit<ExamQuestion, 'id'> = {
  question: '',
  type: QuestionType.MULTIPLE_CHOICE,
  options: [''],
  correctAnswer: ''
};

const CertificationManager: React.FC = () => {
  // États pour la gestion des certifications
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [currentCertification, setCurrentCertification] = useState<Omit<Certification, 'id'> & { id?: string }>({...EMPTY_CERTIFICATION});
  const [feedback, setFeedback] = useState<{message: string, isError: boolean} | null>(null);
  
  // États pour la prévisualisation et les exigences
  const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(false);
  const [previewCertification, setPreviewCertification] = useState<Certification | null>(null);
  const [currentRequirement, setCurrentRequirement] = useState<CertificationRequirement>({...EMPTY_REQUIREMENT});
  const [editingRequirementIndex, setEditingRequirementIndex] = useState<number | null>(null);
  
  // États pour les questions d'examen
  const [currentQuestion, setCurrentQuestion] = useState({...EMPTY_QUESTION});
  const [editingQuestionIndex, setEditingQuestionIndex] = useState<number | null>(null);
  
  // États pour les formations et utilisateurs disponibles
  const [formations, setFormations] = useState<Formation[]>([]);
  
  // Charger les certifications
  useEffect(() => {
    const loadCertifications = async () => {
      try {
        setLoading(true);
        const data = await getAllCertifications();
        setCertifications(data);
        setError(null);
      } catch (err: any) {
        console.error('Erreur lors du chargement des certifications', err);
        setError(err.message || 'Une erreur est survenue lors du chargement des certifications');
      } finally {
        setLoading(false);
      }
    };
    
    loadCertifications();
  }, []);
  
  // Charger les formations pour les exigences
  useEffect(() => {
    const loadFormations = async () => {
      try {
        const data = await getAllFormations();
        setFormations(data);
      } catch (err) {
        console.error('Erreur lors du chargement des formations', err);
      }
    };
    
    loadFormations();
  }, []);

  // Gestionnaires d'événements pour les certifications
  const handleCreateCertification = async () => {
    try {
      setLoading(true);
      
      // Créer ou mettre à jour la certification
      if (currentCertification.id) {
        // Mise à jour
        await updateCertification(currentCertification.id, currentCertification);
        
        // Mettre à jour la liste locale
        setCertifications(prev => 
          prev.map(cert => 
            cert.id === currentCertification.id 
              ? { ...currentCertification as Certification, id: currentCertification.id } 
              : cert
          )
        );
        
        setFeedback({ message: 'Certification mise à jour avec succès', isError: false });
      } else {
        // Création
        const newId = await createCertification(currentCertification);
        
        // Ajouter à la liste locale
        setCertifications(prev => [...prev, { ...currentCertification, id: newId }]);
        
        setFeedback({ message: 'Certification créée avec succès', isError: false });
      }
      
      // Réinitialiser le formulaire
      setCurrentCertification({...EMPTY_CERTIFICATION});
      setIsEditing(false);
    } catch (err: any) {
      console.error('Erreur lors de la création/mise à jour de la certification', err);
      setFeedback({ message: err.message || 'Une erreur est survenue', isError: true });
    } finally {
      setLoading(false);
    }
  };
  
  const handleEditCertification = (certification: Certification) => {
    setCurrentCertification({...certification});
    setIsEditing(true);
  };
  
  const handleDeleteCertification = async (id: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette certification ?')) {
      return;
    }
    
    try {
      setLoading(true);
      await deleteCertification(id);
      
      // Mettre à jour la liste locale
      setCertifications(prev => prev.filter(cert => cert.id !== id));
      
      setFeedback({ message: 'Certification supprimée avec succès', isError: false });
    } catch (err: any) {
      console.error('Erreur lors de la suppression de la certification', err);
      setFeedback({ message: err.message || 'Une erreur est survenue', isError: true });
    } finally {
      setLoading(false);
    }
  };
  
  const handlePreviewCertification = (certification: Certification) => {
    setPreviewCertification(certification);
    setIsPreviewOpen(true);
  };

  // Gestionnaires d'événements pour les exigences
  const handleAddRequirement = () => {
    setCurrentCertification(prev => ({
      ...prev,
      requirements: [...(prev.requirements || []), {
        ...currentRequirement,
        id: uuidv4()
      }]
    }));
    
    // Réinitialiser le formulaire d'exigence
    setCurrentRequirement({...EMPTY_REQUIREMENT});
    setEditingRequirementIndex(null);
  };
  
  const handleEditRequirement = (index: number) => {
    const requirement = currentCertification.requirements[index];
    setCurrentRequirement({...requirement});
    setEditingRequirementIndex(index);
  };
  
  const handleUpdateRequirement = () => {
    if (editingRequirementIndex === null) return;
    
    setCurrentCertification(prev => {
      const updatedRequirements = [...prev.requirements];
      updatedRequirements[editingRequirementIndex] = currentRequirement;
      
      return {
        ...prev,
        requirements: updatedRequirements
      };
    });
    
    // Réinitialiser le formulaire
    setCurrentRequirement({...EMPTY_REQUIREMENT});
    setEditingRequirementIndex(null);
  };
  
  const handleDeleteRequirement = (index: number) => {
    setCurrentCertification(prev => {
      const updatedRequirements = [...prev.requirements];
      updatedRequirements.splice(index, 1);
      
      return {
        ...prev,
        requirements: updatedRequirements
      };
    });
  };
  
  // Gestionnaires d'événements pour les questions d'examen
  const handleAddQuestion = () => {
    const questionWithId = {
      ...currentQuestion,
      id: uuidv4()
    } as ExamQuestion;
    
    setCurrentCertification(prev => ({
      ...prev,
      examQuestions: [...(prev.examQuestions || []), questionWithId]
    }));
    
    // Réinitialiser le formulaire de question
    setCurrentQuestion({...EMPTY_QUESTION});
    setEditingQuestionIndex(null);
  };
  
  const handleEditQuestion = (index: number) => {
    const question = currentCertification.examQuestions?.[index];
    if (question) {
      setCurrentQuestion({...question});
      setEditingQuestionIndex(index);
    }
  };
  
  const handleUpdateQuestion = () => {
    if (editingQuestionIndex === null || !currentCertification.examQuestions) return;
    
    setCurrentCertification(prev => {
      const updatedQuestions = [...(prev.examQuestions || [])];
      updatedQuestions[editingQuestionIndex] = {
        ...currentQuestion,
        id: prev.examQuestions?.[editingQuestionIndex].id || uuidv4()
      } as ExamQuestion;
      
      return {
        ...prev,
        examQuestions: updatedQuestions
      };
    });
    
    // Réinitialiser le formulaire
    setCurrentQuestion({...EMPTY_QUESTION});
    setEditingQuestionIndex(null);
  };
  
  const handleDeleteQuestion = (index: number) => {
    setCurrentCertification(prev => {
      if (!prev.examQuestions) return prev;
      
      const updatedQuestions = [...prev.examQuestions];
      updatedQuestions.splice(index, 1);
      
      return {
        ...prev,
        examQuestions: updatedQuestions
      };
    });
  };

  // Gestion des changements de type de questions
  const handleQuestionTypeChange = (type: QuestionType) => {
    setCurrentQuestion(prev => {
      let correctAnswer = prev.correctAnswer;
      
      // Réinitialiser la réponse correcte selon le type
      if (type === QuestionType.MULTIPLE_CHOICE || type === QuestionType.TRUE_FALSE || type === QuestionType.SHORT_ANSWER) {
        correctAnswer = typeof prev.correctAnswer === 'string' ? prev.correctAnswer : '';
      } else if (type === QuestionType.MULTIPLE_ANSWER) {
        correctAnswer = Array.isArray(prev.correctAnswer) ? prev.correctAnswer : [];
      }
      
      return {
        ...prev,
        type,
        correctAnswer
      };
    });
  };

  const handleAddOption = () => {
    setCurrentQuestion(prev => ({
      ...prev,
      options: [...(prev.options || []), '']
    }));
  };
  
  const handleUpdateOption = (index: number, value: string) => {
    setCurrentQuestion(prev => {
      const updatedOptions = [...(prev.options || [])];
      updatedOptions[index] = value;
      
      return {
        ...prev,
        options: updatedOptions
      };
    });
  };
  
  const handleDeleteOption = (index: number) => {
    setCurrentQuestion(prev => {
      const updatedOptions = [...(prev.options || [])];
      updatedOptions.splice(index, 1);
      
      return {
        ...prev,
        options: updatedOptions
      };
    });
  };

  // Rendu du formulaire d'édition de certification
  const renderCertificationForm = () => (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">
          {currentCertification.id ? 'Modifier la certification' : 'Ajouter une certification'}
        </h2>
        <button 
          onClick={() => {
            setIsEditing(false);
            setCurrentCertification({...EMPTY_CERTIFICATION});
          }}
          className="text-gray-400 hover:text-white"
        >
          <X size={20} />
        </button>
      </div>
      
      <div className="space-y-4">
        {/* Informations de base */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Titre
          </label>
          <input
            type="text"
            value={currentCertification.title}
            onChange={(e) => setCurrentCertification(prev => ({...prev, title: e.target.value}))}
            className="w-full bg-gray-700 text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Titre de la certification"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Description
          </label>
          <textarea
            value={currentCertification.description}
            onChange={(e) => setCurrentCertification(prev => ({...prev, description: e.target.value}))}
            className="w-full bg-gray-700 text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
            placeholder="Description de la certification"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">
            URL de l'image
          </label>
          <input
            type="text"
            value={currentCertification.imageUrl || ''}
            onChange={(e) => setCurrentCertification(prev => ({...prev, imageUrl: e.target.value}))}
            className="w-full bg-gray-700 text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="https://example.com/image.jpg"
          />
        </div>
        
        <div className="flex items-center">
          <input
            type="checkbox"
            id="publishedCheck"
            checked={currentCertification.published}
            onChange={(e) => setCurrentCertification(prev => ({...prev, published: e.target.checked}))}
            className="h-4 w-4 bg-gray-700 border-gray-600 rounded text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="publishedCheck" className="ml-2 block text-sm text-gray-400">
            Publier cette certification
          </label>
        </div>
      </div>
      
      {/* Section pour les exigences */}
      <div className="mt-8">
        <h3 className="text-lg font-medium mb-4">Exigences pour la certification</h3>
        
        <div className="space-y-4 mb-4">
          {currentCertification.requirements.map((req, index) => (
            <div key={index} className="bg-gray-700 p-3 rounded-md flex justify-between items-center">
              <div>
                <div className="font-medium">{
                  req.type === RequirementType.COMPLETE_FORMATIONS ? 'Formations à compléter' :
                  req.type === RequirementType.PASS_EXAM ? 'Examen à réussir' :
                  req.type === RequirementType.ADMIN_APPROVAL ? 'Approbation admin' :
                  'Modules spécifiques'
                }</div>
                <div className="text-sm text-gray-400">{req.description}</div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEditRequirement(index)}
                  className="text-blue-500 hover:text-blue-400"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => handleDeleteRequirement(index)}
                  className="text-red-500 hover:text-red-400"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
        
        {/* Formulaire d'ajout/modification d'exigence */}
        <div className="bg-gray-700 p-4 rounded-md">
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Type d'exigence
              </label>
              <select
                value={currentRequirement.type}
                onChange={(e) => setCurrentRequirement(prev => ({
                  ...prev, 
                  type: e.target.value as RequirementType
                }))}
                className="w-full bg-gray-800 text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={RequirementType.COMPLETE_FORMATIONS}>Compléter des formations</option>
                <option value={RequirementType.PASS_EXAM}>Réussir l'examen</option>
                <option value={RequirementType.ADMIN_APPROVAL}>Approbation administrative</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Description
              </label>
              <input
                type="text"
                value={currentRequirement.description}
                onChange={(e) => setCurrentRequirement(prev => ({...prev, description: e.target.value}))}
                className="w-full bg-gray-800 text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Description de l'exigence"
              />
            </div>
            
            {currentRequirement.type === RequirementType.COMPLETE_FORMATIONS && (
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Formations requises
                </label>
                <select
                  multiple
                  value={currentRequirement.formationIds || []}
                  onChange={(e) => {
                    const selectedOptions = Array.from(e.target.selectedOptions).map(option => option.value);
                    setCurrentRequirement(prev => ({
                      ...prev,
                      formationIds: selectedOptions
                    }));
                  }}
                  className="w-full bg-gray-800 text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                >
                  {formations.map(formation => (
                    <option key={formation.id} value={formation.id}>
                      {formation.title}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">Maintenez Ctrl pour sélectionner plusieurs formations</p>
              </div>
            )}
            
            {currentRequirement.type === RequirementType.PASS_EXAM && (
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Score minimum (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={currentRequirement.minScore || 70}
                  onChange={(e) => setCurrentRequirement(prev => ({
                    ...prev,
                    minScore: parseInt(e.target.value) || 70
                  }))}
                  className="w-full bg-gray-800 text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
            
            <div className="flex justify-end pt-2">
              {editingRequirementIndex !== null ? (
                <button
                  onClick={handleUpdateRequirement}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
                >
                  <Check size={16} className="mr-1" />
                  Mettre à jour
                </button>
              ) : (
                <button
                  onClick={handleAddRequirement}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center"
                >
                  <Plus size={16} className="mr-1" />
                  Ajouter
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bouton de soumission du formulaire */}
      <div className="mt-8 flex justify-end">
        <button
          onClick={handleCreateCertification}
          disabled={loading}
          className={`px-4 py-2 rounded-md text-white flex items-center ${
            loading ? 'bg-gray-600 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {loading ? (
            <span className="mr-2 h-4 w-4 border-2 border-gray-300 border-t-white rounded-full animate-spin"></span>
          ) : (
            <Check size={18} className="mr-2" />
          )}
          {currentCertification.id ? 'Mettre à jour' : 'Créer la certification'}
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Feedback */}
      {feedback && (
        <div className={`p-3 rounded-md ${
          feedback.isError ? 'bg-red-900/50 text-red-200' : 'bg-green-900/50 text-green-200'
        }`}>
          {feedback.message}
        </div>
      )}
      
      {/* En-tête avec le bouton d'ajout */}
      {!isEditing && (
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Certifications disponibles</h2>
          <button
            onClick={() => {
              setCurrentCertification({...EMPTY_CERTIFICATION});
              setIsEditing(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md flex items-center"
          >
            <Plus size={18} className="mr-2" />
            Nouvelle certification
          </button>
        </div>
      )}
      
      {/* Formulaire ou liste */}
      {isEditing ? (
        renderCertificationForm()
      ) : (
        <div>
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-2"></div>
              <p className="text-gray-400">Chargement des certifications...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-400">
              <p>{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-2 text-blue-400 hover:text-blue-300 underline"
              >
                Réessayer
              </button>
            </div>
          ) : certifications.length === 0 ? (
            <div className="text-center py-12 bg-gray-800 rounded-lg">
              <Award size={48} className="mx-auto text-gray-600 mb-4" />
              <h3 className="text-lg font-medium text-gray-300 mb-1">Aucune certification</h3>
              <p className="text-gray-400 mb-4">Commencez par créer votre première certification.</p>
              <button
                onClick={() => {
                  setCurrentCertification({...EMPTY_CERTIFICATION});
                  setIsEditing(true);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md inline-flex items-center"
              >
                <Plus size={18} className="mr-2" />
                Créer une certification
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {certifications.map((certification) => (
                <div key={certification.id} className="bg-gray-800 rounded-lg overflow-hidden shadow-lg border border-gray-700">
                  {certification.imageUrl ? (
                    <div className="h-40 bg-gray-700 relative">
                      <img 
                        src={certification.imageUrl} 
                        alt={certification.title} 
                        className="w-full h-full object-cover"
                      />
                      {!certification.published && (
                        <div className="absolute top-2 right-2 bg-yellow-600 text-white text-xs px-2 py-1 rounded">
                          Non publiée
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="h-40 bg-gradient-to-br from-blue-900 to-indigo-800 flex items-center justify-center relative">
                      <Award size={64} className="text-white/50" />
                      {!certification.published && (
                        <div className="absolute top-2 right-2 bg-yellow-600 text-white text-xs px-2 py-1 rounded">
                          Non publiée
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className="p-4">
                    <h3 className="text-lg font-medium mb-2">{certification.title}</h3>
                    <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                      {certification.description}
                    </p>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      <div className="text-xs bg-blue-900/50 text-blue-200 px-2 py-1 rounded">
                        {certification.requirements.length} exigence(s)
                      </div>
                      {certification.examQuestions && certification.examQuestions.length > 0 && (
                        <div className="text-xs bg-purple-900/50 text-purple-200 px-2 py-1 rounded">
                          {certification.examQuestions.length} question(s)
                        </div>
                      )}
                    </div>
                    
                    <div className="flex justify-between">
                      <div className="space-x-1">
                        <button
                          onClick={() => handleEditCertification(certification)}
                          className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded"
                          title="Modifier"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handlePreviewCertification(certification)}
                          className="bg-gray-600 hover:bg-gray-700 text-white p-2 rounded"
                          title="Aperçu"
                        >
                          <Eye size={16} />
                        </button>
                      </div>
                      <button
                        onClick={() => handleDeleteCertification(certification.id)}
                        className="bg-red-600 hover:bg-red-700 text-white p-2 rounded"
                        title="Supprimer"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      
      {/* Section pour les questions d'examen */}
      {isEditing && (
        <div className="mt-8 bg-gray-800 p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-semibold mb-4">Questions d'examen</h3>
          
          {/* Liste des questions existantes */}
          {currentCertification.examQuestions && currentCertification.examQuestions.length > 0 ? (
            <div className="space-y-4 mb-6">
              {currentCertification.examQuestions.map((question, index) => (
                <div key={index} className="bg-gray-700 p-4 rounded-md">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium mb-1">{question.question}</h4>
                      <div className="text-sm text-gray-400">
                        Type: {
                          question.type === QuestionType.MULTIPLE_CHOICE ? 'Choix unique' :
                          question.type === QuestionType.MULTIPLE_ANSWER ? 'Choix multiples' :
                          question.type === QuestionType.TRUE_FALSE ? 'Vrai/Faux' :
                          'Réponse courte'
                        }
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditQuestion(index)}
                        className="text-blue-500 hover:text-blue-400"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteQuestion(index)}
                        className="text-red-500 hover:text-red-400"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 bg-gray-700 rounded-md mb-6">
              <FileText size={32} className="mx-auto text-gray-500 mb-2" />
              <p className="text-gray-400">Aucune question d'examen ajoutée</p>
            </div>
          )}
          
          {/* Formulaire d'ajout/modification de question */}
          <div className="bg-gray-700 p-4 rounded-md">
            <h4 className="font-medium mb-3">
              {editingQuestionIndex !== null ? 'Modifier la question' : 'Ajouter une question'}
            </h4>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Question
                </label>
                <input
                  type="text"
                  value={currentQuestion.question}
                  onChange={(e) => setCurrentQuestion(prev => ({...prev, question: e.target.value}))}
                  className="w-full bg-gray-800 text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Saisissez votre question"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Type de question
                </label>
                <select
                  value={currentQuestion.type}
                  onChange={(e) => handleQuestionTypeChange(e.target.value as QuestionType)}
                  className="w-full bg-gray-800 text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={QuestionType.MULTIPLE_CHOICE}>Choix unique</option>
                  <option value={QuestionType.MULTIPLE_ANSWER}>Choix multiples</option>
                  <option value={QuestionType.TRUE_FALSE}>Vrai/Faux</option>
                  <option value={QuestionType.SHORT_ANSWER}>Réponse courte</option>
                </select>
              </div>
              
              {/* Options pour les questions à choix */}
              {(currentQuestion.type === QuestionType.MULTIPLE_CHOICE || 
                currentQuestion.type === QuestionType.MULTIPLE_ANSWER) && (
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-sm font-medium text-gray-400">
                      Options
                    </label>
                    <button
                      onClick={handleAddOption}
                      className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded flex items-center"
                    >
                      <Plus size={12} className="mr-1" />
                      Ajouter une option
                    </button>
                  </div>
                  
                  <div className="space-y-2">
                    {currentQuestion.options && currentQuestion.options.map((option, index) => (
                      <div key={index} className="flex items-center">
                        <input
                          type={currentQuestion.type === QuestionType.MULTIPLE_CHOICE ? 'radio' : 'checkbox'}
                          id={`option-${index}`}
                          name="correctAnswer"
                          checked={
                            currentQuestion.type === QuestionType.MULTIPLE_CHOICE
                              ? currentQuestion.correctAnswer === option
                              : Array.isArray(currentQuestion.correctAnswer) && 
                                currentQuestion.correctAnswer.includes(option)
                          }
                          onChange={() => {
                            if (currentQuestion.type === QuestionType.MULTIPLE_CHOICE) {
                              setCurrentQuestion(prev => ({...prev, correctAnswer: option}));
                            } else if (currentQuestion.type === QuestionType.MULTIPLE_ANSWER) {
                              setCurrentQuestion(prev => {
                                const current = Array.isArray(prev.correctAnswer) 
                                  ? [...prev.correctAnswer] 
                                  : [];
                                
                                if (current.includes(option)) {
                                  return {
                                    ...prev,
                                    correctAnswer: current.filter(a => a !== option)
                                  };
                                } else {
                                  return {
                                    ...prev,
                                    correctAnswer: [...current, option]
                                  };
                                }
                              });
                            }
                          }}
                          className="h-4 w-4 bg-gray-700 border-gray-600 rounded text-blue-600 focus:ring-blue-500 mr-2"
                        />
                        <input
                          type="text"
                          value={option}
                          onChange={(e) => handleUpdateOption(index, e.target.value)}
                          className="flex-1 bg-gray-800 text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder={`Option ${index + 1}`}
                        />
                        <button
                          onClick={() => handleDeleteOption(index)}
                          className="ml-2 text-red-500 hover:text-red-400"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Options pour Vrai/Faux */}
              {currentQuestion.type === QuestionType.TRUE_FALSE && (
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Réponse correcte
                  </label>
                  <div className="flex space-x-4">
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="answer-true"
                        name="correctAnswer"
                        checked={currentQuestion.correctAnswer === 'true'}
                        onChange={() => setCurrentQuestion(prev => ({...prev, correctAnswer: 'true'}))}
                        className="h-4 w-4 bg-gray-700 border-gray-600 rounded-full text-blue-600 focus:ring-blue-500 mr-2"
                      />
                      <label htmlFor="answer-true" className="text-gray-300">Vrai</label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="answer-false"
                        name="correctAnswer"
                        checked={currentQuestion.correctAnswer === 'false'}
                        onChange={() => setCurrentQuestion(prev => ({...prev, correctAnswer: 'false'}))}
                        className="h-4 w-4 bg-gray-700 border-gray-600 rounded-full text-blue-600 focus:ring-blue-500 mr-2"
                      />
                      <label htmlFor="answer-false" className="text-gray-300">Faux</label>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Réponse courte */}
              {currentQuestion.type === QuestionType.SHORT_ANSWER && (
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Réponse correcte
                  </label>
                  <input
                    type="text"
                    value={typeof currentQuestion.correctAnswer === 'string' ? currentQuestion.correctAnswer : ''}
                    onChange={(e) => setCurrentQuestion(prev => ({...prev, correctAnswer: e.target.value}))}
                    className="w-full bg-gray-800 text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Saisissez la réponse correcte"
                  />
                </div>
              )}
              
              <div className="flex justify-end pt-2">
                {editingQuestionIndex !== null ? (
                  <button
                    onClick={handleUpdateQuestion}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
                  >
                    <Check size={16} className="mr-1" />
                    Mettre à jour
                  </button>
                ) : (
                  <button
                    onClick={handleAddQuestion}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center"
                  >
                    <Plus size={16} className="mr-1" />
                    Ajouter
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal de prévisualisation */}
      {isPreviewOpen && previewCertification && createPortal(
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gray-800 p-4 border-b border-gray-700 flex justify-between items-center">
              <h2 className="text-xl font-semibold">Aperçu de la certification</h2>
              <button 
                onClick={() => setIsPreviewOpen(false)}
                className="text-gray-400 hover:text-white p-1"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6">
              {/* En-tête de certification */}
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-8">
                {previewCertification.imageUrl ? (
                  <div className="w-full md:w-40 h-40 rounded-lg overflow-hidden bg-gray-700">
                    <img 
                      src={previewCertification.imageUrl} 
                      alt={previewCertification.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-full md:w-40 h-40 bg-gradient-to-br from-blue-900 to-indigo-800 rounded-lg flex items-center justify-center">
                    <Award size={64} className="text-white/50" />
                  </div>
                )}
                
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-2">{previewCertification.title}</h3>
                  <div className="text-gray-300 mb-4 markdown-content">
                    <ReactMarkdown>{previewCertification.description}</ReactMarkdown>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {!previewCertification.published && (
                      <div className="text-xs bg-yellow-600 text-white px-2 py-1 rounded">
                        Non publiée
                      </div>
                    )}
                    <div className="text-xs bg-blue-900/50 text-blue-200 px-2 py-1 rounded">
                      {previewCertification.requirements.length} exigence(s)
                    </div>
                    {previewCertification.examQuestions && previewCertification.examQuestions.length > 0 && (
                      <div className="text-xs bg-purple-900/50 text-purple-200 px-2 py-1 rounded">
                        {previewCertification.examQuestions.length} question(s)
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Exigences */}
              <div className="mb-8">
                <h4 className="text-lg font-medium mb-4 border-b border-gray-700 pb-2">
                  Exigences pour obtenir cette certification
                </h4>
                
                {previewCertification.requirements.length > 0 ? (
                  <ul className="space-y-4">
                    {previewCertification.requirements.map((req, index) => (
                      <li key={index} className="bg-gray-700 p-4 rounded-md">
                        <div className="font-medium mb-1">{
                          req.type === RequirementType.COMPLETE_FORMATIONS ? 'Formations à compléter' :
                          req.type === RequirementType.PASS_EXAM ? 'Examen à réussir' :
                          req.type === RequirementType.ADMIN_APPROVAL ? 'Approbation administrative' :
                          'Modules spécifiques'
                        }</div>
                        <div className="text-gray-300">{req.description}</div>
                        
                        {req.type === RequirementType.COMPLETE_FORMATIONS && req.formationIds && req.formationIds.length > 0 && (
                          <div className="mt-2">
                            <div className="text-sm text-gray-400 mb-1">Formations requises :</div>
                            <ul className="pl-5 list-disc text-gray-300">
                              {req.formationIds.map((id, i) => {
                                const formation = formations.find(f => f.id === id);
                                return (
                                  <li key={i}>
                                    {formation ? formation.title : `Formation ${id}`}
                                  </li>
                                );
                              })}
                            </ul>
                          </div>
                        )}
                        
                        {req.type === RequirementType.PASS_EXAM && (
                          <div className="mt-2 text-sm text-gray-400">
                            Score minimum requis : {req.minScore || 70}%
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-center py-6 bg-gray-700 rounded-md">
                    <p className="text-gray-400">Aucune exigence définie</p>
                  </div>
                )}
              </div>
              
              {/* Questions d'examen */}
              {previewCertification.examQuestions && previewCertification.examQuestions.length > 0 && (
                <div>
                  <h4 className="text-lg font-medium mb-4 border-b border-gray-700 pb-2">
                    Questions d'examen ({previewCertification.examQuestions.length})
                  </h4>
                  
                  <ul className="space-y-4">
                    {previewCertification.examQuestions.map((question, index) => (
                      <li key={index} className="bg-gray-700 p-4 rounded-md">
                        <div className="font-medium mb-2">
                          {index + 1}. {question.question}
                        </div>
                        
                        {(question.type === QuestionType.MULTIPLE_CHOICE || question.type === QuestionType.MULTIPLE_ANSWER) && (
                          <div>
                            <div className="text-sm text-gray-400 mb-1">
                              {question.type === QuestionType.MULTIPLE_CHOICE ? 'Choix unique' : 'Choix multiples'}
                            </div>
                            <ul className="space-y-1">
                              {question.options && question.options.map((option, i) => (
                                <li key={i} className="flex items-center">
                                  <div className={`w-4 h-4 mr-2 rounded-sm flex items-center justify-center ${
                                    question.type === QuestionType.MULTIPLE_CHOICE
                                      ? (question.correctAnswer === option ? 'bg-green-500' : 'bg-gray-600')
                                      : (Array.isArray(question.correctAnswer) && question.correctAnswer.includes(option)
                                          ? 'bg-green-500' : 'bg-gray-600')
                                  }`}>
                                    {question.type === QuestionType.MULTIPLE_CHOICE
                                      ? (question.correctAnswer === option && <Check size={12} />)
                                      : (Array.isArray(question.correctAnswer) && question.correctAnswer.includes(option) && <Check size={12} />)
                                    }
                                  </div>
                                  <span className="text-gray-300">{option}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {question.type === QuestionType.TRUE_FALSE && (
                          <div>
                            <div className="text-sm text-gray-400 mb-1">Vrai/Faux</div>
                            <div className="flex space-x-4">
                              <div className="flex items-center">
                                <div className={`w-4 h-4 mr-2 rounded-full flex items-center justify-center ${
                                  question.correctAnswer === 'true' ? 'bg-green-500' : 'bg-gray-600'
                                }`}>
                                  {question.correctAnswer === 'true' && <Check size={12} />}
                                </div>
                                <span className="text-gray-300">Vrai</span>
                              </div>
                              <div className="flex items-center">
                                <div className={`w-4 h-4 mr-2 rounded-full flex items-center justify-center ${
                                  question.correctAnswer === 'false' ? 'bg-green-500' : 'bg-gray-600'
                                }`}>
                                  {question.correctAnswer === 'false' && <Check size={12} />}
                                </div>
                                <span className="text-gray-300">Faux</span>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {question.type === QuestionType.SHORT_ANSWER && (
                          <div>
                            <div className="text-sm text-gray-400 mb-1">Réponse courte</div>
                            <div className="mt-1 text-green-400">
                              Réponse correcte : {typeof question.correctAnswer === 'string' ? question.correctAnswer : 'Non définie'}
                            </div>
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default CertificationManager; 