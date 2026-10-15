/* Bump this number each time you deploy to the server. */
window.UGC_VERSION = {
  number: "1.0.1",
  updated: "2026-10-15",
};

(function () {
  const version = window.UGC_VERSION;
  const label = "Version " + version.number + " · " + version.updated;
  document.querySelectorAll("[data-app-version]").forEach((el) => {
    el.textContent = label;
  });
})();
