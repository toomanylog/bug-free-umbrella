import React, { useState } from 'react';
import { loginUser, registerUser, resetPassword, getAuthErrorMessage } from '../firebase/auth';

interface LoginFormProps {
  onSuccess: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Veuillez remplir tous les champs.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await loginUser(email, password);
      onSuccess();
    } catch (err: any) {
      setError(getAuthErrorMessage(err.code));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      {error && (
        <div className="bg-red-500/20 border border-red-500 text-red-100 px-4 py-2 rounded-lg">
          {error}
        </div>
      )}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Adresse email</label>
        <input 
          type="email" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-3 bg-gray-900/80 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Mot de passe</label>
        <input 
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)} 
          className="w-full px-4 py-3 bg-gray-900/80 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
          required
        />
      </div>
      <div className="flex items-center">
        <input 
          type="checkbox" 
          id="remember" 
          checked={rememberMe}
          onChange={(e) => setRememberMe(e.target.checked)}
          className="w-4 h-4 bg-gray-900 border-gray-700 rounded focus:ring-blue-600 text-blue-600"
        />
        <label htmlFor="remember" className="ml-2 text-sm text-gray-300">Se souvenir de moi</label>
      </div>
      <button 
        type="submit"
        disabled={isSubmitting}
        className="w-full relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-700 px-4 py-3 rounded-lg font-medium transition-all duration-300 hover:shadow-lg hover:shadow-blue-600/30 disabled:opacity-70"
      >
        <span className="relative z-10">
          {isSubmitting ? 'Connexion en cours...' : 'Connexion'}
        </span>
        <span className="absolute inset-0 bg-gradient-to-r from-indigo-700 to-blue-600 opacity-0 hover:opacity-100 transition-opacity duration-300"></span>
      </button>
    </form>
  );
};

interface RegisterFormProps {
  onSuccess: () => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ onSuccess }) => {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!displayName || !email || !password || !confirmPassword) {
      setError('Veuillez remplir tous les champs.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await registerUser(email, password, displayName);
      onSuccess();
    } catch (err: any) {
      setError(getAuthErrorMessage(err.code));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      {error && (
        <div className="bg-red-500/20 border border-red-500 text-red-100 px-4 py-2 rounded-lg">
          {error}
        </div>
      )}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Nom complet</label>
        <input 
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className="w-full px-4 py-3 bg-gray-900/80 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Adresse email</label>
        <input 
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-3 bg-gray-900/80 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Mot de passe</label>
        <input 
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-3 bg-gray-900/80 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Confirmer le mot de passe</label>
        <input 
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full px-4 py-3 bg-gray-900/80 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
          required
        />
      </div>
      <button 
        type="submit"
        disabled={isSubmitting}
        className="w-full relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-700 px-4 py-3 rounded-lg font-medium transition-all duration-300 hover:shadow-lg hover:shadow-blue-600/30 disabled:opacity-70"
      >
        <span className="relative z-10">
          {isSubmitting ? 'Création en cours...' : 'Créer un compte'}
        </span>
        <span className="absolute inset-0 bg-gradient-to-r from-indigo-700 to-blue-600 opacity-0 hover:opacity-100 transition-opacity duration-300"></span>
      </button>
    </form>
  );
};

interface ForgotPasswordFormProps {
  onSuccess: () => void;
}

export const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({ onSuccess }) => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setError('Veuillez entrer votre adresse email.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      await resetPassword(email);
      setSuccessMessage('Un email de réinitialisation a été envoyé à votre adresse.');
      setTimeout(() => {
        onSuccess();
      }, 3000);
    } catch (err: any) {
      setError(getAuthErrorMessage(err.code));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      {error && (
        <div className="bg-red-500/20 border border-red-500 text-red-100 px-4 py-2 rounded-lg">
          {error}
        </div>
      )}
      {successMessage && (
        <div className="bg-green-500/20 border border-green-500 text-green-100 px-4 py-2 rounded-lg">
          {successMessage}
        </div>
      )}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Adresse email</label>
        <input 
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-3 bg-gray-900/80 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
          required
        />
      </div>
      <p className="text-sm text-gray-400">
        Nous vous enverrons un lien pour réinitialiser votre mot de passe.
      </p>
      <button 
        type="submit"
        disabled={isSubmitting}
        className="w-full relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-700 px-4 py-3 rounded-lg font-medium transition-all duration-300 hover:shadow-lg hover:shadow-blue-600/30 disabled:opacity-70"
      >
        <span className="relative z-10">
          {isSubmitting ? 'Envoi en cours...' : 'Réinitialiser'}
        </span>
        <span className="absolute inset-0 bg-gradient-to-r from-indigo-700 to-blue-600 opacity-0 hover:opacity-100 transition-opacity duration-300"></span>
      </button>
    </form>
  );
}; 