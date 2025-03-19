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
