(() => {
  const heroView = document.getElementById("hero-view");
  const launchView = document.getElementById("launch-view");
  const cmCard = document.getElementById("cm-card");
  const countdownDisplay = document.getElementById("countdown-display");
  const countdownNumber = document.getElementById("countdown-number");
  const countdownWord = document.getElementById("countdown-word");
  const countdownLead = document.getElementById("countdown-lead");
  const countdownUnit = document.getElementById("countdown-unit");
  const countdownTicks = document.getElementById("countdown-ticks");
  const countdownSubline = document.getElementById("countdown-subline");
  const liveView = document.getElementById("live-view");
  const flashOverlay = document.getElementById("flash-overlay");
  const challengeTopbar = document.getElementById("challenge-topbar");
  const COUNTDOWN_VOICE = {
    10: "ten",
    9: "nine",
    8: "eight",
    7: "seven",
    6: "six",
    5: "five",
    4: "four",
    3: "three",
    2: "two",
    1: "one",
  };
  const FEMALE_VOICE_HINT =
    /female|woman|samantha|victoria|karen|moira|tessa|fiona|veena|raveena|zira|susan|linda|heather|serena|ava|allison|amy|emma|joanna|ivy|kimberly|salli|nicole|olivia|natasha|priya|neerja|kathy|vicki|leslie|google uk english female/i;
  const MALE_VOICE_HINT =
    /male|\bman\b|david|daniel|alex|fred|jorge|thomas|bruce|aaron|rishi|reed|google uk english male|microsoft david|microsoft mark/i;

  let launching = false;
  let audioCtx = null;
  let preferredVoice = null;

  /** Sticky header only on the live Grand Innovation Challenge page. */
  function setTopbarVisible(visible) {
    if (!challengeTopbar) return;
    challengeTopbar.classList.toggle("is-hidden", !visible);
    challengeTopbar.setAttribute("aria-hidden", visible ? "false" : "true");
  }

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

  function pickVoice() {
    if (!("speechSynthesis" in window)) return null;
    const voices = window.speechSynthesis.getVoices();
    if (!voices.length) return preferredVoice;

    const english = voices.filter((v) => /^en/i.test(v.lang));
    const pool = english.length ? english : voices;

    preferredVoice =
      pool.find((v) => FEMALE_VOICE_HINT.test(v.name) && !MALE_VOICE_HINT.test(v.name)) ||
      pool.find((v) => /female/i.test(v.name)) ||
      pool.find((v) => !MALE_VOICE_HINT.test(v.name)) ||
      pool[0] ||
      voices[0];
    return preferredVoice;
  }

  if ("speechSynthesis" in window) {
    pickVoice();
    window.speechSynthesis.addEventListener("voiceschanged", pickVoice);
  }

  function speakCountdownPhrase(phrase) {
    if (!phrase || !("speechSynthesis" in window)) return false;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(phrase);
      utterance.lang = "en-IN";
      utterance.rate = 0.9;
      utterance.pitch = 1.2;
      utterance.volume = 1;
      const voice = pickVoice();
      if (voice) {
        utterance.voice = voice;
        utterance.lang = voice.lang || "en-IN";
      }
      window.speechSynthesis.speak(utterance);
      return true;
    } catch (_) {
      return false;
    }
  }

  function transitionToLaunch() {
    ensureAudio();
    playTone(220, 0.2, "sine");
    document.body.style.overflow = "hidden";
    setTopbarVisible(false);
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
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
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
      setTopbarVisible(false);
    }, 500);
  }

  function startCountdown() {
    if (launching) return;
    launching = true;
    ensureAudio();
    pickVoice();

    cmCard.style.opacity = "0";
    cmCard.style.transform = "scale(0.8) translateY(-50px)";

    setTimeout(() => {
      cmCard.classList.add("hidden");
      countdownDisplay.classList.remove("hidden");
      countdownDisplay.classList.add("is-open");
      countdownDisplay.classList.remove("is-go-live");

      const steps = ["10", "9", "8", "7", "6", "5", "4", "3", "2", "1", "GO LIVE"];
      const totalTicks = 10;
      let index = 0;

      if (countdownTicks) {
        countdownTicks.innerHTML = Array.from({ length: totalTicks }, (_, i) => {
          return `<span class="countdown-tick" data-tick="${totalTicks - i}"></span>`;
        }).join("");
      }

      if (countdownLead) {
        countdownLead.textContent = "is going live within";
        countdownLead.classList.remove("is-live");
      }
      if (countdownUnit) {
        countdownUnit.textContent = "seconds";
        countdownUnit.classList.remove("is-hidden");
      }
      if (countdownSubline) {
        countdownSubline.textContent = "Get ready to build for the world’s largest gathering";
      }

      function paintTicks(remaining) {
        if (!countdownTicks) return;
        countdownTicks.querySelectorAll(".countdown-tick").forEach((tick) => {
          const value = Number(tick.dataset.tick);
          tick.classList.toggle("is-done", value > remaining);
          tick.classList.toggle("is-current", value === remaining);
        });
      }

      function updateCounter() {
        const value = steps[index];
        const isGoLive = value === "GO LIVE";
        const n = Number(value);

        if (countdownLead) {
          countdownLead.textContent = isGoLive ? "is now" : "is going live within";
          countdownLead.classList.toggle("is-live", isGoLive);
        }

        if (countdownUnit) {
          if (isGoLive) {
            countdownUnit.classList.add("is-hidden");
          } else {
            countdownUnit.textContent = n === 1 ? "second" : "seconds";
            countdownUnit.classList.remove("is-hidden");
          }
        }

        if (countdownSubline) {
          countdownSubline.textContent = isGoLive
            ? "Welcome to the Grand Innovation Challenge"
            : "Get ready to build for the world’s largest gathering";
        }

        if (countdownWord) {
          countdownWord.textContent = isGoLive ? "GO LIVE" : "";
          countdownWord.classList.toggle("is-go-live", isGoLive);
          countdownWord.hidden = !isGoLive;
          countdownWord.classList.remove("is-pop");
          if (isGoLive) {
            void countdownWord.offsetWidth;
            countdownWord.classList.add("is-pop");
          }
        }

        countdownDisplay.classList.toggle("is-go-live", isGoLive);
        countdownNumber.textContent = isGoLive ? "" : value;
        countdownNumber.hidden = isGoLive;
        countdownNumber.classList.toggle("is-go-live", isGoLive);
        countdownNumber.classList.toggle("is-double", !isGoLive && value.length > 1);
        countdownNumber.classList.remove("is-pop");
        void countdownNumber.offsetWidth;
        if (!isGoLive) countdownNumber.classList.add("is-pop");

        if (!isGoLive) paintTicks(n);
        else if (countdownTicks) {
          countdownTicks.querySelectorAll(".countdown-tick").forEach((tick) => {
            tick.classList.add("is-done");
            tick.classList.remove("is-current");
          });
        }

        if (isGoLive) {
          const spoke = speakCountdownPhrase("go live");
          if (!spoke) {
            playTone(523, 0.25, "triangle");
            setTimeout(() => playTone(659, 0.35, "triangle"), 120);
            setTimeout(() => playTone(784, 0.7, "sawtooth"), 260);
          }
          setTimeout(triggerFlashbangAndLaunch, 1100);
          return;
        }

        const spoke = speakCountdownPhrase(COUNTDOWN_VOICE[n] || String(n));
        if (!spoke) playTone(140 + (10 - index) * 28, 0.28, "square");
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
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    flashOverlay.classList.add("flash-active");

    setTimeout(() => {
      countdownDisplay.classList.remove("is-open", "is-go-live");
      countdownDisplay.classList.add("hidden");

      launchView.classList.add("hidden");
      launchView.classList.remove("flex", "opacity-100");
      launchView.classList.add("opacity-0");

      liveView.classList.remove("hidden", "opacity-0", "curtains-revealed");
      liveView.classList.add("flex", "opacity-100");
      setTopbarVisible(true);

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
    setTopbarVisible(true);
    if (params.get("curtain") === "1") {
      playCurtainReveal();
    } else {
      liveView.classList.add("curtains-revealed");
    }
  } else {
    setTopbarVisible(false);
  }
})();
