import React, { useState, useEffect } from 'react';
import { X, Menu, Check } from 'lucide-react';
import { LoginForm, RegisterForm, ForgotPasswordForm } from './AuthForms';
import { logoutUser } from '../firebase/auth';
import { useAuth } from '../contexts/AuthContext';
import Dashboard from './Dashboard';
import { useNavigate } from 'react-router-dom';

interface AnimatedElements {
  [key: string]: boolean;
}

// Type pour la redirection post-login
type RedirectTarget = {
  type: 'formation' | 'catalog' | 'tool' | null;
  id?: string;
  name?: string;
}

const MisaLinuxHomepage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [activeForm, setActiveForm] = useState('login'); // 'login', 'register', 'forgot'
  const [scrollPosition, setScrollPosition] = useState(0);
  const [animatedElements, setAnimatedElements] = useState<AnimatedElements>({});
  const [showDashboard, setShowDashboard] = useState(false);
  const [redirectAfterLogin, setRedirectAfterLogin] = useState<RedirectTarget>({
    type: null
  });
  
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleLoginModal = () => setIsLoginModalOpen(!isLoginModalOpen);
  
  // Scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      setScrollPosition(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Animation on scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setAnimatedElements(prev => ({
              ...prev,
              [entry.target.id]: true
            }));
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = document.querySelectorAll('.animate-on-scroll');
    elements.forEach(el => observer.observe(el));

    return () => {
      elements.forEach(el => observer.unobserve(el));
    };
  }, []);

  // Quand l'utilisateur est connecté, afficher le dashboard et gérer les redirections
  useEffect(() => {
    if (currentUser) {
      // Si une redirection est en attente
      if (redirectAfterLogin.type) {
        // Rediriger vers la formation spécifique
        if (redirectAfterLogin.type === 'formation' && redirectAfterLogin.id) {
          navigate(`/formations/${redirectAfterLogin.id}`);
          setRedirectAfterLogin({ type: null });
        } 
        // Rediriger vers le catalogue de formations
        else if (redirectAfterLogin.type === 'catalog') {
          navigate('/formations');
          setRedirectAfterLogin({ type: null });
        }
        // Sinon afficher le dashboard
        else {
          setShowDashboard(true);
          setIsLoginModalOpen(false);
        }
      } else {
        setShowDashboard(true);
        setIsLoginModalOpen(false);
      }
    }
  }, [currentUser, redirectAfterLogin, navigate]);

  // Défilement doux pour les liens d'ancrage
  useEffect(() => {
    const handleSmoothScroll = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'A' && target.getAttribute('href')?.startsWith('#')) {
        e.preventDefault();
        const id = target.getAttribute('href')?.substring(1);
        const element = document.getElementById(id || '');
        if (element) {
          window.scrollTo({
            top: element.offsetTop - 100, // Décalage pour tenir compte du header
            behavior: 'smooth'
          });
        }
      }
    };

    document.body.addEventListener('click', handleSmoothScroll);
    return () => document.body.removeEventListener('click', handleSmoothScroll);
  }, []);
  
  // Fonction pour gérer les clics sur les boutons qui nécessitent une connexion
  const handleProtectedAction = (action: RedirectTarget) => {
    if (currentUser) {
      // Si déjà connecté, rediriger directement
      if (action.type === 'formation' && action.id) {
        navigate(`/formations/${action.id}`);
      } else if (action.type === 'catalog') {
        navigate('/formations');
      } else if (action.type === 'tool' && action.id) {
        // Pour les outils, peut-être déclencher un téléchargement ou une autre action
        console.log(`Téléchargement de l'outil: ${action.name}`);
        alert(`Le téléchargement de l'outil "${action.name}" va démarrer.`);
      }
    } else {
      // Sinon, ouvrir la popup de login et enregistrer l'action pour redirection après connexion
      setRedirectAfterLogin(action);
      setActiveForm('register'); // Ouvrir sur le formulaire d'inscription
      setIsLoginModalOpen(true);
    }
  };

  // Services data
  const services = [
    {
      id: 'credit',
      title: 'Obtention de Crédit',
      description: 'Formez-vous aux techniques d\'obtention de crédits et financements à travers nos méthodes éprouvées.',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect width="20" height="14" x="2" y="5" rx="2" />
          <line x1="2" x2="22" y1="10" y2="10" />
        </svg>
      )
    },
    {
      id: 'email',
      title: 'Coldmail Avancé',
      description: 'Maîtrisez l\'art du coldmail pour maximiser vos taux de réponse et convertir efficacement.',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect width="20" height="16" x="2" y="4" rx="2" />
          <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
        </svg>
      )
    },
    {
      id: 'packid',
      title: 'Obtention de PACKID',
      description: 'Techniques spécialisées pour l\'obtention et la gestion sécurisée de PACKID dans l\'environnement actuel.',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
          <path d="M9.1 12a2.1 2.1 0 0 1 0-2.1A2.1 2.1 0 0 0 12 8a2.1 2.1 0 0 0 2.1 2.1 2.1 2.1 0 0 1 0 2.1A2.1 2.1 0 0 0 12 16a2.1 2.1 0 0 0-2.1-2.1" />
        </svg>
      )
    },
    {
      id: 'tools',
      title: 'Outils Spécialisés',
      description: 'Accédez à notre arsenal d\'outils développés par nos experts pour optimiser vos workflows dans l\'univers fraude.',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
        </svg>
      )
    },
    {
      id: 'training',
      title: 'Formations Personnalisées',
      description: 'Des formations sur mesure adaptées à votre niveau et à vos objectifs spécifiques dans l\'univers de la fraude.',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
          <path d="m15 5 3 3" />
        </svg>
      )
    },
    {
      id: 'consulting',
      title: 'Consulting Expert',
      description: 'Bénéficiez de l\'expertise de nos consultants pour résoudre vos problématiques complexes et développer vos stratégies.',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
        </svg>
      )
    }
  ];
  
  // Outils data
  const ourTools = [
    {
      id: 'tool-leads',
      name: "Vérificateur de Leads",
      description: "Analysez vos listes d'emails et de numéros pour déterminer le taux de bounce, les leads détectés comme leaks, spam traps ou à risque.",
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400">
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
            </svg>,
      status: "active",
      features: ["Détection de bounce", "Identification de spam traps", "Analyse de risques", "Statistiques détaillées", "Export de rapports"]
    },
    {
      id: 'tool-sender',
      name: "Email Sender Pro",
      description: "Système d'envoi d'emails rotatif avancé avec rotation de sujets, noms d'expéditeur, adresses, templates HTML et variables personnalisées.",
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-400">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>,
      status: "active",
      features: ["Rotation de SMTP", "Templates HTML dynamiques", "Variables personnalisables", "Gestion de bouncing", "Limitation de débit"]
    },
    {
      id: 'tool-cracker',
      name: "Credential Cracker",
      description: "Détectez les identifiants de connexion exposés dans des listes d'IP ou de domaines pour identifier les SMTP vulnérables et les clés API.",
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-400">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
              <rect x="8" y="16" width="8" height="6" rx="1"></rect>
            </svg>,
      status: "soon",
      features: ["Scan d'IP et domaines", "Détection de SMTP", "Recherche de clés API", "Analyse de vulnérabilités", "Export de résultats"]
    }
  ];
  
  const handleLogout = async () => {
    try {
      await logoutUser();
      setShowDashboard(false);
      setRedirectAfterLogin({ type: null });
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  // Si le dashboard est affiché, retourner le composant dashboard
  if (showDashboard && currentUser) {
    return <Dashboard onClose={() => setShowDashboard(false)} />;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 opacity-30"></div>
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
          {Array.from({ length: 20 }).map((_, i) => (
            <div 
              key={i}
              className="absolute bg-blue-500 rounded-full filter blur-3xl opacity-10"
              style={{
                width: `${Math.random() * 300 + 100}px`,
                height: `${Math.random() * 300 + 100}px`,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDuration: `${Math.random() * 30 + 20}s`,
                animation: `float ${Math.random() * 30 + 20}s infinite ease-in-out`,
                transform: `translate(-50%, -50%)`,
              }}
            ></div>
          ))}
        </div>
      </div>

      {/* Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrollPosition > 50 ? 'bg-gray-900/90 backdrop-blur-md py-4 shadow-xl' : 'bg-transparent py-6'}`}>
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className={`h-12 w-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center transform transition-transform duration-300 ${scrollPosition > 50 ? 'rotate-12' : ''}`}>
                <span className="font-bold text-xl">ML</span>
              </div>
              <span className="font-bold text-2xl bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">Misa Linux</span>
            </div>
            
            {/* Navigation - Desktop */}
            <nav className="hidden md:flex space-x-8">
              <a href="#services" className="relative hover:text-blue-400 transition-colors group">
                Services
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-400 transition-all duration-300 group-hover:w-full"></span>
              </a>
              <a href="#formations" className="relative hover:text-blue-400 transition-colors group">
                Formations
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-400 transition-all duration-300 group-hover:w-full"></span>
              </a>
              <a href="#tools" className="relative hover:text-blue-400 transition-colors group">
                Outils
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-400 transition-all duration-300 group-hover:w-full"></span>
              </a>
              <a href="#about" className="relative hover:text-blue-400 transition-colors group">
                À propos
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-400 transition-all duration-300 group-hover:w-full"></span>
              </a>
            </nav>
            
            {/* Login Button */}
            <div className="hidden md:block">
              {currentUser ? (
                <div className="flex items-center space-x-4">
                  <span className="text-gray-300">
                    {currentUser.displayName || currentUser.email}
                  </span>
                  <button 
                    onClick={handleLogout}
                    className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-2 rounded-lg font-medium transition-all duration-300 hover:shadow-lg hover:shadow-blue-600/30"
                  >
                    <span className="relative z-10">Déconnexion</span>
                    <span className="absolute inset-0 bg-gradient-to-r from-indigo-700 to-blue-600 opacity-0 hover:opacity-100 transition-opacity duration-300"></span>
                  </button>
                </div>
              ) : (
                <button 
                  onClick={toggleLoginModal}
                  className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-2 rounded-lg font-medium transition-all duration-300 hover:shadow-lg hover:shadow-blue-600/30"
                >
                  <span className="relative z-10">Se connecter</span>
                  <span className="absolute inset-0 bg-gradient-to-r from-indigo-700 to-blue-600 opacity-0 hover:opacity-100 transition-opacity duration-300"></span>
                </button>
              )}
            </div>
            
            {/* Mobile Menu Button */}
            <button 
              onClick={toggleMenu} 
              className="md:hidden relative z-20 p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
              aria-label={isMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
              aria-expanded={isMenuOpen}
              aria-controls="mobile-menu"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
          
          {/* Mobile Menu */}
          <div 
            id="mobile-menu"
            className={`fixed inset-0 bg-gray-900/95 backdrop-blur-md z-10 flex items-center justify-center transition-all duration-500 md:hidden ${
              isMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
            }`}
          >
            <nav className="flex flex-col items-center space-y-8 text-center">
              <a 
                href="#services" 
                onClick={() => setIsMenuOpen(false)}
                className="text-2xl font-bold hover:text-blue-400 transition-colors"
              >
                Services
              </a>
              <a 
                href="#formations" 
                onClick={() => setIsMenuOpen(false)}
                className="text-2xl font-bold hover:text-blue-400 transition-colors"
              >
                Formations
              </a>
              <a 
                href="#tools" 
                onClick={() => setIsMenuOpen(false)}
                className="text-2xl font-bold hover:text-blue-400 transition-colors"
              >
                Outils
              </a>
              <a 
                href="#about" 
                onClick={() => setIsMenuOpen(false)}
                className="text-2xl font-bold hover:text-blue-400 transition-colors"
              >
                À propos
              </a>
              <button 
                onClick={() => {
                  if (currentUser) {
                    handleLogout();
                  } else {
                    toggleLoginModal();
                  }
                  setIsMenuOpen(false);
                }}
                className="mt-8 bg-gradient-to-r from-blue-600 to-indigo-700 px-8 py-3 rounded-lg font-medium transition-all duration-300 hover:shadow-lg hover:shadow-blue-600/30"
              >
                {currentUser ? 'Déconnexion' : 'Se connecter'}
              </button>
            </nav>
          </div>
        </div>
      </header>
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div 
              className="inline-block mb-4 px-4 py-1 rounded-full bg-blue-900/30 border border-blue-700/50 text-blue-400"
            >
              Formation et Outils Spécialisés
            </div>
            <h1 className="text-4xl md:text-7xl font-bold mb-6 leading-tight">
              Maîtrisez l'univers de la <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 inline-block transform hover:scale-105 transition-transform duration-300">fraude</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-10 leading-relaxed">
              Formations avancées et outils professionnels pour exceller dans le monde du spamming et des techniques spécialisées.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-6">
              <a 
                href="#formations"
                className="group relative overflow-hidden px-8 py-4 rounded-lg font-medium text-lg transition-all duration-300 bg-gradient-to-r from-blue-600 to-indigo-700 hover:shadow-lg hover:shadow-blue-600/30 inline-block"
              >
                Découvrir nos formations
                <div className="absolute inset-0 w-4 h-full bg-white/20 skew-x-[45deg] transform -translate-x-32 group-hover:translate-x-64 transition-transform duration-700"></div>
              </a>
              <a 
                href="#tools"
                className="group relative overflow-hidden px-8 py-4 rounded-lg font-medium text-lg transition-all duration-300 bg-transparent border border-blue-600 hover:bg-blue-900/20 inline-block"
              >
                Explorer nos outils
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-500 transition-all duration-700 group-hover:w-full"></span>
              </a>
            </div>
          </div>
        </div>
        
        {/* Floating Elements */}
        <div className="absolute top-1/3 -left-16 w-32 h-32 bg-blue-600/10 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-1/3 -right-16 w-40 h-40 bg-indigo-600/10 rounded-full filter blur-3xl"></div>
      </section>
      
      {/* Services Section */}
      <section id="services" className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-blue-900/10 to-gray-900 z-0"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div id="services-header" className="max-w-xl mx-auto text-center mb-16 animate-on-scroll">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 inline-block relative">
              Nos Services Spécialisés
              <div className={`absolute -bottom-2 left-1/2 transform -translate-x-1/2 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent transition-all duration-1000 ${animatedElements['services-header'] ? 'w-24' : 'w-0'}`}></div>
            </h2>
            <p className="text-xl text-gray-300">
              Des solutions expertes pour tous vos besoins dans l'univers de la fraude et des techniques spécialisées.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <div 
                id={`service-${service.id}`}
                key={service.id} 
                className={`relative group bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700/50 overflow-hidden transition-all duration-500 hover:shadow-xl hover:shadow-blue-600/10 hover:-translate-y-2 animate-on-scroll`}
                style={{ 
                  animationDelay: `${index * 100}ms`,
                  opacity: animatedElements[`service-${service.id}`] ? 1 : 0,
                  transform: animatedElements[`service-${service.id}`] ? 'translateY(0)' : 'translateY(20px)',
                  transition: 'opacity 0.5s ease, transform 0.5s ease'
                }}
              >
                <div className="absolute -top-12 -right-12 w-24 h-24 bg-blue-600/10 rounded-full filter blur-xl group-hover:bg-blue-600/20 transition-all duration-300"></div>
                
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center mb-6 transform transition-transform duration-300 group-hover:rotate-12">
                  {service.icon}
                </div>
                
                <h3 className="text-xl font-bold mb-3">{service.title}</h3>
                <p className="text-gray-400 mb-6">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Formations Section */}
      <section id="formations" className="py-20 relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div id="formations-header" className="max-w-3xl mx-auto mb-16 animate-on-scroll">
            <div className="flex flex-col md:flex-row md:items-end gap-6">
              <div className="md:w-2/3">
                <h2 className="text-3xl md:text-4xl font-bold mb-6 inline-block relative">
                  Nos Formations
                  <div className={`absolute -bottom-2 left-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-1000 ${animatedElements['formations-header'] ? 'w-24' : 'w-0'}`}></div>
                </h2>
                <p className="text-xl text-gray-300">
                  Acquérez les compétences recherchées dans l'univers de la fraude grâce à nos formations spécialisées.
                </p>
              </div>
              <div className="md:w-1/3 flex justify-start md:justify-end">
                <button 
                  onClick={() => handleProtectedAction({ type: 'catalog' })}
                  className="group relative overflow-hidden px-6 py-3 rounded-lg font-medium transition-all duration-300 bg-gradient-to-r from-blue-600 to-indigo-700 hover:shadow-lg hover:shadow-blue-600/30"
                >
                  Toutes les formations
                  <div className="absolute inset-0 w-4 h-full bg-white/20 skew-x-[45deg] transform -translate-x-32 group-hover:translate-x-64 transition-transform duration-700"></div>
                </button>
              </div>
            </div>
          </div>
          
          <div id="formation-cards" className="animate-on-scroll">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Formation 1 */}
              <div className="relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-blue-900/20 transition-all duration-500 group">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-indigo-700/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="p-8 relative z-10">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <div className="inline-block px-3 py-1 rounded-full bg-blue-900/30 border border-blue-700/50 text-blue-400 text-sm mb-3">
                        Formation populaire
                      </div>
                      <h3 className="text-2xl font-bold">Masterclass Obtention de Crédit</h3>
                    </div>
                    <div className="bg-blue-600/80 backdrop-blur-sm text-white px-4 py-2 rounded-full font-bold">
                      TOP
                    </div>
                  </div>
                  
                  <p className="text-gray-300 mb-6">
                    Maîtrisez les techniques avancées d'obtention de crédits. Ce programme intensif vous formera aux stratégies utilisées par les experts pour optimiser vos chances d'obtenir des financements.
                  </p>
                  
                  <div className="flex flex-wrap gap-3 mb-6">
                    <span className="px-3 py-1 bg-gray-700 rounded-full text-sm">12 modules</span>
                    <span className="px-3 py-1 bg-gray-700 rounded-full text-sm">35 heures</span>
                    <span className="px-3 py-1 bg-gray-700 rounded-full text-sm">Certification</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <button 
                      onClick={() => handleProtectedAction({ 
                        type: 'formation', 
                        id: 'credit', 
                        name: 'Masterclass Obtention de Crédit' 
                      })}
                      className="relative overflow-hidden px-6 py-2 rounded-lg font-medium transition-all duration-300 bg-gradient-to-r from-blue-600 to-indigo-700 hover:shadow-lg hover:shadow-blue-600/30"
                    >
                      Voir la formation
                      <div className="absolute inset-0 w-4 h-full bg-white/20 skew-x-[45deg] transform -translate-x-32 group-hover:translate-x-64 transition-transform duration-700"></div>
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Formation 2 */}
              <div className="relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-blue-900/20 transition-all duration-500 group">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-indigo-700/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="p-8 relative z-10">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <div className="inline-block px-3 py-1 rounded-full bg-blue-900/30 border border-blue-700/50 text-blue-400 text-sm mb-3">
                        Nouvelle formation
                      </div>
                      <h3 className="text-2xl font-bold">PACKID Professionnel</h3>
                    </div>
                  </div>
                  
                  <p className="text-gray-300 mb-6">
                    Formation complète sur l'obtention et la gestion de PACKID. Apprenez les meilleures pratiques et techniques pour sécuriser et maximiser l'efficacité de vos identifiants.
                  </p>
                  
                  <div className="flex flex-wrap gap-3 mb-6">
                    <span className="px-3 py-1 bg-gray-700 rounded-full text-sm">8 modules</span>
                    <span className="px-3 py-1 bg-gray-700 rounded-full text-sm">24 heures</span>
                    <span className="px-3 py-1 bg-gray-700 rounded-full text-sm">Support VIP</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <button 
                      onClick={() => handleProtectedAction({ 
                        type: 'formation', 
                        id: 'packid', 
                        name: 'PACKID Professionnel' 
                      })}
                      className="relative overflow-hidden px-6 py-2 rounded-lg font-medium transition-all duration-300 bg-gradient-to-r from-blue-600 to-indigo-700 hover:shadow-lg hover:shadow-blue-600/30"
                    >
                      Voir la formation
                      <div className="absolute inset-0 w-4 h-full bg-white/20 skew-x-[45deg] transform -translate-x-32 group-hover:translate-x-64 transition-transform duration-700"></div>
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Formation 3 */}
              <div className="relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-blue-900/20 transition-all duration-500 group">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-indigo-700/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="p-8 relative z-10">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <div className="inline-block px-3 py-1 rounded-full bg-blue-900/30 border border-blue-700/50 text-blue-400 text-sm mb-3">
                        Avancé
                      </div>
                      <h3 className="text-2xl font-bold">Coldmail Expert</h3>
                    </div>
                  </div>
                  
                  <p className="text-gray-300 mb-6">
                    Perfectionnez vos techniques d'e-mailing pour atteindre des taux d'ouverture et de conversion exceptionnels. Formation complète sur les stratégies avancées de coldmail.
                  </p>
                  
                  <div className="flex flex-wrap gap-3 mb-6">
                    <span className="px-3 py-1 bg-gray-700 rounded-full text-sm">10 modules</span>
                    <span className="px-3 py-1 bg-gray-700 rounded-full text-sm">30 heures</span>
                    <span className="px-3 py-1 bg-gray-700 rounded-full text-sm">Templates inclus</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <button 
                      onClick={() => handleProtectedAction({ 
                        type: 'formation', 
                        id: 'coldmail', 
                        name: 'Coldmail Expert' 
                      })}
                      className="relative overflow-hidden px-6 py-2 rounded-lg font-medium transition-all duration-300 bg-gradient-to-r from-blue-600 to-indigo-700 hover:shadow-lg hover:shadow-blue-600/30"
                    >
                      Voir la formation
                      <div className="absolute inset-0 w-4 h-full bg-white/20 skew-x-[45deg] transform -translate-x-32 group-hover:translate-x-64 transition-transform duration-700"></div>
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Formation 4 */}
              <div className="relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-blue-900/20 transition-all duration-500 group">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-indigo-700/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="p-8 relative z-10">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <div className="inline-block px-3 py-1 rounded-full bg-blue-900/30 border border-blue-700/50 text-blue-400 text-sm mb-3">
                        Bestseller
                      </div>
                      <h3 className="text-2xl font-bold">Suite Complète d'Outils</h3>
                    </div>
                    <div className="bg-blue-600/80 backdrop-blur-sm text-white px-4 py-2 rounded-full font-bold">
                      PRO
                    </div>
                  </div>
                  
                  <p className="text-gray-300 mb-6">
                    Formation complète sur l'utilisation de notre suite d'outils spécialisés. Apprenez à maîtriser chaque outil pour maximiser votre efficacité dans tous vos projets.
                  </p>
                  
                  <div className="flex flex-wrap gap-3 mb-6">
                    <span className="px-3 py-1 bg-gray-700 rounded-full text-sm">12 modules</span>
                    <span className="px-3 py-1 bg-gray-700 rounded-full text-sm">25 heures</span>
                    <span className="px-3 py-1 bg-gray-700 rounded-full text-sm">Outils inclus</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <button 
                      onClick={() => handleProtectedAction({ 
                        type: 'formation', 
                        id: 'tools-suite', 
                        name: 'Suite Complète d\'Outils' 
                      })}
                      className="relative overflow-hidden px-6 py-2 rounded-lg font-medium transition-all duration-300 bg-gradient-to-r from-blue-600 to-indigo-700 hover:shadow-lg hover:shadow-blue-600/30"
                    >
                      Voir la formation
                      <div className="absolute inset-0 w-4 h-full bg-white/20 skew-x-[45deg] transform -translate-x-32 group-hover:translate-x-64 transition-transform duration-700"></div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Outils Section */}
      <section className="py-20 bg-gray-900" id="tools">
        <div className="container mx-auto px-4">
          <div id="tools-header" className="text-center max-w-3xl mx-auto mb-16 animate-on-scroll">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 inline-block relative">
              Nos Outils Spécialisés
              <div className={`absolute -bottom-2 left-1/2 transform -translate-x-1/2 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent transition-all duration-1000 ${animatedElements['tools-header'] ? 'w-24' : 'w-0'}`}></div>
            </h2>
            <p className="text-gray-400">
              Des outils puissants développés par nos experts pour optimiser vos workflows et améliorer vos performances
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ourTools.map(tool => (
              <div key={tool.id} className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 hover:shadow-lg hover:shadow-blue-900/10 transition-all">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-blue-900/20 rounded-lg">
                    {tool.icon}
                  </div>
                  {tool.status === "active" ? (
                    <span className="px-2 py-1 bg-green-900/30 text-green-400 text-xs rounded-full">Actif</span>
                  ) : (
                    <span className="px-2 py-1 bg-yellow-900/30 text-yellow-400 text-xs rounded-full">Bientôt</span>
                  )}
                </div>
                <h3 className="text-xl font-bold mb-2">{tool.name}</h3>
                <p className="text-gray-400 mb-4">{tool.description}</p>
                <div className="mb-4">
                  <p className="text-sm text-gray-300 mb-2">Fonctionnalités:</p>
                  <ul className="text-sm text-gray-400 list-disc pl-5 space-y-1">
                    {tool.features.map((feature, index) => (
                      <li key={index}>{feature}</li>
                    ))}
                  </ul>
                </div>
                {tool.status === "active" ? (
                  <button 
                    onClick={() => handleProtectedAction({type: 'tool', id: tool.id, name: tool.name})}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 px-4 py-2 rounded-lg font-medium transition-all duration-300 hover:shadow-lg hover:shadow-blue-600/30"
                  >
                    Télécharger
                  </button>
                ) : (
                  <button className="w-full bg-gray-700 px-4 py-2 rounded-lg font-medium transition-all duration-300 cursor-not-allowed opacity-70">
                    Disponible prochainement
                  </button>
                )}
              </div>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <button 
              onClick={() => handleProtectedAction({type: 'tool', id: 'all-tools', name: 'Suite complète'})}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-lg hover:shadow-lg hover:shadow-blue-600/20 transition-all"
            >
              Accéder à tous nos outils
            </button>
          </div>
        </div>
      </section>
      
      {/* About Section */}
      <section id="about" className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-blue-900/10 to-gray-900 z-0"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div id="about-header" className="max-w-3xl mx-auto mb-16 animate-on-scroll">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 inline-block relative">
              À propos de Misa Linux
              <div className={`absolute -bottom-2 left-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-1000 ${animatedElements['about-header'] ? 'w-24' : 'w-0'}`}></div>
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Centre de formation spécialisé dans les techniques avancées de la fraude et du développement de compétences numériques stratégiques.
            </p>
            
            <div className="grid md:grid-cols-2 gap-10 mt-12">
              <div className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-xl border border-gray-700/50">
                <h3 className="text-2xl font-bold mb-4">Notre mission</h3>
                <p className="text-gray-300 mb-6">
                  Chez Misa Linux, nous nous engageons à fournir les formations et outils les plus avancés pour vous permettre d'exceller dans l'univers compétitif des techniques spécialisées.
                </p>
                <ul className="space-y-3">
                  {['Formations de haut niveau', 'Support personnalisé', 'Outils exclusifs', 'Communauté d\'experts'].map((item, index) => (
                    <li key={index} className="flex items-start">
                      <div className="bg-blue-600/20 p-1 rounded-full mr-3 mt-1">
                        <Check size={16} className="text-blue-400" />
                      </div>
                      <span className="text-gray-300">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-xl border border-gray-700/50">
                <h3 className="text-2xl font-bold mb-4">Contactez-nous</h3>
                <p className="text-gray-300 mb-6">
                  Vous avez des questions ? N'hésitez pas à nous contacter via Telegram.
                </p>
                <div className="space-y-4">
                  <a 
                    href="https://t.me/misalinux" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-full relative overflow-hidden px-6 py-3 rounded-lg font-medium transition-all duration-300 bg-gradient-to-r from-blue-600 to-indigo-700 hover:shadow-lg hover:shadow-blue-600/30"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                      <path d="m22 2-7 20-4-9-9-4Z" />
                      <path d="M22 2 11 13" />
                    </svg>
                    Contact direct
                    <div className="absolute inset-0 w-4 h-full bg-white/20 skew-x-[45deg] transform -translate-x-32 group-hover:translate-x-64 transition-transform duration-700"></div>
                  </a>
                  
                  <a 
                    href="https://t.me/chezmisa" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-full relative overflow-hidden px-6 py-3 rounded-lg font-medium transition-all duration-300 bg-transparent border border-blue-600 hover:bg-blue-900/20"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                      <path d="m22 2-7 20-4-9-9-4Z" />
                      <path d="M22 2 11 13" />
                    </svg>
                    Notre canal Telegram
                  </a>
                  
                  <div className="mt-6 text-center">
                    <p className="text-gray-400 text-sm">
                      Rejoignez notre communauté Telegram pour être informé des dernières formations et outils disponibles.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Login Modal */}
      <div className={`fixed inset-0 z-50 flex items-center justify-center ${isLoginModalOpen ? 'opacity-100 visible' : 'opacity-0 invisible'} transition-all duration-300`}>
        <div className="absolute inset-0 bg-gray-900/80 backdrop-blur-sm" onClick={toggleLoginModal}></div>
        
        <div className="relative bg-gray-800 border border-gray-700 rounded-xl overflow-hidden max-w-md w-full mx-4 transform transition-all duration-500 shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-indigo-900/20 z-0"></div>
          
          <button 
            type="button"
            onClick={toggleLoginModal}
            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-[200]"
            aria-label="Fermer la fenêtre de connexion"
          >
            <X size={24} />
          </button>
          
          <div className="p-8 relative z-10">
            <div className="flex justify-center mb-6">
              <div className="h-14 w-14 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center transform rotate-12">
                <span className="font-bold text-xl">ML</span>
              </div>
            </div>
            
            <div className="flex border-b border-gray-700 mb-6">
              <button 
                type="button"
                className={`py-2 px-4 font-medium transition-colors ${activeForm === 'login' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-gray-200'}`}
                onClick={() => setActiveForm('login')}
              >
                Connexion
              </button>
              <button 
                type="button"
                className={`py-2 px-4 font-medium transition-colors ${activeForm === 'register' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-gray-200'}`}
                onClick={() => setActiveForm('register')}
              >
                Inscription
              </button>
              <button 
                type="button"
                className={`py-2 px-4 font-medium transition-colors ${activeForm === 'forgot' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-gray-200'}`}
                onClick={() => setActiveForm('forgot')}
              >
                Oublié ?
              </button>
            </div>
            
            {activeForm === 'login' && (
              <LoginForm onSuccess={() => setIsLoginModalOpen(false)} />
            )}
            
            {activeForm === 'register' && (
              <RegisterForm onSuccess={() => setIsLoginModalOpen(false)} />
            )}
            
            {activeForm === 'forgot' && (
              <ForgotPasswordForm onSuccess={() => {
                setActiveForm('login');
              }} />
            )}
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="py-10 bg-gray-900 border-t border-gray-800">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-6 md:mb-0">
              <div className="h-10 w-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center">
                <span className="font-bold text-md">ML</span>
              </div>
              <span className="font-bold text-xl">Misa Linux</span>
            </div>
            
            <div className="flex flex-col md:flex-row gap-6 md:gap-10 mb-6 md:mb-0 items-center">
              <a href="/cgu" className="hover:text-blue-400 transition-colors">Conditions générales d'utilisation</a>
              <a href="/cgv" className="hover:text-blue-400 transition-colors">Conditions générales de vente</a>
              <a href="/privacy" className="hover:text-blue-400 transition-colors">Politique de confidentialité</a>
            </div>
            
            <div className="text-gray-400 text-sm">
              &copy; {new Date().getFullYear()} Misa Linux. Tous droits réservés.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MisaLinuxHomepage;