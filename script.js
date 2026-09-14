/* =====================================================================
   HAPPY BIRTHDAY, BAMBI — script.js
   Plain vanilla JavaScript. No frameworks. Open index.html and it runs.
   ===================================================================== */


/* ---------------------------------------------------------------------
   >>> 1. CHANGE THE BIRTHDAY DATE HERE <<<
   Format: "YYYY-MM-DDT00:00:00"   (the visitor's own clock)
   --------------------------------------------------------------------- */
const birthdayDate = "2026-09-15T00:00:00";

/* >>> 2. CHANGE THE SONG NAME SHOWN IN THE MUSIC BAR <<<
   (the audio file itself is assets/birthday-song.mp3) */
const songTitle = "Happy Birthday";

/* >>> 3. HOW LONG THE FIRST INTRO LINE STAYS UP, in milliseconds <<< */
const introLineDelay = 2200;

/* --------------------------------------------------------------------- */


(function () {
  "use strict";

  const $  = (s) => document.querySelector(s);
  const $$ = (s) => Array.from(document.querySelectorAll(s));
  const slow = window.matchMedia("(prefers-reduced-motion: reduce)").matches;


  /* =====================================================================
     MUSIC
     Browsers only allow sound after a real tap, so the music starts on the
     "Enter Birthday Surprise" button. If anything blocks it, we quietly
     wait and try again on her very next tap or scroll.
     ===================================================================== */
  const song       = $("#song");
  const musicbar   = $("#musicbar");
  const musicBtn   = $("#musicToggle");
  const musicIcon  = $("#musicIcon");
  const musicTrack = $("#musicTrack");

  let musicOk     = true;   // is the file usable
  let pausedByHer = false;  // did she press pause herself

  musicTrack.textContent = songTitle;
  song.volume = 0.5;

  song.addEventListener("error", failMusic);

  function failMusic() {
    musicOk = false;
    musicbar.classList.remove("playing");
    musicTrack.textContent = "No music file yet";
    musicBtn.disabled = true;
    musicbar.style.opacity = ".55";
  }

  function showPlaying(on) {
    musicbar.classList.toggle("playing", on);
    musicIcon.textContent = on ? "❚❚" : "▶";
    musicBtn.setAttribute("aria-label", on ? "Pause music" : "Play music");
  }

  function playMusic() {
    if (!musicOk) return;

    const p = song.play();
    if (!p || typeof p.then !== "function") { showPlaying(true); return; }

    p.then(() => showPlaying(true)).catch(() => {
      showPlaying(false);
      armAutoStart();   // blocked — retry on her next interaction
    });
  }

  let armed = false;
  function armAutoStart() {
    if (armed) return;
    armed = true;

    const kick = () => {
      if (pausedByHer || !song.paused) return cleanup();
      song.play().then(() => { showPlaying(true); cleanup(); }).catch(() => {});
    };

    function cleanup() {
      ["pointerdown", "touchstart", "keydown", "scroll"].forEach((ev) =>
        window.removeEventListener(ev, kick)
      );
      armed = false;
    }

    ["pointerdown", "touchstart", "keydown", "scroll"].forEach((ev) =>
      window.addEventListener(ev, kick, { passive: true })
    );
  }

  musicBtn.addEventListener("click", () => {
    if (!musicOk) return;

    if (song.paused) {
      pausedByHer = false;
      playMusic();
    } else {
      pausedByHer = true;
      song.pause();
      showPlaying(false);
    }
  });

  showPlaying(false);


  /* =====================================================================
     INTRO CURTAIN
     ===================================================================== */
  const intro   = $("#intro");
  const lineOne = $("#introLineOne");
  const lineTwo = $("#introLineTwo");
  const enterBtn = $("#introEnter");
  const site    = $("#site");

  let entered = false;

  setTimeout(() => lineOne.classList.add("on"), 300);

  setTimeout(() => {
    lineOne.classList.remove("on");
    lineOne.classList.add("off");
    lineTwo.classList.add("on");
  }, introLineDelay + 300);

  function enter() {
    if (entered) return;
    entered = true;

    playMusic();                       // <- the tap that unlocks sound

    intro.classList.add("gone");
    document.body.classList.remove("is-locked");
    site.classList.add("on");

    setTimeout(() => { intro.hidden = true; }, 1000);
    setTimeout(showInView, 150);
  }

  enterBtn.addEventListener("click", enter);


  /* =====================================================================
     SCROLL REVEAL
     ===================================================================== */
  const revealEls = $$(".rv");
  let io = null;

  if ("IntersectionObserver" in window && !slow) {
    io = new IntersectionObserver((entries, obs) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;

        const sibs = Array.from(e.target.parentElement.children).filter((el) =>
          el.classList.contains("rv")
        );
        const delay = Math.min(sibs.indexOf(e.target), 6) * 85;

        setTimeout(() => e.target.classList.add("on"), delay);
        obs.unobserve(e.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });

    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("on"));
  }

  function showInView() {
    if (!entered) return;
    revealEls.forEach((el) => {
      if (el.classList.contains("on")) return;
      if (el.getBoundingClientRect().top < window.innerHeight * 0.92) {
        el.classList.add("on");
        if (io) io.unobserve(el);
      }
    });
  }


  /* =====================================================================
     SMOOTH SCROLL + PROGRESS BAR
     ===================================================================== */
  $$("[data-scroll]").forEach((a) => {
    a.addEventListener("click", (e) => {
      const t = document.querySelector(a.getAttribute("href"));
      if (!t) return;
      e.preventDefault();
      t.scrollIntoView({ behavior: slow ? "auto" : "smooth", block: "start" });
    });
  });

  const bar = $("#progressBar");

  function progress() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = (max > 0 ? Math.min(100, (window.scrollY / max) * 100) : 0) + "%";
  }

  window.addEventListener("scroll", progress, { passive: true });
  window.addEventListener("resize", progress);
  progress();


  /* =====================================================================
     NIGHT SKY BEHIND THE HERO
     ===================================================================== */
  const sky = $("#sky");

  if (sky && !slow) {
    const ctx = sky.getContext("2d");
    let stars = [], embers = [], raf = null, visible = true;

    function size() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      sky.width  = sky.offsetWidth  * dpr;
      sky.height = sky.offsetHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      build();
    }

    function build() {
      const w = sky.offsetWidth, h = sky.offsetHeight;
      const n = Math.min(70, Math.max(28, Math.round((w * h) / 13000)));

      stars = [];
      for (let i = 0; i < n; i++) {
        stars.push({
          x: Math.random() * w,
          y: Math.random() * h,
          r: Math.random() * 1.3 + 0.3,
          a: Math.random() * 0.5 + 0.2,
          t: Math.random() * Math.PI * 2,
          s: Math.random() * 0.02 + 0.006
        });
      }

      embers = [];
      for (let i = 0; i < 12; i++) {
        embers.push({
          x: Math.random() * w,
          y: Math.random() * h,
          r: Math.random() * 2.6 + 1.4,
          vy: -(Math.random() * 0.22 + 0.06),
          vx: (Math.random() - 0.5) * 0.14,
          a: Math.random() * 0.4 + 0.2
        });
      }
    }

    function frame() {
      const w = sky.offsetWidth, h = sky.offsetHeight;
      ctx.clearRect(0, 0, w, h);

      stars.forEach((s) => {
        s.t += s.s;
        const a = s.a * (0.55 + 0.45 * Math.sin(s.t));
        ctx.beginPath();
        ctx.fillStyle = "rgba(243,239,230," + a.toFixed(3) + ")";
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      });

      embers.forEach((e) => {
        e.x += e.vx;
        e.y += e.vy;
        if (e.y < -20) { e.y = h + 20; e.x = Math.random() * w; }

        const g = ctx.createRadialGradient(e.x, e.y, 0, e.x, e.y, e.r * 6);
        g.addColorStop(0, "rgba(255,190,110," + e.a.toFixed(3) + ")");
        g.addColorStop(1, "rgba(255,159,90,0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.r * 6, 0, Math.PI * 2);
        ctx.fill();
      });

      raf = requestAnimationFrame(frame);
    }

    const start = () => { if (!raf) raf = requestAnimationFrame(frame); };
    const stop  = () => { if (raf) { cancelAnimationFrame(raf); raf = null; } };

    size();
    start();
    window.addEventListener("resize", size);

    if ("IntersectionObserver" in window) {
      new IntersectionObserver((en) => {
        visible = en[0].isIntersecting;
        visible ? start() : stop();
      }, { threshold: 0.02 }).observe($("#hero"));
    }

    document.addEventListener("visibilitychange", () => {
      document.hidden || !visible ? stop() : start();
    });
  }


  /* =====================================================================
     CONFETTI
     ===================================================================== */
  const cCanvas = $("#confetti");
  const cctx = cCanvas.getContext("2d");
  let bits = [], cRaf = null;

  const CONFETTI = ["#E9B44C", "#F6DCA0", "#FF9F5A", "#F3EFE6", "#C9A9E8", "#8B82A0"];

  function sizeC() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    cCanvas.width  = window.innerWidth * dpr;
    cCanvas.height = window.innerHeight * dpr;
    cctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  sizeC();
  window.addEventListener("resize", sizeC);

  function confetti(n) {
    if (slow) return;

    for (let i = 0; i < (n || 90); i++) {
      bits.push({
        x: Math.random() * window.innerWidth,
        y: -20 - Math.random() * window.innerHeight * 0.45,
        w: Math.random() * 7 + 4,
        h: Math.random() * 11 + 5,
        vy: Math.random() * 2.2 + 1.7,
        vx: (Math.random() - 0.5) * 1.7,
        rot: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.15,
        c: CONFETTI[Math.floor(Math.random() * CONFETTI.length)],
        life: 1
      });
    }

    if (!cRaf) cRaf = requestAnimationFrame(runC);
  }

  function runC() {
    cctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    bits = bits.filter((b) => b.y < window.innerHeight + 40 && b.life > 0);

    bits.forEach((b) => {
      b.x += b.vx; b.y += b.vy; b.vy += 0.015; b.rot += b.vr;
      if (b.y > window.innerHeight * 0.72) b.life -= 0.012;

      cctx.save();
      cctx.translate(b.x, b.y);
      cctx.rotate(b.rot);
      cctx.globalAlpha = Math.max(0, b.life);
      cctx.fillStyle = b.c;
      cctx.fillRect(-b.w / 2, -b.h / 2, b.w, b.h);
      cctx.restore();
    });

    if (bits.length) {
      cRaf = requestAnimationFrame(runC);
    } else {
      cctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      cRaf = null;
    }
  }


  /* =====================================================================
     COUNTDOWN
     ===================================================================== */
  const cdLive = $("#cdLive");
  const cdDone = $("#cdDone");
  const F = { d: $("#cdD"), h: $("#cdH"), m: $("#cdM"), s: $("#cdS") };

  const target = new Date(birthdayDate).getTime();
  let timer = null, done = false;

  const pad = (n) => String(n).padStart(2, "0");

  function put(el, v) {
    const next = pad(v);
    if (el.textContent === next) return;
    el.textContent = next;
    if (!slow) {
      el.classList.add("tick");
      setTimeout(() => el.classList.remove("tick"), 260);
    }
  }

  function arrive(withConfetti) {
    if (done) return;
    done = true;
    cdLive.hidden = true;
    cdDone.hidden = false;
    if (withConfetti) confetti(140);
  }

  function tick() {
    if (isNaN(target)) { cdLive.hidden = true; return; }

    const diff = target - Date.now();
    if (diff <= 0) { arrive(true); clearInterval(timer); return; }

    const s = Math.floor(diff / 1000);
    put(F.d, Math.floor(s / 86400));
    put(F.h, Math.floor((s % 86400) / 3600));
    put(F.m, Math.floor((s % 3600) / 60));
    put(F.s, s % 60);
  }

  if (!isNaN(target) && Date.now() >= target) {
    arrive(false);
    if ("IntersectionObserver" in window) {
      const burst = new IntersectionObserver((en, obs) => {
        if (en[0].isIntersecting) { confetti(120); obs.disconnect(); }
      }, { threshold: 0.4 });
      burst.observe($("#count"));
    }
  } else {
    tick();
    timer = setInterval(tick, 1000);
  }


  /* =====================================================================
     FLIP CARDS
     ===================================================================== */
  $$(".flip").forEach((card) => {
    card.addEventListener("click", () => card.classList.toggle("flipped"));
  });


  /* =====================================================================
     ENVELOPE
     ===================================================================== */
  const envelope = $("#envelope");
  const note = $("#note");

  envelope.addEventListener("click", () => {
    envelope.classList.add("opened");
    envelope.setAttribute("aria-expanded", "true");
    note.hidden = false;
    confetti(40);
  });


  /* =====================================================================
     LANTERNS
     ===================================================================== */
  const lanterns = $$(".lantern");
  const lanternHint = $("#lanternHint");
  const lanternDone = $("#lanternDone");

  lanterns.forEach((l) => {
    l.addEventListener("click", () => {
      if (l.classList.contains("lit")) return;
      l.classList.add("lit");

      if (lanterns.every((x) => x.classList.contains("lit"))) {
        lanternHint.hidden = true;
        lanternDone.hidden = false;
        confetti(70);
      }
    });
  });


  /* =====================================================================
     GALLERY + LIGHTBOX
     ===================================================================== */
  const lb    = $("#lb");
  const lbImg = $("#lbImg");
  const lbCap = $("#lbCap");
  const photos = $$(".ph");
  let usable = [];
  let index = 0;

  photos.forEach((fig) => {
    const img = fig.querySelector("img");
    const flagEmpty = () => fig.classList.add("empty");

    img.addEventListener("error", flagEmpty);
    if (img.complete && img.naturalWidth === 0) flagEmpty();

    fig.setAttribute("tabindex", "0");
    fig.setAttribute("role", "button");

    const open = () => {
      if (fig.classList.contains("empty")) return;
      usable = photos.filter((p) => !p.classList.contains("empty"));
      index = usable.indexOf(fig);
      render();
      lb.hidden = false;
      document.body.classList.add("is-locked");
      requestAnimationFrame(() => lb.classList.add("on"));
    };

    fig.addEventListener("click", open);
    fig.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); }
    });
  });

  function render() {
    const fig = usable[index];
    if (!fig) return;
    lbImg.src = fig.querySelector("img").src;
    lbImg.alt = fig.querySelector("img").alt;
    lbCap.textContent = fig.dataset.cap || "";
  }

  function step(n) {
    if (!usable.length) return;
    index = (index + n + usable.length) % usable.length;
    render();
  }

  function closeLb() {
    lb.classList.remove("on");
    document.body.classList.remove("is-locked");
    setTimeout(() => { lb.hidden = true; lbImg.src = ""; }, 320);
  }

  $("#lbX").addEventListener("click", closeLb);
  $("#lbPrev").addEventListener("click", () => step(-1));
  $("#lbNext").addEventListener("click", () => step(1));
  lb.addEventListener("click", (e) => { if (e.target === lb) closeLb(); });


  /* =====================================================================
     MODALS (surprise + secret note)
     ===================================================================== */
  const modal  = $("#modal");
  const secret = $("#secret");

  function openModal(el, withConfetti) {
    el.hidden = false;
    document.body.classList.add("is-locked");
    requestAnimationFrame(() => el.classList.add("on"));
    if (withConfetti) confetti(120);
  }

  function closeModal(el) {
    el.classList.remove("on");
    document.body.classList.remove("is-locked");
    setTimeout(() => { el.hidden = true; }, 400);
  }

  $("#surpriseBtn").addEventListener("click", () => openModal(modal, true));
  $("#modalClose").addEventListener("click", () => closeModal(modal));
  $$("[data-close]").forEach((el) => el.addEventListener("click", () => closeModal(modal)));

  $("#secretTab").addEventListener("click", () => openModal(secret, false));
  $("#secretClose").addEventListener("click", () => closeModal(secret));
  $$("[data-close-secret]").forEach((el) => el.addEventListener("click", () => closeModal(secret)));


  /* =====================================================================
     KEYBOARD
     ===================================================================== */
  document.addEventListener("keydown", (e) => {
    if (!entered) {
      if (e.key === "Enter" || e.key === " ") enter();
      return;
    }

    if (!lb.hidden) {
      if (e.key === "Escape") closeLb();
      if (e.key === "ArrowLeft") step(-1);
      if (e.key === "ArrowRight") step(1);
      return;
    }

    if (e.key === "Escape") {
      if (!modal.hidden) closeModal(modal);
      else if (!secret.hidden) closeModal(secret);
    }
  });


  window.addEventListener("load", showInView);

})();
