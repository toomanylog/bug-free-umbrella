# Configuration du Système d'Authentification Firebase

Ce projet utilise Firebase Authentication et Realtime Database pour gérer l'authentification des utilisateurs.

## Variables d'environnement

Les identifiants Firebase sont stockés dans un fichier `.env` qui n'est pas inclus dans le dépôt Git pour des raisons de sécurité. Pour configurer l'application, vous devez créer ce fichier à la racine du projet avec les variables suivantes :

```
REACT_APP_FIREBASE_API_KEY="votre-api-key"
REACT_APP_FIREBASE_AUTH_DOMAIN="votre-auth-domain"
REACT_APP_FIREBASE_PROJECT_ID="votre-project-id"
REACT_APP_FIREBASE_STORAGE_BUCKET="votre-storage-bucket"
REACT_APP_FIREBASE_MESSAGING_SENDER_ID="votre-messaging-sender-id"
REACT_APP_FIREBASE_APP_ID="votre-app-id"
REACT_APP_FIREBASE_MEASUREMENT_ID="votre-measurement-id"
REACT_APP_FIREBASE_DATABASE_URL="votre-database-url"
```

Un fichier `.env.example` est fourni comme modèle.

## Fonctionnalités implémentées

- Authentification par email et mot de passe
- Création de compte utilisateur
- Réinitialisation de mot de passe
- Stockage des données utilisateur dans Realtime Database

## Configuration Firebase

Le projet utilise les variables d'environnement pour configurer Firebase :

```javascript
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
```

## Règles de Sécurité Firebase

Les règles de sécurité pour la Realtime Database sont définies dans le fichier `firebase_rules.json`. Ces règles permettent aux utilisateurs authentifiés d'accéder uniquement à leurs propres données.

Pour mettre à jour les règles dans la console Firebase :

1. Accédez à la [console Firebase](https://console.firebase.google.com/)
2. Sélectionnez le projet "chezmisalinux"
3. Dans le menu de gauche, cliquez sur "Realtime Database"
4. Allez dans l'onglet "Règles"
5. Copiez et collez le contenu du fichier `firebase_rules.json`
6. Cliquez sur "Publier"

## Structure des Données

La structure des données utilisateur dans la Realtime Database est la suivante :

```
/users
  /userId
    displayName: "Nom de l'utilisateur"
    email: "email@example.com"
    uid: "userId"
    createdAt: "2023-01-01T00:00:00.000Z"
```

## Utilisation dans l'Application

### Connexion

```jsx
import { loginUser } from '../firebase/auth';

// Dans un composant React
const handleLogin = async (email, password) => {
  try {
    const user = await loginUser(email, password);
    console.log('Utilisateur connecté:', user);
  } catch (error) {
    console.error('Erreur de connexion:', error);
  }
};
```

### Création de Compte

```jsx
import { registerUser } from '../firebase/auth';

// Dans un composant React
const handleRegister = async (email, password, displayName) => {
  try {
    const user = await registerUser(email, password, displayName);
    console.log('Compte créé:', user);
  } catch (error) {
    console.error('Erreur de création de compte:', error);
  }
};
```

### Réinitialisation du Mot de Passe

```jsx
import { resetPassword } from '../firebase/auth';

// Dans un composant React
const handlePasswordReset = async (email) => {
  try {
    await resetPassword(email);
    console.log('Email de réinitialisation envoyé');
  } catch (error) {
    console.error('Erreur lors de la réinitialisation:', error);
  }
};
```

### Déconnexion

```jsx
import { logoutUser } from '../firebase/auth';

// Dans un composant React
const handleLogout = async () => {
  try {
    await logoutUser();
    console.log('Utilisateur déconnecté');
  } catch (error) {
    console.error('Erreur lors de la déconnexion:', error);
  }
};
```

### Accéder à l'Utilisateur Connecté

```jsx
import { useAuth } from '../contexts/AuthContext';

// Dans un composant React
const MyComponent = () => {
  const { currentUser } = useAuth();
  
  if (currentUser) {
    console.log('Utilisateur connecté:', currentUser.displayName);
    return <p>Bonjour, {currentUser.displayName}!</p>;
  }
  
  return <p>Veuillez vous connecter</p>;
};
```

## Personnalisation

Vous pouvez personnaliser davantage le système d'authentification en modifiant les fichiers suivants :

- `src/firebase/auth.ts` - Fonctions d'authentification
- `src/contexts/AuthContext.tsx` - Contexte d'authentification React
- `src/components/AuthForms.tsx` - Formulaires d'authentification 