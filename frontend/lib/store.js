import createState from "./create-state.js";

const STORAGE_KEY = "vanilla_portfolio_store";

const initialPortfolioState = {
  profile: {
    nom: "Jean Dupont",
    titre: "Développeur Fullstack Vanilla JS & Strapi",
    bio: "Passionné par l'ingénierie logicielle, les architectures modulaires sans framework et les CMS headless.",
    email: "jean.dupont@example.com",
    ville: "Paris, France",
  },
  skills: [
    { id: 1, titre: "JavaScript Vanilla", niveau: "expert" },
    { id: 2, titre: "Strapi CMS", niveau: "avance" },
    { id: 3, titre: "CSS / Design Systems", niveau: "avance" },
  ],
  experiences: [
    {
      id: 1,
      titre: "Lead Développeur Frontend",
      entreprise: "Tech Innovation",
      date_debut: "2024-01-01",
      date_fin: "",
      description: "Conception du moteur Vanilla-Engine pour portfolios dynamiques.",
    },
  ],
  projects: [
    {
      id: 1,
      titre: "Plateforme E-Commerce",
      slug: "projet-ecommerce",
      description: "Boutique en ligne avec catalogue interactif et panier réactif.",
      technologies: ["JavaScript", "Strapi", "CSS"],
    },
  ],
};

function loadStoredState() {
  try {
    if (typeof localStorage !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    }
  } catch (error) {
    console.warn("Impossible de charger le store depuis localStorage :", error);
  }
  return initialPortfolioState;
}

export const appStore = createState(loadStoredState());

// Sauvegarde automatique dans localStorage à chaque modification d'état
if (typeof localStorage !== "undefined") {
  appStore.subscribe((newState) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
    } catch (error) {
      console.warn("Impossible de sauvegarder le store dans localStorage :", error);
    }
  });
}

export function updateProfile(fields) {
  appStore.setState((state) => ({
    ...state,
    profile: { ...state.profile, ...fields },
  }));
}

export function addSkill(skill) {
  appStore.setState((state) => ({
    ...state,
    skills: [...state.skills, { ...skill, id: Date.now() }],
  }));
}

export function removeSkill(id) {
  appStore.setState((state) => ({
    ...state,
    skills: state.skills.filter((s) => s.id !== id),
  }));
}

export function resetStore(customState = initialPortfolioState) {
  try {
    if (typeof localStorage !== "undefined") {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch (e) {}
  appStore.setState(customState);
}

