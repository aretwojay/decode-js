import Link from "./router/link.js";

/**
 * UI Feedback Module (T0019)
 * Standardized Loading Skeletons, Non-blocking Feedback Banners,
 * Empty States, Inline Action Confirmations, and Toast Notifications.
 */

/**
 * Creates an animated Shimmer Skeleton structure
 * @param {Object} options
 * @param {string} [options.type="project"] - "project" | "timeline" | "profile" | "card"
 * @returns {Object} Vanilla-engine structure
 */
export function renderSkeletonCard({ type = "project" } = {}) {
  if (type === "profile") {
    return {
      type: "div",
      attributes: [["class", ["skeleton-card", "skeleton-profile"]]],
      children: [
        {
          type: "div",
          attributes: [["class", ["skeleton-avatar", "skeleton-shimmer"]]],
          children: [],
        },
        {
          type: "div",
          attributes: [["class", ["skeleton-content"]]],
          children: [
            { type: "div", attributes: [["class", ["skeleton-line", "skeleton-title", "skeleton-shimmer"]]], children: [] },
            { type: "div", attributes: [["class", ["skeleton-line", "skeleton-subtitle", "skeleton-shimmer"]]], children: [] },
            { type: "div", attributes: [["class", ["skeleton-line", "skeleton-text", "skeleton-shimmer"]]], children: [] },
          ],
        },
      ],
    };
  }

  if (type === "timeline") {
    return {
      type: "div",
      attributes: [["class", ["skeleton-card", "skeleton-timeline"]]],
      children: [
        {
          type: "div",
          attributes: [["class", ["skeleton-header"]]],
          children: [
            { type: "div", attributes: [["class", ["skeleton-line", "skeleton-title", "skeleton-shimmer"]]], children: [] },
            { type: "div", attributes: [["class", ["skeleton-pill", "skeleton-shimmer"]]], children: [] },
          ],
        },
        { type: "div", attributes: [["class", ["skeleton-line", "skeleton-subtitle", "skeleton-shimmer"]]], children: [] },
        { type: "div", attributes: [["class", ["skeleton-line", "skeleton-text", "skeleton-shimmer"]]], children: [] },
        { type: "div", attributes: [["class", ["skeleton-line", "skeleton-text", "skeleton-text-short", "skeleton-shimmer"]]], children: [] },
      ],
    };
  }

  // Default: project card skeleton
  return {
    type: "div",
    attributes: [["class", ["skeleton-card", "skeleton-project"]]],
    children: [
      {
        type: "div",
        attributes: [["class", ["skeleton-header"]]],
        children: [
          { type: "div", attributes: [["class", ["skeleton-line", "skeleton-title", "skeleton-shimmer"]]], children: [] },
          { type: "div", attributes: [["class", ["skeleton-pill", "skeleton-shimmer"]]], children: [] },
        ],
      },
      { type: "div", attributes: [["class", ["skeleton-line", "skeleton-text", "skeleton-shimmer"]]], children: [] },
      { type: "div", attributes: [["class", ["skeleton-line", "skeleton-text", "skeleton-text-short", "skeleton-shimmer"]]], children: [] },
      {
        type: "div",
        attributes: [["class", ["skeleton-tags"]]],
        children: [
          { type: "div", attributes: [["class", ["skeleton-tag", "skeleton-shimmer"]]], children: [] },
          { type: "div", attributes: [["class", ["skeleton-tag", "skeleton-shimmer"]]], children: [] },
          { type: "div", attributes: [["class", ["skeleton-tag", "skeleton-shimmer"]]], children: [] },
        ],
      },
    ],
  };
}

/**
 * Creates a collection of skeleton cards for grid loading
 * @param {number} [count=3]
 * @param {string} [type="project"]
 * @returns {Array<Object>}
 */
export function renderSkeletonGrid(count = 3, type = "project") {
  return Array.from({ length: count }, () => renderSkeletonCard({ type }));
}

/**
 * Creates a non-blocking Feedback Banner (e.g., offline mode notice, API error warning)
 * @param {Object} options
 * @param {"info"|"warning"|"error"|"offline"|"success"} [options.type="info"]
 * @param {string} options.message
 * @param {string} [options.actionText]
 * @param {Function} [options.onAction]
 * @param {boolean} [options.dismissible=true]
 * @returns {Object} Vanilla-engine structure
 */
export function renderFeedbackBanner({
  type = "info",
  message = "",
  actionText = "",
  onAction = null,
  dismissible = true,
} = {}) {
  const iconMap = {
    info: "ℹ️",
    warning: "⚠️",
    error: "❌",
    offline: "📡",
    success: "✅",
  };

  const bannerClass = `banner-${type}`;
  const bannerId = `banner-${Math.random().toString(36).slice(2, 9)}`;

  function handleDismiss(event) {
    const bannerEl = event.currentTarget.closest(".feedback-banner");
    if (bannerEl) {
      bannerEl.style.opacity = "0";
      bannerEl.style.transform = "translateY(-6px)";
      setTimeout(() => bannerEl.remove(), 200);
    }
  }

  const children = [
    {
      type: "div",
      attributes: [["class", ["feedback-banner-content"]]],
      children: [
        {
          type: "span",
          attributes: [["class", ["feedback-banner-icon"]]],
          children: [iconMap[type] || "ℹ️"],
        },
        {
          type: "span",
          attributes: [["class", ["feedback-banner-text"]]],
          children: [message],
        },
      ],
    },
  ];

  if (actionText && typeof onAction === "function") {
    children.push({
      type: "button",
      attributes: [
        ["type", "button"],
        ["class", ["btn", "btn-sm", "feedback-banner-action"]],
      ],
      events: [["click", onAction]],
      children: [actionText],
    });
  }

  if (dismissible) {
    children.push({
      type: "button",
      attributes: [
        ["type", "button"],
        ["class", ["feedback-banner-close"]],
        ["aria-label", "Fermer l'avis"],
      ],
      events: [["click", handleDismiss]],
      children: ["✕"],
    });
  }

  return {
    type: "aside",
    attributes: [
      ["id", bannerId],
      ["class", ["feedback-banner", bannerClass]],
      ["role", type === "error" ? "alert" : "status"],
    ],
    children,
  };
}

/**
 * Creates a standardized Empty State Card
 * @param {Object} options
 * @param {string} [options.icon="📦"]
 * @param {string} options.title
 * @param {string} [options.description=""]
 * @param {string} [options.actionText=""]
 * @param {string} [options.actionHref=""]
 * @param {Function} [options.onAction=null]
 * @returns {Object} Vanilla-engine structure
 */
export function renderEmptyState({
  icon = "📦",
  title = "Aucun élément trouvé",
  description = "",
  actionText = "",
  actionHref = "",
  onAction = null,
} = {}) {
  const children = [
    {
      type: "div",
      attributes: [["class", ["empty-state-icon"]]],
      children: [icon],
    },
    {
      type: "h3",
      attributes: [["class", ["empty-state-title"]]],
      children: [title],
    },
  ];

  if (description) {
    children.push({
      type: "p",
      attributes: [["class", ["empty-state-desc"]]],
      children: [description],
    });
  }

  if (actionText) {
    if (actionHref) {
      children.push({
        type: "div",
        attributes: [["class", ["empty-state-action"]]],
        children: [Link(actionHref, actionText, ["btn", "btn-primary", "empty-state-btn"])],
      });
    } else if (typeof onAction === "function") {
      children.push({
        type: "div",
        attributes: [["class", ["empty-state-action"]]],
        children: [
          {
            type: "button",
            attributes: [
              ["type", "button"],
              ["class", ["btn", "btn-primary", "empty-state-btn"]],
            ],
            events: [["click", onAction]],
            children: [actionText],
          },
        ],
      });
    }
  }

  return {
    type: "div",
    attributes: [["class", ["empty-state-card"]]],
    children,
  };
}

/**
 * Inline 2-step confirmation component replacing window.confirm()
 * @param {Object} options
 * @param {string} options.message
 * @param {Function} options.onConfirm
 * @param {Function} options.onCancel
 * @returns {Object} Vanilla-engine structure
 */
export function renderInlineConfirm({
  message = "Confirmer la suppression ?",
  onConfirm,
  onCancel,
} = {}) {
  return {
    type: "div",
    attributes: [["class", ["inline-confirm-box"]]],
    children: [
      {
        type: "span",
        attributes: [["class", ["inline-confirm-text"]]],
        children: [message],
      },
      {
        type: "div",
        attributes: [["class", ["inline-confirm-buttons"]]],
        children: [
          {
            type: "button",
            attributes: [
              ["type", "button"],
              ["class", ["btn", "btn-sm", "btn-danger"]],
            ],
            events: [["click", onConfirm]],
            children: ["Oui, supprimer"],
          },
          {
            type: "button",
            attributes: [
              ["type", "button"],
              ["class", ["btn", "btn-sm", "btn-secondary"]],
            ],
            events: [["click", onCancel]],
            children: ["Annuler"],
          },
        ],
      },
    ],
  };
}

/**
 * Toast Notification System replacing window.alert()
 * Dynamically mounts/updates toast container in document.body
 * @param {string} message
 * @param {"success"|"error"|"info"|"warning"} [type="info"]
 * @param {number} [duration=4000]
 */
export function showToast(message, type = "info", duration = 4000) {
  if (typeof document === "undefined") return;

  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    container.className = "toast-container";
    document.body.appendChild(container);
  }

  const iconMap = {
    success: "✓",
    error: "✕",
    warning: "⚠",
    info: "ℹ",
  };

  const toast = document.createElement("div");
  toast.className = `toast-item toast-${type}`;
  toast.setAttribute("role", type === "error" ? "alert" : "status");

  const iconSpan = document.createElement("span");
  iconSpan.className = "toast-icon";
  iconSpan.textContent = iconMap[type] || "ℹ";

  const msgSpan = document.createElement("span");
  msgSpan.className = "toast-message";
  msgSpan.textContent = message;

  const closeBtn = document.createElement("button");
  closeBtn.type = "button";
  closeBtn.className = "toast-close";
  closeBtn.setAttribute("aria-label", "Fermer la notification");
  closeBtn.textContent = "✕";

  function dismiss() {
    toast.classList.add("toast-leaving");
    setTimeout(() => {
      toast.remove();
      if (container.children.length === 0) {
        container.remove();
      }
    }, 250);
  }

  closeBtn.addEventListener("click", dismiss);

  toast.appendChild(iconSpan);
  toast.appendChild(msgSpan);
  toast.appendChild(closeBtn);

  container.appendChild(toast);

  // Trigger animation
  requestAnimationFrame(() => {
    toast.classList.add("toast-visible");
  });

  if (duration > 0) {
    setTimeout(dismiss, duration);
  }
}
