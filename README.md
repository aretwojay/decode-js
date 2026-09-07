# Vanilla-Engine — Générateur de portfolio

Générateur de portfolio/CV dynamique, propulsé par un framework JavaScript maison (**Vanilla-Engine**, sans React/Vue/Next) et un CMS headless **Strapi 5**. Projet réalisé dans le cadre du titre RNCP 39235 "Chef de projet digital" (Bloc 2) par **Iris AYIVODJI**, **Yaniss LAMBEAU** et **Ruben KABANGA MUYA**.

Chaque membre de l'équipe dispose de son propre thème et de ses propres données, gérés en autonomie via un espace d'administration personnel — le tout backé par une seule instance Strapi partagée et isolée par compte.

🔗 **Démo en ligne** : [http://178.104.249.113](http://178.104.249.113) — sélecteur de thème en haut de page pour consulter le portfolio d'Iris, Yaniss ou Ruben
🔗 **Espace d'administration Strapi** : [http://178.104.249.113:1337/admin](http://178.104.249.113:1337/admin) (accès réservé à l'équipe)

Documentation complémentaire :
- [Documentation fonctionnelle](docs/documentation-fonctionnelle.md) — ce que fait le produit, du point de vue utilisateur
- [Documentation technique](docs/documentation-technique.md) — architecture, stack, choix techniques
- [Cahier des charges initial](docs/cahier-des-charges-initial.md)

## Sommaire

- [Stack technique](#stack-technique)
- [Structure du dépôt](#structure-du-dépôt)
- [Démarrage en local](#démarrage-en-local)
- [Déploiement](#déploiement)
- [Fonctionnalités principales](#fonctionnalités-principales)

## Stack technique

| Couche | Techno |
|---|---|
| Frontend | JavaScript vanilla (ES Modules), aucun framework, aucun bundler |
| Backend / CMS | Strapi 5 (Node.js, TypeScript) |
| Base de données | SQLite (développement/production actuelle) |
| Reverse proxy | Nginx |
| Conteneurisation | Docker Compose |
| CI/CD | GitHub Actions |
| Hébergement | Hetzner Cloud (VPS) |

Aucun task-runner ni bundler côté frontend (contrainte pédagogique du Bloc 2) : les fichiers `.js`/`.css`/`.html` sont servis tels quels par Nginx.

## Structure du dépôt

```
.
├── frontend/           # Application Vanilla JS (SPA)
│   ├── components/     # Header, Footer, ThemeSwitcher, CookieBanner, UI feedback...
│   ├── lib/             # Moteur : routeur, state management, client API, auth
│   ├── pages/           # Un fichier par route (home, portfolio, cv, admin, login...)
│   ├── routes/          # Table de routage (chemin → page)
│   ├── themes/          # iris.css / yaniss.css / ruben.css
│   └── utils/           # Logique de rendu par section + sous-dossier admin/
├── backend/             # Strapi 5 (CMS headless)
│   └── src/api/         # Content-types : profil, projet, competence, experience,
│                         # formation, message, service
├── nginx/nginx.conf     # Reverse proxy + rewrite SPA
├── docker-compose.yml   # Stack frontend (nginx) + backend (strapi)
├── deploy.sh            # Script de déploiement / rollback (voir plus bas)
└── docs/                # Documentation du projet
```

## Démarrage en local

**Prérequis** : Node.js 20+, npm.

### Backend (Strapi)

```bash
cd backend
npm install
npm run develop
```

Strapi démarre sur `http://localhost:1337`. Au premier lancement, un compte Super Admin doit être créé via l'interface (`/admin`).

### Frontend

Aucune installation ni build requis : c'est du JavaScript natif servi statiquement.

```bash
cd frontend
npx serve .
```

Le frontend consomme l'API Strapi en local sur `http://localhost:1337` (voir `frontend/lib/api.js`, résolution automatique de l'URL selon l'environnement).

## Déploiement

Le déploiement est automatisé via GitHub Actions (`.github/workflows/deploy.yml`) : chaque push sur `main` déclenche une connexion SSH au serveur de production, qui exécute `deploy.sh`.

`deploy.sh` récupère le dernier commit de `main`, reconstruit et redémarre la stack Docker (`docker compose up -d --build`), nettoie les anciennes images, puis une vérification automatique confirme que le site répond (HTTP 200).

**Rollback** : le workflow peut être déclenché manuellement avec un paramètre `ref` (commit, tag ou branche) pour redéployer une version antérieure précise en quelques minutes.

## Fonctionnalités principales

- **Multi-thème / multi-tenant** : 3 thèmes (Iris, Yaniss, Ruben), chacun affichant exclusivement les données de son propre profil Strapi, isolées par compte utilisateur
- **Espace d'administration personnel** (`/admin`) : chaque utilisateur connecté gère son profil, ses projets, expériences, compétences et services, sans accès aux données des autres
- **CV en ligne** généré dynamiquement depuis les données Strapi
- **Conformité RGPD** : bandeau de consentement cookies, pages mentions légales et politique de confidentialité, consentement explicite à l'inscription
- **Accessibilité WCAG 2.1 AA** : contrastes vérifiés par calcul, navigation clavier, lien d'évitement, `prefers-reduced-motion`
- **SEO** : métadonnées dynamiques par page (titre, description, Open Graph)

Détail complet dans la [documentation fonctionnelle](docs/documentation-fonctionnelle.md).
