import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged, User, signOut } from 'firebase/auth';
import { auth } from '../firebase/config';
import { getUserData, UserData, UserRole } from '../firebase/auth';
import { ref, onValue } from 'firebase/database';
import { database } from '../firebase/config';

// Type du contexte d'authentification
export interface AuthContextType {
  currentUser: User | null;
  userData: UserData | null;
  isAdmin: boolean;
  isLoading: boolean;
  refreshUserData: () => Promise<void>;
  logout: () => Promise<void>;
}

// Créer le contexte
const AuthContext = createContext<AuthContextType | null>(null);

// Hook personnalisé pour utiliser le contexte
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

// Provider du contexte d'authentification
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isInitializing, setIsInitializing] = useState<boolean>(true);

  // Fonction pour rafraîchir les données utilisateur
  const refreshUserData = async () => {
    if (currentUser) {
      try {
        const data = await getUserData(currentUser.uid);
        setUserData(data);
        setIsAdmin(data?.role === UserRole.ADMIN);
      } catch (error) {
        console.error('Erreur lors du rafraîchissement des données utilisateur:', error);
      }
    }
  };

  // Fonction de déconnexion
  const logout = async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
      setUserData(null);
      setIsAdmin(false);
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      throw error;
    }
  };

  // Gérer les changements d'état d'authentification
  useEffect(() => {
    try {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        setCurrentUser(user);
        
        if (user) {
          try {
            const userRef = ref(database, `users/${user.uid}`);
            
            onValue(userRef, (snapshot) => {
              try {
                const data = snapshot.val();
                if (data) {
                  setUserData(data);
                  setIsAdmin(data?.role === UserRole.ADMIN);
                }
                setIsLoading(false);
                setIsInitializing(false);
              } catch (error) {
                console.error('Erreur lors du traitement des données utilisateur:', error);
                setIsLoading(false);
                setIsInitializing(false);
              }
            }, (error) => {
              console.error('Erreur lors de la récupération des données utilisateur:', error);
              setIsLoading(false);
              setIsInitializing(false);
            });
          } catch (error) {
            console.error('Erreur lors de la création de la référence utilisateur:', error);
            setIsLoading(false);
            setIsInitializing(false);
          }
        } else {
          setUserData(null);
          setIsAdmin(false);
          setIsLoading(false);
          setIsInitializing(false);
        }
      }, (error) => {
        console.error('Erreur lors de la surveillance de l\'état d\'authentification:', error);
        setIsLoading(false);
        setIsInitializing(false);
      });
      
      return () => {
        try {
          unsubscribe();
        } catch (error) {
          console.error('Erreur lors du désabonnement de l\'écouteur d\'authentification:', error);
        }
      };
    } catch (error) {
      console.error('Erreur lors de l\'initialisation de l\'écouteur d\'authentification:', error);
      setIsLoading(false);
      setIsInitializing(false);
    }
  }, []);

  // Ne pas rendre les enfants tant que l'initialisation n'est pas terminée
  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{
      currentUser,
      userData,
      isAdmin,
      isLoading,
      refreshUserData,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext; 