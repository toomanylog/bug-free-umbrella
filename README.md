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
