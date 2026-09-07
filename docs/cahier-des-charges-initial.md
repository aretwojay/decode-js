# Cahier des Charges Initial — Vanilla-Engine

**Projet** : Vanilla-Engine — Générateur de portfolio propulsé par un framework JavaScript propriétaire
**Rédacteur** : Iris AYIVODJI
**Équipe** : Yaniss LAMBEAU (Lot 1 — CMS Headless), Ruben KABANGA MUYA (Lot 2 — Communication), Iris AYIVODJI (Lot 3 — Infrastructure)
**Date** : [date]
**Version** : 1.0 — document fourni avant les réunions d'évolution du Workshop Relation-Client

---

## 1. Contexte et objectifs

Le projet consiste à concevoir un générateur de portfolio dynamique, performant et industrialisable, propulsé par un framework JavaScript maison ("Vanilla-Engine"), sans dépendance à un framework tiers (React, Vue, Next).

**Cible** : développeurs juniors en recherche d'alternance ou de premier emploi, qui ont besoin de présenter leur parcours de manière crédible et différenciante.

**Objectif du document** : formaliser les spécifications techniques et fonctionnelles du projet, justifier les choix technologiques, planifier les étapes, chiffrer le budget prévisionnel, identifier les risques et définir les critères de qualité — avant le cycle d'évolutions négociées avec le client pendant le workshop.

---

## 2. Spécifications fonctionnelles

### 2.1 Le framework "Vanilla-Engine"

| Fonctionnalité | Description |
|---|---|
| Moteur de rendu | Génération de structure DOM à partir d'objets décrivant les éléments (type, attributs, enfants, événements), sans bibliothèque tierce |
| Routeur interne | Navigation SPA via l'History API du navigateur, sans rechargement de page |
| State management | Mise à jour réactive : une modification de donnée impacte le rendu automatiquement |
| Validation de composants | Contrôle des propriétés passées à un composant, avec retour d'erreur explicite |
| Système de thèmes | Chargement dynamique de thèmes différents (contenu + styles), permettant à chaque membre de l'équipe de générer son propre portfolio avec le même moteur |

### 2.2 Le générateur de portfolio

| Fonctionnalité | Description |
|---|---|
| Interface d'édition | Saisie des expériences, projets et compétences |
| Système de templates | Rendu dynamique des données via le framework |
| Consommation du CMS | Affichage des données réelles via l'API du CMS Headless sélectionné (Lot 1) |
| Export PDF | Génération d'un CV imprimable via le service sélectionné (Lot 2) |

### 2.3 Justification des choix technologiques

- **Framework maison plutôt que React/Vue/Next** : exigence pédagogique du Bloc 2, et argument produit — le moteur lui-même devient une preuve de compétence technique pour la cible (développeurs juniors).
- **History API plutôt que hash routing en solution principale** : URLs propres, plus proches d'un site de production réel ; un hash router reste disponible en secours si l'hébergement ne supporte pas le rewrite SPA.
- **CMS Headless (Lot 1)** : choisi via appel d'offres par Yaniss — *[à compléter : prestataire retenu et justification synthétique]*.
- **Service de communication (Lot 2)** : choisi via appel d'offres par Ruben — *[à compléter : prestataire retenu et justification synthétique]*.
- **Hébergement Cloudflare Pages (Lot 3)** : choisi via appel d'offres par Iris, pour le CDN illimité en plan gratuit, la compatibilité totale avec la contrainte "zéro build tool", et le rewrite SPA natif (voir `docs/appel-offres-lot3-infrastructure.md`).

---

## 3. Spécifications techniques et contraintes

- Système de routing avec gestion de l'historique de navigation.
- Gestion de l'état : mise à jour du rendu sans rechargement de page.
- Consommation d'APIs externes (services sélectionnés via les appels d'offres).
- Validation des propriétés passées aux composants.
- Utilisation des prototypes d'objet natif (`String`, `Object`, `Number`…), avec notamment `String.interpolate()`.
- Modules JavaScript (import/export) et Promises.
- Aucun task-runner, à l'exception d'un compilateur SASS.
- Aucune librairie externe sans validation de l'intervenant (les librairies CSS type Tailwind/Bootstrap sont autorisées).

---

## 4. Ordonnancement des étapes (planning)

Le développement est séquencé en 7 itérations (backlog suivi sur GitHub Projects) :

| Itération | Contenu | Statut |
|---|---|---|
| 1 — Socle technique | Structure du projet, routeur, moteur de rendu, premières pages | Fait |
| 2 — Cœur du framework | State management, validation, `String.interpolate()`, système de thèmes | En cours |
| 3 — CMS Headless (Lot 1) | Sélection prestataire, modèle de contenu, CRUD, connexion API | À venir |
| 4 — Infrastructure & Communication (Lots 2 et 3) | Déploiement continu, rewrite SPA, mailing, export PDF | À venir |
| 5 — Design & UI/UX | Design System, prototype Figma, thèmes individuels (Iris/Yaniss/Ruben) | À venir |
| 6 — Qualité, conformité & recette | Tests, PV de recette, WCAG, RGPD, matrice des risques | À venir |
| 7 — Finalisation | Documentation, README, mise en production, soutenance | À venir |

---

## 5. Budget prévisionnel

Le projet est réalisé dans un cadre académique, sans financement externe : l'enveloppe budgétaire cible est de **0 € à 10 €/mois maximum par lot**, en privilégiant les plans gratuits.

| Poste | Prestataire | Coût estimé |
|---|---|---|
| CMS Headless (Lot 1) | *[à compléter par Yaniss]* | *[à compléter]* |
| Communication (Lot 2) | *[à compléter par Ruben]* | *[à compléter]* |
| Hébergement (Lot 3) | Cloudflare Pages | 0 €/mois (plan Free) |
| Nom de domaine (si besoin) | — | ~10 €/an (optionnel) |

---

## 6. Matrice des risques

| Risque | Type | Probabilité | Impact | Mitigation |
|---|---|---|---|---|
| Complexité du moteur JS sous-estimée | Technique | Moyenne | Élevé | Découpage en itérations courtes, tests réguliers dès l'itération 2 |
| Retard sur la connexion CMS (Lot 1) | Technique | Moyenne | Élevé | Les pages fonctionnent déjà avec des données de démonstration, dégradation possible sans bloquer la démo |
| Dépassement du budget gratuit (trafic, builds) | Financier | Faible | Moyen | Choix de prestataires à plans gratuits généreux (Cloudflare Pages illimité) |
| Nouvelles demandes du client hors périmètre | Organisationnel | Élevée | Moyen | Processus de négociation formalisé (itération 4-6), écarts mesurés avant intégration |
| Non-conformité WCAG/RGPD découverte tardivement | Conformité | Moyenne | Élevé | Traitée dès l'itération 6, avant la finalisation |

---

## 7. Critères d'évaluation de la qualité

- Le framework fonctionne sans dépendance externe non validée.
- La navigation SPA ne génère aucune erreur 404 au rafraîchissement.
- Les données affichées proviennent réellement du CMS (plus de données de démonstration en fin de projet).
- Le portfolio de chaque membre de l'équipe est accessible via son propre thème.
- Les critères WCAG 2.0 AA de base sont respectés (contrastes, focus, navigation clavier).
- La conformité RGPD est vérifiée (consentement cookies, droit à l'effacement).
- Chaque livrable (appel d'offres, planning, recette) est daté et formalisé.
