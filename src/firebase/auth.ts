import { 
  User,
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail,
  updateProfile,
  reauthenticateWithCredential,
  EmailAuthProvider,
  updatePassword,
  deleteUser
} from 'firebase/auth';
import { ref, set, update, get, remove } from 'firebase/database';
import { auth, database } from './config';

// Types pour les formations
export interface Formation {
  id: string;
  title: string;
  description: string;
  modules: Module[];
  createdAt: string;
  updatedAt?: string;
  imageUrl?: string;
  price?: number;
  published: boolean;
}

export interface Module {
  id: string;
  title: string;
  content: string;
  order: number;
}

export interface UserFormationProgress {
  formationId: string;
  completedModules: string[]; // IDs des modules complétés
  startedAt: string;
  lastAccessedAt: string;
  completed: boolean;
  completedAt?: string;
  certificateUrl?: string;
}

// Définition des rôles utilisateur
export enum UserRole {
  CLIENT = 'client',
  ADMIN = 'admin'
}

// Type pour les informations utilisateur
export interface UserData {
  uid: string;
  displayName: string;
  email: string;
  createdAt: string;
  updatedAt?: string;
  telegram?: string;
  role: UserRole;
  formationsProgress?: UserFormationProgress[];
}

// Fonction pour vérifier si un utilisateur est admin
export const checkUserIsAdmin = async (userId: string): Promise<boolean> => {
  try {
    const userRef = ref(database, `users/${userId}`);
    const snapshot = await get(userRef);
    const userData = snapshot.val();
    
    return userData?.role === UserRole.ADMIN;
  } catch (error) {
    console.error('Erreur lors de la vérification du rôle:', error);
    return false;
  }
};

// Fonction pour supprimer un compte utilisateur
export const deleteUserAccount = async (user: User, password: string): Promise<void> => {
  try {
    // Réauthentifier l'utilisateur
    const credential = EmailAuthProvider.credential(
      user.email || '',
      password
    );
    await reauthenticateWithCredential(user, credential);
    
    // Supprimer les données dans Realtime Database
    const userRef = ref(database, `users/${user.uid}`);
    await remove(userRef);
    
    // Supprimer le compte
    await deleteUser(user);
  } catch (error) {
    console.error('Erreur lors de la suppression du compte:', error);
    throw error;
  }
};

// Fonction pour mettre à jour le rôle d'un utilisateur (réservé aux admins)
export const updateUserRole = async (targetUserId: string, newRole: UserRole): Promise<void> => {
  // Vérifier si l'utilisateur existe avant de tenter de mettre à jour
  try {
    const userRef = ref(database, `users/${targetUserId}`);
    const snapshot = await get(userRef);
    
    if (!snapshot.exists()) {
      throw new Error('Utilisateur non trouvé');
    }
    
    // Mettre à jour dans Realtime Database
    await update(userRef, {
      role: newRole,
      updatedAt: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Erreur lors de la mise à jour du rôle:', error);
    throw error;
  }
};

// Fonction pour créer un compte utilisateur
export const registerUser = async (
  email: string, 
  password: string, 
  displayName: string,
  telegramUsername: string
): Promise<User> => {
  try {
    // Créer l'utilisateur avec Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Mettre à jour le profil
    await updateProfile(user, {
      displayName
    });
    
    // Stocker des informations supplémentaires
    const userData = {
      uid: user.uid,
      email,
      displayName,
      telegram: telegramUsername,
      role: UserRole.CLIENT, // Par défaut, tous les nouveaux utilisateurs sont des clients
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      formationsProgress: []
    };
    
    // Enregistrer dans Realtime Database
    await set(ref(database, `users/${user.uid}`), userData);
    
    return user;
  } catch (error) {
    throw error;
  }
};

// Fonction pour connecter un utilisateur
export const loginUser = async (email: string, password: string): Promise<User> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    throw error;
  }
};

// Fonction pour réinitialiser le mot de passe
export const resetPassword = async (email: string): Promise<void> => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    throw error;
  }
};

// Fonction pour déconnecter l'utilisateur
export const logoutUser = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error) {
    throw error;
  }
};

// Fonction pour mettre à jour le profil utilisateur
export const updateUserProfile = async (
  user: User, 
  displayName: string, 
  telegramUsername: string
): Promise<void> => {
  try {
    // Mettre à jour dans Firebase Auth
    await updateProfile(user, {
      displayName
    });
    
    try {
      // Mettre à jour dans Realtime Database
      const userRef = ref(database, `users/${user.uid}`);
      await update(userRef, {
        displayName,
        telegram: telegramUsername,
        updatedAt: new Date().toISOString()
      });
      
      console.log('Profil mis à jour avec succès');
    } catch (dbError) {
      // Si l'erreur est avec la base de données, on la propage
      console.error('Erreur lors de la mise à jour du profil dans la base de données:', dbError);
      throw dbError;
    }
  } catch (authError) {
    console.error('Erreur lors de la mise à jour du profil auth:', authError);
    throw authError;
  }
};

// Fonction pour changer le mot de passe
export const changeUserPassword = async (user: User, currentPassword: string, newPassword: string): Promise<void> => {
  try {
    const credential = EmailAuthProvider.credential(
      user.email || '',
      currentPassword
    );
    
    await reauthenticateWithCredential(user, credential);
    await updatePassword(user, newPassword);
  } catch (error) {
    throw error;
  }
};

// Fonction pour obtenir les données utilisateur depuis la Realtime Database
export const getUserData = async (userId: string): Promise<any> => {
  try {
    const userRef = ref(database, `users/${userId}`);
    const snapshot = await get(userRef);
    return snapshot.exists() ? snapshot.val() : null;
  } catch (error) {
    console.error('Erreur lors de la récupération des données utilisateur:', error);
    return null;
  }
};

// Fonction pour obtenir tous les utilisateurs (pour les admins)
export const getAllUsers = async (): Promise<any[]> => {
  try {
    const usersRef = ref(database, 'users');
    const snapshot = await get(usersRef);
    
    if (!snapshot.exists()) return [];
    
    const usersData = snapshot.val();
    return Object.values(usersData);
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error);
    return [];
  }
};

// Fonction pour obtenir l'erreur en français
export const getAuthErrorMessage = (errorCode: string): string => {
  switch (errorCode) {
    case 'auth/user-not-found':
      return 'Aucun compte trouvé avec cette adresse email.';
    case 'auth/wrong-password':
      return 'Mot de passe incorrect.';
    case 'auth/email-already-in-use':
      return 'Cette adresse email est déjà utilisée.';
    case 'auth/weak-password':
      return 'Le mot de passe est trop faible. Il doit contenir au moins 6 caractères.';
    case 'auth/invalid-email':
      return 'Format d\'email invalide.';
    case 'auth/user-disabled':
      return 'Ce compte a été désactivé.';
    case 'auth/requires-recent-login':
      return 'Cette opération nécessite une connexion récente. Veuillez vous reconnecter.';
    default:
      return 'Une erreur s\'est produite. Veuillez réessayer.';
  }
};

// Fonction pour assigner une formation à un utilisateur
export const assignFormationToUser = async (userId: string, formationId: string): Promise<void> => {
  try {
    // Récupérer les données utilisateur
    const userRef = ref(database, `users/${userId}`);
    const userSnapshot = await get(userRef);
    
    if (!userSnapshot.exists()) {
      throw new Error('Utilisateur non trouvé');
    }
    
    const userData = userSnapshot.val();
    let formationsProgress = userData.formationsProgress || [];
    
    // Vérifier si la formation est déjà assignée
    const existingProgress = formationsProgress.find((p: UserFormationProgress) => p.formationId === formationId);
    
    if (existingProgress) {
      // Si déjà assignée, ne rien faire
      return;
    }
    
    // Créer un nouvel enregistrement de progression
    const newProgress: UserFormationProgress = {
      formationId,
      completedModules: [],
      startedAt: new Date().toISOString(),
      lastAccessedAt: new Date().toISOString(),
      completed: false
    };
    
    // Ajouter à la liste des formations en cours
    formationsProgress.push(newProgress);
    
    // Mettre à jour dans la base de données
    await update(userRef, {
      formationsProgress,
      updatedAt: new Date().toISOString()
    });
    
    console.log(`Formation ${formationId} assignée à l'utilisateur ${userId}`);
  } catch (error) {
    console.error('Erreur lors de l\'assignation de la formation:', error);
    throw error;
  }
}; 