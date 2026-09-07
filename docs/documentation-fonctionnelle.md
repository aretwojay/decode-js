# Documentation fonctionnelle

Ce document décrit ce que fait le produit du point de vue de ses utilisateurs, sans détail d'implémentation technique (voir la [documentation technique](documentation-technique.md) pour l'architecture).

## 1. Objectif du produit

Un générateur de portfolio permettant à un développeur junior de présenter son parcours (projets, compétences, expériences, formations) de façon crédible et différenciante — le moteur de rendu du site étant lui-même une preuve de compétence technique, puisqu'il est développé maison plutôt qu'avec un outil no-code ou un framework grand public.

## 2. Utilisateurs et rôles

| Rôle | Ce qu'il peut faire |
|---|---|
| **Visiteur (public)** | Consulter n'importe quel portfolio publié : accueil, page projets, CV, contact. Envoyer un message via le formulaire de contact. |
| **Utilisateur inscrit** | Tout ce que peut faire un visiteur, + accéder à son espace d'administration pour créer/modifier son propre profil, ses projets, compétences, expériences, formations et services. |

Il n'existe pas de rôle "administrateur global" côté frontend : chaque utilisateur ne voit et ne modifie que ses propres données. La supervision globale du contenu (tous thèmes confondus) se fait via l'interface d'administration native de Strapi, réservée aux comptes Super Admin.

## 3. Parcours utilisateur

### 3.1 Visiteur

1. Arrive sur la page d'accueil (thème par défaut : Iris).
2. Peut changer de thème via le sélecteur en haut de page pour consulter le portfolio d'un autre membre de l'équipe — chaque thème n'affiche que les données de son propriétaire.
3. Navigue vers `/portfolio` (liste des projets), `/cv` (CV imprimable), ou `/contact` (formulaire de contact).
4. Au premier chargement, un bandeau propose d'accepter ou refuser les cookies de mesure d'audience (les cookies strictement nécessaires au fonctionnement ne sont pas concernés).

### 3.2 Création de compte et gestion de son portfolio

1. Le visiteur s'inscrit via `/signup` : nom d'utilisateur, email, mot de passe, et **acceptation obligatoire** de la politique de confidentialité (case à cocher, lien vers `/confidentialite`).
2. Redirigé vers `/admin`, il est invité à créer son profil (nom, titre, biographie, coordonnées, thème visuel).
3. Une fois le profil créé, l'espace d'administration affiche des sections supplémentaires : **Projets**, **Expériences**, **Compétences**, **Services**, chacune avec formulaire d'ajout et liste des éléments existants (modification/suppression).
4. Chaque élément a un statut de workflow : **brouillon → prêt à relire → publié → archivé**. Seuls les éléments publiés apparaissent sur le portfolio public.
5. Les modifications sont immédiatement visibles sur le portfolio public dès publication.

### 3.3 Contact

Le formulaire de contact (page `/contact` ou section de la page d'accueil selon le thème) envoie un message qui est stocké côté Strapi et associé au profil concerné — sans nécessiter de compte de la part du visiteur qui contacte.

## 4. Contenu géré par profil

Chaque profil peut renseigner :

- **Identité** : nom, titre professionnel, biographie, photo, CV (PDF téléchargeable), coordonnées (email, téléphone, localisation), liens sociaux (GitHub, LinkedIn, Twitter/X)
- **Projets** : titre, résumé, description détaillée, technologies utilisées, rôle, liens (dépôt, démo, application mobile), visuels, mise en avant ("en vedette")
- **Compétences** : intitulé, niveau (débutant à expert), icône, liées à des projets/expériences
- **Expériences professionnelles** : titre, entreprise, dates, description
- **Formations** : établissement, diplôme, dates, description
- **Services** ("Ce que je fais" / "Champs d'expertise") : cartes présentées sur la page d'accueil, décrivant les domaines d'intervention

## 5. Thèmes disponibles

| Thème | Style |
|---|---|
| **Iris** | Moderne, coloré, orienté créatif |
| **Yaniss** | Minimaliste, épuré |
| **Ruben** | Sombre, orienté développeur |

Le thème sélectionné détermine à la fois l'apparence visuelle du site **et** le profil dont les données sont affichées — chaque visiteur ne voit qu'un seul portfolio à la fois, jamais un mélange de plusieurs.

## 6. Conformité et accessibilité

- **RGPD** : bandeau de consentement cookies, pages "Mentions légales" et "Politique de confidentialité" accessibles depuis le pied de page de toutes les pages, droits RGPD détaillés (accès, rectification, effacement, portabilité, opposition, réclamation CNIL).
- **Accessibilité (WCAG 2.1 AA)** : contrastes de couleur conformes, navigation complète au clavier, lien d'évitement vers le contenu principal, respect de la préférence "mouvement réduit" du système d'exploitation.

## 7. Fonctionnalités techniques visibles côté produit

- **CV en ligne imprimable**, généré à partir des données réelles du profil.
- **Recherche et filtres** sur la page catalogue de projets (par technologie, par statut).
- **Mode clair / sombre**, indépendant du choix de thème.
- **Mode hors-ligne dégradé** : en cas d'indisponibilité de l'API, le site affiche un message et, si possible, les dernières données mises en cache localement plutôt qu'une page blanche.
