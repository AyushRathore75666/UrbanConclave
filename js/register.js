(function () {
  const form = document.getElementById("registration-form");
  if (!form) return;

  const copy = {
    en: {
      required: "Required",
      wordLimit: "Maximum 150 words",
      words: "words",
      submit: "Submit Registration",
      submitting: "Submitting…",
      fail: "Unable to submit. Please try again.",
    },
    hi: {
      required: "अनिवार्य",
      wordLimit: "अधिकतम 150 शब्द",
      words: "शब्द",
      submit: "पंजीकरण जमा करें",
      submitting: "जमा हो रहा है…",
      fail: "जमा नहीं हो सका। कृपया फिर कोशिश करें।",
    },
  };

  const draftKey = "ugc2026-registration-v1";
  const fields = [
    "contactName",
    "designation",
    "companyName",
    "email",
    "mobile",
    "city",
    "stateRegion",
    "website",
    "attendingAs",
    "sector",
    "hcmRequested",
    "hcmSector",
    "hcmAmount",
    "hcmLocation",
    "hcmAgenda",
  ];

  const hero = document.getElementById("register-hero");
  const registration = document.getElementById("registration");
  const confirmation = document.getElementById("confirmation");
  const reference = document.getElementById("reference");
  const hcmFields = document.getElementById("hcm-fields");
  const agenda = document.getElementById("hcmAgenda");
  const wordCount = document.getElementById("word-count");
  const formError = document.getElementById("form-error");
  const submitButton = document.getElementById("submit-registration");
  const another = document.getElementById("another");

  function lang() {
    return localStorage.getItem("ugc-locale") === "hi" ? "hi" : "en";
  }

  function text() {
    return copy[lang()];
  }

  function words(value) {
    const trimmed = value.trim();
    return trimmed ? trimmed.split(/\s+/).length : 0;
  }

  function selectedSessions() {
    return [...form.querySelectorAll("input[name='sessions']:checked")].map((input) => input.value);
  }

  function controlValue(control) {
    if (!control) return "";
    if (typeof control.value === "string") return control.value;
    return "";
  }

  function readDraft() {
    const data = { sessions: selectedSessions(), updatesConsent: form.updatesConsent.checked };
    fields.forEach((name) => {
      data[name] = controlValue(form.elements.namedItem(name));
    });
    return data;
  }

  function writeDraft() {
    localStorage.setItem(draftKey, JSON.stringify(readDraft()));
  }

  function showError(name, message) {
    const slot = form.querySelector("[data-error='" + name + "']");
    if (!slot) return;
    slot.textContent = message || "";
    slot.hidden = !message;
  }

  function clearErrors() {
    form.querySelectorAll("[data-error]").forEach((slot) => {
      slot.textContent = "";
      slot.hidden = true;
    });
    if (formError) {
      formError.hidden = true;
      formError.textContent = "";
    }
  }

  function refreshWords() {
    if (!agenda || !wordCount) return;
    const count = words(agenda.value);
    wordCount.textContent = count + "/150 " + text().words;
    wordCount.classList.toggle("over", count > 150);
  }

  function syncHcm() {
    const yes = form.querySelector("input[name='hcmRequested'][value='yes']")?.checked;
    if (hcmFields) hcmFields.hidden = !yes;
    hcmFields?.querySelectorAll("input, select, textarea").forEach((control) => {
      control.required = Boolean(yes);
    });
  }

  function validate() {
    clearErrors();
    const draft = readDraft();
    const messages = text();
    const errors = {};
    const need = (key) => {
      if (!String(draft[key] || "").trim()) errors[key] = messages.required;
    };
    need("contactName");
    need("designation");
    need("companyName");
    need("sector");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.email)) errors.email = messages.required;
    if (String(draft.mobile).replace(/\D/g, "").length < 10) errors.mobile = messages.required;
    need("city");
    need("stateRegion");
    need("attendingAs");
    if (draft.hcmRequested !== "yes" && draft.hcmRequested !== "no") errors.hcmRequested = messages.required;
    if (draft.hcmRequested === "yes") {
      need("hcmSector");
      need("hcmLocation");
      need("hcmAgenda");
      if (!draft.hcmAmount || Number(draft.hcmAmount) <= 0) errors.hcmAmount = messages.required;
      if (words(draft.hcmAgenda) > 150) errors.hcmAgenda = messages.wordLimit;
    }
    if (!draft.updatesConsent) errors.updatesConsent = messages.required;
    Object.entries(errors).forEach(([key, message]) => showError(key, message));
    return Object.keys(errors).length === 0;
  }

  function referenceNumber() {
    const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let body = "";
    const bytes = new Uint32Array(8);
    crypto.getRandomValues(bytes);
    for (let i = 0; i < 8; i += 1) body += alphabet[bytes[i] % alphabet.length];
    return "MP-UGC2026-" + body;
  }

  function showConfirmation(code) {
    if (reference) reference.textContent = code;
    hero?.setAttribute("hidden", "");
    registration?.setAttribute("hidden", "");
    confirmation?.removeAttribute("hidden");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const saved = localStorage.getItem(draftKey);
  if (saved) {
    try {
      const draft = JSON.parse(saved);
      fields.forEach((name) => {
        const control = form.elements.namedItem(name);
        if (!control || draft[name] == null) return;
        if (typeof control.length === "number" && control[0] && !control.tagName) {
          [...control].forEach((radio) => {
            radio.checked = radio.value === draft[name];
          });
        } else {
          control.value = draft[name];
        }
      });
      if (Array.isArray(draft.sessions)) {
        form.querySelectorAll("input[name='sessions']").forEach((input) => {
          input.checked = draft.sessions.includes(input.value);
        });
      }
      if (typeof draft.updatesConsent === "boolean") form.updatesConsent.checked = draft.updatesConsent;
    } catch {
      localStorage.removeItem(draftKey);
    }
  }

  const params = new URLSearchParams(location.search);
  const initialSession = params.get("session") || params.get("sector");
  const allowed = new Set(["plenary", ...[...form.querySelectorAll("input[name='sessions']")].map((input) => input.value)]);
  if (initialSession && allowed.has(initialSession)) {
    const box = form.querySelector("input[name='sessions'][value='" + initialSession + "']");
    if (box) box.checked = true;
  }
  if (params.get("hcm") === "1") {
    const yes = form.querySelector("input[name='hcmRequested'][value='yes']");
    if (yes) yes.checked = true;
  }

  syncHcm();
  refreshWords();
  form.addEventListener("change", (event) => {
    if (event.target.name === "hcmRequested") syncHcm();
    writeDraft();
  });
  form.addEventListener("input", () => {
    refreshWords();
    writeDraft();
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    writeDraft();
    if (!validate()) {
      requestAnimationFrame(() => {
        form.querySelector(".field-error:not([hidden])")?.scrollIntoView({ behavior: "smooth", block: "center" });
      });
      return;
    }
    submitButton.disabled = true;
    submitButton.textContent = text().submitting;
    const code = referenceNumber();
    sessionStorage.setItem("mpgis-last", JSON.stringify({ referenceNumber: code }));
    localStorage.removeItem(draftKey);
    showConfirmation(code);
  });

  another?.addEventListener("click", () => {
    form.reset();
    syncHcm();
    refreshWords();
    clearErrors();
    submitButton.disabled = false;
    submitButton.textContent = text().submit;
    confirmation?.setAttribute("hidden", "");
    hero?.removeAttribute("hidden");
    registration?.removeAttribute("hidden");
    location.hash = "registration";
  });

  document.addEventListener("localechange", () => {
    refreshWords();
    if (!submitButton.disabled) submitButton.textContent = text().submit;
    form.querySelectorAll("[data-error]").forEach((slot) => {
      if (slot.hidden || !slot.textContent) return;
      const messages = text();
      slot.textContent = slot.dataset.error === "hcmAgenda" && words(agenda?.value || "") > 150 ? messages.wordLimit : messages.required;
    });
  });
})();
