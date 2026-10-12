# MboaTour — Application web frontend

MboaTour est une application web de découverte des sites touristiques du Cameroun. Elle permet aux visiteurs d'explorer les destinations et aux utilisateurs de consulter les détails des sites, de gérer leurs favoris et de publier des avis. Le projet comprend également des interfaces de gestion.

## Dépôts du projet

MboaTour est organisé en deux dépôts GitHub distincts :

- **Frontend (ce dépôt)** : interface Vue 3 — [MboaTour-Frontend](https://github.com/Cs7Awoumoujoseph/MboaTour-Frontend)
- **Backend** : API REST Java/Spring Boot — [MboaTour Backend](https://github.com/Cs7Awoumoujoseph/MboaTour)

Le frontend communique avec le backend via HTTP et Axios. Consultez le README du [backend](https://github.com/Cs7Awoumoujoseph/MboaTour#readme) pour sa configuration et son démarrage.

## Fonctionnalités principales

- Exploration et recherche de sites touristiques.
- Consultation des fiches détaillées des sites.
- Filtrage par catégorie et région, avec options de tri et de pagination.
- Gestion des avis et commentaires.
- Gestion des favoris et du profil utilisateur.
- Interfaces d'administration pour la gestion des sites et de leur publication.
- Pages d'accueil, d'exploration, de contact, de FAQ et de présentation.

> Les fonctionnalités accessibles dépendent des routes API disponibles, des règles d'accès et de la configuration du backend.

## Technologies

- [Vue 3](https://vuejs.org/) avec les composants Single-File Components et `<script setup>`
- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vite.dev/) pour le serveur de développement et la compilation
- [Vue Router](https://router.vuejs.org/) pour la navigation
- [Axios](https://axios-http.com/) pour les appels HTTP
- [Tailwind CSS 4](https://tailwindcss.com/) avec le plugin Vite

## Prérequis

- Node.js compatible avec la version de Vite utilisée par le projet
- npm
- Git
- Le [backend MboaTour](https://github.com/Cs7Awoumoujoseph/MboaTour) et une base PostgreSQL pour utiliser les fonctionnalités connectées à l'API

Vérifiez les versions installées :

```bash
node --version
npm --version
```

## Installation et démarrage

Clonez le dépôt, puis installez les dépendances :

```bash
git clone https://github.com/Cs7Awoumoujoseph/MboaTour-Frontend.git
cd MboaTour-Frontend
npm install
npm run dev
```

Vite affiche dans le terminal l'adresse locale à ouvrir dans le navigateur (généralement `http://localhost:5173`).

## Commandes disponibles

| Commande | Rôle |
|---|---|
| `npm run dev` | Démarre le serveur de développement |
| `npm run build` | Vérifie les types TypeScript et génère la version de production |
| `npm run preview` | Sert localement la version compilée pour vérification |

Pour générer et vérifier le build :

```bash
npm run build
npm run preview
```

## Organisation du code

```text
src/
├── api/          # Client Axios et fonctions d'accès à l'API
├── assets/       # Ressources statiques et icônes
├── components/   # Composants réutilisables (authentification, layout, utilisateur)
├── composables/  # Logique réutilisable (auth, favoris, avis, sites, utilisateurs)
├── router/       # Configuration des routes Vue Router
├── types/        # Types TypeScript partagés
├── views/        # Pages publiques et interfaces d'administration
├── App.vue       # Composant racine
├── main.ts       # Point d'entrée
└── style.css     # Styles globaux
```

## Connexion au backend

Le client HTTP est défini dans [`src/api/axios.ts`](https://github.com/Cs7Awoumoujoseph/MboaTour-Frontend/blob/main/src/api/axios.ts). Actuellement, son URL de base est :

```text
http://localhost:8080/mboa
```

Le préfixe `/mboa` correspond au contexte configuré dans le backend Spring Boot. Les fonctions d'accès à l'API se trouvent notamment dans `src/api/siteApi.ts`, `src/api/regionApi.ts` et `src/api/categorieApi.ts`.

### Démarrer le backend

Dans un autre terminal, suivez les instructions du [README du backend](https://github.com/Cs7Awoumoujoseph/MboaTour#installation-et-demarrage) (ou ouvrez directement le dépôt si cette section a changé). Le backend utilise PostgreSQL et écoute localement sur le port 8080 par défaut.

### En production

L'adresse `localhost` ne fonctionne que sur la machine de l'utilisateur qui ouvre le navigateur. Avant de déployer le frontend :

1. Remplacez l'URL locale par l'URL publique HTTPS du backend.
2. Configurez le backend pour autoriser l'origine exacte du frontend dans sa politique CORS.
3. Configurez les secrets et les paramètres de base de données sur l'hébergeur backend, jamais dans le dépôt frontend.
4. Vérifiez que les routes, l'authentification et le chargement des images fonctionnent depuis le domaine déployé.

## Contribution

1. Créez une branche pour votre modification.
2. Gardez les appels HTTP dans `src/api/` et la logique réutilisable dans `src/composables/` lorsque cela convient.
3. Lancez `npm run build` avant de proposer une modification.
4. Ouvrez une pull request en décrivant les changements.

## Dépôts associés

- Interface web : https://github.com/Cs7Awoumoujoseph/MboaTour-Frontend
- API backend : https://github.com/Cs7Awoumoujoseph/MboaTour
