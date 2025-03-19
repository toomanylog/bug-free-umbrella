import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    // Mettre à jour l'état pour le prochain rendu
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    
    // Vous pouvez enregistrer l'erreur dans un service de reporting comme Sentry
    console.error('Erreur non gérée:', error);
    console.error('Stack trace de l\'erreur:', errorInfo.componentStack);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center px-4">
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-red-900/30 to-gray-900 opacity-30"></div>
          </div>
          
          <div className="bg-gray-800/30 backdrop-blur-md border border-gray-700 rounded-2xl p-8 md:p-12 max-w-xl w-full relative z-10 shadow-2xl">
            <div className="mb-8 flex justify-center">
              <div className="h-20 w-20 bg-gradient-to-br from-red-600 to-orange-600 rounded-lg flex items-center justify-center transform rotate-12">
                <span className="font-bold text-3xl">!</span>
              </div>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-center">Une erreur s'est produite</h1>
            <p className="text-xl text-gray-300 mb-6 text-center">
              Désolé, une erreur inattendue s'est produite.
            </p>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mb-6 p-4 bg-gray-900/50 rounded-lg overflow-auto max-h-60">
                <p className="font-mono text-red-400 mb-2">{this.state.error.toString()}</p>
                {this.state.errorInfo && (
                  <details className="mt-2">
                    <summary className="text-gray-400 cursor-pointer">Stack trace</summary>
                    <pre className="mt-2 text-xs text-gray-400 whitespace-pre-wrap">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </div>
            )}
            
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link 
                to="/"
                className="relative overflow-hidden px-6 py-3 rounded-lg font-medium transition-all duration-300 bg-gradient-to-r from-blue-600 to-indigo-700 hover:shadow-lg hover:shadow-blue-600/30 text-center"
              >
                <span className="relative z-10">Retour à l'accueil</span>
                <span className="absolute inset-0 w-4 h-full bg-white/20 skew-x-[45deg] transform -translate-x-32 hover:translate-x-64 transition-transform duration-700"></span>
              </Link>
              <button 
                onClick={() => window.location.reload()}
                className="relative overflow-hidden px-6 py-3 rounded-lg font-medium transition-all duration-300 bg-transparent border border-blue-600 hover:bg-blue-900/20 text-center"
              >
                Rafraîchir la page
              </button>
            </div>
          </div>
          
          <div className="mt-8 text-gray-400">
            &copy; {new Date().getFullYear()} Misa Linux. Tous droits réservés.
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 