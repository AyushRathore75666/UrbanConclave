(function () {
  const session = window.UgcAdminSession;
  const api = window.UgcAdminApi;
  const pageSizes = window.UGC_ADMIN_CONFIG.pageSizes;

  const DETAIL_GROUPS = [
    {
      title: "Registration",
      fields: [
        ["registration_id", "Registration ID"],
        ["registration_status", "Registration status"],
        ["created_date_india", "Created (India time)"],
        ["created_date", "Created (recorded)"],
        ["updated_date", "Updated"],
        ["created_by", "Created by"],
        ["updated_by", "Updated by"],
      ],
    },
    {
      title: "Contact",
      fields: [
        ["full_name", "Full name"],
        ["designation", "Designation"],
        ["email_id", "Email"],
        ["mobile_number", "Mobile number"],
        ["city", "City"],
        ["state", "State"],
      ],
    },
    {
      title: "Organization",
      fields: [
        ["organization", "Organization"],
        ["sector", "Sector"],
        ["company_website", "Company website"],
        ["attending_as", "Attending as"],
      ],
    },
    {
      title: "HCM meeting",
      fields: [
        ["request_hcm_meeting", "HCM meeting request"],
        ["hcm_organization_name", "HCM organization"],
        ["hcm_investment_sector", "Investment sector"],
        ["brief_meeting_agenda", "Meeting agenda"],
      ],
    },
    {
      title: "Investment",
      fields: [
        ["proposed_investment_crore", "Proposed investment"],
        ["proposed_location", "Proposed location"],
      ],
    },
    {
      title: "Sessions and panels",
      fields: [
        ["plenary_session", "Plenary session"],
        ["panel_1", "Panel 1"],
        ["panel_2", "Panel 2"],
        ["panel_3", "Panel 3"],
        ["panel_4", "Panel 4"],
        ["panel_5", "Panel 5"],
        ["panel_6", "Panel 6"],
        ["panel_7", "Panel 7"],
        ["panel_8", "Panel 8"],
        ["panel_9", "Panel 9"],
        ["panel_10", "Panel 10"],
        ["panel_11", "Panel 11"],
        ["panel_12", "Panel 12"],
      ],
    },
    {
      title: "Consent",
      fields: [
        ["information_confirmed", "Information confirmed"],
        ["communication_consent", "Communication consent"],
      ],
    },
    {
      title: "Other",
      fields: [
        ["other1", "Other 1"],
        ["other2", "Other 2"],
        ["other3", "Other 3"],
        ["other4", "Other 4"],
      ],
    },
  ];

  const TABLE_COLUMNS = [
    ["registration_id", "Registration ID"],
    ["full_name", "Full Name"],
    ["designation", "Designation"],
    ["organization", "Organization"],
    ["sector", "Sector"],
    ["email_id", "Email"],
    ["mobile_number", "Mobile Number"],
    ["city", "City"],
    ["state", "State"],
    ["attending_as", "Attending As"],
    ["request_hcm_meeting", "HCM Meeting Request"],
    ["hcm_investment_sector", "Investment Sector"],
    ["proposed_investment_crore", "Proposed Investment"],
    ["registration_status", "Registration Status"],
    ["created_date_india", "Created Date"],
  ];

  const WIDE_FIELDS = new Set(["brief_meeting_agenda"]);
  const DATE_FIELDS = new Set(["created_date", "created_date_india", "updated_date"]);
  const FIELD_LABELS = new Map(DETAIL_GROUPS.flatMap((group) => group.fields));
  const FIELD_ORDER = DETAIL_GROUPS.flatMap((group) => group.fields.map(([key]) => key));
  const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const numberFormat = new Intl.NumberFormat("en-IN");

  const totalLabel = document.getElementById("total-label");
  const totalCount = document.getElementById("total-count");
  const refreshButton = document.getElementById("refresh-registrations");
  const exportButton = document.getElementById("export-registrations");
  const filterForm = document.getElementById("registration-filters");
  const filterName = document.getElementById("filter-name");
  const filterMobile = document.getElementById("filter-mobile");
  const filterEmail = document.getElementById("filter-email");
  const searchButton = document.getElementById("search-registrations");
  const clearButton = document.getElementById("clear-filters");
  const filterNote = document.getElementById("filter-note");
  const alertBox = document.getElementById("dashboard-alert");
  const listStatus = document.getElementById("list-status");
  const tablePanel = document.getElementById("registry-panel");
  const tableBody = document.getElementById("registry-body");
  const pageSizeSelect = document.getElementById("page-size");
  const pagination = document.getElementById("pagination");
  const pageNumbers = document.getElementById("page-numbers");
  const dialog = document.getElementById("detail-dialog");
  const dialogTitle = document.getElementById("detail-title");
  const dialogBody = document.getElementById("detail-body");

  const state = {
    rows: [],
    totalRecords: 0,
    page: 1,
    pageSize: window.UGC_ADMIN_CONFIG.pageSize,
    loaded: false,
    loading: false,
    exporting: false,
    filters: { fullName: null, mobileNumber: null, emailId: null },
  };
  let inFlight = false;

  function redirectToLogin() {
    document.body.classList.add("admin-gate");
    location.replace("login.html");
  }

  function endSession(message) {
    session.clear();
    session.setNotice(message || "Your session has ended. Please sign in again.");
    redirectToLogin();
  }

  function blank(value) {
    if (value == null) return true;
    return typeof value === "string" && !value.trim();
  }

  function formatTimestamp(value) {
    const match = String(value ?? "").match(/^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})/);
    if (!match) return "";
    const hour = Number(match[4]);
    const suffix = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    return match[3] + " " + MONTHS[Number(match[2]) - 1] + " " + match[1] + ", " + hour12 + ":" + match[5] + " " + suffix;
  }

  function formatValue(key, value) {
    if (blank(value)) return "—";
    if (typeof value === "boolean") return value ? "Yes" : "No";
    if (DATE_FIELDS.has(key)) return formatTimestamp(value) || String(value);
    if (typeof value === "number" && Number.isFinite(value)) {
      const formatted = numberFormat.format(value);
      return key === "proposed_investment_crore" ? formatted + " crore" : formatted;
    }
    if (typeof value === "string") return value;
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }

  function displayCell(row, key) {
    if (key === "created_date_india") return formatValue(key, row.created_date_india || row.created_date);
    return formatValue(key, row[key]);
  }

  function filtersActive() {
    return Boolean(state.filters.fullName || state.filters.mobileNumber || state.filters.emailId);
  }

  function showAlert(message) {
    alertBox.textContent = message || "";
    alertBox.hidden = !message;
  }

  function pageCount() {
    return Math.max(1, Math.ceil(state.rows.length / state.pageSize));
  }

  function visiblePages(current, total) {
    const windowSize = 11;
    if (total <= windowSize) {
      return Array.from({ length: total }, (_, index) => index + 1);
    }
    let start = current - 5;
    let end = current + 5;
    if (start < 1) {
      start = 1;
      end = windowSize;
    }
    if (end > total) {
      end = total;
      start = total - windowSize + 1;
    }
    const pages = [];
    for (let page = start; page <= end; page += 1) pages.push(page);
    return pages;
  }

  function setBusy(loading) {
    state.loading = loading;
    refreshButton.disabled = loading;
    searchButton.disabled = loading;
    clearButton.disabled = loading;
    refreshButton.textContent = loading ? "Refreshing…" : "Refresh";
    tablePanel.setAttribute("aria-busy", loading ? "true" : "false");
  }

  function renderStatus() {
    if (state.loading) {
      listStatus.textContent = state.loaded ? "Refreshing registrations…" : "Loading registrations…";
      return;
    }
    if (!state.loaded || !state.rows.length) {
      listStatus.textContent = "";
      return;
    }
    const start = (state.page - 1) * state.pageSize;
    const end = Math.min(start + state.pageSize, state.rows.length);
    listStatus.textContent = "Showing " + (start + 1) + "–" + end + " of " + numberFormat.format(state.rows.length);
  }

  function renderPagination() {
    const pages = pageCount();
    const show = state.loaded && pages > 1;
    pagination.hidden = !show;
    pagination.querySelector("[data-page='first']").disabled = state.page <= 1;
    pagination.querySelector("[data-page='prev']").disabled = state.page <= 1;
    pagination.querySelector("[data-page='next']").disabled = state.page >= pages;
    pagination.querySelector("[data-page='last']").disabled = state.page >= pages;
    const numbers = document.createDocumentFragment();
    visiblePages(state.page, pages).forEach((page) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "btn btn-small page-num" + (page === state.page ? " is-current" : " btn-line");
      button.dataset.page = String(page);
      button.textContent = String(page);
      button.setAttribute("aria-label", "Page " + page);
      if (page === state.page) button.setAttribute("aria-current", "page");
      numbers.appendChild(button);
    });
    pageNumbers.replaceChildren(numbers);
  }

  function renderTable() {
    const fragment = document.createDocumentFragment();
    if (!state.rows.length) {
      const row = document.createElement("tr");
      const cell = document.createElement("td");
      cell.colSpan = TABLE_COLUMNS.length + 2;
      cell.className = "empty-cell";
      if (!state.loaded && state.loading) cell.textContent = "Loading registrations…";
      else if (!state.loaded) cell.textContent = "Registrations could not be loaded.";
      else cell.textContent = "No registrations found";
      row.appendChild(cell);
      fragment.appendChild(row);
    } else {
      const start = (state.page - 1) * state.pageSize;
      state.rows.slice(start, start + state.pageSize).forEach((record, index) => {
        const row = document.createElement("tr");
        const serial = document.createElement("td");
        serial.className = "col-serial";
        serial.textContent = String(start + index + 1);
        row.appendChild(serial);
        TABLE_COLUMNS.forEach(([key]) => {
          const cell = document.createElement("td");
          cell.className = "col-" + key;
          cell.setAttribute("translate", "no");
          if (key === "registration_status") {
            const badge = document.createElement("span");
            badge.className = "status-badge";
            badge.dataset.status = String(record.registration_status || "").trim().toLowerCase();
            badge.textContent = displayCell(record, key);
            cell.appendChild(badge);
          } else {
            cell.textContent = displayCell(record, key);
          }
          row.appendChild(cell);
        });
        const action = document.createElement("td");
        action.className = "col-action";
        const button = document.createElement("button");
        button.type = "button";
        button.className = "btn btn-line btn-small";
        button.dataset.index = String(start + index);
        const name = blank(record.full_name) ? "this registration" : String(record.full_name);
        button.setAttribute("aria-label", "View details for " + name);
        button.textContent = "View details";
        action.appendChild(button);
        row.appendChild(action);
        fragment.appendChild(row);
      });
    }
    tableBody.replaceChildren(fragment);
  }

  function render() {
    const pages = pageCount();
    if (state.page > pages) state.page = pages;
    if (state.page < 1) state.page = 1;
    totalLabel.textContent = filtersActive() ? "Matching registrations" : "Total Registrations";
    totalCount.textContent = state.loaded ? numberFormat.format(state.totalRecords) : "—";
    filterNote.hidden = !filtersActive();
    exportButton.disabled = state.loading || state.exporting || !state.rows.length;
    exportButton.textContent = state.exporting ? "Exporting CSV…" : "Export CSV";
    renderStatus();
    renderPagination();
    renderTable();
  }

  function readFilters() {
    return {
      fullName: filterName.value.trim() || null,
      mobileNumber: filterMobile.value.trim() || null,
      emailId: filterEmail.value.trim() || null,
    };
  }

  async function loadRegistrations(options = {}) {
    if (inFlight) return;
    if (!session.isAuthenticated()) {
      endSession("Your session has ended. Please sign in again.");
      return;
    }
    const filters = options.filters || state.filters;
    inFlight = true;
    if (dialog.open) dialog.close();
    setBusy(true);
    render();
    try {
      /* The service returns the full filtered list. Rows are paged in the browser
         until the API accepts page and pageSize, which can be passed through here. */
      const result = await api.getRegistrations(filters);
      state.filters = {
        fullName: filters.fullName,
        mobileNumber: filters.mobileNumber,
        emailId: filters.emailId,
      };
      state.rows = result.rows;
      state.totalRecords = result.totalRecords;
      state.loaded = true;
      if (options.resetPage) state.page = 1;
      showAlert("");
    } catch (error) {
      if (error && error.kind === "unauthorized") {
        endSession(error.message);
        return;
      }
      if (options.restoreInputs) {
        filterName.value = state.filters.fullName || "";
        filterMobile.value = state.filters.mobileNumber || "";
        filterEmail.value = state.filters.emailId || "";
      }
      showAlert((error && error.message) || "The request could not be completed.");
    } finally {
      inFlight = false;
      setBusy(false);
      render();
    }
  }

  function addDefinition(parent, label, value, wide) {
    const wrap = document.createElement("div");
    wrap.className = wide ? "detail-field is-wide" : "detail-field";
    const term = document.createElement("dt");
    term.textContent = label;
    const description = document.createElement("dd");
    description.setAttribute("translate", "no");
    description.textContent = value;
    wrap.append(term, description);
    parent.appendChild(wrap);
  }

  function openDetails(record) {
    const name = blank(record.full_name) ? "Registration" : String(record.full_name);
    const id = blank(record.registration_id) ? "" : String(record.registration_id);
    dialogTitle.textContent = id ? name + " — " + id : name;
    dialogBody.replaceChildren();
    const seen = new Set();
    DETAIL_GROUPS.forEach((group) => {
      const section = document.createElement("section");
      section.className = "detail-section";
      const heading = document.createElement("h3");
      heading.textContent = group.title;
      const list = document.createElement("dl");
      list.className = "detail-grid";
      group.fields.forEach(([key, label]) => {
        seen.add(key);
        addDefinition(list, label, formatValue(key, record[key]), WIDE_FIELDS.has(key));
      });
      section.append(heading, list);
      dialogBody.appendChild(section);
    });

    const extras = Object.keys(record).filter((key) => !seen.has(key));
    if (extras.length) {
      const section = document.createElement("section");
      section.className = "detail-section";
      const heading = document.createElement("h3");
      heading.textContent = "Additional information";
      const list = document.createElement("dl");
      list.className = "detail-grid";
      extras.forEach((key) => {
        const label = FIELD_LABELS.get(key) || key.replace(/_/g, " ");
        addDefinition(list, label, formatValue(key, record[key]), false);
      });
      section.append(heading, list);
      dialogBody.appendChild(section);
    }

    if (typeof dialog.showModal === "function" && !dialog.open) dialog.showModal();
    else dialog.setAttribute("open", "");
  }

  function csvCell(value) {
    let text = value == null ? "" : String(value);
    if (/^[=+\-@\t\r]/.test(text)) text = "'" + text;
    if (/[",\n\r]/.test(text)) text = '"' + text.replace(/"/g, '""') + '"';
    return text;
  }

  function exportValue(value) {
    if (value == null) return "";
    if (typeof value === "boolean") return value ? "true" : "false";
    if (typeof value === "object") {
      try {
        return JSON.stringify(value);
      } catch {
        return "";
      }
    }
    return String(value);
  }

  function exportKeys(rows) {
    const extras = new Set();
    rows.forEach((row) => {
      Object.keys(row).forEach((key) => {
        if (!FIELD_LABELS.has(key)) extras.add(key);
      });
    });
    return FIELD_ORDER.concat([...extras].sort());
  }

  async function exportRegistrations() {
    if (state.exporting || state.loading || !state.rows.length) return;
    state.exporting = true;
    render();
    try {
      const snapshot = state.rows.slice();
      const keys = exportKeys(snapshot);
      const headerLabels = keys.map((key) => FIELD_LABELS.get(key) || key.replace(/_/g, " "));
      const parts = ["\uFEFF" + headerLabels.map(csvCell).join(",") + "\r\n"];
      for (let index = 0; index < snapshot.length; index += 400) {
        const lines = snapshot.slice(index, index + 400).map((row) => keys.map((key) => csvCell(exportValue(row[key]))).join(","));
        parts.push(lines.join("\r\n") + "\r\n");
        await new Promise((resolve) => window.setTimeout(resolve, 0));
      }
      const blob = new Blob(parts, { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const now = new Date();
      const pad = (value) => String(value).padStart(2, "0");
      const stamp = now.getFullYear() + pad(now.getMonth() + 1) + pad(now.getDate()) + "-" + pad(now.getHours()) + pad(now.getMinutes());
      const link = document.createElement("a");
      link.href = url;
      link.download = "ugc-registrations-" + stamp + ".csv";
      link.rel = "noopener";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 2000);
    } catch {
      showAlert("The export could not be prepared. Please try again.");
    } finally {
      state.exporting = false;
      render();
    }
  }

  function init() {
    document.getElementById("admin-name").textContent = session.displayName();
    document.body.classList.remove("admin-gate");

    document.getElementById("logout").addEventListener("click", () => {
      session.clear();
      redirectToLogin();
    });

    refreshButton.addEventListener("click", () => loadRegistrations());

    filterForm.addEventListener("submit", (event) => {
      event.preventDefault();
      if (inFlight) return;
      loadRegistrations({ filters: readFilters(), resetPage: true });
    });

    clearButton.addEventListener("click", () => {
      if (inFlight) return;
      filterName.value = "";
      filterMobile.value = "";
      filterEmail.value = "";
      loadRegistrations({
        filters: { fullName: null, mobileNumber: null, emailId: null },
        resetPage: true,
        restoreInputs: true,
      });
    });

    exportButton.addEventListener("click", () => exportRegistrations());

    pageSizeSelect.addEventListener("change", () => {
      const next = Number(pageSizeSelect.value);
      if (!pageSizes.includes(next) || next === state.pageSize) return;
      state.pageSize = next;
      state.page = 1;
      render();
    });

    pagination.addEventListener("click", (event) => {
      const button = event.target.closest("[data-page]");
      if (!button || button.disabled) return;
      const pages = pageCount();
      const target = button.dataset.page;
      if (target === "first") state.page = 1;
      else if (target === "prev") state.page = Math.max(1, state.page - 1);
      else if (target === "next") state.page = Math.min(pages, state.page + 1);
      else if (target === "last") state.page = pages;
      else {
        const page = Number(target);
        if (!Number.isInteger(page) || page < 1 || page > pages || page === state.page) return;
        state.page = page;
      }
      render();
      tablePanel.scrollIntoView({ block: "nearest" });
    });

    tableBody.addEventListener("click", (event) => {
      const button = event.target.closest("[data-index]");
      if (!button) return;
      const record = state.rows[Number(button.dataset.index)];
      if (record) openDetails(record);
    });

    document.getElementById("detail-close").addEventListener("click", () => dialog.close());
    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) dialog.close();
    });
    dialog.addEventListener("close", () => {
      dialogTitle.textContent = "Registration details";
      dialogBody.replaceChildren();
    });

    window.addEventListener("pageshow", () => {
      if (!session.isAuthenticated()) redirectToLogin();
    });

    loadRegistrations();
  }

  if (!session.isAuthenticated()) redirectToLogin();
  else init();
})();
