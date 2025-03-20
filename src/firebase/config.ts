import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getDatabase, connectDatabaseEmulator } from 'firebase/database';
import { getFirestore, connectFirestoreEmulator, initializeFirestore, CACHE_SIZE_UNLIMITED } from 'firebase/firestore';

// Chargement de configuration avec valeurs de secours pour éviter les erreurs
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
  databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL
};

// Paramètres pour gérer les nouvelles tentatives de connexion Firebase
const connectWithRetry = () => {
  try {
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const database = getDatabase(app);
    
    // Utiliser initializeFirestore au lieu de getFirestore pour définir la configuration
    const firestore = initializeFirestore(app, {
      ignoreUndefinedProperties: true,
      cacheSizeBytes: 50 * 1024 * 1024, // 50 MB cache
    });
    
    // Si en développement, utilisez l'émulateur Firebase
    if (window.location.hostname === 'localhost') {
      console.log('Using Firestore and Auth emulators for local development');
      try {
        connectAuthEmulator(auth, 'http://localhost:9099');
        connectDatabaseEmulator(database, 'localhost', 9000);
        connectFirestoreEmulator(firestore, 'localhost', 8080);
      } catch (e) {
        console.warn("Erreur lors de la connexion aux émulateurs:", e);
      }
    }
    
    return { app, auth, database, firestore };
  } catch (e) {
    console.error("Erreur de configuration Firebase:", e);
    throw e;
  }
};

// Initialiser Firebase avec gestion des erreurs
const { app, auth, database, firestore } = connectWithRetry();

export { app, auth, database, firestore }; 