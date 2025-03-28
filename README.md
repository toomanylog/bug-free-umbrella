# Misa Linux - Site de Formations

Site web pour Misa Linux, une plateforme de formations spécialisées.

## Technologies utilisées

- React
- TypeScript
- TailwindCSS

## Installation

```bash
# Cloner le dépôt
git clone [url-du-repo]

# Installer les dépendances
npm install

# Lancer le serveur de développement
npm start
```

## Déploiement

Le site est configuré pour être déployé sur Netlify.

```bash
# Construire le site pour la production
npm run build

# Déployer sur Netlify (si vous avez l'CLI Netlify installé)
npm run deploy
```

## Structure du projet

- `src/components/` - Composants React
- `public/` - Fichiers statiques

## Fonctionnalités

- Page d'accueil moderne avec animations
- Section de services
- Section des formations
- Modal de connexion/inscription
- Formulaire de contact
- Design responsive

## Variables d'environnement

Pour des raisons de sécurité, les identifiants Firebase sont stockés dans un fichier `.env` qui n'est pas inclus dans le dépôt Git. Pour configurer l'application, vous devez créer ce fichier à la racine du projet en utilisant le fichier `.env.example` comme modèle.

```bash
# Copier le fichier d'exemple
cp .env.example .env

# Éditer le fichier avec vos identifiants
# REACT_APP_FIREBASE_API_KEY="votre-api-key"
# etc.
```

Consultez le fichier [AUTH_README.md](./AUTH_README.md) pour plus de détails sur le système d'authentification.

# NOWPayments Integration

Ce projet intègre l'API de paiement en cryptomonnaie NOWPayments pour permettre aux utilisateurs de recharger leur compte et d'acheter des formations, des outils et d'autres produits.

## Configuration

1. Copiez le fichier `.env.example` en `.env` et remplissez les variables d'environnement:
```bash
cp .env.example .env
```

2. Configurez votre projet Firebase:
```bash
# Installation des dépendances
npm install

# Connexion à Firebase
firebase login

# Initialisation du projet (si ce n'est pas déjà fait)
firebase init
```

3. Configuration de NOWPayments:
   - Créez un compte sur [NOWPayments](https://nowpayments.io/)
   - Obtenez votre clé API et configurez-la dans le fichier `.env`
   - Configurez la clé IPN secrète dans votre tableau de bord NOWPayments et ajoutez-la dans le fichier `.env`

## Développement

Exécutez l'application en mode développement:
```bash
npm start
```

## Gestion des paiements sans Firebase Functions

Comme l'utilisation de Firebase Functions n'est pas possible sans le plan Pay-as-you-go, une solution alternative a été mise en place :

1. Le système intègre maintenant une vérification manuelle et automatique des paiements depuis le côté client
2. Les utilisateurs peuvent vérifier manuellement le statut de leurs paiements en cliquant sur le bouton "Vérifier l'état du paiement" dans le détail de leur transaction
3. Une option de vérification automatique est disponible pour les transactions en attente (toutes les 30 secondes)

Cette approche présente quelques limitations :
- La vérification ne se fait que lorsque l'utilisateur est présent sur le site
- La clé API est exposée côté client (bien que masquée dans les variables d'environnement)
- NOWPayments limite le nombre de requêtes API selon votre plan

Pour une application en production, il est recommandé d'utiliser :
- Un serveur backend séparé pour les webhooks (Netlify Functions, Vercel Functions, etc.)
- Ou de passer à Firebase Pay-as-you-go pour utiliser les Firebase Functions

## Structure du projet

- `src/firebase/services/nowpayments.ts`: Service pour interagir avec l'API NOWPayments
- `src/firebase/functions/`: Fonctions Cloud Firebase (non utilisées actuellement)
- `src/components/WalletComponent.tsx`: Composant de portefeuille pour la gestion des fonds

## Licence

MIT

## Configuration des variables d'environnement

### Configuration locale
Pour le développement local, créez un fichier `.env` à la racine du projet et ajoutez votre clé API Riot Games :

```
REACT_APP_RIOT_API_KEY=votre-clé-api-ici
```

Un fichier `.env.example` est fourni comme modèle pour les variables d'environnement nécessaires.

### Configuration en production (Netlify)
Pour déployer sur Netlify, configurez les variables d'environnement via l'interface de Netlify :

1. Accédez au tableau de bord de votre site Netlify
2. Allez dans **Site settings** > **Build & deploy** > **Environment**
3. Cliquez sur **Edit variables** puis **Add variable**
4. Ajoutez la variable `REACT_APP_RIOT_API_KEY` avec votre clé API Riot Games
5. Cliquez sur **Save**

⚠️ **Important** : Netlify ne lit pas automatiquement les fichiers `.env` lors du build. Les variables doivent être configurées directement dans les paramètres de l'environnement Netlify.

## Intégration avec l'API Riot Games

L'application utilise l'API Riot Games pour récupérer les données des comptes Valorant. Voici comment cela fonctionne :

### Méthode actuelle

Notre implémentation actuelle utilise l'API REST de Riot Games avec une clé API de développement. Cette méthode :

1. Permet d'ajouter des comptes Valorant en spécifiant le nom d'utilisateur et le tag
2. Connecte le compte via l'API Riot pour récupérer le PUUID (identifiant unique du joueur)
3. Récupère les données de rang et les statistiques du joueur
4. Stocke ces informations dans notre base de données

Les données sont récupérées directement depuis notre serveur avec la clé API, sans nécessiter d'authentification de l'utilisateur sur son compte Riot.

### Limites de l'approche actuelle

- La clé API de développement a des limites de taux de requêtes (20 requêtes/sec)
- Pas d'accès à certaines données privées du joueur
- Impossible d'effectuer des actions au nom du joueur

### Alternative : Authentification OAuth

Pour une intégration plus complète comme celle utilisée par Tracker.gg, il faudrait :

1. S'inscrire au programme de développement Riot
2. Créer une application enregistrée avec OAuth
3. Implémenter le flux d'autorisation OAuth où l'utilisateur se connecte à son compte Riot
4. Utiliser le jeton d'accès obtenu pour accéder aux données avec plus de permissions

Cette méthode nécessite une approbation de Riot Games pour une utilisation en production.

### Configuration

Pour utiliser l'API Riot, assurez-vous de configurer votre clé API dans les variables d'environnement :

```
REACT_APP_RIOT_API_KEY=votre-clé-api
```

Vous pouvez obtenir une clé API de développement sur le [Portail Développeur Riot Games](https://developer.riotgames.com/).

## Authentification OAuth avec Riot Games

Pour une intégration complète avec Riot Games en utilisant OAuth, suivez ces étapes :

1. Créez un compte développeur sur [Riot Developer Portal](https://developer.riotgames.com/)
2. Enregistrez une nouvelle application avec les informations suivantes :
   - Nom de l'application : Votre nom d'application
   - Type d'application : Web
   - URL de redirection : `https://misalinux.ru/auth/riot/callback`
   - Droits d'API : Selon vos besoins (MMR, Match History, etc.)

3. Vérifiez votre domaine en plaçant le fichier `riot.txt` à la racine de votre site. 
   Ce fichier est déjà présent dans le dossier `public/` de ce projet.

4. Une fois approuvé, remplacez les valeurs de configuration OAuth dans le fichier `RiotManager.tsx`:
   ```typescript
   const oauthConfig = {
     clientId: "votre-client-id",  // Remplacer par votre vrai Client ID
     redirectUri: window.location.origin + "/auth/riot/callback",
     scope: "openid offline_access",
     authUrl: "https://auth.riotgames.com/authorize"
   };
   ```

5. Implémentez la route de callback dans votre application pour recevoir et traiter le code d'autorisation.

Note: L'approbation complète pour l'API de production peut prendre du temps et nécessite une évaluation par Riot Games.
