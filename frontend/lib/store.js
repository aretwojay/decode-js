import createState from "./create-state.js";

const STORAGE_KEY = "vanilla_portfolio_store_v2";

const initialPortfolioState = {
  user: null,
  isAuthenticated: false,
  authLoading: false,
  profile: null,
  skills: [],
  experiences: [],
  projects: [],
  formations: [],
};

function loadStoredState() {
  try {
    if (typeof localStorage !== "undefined") {
      // Clean up legacy store key containing initial mock items
      localStorage.removeItem("vanilla_portfolio_store");

      let user = null;
      let isAuthenticated = false;
      try {
        const token = localStorage.getItem("imprint_jwt");
        const rawUser = localStorage.getItem("imprint_user");
        if (token) {
          isAuthenticated = true;
          user = rawUser ? JSON.parse(rawUser) : null;
        }
      } catch (e) {}

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
        return {
          ...initialPortfolioState,
          ...parsed,
          user: user || parsed.user || null,
          isAuthenticated: isAuthenticated || Boolean(parsed.isAuthenticated),
        };
      }

      return {
        ...initialPortfolioState,
        user,
        isAuthenticated,
      };
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

export function setAuthSession(user, token) {
  appStore.setState((state) => ({
    ...state,
    user,
    isAuthenticated: true,
    authLoading: false,
  }));
}

export function clearAuthSession() {
  appStore.setState((state) => ({
    ...state,
    user: null,
    isAuthenticated: false,
    authLoading: false,
    profile: null,
    projects: [],
    experiences: [],
    skills: [],
    formations: [],
  }));
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

