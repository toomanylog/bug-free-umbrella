import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { database } from '../../firebase/config';
import { ref, update } from 'firebase/database';

const RiotAuthCallback: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState<string>('Traitement de l\'authentification Riot Games...');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Récupérer le code d'autorisation de l'URL
        const params = new URLSearchParams(location.search);
        const code = params.get('code');
        
        if (!code) {
          setStatus('error');
          setMessage('Aucun code d\'autorisation reçu. Authentification annulée ou échouée.');
          return;
        }
        
        if (!currentUser) {
          setStatus('error');
          setMessage('Vous devez être connecté pour lier votre compte Riot.');
          setTimeout(() => navigate('/login'), 3000);
          return;
        }
        
        // Dans une implémentation réelle, nous ferions un appel à notre backend
        // pour échanger le code contre un token d'accès et un token de rafraîchissement
        
        // Pour l'instant, nous allons simuler une réussite
        setStatus('success');
        setMessage('Compte Riot authentifié avec succès! Redirection...');
        
        // Enregistrer l'état d'authentification dans Firebase (simulation)
        const userRiotRef = ref(database, `users/${currentUser.uid}/riotAuth`);
        await update(userRiotRef, {
          authenticated: true,
          authTime: Date.now()
        });
        
        // Rediriger après 2 secondes
        setTimeout(() => navigate('/admin/riot'), 2000);
        
      } catch (error) {
        console.error('Erreur lors du traitement du callback Riot:', error);
        setStatus('error');
        setMessage('Une erreur s\'est produite lors de l\'authentification.');
      }
    };
    
    handleCallback();
  }, [location, navigate, currentUser]);

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
      <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full border border-gray-700 shadow-xl">
        <h1 className="text-2xl font-bold mb-4 text-center">
          {status === 'loading' && 'Authentification en cours...'}
          {status === 'success' && 'Authentification réussie!'}
          {status === 'error' && 'Erreur d\'authentification'}
        </h1>
        
        <div className="flex justify-center my-6">
          {status === 'loading' && (
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          )}
          
          {status === 'success' && (
            <div className="h-12 w-12 rounded-full bg-green-500 flex items-center justify-center text-white text-2xl">
              ✓
            </div>
          )}
          
          {status === 'error' && (
            <div className="h-12 w-12 rounded-full bg-red-500 flex items-center justify-center text-white text-2xl">
              ×
            </div>
          )}
        </div>
        
        <p className="text-center text-gray-300 mb-6">
          {message}
        </p>
        
        {status === 'error' && (
          <div className="flex justify-center">
            <button 
              onClick={() => navigate('/admin/riot')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg"
            >
              Retour à la gestion des comptes
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RiotAuthCallback; 