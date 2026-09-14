/* =====================================================================
   HAPPY BIRTHDAY, BAMBI — script.js
   Plain vanilla JavaScript. No frameworks, no build step.
   Just open index.html.
   ===================================================================== */


/* ---------------------------------------------------------------------
   >>> CHANGE THE BIRTHDAY DATE HERE <<<
   Format: "YYYY-MM-DDT00:00:00"  (24-hour time, the visitor's own clock)

   Example — 3 October 2026 at midnight:
   const birthdayDate = "2026-10-03T00:00:00";
   --------------------------------------------------------------------- */
const birthdayDate = "2026-09-15T00:00:00";

/* Optional: how long the intro curtain stays up, in milliseconds.
   First line shows, then the second line at HALF this time. */
const introDuration = 4400;

/* --------------------------------------------------------------------- */


(function () {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $  = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));


  /* =====================================================================
     1. INTRO CURTAIN
     ===================================================================== */
  const intro     = $("#intro");
  const lineOne   = $("#introLineOne");
  const lineTwo   = $("#introLineTwo");
  const skipBtn   = $("#introSkip");
  const site      = $("#site");

  let introFinished = false;
  let introTimers = [];

  function startIntro() {
    if (reduceMotion) {
      endIntro();
      return;
    }

    introTimers.push(setTimeout(() => lineOne.classList.add("is-on"), 250));

    // Swap to the second line halfway through
    introTimers.push(setTimeout(() => {
      lineOne.classList.remove("is-on");
      lineOne.classList.add("is-off");
      lineTwo.classList.add("is-on");
    }, introDuration / 2));

    introTimers.push(setTimeout(endIntro, introDuration));
  }

  function endIntro() {
    if (introFinished) return;
    introFinished = true;

    introTimers.forEach(clearTimeout);
    introTimers = [];

    intro.classList.add("is-gone");
    document.body.classList.remove("intro-locked");
    site.classList.add("is-revealed");

    // Let the hero animate in once the curtain is out of the way
    setTimeout(revealInView, 120);

    // Move keyboard focus onto the page
    setTimeout(() => { if (intro) intro.setAttribute("hidden", ""); }, 1000);
  }

  skipBtn.addEventListener("click", endIntro);
  document.addEventListener("keydown", (e) => {
    if (!introFinished && (e.key === "Enter" || e.key === "Escape" || e.key === " ")) endIntro();
  });


  /* =====================================================================
     2. SCROLL REVEAL
     Elements with class "reveal" fade up the first time they appear.
     ===================================================================== */
  const revealEls = $$(".reveal");

  let observer = null;

  if ("IntersectionObserver" in window && !reduceMotion) {
    observer = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        // Small stagger between siblings so groups arrive gracefully
        const siblings = Array.from(entry.target.parentElement.children)
          .filter((el) => el.classList.contains("reveal"));
        const delay = Math.min(siblings.indexOf(entry.target), 6) * 90;

        setTimeout(() => entry.target.classList.add("is-visible"), delay);
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });

    revealEls.forEach((el) => observer.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  }

  // Force-check anything already on screen (used right after the intro)
  function revealInView() {
    if (!introFinished) return;
    revealEls.forEach((el) => {
      if (el.classList.contains("is-visible")) return;
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.92) {
        el.classList.add("is-visible");
        if (observer) observer.unobserve(el);
      }
    });
  }


  /* =====================================================================
     3. SMOOTH SCROLL (hero button)
     ===================================================================== */
  $$("[data-scroll]").forEach((link) => {
    link.addEventListener("click", (e) => {
      const target = document.querySelector(link.getAttribute("href"));
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({
        behavior: reduceMotion ? "auto" : "smooth",
        block: "start"
      });
    });
  });


  /* =====================================================================
     4. SCROLL PROGRESS BAR
     ===================================================================== */
  const progressBar = $("#progressBar");

  function updateProgress() {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const pct = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
    progressBar.style.width = Math.min(100, Math.max(0, pct)) + "%";
  }

  window.addEventListener("scroll", updateProgress, { passive: true });
  window.addEventListener("resize", updateProgress);
  updateProgress();


  /* =====================================================================
     5. HERO PARTICLES
     Soft drifting lights behind the hero. Pauses when out of view.
     ===================================================================== */
  const canvas = $("#particles");
  const hero   = $("#hero");

  if (canvas && !reduceMotion) {
    const ctx = canvas.getContext("2d");
    let particles = [];
    let raf = null;
    let heroVisible = true;

    const COLORS = ["rgba(193,128,140,", "rgba(176,134,64,", "rgba(228,211,194,"];

    function sizeCanvas() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width  = canvas.offsetWidth  * dpr;
      canvas.height = canvas.offsetHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildParticles();
    }

    function buildParticles() {
      const area  = canvas.offsetWidth * canvas.offsetHeight;
      const count = Math.min(46, Math.max(18, Math.round(area / 16000)));
      particles = [];

      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * canvas.offsetWidth,
          y: Math.random() * canvas.offsetHeight,
          r: Math.random() * 2.4 + 0.8,
          vx: (Math.random() - 0.5) * 0.18,
          vy: -(Math.random() * 0.26 + 0.07),
          alpha: Math.random() * 0.4 + 0.18,
          twinkle: Math.random() * Math.PI * 2,
          color: COLORS[Math.floor(Math.random() * COLORS.length)]
        });
      }
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.twinkle += 0.015;

        if (p.y < -10) { p.y = canvas.offsetHeight + 10; p.x = Math.random() * canvas.offsetWidth; }
        if (p.x < -10) p.x = canvas.offsetWidth + 10;
        if (p.x > canvas.offsetWidth + 10) p.x = -10;

        const a = p.alpha * (0.65 + 0.35 * Math.sin(p.twinkle));

        ctx.beginPath();
        ctx.fillStyle = p.color + a.toFixed(3) + ")";
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      });

      raf = requestAnimationFrame(draw);
    }

    function startLoop() { if (!raf) raf = requestAnimationFrame(draw); }
    function stopLoop()  { if (raf) { cancelAnimationFrame(raf); raf = null; } }

    sizeCanvas();
    startLoop();

    window.addEventListener("resize", sizeCanvas);

    if ("IntersectionObserver" in window) {
      new IntersectionObserver((entries) => {
        heroVisible = entries[0].isIntersecting;
        heroVisible ? startLoop() : stopLoop();
      }, { threshold: 0.02 }).observe(hero);
    }

    document.addEventListener("visibilitychange", () => {
      document.hidden || !heroVisible ? stopLoop() : startLoop();
    });
  }


  /* =====================================================================
     6. CONFETTI
     Used by the countdown and the surprise button.
     ===================================================================== */
  const confettiCanvas = $("#confetti");
  const cctx = confettiCanvas.getContext("2d");
  let pieces = [];
  let confettiRaf = null;

  const CONFETTI_COLORS = ["#C1808C", "#B08640", "#E4D3C2", "#F0DCDD", "#FBF7F1", "#8E6B5C"];

  function sizeConfetti() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    confettiCanvas.width  = window.innerWidth  * dpr;
    confettiCanvas.height = window.innerHeight * dpr;
    cctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  sizeConfetti();
  window.addEventListener("resize", sizeConfetti);

  function launchConfetti(amount) {
    if (reduceMotion) return;

    const total = amount || 90;
    const w = window.innerWidth;

    for (let i = 0; i < total; i++) {
      pieces.push({
        x: Math.random() * w,
        y: -20 - Math.random() * window.innerHeight * 0.4,
        w: Math.random() * 7 + 4,
        h: Math.random() * 10 + 5,
        vy: Math.random() * 2.2 + 1.6,
        vx: (Math.random() - 0.5) * 1.6,
        rot: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.14,
        color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        life: 1
      });
    }

    if (!confettiRaf) confettiRaf = requestAnimationFrame(runConfetti);
  }

  function runConfetti() {
    cctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    pieces = pieces.filter((p) => p.y < window.innerHeight + 40 && p.life > 0);

    pieces.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.015;
      p.rot += p.vr;

      if (p.y > window.innerHeight * 0.75) p.life -= 0.012;

      cctx.save();
      cctx.translate(p.x, p.y);
      cctx.rotate(p.rot);
      cctx.globalAlpha = Math.max(0, p.life);
      cctx.fillStyle = p.color;
      cctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      cctx.restore();
    });

    if (pieces.length) {
      confettiRaf = requestAnimationFrame(runConfetti);
    } else {
      cctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      confettiRaf = null;
    }
  }


  /* =====================================================================
     7. COUNTDOWN
     Uses the birthdayDate value at the top of this file.
     ===================================================================== */
  const liveBox = $("#countdownLive");
  const doneBox = $("#countdownDone");
  const fields  = {
    days:    $("#cdDays"),
    hours:   $("#cdHours"),
    minutes: $("#cdMinutes"),
    seconds: $("#cdSeconds")
  };

  const target = new Date(birthdayDate).getTime();
  let countdownTimer = null;
  let celebrated = false;

  function pad(n) { return String(n).padStart(2, "0"); }

  function setField(el, value) {
    const next = pad(value);
    if (el.textContent === next) return;

    el.textContent = next;

    if (!reduceMotion) {
      el.classList.add("is-ticking");
      setTimeout(() => el.classList.remove("is-ticking"), 260);
    }
  }

  function celebrate(withConfetti) {
    if (celebrated) return;
    celebrated = true;

    liveBox.hidden = true;
    doneBox.hidden = false;

    if (withConfetti) launchConfetti(140);
  }

  function tick() {
    if (isNaN(target)) {
      // Bad date string — fail quietly rather than showing NaN
      liveBox.hidden = true;
      return;
    }

    const diff = target - Date.now();

    if (diff <= 0) {
      celebrate(true);
      clearInterval(countdownTimer);
      return;
    }

    const secs = Math.floor(diff / 1000);

    setField(fields.days,    Math.floor(secs / 86400));
    setField(fields.hours,   Math.floor((secs % 86400) / 3600));
    setField(fields.minutes, Math.floor((secs % 3600) / 60));
    setField(fields.seconds, secs % 60);
  }

  if (Date.now() >= target && !isNaN(target)) {
    // The day has already arrived — show the banner straight away,
    // and save the confetti for when she scrolls to it.
    celebrate(false);

    if ("IntersectionObserver" in window) {
      const burst = new IntersectionObserver((entries, obs) => {
        if (entries[0].isIntersecting) {
          launchConfetti(120);
          obs.disconnect();
        }
      }, { threshold: 0.4 });
      burst.observe($("#countdown"));
    }
  } else {
    tick();
    countdownTimer = setInterval(tick, 1000);
  }


  /* =====================================================================
     8. SURPRISE MODAL
     ===================================================================== */
  const modal       = $("#modal");
  const surpriseBtn = $("#surpriseBtn");
  const modalClose  = $("#modalClose");

  function openModal() {
    modal.hidden = false;
    document.body.classList.add("modal-open");

    // next frame so the transition actually runs
    requestAnimationFrame(() => modal.classList.add("is-open"));

    launchConfetti(110);
    setTimeout(() => modalClose.focus(), 420);
  }

  function closeModal() {
    modal.classList.remove("is-open");
    document.body.classList.remove("modal-open");
    setTimeout(() => { modal.hidden = true; }, 400);
    surpriseBtn.focus();
  }

  surpriseBtn.addEventListener("click", openModal);
  modalClose.addEventListener("click", closeModal);
  $$("[data-close-modal]").forEach((el) => el.addEventListener("click", closeModal));


  /* =====================================================================
     9. GALLERY + LIGHTBOX
     Photos that have not been added yet show a soft placeholder
     instead of a broken image.
     ===================================================================== */
  const lightbox    = $("#lightbox");
  const lightboxImg = $("#lightboxImg");
  const lightboxCap = $("#lightboxCaption");
  const lightboxX   = $("#lightboxClose");

  $$(".photo").forEach((figure) => {
    const img = figure.querySelector("img");

    function markEmpty() { figure.classList.add("is-empty"); }

    img.addEventListener("error", markEmpty);
    if (img.complete && img.naturalWidth === 0) markEmpty();

    figure.setAttribute("tabindex", "0");
    figure.setAttribute("role", "button");

    function open() {
      if (figure.classList.contains("is-empty")) return;
      lightboxImg.src = img.src;
      lightboxImg.alt = img.alt;
      lightboxCap.textContent = figure.querySelector("figcaption").textContent;
      lightbox.hidden = false;
      document.body.classList.add("modal-open");
      requestAnimationFrame(() => lightbox.classList.add("is-open"));
      setTimeout(() => lightboxX.focus(), 320);
    }

    figure.addEventListener("click", open);
    figure.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); }
    });
  });

  function closeLightbox() {
    lightbox.classList.remove("is-open");
    document.body.classList.remove("modal-open");
    setTimeout(() => { lightbox.hidden = true; lightboxImg.src = ""; }, 320);
  }

  lightboxX.addEventListener("click", closeLightbox);
  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) closeLightbox();
  });


  /* =====================================================================
     10. ESCAPE KEY closes whatever is open
     ===================================================================== */
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if (!lightbox.hidden) closeLightbox();
    else if (!modal.hidden) closeModal();
  });


  /* =====================================================================
     11. MUSIC
     >>> REPLACE THE SONG: put your file at assets/birthday-song.mp3 <<<
     If the file is missing, the button quietly steps aside and the rest
     of the page keeps working.
     ===================================================================== */
  const song       = $("#birthdaySong");
  const musicBtn   = $("#musicBtn");
  const musicLabel = $("#musicLabel");

  let musicBroken = false;

  song.volume = 0.45;

  song.addEventListener("error", () => {
    musicBroken = true;
    musicLabel.textContent = "No music yet";
    musicBtn.disabled = true;
    musicBtn.style.opacity = "0.5";
    musicBtn.classList.remove("is-playing");
  });

  musicBtn.addEventListener("click", () => {
    if (musicBroken) return;

    if (song.paused) {
      const attempt = song.play();

      if (attempt && typeof attempt.then === "function") {
        attempt
          .then(() => {
            musicLabel.textContent = "Pause Music";
            musicBtn.classList.add("is-playing");
            musicBtn.setAttribute("aria-pressed", "true");
          })
          .catch(() => {
            musicBroken = true;
            musicLabel.textContent = "No music yet";
            musicBtn.disabled = true;
            musicBtn.style.opacity = "0.5";
          });
      }
    } else {
      song.pause();
      musicLabel.textContent = "Play Music";
      musicBtn.classList.remove("is-playing");
      musicBtn.setAttribute("aria-pressed", "false");
    }
  });


  /* =====================================================================
     12. GO
     ===================================================================== */
  window.addEventListener("load", revealInView);
  startIntro();

})();
