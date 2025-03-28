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
import { getAuth } from 'firebase/auth';

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
  certificationId?: string; // ID de la certification associée
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
    console.log('Tentative de récupération des utilisateurs...');
    
    // Vérifier d'abord l'accès avec le rôle actuel
    const auth = getAuth();
    const currentUser = auth.currentUser;
    
    if (!currentUser) {
      console.error('Erreur lors de la récupération des utilisateurs: Aucun utilisateur connecté');
      return [];
    }
    
    // Vérifier si l'utilisateur est admin
    const userDataRef = ref(database, `users/${currentUser.uid}`);
    const userDataSnapshot = await get(userDataRef);
    const userData = userDataSnapshot.val();
    
    if (!userData || userData.role !== UserRole.ADMIN) {
      console.error("Erreur lors de la récupération des utilisateurs: L'utilisateur n'est pas administrateur");
      return [];
    }
    
    // Récupérer tous les utilisateurs
    const usersRef = ref(database, 'users');
    const snapshot = await get(usersRef);
    
    if (!snapshot.exists()) {
      console.log('Aucun utilisateur trouvé dans la base de données.');
      return [];
    }
    
    console.log('Utilisateurs récupérés avec succès');
    const usersData = snapshot.val();
    return Object.entries(usersData).map(([uid, data]) => ({
      uid,
      ...data as any
    }));
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error);
    
    // Remonter l'erreur pour un meilleur debugging
    throw error;
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

// Fonction pour retirer une formation assignée à un utilisateur
export const removeFormationFromUser = async (userId: string, formationId: string): Promise<void> => {
  try {
    // Récupérer les données utilisateur
    const userRef = ref(database, `users/${userId}`);
    const userSnapshot = await get(userRef);
    
    if (!userSnapshot.exists()) {
      throw new Error('Utilisateur non trouvé');
    }
    
    const userData = userSnapshot.val();
    const formationsProgress = userData.formationsProgress || [];
    
    // Filtrer pour retirer la formation
    const updatedFormationsProgress = formationsProgress.filter(
      (progress: UserFormationProgress) => progress.formationId !== formationId
    );
    
    // Si aucun changement n'est nécessaire, terminer
    if (updatedFormationsProgress.length === formationsProgress.length) {
      return;
    }
    
    // Mettre à jour dans la base de données
    await update(userRef, {
      formationsProgress: updatedFormationsProgress,
      updatedAt: new Date().toISOString()
    });
    
    console.log(`Formation ${formationId} retirée de l'utilisateur ${userId}`);
  } catch (error) {
    console.error('Erreur lors du retrait de la formation:', error);
    throw error;
  }
};

// Mettre à jour la progression d'un utilisateur pour une formation spécifique
export const updateFormationProgress = async (userId: string, formationId: string, moduleId: string): Promise<void> => {
  try {
    const userRef = ref(database, `users/${userId}`);
    const userSnapshot = await get(userRef);
    
    if (!userSnapshot.exists()) {
      throw new Error(`Utilisateur avec l'ID ${userId} non trouvé`);
    }
    
    const userData = userSnapshot.val();
    let formationsProgress = userData.formationsProgress || [];
    
    // Rechercher si la formation existe déjà dans la progression de l'utilisateur
    let formationProgress = formationsProgress.find(
      (progress: UserFormationProgress) => progress.formationId === formationId
    );
    
    if (!formationProgress) {
      // Si la formation n'existe pas encore dans la progression, créer un nouvel enregistrement
      formationProgress = {
        formationId,
        completedModules: [],
        startedAt: new Date().toISOString(),
        lastAccessedAt: new Date().toISOString(),
        completed: false
      };
      formationsProgress.push(formationProgress);
    }
    
    // S'assurer que completedModules existe
    if (!formationProgress.completedModules) {
      formationProgress.completedModules = [];
    }
    
    // Vérifier si le module est déjà complété
    if (!formationProgress.completedModules.includes(moduleId)) {
      formationProgress.completedModules.push(moduleId);
      formationProgress.lastAccessedAt = new Date().toISOString();
      
      // Récupérer les informations de la formation pour vérifier si tous les modules sont complétés
      const formationRef = ref(database, `formations/${formationId}`);
      const formationSnapshot = await get(formationRef);
      
      if (formationSnapshot.exists()) {
        const formationData = formationSnapshot.val();
        const totalModules = formationData.modules ? Object.keys(formationData.modules).length : 0;
        
        // Marquer la formation comme complétée si tous les modules sont terminés
        if (formationProgress.completedModules.length >= totalModules) {
          formationProgress.completed = true;
          formationProgress.completedAt = new Date().toISOString();
        }
      }
    }
    
    // Mettre à jour dans la base de données
    await update(userRef, {
      formationsProgress,
      updatedAt: new Date().toISOString()
    });
    
    console.log(`Progression mise à jour pour la formation ${formationId}, module ${moduleId}`);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la progression:', error);
    throw error;
  }
};

/**
 * Attribue un outil à un utilisateur
 * @param userId ID de l'utilisateur
 * @param toolId ID de l'outil
 */
export const assignToolToUser = async (userId: string, toolId: string): Promise<void> => {
  try {
    // Vérifier si l'utilisateur existe
    const userRef = ref(database, `users/${userId}`);
    const userSnapshot = await get(userRef);
    
    if (!userSnapshot.exists()) {
      throw new Error(`L'utilisateur avec l'ID ${userId} n'existe pas`);
    }

    // Créer ou mettre à jour la liste des outils de l'utilisateur
    const userToolsRef = ref(database, `users/${userId}/tools/${toolId}`);
    await set(userToolsRef, true);
    
    // Ajouter un timestamp d'attribution
    const userToolTimestampRef = ref(database, `users/${userId}/toolsTimestamps/${toolId}`);
    await set(userToolTimestampRef, new Date().toISOString());
    
    console.log(`Outil ${toolId} attribué avec succès à l'utilisateur ${userId}`);
  } catch (error) {
    console.error('Erreur lors de l\'attribution de l\'outil:', error);
    throw error;
  }
}; 