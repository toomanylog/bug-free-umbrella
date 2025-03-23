import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { onAuthStateChanged, User, signOut } from 'firebase/auth';
import { auth } from '../firebase/config';
import { getUserData, UserData, UserRole } from '../firebase/auth';
import { ref, onValue } from 'firebase/database';
import { database } from '../firebase/config';

interface AuthContextType {
  currentUser: User | null;
  userData: UserData | null;
  isAdmin: boolean;
  isLoading: boolean;
  refreshUserData: () => Promise<void>;
  logout: () => Promise<void>;
}

const defaultContextValue: AuthContextType = {
  currentUser: null,
  userData: null,
  isAdmin: false,
  isLoading: true,
  refreshUserData: async () => {},
  logout: async () => {}
};

const AuthContext = createContext<AuthContextType>(defaultContextValue);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    console.error("useAuth doit être utilisé à l'intérieur d'un AuthProvider");
    return defaultContextValue;
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [authInitialized, setAuthInitialized] = useState<boolean>(false);

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

  const handleAuthChange = useCallback((user: User | null) => {
    setCurrentUser(user);
    setIsLoading(true);
    
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
            setAuthInitialized(true);
          } catch (error) {
            console.error('Erreur lors du traitement des données utilisateur:', error);
            setIsLoading(false);
            setAuthInitialized(true);
          }
        }, (error) => {
          console.error('Erreur lors de la récupération des données utilisateur:', error);
          setIsLoading(false);
          setAuthInitialized(true);
        });
      } catch (error) {
        console.error('Erreur lors de la création de la référence utilisateur:', error);
        setIsLoading(false);
        setAuthInitialized(true);
      }
    } else {
      setUserData(null);
      setIsAdmin(false);
      setIsLoading(false);
      setAuthInitialized(true);
    }
  }, []);

  useEffect(() => {
    try {
      const unsubscribe = onAuthStateChanged(auth, handleAuthChange, (error) => {
        console.error('Erreur lors de la surveillance de l\'état d\'authentification:', error);
        setIsLoading(false);
        setAuthInitialized(true);
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
      setAuthInitialized(true);
    }
  }, [handleAuthChange]);

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      throw error;
    }
  };

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
      {authInitialized ? children : (
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}
    </AuthContext.Provider>
  );
}; 