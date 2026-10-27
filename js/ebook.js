(function () {
  "use strict";

  const DOCUMENTS_URL = "https://urbangis.mp.gov.in/api/UGC/GetDocumentsAll";
  // Relative paths work on production and on local `python3 serve.py` (proxies /ebook/udebook).
  const MEDIA_BASE = location.protocol === "file:" ? "https://ugconclave.mp.gov.in/" : "";
  const SECTION_META = {
    H01: {
      id: "flagship",
      num: "01",
      kicker: "Flagship Schemes",
      hi: "प्रमुख योजनाओं के अंतर्गत प्रमुख उपलब्धियाँ",
    },
    H02: {
      id: "projects",
      num: "02",
      kicker: "Project Implementation",
      hi: "परियोजना क्रियान्वयन में प्रमुख उपलब्धियाँ",
    },
    H03: {
      id: "reforms",
      num: "03",
      kicker: "Reforms & Policy",
      hi: "सुधार एवं नीतिगत पहल",
    },
    H04: {
      id: "investment",
      num: "04",
      kicker: "Investment Opportunities",
      hi: "आगामी निवेश अवसर",
    },
  };
  const SECTION_ORDER = ["H01", "H02", "H03", "H04"];
  const COVER_STATICS = {
    en: {
      img: "ebook/covers/ebook-cover-en.png",
      title: "E-Book Cover — English",
      lang: "EN",
      lines: ["Madhya Pradesh", "Urban Growth Conclave 2.0", "Tap to open cover"],
    },
    hi: {
      img: "ebook/covers/ebook-cover-hi.jpg",
      title: "ई-बुक कवर — हिंदी",
      lang: "हिंदी",
      lines: ["Madhya Pradesh", "Urban Growth Conclave 2.0", "Tap to open cover"],
    },
  };
  const TONES = [210, 198, 145, 255, 168, 28, 38, 350, 12, 280];
  const LIVE_BADGE_SVG =
    '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" aria-hidden="true"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  function hasAsset(value) {
    return !!(value && String(value).trim() && String(value).trim().toUpperCase() !== "NA");
  }

  function assetUrl(path) {
    if (!hasAsset(path)) return "";
    const trimmed = String(path).trim();
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    const encoded = trimmed
      .split("/")
      .map(function (part) {
        return encodeURIComponent(part);
      })
      .join("/");
    return MEDIA_BASE + encoded;
  }

  function fileNameFromPath(path, fallback) {
    if (!hasAsset(path)) return fallback || "ebook.pdf";
    const parts = String(path).split("/");
    return parts[parts.length - 1] || fallback || "ebook.pdf";
  }

  function textField(value, fallback) {
    if (!hasAsset(value)) return fallback || "";
    return String(value).trim();
  }

  function cellLabels(doc, fallbackKicker) {
    const fallbackTitle = textField(doc.imageHeader, "E-Book");
    return {
      kicker: textField(doc.headerFirst, fallbackKicker || ""),
      title: textField(doc.headerTwo, fallbackTitle),
      abbr: textField(doc.headerThree, ""),
    };
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function groupDocuments(docs) {
    const groups = {};
    SECTION_ORDER.forEach(function (key) {
      groups[key] = [];
    });
    (docs || []).forEach(function (doc) {
      const headerId = doc && doc.headerId;
      if (!groups[headerId]) return;
      groups[headerId].push(doc);
    });
    return groups;
  }

  function coverLocale(doc) {
    const path = String((doc && doc.pdfPath) || "").toLowerCase();
    if (path.indexOf("hindi") !== -1 || /[\u0900-\u097F]/.test(path)) return "hi";
    return "en";
  }

  function cellMetaHtml(kicker, title, abbr) {
    return (
      '<div class="ebook-cell-meta">' +
      '<p class="ebook-cell-kicker">' +
      escapeHtml(kicker) +
      "</p>" +
      "<h3>" +
      escapeHtml(title) +
      "</h3>" +
      (abbr ? '<p class="ebook-cell-abbr">' + escapeHtml(abbr) + "</p>" : "") +
      "</div>"
    );
  }

  function coverHtml(src, title) {
    if (!src) return "";
    return (
      '<span class="ebook-cell-shimmer" aria-hidden="true"></span>' +
      '<img class="ebook-cover" src="' +
      escapeHtml(src) +
      '" alt="' +
      escapeHtml(title) +
      '" width="720" height="960" loading="lazy" decoding="async" />'
    );
  }

  function bindCoverShimmer(root) {
    const scope = root || document;
    scope.querySelectorAll(".ebook-cell.is-loading").forEach(function (cell) {
      const img = cell.querySelector("img.ebook-cover");
      if (!img) {
        cell.classList.remove("is-loading");
        return;
      }
      const finish = function () {
        cell.classList.remove("is-loading");
        cell.classList.add("is-ready");
      };
      if (img.complete && img.naturalWidth > 0) {
        finish();
        return;
      }
      img.addEventListener("load", finish, { once: true });
      img.addEventListener("error", finish, { once: true });
    });
  }

  function renderCoverCircles(docs) {
    const host = document.getElementById("ebook-cover-circles");
    if (!host) return;

    const covers = (docs || [])
      .filter(function (doc) {
        return doc && doc.headerId === "H05" && hasAsset(doc.pdfPath);
      })
      .sort(function (a, b) {
        return (coverLocale(a) === "hi" ? 1 : 0) - (coverLocale(b) === "hi" ? 1 : 0);
      });

    if (!covers.length) {
      host.hidden = true;
      host.innerHTML = "";
      return;
    }

    const reduceMotion =
      window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    host.innerHTML = covers
      .map(function (doc) {
        const locale = coverLocale(doc);
        const staticCover = COVER_STATICS[locale] || COVER_STATICS.en;
        const pdf = assetUrl(doc.pdfPath);
        const file = fileNameFromPath(doc.pdfPath, "ebook-cover-" + locale + ".pdf");
        return (
          '<a class="ebook-cover-circle' +
          (reduceMotion ? "" : " is-intro") +
          '" href="' +
          escapeHtml(pdf) +
          '" download="' +
          escapeHtml(file) +
          '" data-ebook-open data-ebook-title="' +
          escapeHtml(staticCover.title) +
          '" aria-label="Open ' +
          escapeHtml(staticCover.title) +
          '">' +
          '<span class="ebook-cover-circle-ring" aria-hidden="true">' +
          '<span class="ebook-cover-circle-media">' +
          '<img src="' +
          escapeHtml(staticCover.img) +
          '" alt="" width="280" height="280" loading="lazy" />' +
          "</span>" +
          "</span>" +
          '<span class="ebook-cover-circle-label">' +
          escapeHtml(staticCover.lang) +
          "</span>" +
          '<span class="ebook-cover-circle-caption">' +
          staticCover.lines
            .map(function (line, index) {
              return (
                '<span class="ebook-cover-circle-line' +
                (index === staticCover.lines.length - 1 ? " is-action" : "") +
                '">' +
                escapeHtml(line) +
                "</span>"
              );
            })
            .join("") +
          "</span>" +
          "</a>"
        );
      })
      .join("");
    host.hidden = false;

    if (!reduceMotion) {
      host.querySelectorAll(".ebook-cover-circle.is-intro").forEach(function (circle) {
        const ring = circle.querySelector(".ebook-cover-circle-ring");
        if (!ring) return;
        const clearIntro = function () {
          circle.classList.remove("is-intro");
          ring.removeEventListener("animationend", clearIntro);
        };
        ring.addEventListener("animationend", clearIntro);
      });
    }
  }

  function renderCell(doc, fallbackKicker, toneIndex) {
    const labels = cellLabels(doc, fallbackKicker);
    const title = labels.title;
    const pdf = assetUrl(doc.pdfPath);
    const hasPdf = !!pdf;
    const hasImg = hasAsset(doc.imgPath);
    const tone = TONES[toneIndex % TONES.length];
    const meta = cellMetaHtml(labels.kicker, title, labels.abbr);
    const cover = coverHtml(assetUrl(doc.imgPath), title);

    if (hasPdf) {
      const file = fileNameFromPath(doc.pdfPath, title.replace(/\s+/g, "-") + ".pdf");
      const classes =
        "ebook-cell is-live" + (hasImg ? " is-loading" : " is-static");
      const style = hasImg ? "" : ' style="--tone: ' + tone + '"';
      return (
        '<a class="' +
        classes +
        '"' +
        style +
        ' href="' +
        escapeHtml(pdf) +
        '" download="' +
        escapeHtml(file) +
        '" data-ebook-open data-ebook-title="' +
        escapeHtml(title) +
        '" aria-label="Open ' +
        escapeHtml(title) +
        '">' +
        cover +
        '<span class="ebook-badge ebook-badge-live">' +
        LIVE_BADGE_SVG +
        " Live Edition</span>" +
        meta +
        "</a>"
      );
    }

    if (hasImg) {
      return (
        '<article class="ebook-cell is-loading" aria-label="' +
        escapeHtml(title) +
        ' — Coming soon">' +
        cover +
        meta +
        "</article>"
      );
    }

    return (
      '<article class="ebook-cell is-static" style="--tone: ' +
      tone +
      '" aria-label="' +
      escapeHtml(title) +
      ' — Coming soon">' +
      meta +
      "</article>"
    );
  }

  function renderSection(headerId, items, toneIndexRef) {
    const meta = SECTION_META[headerId];
    if (!meta || !items.length) return "";
    const headingId = meta.id + "-heading";
    const headerName = items[0].headerName || meta.kicker;
    const parts = [
      '<section class="ebook-section page" id="' +
        meta.id +
        '" aria-labelledby="' +
        headingId +
        '">' +
        '<header class="ebook-section-head">' +
        '<p class="ebook-section-num" aria-hidden="true">' +
        meta.num +
        "</p>" +
        '<h2 id="' +
        headingId +
        '" data-hi="' +
        escapeHtml(meta.hi) +
        '">' +
        escapeHtml(headerName) +
        "</h2>" +
        "</header>" +
        '<div class="ebook-grid">',
    ];

    items.forEach(function (doc) {
      parts.push(renderCell(doc, meta.kicker, toneIndexRef.value++));
    });
    parts.push("</div></section>");
    return parts.join("");
  }

  function renderCatalog(docs) {
    const catalog = document.getElementById("ebook-catalog");
    if (!catalog) return;

    renderCoverCircles(docs);

    const groups = groupDocuments(docs);
    const html = [];
    const toneIndexRef = { value: 0 };

    SECTION_ORDER.forEach(function (headerId) {
      const items = groups[headerId] || [];
      if (!items.length) return;
      html.push(renderSection(headerId, items, toneIndexRef));
    });

    if (!html.length) {
      catalog.innerHTML =
        '<p class="ebook-catalog-status ebook-catalog-error">No editions are available right now.</p>';
      return;
    }

    catalog.innerHTML = html.join("");
    bindCoverShimmer(catalog);
  }

  function showCatalogError(message) {
    const catalog = document.getElementById("ebook-catalog");
    const circles = document.getElementById("ebook-cover-circles");
    if (circles) {
      circles.hidden = true;
      circles.innerHTML = "";
    }
    if (!catalog) return;
    catalog.innerHTML =
      '<div class="ebook-catalog-status ebook-catalog-error" role="alert">' +
      "<p>" +
      escapeHtml(message) +
      "</p>" +
      '<button type="button" class="btn btn-line" data-ebook-retry>Try again</button>' +
      "</div>";
    const retry = catalog.querySelector("[data-ebook-retry]");
    if (retry) retry.addEventListener("click", loadCatalog);
  }

  async function loadCatalog() {
    const catalog = document.getElementById("ebook-catalog");
    if (!catalog) return;
    catalog.innerHTML =
      '<p class="ebook-catalog-status" data-ebook-catalog-status>Loading editions…</p>';

    try {
      const response = await fetch(DOCUMENTS_URL, {
        method: "POST",
        headers: {
          accept: "*/*",
          "Content-Type": "application/json",
        },
        body: "{}",
      });
      if (!response.ok) throw new Error("Request failed");
      const body = await response.json();
      if (!body || body.status !== true || !Array.isArray(body.data)) {
        throw new Error((body && body.message) || "Invalid response");
      }
      renderCatalog(body.data);
    } catch (err) {
      console.error(err);
      showCatalogError("Could not load e-book editions. Please try again.");
    }
  }

  loadCatalog();

  const reader = document.getElementById("ebook-reader");
  const readerTitle = document.getElementById("ebook-reader-title");
  const readerClose = document.getElementById("ebook-reader-close");
  const readerPrev = document.getElementById("ebook-reader-prev");
  const readerNext = document.getElementById("ebook-reader-next");
  const readerPage = document.getElementById("ebook-reader-page");
  const readerStage = document.getElementById("ebook-reader-stage");
  const readerBook = document.getElementById("ebook-reader-book");
  const readerLoading = document.getElementById("ebook-reader-loading");
  const readerError = document.getElementById("ebook-reader-error");
  const readerFrame = document.getElementById("ebook-reader-frame");
  const readerSheet = readerBook ? readerBook.parentElement : null;
  const readerHint = reader ? reader.querySelector(".ebook-reader-hint") : null;

  if (!reader || !window.pdfjsLib || !window.St) return;

  pdfjsLib.GlobalWorkerOptions.workerSrc =
    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

  let active = { pdf: "", file: "", title: "", blobUrl: "" };
  let pageFlip = null;
  let objectUrls = [];
  let pdfBytes = null;
  let loadingToken = 0;
  let lastKey = "";
  let isOpening = false;
  let pageAspect = 1.414;
  let readerMode = "flip";

  function lockScroll(lock) {
    document.documentElement.classList.toggle("ebook-scroll-lock", lock);
    document.body.classList.toggle("ebook-scroll-lock", lock);
  }

  function setProgress(text, percent) {
    if (!readerLoading) return;
    const slot = readerLoading.querySelector("[data-ebook-progress]");
    const pctSlot = readerLoading.querySelector("[data-ebook-progress-pct]");
    const bar = readerLoading.querySelector("[data-ebook-progress-bar]");
    if (slot) slot.textContent = text;
    const value = Math.max(0, Math.min(100, Math.round(percent == null ? 0 : percent)));
    if (pctSlot) pctSlot.textContent = value + "%";
    if (bar) bar.style.width = value + "%";
    readerLoading.setAttribute("aria-valuenow", String(value));
  }

  function clearLoadedPdfData() {
    objectUrls.forEach(function (url) {
      try {
        URL.revokeObjectURL(url);
      } catch (_) {}
    });
    objectUrls = [];
    pdfBytes = null;
    active.blobUrl = "";
    if (readerBook) {
      readerBook.querySelectorAll("img").forEach(function (img) {
        img.removeAttribute("src");
      });
      readerBook.innerHTML = "";
      readerBook.removeAttribute("style");
    }
    clearFrame();
    if (window.pdfjsLib && pdfjsLib.cleanup) {
      try {
        pdfjsLib.cleanup();
      } catch (_) {}
    }
  }

  function clearFrame() {
    if (!readerFrame) return;
    readerFrame.hidden = true;
    readerFrame.removeAttribute("src");
  }

  function destroyFlip() {
    if (pageFlip) {
      try {
        pageFlip.destroy();
      } catch (_) {}
      pageFlip = null;
    }
    clearLoadedPdfData();
    reader.classList.remove("is-frame-mode");
    readerMode = "flip";
    if (readerHint) {
      readerHint.textContent = "Drag the page corner · swipe · arrows · Esc";
    }
    if (readerPrev) readerPrev.hidden = false;
    if (readerNext) readerNext.hidden = false;
  }

  function closeReader(event) {
    if (event) {
      try {
        event.preventDefault();
        event.stopPropagation();
      } catch (_) {}
    }
    loadingToken += 1;
    isOpening = false;

    // Hide immediately so the UI always responds
    if (reader) {
      reader.hidden = true;
      reader.setAttribute("aria-hidden", "true");
      reader.style.display = "none";
    }
    lockScroll(false);

    window.setTimeout(function () {
      try {
        if (readerError) readerError.hidden = true;
        if (readerLoading) readerLoading.hidden = true;
        setProgress("Loading PDF…", 0);
        destroyFlip();
      } catch (err) {
        console.error(err);
        pageFlip = null;
        try {
          clearLoadedPdfData();
        } catch (_) {}
      }
      if (reader) reader.style.display = "";
    }, 0);
  }

  // Global escape hatch for the Back button
  window.UGC_closeEbookReader = closeReader;

  function updatePageLabel() {
    if (!pageFlip) {
      readerPage.textContent = "";
      if (readerPrev) readerPrev.disabled = true;
      if (readerNext) readerNext.disabled = true;
      return;
    }
    const total = pageFlip.getPageCount();
    const current = pageFlip.getCurrentPageIndex() + 1;
    readerPage.textContent = current + " / " + total;
    if (readerPrev) readerPrev.disabled = current <= 1;
    if (readerNext) readerNext.disabled = current >= total;
  }

  function goPrevPage() {
    if (readerMode !== "flip" || !pageFlip) return;
    const index = pageFlip.getCurrentPageIndex();
    if (index <= 0) {
      updatePageLabel();
      return;
    }
    // flipPrev() is unreliable in portrait mode — use turn APIs, then try animated flip
    const before = index;
    try {
      pageFlip.turnToPrevPage();
    } catch (_) {
      try {
        pageFlip.turnToPage(before - 1);
      } catch (__) {}
    }
    // Attempt a visual flip only if turn succeeded and library supports flip
    window.setTimeout(function () {
      if (!pageFlip) return;
      const now = pageFlip.getCurrentPageIndex();
      if (now === before && before > 0) {
        try {
          pageFlip.turnToPage(before - 1);
        } catch (_) {}
      }
      updatePageLabel();
    }, 30);
    updatePageLabel();
  }

  function goNextPage() {
    if (readerMode !== "flip" || !pageFlip) return;
    const index = pageFlip.getCurrentPageIndex();
    const total = pageFlip.getPageCount();
    if (index >= total - 1) {
      updatePageLabel();
      return;
    }
    const before = index;
    try {
      pageFlip.turnToNextPage();
    } catch (_) {
      try {
        pageFlip.turnToPage(before + 1);
      } catch (__) {}
    }
    window.setTimeout(function () {
      if (!pageFlip) return;
      const now = pageFlip.getCurrentPageIndex();
      if (now === before && before < pageFlip.getPageCount() - 1) {
        try {
          pageFlip.turnToPage(before + 1);
        } catch (_) {}
      }
      updatePageLabel();
    }, 30);
    updatePageLabel();
  }

  function layoutKey() {
    const stage = readerStage.getBoundingClientRect();
    const portrait = window.matchMedia("(orientation: portrait)").matches;
    return [
      Math.round(stage.width),
      Math.round(stage.height),
      portrait ? "p" : "l",
      window.devicePixelRatio || 1,
    ].join("x");
  }

  function bookSize() {
    const stage = readerStage.getBoundingClientRect();
    // Keep a tiny inset so the curl corner stays visible on phones
    const isNarrow = stage.width < 720;
    const padX = isNarrow ? 8 : 24;
    const padY = isNarrow ? 6 : 16;
    const maxW = Math.max(220, stage.width - padX * 2);
    const maxH = Math.max(300, stage.height - padY * 2);
    const ratio = pageAspect > 0.5 && pageAspect < 3 ? pageAspect : 1.414;

    // iBooks-style: always one page, as large as the stage allows
    let width = maxW;
    let height = Math.round(width * ratio);
    if (height > maxH) {
      height = maxH;
      width = Math.round(height / ratio);
    }

    return {
      width: Math.max(200, Math.floor(width)),
      height: Math.max(280, Math.floor(height)),
    };
  }

  function canvasToObjectUrl(canvas) {
    return new Promise(function (resolve, reject) {
      canvas.toBlob(
        function (blob) {
          if (!blob) {
            reject(new Error("Could not encode page image"));
            return;
          }
          const url = URL.createObjectURL(blob);
          objectUrls.push(url);
          resolve(url);
        },
        "image/jpeg",
        0.92
      );
    });
  }

  function preloadImages(urls) {
    return Promise.all(
      urls.map(function (url) {
        return new Promise(function (resolve, reject) {
          const img = new Image();
          img.onload = function () {
            resolve(img);
          };
          img.onerror = reject;
          img.src = url;
        });
      })
    );
  }

  async function fetchPdfBytes(url, token) {
    const response = await fetch(url, {
      method: "GET",
      mode: "cors",
      credentials: "omit",
      cache: "no-store",
    });
    if (!response.ok) throw new Error("PDF request failed (" + response.status + ")");

    const total = Number(response.headers.get("content-length")) || 0;
    if (!response.body || !response.body.getReader) {
      setProgress("Downloading PDF…", 35);
      const buffer = await response.arrayBuffer();
      if (token !== loadingToken) return null;
      setProgress("Download complete", 70);
      return buffer;
    }

    const readerStream = response.body.getReader();
    const chunks = [];
    let received = 0;
    while (true) {
      if (token !== loadingToken) return null;
      const result = await readerStream.read();
      if (result.done) break;
      chunks.push(result.value);
      received += result.value.byteLength;
      if (total > 0) {
        const pct = Math.min(70, Math.round((received / total) * 70));
        setProgress("Downloading PDF… " + Math.round((received / total) * 100) + "%", pct);
      } else {
        const mb = received / 1048576;
        setProgress("Downloading PDF… " + mb.toFixed(1) + " MB", Math.min(65, 10 + mb * 2));
      }
    }

    const bytes = new Uint8Array(received);
    let offset = 0;
    chunks.forEach(function (chunk) {
      bytes.set(chunk, offset);
      offset += chunk.byteLength;
    });
    setProgress("Download complete", 72);
    return bytes.buffer;
  }

  async function renderPdfPages(source, token) {
    setProgress("Reading PDF…", 74);
    const loadingTask = pdfjsLib.getDocument(
      typeof source === "string"
        ? { url: source, withCredentials: false, disableRange: false }
        : { data: source, withCredentials: false }
    );
    const pdf = await loadingTask.promise;
    if (token !== loadingToken) return null;

    const first = await pdf.getPage(1);
    const base = first.getViewport({ scale: 1 });
    pageAspect = base.height / base.width;

    const longEdge = Math.max(base.width, base.height);
    const pageBudget = Math.max(1, pdf.numPages);
    const target = pageBudget > 20 ? 1100 : pageBudget > 10 ? 1280 : 1400;
    const scale = Math.min(2.1, Math.max(1.05, target / longEdge));

    const pages = [];
    for (let i = 1; i <= pdf.numPages; i++) {
      if (token !== loadingToken) return null;
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: scale });
      const canvas = document.createElement("canvas");
      canvas.width = Math.floor(viewport.width);
      canvas.height = Math.floor(viewport.height);
      const ctx = canvas.getContext("2d", { alpha: false });
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      await page.render({ canvasContext: ctx, viewport: viewport }).promise;
      pages.push(await canvasToObjectUrl(canvas));
      const buildPct = 74 + Math.round((i / pdf.numPages) * 24);
      setProgress("Building flipbook… " + i + " / " + pdf.numPages, buildPct);
    }

    setProgress("Opening flipbook…", 99);
    return pages;
  }

  function openFrameViewer(url) {
    readerMode = "frame";
    reader.classList.add("is-frame-mode");
    if (readerSheet) readerSheet.hidden = true;
    if (readerPrev) readerPrev.hidden = true;
    if (readerNext) readerNext.hidden = true;
    if (readerHint) readerHint.textContent = "Scroll to read · Esc to close";
    readerPage.textContent = "PDF view";
    if (readerFrame) {
      readerFrame.hidden = false;
      readerFrame.src = url;
    }
    readerLoading.hidden = true;
    readerError.hidden = true;
  }

  function buildHtmlPages(urls) {
    readerBook.innerHTML = "";
    urls.forEach(function (url, index) {
      const page = document.createElement("div");
      // Soft density = realistic paper curl like iBooks
      page.className = "ebook-flip-page";
      page.dataset.density = "soft";
      const img = document.createElement("img");
      img.src = url;
      img.alt = "Page " + (index + 1);
      img.draggable = false;
      page.appendChild(img);
      readerBook.appendChild(page);
    });
    return readerBook.querySelectorAll(".ebook-flip-page");
  }

  async function openFlipbook(images, token) {
    if (token !== loadingToken || !images || !images.length) return;

    await preloadImages(images);
    if (token !== loadingToken) return;

    const size = bookSize();
    const pages = buildHtmlPages(images);
    readerMode = "flip";
    reader.classList.remove("is-frame-mode");
    if (readerSheet) {
      readerSheet.hidden = false;
      readerSheet.style.setProperty("--ebook-page-w", size.width + "px");
      readerSheet.style.setProperty("--ebook-page-h", size.height + "px");
    }
    if (readerFrame) {
      readerFrame.hidden = true;
      readerFrame.removeAttribute("src");
    }
    if (readerPrev) readerPrev.hidden = false;
    if (readerNext) readerNext.hidden = false;
    if (readerHint) readerHint.textContent = "Drag the page corner · swipe · arrows · Esc";

    readerBook.style.width = size.width + "px";
    readerBook.style.maxWidth = "100%";
    readerBook.style.height = size.height + "px";

      pageFlip = new St.PageFlip(readerBook, {
        width: size.width,
        height: size.height,
        size: "fixed",
        minWidth: size.width,
        maxWidth: size.width,
        minHeight: size.height,
        maxHeight: size.height,
        drawShadow: true,
        flippingTime: 900,
        usePortrait: true,
        startZIndex: 1,
        autoSize: false,
        maxShadowOpacity: 0.65,
        showCover: false,
        mobileScrollSupport: true,
        swipeDistance: 30,
        clickEventForward: false,
        useMouseEvents: true,
        disableFlipByClick: true,
        showPageCorners: true,
        startPage: 0,
      });

    pageFlip.loadFromHTML(pages);
    pageFlip.on("flip", updatePageLabel);
    pageFlip.on("changeState", function () {
      updatePageLabel();
      if (pageFlip && pageFlip.getOrientation && pageFlip.getOrientation() !== "portrait") {
        try {
          pageFlip.update();
        } catch (_) {}
      }
    });
    updatePageLabel();
    readerLoading.hidden = true;
    readerError.hidden = true;
  }

  async function openReader() {
    if (!active.pdf || isOpening) return;
    isOpening = true;
    const token = ++loadingToken;
    destroyFlip();
    if (readerSheet) readerSheet.hidden = false;

    lastKey = layoutKey();
    readerTitle.textContent = active.title;
    readerError.hidden = true;
    readerLoading.hidden = false;
    readerLoading.setAttribute("role", "progressbar");
    readerLoading.setAttribute("aria-valuemin", "0");
    readerLoading.setAttribute("aria-valuemax", "100");
    setProgress("Loading PDF in browser…", 2);
    reader.style.display = "";
    reader.hidden = false;
    reader.setAttribute("aria-hidden", "false");
    lockScroll(true);
    if (readerClose) readerClose.focus();

    await new Promise(function (resolve) {
      requestAnimationFrame(function () {
        requestAnimationFrame(resolve);
      });
    });

    try {
      // 1) Load the full PDF into the browser first
      const bytes = await fetchPdfBytes(active.pdf, token);
      if (token !== loadingToken || !bytes) return;
      pdfBytes = bytes;

      const blobUrl = URL.createObjectURL(new Blob([bytes], { type: "application/pdf" }));
      objectUrls.push(blobUrl);
      active.blobUrl = blobUrl;

      // 2) Convert PDF pages for the flipbook
      const images = await renderPdfPages(bytes, token);
      if (token !== loadingToken || !images || !images.length) {
        throw new Error("No pages rendered");
      }

      // Drop raw PDF bytes once page images exist
      pdfBytes = null;

      // 3) Show animated flipbook
      setProgress("Opening flipbook…", 100);
      await openFlipbook(images, token);
    } catch (err) {
      if (token !== loadingToken) return;
      console.error(err);
      clearLoadedPdfData();
      readerLoading.hidden = true;
      readerError.hidden = false;
      readerError.innerHTML =
        "Could not open the flipbook. Please try again." +
        '<div style="margin-top:0.85rem"><button type="button" class="btn btn-line" data-ebook-retry-read>Try E-Read again</button></div>';
      const retry = readerError.querySelector("[data-ebook-retry-read]");
      if (retry) {
        retry.addEventListener("click", function () {
          if (!isOpening) openReader();
        });
      }
    } finally {
      if (token === loadingToken) isOpening = false;
    }
  }

  document.addEventListener("click", function (event) {
    const trigger = event.target.closest("[data-ebook-open]");
    if (!trigger) return;
    event.preventDefault();
    active = {
      pdf: trigger.getAttribute("href") || trigger.getAttribute("data-ebook-pdf") || "",
      file: trigger.getAttribute("download") || trigger.getAttribute("data-ebook-file") || "ebook.pdf",
      title: trigger.getAttribute("data-ebook-title") || "E-Book",
      blobUrl: "",
    };
    openReader();
  });

  document.addEventListener(
    "click",
    function (event) {
      const back = event.target.closest("[data-ebook-back], #ebook-reader-close");
      if (!back) return;
      if (reader.hidden) return;
      closeReader(event);
    },
    true
  );

  if (readerClose) {
    readerClose.addEventListener("click", closeReader);
  }

  const readerBar = reader.querySelector(".ebook-reader-bar");
  if (readerBar) {
    readerBar.addEventListener(
      "pointerdown",
      function (event) {
        event.stopPropagation();
      },
      true
    );
    readerBar.addEventListener(
      "touchstart",
      function (event) {
        event.stopPropagation();
      },
      { capture: true, passive: true }
    );
  }

  readerPrev.addEventListener("click", function (event) {
    event.preventDefault();
    event.stopPropagation();
    goPrevPage();
  });

  readerNext.addEventListener("click", function (event) {
    event.preventDefault();
    event.stopPropagation();
    goNextPage();
  });

  document.addEventListener("keydown", function (event) {
    if (reader.hidden) return;
    if (event.key === "Escape") {
      closeReader(event);
      return;
    }
    if (readerMode !== "flip") return;
    if (event.key === "ArrowLeft") goPrevPage();
    if (event.key === "ArrowRight") goNextPage();
  });

  let resizeTimer = 0;
  window.addEventListener("resize", function () {
    if (reader.hidden || !active.pdf || readerMode !== "flip") return;
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      const key = layoutKey();
      if (key === lastKey || isOpening) return;
      openReader();
    }, 400);
  });

  window.addEventListener("orientationchange", function () {
    if (reader.hidden || !active.pdf || readerMode !== "flip") return;
    setTimeout(function () {
      if (!isOpening) openReader();
    }, 350);
  });
})();
