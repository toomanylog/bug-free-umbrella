import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  sendPasswordResetEmail, 
  signOut, 
  updateProfile,
  User,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword
} from 'firebase/auth';
import { ref, set } from 'firebase/database';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, database, firestore } from './config';

// Type pour les informations utilisateur
export interface UserData {
  uid: string;
  displayName: string;
  email: string;
  createdAt: string;
  telegram?: string;
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
    
    // Créer aussi un document dans Firestore
    await setDoc(doc(firestore, 'users', user.uid), userData);
    
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
export const updateUserProfile = async (user: User, displayName: string, telegramUsername: string): Promise<void> => {
  try {
    // Mettre à jour le nom d'affichage directement dans Auth
    await updateProfile(user, { displayName });
    
    // Récupérer d'abord les données utilisateur existantes
    const userRef = ref(database, `users/${user.uid}`);
    const userSnapshot = await new Promise<any>((resolve, reject) => {
      import('firebase/database').then(({ get }) => {
        get(userRef).then(resolve).catch(reject);
      });
    });
    
    // Mettre à jour uniquement les champs nécessaires sans créer de sous-objet
    await set(userRef, {
      ...(userSnapshot.exists() ? userSnapshot.val() : {}),
      displayName,
      telegram: telegramUsername,
      updatedAt: new Date().toISOString()
    });
    
    console.log('Profil mis à jour avec succès');
  } catch (error) {
    console.error('Erreur lors de la mise à jour du profil:', error);
    throw error;
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
export const getUserData = async (userId: string): Promise<UserData | null> => {
  try {
    // Utiliser Realtime Database au lieu de Firestore
    const userSnapshot = await new Promise<any>((resolve, reject) => {
      const userRef = ref(database, `users/${userId}`);
      // Créer un gestionnaire d'événements pour lire une fois les données
      import('firebase/database').then(({ get, child }) => {
        get(userRef).then(resolve).catch(reject);
      });
    });
    
    if (userSnapshot.exists()) {
      return userSnapshot.val() as UserData;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des données utilisateur:', error);
    return null;
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