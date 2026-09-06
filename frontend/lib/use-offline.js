import createState from "./create-state.js";
import { renderFeedbackBanner } from "../components/ui-feedback.js";

/**
 * Global offline reactive state tracking network and API reachability
 */
export const globalOfflineState = createState({
  isOffline: typeof navigator !== "undefined" ? !navigator.onLine : false,
  message: "",
  lastChecked: Date.now(),
});

// Setup browser online/offline listeners
if (typeof window !== "undefined") {
  window.addEventListener("offline", () => {
    globalOfflineState.set({
      isOffline: true,
      message:
        "Connexion réseau perdue. Vous naviguez actuellement en mode hors-ligne.",
      lastChecked: Date.now(),
    });
  });

  window.addEventListener("online", () => {
    globalOfflineState.set({
      isOffline: false,
      message: "",
      lastChecked: Date.now(),
    });
  });
}

/**
 * Reusable useOffline Hook for Vanilla Engine
 * Handles async data fetching with automatic fallback, error logging,
 * and unified non-blocking feedback banner generation.
 *
 * @param {Object} [options]
 * @param {string} [options.defaultMessage] - Default offline notification message
 * @returns {Object} Hook interface
 */
export function useOffline(options = {}) {
  let localOffline =
    typeof navigator !== "undefined" ? !navigator.onLine : false;
  let customBannerMessage = options.defaultMessage || "";

  function isOffline() {
    return localOffline || globalOfflineState.get().isOffline;
  }

  function setOffline(customMsg) {
    localOffline = true;
    if (customMsg) customBannerMessage = customMsg;
    globalOfflineState.set((state) => ({
      ...state,
      isOffline: true,
      message:
        customMsg ||
        customBannerMessage ||
        state.message ||
        "Mode hors-ligne : serveur distant indisponible.",
      lastChecked: Date.now(),
    }));
  }

  function setOnline() {
    localOffline = false;
    globalOfflineState.set((state) => ({
      ...state,
      isOffline: false,
      message: "",
      lastChecked: Date.now(),
    }));
  }

  /**
   * Executes an async operation with automatic offline detection and fallback
   * @param {Function} asyncFn - Async function returning a promise
   * @param {Object} [execOptions]
   * @param {*} [execOptions.fallback=null] - Fallback value or factory function
   * @param {string} [execOptions.message] - Custom offline banner message
   * @returns {Promise<*>}
   */
  async function execute(asyncFn, { fallback = null, message = "" } = {}) {
    try {
      const result = await asyncFn();
      if (globalOfflineState?.get && globalOfflineState.get().isOffline) {
        localOffline = true;
        if (message || customBannerMessage) {
          globalOfflineState.set((s) => ({
            ...s,
            message: message || customBannerMessage || s.message,
          }));
        }
        return typeof fallback === "function" ? fallback() : (result ?? fallback);
      }
      setOnline();
      return result;
    } catch (error) {
      setOffline(
        message ||
          customBannerMessage ||
          "Mode hors-ligne : serveur distant indisponible.",
      );
      console.warn(
        "[useOffline] Async call failed, activating offline fallback:",
        error?.message || error,
      );
      return typeof fallback === "function" ? fallback(error) : fallback;
    }
  }

  /**
   * Returns a feedback banner structure if offline, or null if online
   * @param {string} [customMessage]
   * @returns {Object|null}
   */
  function getBanner(customMessage) {
    if (!isOffline()) return null;
    return renderFeedbackBanner({
      type: "offline",
      message:
        customMessage ||
        customBannerMessage ||
        globalOfflineState.get().message ||
        "Mode hors-ligne : serveur distant indisponible.",
    });
  }

  /**
   * Returns an array with the banner structure if offline, or empty array if online.
   * Enables spreading directly into children: `...offline.getBannerChildren()`
   * @param {string} [customMessage]
   * @returns {Array<Object>}
   */
  function getBannerChildren(customMessage) {
    const banner = getBanner(customMessage);
    return banner ? [banner] : [];
  }

  return {
    isOffline,
    setOffline,
    setOnline,
    execute,
    getBanner,
    getBannerChildren,
    subscribe: globalOfflineState.subscribe,
    state: globalOfflineState,
  };
}

export default useOffline;
