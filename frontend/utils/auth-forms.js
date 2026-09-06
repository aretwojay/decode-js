/**
 * Form Feedback & Auth Helpers
 */

/**
 * Renders async feedback state (loading message, error text, or empty)
 * @param {Object} state - { loading: boolean, error: string }
 * @param {string} loadingMessage - Default loading text
 * @returns {Object} Vanilla-engine structure object
 */
export function renderAuthFeedback(state, loadingMessage = "Chargement…") {
  if (state.loading) {
    return {
      type: "div",
      attributes: [
        ["class", ["auth-feedback", "auth-feedback-loading"]],
        ["role", "status"],
        ["aria-live", "polite"],
      ],
      children: [
        { type: "span", attributes: [["class", ["auth-spinner-icon"]]], children: ["⏳ "] },
        loadingMessage,
      ],
    };
  }
  if (state.error) {
    return {
      type: "div",
      attributes: [
        ["class", ["auth-feedback", "auth-feedback-error"]],
        ["role", "alert"],
        ["aria-live", "assertive"],
      ],
      children: [
        { type: "span", attributes: [["class", ["auth-error-icon"]]], children: ["⚠️ "] },
        state.error,
      ],
    };
  }
  return { type: "div", attributes: [["class", ["auth-feedback", "auth-feedback-idle"]]], children: [] };
}
