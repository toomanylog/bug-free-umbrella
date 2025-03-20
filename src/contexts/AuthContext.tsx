import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
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
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  userData: null,
  isAdmin: false,
  isLoading: true,
  refreshUserData: async () => {}
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth doit être utilisé à l\'intérieur d\'un AuthProvider');
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
      const userRef = ref(database, `users/${user.uid}`);
      
      onValue(userRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          console.log('Données utilisateur chargées:', data);
          console.log('Rôle utilisateur:', data.role);
          setUserData(data);
          setIsAdmin(data?.role === UserRole.ADMIN);
        }
        setIsLoading(false);
      });
    } else {
      setUserData(null);
      setIsAdmin(false);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, handleAuthChange);

    return unsubscribe;
  }, [handleAuthChange]);

  const value = {
    currentUser,
    userData,
    isAdmin,
    isLoading,
    refreshUserData
  };

  return (
    <AuthContext.Provider value={value}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
}; 