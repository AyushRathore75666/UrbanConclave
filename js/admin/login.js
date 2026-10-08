(function () {
  const session = window.UgcAdminSession;
  const api = window.UgcAdminApi;
  const form = document.getElementById("admin-login");
  const userId = document.getElementById("user-id");
  const password = document.getElementById("password");
  const submit = document.getElementById("login-submit");
  const toast = document.getElementById("login-toast");
  const toastText = document.getElementById("login-toast-text");
  let pending = false;

  function showToast(message) {
    toastText.textContent = message || "";
    toast.hidden = !message;
  }

  function leaveIfSignedIn() {
    if (!session.isAuthenticated()) return false;
    location.replace("dashboard.html");
    return true;
  }

  if (leaveIfSignedIn()) return;

  const notice = session.takeNotice();
  if (notice) showToast(notice);
  document.body.classList.remove("admin-gate");

  document.getElementById("login-toast-close").addEventListener("click", () => showToast(""));

  window.addEventListener("pageshow", () => {
    password.value = "";
    leaveIfSignedIn();
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (pending) return;
    const id = userId.value.trim();
    const pass = password.value;
    if (!id || !pass) {
      showToast("Enter your user ID and password.");
      (id ? password : userId).focus();
      return;
    }

    pending = true;
    submit.disabled = true;
    submit.textContent = "Signing in…";
    showToast("");
    try {
      const result = await api.login(id, pass);
      session.setToken(result.token);
      password.value = "";
      location.replace("dashboard.html");
    } catch (error) {
      pending = false;
      submit.disabled = false;
      submit.textContent = "Sign in";
      showToast((error && error.message) || "Sign-in could not be completed.");
    }
  });
})();
