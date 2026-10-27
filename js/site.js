(function () {
  const ui = {
    en: { menu: "Menu", close: "Close" },
    hi: { menu: "मेनू", close: "बंद करें" },
  };

  document.addEventListener("contextmenu", (event) => event.preventDefault());

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

  function locale() {
    return localStorage.getItem("ugc-locale") === "hi" ? "hi" : "en";
  }

  function applyLocale(lang) {
    localStorage.setItem("ugc-locale", lang);
    document.documentElement.lang = lang === "hi" ? "hi" : "en";
    document.querySelectorAll("[data-hi]").forEach((el) => {
      if (!el.dataset.en) el.dataset.en = el.textContent;
      el.textContent = lang === "hi" ? el.dataset.hi : el.dataset.en;
    });
    document.querySelectorAll("[data-hi-placeholder]").forEach((el) => {
      if (!el.dataset.enPlaceholder) el.dataset.enPlaceholder = el.getAttribute("placeholder") || "";
      el.setAttribute("placeholder", lang === "hi" ? el.dataset.hiPlaceholder : el.dataset.enPlaceholder);
    });
    document.querySelectorAll("[data-hi-label]").forEach((el) => {
      if (!el.dataset.enLabel) el.dataset.enLabel = el.getAttribute("aria-label") || "";
      el.setAttribute("aria-label", lang === "hi" ? el.dataset.hiLabel : el.dataset.enLabel);
    });
    const title = document.querySelector("title");
    if (title && title.dataset.hi) {
      if (!title.dataset.en) title.dataset.en = title.textContent;
      title.textContent = lang === "hi" ? title.dataset.hi : title.dataset.en;
    }
    document.querySelectorAll("[data-lang]").forEach((button) => {
      button.setAttribute("aria-pressed", button.dataset.lang === lang ? "true" : "false");
    });
    const menu = document.querySelector("[data-menu]");
    if (menu) {
      const open = menu.getAttribute("aria-expanded") === "true";
      menu.textContent = open ? ui[lang].close : ui[lang].menu;
    }
    document.dispatchEvent(new CustomEvent("localechange", { detail: lang }));
  }

  document.querySelectorAll("[data-lang]").forEach((button) => {
    button.addEventListener("click", () => applyLocale(button.dataset.lang));
  });

  const menuButton = document.querySelector("[data-menu]");
  const mobileNav = document.getElementById("mobile-nav");

  function setMenu(open) {
    if (!menuButton || !mobileNav) return;
    menuButton.setAttribute("aria-expanded", open ? "true" : "false");
    mobileNav.hidden = !open;
    const lang = locale();
    menuButton.textContent = open ? ui[lang].close : ui[lang].menu;
  }

  menuButton?.addEventListener("click", () => setMenu(menuButton.getAttribute("aria-expanded") !== "true"));
  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setMenu(false);
  });

  document.querySelectorAll("a[href*='#']").forEach((link) => {
    link.addEventListener("click", (event) => {
      const id = (link.getAttribute("href") || "").split("#")[1];
      const target = id ? document.getElementById(id) : null;
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: reduce.matches ? "auto" : "smooth", block: "start" });
      history.pushState(null, "", id === "home" ? location.pathname : "#" + id);
      setMenu(false);
    });
  });

  const hash = location.hash.replace("#", "");
  if (hash) {
    window.setTimeout(() => {
      document.getElementById(hash)?.scrollIntoView({ behavior: reduce.matches ? "auto" : "smooth", block: "start" });
    }, 50);
  }

  document.querySelectorAll("[data-reveal]").forEach((node) => {
    const show = () => {
      node.classList.remove("reveal-wait");
      node.classList.add(node.hasAttribute("data-stagger") ? "is-shown" : "rise");
      if (node.classList.contains("home-ebook")) {
        node.classList.add("is-live");
      }
    };
    if (reduce.matches) {
      show();
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        show();
        observer.disconnect();
      },
      { threshold: 0.18 },
    );
    observer.observe(node);
  });

  function bindPin(root, onProgress, steps) {
    const pane = root.querySelector(".pin-pane");
    if (!pane) return;
    let raf = 0;
    let last = -1;
    let paneHeight = 0;
    const measure = () => {
      paneHeight = pane.offsetHeight;
    };
    const apply = () => {
      raf = 0;
      if (reduce.matches) {
        if (last !== 1) {
          last = 1;
          pane.style.setProperty("--p", "1");
          onProgress?.(1);
        }
        return;
      }
      const rootRect = root.getBoundingClientRect();
      const view = window.innerHeight;
      let value = 0;
      if (rootRect.bottom <= 0) value = 1;
      else if (rootRect.top < view) {
        const total = Math.max(rootRect.height - (paneHeight || view), 0);
        const scrolled = Math.min(Math.max(-rootRect.top, 0), total);
        value = total > 0 ? scrolled / total : 0;
      }
      if (root.dataset.pin === "panels") {
        // Follow the scroll the whole way so each highlight eases open and
        // closed. Hold the last one open before the section lets go.
        value = Math.min(1, Math.max(0, (value - 0.02) / 0.9));
      } else if (steps) {
        value = Math.round(value * steps) / steps;
      }
      if (value === last) return;
      last = value;
      pane.style.setProperty("--p", value.toFixed(4));
      onProgress?.(value);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(apply);
    };
    measure();
    apply();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", () => {
      measure();
      onScroll();
    });
    reduce.addEventListener("change", onScroll);
  }

  document.querySelectorAll("[data-pin]").forEach((root) => {
    if (root.dataset.pin === "rail") return;
    bindPin(root, null, 0);
  });

  const rail = document.querySelector("[data-pin='rail']");
  if (rail) {
    const viewport = document.getElementById("rail-viewport");
    const track = document.getElementById("rail-track");
    const countEl = document.getElementById("rail-count");
    let metrics = { cards: [], gap: 0, cardWidth: 0, view: 0 };
    const measureRail = () => {
      const cards = track ? [...track.querySelectorAll(".rail-card")] : [];
      const gap = track ? Number.parseFloat(getComputedStyle(track).columnGap || "0") || 0 : 0;
      metrics = {
        cards,
        gap,
        cardWidth: cards[0]?.offsetWidth ?? 0,
        view: viewport?.clientWidth ?? 0,
      };
    };
    measureRail();
    window.addEventListener("resize", measureRail);
    bindPin(rail, (progress) => {
      const { cards, gap, cardWidth, view } = metrics;
      const count = cards.length;
      if (!viewport || !track || reduce.matches || count < 2 || !cardWidth) {
        if (track) track.style.transform = "";
        cards.forEach((card) => {
          card.style.transform = "";
          card.style.opacity = "";
          card.style.zIndex = "";
        });
        return;
      }
      const index = progress * (count - 1);
      const x = view / 2 - cardWidth / 2 - index * (cardWidth + gap);
      track.style.transform = "translate3d(" + x + "px, 0, 0)";
      cards.forEach((card, cardIndex) => {
        const delta = cardIndex - index;
        const abs = Math.min(Math.abs(delta), 1.4);
        const scale = 1 - Math.min(abs, 1) * 0.12;
        const lift = abs * abs * 18;
        card.style.transform = "translate3d(0, " + lift + "px, 0) scale(" + scale + ")";
        card.style.opacity = String(1 - Math.min(abs, 1) * 0.28);
        card.style.zIndex = String(20 - Math.round(abs * 10));
      });
      if (countEl) {
        const current = Math.round(index) + 1;
        countEl.textContent = String(current).padStart(2, "0") + " / " + String(count).padStart(2, "0");
      }
    });
  }

  const about = document.getElementById("about");
  if (about) {
    const items = [...about.querySelectorAll(".about-reveal, .about-chip")];
    const frame = about.querySelector(".about-photo");
    const photo = frame?.querySelector(".about-photo-motion");
    let raf = 0;
    const apply = () => {
      raf = 0;
      if (reduce.matches) {
        items.forEach((item) => item.style.setProperty("--in", "1"));
        photo?.style.setProperty("--zoom", "0");
        return;
      }
      const aboutRect = about.getBoundingClientRect();
      if (aboutRect.bottom < -40 || aboutRect.top > window.innerHeight + 40) return;
      const start = window.innerHeight * 0.98;
      const end = window.innerHeight * 0.78;
      items.forEach((item) => {
        const stagger = Number(item.style.getPropertyValue("--i") || "0") * 0.015;
        const raw = (start - item.getBoundingClientRect().top) / (start - end) - stagger;
        item.style.setProperty("--in", Math.min(1, Math.max(0, raw)).toFixed(3));
      });
      if (photo && frame) {
        const rect = frame.getBoundingClientRect();
        const zoom = (window.innerHeight - (rect.top + rect.height / 2)) / (window.innerHeight * 0.92);
        photo.style.setProperty("--zoom", Math.min(1, Math.max(0, zoom)).toFixed(3));
      }
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(apply);
    };
    apply();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    reduce.addEventListener("change", onScroll);
  }

  const leaders = [...document.querySelectorAll(".leader")];
  const dots = [...document.querySelectorAll(".leader-dots button")];
  if (leaders.length) {
    let index = 0;
    let timer = 0;
    const show = (next) => {
      index = next;
      leaders.forEach((leader, leaderIndex) => {
        const active = leaderIndex === index;
        leader.classList.toggle("is-active", active);
        leader.setAttribute("aria-hidden", active ? "false" : "true");
        leader.querySelector("img")?.classList.toggle("guest-portrait", active && !reduce.matches);
      });
      dots.forEach((dot, dotIndex) => dot.setAttribute("aria-selected", dotIndex === index ? "true" : "false"));
    };
    const arm = () => {
      window.clearInterval(timer);
      if (reduce.matches || leaders.length < 2) return;
      timer = window.setInterval(() => show((index + 1) % leaders.length), 7000);
    };
    dots.forEach((dot, dotIndex) => {
      dot.addEventListener("click", () => {
        show(dotIndex);
        arm();
      });
    });
    show(0);
    arm();
    reduce.addEventListener("change", () => {
      show(index);
      arm();
    });
  }

  const slides = [...document.querySelectorAll(".leadership-backdrop img")];
  const showSlide = (next) => {
    slides.forEach((slide, slideIndex) => {
      const active = slideIndex === next;
      slide.classList.toggle("is-on", active);
      slide.classList.toggle("scene-drift", active && !reduce.matches);
    });
  };
  if (slides.length) {
    let slide = Math.max(0, slides.findIndex((item) => item.classList.contains("is-on")));
    showSlide(slide);
    if (slides.length > 1 && !reduce.matches) {
      window.setInterval(() => {
        slide = (slide + 1) % slides.length;
        showSlide(slide);
      }, 4800);
    }
  }

  applyLocale(locale());
})();
