/* Keeps the access token for this tab only. Registration records are never written to browser storage. */
(function (global) {
  const TOKEN_KEY = "ugc-admin-token";
  const NOTICE_KEY = "ugc-admin-notice";

  function storage() {
    try {
      return global.sessionStorage;
    } catch {
      return null;
    }
  }

  function claims(token) {
    try {
      const segment = String(token || "").split(".")[1];
      if (!segment) return null;
      const normalized = segment.replace(/-/g, "+").replace(/_/g, "/");
      const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
      const binary = global.atob(padded);
      const json = decodeURIComponent(
        Array.from(binary, (ch) => "%" + ch.charCodeAt(0).toString(16).padStart(2, "0")).join(""),
      );
      const parsed = JSON.parse(json);
      return parsed && typeof parsed === "object" ? parsed : null;
    } catch {
      return null;
    }
  }

  function usable(token) {
    if (typeof token !== "string" || token.split(".").length !== 3) return false;
    const data = claims(token);
    const exp = data ? Number(data.exp) : NaN;
    return Number.isFinite(exp) && exp * 1000 > Date.now() + 5000;
  }

  function clearToken() {
    const store = storage();
    if (!store) return;
    try {
      store.removeItem(TOKEN_KEY);
    } catch {
      /* Storage can be blocked in private browsing. */
    }
  }

  function getToken() {
    const store = storage();
    if (!store) return "";
    let token = "";
    try {
      token = store.getItem(TOKEN_KEY) || "";
    } catch {
      return "";
    }
    if (!usable(token)) {
      clearToken();
      return "";
    }
    return token;
  }

  function setToken(token) {
    if (!usable(token)) {
      const error = new Error("The server returned a session that could not be used. Please try again.");
      error.kind = "malformed";
      throw error;
    }
    const store = storage();
    if (!store) {
      const error = new Error("This browser could not store the sign-in session. Allow session storage and try again.");
      error.kind = "storage";
      throw error;
    }
    try {
      store.setItem(TOKEN_KEY, token);
    } catch {
      const error = new Error("This browser could not store the sign-in session. Allow session storage and try again.");
      error.kind = "storage";
      throw error;
    }
  }

  function displayName() {
    const data = claims(getToken());
    const name = data && typeof data.UserName === "string" ? data.UserName.trim() : "";
    return name || "Administrator";
  }

  function setNotice(message) {
    const store = storage();
    if (!store) return;
    const text = String(message || "").trim().slice(0, 300);
    try {
      if (text) store.setItem(NOTICE_KEY, text);
      else store.removeItem(NOTICE_KEY);
    } catch {
      /* Ignore quota or privacy errors for a transient notice. */
    }
  }

  function takeNotice() {
    const store = storage();
    if (!store) return "";
    try {
      const message = store.getItem(NOTICE_KEY) || "";
      store.removeItem(NOTICE_KEY);
      return message;
    } catch {
      return "";
    }
  }

  global.UgcAdminSession = {
    getToken,
    setToken,
    clear: clearToken,
    displayName,
    isAuthenticated: () => Boolean(getToken()),
    setNotice,
    takeNotice,
  };
})(window);
