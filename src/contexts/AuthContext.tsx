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

// Créer une valeur par défaut pour le contexte
const defaultContextValue: AuthContextType = {
  currentUser: null,
  userData: null,
  isAdmin: false,
  isLoading: true,
  refreshUserData: async () => {},
  logout: async () => {}
};

// Créer le contexte avec la valeur par défaut
const AuthContext = createContext<AuthContextType>(defaultContextValue);

// Hook personnalisé pour utiliser le contexte d'authentification
export const useAuth = () => {
  return useContext(AuthContext) || defaultContextValue;
};

// Props du provider
interface AuthProviderProps {
  children: ReactNode;
}

// Provider du contexte d'authentification
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

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
                  console.log('Données utilisateur chargées:', data);
                  console.log('Rôle utilisateur:', data.role);
                  setUserData(data);
                  setIsAdmin(data?.role === UserRole.ADMIN);
                }
                setIsLoading(false);
              } catch (error) {
                console.error('Erreur lors du traitement des données utilisateur:', error);
                setIsLoading(false);
              }
            }, (error) => {
              console.error('Erreur lors de la récupération des données utilisateur:', error);
              setIsLoading(false);
            });
          } catch (error) {
            console.error('Erreur lors de la création de la référence utilisateur:', error);
            setIsLoading(false);
          }
        } else {
          setUserData(null);
          setIsAdmin(false);
          setIsLoading(false);
        }
      }, (error) => {
        console.error('Erreur lors de la surveillance de l\'état d\'authentification:', error);
        setIsLoading(false);
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
    }
  }, []);

  // Fonction de déconnexion
  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      throw error;
    }
  };

  // Valeur du contexte à fournir
  const value: AuthContextType = {
    currentUser,
    userData,
    isAdmin,
    isLoading,
    refreshUserData,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
}; 