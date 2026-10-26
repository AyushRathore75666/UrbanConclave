(function () {
  "use strict";

  const choice = document.getElementById("ebook-choice");
  const reader = document.getElementById("ebook-reader");
  const choiceTitle = document.getElementById("ebook-choice-title");
  const choiceRead = document.getElementById("ebook-choice-read");
  const choiceDownload = document.getElementById("ebook-choice-download");
  const readerTitle = document.getElementById("ebook-reader-title");
  const readerClose = document.getElementById("ebook-reader-close");
  const readerPrev = document.getElementById("ebook-reader-prev");
  const readerNext = document.getElementById("ebook-reader-next");
  const readerPage = document.getElementById("ebook-reader-page");
  const readerStage = document.getElementById("ebook-reader-stage");
  const readerBook = document.getElementById("ebook-reader-book");
  const readerLoading = document.getElementById("ebook-reader-loading");
  const readerError = document.getElementById("ebook-reader-error");

  if (!choice || !reader || !window.pdfjsLib || !window.St) return;

  pdfjsLib.GlobalWorkerOptions.workerSrc =
    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

  let active = { pdf: "", file: "", title: "" };
  let pageFlip = null;
  let objectUrls = [];
  let loadingToken = 0;
  let lastKey = "";
  let isOpening = false;
  let pageAspect = 1.414;

  function lockScroll(lock) {
    document.documentElement.classList.toggle("ebook-scroll-lock", lock);
    document.body.classList.toggle("ebook-scroll-lock", lock);
  }

  function openChoice(pdf, file, title) {
    active = { pdf: pdf, file: file || "ebook.pdf", title: title || "E-Book" };
    choiceTitle.textContent = active.title;
    choiceDownload.setAttribute("href", active.pdf);
    choiceDownload.setAttribute("download", active.file);
    choice.hidden = false;
    choice.setAttribute("aria-hidden", "false");
    lockScroll(true);
    choiceRead.focus();
  }

  function closeChoice() {
    choice.hidden = true;
    choice.setAttribute("aria-hidden", "true");
    if (reader.hidden) lockScroll(false);
  }

  function destroyFlip() {
    if (pageFlip) {
      try {
        pageFlip.destroy();
      } catch (_) {}
      pageFlip = null;
    }
    objectUrls.forEach(function (url) {
      URL.revokeObjectURL(url);
    });
    objectUrls = [];
    readerBook.innerHTML = "";
    readerBook.removeAttribute("style");
  }

  function closeReader() {
    loadingToken += 1;
    isOpening = false;
    reader.hidden = true;
    reader.setAttribute("aria-hidden", "true");
    readerError.hidden = true;
    readerLoading.hidden = true;
    destroyFlip();
    lockScroll(false);
  }

  function updatePageLabel() {
    if (!pageFlip) {
      readerPage.textContent = "";
      readerPrev.disabled = true;
      readerNext.disabled = true;
      return;
    }
    const total = pageFlip.getPageCount();
    const current = pageFlip.getCurrentPageIndex() + 1;
    readerPage.textContent = current + " / " + total;
    readerPrev.disabled = current <= 1;
    readerNext.disabled = current >= total;
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

  async function renderPdfPages(url, token) {
    const pdf = await pdfjsLib.getDocument({ url: url, withCredentials: false }).promise;
    if (token !== loadingToken) return null;

    const first = await pdf.getPage(1);
    const base = first.getViewport({ scale: 1 });
    pageAspect = base.height / base.width;

    const longEdge = Math.max(base.width, base.height);
    const scale = Math.min(2.4, Math.max(1.25, 1400 / longEdge));

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
      if (readerLoading && !readerLoading.hidden) {
        readerLoading.querySelector("[data-ebook-progress]").textContent =
          "Preparing pages " + i + " / " + pdf.numPages;
      }
    }

    return pages;
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

  async function openReader() {
    if (!active.pdf || isOpening) return;
    isOpening = true;
    const token = ++loadingToken;
    closeChoice();
    destroyFlip();

    lastKey = layoutKey();
    readerTitle.textContent = active.title;
    readerError.hidden = true;
    readerLoading.hidden = false;
    readerLoading.querySelector("[data-ebook-progress]").textContent = "Loading PDF…";
    reader.hidden = false;
    reader.setAttribute("aria-hidden", "false");
    lockScroll(true);
    readerClose.focus();

    await new Promise(function (resolve) {
      requestAnimationFrame(function () {
        requestAnimationFrame(resolve);
      });
    });

    try {
      const images = await renderPdfPages(active.pdf, token);
      if (token !== loadingToken || !images || !images.length) return;

      await preloadImages(images);
      if (token !== loadingToken) return;

      const size = bookSize();
      const pages = buildHtmlPages(images);

      // Keep the book shell exactly one page wide so StPageFlip never
      // switches into landscape (two-page) mode on desktop.
      const sheet = readerBook.parentElement;
      if (sheet) {
        sheet.style.setProperty("--ebook-page-w", size.width + "px");
        sheet.style.setProperty("--ebook-page-h", size.height + "px");
      }
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
        flippingTime: 1000,
        usePortrait: true,
        startZIndex: 30,
        autoSize: false,
        maxShadowOpacity: 0.65,
        showCover: false,
        mobileScrollSupport: false,
        swipeDistance: 20,
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
        // Re-assert portrait if the library flips orientation
        if (pageFlip && pageFlip.getOrientation && pageFlip.getOrientation() !== "portrait") {
          try {
            pageFlip.update();
          } catch (_) {}
        }
      });
      updatePageLabel();
      readerLoading.hidden = true;
    } catch (err) {
      if (token !== loadingToken) return;
      console.error(err);
      readerLoading.hidden = true;
      readerError.hidden = false;
      readerError.textContent = "Could not open this e-book. Please try Download instead.";
    } finally {
      if (token === loadingToken) isOpening = false;
    }
  }

  document.addEventListener("click", function (event) {
    const trigger = event.target.closest("[data-ebook-open]");
    if (!trigger) return;
    event.preventDefault();
    openChoice(
      trigger.getAttribute("href") || trigger.getAttribute("data-ebook-pdf"),
      trigger.getAttribute("download") || trigger.getAttribute("data-ebook-file") || "ebook.pdf",
      trigger.getAttribute("data-ebook-title") || "E-Book"
    );
  });

  choice.addEventListener("click", function (event) {
    if (event.target === choice) closeChoice();
  });

  choice.querySelectorAll("[data-ebook-choice-close]").forEach(function (btn) {
    btn.addEventListener("click", closeChoice);
  });

  choiceRead.addEventListener("click", function () {
    openReader();
  });

  choiceDownload.addEventListener("click", function () {
    closeChoice();
  });

  readerClose.addEventListener("click", closeReader);

  readerPrev.addEventListener("click", function () {
    if (pageFlip) pageFlip.flipPrev("bottom");
  });

  readerNext.addEventListener("click", function () {
    if (pageFlip) pageFlip.flipNext("bottom");
  });

  document.addEventListener("keydown", function (event) {
    if (!choice.hidden && event.key === "Escape") {
      closeChoice();
      return;
    }
    if (reader.hidden) return;
    if (event.key === "Escape") closeReader();
    if (event.key === "ArrowLeft" && pageFlip) pageFlip.flipPrev("bottom");
    if (event.key === "ArrowRight" && pageFlip) pageFlip.flipNext("bottom");
  });

  let resizeTimer = 0;
  window.addEventListener("resize", function () {
    if (reader.hidden || !active.pdf) return;
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      const key = layoutKey();
      if (key === lastKey || isOpening) return;
      openReader();
    }, 400);
  });

  window.addEventListener("orientationchange", function () {
    if (reader.hidden || !active.pdf) return;
    setTimeout(function () {
      if (!isOpening) openReader();
    }, 350);
  });
})();
