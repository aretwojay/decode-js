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
    return { type: "p", children: [loadingMessage] };
  }
  if (state.error) {
    return {
      type: "p",
      attributes: [["style", [["color", "#c0392b"]]]],
      children: [state.error],
    };
  }
  return { type: "p", children: [""] };
}
