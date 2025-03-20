import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../firebase/auth';

interface PrivateRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ 
  children,
  requiredRole
}) => {
  const { currentUser, isAdmin, userData } = useAuth();

  // Vérifier si l'utilisateur est connecté
  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  // Si un rôle spécifique est requis, vérifier que l'utilisateur a ce rôle
  if (requiredRole) {
    // Pour les rôles administratifs, vérifier via isAdmin
    if (requiredRole === UserRole.ADMIN && !isAdmin) {
      return <Navigate to="/dashboard" />;
    }
    
    // Pour d'autres rôles éventuels, vérifier via userData.role
    if (userData && userData.role !== requiredRole) {
      return <Navigate to="/dashboard" />;
    }
  }

  return <>{children}</>;
};

export default PrivateRoute; 