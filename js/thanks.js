(function () {
  const message = document.getElementById("thanks-message");
  const registration = document.getElementById("thanks-registration");
  const notification = document.getElementById("thanks-notification");
  const details = document.getElementById("thanks-details");
  const missing = document.getElementById("thanks-missing");
  let result = null;
  try {
    result = JSON.parse(sessionStorage.getItem("ugc-registration-result") || "null");
  } catch {
    result = null;
  }
  if (!result || !result.registrationId) {
    if (message) message.hidden = true;
    if (details) details.hidden = true;
    if (missing) missing.hidden = false;
    return;
  }
  if (message) message.textContent = result.notificationMessage || "";
  if (registration) registration.textContent = result.registrationId;
  if (notification) notification.textContent = result.notificationId || "";
})();
