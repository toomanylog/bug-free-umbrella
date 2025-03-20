import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, CheckCircle, Clock, Award, BookOpen, Video, Download, Share2, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface FormationModule {
  id: number;
  title: string;
  description: string;
  duration: string;
  isVideo: boolean;
  isLocked: boolean;
}

interface FormationData {
  id: string;
  title: string;
  description: string;
  longDescription: string;
  level: string;
  modules: number;
  modulesData: FormationModule[];
  duration: string;
  certification: boolean;
  popular: boolean;
  completed: number;
  rating: number;
  price: number;
  tags: string[];
  badge: string;
  instructor: string;
  requirements: string[];
  objectives: string[];
}

const FormationDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [formation, setFormation] = useState<FormationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openModule, setOpenModule] = useState<number | null>(null);
  const [progress, setProgress] = useState(0);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // Si l'utilisateur n'est pas connecté, le rediriger vers la page d'accueil
  useEffect(() => {
    if (!currentUser) {
      navigate('/', { replace: true });
    }
  }, [currentUser, navigate]);

  // Simuler le chargement des données de formation depuis une API
  useEffect(() => {
    setLoading(true);
    
    // Simuler un délai d'API
    const timer = setTimeout(() => {
      // Données factices pour les formations
      const formationsData: { [key: string]: FormationData } = {
        'credit': {
          id: 'credit',
          title: 'Masterclass Obtention de Crédit',
          description: 'Maîtrisez les techniques avancées d\'obtention de crédits.',
          longDescription: 'Notre masterclass d\'obtention de crédit vous enseigne les techniques avancées utilisées par les experts du domaine. Apprenez à optimiser vos chances d\'obtenir des financements importants grâce à nos méthodes éprouvées. Cette formation intensive couvre tous les aspects essentiels, des bases de l\'évaluation de crédit jusqu\'aux stratégies avancées de négociation avec les institutions financières.',
          level: 'Intermédiaire',
          modules: 12,
          modulesData: [
            { id: 1, title: 'Introduction aux principes du crédit', description: 'Comprendre les fondamentaux qui régissent l\'attribution de crédits.', duration: '2h30', isVideo: true, isLocked: false },
            { id: 2, title: 'Préparation de dossier optimisé', description: 'Techniques pour construire un dossier solide et convaincant.', duration: '3h15', isVideo: true, isLocked: false },
            { id: 3, title: 'Analyse des différents types de crédit', description: 'Comprendre les spécificités de chaque type de crédit et leurs avantages.', duration: '4h00', isVideo: true, isLocked: true },
            { id: 4, title: 'Techniques avancées de négociation', description: 'Méthodes éprouvées pour obtenir les meilleures conditions possibles.', duration: '3h45', isVideo: true, isLocked: true },
            { id: 5, title: 'Gestion des refus et contre-propositions', description: 'Comment rebondir efficacement après un refus initial.', duration: '2h30', isVideo: false, isLocked: true },
            { id: 6, title: 'Stratégies pour crédits multiples', description: 'Organisation et gestion de plusieurs demandes de crédit simultanées.', duration: '3h00', isVideo: true, isLocked: true },
            { id: 7, title: 'Étude de cas pratiques', description: 'Analyse de situations réelles et solutions appliquées.', duration: '4h30', isVideo: false, isLocked: true },
            { id: 8, title: 'Optimisation du profil emprunteur', description: 'Techniques pour améliorer votre profil aux yeux des institutions.', duration: '3h15', isVideo: true, isLocked: true },
            { id: 9, title: 'Gestion des garanties et cautions', description: 'Comprendre et optimiser les différentes formes de garanties.', duration: '2h45', isVideo: true, isLocked: true },
            { id: 10, title: 'Techniques spécifiques aux grands montants', description: 'Méthodes adaptées pour l\'obtention de crédits importants.', duration: '3h30', isVideo: true, isLocked: true },
            { id: 11, title: 'Aspects légaux et conformité', description: 'Cadre juridique et bonnes pratiques pour rester dans la légalité.', duration: '2h15', isVideo: false, isLocked: true },
            { id: 12, title: 'Évaluation finale et certification', description: 'Test final des connaissances et certification.', duration: '1h30', isVideo: false, isLocked: true }
          ],
          duration: '35 heures',
          certification: true,
          popular: true,
          completed: 45,
          rating: 4.8,
          price: 299,
          tags: ['credit', 'finance', 'bank'],
          badge: 'TOP',
          instructor: 'Jean Dupont',
          requirements: [
            'Compréhension de base des principes financiers',
            'Ordinateur avec accès internet',
            'Calculatrice financière (physique ou application)'
          ],
          objectives: [
            'Maîtriser les techniques d\'obtention de crédits importants',
            'Savoir construire un dossier de demande optimal',
            'Développer des compétences de négociation avec les institutions financières',
            'Comprendre comment gérer les refus et reformuler les demandes',
            'Obtenir une certification reconnue dans le domaine'
          ]
        },
        'packid': {
          id: 'packid',
          title: 'PACKID Professionnel',
          description: 'Formation complète sur l\'obtention et la gestion de PACKID.',
          longDescription: 'Notre formation PACKID Professionnel vous fournit toutes les compétences nécessaires pour maîtriser l\'obtention et la gestion sécurisée de vos identifiants PACKID. Vous apprendrez les meilleures pratiques et techniques pour sécuriser et maximiser l\'efficacité de vos identifiants dans l\'environnement numérique actuel. Cette formation approfondie est conçue pour vous donner un avantage concurrentiel dans ce domaine spécialisé.',
          level: 'Avancé',
          modules: 8,
          modulesData: [
            { id: 1, title: 'Fondamentaux du système PACKID', description: 'Introduction aux principes de base et fonctionnement.', duration: '3h00', isVideo: true, isLocked: false },
            { id: 2, title: 'Techniques d\'obtention sécurisée', description: 'Méthodes éprouvées pour l\'acquisition de PACKID.', duration: '4h30', isVideo: true, isLocked: false },
            { id: 3, title: 'Gestion et maintenance des identifiants', description: 'Organisation et entretien de vos PACKID pour une durée de vie optimale.', duration: '3h15', isVideo: true, isLocked: true },
            { id: 4, title: 'Sécurisation avancée', description: 'Techniques de protection contre les compromissions.', duration: '3h45', isVideo: true, isLocked: true },
            { id: 5, title: 'Utilisation professionnelle et éthique', description: 'Cadre d\'utilisation respectant les meilleures pratiques du secteur.', duration: '2h30', isVideo: false, isLocked: true },
            { id: 6, title: 'Stratégies multi-PACKID', description: 'Gestion efficace de plusieurs identifiants simultanément.', duration: '3h00', isVideo: true, isLocked: true },
            { id: 7, title: 'Résolution de problèmes courants', description: 'Diagnostic et solutions aux situations problématiques fréquentes.', duration: '3h00', isVideo: false, isLocked: true },
            { id: 8, title: 'Évaluation et certification', description: 'Test final des connaissances et certification professionnelle.', duration: '1h30', isVideo: false, isLocked: true }
          ],
          duration: '24 heures',
          certification: true,
          popular: false,
          completed: 20,
          rating: 4.5,
          price: 349,
          tags: ['packid', 'identification', 'security'],
          badge: '',
          instructor: 'Sophie Martin',
          requirements: [
            'Connaissances de base en informatique',
            'Ordinateur avec accès internet',
            'Compréhension des principes d\'identification numérique'
          ],
          objectives: [
            'Maîtriser les techniques d\'obtention de PACKID',
            'Apprendre à gérer efficacement vos identifiants',
            'Sécuriser vos PACKID contre les compromissions',
            'Développer une utilisation éthique et professionnelle',
            'Obtenir une certification reconnue dans le domaine'
          ]
        },
        'coldmail': {
          id: 'coldmail',
          title: 'Coldmail Expert',
          description: 'Perfectionnez vos techniques d\'e-mailing pour atteindre des taux d\'ouverture et de conversion exceptionnels.',
          longDescription: 'Notre formation Coldmail Expert vous enseigne les techniques les plus avancées pour maximiser l\'efficacité de vos campagnes d\'emailing. Vous apprendrez à créer des messages qui captent l\'attention, à optimiser vos lignes d\'objet, et à développer des stratégies qui génèrent des taux d\'ouverture et de conversion bien supérieurs à la moyenne. Cette formation est indispensable pour quiconque souhaite exceller dans le domaine du marketing par email.',
          level: 'Avancé',
          modules: 10,
          modulesData: [
            { id: 1, title: 'Fondamentaux du coldmail efficace', description: 'Principes de base et éléments clés d\'un email réussi.', duration: '2h30', isVideo: true, isLocked: false },
            { id: 2, title: 'Psychologie du destinataire', description: 'Comprendre les mécanismes psychologiques qui influencent l\'ouverture et la réponse.', duration: '3h00', isVideo: true, isLocked: false },
            { id: 3, title: 'Techniques de rédaction avancées', description: 'Méthodes d\'écriture pour maximiser l\'impact et la persuasion.', duration: '4h15', isVideo: true, isLocked: true },
            { id: 4, title: 'Optimisation des lignes d\'objet', description: 'Création de lignes d\'objet irrésistibles qui maximisent les taux d\'ouverture.', duration: '3h00', isVideo: true, isLocked: true },
            { id: 5, title: 'Personnalisation à grande échelle', description: 'Techniques pour personnaliser efficacement même avec de grandes listes.', duration: '3h30', isVideo: false, isLocked: true },
            { id: 6, title: 'Analyse et amélioration continue', description: 'Méthodes pour tester, analyser et optimiser vos campagnes.', duration: '3h45', isVideo: true, isLocked: true },
            { id: 7, title: 'Automatisation intelligente', description: 'Mise en place de séquences et de déclencheurs efficaces.', duration: '3h15', isVideo: true, isLocked: true },
            { id: 8, title: 'Contournement des filtres anti-spam', description: 'Techniques légitimes pour maximiser la délivrabilité.', duration: '3h00', isVideo: false, isLocked: true },
            { id: 9, title: 'Stratégies de follow-up', description: 'L\'art du suivi pour maximiser les taux de réponse.', duration: '2h45', isVideo: true, isLocked: true },
            { id: 10, title: 'Étude de cas et certification', description: 'Analyse de campagnes réussies et évaluation finale.', duration: '1h30', isVideo: false, isLocked: true }
          ],
          duration: '30 heures',
          certification: false,
          popular: false,
          completed: 10,
          rating: 4.3,
          price: 199,
          tags: ['email', 'marketing', 'automation'],
          badge: '',
          instructor: 'Marc Bernard',
          requirements: [
            'Expérience de base en marketing par email',
            'Ordinateur avec accès internet',
            'Idéalement, accès à un outil d\'emailing'
          ],
          objectives: [
            'Maîtriser les techniques avancées de coldmail',
            'Améliorer significativement vos taux d\'ouverture et de réponse',
            'Apprendre à rédiger des emails persuasifs',
            'Développer des stratégies de suivi efficaces',
            'Optimiser la délivrabilité de vos emails'
          ]
        },
        'tools-suite': {
          id: 'tools-suite',
          title: 'Suite Complète d\'Outils',
          description: 'Formation complète sur l\'utilisation de notre suite d\'outils spécialisés.',
          longDescription: 'Notre formation Suite Complète d\'Outils vous permet de maîtriser l\'ensemble des outils spécialisés développés par nos experts. Vous apprendrez à utiliser efficacement chaque outil pour maximiser votre productivité et l\'efficacité de vos projets. Cette formation couvre l\'ensemble de notre écosystème d\'outils, vous donnant ainsi une maîtrise complète de toutes les fonctionnalités disponibles.',
          level: 'Intermédiaire',
          modules: 12,
          modulesData: [
            { id: 1, title: 'Vue d\'ensemble de la suite d\'outils', description: 'Introduction à l\'écosystème complet et ses interactions.', duration: '2h00', isVideo: true, isLocked: false },
            { id: 2, title: 'Vérificateur de Leads - Fondamentaux', description: 'Utilisation de base du vérificateur de leads.', duration: '2h30', isVideo: true, isLocked: false },
            { id: 3, title: 'Vérificateur de Leads - Fonctions avancées', description: 'Techniques avancées d\'analyse et d\'optimisation.', duration: '2h45', isVideo: true, isLocked: true },
            { id: 4, title: 'Email Sender Pro - Configuration', description: 'Installation et configuration optimale de l\'outil d\'envoi.', duration: '2h30', isVideo: true, isLocked: true },
            { id: 5, title: 'Email Sender Pro - Automatisation', description: 'Paramétrage des séquences et des règles d\'automatisation.', duration: '3h00', isVideo: true, isLocked: true },
            { id: 6, title: 'Email Sender Pro - Optimisation', description: 'Maximisation des performances et des taux de délivrabilité.', duration: '2h45', isVideo: false, isLocked: true },
            { id: 7, title: 'Credential Cracker - Utilisation de base', description: 'Principes fondamentaux et utilisation responsable.', duration: '2h15', isVideo: true, isLocked: true },
            { id: 8, title: 'Credential Cracker - Techniques avancées', description: 'Méthodes sophistiquées pour l\'identification de vulnérabilités.', duration: '3h00', isVideo: true, isLocked: true },
            { id: 9, title: 'Intégration entre les outils', description: 'Création de workflows efficaces combinant plusieurs outils.', duration: '2h30', isVideo: false, isLocked: true },
            { id: 10, title: 'Techniques de déploiement à grande échelle', description: 'Stratégies pour l\'utilisation des outils sur de grands volumes.', duration: '2h15', isVideo: true, isLocked: true },
            { id: 11, title: 'Meilleures pratiques et éthique', description: 'Cadre d\'utilisation responsable et conforme.', duration: '1h30', isVideo: false, isLocked: true },
            { id: 12, title: 'Projet final et certification', description: 'Mise en pratique complète et évaluation pour certification.', duration: '2h00', isVideo: false, isLocked: true }
          ],
          duration: '25 heures',
          certification: true,
          popular: true,
          completed: 30,
          rating: 4.9,
          price: 399,
          tags: ['tools', 'automation', 'efficiency'],
          badge: 'PRO',
          instructor: 'Alexandre Dubois',
          requirements: [
            'Connaissances de base en informatique',
            'Ordinateur avec accès internet',
            'Espace disque suffisant pour l\'installation des outils'
          ],
          objectives: [
            'Maîtriser l\'ensemble de la suite d\'outils spécialisés',
            'Apprendre à intégrer les différents outils dans un workflow efficace',
            'Optimiser l\'utilisation de chaque outil pour maximiser les résultats',
            'Appliquer les meilleures pratiques pour une utilisation éthique',
            'Obtenir une certification d\'expert sur la suite complète'
          ]
        }
      };

      // Vérifier si l'ID de formation existe
      if (id && formationsData[id]) {
        setFormation(formationsData[id]);
        
        // Calculer le progrès fictif (2 modules débloqués sur le total)
        const totalModules = formationsData[id].modules;
        setProgress(Math.round((2 / totalModules) * 100));
      } else {
        setError('Formation non trouvée');
      }
      
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [id]);

  const toggleModule = (moduleId: number) => {
    if (openModule === moduleId) {
      setOpenModule(null);
    } else {
      setOpenModule(moduleId);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl font-medium">Chargement de la formation...</p>
        </div>
      </div>
    );
  }

  if (error || !formation) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8 bg-gray-800 rounded-xl">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold mb-4">Formation non trouvée</h1>
          <p className="text-gray-400 mb-6">
            Désolé, nous n'avons pas pu trouver la formation que vous cherchez. Elle a peut-être été déplacée ou supprimée.
          </p>
          <Link 
            to="/formations" 
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-lg hover:shadow-lg hover:shadow-blue-600/20 transition-all inline-block"
          >
            Retour au catalogue
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="sticky top-0 bg-gray-900/90 backdrop-blur-md border-b border-gray-800 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Link to="/" className="flex items-center space-x-2">
                <div className="h-10 w-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center">
                  <span className="font-bold text-sm">ML</span>
                </div>
                <span className="font-bold text-xl">Misa Linux</span>
              </Link>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link 
                to="/formations"
                className="hidden md:flex items-center px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
              >
                <ArrowLeft size={18} className="mr-2" />
                Retour au catalogue
              </Link>
              
              <div className="relative group">
                <button className="flex items-center space-x-1 text-gray-300 hover:text-white">
                  <span className="hidden md:inline">{currentUser?.displayName || currentUser?.email}</span>
                  <div className="h-8 w-8 bg-gradient-to-br from-blue-600/50 to-indigo-700/50 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold">{currentUser?.displayName?.charAt(0) || currentUser?.email?.charAt(0) || 'U'}</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Back to catalog - Mobile */}
        <div className="mb-6 md:hidden">
          <Link 
            to="/formations"
            className="flex items-center text-blue-400 hover:text-blue-300 transition-colors"
          >
            <ArrowLeft size={20} className="mr-1" />
            Retour au catalogue
          </Link>
        </div>
        
        {/* Formation Header */}
        <div className="bg-gradient-to-br from-blue-900/30 to-indigo-900/30 rounded-2xl p-6 md:p-10 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
            <div>
              {formation.badge && (
                <div className="inline-block px-3 py-1 rounded-full bg-blue-600/80 backdrop-blur-sm text-white text-sm font-bold mb-3">
                  {formation.badge}
                </div>
              )}
              <h1 className="text-3xl md:text-4xl font-bold mb-2">{formation.title}</h1>
              <p className="text-gray-300 mb-4">{formation.description}</p>
              
              <div className="flex flex-wrap gap-3 mb-4">
                <span className="flex items-center px-3 py-1 bg-blue-900/30 border border-blue-700/50 text-blue-400 rounded-full text-sm">
                  <BookOpen size={16} className="mr-1" />
                  {formation.level}
                </span>
                <span className="flex items-center px-3 py-1 bg-gray-800/50 rounded-full text-sm text-gray-300">
                  <Clock size={16} className="mr-1" />
                  {formation.duration}
                </span>
                {formation.certification && (
                  <span className="flex items-center px-3 py-1 bg-green-900/30 text-green-400 rounded-full text-sm">
                    <Award size={16} className="mr-1" />
                    Certification
                  </span>
                )}
              </div>
              
              <div className="flex items-center">
                <div className="flex items-center mr-4">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      size={18}
                      className={i < Math.floor(formation.rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-500"}
                    />
                  ))}
                  <span className="ml-2 text-white font-medium">{formation.rating.toFixed(1)}</span>
                </div>
                <span className="text-gray-400">{formation.completed} étudiants</span>
              </div>
            </div>
            
            <div className="mt-6 md:mt-0 flex flex-col items-center">
              <div className="text-3xl font-bold mb-2">{formation.price}€</div>
              <button className="w-full md:w-auto px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-lg hover:shadow-lg hover:shadow-blue-600/20 transition-all mb-2 font-medium">
                S'inscrire à la formation
              </button>
              <p className="text-sm text-gray-400">Accès à vie + Mises à jour</p>
            </div>
          </div>
          
          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium">Progression du cours</span>
              <span className="text-sm text-gray-400">2/{formation.modules} modules</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2.5">
              <div 
                className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2.5 rounded-full"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>
        
        {/* Content Tabs */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {/* Description */}
            <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 mb-8">
              <h2 className="text-2xl font-bold mb-4">À propos de cette formation</h2>
              <p className="text-gray-300 mb-6">{formation.longDescription}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-bold mb-3">Ce que vous apprendrez</h3>
                  <ul className="space-y-2">
                    {formation.objectives.map((objective, index) => (
                      <li key={index} className="flex items-start">
                        <CheckCircle size={16} className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                        <span className="text-gray-300">{objective}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-lg font-bold mb-3">Prérequis</h3>
                  <ul className="space-y-2">
                    {formation.requirements.map((requirement, index) => (
                      <li key={index} className="flex items-start">
                        <CheckCircle size={16} className="text-blue-500 mt-1 mr-2 flex-shrink-0" />
                        <span className="text-gray-300">{requirement}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
            
            {/* Instructor */}
            <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 mb-8">
              <h2 className="text-2xl font-bold mb-4">Votre instructeur</h2>
              <div className="flex items-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600/50 to-indigo-700/50 rounded-full flex items-center justify-center mr-4">
                  <span className="text-2xl font-bold">{formation.instructor.charAt(0)}</span>
                </div>
                <div>
                  <h3 className="text-xl font-medium">{formation.instructor}</h3>
                  <p className="text-gray-400">Expert en {formation.tags.join(', ')}</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Course Content */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-xl overflow-hidden sticky top-24">
              <div className="p-6 border-b border-gray-700">
                <h2 className="text-xl font-bold">Contenu du cours</h2>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-gray-400">{formation.modules} modules • {formation.duration}</span>
                </div>
              </div>
              
              <div className="max-h-[500px] overflow-y-auto">
                {formation.modulesData.map((module) => (
                  <div key={module.id} className="border-b border-gray-700 last:border-b-0">
                    <button 
                      onClick={() => toggleModule(module.id)}
                      className="flex justify-between items-center w-full p-4 hover:bg-gray-700/30 transition-colors text-left"
                    >
                      <div className="flex items-center">
                        {module.isLocked ? (
                          <div className="bg-gray-700 p-1.5 rounded-full mr-3">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                              <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                            </svg>
                          </div>
                        ) : (
                          <div className="bg-green-900/30 p-1.5 rounded-full mr-3">
                            <CheckCircle size={16} className="text-green-500" />
                          </div>
                        )}
                        <div className="text-left">
                          <h3 className={`font-medium ${module.isLocked ? 'text-gray-400' : 'text-white'}`}>
                            {module.id}. {module.title}
                          </h3>
                          <div className="flex items-center mt-1">
                            {module.isVideo ? (
                              <Video size={14} className="text-gray-500 mr-2" />
                            ) : (
                              <Download size={14} className="text-gray-500 mr-2" />
                            )}
                            <span className="text-xs text-gray-500">{module.duration}</span>
                          </div>
                        </div>
                      </div>
                      {openModule === module.id ? (
                        <ChevronUp size={18} className="text-gray-400 flex-shrink-0" />
                      ) : (
                        <ChevronDown size={18} className="text-gray-400 flex-shrink-0" />
                      )}
                    </button>
                    
                    {openModule === module.id && (
                      <div className="px-4 pb-4">
                        <p className="text-sm text-gray-400 ml-10">{module.description}</p>
                        {!module.isLocked && (
                          <button className="ml-10 mt-3 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 rounded text-sm font-medium transition-colors flex items-center">
                            <Video size={14} className="mr-2" />
                            Commencer
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              <div className="p-6 border-t border-gray-700">
                <button className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-lg hover:shadow-lg hover:shadow-blue-600/20 transition-all font-medium">
                  S'inscrire maintenant
                </button>
                <div className="flex justify-center mt-4">
                  <button className="flex items-center text-sm text-gray-400 hover:text-white transition-colors">
                    <Share2 size={16} className="mr-2" />
                    Partager cette formation
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="py-10 border-t border-gray-800 mt-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-6 md:mb-0">
              <div className="h-8 w-8 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center">
                <span className="font-bold text-xs">ML</span>
              </div>
              <span className="font-bold text-lg">Misa Linux</span>
            </div>
            
            <div className="flex flex-col md:flex-row gap-6 md:gap-10 mb-6 md:mb-0 items-center">
              <Link to="/cgu" className="hover:text-blue-400 transition-colors text-sm">Conditions générales d'utilisation</Link>
              <Link to="/cgv" className="hover:text-blue-400 transition-colors text-sm">Conditions générales de vente</Link>
              <Link to="/privacy" className="hover:text-blue-400 transition-colors text-sm">Politique de confidentialité</Link>
            </div>
            
            <div className="text-gray-400 text-xs">
              &copy; {new Date().getFullYear()} Misa Linux. Tous droits réservés.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default FormationDetail; 