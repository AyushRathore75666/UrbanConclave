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
        ["request_hcm_meeting", "HCM Meeting Request & Approval"],
        ["cmmeetapproval", "CM meeting approval"],
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
    ["full_name", "Full Name"],
    ["mobile_number", "Mobile Number"],
    ["email_id", "Email"],
    ["request_hcm_meeting", "HCM Meeting Request & Approval"],
    ["organization", "Organization"],
    ["designation", "Designation"],
    ["sector", "Sector"],
    ["registration_id", "Registration ID"],
    ["registration_status", "Registration Status"],
    ["city", "City"],
    ["state", "State"],
    ["attending_as", "Attending As"],
    ["hcm_investment_sector", "Investment Sector"],
    ["proposed_investment_crore", "Proposed Investment"],
    ["created_date_india", "Created Date"],
  ];

  const CHART_COLORS = ["#5B7CFA", "#F4A574", "#C4B5FD", "#7ED0C4", "#F6C453", "#F09AB8", "#8EC5F6", "#A9D48C", "#F0A3A3", "#C6B39A", "#9BB6E0", "#E3B4E6"];

  const ATTENDING_OPTIONS = [
    ["investor", "Investor"],
    ["developer", "Developer"],
    ["infrastructure", "Infrastructure Company"],
    ["startup", "Startup"],
    ["association", "Industry Association"],
    ["consultant", "Consultant"],
    ["government", "Government Official"],
    ["academia", "Academia"],
    ["other", "Other"],
  ];

  const SECTOR_OPTIONS = [
    ["government-public", "Government & Public Sector"],
    ["real-estate", "Real Estate & Township"],
    ["urban-infrastructure", "Urban Infrastructure & Mobility"],
    ["sustainability", "Sustainability & Waste Management"],
    ["finance", "Finance & Investment"],
    ["technology", "Technology & Smart Governance"],
    ["other", "Other"],
  ];

  const PLENARY_OPTIONS = [
    ["panel-1", "Beyond Metros"],
    ["panel-2", "Reimagining Urban Governance"],
    ["panel-3", "Building Climate-Smart Cities"],
    ["panel-4", "Urban Financing & Investment in Madhya Pradesh"],
    ["simhastha", "Simhastha"],
    ["solar", "Solar"],
    ["hackathon", "Hackathon"],
    ["one-to-one", "Meet one to one leadership"],
  ];

  const PLENARY_FIELDS = [
    [["panel_1", "panel1"], "Beyond Metros"],
    [["panel_2", "panel2"], "Reimagining Urban Governance"],
    [["panel_3", "panel3"], "Building Climate-Smart Cities"],
    [["panel_4", "panel4"], "Urban Financing & Investment in Madhya Pradesh"],
    [["panel_5", "panel5"], "Simhastha"],
    [["panel_6", "panel6"], "Solar"],
    [["panel_7", "panel7"], "Hackathon"],
    [["panel_8", "panel8"], "Meet one to one leadership"],
  ];

  const INVESTMENT_OPTIONS = [
    ["Public", "Public"],
    ["Private", "Private"],
    ["State Government", "State Government"],
    ["Semi Government", "Semi Government"],
    ["Central Government", "Central Government"],
    ["Public Sector Undertaking", "Public Sector Undertaking"],
    ["Other", "Other"],
  ];

  const STATE_OPTIONS = [
    ["Madhya Pradesh", "Madhya Pradesh"],
    ["Maharashtra", "Maharashtra"],
    ["Delhi NCR", "Delhi NCR"],
    ["Gujarat", "Gujarat"],
    ["Karnataka", "Karnataka"],
    ["Telangana", "Telangana"],
    ["Uttar Pradesh", "Uttar Pradesh"],
    ["Rajasthan", "Rajasthan"],
    ["Tamil Nadu", "Tamil Nadu"],
    ["Other State / UT", "Other State / UT"],
  ];

  const WIDE_FIELDS = new Set(["brief_meeting_agenda"]);
  const DATE_FIELDS = new Set(["created_date", "created_date_india", "updated_date"]);
  const FIELD_LABELS = new Map(DETAIL_GROUPS.flatMap((group) => group.fields));
  const FIELD_ORDER = DETAIL_GROUPS.flatMap((group) => group.fields.map(([key]) => key));
  const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const numberFormat = new Intl.NumberFormat("en-IN");

  const totalLabel = document.getElementById("total-label");
  const totalCount = document.getElementById("total-count");
  const investmentLabel = document.getElementById("investment-label");
  const investmentTotal = document.getElementById("investment-total");
  const hcmLabel = document.getElementById("hcm-label");
  const hcmCount = document.getElementById("hcm-count");
  const hcmApprovedLabel = document.getElementById("hcm-approved-label");
  const hcmApprovedCount = document.getElementById("hcm-approved-count");
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
  const requestFilter = document.getElementById("filter-hcm-request");
  const approvalFilter = document.getElementById("filter-hcm-approved");
  const localClearButton = document.getElementById("clear-local-filters");
  const pagination = document.getElementById("pagination");
  const pageNumbers = document.getElementById("page-numbers");
  const dialog = document.getElementById("detail-dialog");
  const dialogTitle = document.getElementById("detail-title");
  const dialogBody = document.getElementById("detail-body");

  const approvals = new Map();
  const pendingApprovals = new Set();
  let detailId = "";

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

  function proposedInvestmentTotal() {
    const total = state.rows.reduce((sum, row) => {
      const amount = Number(row && row.proposed_investment_crore);
      return Number.isFinite(amount) ? sum + amount : sum;
    }, 0);
    return Math.round(total * 100) / 100;
  }

  function savedApproval(record) {
    const raw = record && record.cmmeetapproval != null ? record.cmmeetapproval : record && record.cm_meeting_approval;
    const approval = String(raw != null ? raw : "").trim().toLowerCase();
    return approval === "yes" || approval === "true";
  }

  function rememberLoadedApprovals() {
    const next = new Map();
    state.rows.forEach((row) => {
      const id = blank(row.registration_id) ? "" : String(row.registration_id);
      if (!id) return;
      if (pendingApprovals.has(id)) next.set(id, approvals.get(id) === true);
      else next.set(id, savedApproval(row));
    });
    approvals.clear();
    next.forEach((value, id) => approvals.set(id, value));
  }

  function paintApproval(input) {
    const mark = input.closest(".approval-mark");
    if (!mark) return;
    const saving = pendingApprovals.has(input.dataset.approvalId);
    mark.classList.toggle("is-approved", input.checked);
    mark.classList.toggle("is-saving", saving);
    const text = mark.querySelector(".approval-text");
    if (text) text.textContent = input.checked ? "Decline" : "Accept";
  }

  function syncApproval(id, checked) {
    approvals.set(id, checked);
    document.querySelectorAll(".switch-input").forEach((other) => {
      if (other.dataset.approvalId !== id) return;
      other.checked = checked;
      other.disabled = pendingApprovals.has(id);
      paintApproval(other);
    });
  }

  function applyStatusToRow(id, checked, actor) {
    state.rows.forEach((row) => {
      if (!row || String(row.registration_id) !== id) return;
      row.registration_status = checked ? "Confirmed" : "Pending";
      row.cmmeetapproval = checked ? "Yes" : "No";
      row.updated_by = actor;
    });
  }

  function approvalSwitch(record) {
    const id = blank(record.registration_id) ? "" : String(record.registration_id);
    const name = blank(record.full_name) ? "this registration" : String(record.full_name);
    const approved = id ? approvals.get(id) === true : false;
    const mark = document.createElement("label");
    mark.className = "approval-mark" + (approved ? " is-approved" : "") + (id && pendingApprovals.has(id) ? " is-saving" : "");
    const input = document.createElement("input");
    input.type = "checkbox";
    input.className = "switch-input";
    input.checked = approved;
    input.disabled = !id || pendingApprovals.has(id);
    input.dataset.approvalId = id;
    input.setAttribute("aria-label", "HCM meeting approval for " + name);
    const slider = document.createElement("span");
    slider.className = "switch-slider";
    slider.setAttribute("aria-hidden", "true");
    const text = document.createElement("span");
    text.className = "approval-text";
    text.textContent = approved ? "Decline" : "Accept";
    mark.append(input, slider, text);
    return mark;
  }

  async function rememberApproval(event) {
    const input = event.target;
    if (!input || !input.classList || !input.classList.contains("switch-input")) return;
    const id = input.dataset.approvalId;
    if (!id || inFlight || pendingApprovals.has(id)) {
      if (id) syncApproval(id, approvals.get(id) === true);
      else {
        input.checked = false;
        paintApproval(input);
      }
      return;
    }

    const next = input.checked;
    const previous = approvals.get(id) === true;
    if (next === previous) {
      paintApproval(input);
      return;
    }

    const actor = session.actorId();
    if (!actor) {
      syncApproval(id, previous);
      showAlert("The signed-in account could not be identified. Please sign in again.");
      return;
    }

    pendingApprovals.add(id);
    syncApproval(id, next);
    refreshButton.disabled = true;
    searchButton.disabled = true;
    clearButton.disabled = true;
    showAlert("");
    try {
      await api.updateRegistrationStatus(id, next, actor);
      applyStatusToRow(id, next, actor);
    } catch (error) {
      syncApproval(id, previous);
      if (error && error.kind === "unauthorized") {
        endSession(error.message);
        return;
      }
      showAlert((error && error.message) || "The request could not be completed.");
    } finally {
      pendingApprovals.delete(id);
      if (!session.isAuthenticated()) return;
      const locked = state.loading || pendingApprovals.size > 0;
      refreshButton.disabled = locked;
      searchButton.disabled = locked;
      clearButton.disabled = locked;
      syncApproval(id, approvals.get(id) === true);
      render();
      if (dialog.open && detailId === id) {
        const record = state.rows.find((row) => row && String(row.registration_id) === id);
        if (record) openDetails(record);
      }
    }
  }

  function hcmRequestCount() {
    return state.rows.reduce((count, row) => (row && row.request_hcm_meeting === true ? count + 1 : count), 0);
  }

  function rowApproved(row) {
    if (!row) return false;
    const id = blank(row.registration_id) ? "" : String(row.registration_id);
    if (id && approvals.has(id)) return approvals.get(id) === true;
    return savedApproval(row);
  }

  function departmentApprovedCount() {
    return state.rows.reduce((count, row) => (rowApproved(row) ? count + 1 : count), 0);
  }

  function filtersActive() {
    return Boolean(state.filters.fullName || state.filters.mobileNumber || state.filters.emailId);
  }

  function showAlert(message) {
    alertBox.textContent = message || "";
    alertBox.hidden = !message;
  }

  function matchesLocalFilters(record) {
    const request = requestFilter ? requestFilter.value : "";
    const approval = approvalFilter ? approvalFilter.value : "";
    const requested = Boolean(record && record.request_hcm_meeting === true);
    if (request === "yes" && !requested) return false;
    if (request === "no" && requested) return false;
    const approved = rowApproved(record);
    if (approval === "yes" && !approved) return false;
    if (approval === "no" && approved) return false;
    return true;
  }

  function visibleEntries() {
    const entries = [];
    state.rows.forEach((record, index) => {
      if (matchesLocalFilters(record)) entries.push({ record: record, index: index });
    });
    return entries;
  }

  function pageCount() {
    return Math.max(1, Math.ceil(visibleEntries().length / state.pageSize));
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
    const locked = loading || pendingApprovals.size > 0;
    refreshButton.disabled = locked;
    searchButton.disabled = locked;
    clearButton.disabled = locked;
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
    const total = visibleEntries().length;
    if (!total) {
      listStatus.textContent = "Showing 0 of 0";
      return;
    }
    const start = (state.page - 1) * state.pageSize;
    const end = Math.min(start + state.pageSize, total);
    listStatus.textContent = "Showing " + (start + 1) + "–" + end + " of " + numberFormat.format(total);
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
    const entries = state.loaded ? visibleEntries() : [];
    if (!entries.length) {
      const row = document.createElement("tr");
      const cell = document.createElement("td");
      cell.colSpan = TABLE_COLUMNS.length + 2;
      cell.className = "empty-cell";
      if (!state.loaded && state.loading) cell.textContent = "Loading registrations…";
      else if (!state.loaded) cell.textContent = "Registrations could not be loaded.";
      else if (state.rows.length) cell.textContent = "No registrations match these filters";
      else cell.textContent = "No registrations found";
      row.appendChild(cell);
      fragment.appendChild(row);
    } else {
      const start = (state.page - 1) * state.pageSize;
      entries.slice(start, start + state.pageSize).forEach((entry, index) => {
        const record = entry.record;
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
          } else if (key === "request_hcm_meeting") {
            const group = document.createElement("div");
            group.className = "hcm-approval";
            const text = document.createElement("span");
            text.textContent = displayCell(record, key);
            group.append(text, approvalSwitch(record));
            cell.appendChild(group);
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
        button.dataset.index = String(entry.index);
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
    const filtered = filtersActive();
    totalLabel.textContent = filtered ? "Matching registrations" : "Total Registrations";
    investmentLabel.textContent = filtered ? "Matching proposed investment" : "Total Proposed Investment";
    hcmLabel.textContent = filtered ? "Matching HCM meeting requests" : "Total HCM Meeting Requests";
    hcmApprovedLabel.textContent = filtered ? "Matching HCM meetings approved" : "HCM Meeting Approved by Department";
    setRollingStat(totalCount, state.loaded ? numberFormat.format(state.totalRecords) : "—", 0);
    setRollingStat(investmentTotal, state.loaded ? numberFormat.format(proposedInvestmentTotal()) + " crore" : "—", 1);
    setRollingStat(hcmCount, state.loaded ? numberFormat.format(hcmRequestCount()) : "—", 2);
    setRollingStat(hcmApprovedCount, state.loaded ? numberFormat.format(departmentApprovedCount()) : "—", 3);
    filterNote.hidden = !filtersActive();
    exportButton.disabled = state.loading || state.exporting || !state.rows.length;
    exportButton.textContent = state.exporting ? "Exporting CSV…" : "Export CSV";
    renderStatus();
    renderPagination();
    renderTable();
    renderCharts();
  }

  function fieldValue(row, keys) {
    for (let index = 0; index < keys.length; index += 1) {
      const value = row[keys[index]];
      if (!blank(value)) return value;
    }
    return "";
  }

  function matchOption(text, options) {
    const lower = String(text || "").trim().toLowerCase();
    if (!lower) return "";
    for (let index = 0; index < options.length; index += 1) {
      if (options[index][0].toLowerCase() === lower || options[index][1].toLowerCase() === lower) return options[index][1];
    }
    return "";
  }

  function selectionText(value) {
    if (value === true) return "yes";
    if (value === false || value == null) return "";
    const text = String(value).trim();
    const lower = text.toLowerCase();
    if (!text || lower === "no" || lower === "false" || lower === "0") return "";
    if (lower === "yes" || lower === "true" || lower === "1") return "yes";
    return text;
  }

  function choiceLabels(row, keys, options) {
    const raw = fieldValue(row, keys);
    if (blank(raw) || typeof raw === "boolean") return [];
    const text = String(raw).trim();
    return [matchOption(text, options) || text];
  }

  function plenaryLabels(row) {
    const labels = [];
    const seen = new Set();
    function add(label) {
      const text = String(label || "").trim();
      const key = text.toLowerCase();
      if (!text || seen.has(key)) return;
      seen.add(key);
      labels.push(text);
    }
    PLENARY_FIELDS.forEach(([keys, label]) => {
      const selected = selectionText(fieldValue(row, keys));
      if (!selected) return;
      add(selected === "yes" ? label : matchOption(selected, PLENARY_OPTIONS) || selected);
    });
    String(fieldValue(row, ["plenary_session", "plenarySession"]) || "")
      .split(/[,;|]/)
      .forEach((part) => {
        const selected = selectionText(part);
        if (!selected || selected === "yes") return;
        add(matchOption(selected, PLENARY_OPTIONS) || selected);
      });
    return labels;
  }

  function tallyChoices(rows, readLabels, options) {
    const counts = new Map();
    options.forEach((option) => counts.set(option[1], 0));
    const extras = new Map();
    rows.forEach((row) => {
      readLabels(row).forEach((label) => {
        if (counts.has(label)) counts.set(label, counts.get(label) + 1);
        else extras.set(label, (extras.get(label) || 0) + 1);
      });
    });
    const slices = [];
    counts.forEach((value, label) => slices.push({ label, value }));
    extras.forEach((value, label) => {
      if (value > 0) slices.push({ label, value });
    });
    return slices;
  }

  function svgNode(name) {
    return document.createElementNS("http://www.w3.org/2000/svg", name);
  }

  function statNumber(text) {
    const core = String(text || "").replace(/\s+crore$/, "").replace(/,/g, "").trim();
    if (!core || core === "—") return null;
    const value = Number(core);
    return Number.isFinite(value) ? value : null;
  }

  function setRollingStat(el, text, order) {
    const previous = el.dataset.value || "";
    if (previous === text) return;
    const stagger = Math.max(0, Number(order) || 0);
    el.dataset.statOrder = String(stagger);
    el.dataset.value = text;
    el.setAttribute("aria-label", text);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const previousNumber = statNumber(previous);
    const nextNumber = statNumber(text);
    if (text === "—" || reduce || nextNumber == null) {
      el.dataset.rolling = "0";
      el.textContent = text;
      return;
    }
    const nextCore = text.replace(/\s+crore$/, "");
    const prevCore = previous && previous !== "—" ? previous.replace(/\s+crore$/, "") : "";
    const suffix = text.endsWith(" crore") ? "crore" : "";
    const nextChars = nextCore.split("");
    const prevChars = prevCore.split("");
    const width = Math.max(nextChars.length, prevChars.length);
    while (nextChars.length < width) nextChars.unshift("");
    while (prevChars.length < width) prevChars.unshift("");
    const increased = previousNumber == null || nextNumber >= previousNumber;
    const roll = document.createElement("span");
    roll.className = "stat-roll";
    roll.setAttribute("aria-hidden", "true");
    nextChars.forEach((glyph, index) => {
      const before = prevChars[index];
      const digit = document.createElement("span");
      digit.className = "stat-digit";
      if (before === glyph) {
        digit.textContent = glyph;
      } else {
        const strip = document.createElement("span");
        strip.className = "stat-digit-strip " + (increased ? "is-up" : "is-down");
        const oldGlyph = document.createElement("span");
        oldGlyph.textContent = before || "\u00a0";
        const newGlyph = document.createElement("span");
        newGlyph.textContent = glyph || "\u00a0";
        if (increased) strip.append(oldGlyph, newGlyph);
        else strip.append(newGlyph, oldGlyph);
        digit.appendChild(strip);
      }
      roll.appendChild(digit);
    });
    const token = String(Date.now());
    el.dataset.roll = token;
    el.dataset.rolling = "1";
    el.classList.add("is-ticking");
    el.replaceChildren(roll);
    if (suffix) {
      const suffixEl = document.createElement("span");
      suffixEl.className = "stat-suffix";
      suffixEl.setAttribute("aria-hidden", "true");
      suffixEl.textContent = suffix;
      el.appendChild(suffixEl);
    }
    window.setTimeout(() => {
      if (el.dataset.roll !== token) return;
      el.dataset.rolling = "0";
      el.classList.remove("is-ticking");
      el.textContent = text;
    }, 1200 + stagger * 150);
  }

  function wedgePath(radius, start, end) {
    const cx = 50;
    const cy = 50;
    const sweep = end - start;
    if (sweep >= Math.PI * 2 - 0.001) {
      return "M " + (cx - radius) + " " + cy
        + " A " + radius + " " + radius + " 0 1 1 " + (cx + radius) + " " + cy
        + " A " + radius + " " + radius + " 0 1 1 " + (cx - radius) + " " + cy
        + " Z";
    }
    const x1 = cx + radius * Math.cos(start);
    const y1 = cy + radius * Math.sin(start);
    const x2 = cx + radius * Math.cos(end);
    const y2 = cy + radius * Math.sin(end);
    const large = sweep > Math.PI ? 1 : 0;
    return "M " + cx + " " + cy
      + " L " + x1.toFixed(2) + " " + y1.toFixed(2)
      + " A " + radius + " " + radius + " 0 " + large + " 1 " + x2.toFixed(2) + " " + y2.toFixed(2)
      + " Z";
  }

  function playChart(owner, paint, delay, duration) {
    const token = String(Date.now()) + Math.random().toString(16).slice(2);
    owner.dataset.motion = token;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      paint(1);
      return;
    }
    paint(0);
    const started = performance.now() + Math.max(0, delay || 0);
    const length = Math.max(1, duration || 1000);
    function frame(now) {
      if (owner.dataset.motion !== token || !owner.isConnected) return;
      if (now < started) {
        window.requestAnimationFrame(frame);
        return;
      }
      const t = Math.min(1, (now - started) / length);
      const eased = 1 - Math.pow(1 - t, 3);
      paint(eased);
      if (t < 1) window.requestAnimationFrame(frame);
      else paint(1);
    }
    window.requestAnimationFrame(frame);
  }

  function playPie(svg, wedges, delay, duration) {
    playChart(svg, (progress) => {
      const amount = Math.max(0, Math.min(1, progress));
      let remaining = amount;
      let cursor = -Math.PI / 2;
      wedges.forEach((wedge) => {
        const visible = Math.max(0, Math.min(wedge.fraction, remaining));
        remaining -= wedge.fraction;
        const sweep = visible * Math.PI * 2;
        wedge.node.setAttribute("d", sweep <= 0.001 ? "" : wedgePath(46, cursor, cursor + sweep));
        cursor += wedge.fraction * Math.PI * 2;
      });
    }, delay, duration);
  }

  function playDonut(svg, arcs, delay, duration) {
    playChart(svg, (progress) => {
      const amount = Math.max(0, Math.min(1, progress));
      arcs.forEach((arc) => {
        arc.node.setAttribute("stroke-dashoffset", (arc.length * (1 - arc.fraction * amount)).toFixed(2));
      });
    }, delay, duration);
  }

  function playBars(root, bars, delay, duration) {
    playChart(root, (progress) => {
      const amount = Math.max(0, Math.min(1, progress));
      bars.forEach((bar) => {
        const height = bar.height * amount;
        bar.node.setAttribute("height", Math.max(0, height).toFixed(2));
        bar.node.setAttribute("y", (bar.base - height).toFixed(2));
        if (bar.valueText) bar.valueText.setAttribute("y", (bar.base - height - 6).toFixed(2));
      });
    }, delay, duration);
  }

  let chartStamp = "";

  function renderCharts() {
    const stamp = state.rows.reduce((hash, row) => {
      const bits = [row.attending_as, row.attendingAs, row.sector, row.state, row.hcm_investment_sector, row.hcmInvestmentSector, row.plenary_session, row.plenarySession, row.panel_1, row.panel1, row.panel_2, row.panel2, row.panel_3, row.panel3, row.panel_4, row.panel4, row.panel_5, row.panel5, row.panel_6, row.panel6, row.panel_7, row.panel7, row.panel_8, row.panel8];
      return bits.reduce((sum, bit) => {
        const text = String(bit == null ? "" : bit);
        let next = sum + 1;
        for (let index = 0; index < text.length; index += 1) next = (next * 33 + text.charCodeAt(index)) % 1000000007;
        return next;
      }, hash);
    }, (state.loaded ? 17 : 3) + state.rows.length);
    const nextStamp = stamp + ":" + (state.loading ? "1" : "0");
    if (nextStamp === chartStamp) return;
    chartStamp = nextStamp;
    const charts = [
      { key: "attending", unit: "registrations", read: (row) => choiceLabels(row, ["attending_as", "attendingAs"], ATTENDING_OPTIONS), options: ATTENDING_OPTIONS },
      { key: "sector", unit: "registrations", kind: "ring", read: (row) => choiceLabels(row, ["sector"], SECTOR_OPTIONS), options: SECTOR_OPTIONS },
      { key: "plenary", unit: "selections", kind: "donut", read: plenaryLabels, options: PLENARY_OPTIONS },
      { key: "investment", unit: "registrations", kind: "bar", read: (row) => choiceLabels(row, ["hcm_investment_sector", "hcmInvestmentSector"], INVESTMENT_OPTIONS), options: INVESTMENT_OPTIONS },
      { key: "state", unit: "registrations", read: (row) => choiceLabels(row, ["state"], STATE_OPTIONS), options: STATE_OPTIONS },
    ];
    const chartWave = { attending: 0, sector: 1, state: 2, plenary: 3, investment: 4 };
    charts.forEach((chart) => {
      const chartOrder = chartWave[chart.key] || 0;
      const chartDelay = chartOrder * 150;
      const chartDuration = 1000 + chartOrder * 250;
      const slot = document.querySelector('.pie-slot[data-chart="' + chart.key + '"]');
      if (!slot) return;
      slot.replaceChildren();
      if (!state.loaded) {
        const waiting = document.createElement("p");
        waiting.className = "pie-empty";
        waiting.textContent = state.loading ? "Loading…" : "—";
        slot.appendChild(waiting);
        return;
      }
      const slices = tallyChoices(state.rows, chart.read, chart.options);
      const drawn = slices.filter((slice) => slice.value > 0);
      const total = drawn.reduce((sum, slice) => sum + slice.value, 0);
      if (chart.kind === "bar") {
        const layout = document.createElement("div");
        layout.className = "bar-layout";
        const max = drawn.reduce((peak, slice) => Math.max(peak, slice.value), 0);
        const peak = Math.max(1, max);
        const rough = Math.max(1, peak / 4);
        const magnitude = Math.pow(10, Math.floor(Math.log10(rough)));
        const normalized = rough / magnitude;
        const niceSteps = [1, 2, 2.5, 5, 10];
        let nice = 10;
        for (let index = 0; index < niceSteps.length; index += 1) {
          if (normalized <= niceSteps[index]) {
            nice = niceSteps[index];
            break;
          }
        }
        const step = Math.max(1, Math.round(nice * magnitude));
        const axisTop = Math.ceil(peak / step) * step;
        const ticks = [];
        for (let value = 0; value <= axisTop; value += step) ticks.push(value);
        const longestTick = ticks.reduce((best, tick) => {
          const text = numberFormat.format(tick);
          return text.length > best.length ? text : best;
        }, "0");
        const valueSample = numberFormat.format(peak);
        const axisSize = 9;
        const vbW = 360;
        const vbH = 196;
        const padL = Math.ceil(longestTick.length * axisSize * 0.68 + 10);
        const padR = 8;
        const padB = 16;
        const plotBudget = vbW - padL - padR;
        const slotBudget = plotBudget / Math.max(1, slices.length);
        const valueSize = Math.max(7, Math.min(11, (slotBudget * 0.86) / (Math.max(1, valueSample.length) * 0.64)));
        const padT = Math.ceil(valueSize + 8);
        const plotW = vbW - padL - padR;
        const plotH = vbH - padT - padB;
        const base = padT + plotH;
        const slotW = plotW / Math.max(1, slices.length);
        const barW = Math.min(26, slotW * 0.48);
        const svg = svgNode("svg");
        svg.setAttribute("class", "column-chart");
        svg.dataset.chartOrder = String(chartWave[chart.key] || 0);
        svg.setAttribute("viewBox", "0 0 " + vbW + " " + vbH);
        svg.setAttribute("role", "img");
        svg.setAttribute("aria-label", slices.map((slice) => slice.label + " " + slice.value).join(", "));
        ticks.forEach((tick) => {
          const y = base - (tick / axisTop) * plotH;
          const line = svgNode("line");
          line.setAttribute("class", "axis-grid");
          line.setAttribute("x1", String(padL));
          line.setAttribute("x2", String(vbW - padR));
          line.setAttribute("y1", y.toFixed(2));
          line.setAttribute("y2", y.toFixed(2));
          const label = svgNode("text");
          label.setAttribute("class", "axis-label");
          label.setAttribute("x", String(padL - 5));
          label.setAttribute("y", y.toFixed(2));
          label.setAttribute("text-anchor", "end");
          label.setAttribute("dominant-baseline", "middle");
          label.setAttribute("font-size", String(axisSize));
          label.textContent = numberFormat.format(tick);
          svg.append(line, label);
        });
        const bars = [];
        slices.forEach((slice, index) => {
          const cx = padL + slotW * index + slotW / 2;
          const height = (slice.value / axisTop) * plotH;
          const group = svgNode("g");
          group.setAttribute("class", "bar-col");
          group.setAttribute("data-slice", String(index));
          const rect = svgNode("rect");
          rect.setAttribute("class", "bar-fill");
          rect.setAttribute("data-slice", String(index));
          rect.setAttribute("x", (cx - barW / 2).toFixed(2));
          rect.setAttribute("width", barW.toFixed(2));
          rect.setAttribute("y", base.toFixed(2));
          rect.setAttribute("height", "0");
          const color = CHART_COLORS[index % CHART_COLORS.length];
          rect.setAttribute("rx", "3");
          rect.setAttribute("fill", color);
          const valueText = svgNode("text");
          valueText.setAttribute("class", "bar-value");
          valueText.setAttribute("fill", color);
          valueText.setAttribute("x", cx.toFixed(2));
          valueText.setAttribute("y", (base - 6).toFixed(2));
          valueText.setAttribute("text-anchor", "middle");
          valueText.setAttribute("font-size", valueSize.toFixed(2));
          valueText.textContent = numberFormat.format(slice.value);
          const title = svgNode("title");
          title.textContent = slice.label + ": " + slice.value;
          group.append(rect, valueText, title);
          svg.appendChild(group);
          bars.push({ node: rect, valueText: valueText, height: height, base: base });
        });
        const legend = document.createElement("ul");
        legend.className = "pie-legend";
        slices.forEach((slice, index) => {
          const item = document.createElement("li");
          if (!slice.value) item.className = "is-zero";
          item.dataset.slice = String(index);
          const swatch = document.createElement("span");
          swatch.className = "pie-swatch";
          swatch.dataset.color = String(index % CHART_COLORS.length);
          const name = document.createElement("span");
          name.className = "pie-label";
          name.textContent = slice.label;
          const count = document.createElement("span");
          count.className = "pie-count";
          count.textContent = numberFormat.format(slice.value);
          item.append(swatch, name, count);
          legend.appendChild(item);
        });
        const summary = document.createElement("p");
        summary.className = "pie-total";
        summary.textContent = numberFormat.format(total) + " " + chart.unit;
        function focusBar(index) {
          const active = index != null && index !== "";
          layout.classList.toggle("is-pointing", active);
          svg.querySelectorAll(".bar-col").forEach((bar) => {
            bar.classList.toggle("is-hot", active && bar.getAttribute("data-slice") === index);
          });
          legend.querySelectorAll("li").forEach((item) => {
            item.classList.toggle("is-linked", active && item.dataset.slice === index);
          });
        }
        svg.addEventListener("mouseover", (event) => {
          const bar = event.target.closest ? event.target.closest(".bar-col") : null;
          if (!bar || !svg.contains(bar)) return;
          focusBar(bar.getAttribute("data-slice"));
        });
        svg.addEventListener("mouseleave", () => focusBar(null));
        legend.addEventListener("mouseover", (event) => {
          const item = event.target.closest("li");
          if (!item || !legend.contains(item)) return;
          focusBar(item.dataset.slice || null);
        });
        legend.addEventListener("mouseleave", () => focusBar(null));
        layout.append(legend, svg, summary);
        slot.appendChild(layout);
        playBars(svg, bars, chartDelay, chartDuration);
        return;
      }
      const donut = chart.kind === "donut";
      const ring = chart.kind === "ring";
      const layout = document.createElement("div");
      layout.className = donut ? "pie-layout is-donut" : ring ? "pie-layout is-ring" : "pie-layout";
      const visual = document.createElement("div");
      visual.className = !donut && !ring && drawn.length === 1 ? "pie-visual is-solo" : "pie-visual";
      visual.dataset.chartOrder = String(chartWave[chart.key] || 0);
      const svg = svgNode("svg");
      svg.setAttribute("class", "pie-svg");
      svg.setAttribute("viewBox", "0 0 100 100");
      svg.setAttribute("role", "img");
      svg.setAttribute("aria-label", slices.map((slice) => slice.label + " " + slice.value).join(", "));
      if (!drawn.length) {
        const circle = svgNode("circle");
        circle.setAttribute("cx", "50");
        circle.setAttribute("cy", "50");
        circle.setAttribute("r", donut ? "36" : ring ? "38" : "46");
        circle.setAttribute("fill", donut || ring ? "none" : "#ece7e1");
        if (donut || ring) {
          circle.setAttribute("stroke", "#ece7e1");
          circle.setAttribute("stroke-width", "8");
        }
        svg.appendChild(circle);
      } else if (ring) {
        const radius = 38;
        const width = 8;
        const length = 2 * Math.PI * radius;
        const gapFraction = drawn.length > 1 ? 0.012 : 0;
        let cursor = 0;
        const arcs = [];
        drawn.forEach((slice, index) => {
          const fraction = total ? slice.value / total : 0;
          const visible = fraction > gapFraction * 2 ? fraction - gapFraction : fraction;
          const group = svgNode("g");
          group.setAttribute("class", "pie-slice");
          group.setAttribute("data-slice", String(index));
          const arc = svgNode("circle");
          arc.setAttribute("class", "donut-arc");
          arc.setAttribute("data-slice", String(index));
          arc.setAttribute("cx", "50");
          arc.setAttribute("cy", "50");
          arc.setAttribute("r", String(radius));
          arc.setAttribute("fill", "none");
          arc.setAttribute("stroke", CHART_COLORS[index % CHART_COLORS.length]);
          arc.setAttribute("stroke-width", String(width));
          arc.setAttribute("stroke-linecap", "butt");
          arc.setAttribute("transform", "rotate(" + (-90 + cursor * 360).toFixed(2) + " 50 50)");
          arc.setAttribute("stroke-dasharray", length.toFixed(2) + " " + length.toFixed(2));
          arc.setAttribute("stroke-dashoffset", length.toFixed(2));
          const title = svgNode("title");
          title.textContent = slice.label + ": " + slice.value;
          arc.appendChild(title);
          group.appendChild(arc);
          svg.appendChild(group);
          arcs.push({ node: arc, length: length, fraction: visible });
          cursor += fraction;
        });
        playDonut(svg, arcs, chartDelay, chartDuration);
      } else if (donut) {
        const outer = 46;
        const gap = drawn.length > 6 ? 1.15 : 2.1;
        const span = 30;
        const width = Math.min(8, (span - gap * (drawn.length - 1)) / drawn.length);
        let radius = outer - width / 2;
        const arcs = [];
        drawn.forEach((slice, index) => {
          const color = CHART_COLORS[index % CHART_COLORS.length];
          const length = 2 * Math.PI * radius;
          const fraction = total ? slice.value / total : 0;
          const group = svgNode("g");
          group.setAttribute("class", "pie-slice");
          group.setAttribute("data-slice", String(index));
          const track = svgNode("circle");
          track.setAttribute("class", "donut-track");
          track.setAttribute("cx", "50");
          track.setAttribute("cy", "50");
          track.setAttribute("r", radius.toFixed(2));
          track.setAttribute("fill", "none");
          track.setAttribute("stroke", "#ece7e1");
          track.setAttribute("stroke-width", width.toFixed(2));
          const arc = svgNode("circle");
          arc.setAttribute("class", "donut-arc");
          arc.setAttribute("data-slice", String(index));
          arc.setAttribute("cx", "50");
          arc.setAttribute("cy", "50");
          arc.setAttribute("r", radius.toFixed(2));
          arc.setAttribute("fill", "none");
          arc.setAttribute("stroke", color);
          arc.setAttribute("stroke-width", width.toFixed(2));
          arc.setAttribute("stroke-linecap", fraction > 0.98 ? "butt" : "round");
          arc.setAttribute("transform", "rotate(-90 50 50)");
          arc.setAttribute("stroke-dasharray", length.toFixed(2) + " " + length.toFixed(2));
          arc.setAttribute("stroke-dashoffset", length.toFixed(2));
          const title = svgNode("title");
          title.textContent = slice.label + ": " + slice.value + "/" + total;
          arc.appendChild(title);
          group.append(track, arc);
          svg.appendChild(group);
          arcs.push({ node: arc, length: length, fraction: fraction });
          radius -= width + gap;
        });
        playDonut(svg, arcs, chartDelay, chartDuration);
      } else {
        const wedges = [];
        drawn.forEach((slice, index) => {
          const path = svgNode("path");
          path.setAttribute("class", "pie-slice");
          path.setAttribute("data-slice", String(index));
          path.setAttribute("fill", CHART_COLORS[index % CHART_COLORS.length]);
          path.setAttribute("d", "");
          const title = svgNode("title");
          title.textContent = slice.label + ": " + slice.value;
          path.appendChild(title);
          svg.appendChild(path);
          wedges.push({ node: path, fraction: total ? slice.value / total : 0 });
        });
        playPie(svg, wedges, chartDelay, chartDuration);
      }
      visual.appendChild(svg);
      if (ring) {
        const center = document.createElement("div");
        center.className = "donut-center";
        const centerLabel = document.createElement("span");
        centerLabel.className = "donut-center-label";
        centerLabel.textContent = "Total";
        const centerValue = document.createElement("strong");
        centerValue.className = "donut-center-value";
        centerValue.textContent = numberFormat.format(total);
        centerValue.dataset.digits = String(Math.min(9, centerValue.textContent.length));
        center.append(centerLabel, centerValue);
        visual.appendChild(center);
      }
      const legend = document.createElement("ul");
      legend.className = "pie-legend";
      slices.forEach((slice) => {
        const drawnIndex = drawn.findIndex((item) => item.label === slice.label);
        const item = document.createElement("li");
        if (!slice.value) item.className = "is-zero";
        if (drawnIndex >= 0) item.dataset.slice = String(drawnIndex);
        const swatch = document.createElement("span");
        swatch.className = "pie-swatch";
        if (drawnIndex >= 0) swatch.dataset.color = String(drawnIndex % CHART_COLORS.length);
        else swatch.classList.add("is-zero");
        const name = document.createElement("span");
        name.className = "pie-label";
        name.textContent = slice.label;
        const count = document.createElement("span");
        count.className = "pie-count";
        count.textContent = numberFormat.format(slice.value);
        if (donut && total) {
          const ratio = document.createElement("span");
          ratio.className = "pie-ratio";
          ratio.textContent = "/" + numberFormat.format(total);
          count.appendChild(ratio);
        }
        item.append(swatch, name, count);
        legend.appendChild(item);
      });
      const summary = document.createElement("p");
      summary.className = "pie-total";
      summary.textContent = numberFormat.format(total) + " " + chart.unit;
      function focusSlice(index) {
        const active = index != null && index !== "";
        layout.classList.toggle("is-pointing", active);
        svg.querySelectorAll(".pie-slice").forEach((slice) => {
          slice.classList.toggle("is-hot", active && slice.getAttribute("data-slice") === index);
        });
        legend.querySelectorAll("li").forEach((item) => {
          item.classList.toggle("is-linked", active && item.dataset.slice === index);
        });
      }
      visual.addEventListener("mouseenter", () => visual.classList.add("is-live"));
      visual.addEventListener("mouseleave", () => {
        visual.classList.remove("is-live");
        focusSlice(null);
      });
      svg.addEventListener("mouseover", (event) => {
        const slice = event.target.closest ? event.target.closest(".pie-slice, .donut-arc") : null;
        if (!slice || !svg.contains(slice)) return;
        focusSlice(slice.getAttribute("data-slice"));
      });
      legend.addEventListener("mouseover", (event) => {
        const item = event.target.closest("li");
        if (!item || !legend.contains(item)) return;
        focusSlice(item.dataset.slice || null);
      });
      legend.addEventListener("mouseleave", () => focusSlice(null));
      layout.append(visual, legend, summary);
      slot.appendChild(layout);
    });
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
      rememberLoadedApprovals();
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

  function addDefinition(parent, label, value, wide, extra) {
    const wrap = document.createElement("div");
    wrap.className = wide ? "detail-field is-wide" : "detail-field";
    const term = document.createElement("dt");
    term.textContent = label;
    const description = document.createElement("dd");
    description.setAttribute("translate", "no");
    if (extra) {
      const group = document.createElement("div");
      group.className = "hcm-approval";
      const text = document.createElement("span");
      text.textContent = value;
      group.append(text, extra);
      description.appendChild(group);
    } else {
      description.textContent = value;
    }
    wrap.append(term, description);
    parent.appendChild(wrap);
  }

  function openDetails(record) {
    const name = blank(record.full_name) ? "Registration" : String(record.full_name);
    const id = blank(record.registration_id) ? "" : String(record.registration_id);
    detailId = id;
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
        const extra = key === "request_hcm_meeting" ? approvalSwitch(record) : null;
        addDefinition(list, label, formatValue(key, record[key]), WIDE_FIELDS.has(key), extra);
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
      if (requestFilter) requestFilter.value = "";
      if (approvalFilter) approvalFilter.value = "";
      loadRegistrations({
        filters: { fullName: null, mobileNumber: null, emailId: null },
        resetPage: true,
        restoreInputs: true,
      });
    });

    exportButton.addEventListener("click", () => exportRegistrations());

    function resetLocalFilters() {
      if (requestFilter) requestFilter.value = "";
      if (approvalFilter) approvalFilter.value = "";
      state.page = 1;
      render();
    }

    if (requestFilter) requestFilter.addEventListener("change", () => {
      state.page = 1;
      render();
    });
    if (approvalFilter) approvalFilter.addEventListener("change", () => {
      state.page = 1;
      render();
    });
    if (localClearButton) localClearButton.addEventListener("click", resetLocalFilters);

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
      const button = event.target.closest("button[data-index]");
      if (!button) return;
      const record = state.rows[Number(button.dataset.index)];
      if (record) openDetails(record);
    });
    tableBody.addEventListener("change", rememberApproval);
    dialog.addEventListener("change", rememberApproval);

    document.getElementById("detail-close").addEventListener("click", () => dialog.close());
    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) dialog.close();
    });
    dialog.addEventListener("close", () => {
      detailId = "";
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
