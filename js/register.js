(function () {
  const form = document.getElementById("registration-form");
  if (!form) return;

  const copy = {
    en: {
      required: "This field is required.",
      nameRequired: "Name is required.",
      nameLetters: "Name can contain letters only. Numbers are not allowed.",
      designationRequired: "Designation is required.",
      designationLetters: "Designation can contain letters only. Numbers are not allowed.",
      cityRequired: "City is required.",
      cityLetters: "City can contain letters only. Numbers are not allowed.",
      mobileRequired: "Mobile number is required.",
      mobile: "Enter a valid 10-digit mobile number. Only numbers are allowed.",
      emailRequired: "Email is required.",
      email: "Enter a valid email address.",
      website: "Enter a valid website, such as example.com.",
      amount: "Enter a number greater than 0.",
      wordLimit: "Maximum 150 words",
      words: "words",
      submit: "Submit Registration",
      submitting: "Submitting…",
      fail: "Unable to submit. Please try again.",
    },
    hi: {
      required: "यह फ़ील्ड अनिवार्य है।",
      nameRequired: "नाम अनिवार्य है।",
      nameLetters: "नाम में केवल अक्षर लिखें। अंक मान्य नहीं हैं।",
      designationRequired: "पद अनिवार्य है।",
      designationLetters: "पद में केवल अक्षर लिखें। अंक मान्य नहीं हैं।",
      cityRequired: "शहर अनिवार्य है।",
      cityLetters: "शहर में केवल अक्षर लिखें। अंक मान्य नहीं हैं।",
      mobileRequired: "मोबाइल नंबर अनिवार्य है।",
      mobile: "मान्य 10 अंकों का मोबाइल नंबर लिखें। केवल अंक मान्य हैं।",
      emailRequired: "ईमेल अनिवार्य है।",
      email: "मान्य ईमेल पता लिखें।",
      website: "मान्य वेबसाइट लिखें, जैसे example.com।",
      amount: "0 से बड़ी संख्या लिखें।",
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

  const hcmFields = document.getElementById("hcm-fields");
  const agenda = document.getElementById("hcmAgenda");
  const wordCount = document.getElementById("word-count");
  const formError = document.getElementById("form-error");
  const submitButton = document.getElementById("submit-registration");
  const toast = document.getElementById("form-toast");

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

  function showError(name, message, code) {
    const slot = form.querySelector("[data-error='" + name + "']");
    if (!slot) return;
    slot.textContent = message || "";
    slot.hidden = !message;
    if (message && code) slot.dataset.code = code;
    else delete slot.dataset.code;
  }

  function lettersOnly(value) {
    return value.replace(/[0-9]/g, "");
  }

  function mobileDigits(value) {
    let digits = value.replace(/\D/g, "");
    if (digits.length > 10 && digits.startsWith("91")) digits = digits.slice(2);
    return digits.slice(0, 10);
  }

  function amountDigits(value) {
    const cleaned = value.replace(/[^\d.]/g, "");
    const parts = cleaned.split(".");
    if (parts.length === 1) return cleaned;
    return parts[0] + "." + parts.slice(1).join("").slice(0, 2);
  }

  function tidy(control) {
    if (!control || !control.name) return;
    let next = control.value;
    if (control.name === "mobile") next = mobileDigits(control.value);
    else if (control.name === "contactName" || control.name === "designation" || control.name === "city") next = lettersOnly(control.value);
    else if (control.name === "hcmAmount") next = amountDigits(control.value);
    if (next !== control.value) control.value = next;
  }

  function lettersOk(value) {
    return /^[\p{L}][\p{L}\s.'’\-&/]*$/u.test(value) && (value.match(/\p{L}/gu) || []).length >= 2;
  }

  function websiteOk(value) {
    const trimmed = value.trim();
    if (!trimmed) return true;
    try {
      const url = new URL(/^https?:\/\//i.test(trimmed) ? trimmed : "https://" + trimmed);
      return url.hostname.includes(".") && !/\s/.test(trimmed);
    } catch {
      return false;
    }
  }

  function issue(name, draft) {
    const messages = text();
    const value = String(draft[name] ?? "").trim();
    if (name === "contactName" || name === "designation" || name === "city") {
      const label = name === "contactName" ? "name" : name === "designation" ? "designation" : "city";
      if (!value) return [label + "Required", messages[label + "Required"]];
      if (!lettersOk(value)) return [label + "Letters", messages[label + "Letters"]];
      return null;
    }
    if (name === "companyName" || name === "stateRegion" || name === "attendingAs" || name === "sector" || name === "hcmSector" || name === "hcmLocation") {
      if (!value) return ["required", messages.required];
      return null;
    }
    if (name === "email") {
      if (!value) return ["emailRequired", messages.emailRequired];
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) return ["email", messages.email];
      return null;
    }
    if (name === "mobile") {
      if (!value) return ["mobileRequired", messages.mobileRequired];
      if (!/^[6-9]\d{9}$/.test(value)) return ["mobile", messages.mobile];
      return null;
    }
    if (name === "website") {
      if (!websiteOk(value)) return ["website", messages.website];
      return null;
    }
    if (name === "hcmAmount") {
      if (!/^\d+(\.\d{1,2})?$/.test(value) || Number(value) <= 0) return ["amount", messages.amount];
      return null;
    }
    if (name === "hcmAgenda") {
      if (!value) return ["required", messages.required];
      if (words(value) > 150) return ["wordLimit", messages.wordLimit];
      return null;
    }
    if (name === "hcmRequested") {
      if (value !== "yes" && value !== "no") return ["required", messages.required];
      return null;
    }
    if (name === "updatesConsent") {
      if (!draft.updatesConsent) return ["required", messages.required];
      return null;
    }
    return null;
  }

  function clearErrors() {
    form.querySelectorAll("[data-error]").forEach((slot) => {
      slot.textContent = "";
      slot.hidden = true;
      delete slot.dataset.code;
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
    const checks = ["contactName", "designation", "companyName", "email", "mobile", "city", "stateRegion", "website", "attendingAs", "sector", "hcmRequested", "updatesConsent"];
    if (draft.hcmRequested === "yes") checks.push("hcmSector", "hcmAmount", "hcmLocation", "hcmAgenda");
    let ok = true;
    checks.forEach((name) => {
      const found = issue(name, draft);
      if (!found) return;
      ok = false;
      showError(name, found[1], found[0]);
    });
    return ok;
  }

  const sessionMap = [
    ["panel-1", "panel1", "Beyond Metros"],
    ["panel-2", "panel2", "Reimagining Urban Governance"],
    ["panel-3", "panel3", "Building Climate-Smart Cities"],
    ["panel-4", "panel4", "Urban Financing & Investment in Madhya Pradesh"],
    ["simhastha", "panel5", "Simhastha"],
    ["solar", "panel6", "Solar"],
    ["hackathon", "panel7", "Hackathon"],
    ["one-to-one", "panel8", "Meet one to one leadership"],
  ];

  function selectedText(name) {
    const control = form.elements.namedItem(name);
    const option = control?.selectedOptions?.[0];
    if (!option || !String(option.value || "").trim()) return "";
    return (option.dataset.en || option.textContent || "").trim();
  }

  function buildPayload() {
    const draft = readDraft();
    const meeting = draft.hcmRequested === "yes";
    const chosen = new Set(draft.sessions);
    const payload = {
      registrationId: "",
      fullName: draft.contactName.trim(),
      designation: draft.designation.trim(),
      organization: draft.companyName.trim(),
      sector: selectedText("sector"),
      emailId: draft.email.trim(),
      mobileNumber: draft.mobile.trim(),
      city: draft.city.trim(),
      state: selectedText("stateRegion"),
      companyWebsite: draft.website.trim(),
      attendingAs: selectedText("attendingAs"),
      requestHcmMeeting: meeting,
      hcmOrganizationName: meeting ? draft.companyName.trim() : "",
      hcmInvestmentSector: meeting ? draft.hcmSector.trim() : "",
      proposedInvestmentCrore: meeting ? Number(draft.hcmAmount) : 0,
      proposedLocation: meeting ? draft.hcmLocation.trim() : "",
      briefMeetingAgenda: meeting ? draft.hcmAgenda.trim() : "",
      informationConfirmed: true,
      communicationConsent: true,
      registrationStatus: "",
      createdBy: "",
      updatedBy: "",
      plenarySession: "",
      panel1: "",
      panel2: "",
      panel3: "",
      panel4: "",
      panel5: "",
      panel6: "",
      panel7: "",
      panel8: "",
      panel9: "",
      panel10: "",
      panel11: "",
      panel12: "",
      other1: "",
      other2: "",
      other3: "",
      other4: "",
    };
    sessionMap.forEach(([value, key, label]) => {
      if (chosen.has(value)) payload[key] = label;
    });
    return payload;
  }

  let toastTimer = 0;
  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.hidden = true;
    }, 8000);
  }

  toast?.addEventListener("click", () => {
    toast.hidden = true;
    clearTimeout(toastTimer);
  });

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
  const allowed = new Set([...form.querySelectorAll("input[name='sessions']")].map((input) => input.value));
  if (initialSession && allowed.has(initialSession)) {
    const box = form.querySelector("input[name='sessions'][value='" + initialSession + "']");
    if (box) box.checked = true;
  }
  if (params.get("hcm") === "1") {
    const yes = form.querySelector("input[name='hcmRequested'][value='yes']");
    if (yes) yes.checked = true;
  }

  ["contactName", "designation", "city", "mobile", "hcmAmount"].forEach((name) => tidy(form.elements.namedItem(name)));
  syncHcm();
  refreshWords();
  form.addEventListener("change", (event) => {
    if (event.target.name === "hcmRequested") syncHcm();
    writeDraft();
  });
  const letterFields = new Set(["contactName", "designation", "city"]);

  function rejectsText(name, value) {
    if (!name || !value) return false;
    if (name === "mobile") return /\D/.test(value);
    if (letterFields.has(name)) return /\d/.test(value);
    if (name === "hcmAmount") return /[^\d.]/.test(value);
    return false;
  }

  function refreshField(name) {
    if (!name || !form.querySelector("[data-error='" + name + "']")) return;
    const found = issue(name, readDraft());
    if (!found) showError(name, "");
    else showError(name, found[1], found[0]);
  }

  form.addEventListener("keydown", (event) => {
    const control = event.target;
    if (event.ctrlKey || event.metaKey || event.altKey) return;
    if (event.key.length === 1 && rejectsText(control?.name, event.key)) event.preventDefault();
  });
  form.addEventListener("beforeinput", (event) => {
    const control = event.target;
    if (!control || !event.data || !rejectsText(control.name, event.data)) return;
    event.preventDefault();
    if (event.inputType !== "insertFromPaste") return;
    const start = control.selectionStart ?? control.value.length;
    const end = control.selectionEnd ?? start;
    const merged = control.value.slice(0, start) + event.data + control.value.slice(end);
    if (control.name === "mobile") control.value = mobileDigits(merged);
    else if (letterFields.has(control.name)) control.value = lettersOnly(merged);
    else if (control.name === "hcmAmount") control.value = amountDigits(merged);
    control.dispatchEvent(new Event("input", { bubbles: true }));
  });
  form.addEventListener("input", (event) => {
    tidy(event.target);
    refreshWords();
    writeDraft();
    const slot = event.target?.name && form.querySelector("[data-error='" + event.target.name + "']");
    if (slot && !slot.hidden) refreshField(event.target.name);
  });
  form.addEventListener("focusout", (event) => {
    if (event.target?.name) refreshField(event.target.name);
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    ["contactName", "designation", "city", "mobile", "hcmAmount"].forEach((name) => tidy(form.elements.namedItem(name)));
    writeDraft();
    if (!validate()) {
      requestAnimationFrame(() => {
        form.querySelector(".field-error:not([hidden])")?.scrollIntoView({ behavior: "smooth", block: "center" });
      });
      return;
    }
    if (toast) toast.hidden = true;
    submitButton.disabled = true;
    submitButton.textContent = text().submitting;
    try {
      const response = await fetch("https://urbangis.mp.gov.in/api/UGC/Register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildPayload()),
      });
      const body = await response.json().catch(() => null);
      if (!body || body.success !== true) {
        showToast((body && body.message) || text().fail);
        submitButton.disabled = false;
        submitButton.textContent = text().submit;
        return;
      }
      const registration = body.registration || {};
      sessionStorage.setItem(
        "ugc-registration-result",
        JSON.stringify({
          registrationId: registration.registrationId || body.registrationId || "",
          notificationId: body.notification_id || "",
          notificationMessage: body.notification_message || body.message || "",
        }),
      );
      localStorage.removeItem(draftKey);
      location.replace("thank-you.html");
    } catch {
      showToast(text().fail);
      submitButton.disabled = false;
      submitButton.textContent = text().submit;
    }
  });

  document.addEventListener("localechange", () => {
    refreshWords();
    if (!submitButton.disabled) submitButton.textContent = text().submit;
    form.querySelectorAll("[data-error]").forEach((slot) => {
      if (slot.hidden || !slot.dataset.code) return;
      slot.textContent = text()[slot.dataset.code] || text().required;
    });
  });
})();
