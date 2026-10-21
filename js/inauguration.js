(() => {
  const heroView = document.getElementById("hero-view");
  const launchView = document.getElementById("launch-view");
  const cmCard = document.getElementById("cm-card");
  const countdownDisplay = document.getElementById("countdown-display");
  const countdownNumber = document.getElementById("countdown-number");
  const liveView = document.getElementById("live-view");
  const flashOverlay = document.getElementById("flash-overlay");

  let launching = false;
  let audioCtx = null;

  function ensureAudio() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === "suspended") audioCtx.resume();
    return audioCtx;
  }

  function playTone(frequency, duration, type = "sine") {
    try {
      const ctx = ensureAudio();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.28, ctx.currentTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      oscillator.start();
      oscillator.stop(ctx.currentTime + duration);
    } catch (_) {
      /* ignore */
    }
  }

  function transitionToLaunch() {
    ensureAudio();
    playTone(220, 0.2, "sine");
    heroView.style.opacity = "0";

    setTimeout(() => {
      heroView.classList.add("hidden");
      heroView.classList.remove("flex");

      launchView.classList.remove("hidden");
      launchView.classList.add("flex");

      void launchView.offsetWidth;
      launchView.classList.remove("opacity-0");
      launchView.classList.add("opacity-100");

      cmCard.classList.remove("translate-y-10");
      cmCard.classList.add("translate-y-0");
    }, 900);
  }

  function backToHero() {
    if (launching) return;
    launchView.classList.add("opacity-0");
    launchView.classList.remove("opacity-100");

    setTimeout(() => {
      launchView.classList.add("hidden");
      launchView.classList.remove("flex");
      countdownDisplay.classList.add("hidden");
      countdownDisplay.classList.remove("is-open", "is-go-live");
      cmCard.classList.remove("hidden");
      cmCard.style.opacity = "";
      cmCard.style.transform = "";
      cmCard.classList.add("translate-y-10");
      cmCard.classList.remove("translate-y-0");

      heroView.classList.remove("hidden");
      heroView.classList.add("flex");
      void heroView.offsetWidth;
      heroView.style.opacity = "1";
    }, 500);
  }

  function startCountdown() {
    if (launching) return;
    launching = true;
    ensureAudio();

    cmCard.style.opacity = "0";
    cmCard.style.transform = "scale(0.8) translateY(-50px)";

    setTimeout(() => {
      cmCard.classList.add("hidden");
      countdownDisplay.classList.remove("hidden");
      countdownDisplay.classList.add("is-open");
      countdownDisplay.classList.remove("is-go-live");

      const steps = ["3", "2", "1", "GO LIVE"];
      let index = 0;

      function updateCounter() {
        const value = steps[index];
        const isGoLive = value === "GO LIVE";
        const label = countdownDisplay.querySelector(".countdown-label");

        if (label) {
          label.textContent = isGoLive ? "Challenge status" : "Launching in";
        }

        countdownDisplay.classList.toggle("is-go-live", isGoLive);
        countdownNumber.textContent = value;
        countdownNumber.classList.toggle("is-go-live", isGoLive);
        countdownNumber.classList.remove("is-pop");
        void countdownNumber.offsetWidth;
        countdownNumber.classList.add("is-pop");

        if (isGoLive) {
          playTone(523, 0.25, "triangle");
          setTimeout(() => playTone(659, 0.35, "triangle"), 120);
          setTimeout(() => playTone(784, 0.7, "sawtooth"), 260);
          setTimeout(triggerFlashbangAndLaunch, 1100);
          return;
        }

        playTone(160 + (3 - index) * 70, 0.32, "square");
        index += 1;
        setTimeout(updateCounter, 1100);
      }

      updateCounter();
    }, 600);
  }

  function playCurtainReveal() {
    const curtainStage = document.getElementById("curtain-stage");
    if (!curtainStage) {
      fireMassiveConfetti();
      launching = false;
      return;
    }

    liveView.classList.remove("curtains-revealed");
    curtainStage.classList.remove("is-open", "is-done");
    curtainStage.classList.add("is-ready");

    // Hold closed red blanket, then open from center
    setTimeout(() => {
      curtainStage.classList.add("is-open");
      liveView.classList.add("curtains-revealed");
      playTone(392, 0.35, "triangle");
      setTimeout(() => playTone(523, 0.45, "triangle"), 180);
      fireMassiveConfetti();
    }, 700);

    setTimeout(() => {
      curtainStage.classList.add("is-done");
      curtainStage.classList.remove("is-ready");
      launching = false;
    }, 3200);
  }

  function triggerFlashbangAndLaunch() {
    flashOverlay.classList.add("flash-active");

    setTimeout(() => {
      countdownDisplay.classList.remove("is-open", "is-go-live");
      countdownDisplay.classList.add("hidden");

      launchView.classList.add("hidden");
      launchView.classList.remove("flex", "opacity-100");
      launchView.classList.add("opacity-0");

      liveView.classList.remove("hidden", "opacity-0", "curtains-revealed");
      liveView.classList.add("flex", "opacity-100");

      flashOverlay.classList.remove("flash-active");
      playCurtainReveal();
    }, 150);
  }

  function fireMassiveConfetti() {
    if (typeof confetti !== "function") return;

    const duration = 5000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 55, spread: 360, ticks: 120, zIndex: 100 };
    const colors = ["#e62429", "#f59e0b", "#fbbf24", "#ffffff", "#7f1d1d", "#3b82f6"];

    const randomInRange = (min, max) => Math.random() * (max - min) + min;

    confetti({
      particleCount: 160,
      spread: 110,
      origin: { y: 0.6 },
      colors,
      startVelocity: 60,
      zIndex: 100,
    });

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) {
        clearInterval(interval);
        return;
      }

      const particleCount = 80 * (timeLeft / duration);
      confetti(
        Object.assign({}, defaults, {
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
          colors,
          shapes: ["square", "circle"],
        })
      );
      confetti(
        Object.assign({}, defaults, {
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
          colors,
          shapes: ["square", "circle"],
        })
      );
    }, 250);
  }

  document.getElementById("open-cm-portal")?.addEventListener("click", transitionToLaunch);
  document.getElementById("start-countdown")?.addEventListener("click", startCountdown);
  document.getElementById("back-to-hero")?.addEventListener("click", backToHero);
  document.getElementById("replay-inauguration")?.addEventListener("click", () => location.reload());

  document.querySelectorAll("[data-scroll]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = document.querySelector(btn.getAttribute("data-scroll"));
      if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  document.addEventListener("mousedown", (e) => {
    const target = e.target.closest(".ripple-btn");
    if (!target) return;
    const rect = target.getBoundingClientRect();
    const ripple = document.createElement("span");
    const diameter = Math.max(rect.width, rect.height);
    const radius = diameter / 2;
    ripple.style.width = ripple.style.height = `${diameter}px`;
    ripple.style.left = `${e.clientX - rect.left - radius}px`;
    ripple.style.top = `${e.clientY - rect.top - radius}px`;
    ripple.classList.add("ripple");
    target.querySelector(".ripple")?.remove();
    target.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  });

  const params = new URLSearchParams(window.location.search);
  if (params.get("live") === "1") {
    heroView.classList.add("hidden");
    heroView.classList.remove("flex");
    liveView.classList.remove("hidden", "opacity-0");
    liveView.classList.add("flex", "opacity-100");
    if (params.get("curtain") === "1") {
      playCurtainReveal();
    } else {
      liveView.classList.add("curtains-revealed");
    }
  }
})();
