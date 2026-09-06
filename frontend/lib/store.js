import createState from "./create-state.js";

const STORAGE_KEY = "vanilla_portfolio_store_v2";

const initialPortfolioState = {
  profile: null,
  skills: [],
  experiences: [],
  projects: [],
};

function loadStoredState() {
  try {
    if (typeof localStorage !== "undefined") {
      // Clean up legacy store key containing initial mock items
      localStorage.removeItem("vanilla_portfolio_store");

      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed?.projects)) {
          parsed.projects = parsed.projects.filter(
            (p) =>
              p &&
              ![1, 101, 102, 103, 104].includes(p.id) &&
              p.slug !== "projet-ecommerce" &&
              p.slug !== "vanilla-spa-engine" &&
              p.slug !== "strapi-headless-cms" &&
              p.slug !== "design-system-themes",
          );
        }
        if (Array.isArray(parsed?.experiences)) {
          parsed.experiences = parsed.experiences.filter(
            (e) =>
              e &&
              ![1, 2, 3].includes(e.id) &&
              e.entreprise !== "Tech Innovation" &&
              e.entreprise !== "Tech Innovation Studio" &&
              e.entreprise !== "Digital Horizons Agency" &&
              e.entreprise !== "Creative Studio Paris",
          );
        }
        if (Array.isArray(parsed?.skills)) {
          parsed.skills = parsed.skills.filter(
            (s) =>
              s &&
              ![1, 2, 3].includes(s.id) &&
              s.titre !== "JavaScript Vanilla" &&
              s.titre !== "Strapi CMS" &&
              s.titre !== "CSS / Design Systems",
          );
        }
        if (parsed?.profile?.email === "jean.dupont@example.com") {
          parsed.profile = null;
        }
        return parsed;
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

