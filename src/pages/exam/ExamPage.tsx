import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Award, Check, Clock, AlertTriangle, Download, Wrench } from 'lucide-react';
import { 
  getCertification, 
  Certification, 
  QuestionType,
  submitExam
} from '../../firebase/certifications';
import { useAuth } from '../../contexts/AuthContext';
import { ref, get } from 'firebase/database';
import { database } from '../../firebase/config';
import ReactMarkdown from 'react-markdown';

interface UserAnswer {
  questionId: string;
  answer: string | string[];
}

const ExamPage: React.FC = () => {
  const { certificationId } = useParams<{ certificationId: string }>();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [certification, setCertification] = useState<Certification | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [showResults, setShowResults] = useState<boolean>(false);
  const [examResult, setExamResult] = useState<any>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [linkedTools, setLinkedTools] = useState<{id: string, name: string}[]>([]);
  const [showExplanation, setShowExplanation] = useState<boolean>(false);

  // Soumission de l'examen
  const handleSubmitExam = useCallback(async () => {
    if (!currentUser || !certificationId || !certification) return;
    
    try {
      setIsSubmitting(true);
      
      // Soumettre l'examen
      const result = await submitExam(
        currentUser.uid,
        certificationId,
        userAnswers
      );
      
      setExamResult(result);
      setShowResults(true);
      
    } catch (err) {
      console.error("Erreur lors de la soumission de l'examen:", err);
      setError("Une erreur est survenue lors de la soumission de l'examen. Veuillez réessayer.");
    } finally {
      setIsSubmitting(false);
    }
  }, [certification, certificationId, currentUser, userAnswers]);

  // Charger la certification et ses questions
  useEffect(() => {
    const loadCertification = async () => {
      if (!certificationId) return;
      
      try {
        setLoading(true);
        const certData = await getCertification(certificationId);
        
        if (!certData.examQuestions || certData.examQuestions.length === 0) {
          setError("Cette certification ne contient pas de questions d'examen.");
          setLoading(false);
          return;
        }
        
        setCertification(certData);
        
        // Initialiser les réponses utilisateur
        const initialAnswers = certData.examQuestions.map(question => ({
          questionId: question.id,
          answer: question.type === QuestionType.MULTIPLE_ANSWER ? [] : '',
        }));
        
        setUserAnswers(initialAnswers);
        
        // Définir le temps pour l'examen (2 minutes par question + 5 minutes de base)
        const examTimeInMinutes = 5 + (certData.examQuestions.length * 2);
        setTimeRemaining(examTimeInMinutes * 60);
        
      } catch (err) {
        console.error('Erreur lors du chargement de la certification:', err);
        setError("Impossible de charger les détails de l'examen. Veuillez réessayer ultérieurement.");
      } finally {
        setLoading(false);
      }
    };
    
    if (currentUser) {
      loadCertification();
    } else {
      setError("Vous devez être connecté pour accéder à cet examen.");
      setLoading(false);
    }
  }, [certificationId, currentUser]);
  
  // Gestion du compte à rebours
  useEffect(() => {
    if (loading || timeRemaining <= 0 || showResults) return;
    
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [loading, timeRemaining, showResults, handleSubmitExam]);
  
  // Formatage du temps restant
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };
  
  // Mise à jour des réponses utilisateur
  const handleAnswerChange = (questionId: string, answer: string | string[]) => {
    setUserAnswers(prev => 
      prev.map(item => 
        item.questionId === questionId 
          ? { ...item, answer } 
          : item
      )
    );
  };
  
  // Gestion des réponses à choix multiples
  const handleMultipleAnswerChange = (questionId: string, value: string, checked: boolean) => {
    setUserAnswers(prev => 
      prev.map(item => {
        if (item.questionId !== questionId) return item;
        
        const currentAnswers = Array.isArray(item.answer) ? item.answer : [];
        
        if (checked) {
          return { ...item, answer: [...currentAnswers, value] };
        } else {
          return { ...item, answer: currentAnswers.filter(a => a !== value) };
        }
      })
    );
  };
  
  // Navigation entre les questions
  const goToNextQuestion = () => {
    if (certification && currentQuestionIndex < certification.examQuestions!.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };
  
  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };
  
  // Si l'examen est réussi, vérifier les outils liés
  useEffect(() => {
    if (showResults && examResult && examResult.passed && certificationId && currentUser) {
      // Vérifier s'il y a des outils liés à cette certification
      const fetchLinkedTools = async () => {
        try {
          // Vérifier si la certification a des outils liés
          const toolsRef = ref(database, 'tools');
          const toolsSnapshot = await get(toolsRef);
          
          if (toolsSnapshot.exists()) {
            const tools = toolsSnapshot.val();
            const linkedToolsList: {id: string, name: string}[] = [];
            
            // Parcourir les outils pour trouver ceux qui requièrent cette certification
            Object.entries(tools).forEach(([id, toolData]: [string, any]) => {
              if (toolData.conditions && 
                  toolData.conditions.some((condition: any) => 
                    condition.type === 'certification' && 
                    condition.certificationId === certificationId
                  )
              ) {
                linkedToolsList.push({
                  id,
                  name: toolData.name || `Outil ${id}`
                });
              }
            });
            
            setLinkedTools(linkedToolsList);
          }
        } catch (error) {
          console.error("Erreur lors de la recherche des outils liés:", error);
        }
      };
      
      fetchLinkedTools();
    }
  }, [showResults, examResult, certificationId, currentUser]);
  
  // Rediriger vers la page des outils
  const handleViewTools = () => {
    navigate('/dashboard/tools');
  };
  
  // Gestion de la soumission d'une réponse
  const handleAnswerSubmit = () => {
    const currentQuestion = certification?.examQuestions?.[currentQuestionIndex];
    if (!currentQuestion) return;

    // Vérifier si la réponse est correcte
    const userAnswer = userAnswers.find(a => a.questionId === currentQuestion.id);
    let isCorrect = false;

    if (currentQuestion.type === QuestionType.MULTIPLE_CHOICE || currentQuestion.type === QuestionType.TRUE_FALSE) {
      isCorrect = userAnswer?.answer === currentQuestion.correctAnswer;
    } else if (currentQuestion.type === QuestionType.MULTIPLE_ANSWER) {
      const userAnswerArray = userAnswer?.answer as string[];
      const correctAnswerArray = currentQuestion.correctAnswer as string[];
      isCorrect = userAnswerArray.length === correctAnswerArray.length &&
        userAnswerArray.every(a => correctAnswerArray.includes(a));
    }

    // Afficher l'explication
    setShowExplanation(true);

    // Passer à la question suivante après un délai
    setTimeout(() => {
      setShowExplanation(false);
      if (currentQuestionIndex < (certification?.examQuestions?.length || 0) - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
      } else {
        handleSubmitExam();
      }
    }, 5000);
  };
  
  // Rendu conditionnel pour le chargement
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  // Rendu conditionnel pour les erreurs
  if (error || !certification) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center text-white p-4">
        <div className="bg-red-900/20 backdrop-blur-sm border border-red-700/50 rounded-xl p-8 max-w-md w-full text-center">
          <div className="text-red-400 text-6xl mb-4">😕</div>
          <h1 className="text-2xl font-bold mb-4">Examen non disponible</h1>
          <p className="text-gray-400 mb-6">
            {error || "Cet examen n'est pas disponible pour le moment."}
          </p>
          <Link 
            to={certificationId ? `/certification/${certificationId}` : "/"}
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-all"
          >
            {certificationId ? "Retour à la certification" : "Retour à l'accueil"}
          </Link>
        </div>
      </div>
    );
  }
  
  // Rendu des résultats de l'examen
  if (showResults && examResult) {
    // Calculer le pourcentage de réussite
    const successPercentage = Math.round((examResult.correctAnswers / examResult.totalQuestions) * 100);
    const isPassing = successPercentage >= 70; // Seuil de réussite par défaut
    
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <div className="container mx-auto px-4 py-12">
          <Link 
            to={`/certification/${certificationId}`}
            className="inline-flex items-center text-gray-400 hover:text-white mb-8"
          >
            <ArrowLeft size={18} className="mr-2" />
            Retour à la certification
          </Link>
          
          <div className="bg-gray-800/60 backdrop-blur-sm border border-gray-700 rounded-xl shadow-xl overflow-hidden">
            <div className="p-8">
              <div className="text-center mb-8">
                <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full ${
                  isPassing ? 'bg-green-600/30' : 'bg-red-600/30'
                } mb-4`}>
                  {isPassing ? (
                    <Check size={48} className="text-green-400" />
                  ) : (
                    <AlertTriangle size={48} className="text-red-400" />
                  )}
                </div>
                
                <h1 className="text-3xl font-bold mb-2">
                  {isPassing ? 'Félicitations !' : 'Examen non validé'}
                </h1>
                
                <p className="text-gray-400 mb-4">
                  {isPassing 
                    ? 'Vous avez passé l\'examen avec succès et obtenu votre certification.' 
                    : 'Vous n\'avez pas atteint le score minimum requis pour valider cette certification.'}
                </p>
                
                <div className="flex justify-center">
                  <div className="bg-gray-700/50 rounded-lg px-6 py-3 text-center">
                    <div className="text-3xl font-bold mb-1">{successPercentage}%</div>
                    <div className="text-sm text-gray-400">Score final</div>
                  </div>
                  <div className="mx-4"></div>
                  <div className="bg-gray-700/50 rounded-lg px-6 py-3 text-center">
                    <div className="text-3xl font-bold mb-1">{examResult.correctAnswers}/{examResult.totalQuestions}</div>
                    <div className="text-sm text-gray-400">Réponses correctes</div>
                  </div>
                </div>
              </div>
              
              {isPassing && (
                <div className="mt-12 border border-gray-700 rounded-xl overflow-hidden" id="certificate">
                  <div className="bg-gradient-to-br from-blue-900/40 to-purple-900/40 p-8">
                    <div className="flex flex-col items-center justify-center">
                      <div className="text-center mb-6">
                        <h2 className="text-3xl font-bold mb-2">Certificat de Réussite</h2>
                        <div className="h-1 w-48 mx-auto bg-gradient-to-r from-blue-500 to-purple-500"></div>
                      </div>
                      
                      <div className="text-center mb-8">
                        <p className="text-lg text-gray-300 mb-1">Ce certificat est décerné à</p>
                        <h3 className="text-2xl font-bold">{currentUser?.displayName || 'Apprenant'}</h3>
                        <p className="text-gray-400 mt-6 mb-2">pour avoir réussi avec succès</p>
                        <h4 className="text-xl font-bold text-blue-400">{certification.title}</h4>
                        <p className="text-sm text-gray-400 mt-6">
                          Date d'obtention: {new Date().toLocaleDateString('fr-FR')}
                        </p>
                        <p className="text-sm text-gray-400 mt-2">
                          Identifiant: CERT-{certificationId?.substring(0, 8)}
                        </p>
                      </div>
                      
                      <div className="mt-4 w-full flex justify-center">
                        <Award className="text-yellow-400" size={60} />
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="flex flex-wrap justify-center mt-8 gap-4">
                <Link 
                  to={`/certification/${certificationId}`}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-all"
                >
                  Retour à la certification
                </Link>
                
                {isPassing && linkedTools.length > 0 && (
                  <button 
                    onClick={handleViewTools}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-all flex items-center"
                  >
                    <Wrench size={18} className="mr-2" />
                    Accéder aux outils liés
                  </button>
                )}
                
                {isPassing && (
                  <Link 
                    to="/"
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-all flex items-center"
                  >
                    <Award size={18} className="mr-2" />
                    Voir toutes mes certifications
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Récupérer la question courante
  const currentQuestion = certification.examQuestions![currentQuestionIndex];
  const currentAnswer = userAnswers.find(a => a.questionId === currentQuestion.id);
  
  // Rendu de l'interface d'examen
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8">
          <Link 
            to={`/certification/${certificationId}`}
            className="inline-flex items-center text-gray-400 hover:text-white"
            onClick={(e) => {
              // Demander confirmation avant de quitter l'examen
              if (!window.confirm("Êtes-vous sûr de vouloir quitter l'examen ? Votre progression sera perdue.")) {
                e.preventDefault();
              }
            }}
          >
            <ArrowLeft size={18} className="mr-2" />
            Quitter l'examen
          </Link>
          
          <div className="bg-gray-800 px-4 py-2 rounded-lg flex items-center">
            <Clock size={18} className="mr-2 text-yellow-400" />
            <span className={`font-mono ${timeRemaining < 60 ? 'text-red-400 font-bold' : ''}`}>
              {formatTime(timeRemaining)}
            </span>
          </div>
        </div>
        
        <div className="bg-gray-800/60 backdrop-blur-sm border border-gray-700 rounded-xl shadow-xl overflow-hidden">
          {/* En-tête */}
          <div className="p-6 border-b border-gray-700">
            <h1 className="text-2xl font-bold">{certification.title}</h1>
            <p className="text-gray-400">Examen de certification</p>
          </div>
          
          {/* Progression */}
          <div className="px-6 py-4 bg-gray-700/30 flex items-center">
            <div className="flex-1">
              <div className="text-sm text-gray-400 mb-1">
                Question {currentQuestionIndex + 1} sur {certification.examQuestions!.length}
              </div>
              <div className="w-full bg-gray-700 h-2 rounded-full">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ width: `${((currentQuestionIndex + 1) / certification.examQuestions!.length) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
          
          {/* Question */}
          <div className="p-6">
            <div className="prose prose-invert mb-6">
              <ReactMarkdown>
                {certification.examQuestions![currentQuestionIndex].question}
              </ReactMarkdown>
            </div>
            
            {/* Options de réponse */}
            <div className="space-y-3">
              {currentQuestion.type === QuestionType.MULTIPLE_CHOICE && (
                currentQuestion.options?.map((option, optionIndex) => (
                  <label
                    key={optionIndex}
                    className={`block p-4 rounded-lg border cursor-pointer transition-colors ${
                      userAnswers[currentQuestionIndex]?.answer === option
                        ? 'bg-blue-600/20 border-blue-500'
                        : 'bg-gray-700/50 border-gray-600 hover:border-gray-500'
                    }`}
                  >
                    <div className="flex items-center">
                      <input
                        type="radio"
                        name={`question-${currentQuestionIndex}`}
                        value={option}
                        checked={userAnswers[currentQuestionIndex]?.answer === option}
                        onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                        className="h-4 w-4 text-blue-600 border-gray-600 focus:ring-blue-500"
                      />
                      <span className="ml-3">{option}</span>
                    </div>
                  </label>
                ))
              )}
              
              {currentQuestion.type === QuestionType.MULTIPLE_ANSWER && (
                currentQuestion.options?.map((option, optionIndex) => (
                  <label
                    key={optionIndex}
                    className={`block p-4 rounded-lg border cursor-pointer transition-colors ${
                      (userAnswers[currentQuestionIndex]?.answer as string[])?.includes(option)
                        ? 'bg-blue-600/20 border-blue-500'
                        : 'bg-gray-700/50 border-gray-600 hover:border-gray-500'
                    }`}
                  >
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        value={option}
                        checked={(userAnswers[currentQuestionIndex]?.answer as string[])?.includes(option)}
                        onChange={(e) => handleMultipleAnswerChange(currentQuestion.id, e.target.value, e.target.checked)}
                        className="h-4 w-4 text-blue-600 border-gray-600 rounded focus:ring-blue-500"
                      />
                      <span className="ml-3">{option}</span>
                    </div>
                  </label>
                ))
              )}
            </div>
            
            {/* Bouton de soumission */}
            <div className="mt-6 flex justify-end">
              <button
                onClick={handleAnswerSubmit}
                disabled={showExplanation}
                className={`px-6 py-2 rounded-lg font-medium flex items-center ${
                  showExplanation
                    ? 'bg-gray-600 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {showExplanation ? (
                  <>
                    <Clock size={18} className="mr-2" />
                    Passage à la question suivante...
                  </>
                ) : (
                  <>
                    <Check size={18} className="mr-2" />
                    Valider ma réponse
                  </>
                )}
              </button>
            </div>
            
            {/* Affichage de l'explication */}
            {showExplanation && (
              <div className="mt-6 p-4 rounded-lg bg-gray-700/50">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold mb-2">Explication :</h3>
                  <div className="prose prose-invert">
                    <ReactMarkdown>
                      {currentQuestion.explanation || "Aucune explication disponible."}
                    </ReactMarkdown>
                  </div>
                </div>
                
                {currentQuestion.feedback && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Feedback :</h3>
                    <div className="prose prose-invert">
                      <ReactMarkdown>
                        {currentQuestion.feedback}
                      </ReactMarkdown>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamPage; 