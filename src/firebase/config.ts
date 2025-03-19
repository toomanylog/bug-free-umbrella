import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

// Utilisation directe des valeurs pour le développement local
// En production, utilisez toujours process.env.REACT_APP_*
const firebaseConfig = {
  apiKey: "AIzaSyA9eM2EjtwQW3QzsTyBe_HtVPA3ve5Ci7A",
  authDomain: "chezmisalinux.firebaseapp.com",
  projectId: "chezmisalinux",
  storageBucket: "chezmisalinux.firebasestorage.app",
  messagingSenderId: "193080356622",
  appId: "1:193080356622:web:7b3b191d74ca15723d315f",
  measurementId: "G-JCDV5LY77L",
  databaseURL: "https://chezmisalinux-default-rtdb.europe-west1.firebasedatabase.app"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);
const firestore = getFirestore(app);

// Si en développement, utilisez l'émulateur Firebase 
// (à enlever en production)
if (window.location.hostname === 'localhost') {
  console.log('Using Firestore and Auth emulators for local development');
  // Configurez l'émulateur Firestore si nécessaire
  // connectFirestoreEmulator(firestore, 'localhost', 8080);
}

export { app, auth, database, firestore }; 