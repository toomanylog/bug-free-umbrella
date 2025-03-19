import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center px-4">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 opacity-30"></div>
        {Array.from({ length: 10 }).map((_, i) => (
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
      
      <div className="bg-gray-800/30 backdrop-blur-md border border-gray-700 rounded-2xl p-8 md:p-12 max-w-xl w-full relative z-10 shadow-2xl">
        <div className="mb-8 flex justify-center">
          <div className="h-20 w-20 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center transform rotate-12">
            <span className="font-bold text-3xl">404</span>
          </div>
        </div>
        
        <h1 className="text-3xl md:text-4xl font-bold mb-4 text-center">Page introuvable</h1>
        <p className="text-xl text-gray-300 mb-8 text-center">
          La page que vous recherchez n'existe pas ou a été déplacée.
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link 
            to="/"
            className="relative overflow-hidden px-6 py-3 rounded-lg font-medium transition-all duration-300 bg-gradient-to-r from-blue-600 to-indigo-700 hover:shadow-lg hover:shadow-blue-600/30 text-center"
          >
            <span className="relative z-10">Retour à l'accueil</span>
            <span className="absolute inset-0 w-4 h-full bg-white/20 skew-x-[45deg] transform -translate-x-32 hover:translate-x-64 transition-transform duration-700"></span>
          </Link>
          <Link 
            to="https://t.me/misalinux" 
            target="_blank" 
            rel="noopener noreferrer"
            className="relative overflow-hidden px-6 py-3 rounded-lg font-medium transition-all duration-300 bg-transparent border border-blue-600 hover:bg-blue-900/20 text-center"
          >
            Nous contacter
          </Link>
        </div>
      </div>
      
      <div className="mt-8 text-gray-400">
        &copy; {new Date().getFullYear()} Misa Linux. Tous droits réservés.
      </div>
    </div>
  );
};

export default NotFound; 