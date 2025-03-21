import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Award, ArrowLeft, Clock } from 'lucide-react';
import { getCertification, Certification as CertificationType, RequirementType, checkCertificationEligibility } from '../firebase/certifications';
import { useAuth } from '../contexts/AuthContext';

const CertificationDetail: React.FC = () => {
  const { certificationId } = useParams<{ certificationId: string }>();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [certification, setCertification] = useState<CertificationType | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [eligibilityStatus, setEligibilityStatus] = useState<{ eligible: boolean; missingRequirements: string[] }>({ 
    eligible: false, 
    missingRequirements: [] 
  });

  useEffect(() => {
    const loadCertification = async () => {
      if (!certificationId) return;

      try {
        setLoading(true);
        const certData = await getCertification(certificationId);
        setCertification(certData);
        
        // Vérifier l'éligibilité de l'utilisateur si connecté
        if (currentUser) {
          const eligibility = await checkCertificationEligibility(currentUser.uid, certificationId);
          setEligibilityStatus(eligibility);
        }
      } catch (err: any) {
        console.error('Erreur lors du chargement de la certification:', err);
        setError('Impossible de charger les détails de la certification');
      } finally {
        setLoading(false);
      }
    };

    loadCertification();
  }, [certificationId, currentUser]);

  // Calculer la durée estimée basée sur le nombre de questions
  const getEstimatedDuration = () => {
    if (!certification?.examQuestions) return "Durée non disponible";
    
    // Estimation: environ 1 minute par question + 5 minutes de base
    const questionCount = certification.examQuestions.length;
    const minutes = 5 + questionCount;
    
    if (minutes < 10) return "Environ 5-10 minutes";
    if (minutes < 20) return "Environ 10-20 minutes";
    return `Environ ${minutes-5}-${minutes+5} minutes`;
  };

  const handleStartCertification = () => {
    navigate(`/exam/${certificationId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !certification) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center text-white p-4">
        <div className="bg-red-900/20 backdrop-blur-sm border border-red-700/50 rounded-xl p-8 max-w-md w-full text-center">
          <div className="text-red-400 text-6xl mb-4">😕</div>
          <h1 className="text-2xl font-bold mb-4">Certification introuvable</h1>
          <p className="text-gray-400 mb-6">
            {error || "La certification que vous recherchez n'existe pas ou n'est pas accessible."}
          </p>
          <Link 
            to="/"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-all"
          >
            Retour à l'accueil
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <Link 
          to="/"
          className="inline-flex items-center text-gray-400 hover:text-white mb-8"
        >
          <ArrowLeft size={18} className="mr-2" />
          Retour au dashboard
        </Link>

        <div className="bg-gray-800/60 backdrop-blur-sm border border-gray-700 rounded-xl shadow-xl overflow-hidden">
          {/* En-tête de la certification */}
          <div className="relative">
            {certification.imageUrl ? (
              <div className="h-48 md:h-64 w-full overflow-hidden">
                <img 
                  src={certification.imageUrl} 
                  alt={certification.title} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent"></div>
              </div>
            ) : (
              <div className="h-48 md:h-64 w-full bg-gradient-to-r from-blue-900 to-indigo-800 relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Award className="h-24 w-24 text-white/30" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent"></div>
              </div>
            )}

            <div className="absolute bottom-0 left-0 right-0 p-6">
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{certification.title}</h1>
            </div>
          </div>

          {/* Contenu principal */}
          <div className="p-6">
            <div className="mb-8">
              <h2 className="text-xl font-bold mb-4 border-b border-gray-700 pb-2">À propos de cette certification</h2>
              <p className="text-gray-300 whitespace-pre-line">{certification.description}</p>
            </div>

            <div className="mb-8">
              <h2 className="text-xl font-bold mb-4 border-b border-gray-700 pb-2">Prérequis</h2>
              
              {certification.requirements && certification.requirements.length > 0 ? (
                <ul className="space-y-4">
                  {certification.requirements.map((requirement, index) => (
                    <li key={index} className="bg-gray-700/60 backdrop-blur-sm border border-gray-600 rounded-lg p-4">
                      <h3 className="font-semibold mb-2">
                        {requirement.type === RequirementType.COMPLETE_FORMATIONS ? 'Formations à compléter' :
                         requirement.type === RequirementType.PASS_EXAM ? 'Examen à réussir' :
                         requirement.type === RequirementType.ADMIN_APPROVAL ? 'Approbation administrative' : 
                         'Autre prérequis'}
                      </h3>
                      <p className="text-gray-300">{requirement.description}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-400">Aucun prérequis particulier pour cette certification.</p>
              )}
            </div>

            <div className="mb-8">
              <h2 className="text-xl font-bold mb-4 border-b border-gray-700 pb-2">Processus de certification</h2>
              
              <div className="bg-blue-900/20 backdrop-blur-sm border border-blue-700/50 rounded-lg p-6">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-6">
                  <div className="bg-blue-800/30 rounded-full p-3">
                    <Clock className="h-8 w-8 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-1">Durée estimée</h3>
                    <p className="text-gray-300">{getEstimatedDuration()}</p>
                  </div>
                </div>
                
                <ol className="space-y-6 relative before:content-[''] before:absolute before:left-[15px] before:top-2 before:bottom-2 before:w-0.5 before:bg-blue-700/50">
                  <li className="pl-10 relative">
                    <div className="absolute left-0 top-1 bg-blue-600 rounded-full w-7 h-7 flex items-center justify-center">
                      <span className="text-white text-sm font-medium">1</span>
                    </div>
                    <h4 className="font-semibold text-blue-300 mb-1">Compléter les prérequis</h4>
                    <p className="text-gray-300 text-sm">Assurez-vous d'avoir complété toutes les exigences nécessaires.</p>
                  </li>
                  
                  <li className="pl-10 relative">
                    <div className="absolute left-0 top-1 bg-blue-600 rounded-full w-7 h-7 flex items-center justify-center">
                      <span className="text-white text-sm font-medium">2</span>
                    </div>
                    <h4 className="font-semibold text-blue-300 mb-1">Passer l'examen</h4>
                    <p className="text-gray-300 text-sm">Répondez aux questions pour démontrer vos compétences.</p>
                  </li>
                  
                  <li className="pl-10 relative">
                    <div className="absolute left-0 top-1 bg-blue-600 rounded-full w-7 h-7 flex items-center justify-center">
                      <span className="text-white text-sm font-medium">3</span>
                    </div>
                    <h4 className="font-semibold text-blue-300 mb-1">Recevoir votre certification</h4>
                    <p className="text-gray-300 text-sm">Une fois l'examen réussi, vous obtiendrez votre certification officielle.</p>
                  </li>
                </ol>
              </div>
            </div>

            <div className="mt-8 flex justify-center">
              <button 
                onClick={handleStartCertification}
                disabled={!currentUser || !eligibilityStatus.eligible}
                className={`px-8 py-3 rounded-lg font-semibold text-white flex items-center shadow-lg transition-all
                  ${eligibilityStatus.eligible 
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-700 hover:shadow-indigo-600/30' 
                    : 'bg-gray-700 cursor-not-allowed opacity-70'}`}
              >
                <Award size={20} className="mr-2" />
                {!currentUser 
                  ? 'Connectez-vous pour commencer' 
                  : eligibilityStatus.eligible 
                    ? 'Commencer la certification' 
                    : 'Prérequis manquants'}
              </button>
            </div>
            
            {!eligibilityStatus.eligible && eligibilityStatus.missingRequirements.length > 0 && (
              <div className="mt-4 p-4 bg-yellow-900/20 border border-yellow-700/50 rounded-lg">
                <h3 className="font-medium text-yellow-400 mb-2">Prérequis manquants :</h3>
                <ul className="list-disc pl-5 text-gray-300 space-y-1">
                  {eligibilityStatus.missingRequirements.map((requirement, index) => (
                    <li key={index}>{requirement}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CertificationDetail; 