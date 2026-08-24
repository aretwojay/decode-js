const CONSENT_KEY = "imprint-cookie-consent";

document.addEventListener("partials:loaded", () => {
  const banner = document.getElementById("cookie-banner");

  function showBanner() {
    banner.classList.remove("hidden");
  }
  function hideBanner() {
    banner.classList.add("hidden");
  }

  if (!localStorage.getItem(CONSENT_KEY)) {
    showBanner();
  }

  document.getElementById("cookie-accept").addEventListener("click", () => {
    localStorage.setItem(CONSENT_KEY, "accepted");
    hideBanner();
  });
  document.getElementById("cookie-refuse").addEventListener("click", () => {
    localStorage.setItem(CONSENT_KEY, "refused");
    hideBanner();
  });
  document.getElementById("manage-cookies").addEventListener("click", () => {
    showBanner();
    banner.querySelector("#cookie-accept").focus();
  });
});
