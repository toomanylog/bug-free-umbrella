import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Sliders, ChevronDown, Star, X, BookOpen, Clock, Award } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface Formation {
  id: string;
  title: string;
  description: string;
  level: string;
  modules: number;
  duration: string;
  certification: boolean;
  popular: boolean;
  completed: number;
  rating: number;
  price: number;
  tags: string[];
  badge: string;
}

const Formations = () => {
  const [showMenu, setShowMenu] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // Si l'utilisateur n'est pas connecté, le rediriger vers la page d'accueil
  useEffect(() => {
    if (!currentUser) {
      navigate('/', { replace: true });
    }
  }, [currentUser, navigate]);

  // Données factices pour les formations
  const formations: Formation[] = [
    {
      id: 'credit',
      title: 'Masterclass Obtention de Crédit',
      description: 'Maîtrisez les techniques avancées d\'obtention de crédits importants et optimisez vos chances de financement.',
      level: 'Intermédiaire',
      modules: 12,
      duration: '35 heures',
      certification: true,
      popular: true,
      completed: 45,
      rating: 4.8,
      price: 299,
      tags: ['credit', 'finance', 'bank'],
      badge: 'TOP',
    },
    {
      id: 'packid',
      title: 'PACKID Professionnel',
      description: 'Formation complète sur l\'obtention et la gestion sécurisée de vos identifiants PACKID.',
      level: 'Avancé',
      modules: 8,
      duration: '24 heures',
      certification: true,
      popular: false,
      completed: 20,
      rating: 4.5,
      price: 349,
      tags: ['packid', 'identification', 'security'],
      badge: '',
    },
    {
      id: 'coldmail',
      title: 'Coldmail Expert',
      description: 'Perfectionnez vos techniques d\'e-mailing pour atteindre des taux d\'ouverture et de conversion exceptionnels.',
      level: 'Avancé',
      modules: 10,
      duration: '30 heures',
      certification: false,
      popular: false,
      completed: 10,
      rating: 4.3,
      price: 199,
      tags: ['email', 'marketing', 'automation'],
      badge: '',
    },
    {
      id: 'tools-suite',
      title: 'Suite Complète d\'Outils',
      description: 'Formation complète sur l\'utilisation de notre suite d\'outils spécialisés pour maximiser votre productivité.',
      level: 'Intermédiaire',
      modules: 12,
      duration: '25 heures',
      certification: true,
      popular: true,
      completed: 30,
      rating: 4.9,
      price: 399,
      tags: ['tools', 'automation', 'efficiency'],
      badge: 'PRO',
    },
    {
      id: 'secure-comms',
      title: 'Communications Sécurisées',
      description: 'Apprenez à sécuriser vos communications et protéger vos données sensibles contre toute forme d\'interception.',
      level: 'Débutant',
      modules: 6,
      duration: '18 heures',
      certification: false,
      popular: false,
      completed: 15,
      rating: 4.2,
      price: 149,
      tags: ['security', 'communication', 'privacy'],
      badge: '',
    },
    {
      id: 'web-automation',
      title: 'Automatisation Web Avancée',
      description: 'Maîtrisez les techniques d\'automatisation web pour optimiser vos opérations et gagner un temps précieux.',
      level: 'Avancé',
      modules: 14,
      duration: '40 heures',
      certification: true,
      popular: true,
      completed: 25,
      rating: 4.7,
      price: 329,
      tags: ['automation', 'web', 'scraping'],
      badge: 'NOUVEAU',
    }
  ];

  // Filtrer les formations en fonction du terme de recherche
  const filteredFormations = formations.filter(formation => 
    formation.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    formation.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    formation.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
            
            <div className="hidden md:flex space-x-6">
              <Link to="/" className="text-gray-300 hover:text-white transition-colors">Accueil</Link>
              <Link to="/formations" className="text-blue-400 hover:text-blue-300 transition-colors">Formations</Link>
              <Link to="/outils" className="text-gray-300 hover:text-white transition-colors">Outils</Link>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative group">
                <button className="flex items-center space-x-1 text-gray-300 hover:text-white">
                  <span className="hidden md:inline">{currentUser?.displayName || currentUser?.email}</span>
                  <div className="h-8 w-8 bg-gradient-to-br from-blue-600/50 to-indigo-700/50 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold">{currentUser?.displayName?.charAt(0) || currentUser?.email?.charAt(0) || 'U'}</span>
                  </div>
                </button>
              </div>
              
              <button 
                onClick={() => setShowMenu(!showMenu)}
                className="md:hidden bg-gray-800 p-2 rounded-lg"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  {showMenu ? (
                    <X size={20} />
                  ) : (
                    <>
                      <line x1="4" x2="20" y1="12" y2="12" />
                      <line x1="4" x2="20" y1="6" y2="6" />
                      <line x1="4" x2="20" y1="18" y2="18" />
                    </>
                  )}
                </svg>
              </button>
            </div>
          </div>
          
          {/* Mobile Menu */}
          {showMenu && (
            <div className="md:hidden mt-4 py-4 border-t border-gray-800">
              <nav className="flex flex-col space-y-3">
                <Link to="/" className="text-gray-300 hover:text-white transition-colors py-2">Accueil</Link>
                <Link to="/formations" className="text-blue-400 hover:text-blue-300 transition-colors py-2">Formations</Link>
                <Link to="/outils" className="text-gray-300 hover:text-white transition-colors py-2">Outils</Link>
              </nav>
            </div>
          )}
        </div>
      </header>
      
      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Catalogue de formations</h1>
            <p className="text-gray-400">Explorez nos formations exclusives pour développer vos compétences</p>
          </div>
          
          <div className="mt-4 md:mt-0 flex items-center space-x-2">
            <div className="relative w-full md:w-auto">
              <input
                type="text"
                placeholder="Rechercher une formation..."
                className="bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2 w-full md:w-64 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute left-3 top-2.5 text-gray-500" size={16} />
              {searchTerm && (
                <button 
                  className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-300"
                  onClick={() => setSearchTerm('')}
                >
                  <X size={16} />
                </button>
              )}
            </div>
            
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="bg-gray-800 border border-gray-700 rounded-lg p-2 hover:bg-gray-700 transition-colors"
            >
              <Sliders size={18} />
            </button>
          </div>
        </div>
        
        {/* Filters */}
        {showFilters && (
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-4 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Niveau</label>
                <div className="relative">
                  <select className="bg-gray-800 border border-gray-700 rounded-lg pl-3 pr-10 py-2 w-full appearance-none focus:outline-none focus:ring-2 focus:ring-blue-600">
                    <option value="">Tous les niveaux</option>
                    <option value="debutant">Débutant</option>
                    <option value="intermediaire">Intermédiaire</option>
                    <option value="avance">Avancé</option>
                  </select>
                  <ChevronDown size={16} className="absolute right-3 top-2.5 text-gray-500 pointer-events-none" />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Durée</label>
                <div className="relative">
                  <select className="bg-gray-800 border border-gray-700 rounded-lg pl-3 pr-10 py-2 w-full appearance-none focus:outline-none focus:ring-2 focus:ring-blue-600">
                    <option value="">Toutes les durées</option>
                    <option value="court">Court (&lt; 10h)</option>
                    <option value="moyen">Moyen (10-25h)</option>
                    <option value="long">Long (&gt; 25h)</option>
                  </select>
                  <ChevronDown size={16} className="absolute right-3 top-2.5 text-gray-500 pointer-events-none" />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Prix</label>
                <div className="relative">
                  <select className="bg-gray-800 border border-gray-700 rounded-lg pl-3 pr-10 py-2 w-full appearance-none focus:outline-none focus:ring-2 focus:ring-blue-600">
                    <option value="">Tous les prix</option>
                    <option value="low">Moins de 200€</option>
                    <option value="medium">200€ - 300€</option>
                    <option value="high">Plus de 300€</option>
                  </select>
                  <ChevronDown size={16} className="absolute right-3 top-2.5 text-gray-500 pointer-events-none" />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Certification</label>
                <div className="relative">
                  <select className="bg-gray-800 border border-gray-700 rounded-lg pl-3 pr-10 py-2 w-full appearance-none focus:outline-none focus:ring-2 focus:ring-blue-600">
                    <option value="">Tous</option>
                    <option value="yes">Avec certification</option>
                    <option value="no">Sans certification</option>
                  </select>
                  <ChevronDown size={16} className="absolute right-3 top-2.5 text-gray-500 pointer-events-none" />
                </div>
              </div>
            </div>
            
            <div className="flex justify-end mt-4">
              <button className="bg-gray-700 hover:bg-gray-600 text-sm px-4 py-2 rounded-lg transition-colors mr-2">
                Réinitialiser
              </button>
              <button className="bg-blue-600 hover:bg-blue-700 text-sm px-4 py-2 rounded-lg transition-colors">
                Appliquer les filtres
              </button>
            </div>
          </div>
        )}
        
        {/* Formations Grid */}
        {filteredFormations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFormations.map((formation) => (
              <Link 
                key={formation.id}
                to={`/formation/${formation.id}`}
                className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-xl overflow-hidden hover:shadow-lg hover:shadow-blue-900/10 hover:border-gray-600/50 transition-all"
              >
                <div className="bg-gradient-to-br from-blue-900/30 to-indigo-900/30 p-4 relative">
                  {formation.badge && (
                    <div className="absolute top-4 right-4 px-2 py-1 rounded-full bg-blue-600/80 backdrop-blur-sm text-white text-xs font-bold">
                      {formation.badge}
                    </div>
                  )}
                  <h2 className="text-xl font-bold mb-2 pr-16">{formation.title}</h2>
                  <p className="text-gray-300 text-sm line-clamp-2">{formation.description}</p>
                </div>
                
                <div className="p-4">
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className="flex items-center px-2 py-1 bg-blue-900/30 border border-blue-700/50 text-blue-400 rounded-full text-xs">
                      <BookOpen size={12} className="mr-1" />
                      {formation.level}
                    </span>
                    <span className="flex items-center px-2 py-1 bg-gray-800/50 rounded-full text-xs text-gray-300">
                      <Clock size={12} className="mr-1" />
                      {formation.duration}
                    </span>
                    {formation.certification && (
                      <span className="flex items-center px-2 py-1 bg-green-900/30 text-green-400 rounded-full text-xs">
                        <Award size={12} className="mr-1" />
                        Certification
                      </span>
                    )}
                  </div>
                  
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          size={14}
                          className={i < Math.floor(formation.rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-500"}
                        />
                      ))}
                      <span className="ml-1 text-white text-xs font-medium">{formation.rating.toFixed(1)}</span>
                    </div>
                    <span className="text-gray-400 text-xs">{formation.completed} étudiants</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-bold">{formation.price}€</span>
                    <span className="text-blue-400 text-sm">Voir plus &rarr;</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-xl p-8 text-center">
            <div className="text-blue-500 text-5xl mb-4">🔍</div>
            <h2 className="text-2xl font-bold mb-2">Aucun résultat</h2>
            <p className="text-gray-400 mb-6">
              Aucune formation ne correspond à votre recherche "{searchTerm}".
            </p>
            <button 
              onClick={() => setSearchTerm('')}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors inline-block"
            >
              Voir toutes les formations
            </button>
          </div>
        )}
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

export default Formations; 