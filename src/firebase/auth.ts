import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  sendPasswordResetEmail, 
  signOut, 
  updateProfile,
  User 
} from 'firebase/auth';
import { ref, set } from 'firebase/database';
import { auth, database } from './config';

// Type pour les informations utilisateur
export interface UserData {
  uid: string;
  displayName: string;
  email: string;
  createdAt: string;
}

// Fonction pour créer un compte utilisateur
export const registerUser = async (email: string, password: string, displayName: string): Promise<User> => {
  try {
    // Créer l'utilisateur avec email et mot de passe
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Mettre à jour le profil avec le nom d'affichage
    await updateProfile(user, { displayName });
    
    // Sauvegarder les informations utilisateur dans la Realtime Database
    const userData: UserData = {
      uid: user.uid,
      displayName: displayName,
      email: user.email || '',
      createdAt: new Date().toISOString()
    };
    
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

// Fonction pour obtenir l'erreur en français
export const getAuthErrorMessage = (errorCode: string): string => {
  switch (errorCode) {
    case 'auth/email-already-in-use':
      return 'Cette adresse email est déjà utilisée par un autre compte.';
    case 'auth/invalid-email':
      return 'L\'adresse email est invalide.';
    case 'auth/weak-password':
      return 'Le mot de passe est trop faible. Utilisez au moins 6 caractères.';
    case 'auth/user-not-found':
      return 'Aucun utilisateur trouvé avec cette adresse email.';
    case 'auth/wrong-password':
      return 'Mot de passe incorrect.';
    case 'auth/too-many-requests':
      return 'Trop de tentatives de connexion. Veuillez réessayer plus tard.';
    case 'auth/user-disabled':
      return 'Ce compte a été désactivé.';
    default:
      return 'Une erreur s\'est produite. Veuillez réessayer.';
  }
}; 