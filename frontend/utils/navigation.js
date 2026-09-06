/**
 * SPA History API Navigation Helper
 * @param {string} url - Target URL path
 */
export function navigate(url) {
  if (typeof window !== "undefined") {
    window.history.pushState({}, undefined, url);
    window.dispatchEvent(new Event("pushstate"));
  }
}
