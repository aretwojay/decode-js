# Documentation technique

Architecture, choix techniques et fonctionnement interne du projet. Voir la [documentation fonctionnelle](documentation-fonctionnelle.md) pour la description côté utilisateur, et le [cahier des charges initial](cahier-des-charges-initial.md) pour la justification des choix technologiques.

## 1. Vue d'ensemble de l'architecture

```
Visiteur ──HTTP──▶ Nginx ──┬──/api/*, /uploads/* ──▶ Strapi (API REST)
                            └──/*.html,.js,.css ────▶ Fichiers statiques (frontend/)
```

- Le **frontend** est une Single Page Application en JavaScript natif, sans framework ni bundler. Nginx sert les fichiers statiquement et réécrit les routes internes vers `index.html` pour laisser le routeur côté client prendre le relais.
- Le **backend** est une instance Strapi 5 exposant une API REST, avec une base de données SQLite.
- Les deux services tournent dans des conteneurs Docker séparés, orchestrés par `docker-compose.yml`.

## 2. Frontend — Vanilla-Engine

### 2.1 Moteur de rendu

Pas de JSX ni de virtual DOM : chaque page/composant retourne un objet JavaScript simple décrivant sa structure :

```js
{
  type: "div",
  attributes: [["class", ["ma-classe"]]],
  events: [["click", handler]],
  children: [ /* sous-structures ou chaînes de texte */ ],
}
```

`lib/generate-structure.js` transforme récursivement cet objet en éléments DOM réels (`document.createElement`, attributs, écouteurs d'événements).

### 2.2 Routage (`lib`, `components/router/`)

- `BrowserRouter` (dans `components/router/browser-router.js`) écoute les événements `popstate` et `pushstate`, résout la route courante via `matchRoute()` (support des paramètres dynamiques `:slug`), puis appelle le générateur de page correspondant (fonction async retournant une structure).
- La navigation interne se fait via `history.pushState()` + un événement `pushstate` personnalisé, sans rechargement de page.
- Après chaque navigation (hors premier chargement), le focus clavier est déplacé sur le contenu principal (`<main>`) pour l'accessibilité, sans casser la tabulation naturelle au chargement initial de la page.

### 2.3 State management (`lib/create-state.js`, `lib/store.js`, `lib/reactive.js`)

- `createState(valeurInitiale)` fournit un état observable minimal (`get`, `set`, `subscribe`).
- `reactive(state, renderFn)` reconstruit automatiquement une portion du DOM quand l'état change, sans re-render de toute la page.
- `store.js` centralise un état applicatif partagé (profil courant, thème, projets en cache) utilisé notamment pour le mode hors-ligne dégradé.

### 2.4 Système de thèmes (`lib/theme.js`, `themes/*.css`)

- Le thème actif est stocké dans `localStorage` et exposé via `getTheme()` / `setTheme()`.
- Chaque changement de thème charge dynamiquement la feuille de style correspondante (`themes/iris.css`, `yaniss.css`, `ruben.css`) et déclenche un re-rendu complet de la page courante.
- Les appels API sont systématiquement filtrés par thème (`fetchProfile({ theme })`, `fetchProjects({ theme })`, etc.) pour garantir l'isolation des données entre les 3 portfolios.

### 2.5 Authentification (`lib/auth.js`)

- Authentification via l'API `users-permissions` native de Strapi (`/api/auth/local`, `/api/auth/local/register`).
- Le jeton JWT est stocké en `localStorage` et attaché aux requêtes authentifiées via un en-tête `Authorization: Bearer`.
- Pas de flux de rafraîchissement de jeton : configuration JWT classique à durée de vie longue (30 jours), volontairement choisie après un premier essai avec des jetons courts + cookie de session qui expiraient en cours de formulaire sans mécanisme de renouvellement côté client.

### 2.6 Client API (`lib/api.js`)

- Résout dynamiquement l'URL de l'API Strapi selon l'environnement (développement local vs production via le reverse-proxy Nginx, évitant le CORS en production grâce au même-origine).
- Normalise les réponses Strapi 5 (aplatissement des relations, gestion des médias, conversion des blocs de texte enrichi en texte brut pour l'affichage).
- Fonctions `fetchMy*()` (authentifiées, retournent uniquement les données du profil connecté) vs fonctions publiques `fetch*()` (lecture seule, filtrables par thème/statut).

### 2.7 Organisation des pages et composants

- `pages/` : un fichier par route, orchestre la récupération des données et compose les sections.
- `components/` : éléments transverses (en-tête, pied de page, bandeau cookies, notifications toast, sélecteur de thème).
- `utils/admin/` : formulaires et listes CRUD de l'espace d'administration (un fichier par type de contenu : profil, projets, expériences, compétences, services).

## 3. Backend — Strapi 5

### 3.1 Content-types

| Content-type | Relation | Champs clés |
|---|---|---|
| `profil` | 1 par utilisateur (`owner`) | nom, titre, biographie, coordonnées, réseaux, thème, statut |
| `projet` | N–1 vers `profil` | titre, description, technologies, liens, image, en_vedette |
| `competence` | N–1 vers `profil` | titre, niveau, icône |
| `experience` | N–1 vers `profil` | titre, entreprise, dates, description |
| `formation` | N–1 vers `profil` | établissement, diplôme, dates |
| `service` | N–1 vers `profil` | titre, description, icône, ordre |
| `message` | indépendant | nom, email, sujet, contenu (formulaire de contact) |

Tous les content-types (hors `message`) utilisent le **Draft & Publish** de Strapi et un champ `statut` personnalisé (`brouillon` → `pret_a_relire` → `publie` → `archive`) pour un workflow éditorial explicite, avec transitions contrôlées côté serveur (`src/utils/workflow.ts`).

### 3.2 Isolation multi-tenant

Chaque content-type lié à un profil possède un contrôleur personnalisé (`src/api/<type>/controllers/<type>.ts`) qui :

- **En lecture authentifiée** (`find`/`findOne`) : ne retourne que les entrées dont le `profil` appartient à l'utilisateur connecté (`src/utils/ownership.ts`, fonction `getOwnProfilId`).
- **En écriture** (`create`/`update`/`delete`) : vérifie que l'utilisateur est propriétaire de l'entrée avant toute modification (`isOwnChildEntry`), et attache automatiquement le `profil` de l'utilisateur à la création (le champ n'est jamais accepté tel quel depuis le client).
- **En lecture publique** : retourne uniquement les entrées publiées, filtrables par thème via la relation `profil.theme`.

### 3.3 Permissions

Les permissions du rôle `Public` (lecture des contenus publiés) et `Authenticated` (CRUD complet, restreint par les contrôleurs ci-dessus à ses propres données) sont accordées automatiquement au démarrage de Strapi via un hook `bootstrap` (`src/index.ts`), plutôt que configurées manuellement dans l'interface — garantissant que l'environnement reste fonctionnel après une réinitialisation de la base de données.

### 3.4 Validation

Chaque contrôleur valide les champs métier côté serveur (longueur, format email/URL, valeurs d'énumération autorisées) avant de déléguer à Strapi — la validation native de Strapi seule ne suffisant pas pour les règles métier spécifiques (ex. format des liens sociaux, transitions de statut autorisées).

## 4. Infrastructure et déploiement

### 4.1 Choix d'hébergement

Sélectionné via un appel d'offres formalisé (voir le dossier de pilotage du Lot 3) : **Hetzner Cloud**, instance CX22 (2 vCPU / 4 Go RAM / 40 Go disque, ~7 €/mois), retenu pour le meilleur rapport ressources/prix du marché et la conformité RGPD (données hébergées en Union européenne).

### 4.2 Conteneurisation

`docker-compose.yml` définit deux services :

- `strapi` : construit depuis `backend/Dockerfile`, volumes persistants pour la base SQLite (`.tmp`) et les fichiers uploadés (`public/uploads`) — sans ces volumes nommés, tout contenu serait perdu à chaque reconstruction du conteneur.
- `nginx` : sert le frontend statique en lecture seule et fait office de reverse-proxy vers Strapi pour `/api/`, `/uploads/` et `/strapi-admin/`.

### 4.3 CI/CD

`.github/workflows/deploy.yml` se déclenche sur chaque push vers `main` (ou manuellement avec un paramètre `ref` pour un rollback ciblé) :

1. Connexion SSH au serveur de production.
2. Exécution de `deploy.sh` : `git fetch` + `git checkout --force <ref>`, puis `docker compose up -d --build`.
3. Nettoyage des images Docker obsolètes.
4. Vérification automatique que le site répond en HTTP 200 ; le pipeline échoue explicitement sinon.

### 4.4 Sécurité et secrets

- Les secrets (hôte de déploiement, clé SSH) sont stockés dans les secrets GitHub Actions, jamais commités.
- Le fichier `.env` de Strapi (secrets JWT, clés d'API) réside uniquement sur le serveur, hors du dépôt Git.

## 5. Accessibilité et RGPD (implémentation)

- **Contrastes** : calculés par la formule de luminance relative WCAG (pas de vérification à l'œil), seuils 4,5:1 (texte normal) et 3:1 (texte large / composants d'interface).
- **Navigation clavier** : `:focus-visible` global, lien d'évitement vers `#main-content`, gestion explicite du focus après navigation SPA.
- **`prefers-reduced-motion`** : les animations et transitions sont neutralisées si l'utilisateur l'a activé au niveau système.
- **RGPD** : `components/cookie-banner.js` gère le consentement (accepté/refusé, persisté en `localStorage`, rouvrable depuis la page de confidentialité) ; `pages/mentions-legales-page.js` et `pages/confidentialite-page.js` détaillent l'éditeur, l'hébergeur, les données collectées, la base légale et les droits RGPD ; le formulaire d'inscription impose une case de consentement explicite avant création de compte.

## 6. Limites connues et évolutions possibles

Voir la section correspondante du dossier de pilotage / préparation de soutenance : absence de redondance serveur et de supervision continue (uptime monitoring), absence de suite de tests automatisés (recette actuellement manuelle + revue de pull requests), pas d'URL dédiée par portfolio (sélecteur de thème côté client plutôt que sous-domaines), pas de test utilisateur réel avec lecteur d'écran.
