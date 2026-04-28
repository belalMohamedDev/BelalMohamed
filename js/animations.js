/**
 * animations.js
 * Scroll reveal via IntersectionObserver + stagger + counters.
 * No external dependencies. Works with file:// and http://.
 */

(function () {
  "use strict";

  /* ── Config ─────────────────────────────────────────────── */
  var REVEAL_OFFSET   = "-60px";  /* trigger 60px before bottom edge  */
  var REVEAL_THRESHOLD = 0.1;     /* 10% of element must be in view   */

  var STAGGER_PARENTS = [
    ".projects-grid",
    ".services-grid",
    ".feedback-grid",
    ".skills-groups",
    ".education-grid",
    ".timeline",
    ".contact-grid",
  ];

  /* ── 1. Auto-stagger grid/list children ─────────────────── */
  STAGGER_PARENTS.forEach(function (selector) {
    var parent = document.querySelector(selector);
    if (!parent) return;

    Array.from(parent.children).forEach(function (child, index) {
      /* Add .reveal if child has no reveal variant already */
      var hasReveal = child.classList.contains("reveal")       ||
                      child.classList.contains("reveal-left")  ||
                      child.classList.contains("reveal-right") ||
                      child.classList.contains("reveal-scale");
      if (!hasReveal) {
        child.classList.add("reveal");
      }
      child.classList.add("stagger-" + Math.min(index + 1, 11));
    });
  });

  /* ── 2. Collect every reveal element ────────────────────── */
  var SELECTOR = ".reveal, .reveal-left, .reveal-right, .reveal-scale";

  /* ── 3. IntersectionObserver ─────────────────────────────── */
  var revealObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);   /* fire once only   */
      });
    },
    {
      rootMargin: "0px 0px " + REVEAL_OFFSET + " 0px",
      threshold:  REVEAL_THRESHOLD,
    }
  );

  /* Observe all reveal elements */
  document.querySelectorAll(SELECTOR).forEach(function (el) {
    revealObserver.observe(el);
  });

  /* ── 4. Section-head underline observer ──────────────────── */
  var headObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        headObserver.unobserve(entry.target);
      });
    },
    { rootMargin: "0px 0px -40px 0px", threshold: 0.4 }
  );

  document.querySelectorAll(".section-head").forEach(function (el) {
    headObserver.observe(el);
  });

  /* ── 5. Hero elements: reveal immediately on load ────────── */
  /* Hero content is visible from page open — no scroll needed */
  document.querySelectorAll(
    ".hero .reveal, .hero .reveal-left, .hero .reveal-right"
  ).forEach(function (el) {
    el.classList.add("is-visible");
  });

  /* ── 6. Counter animation for hero metrics ───────────────── */
  var countersRun = false;

  var counterObserver = new IntersectionObserver(
    function (entries) {
      if (countersRun) return;
      var visible = entries.some(function (e) { return e.isIntersecting; });
      if (!visible) return;

      countersRun = true;
      counterObserver.disconnect();

      document.querySelectorAll(".hero-metrics strong").forEach(function (el) {
        var raw     = el.textContent.trim();           /* e.g. "4+", "25-35%" */
        var numStr  = raw.match(/[\d.]+/);
        if (!numStr) return;
        var target  = parseFloat(numStr[0]);
        var suffix  = raw.replace(/^[\d.]+/, "");
        var start   = null;
        var dur     = 1000;

        function tick(ts) {
          if (!start) start = ts;
          var p   = Math.min((ts - start) / dur, 1);
          var val = Number.isInteger(target)
            ? Math.round(p * target)
            : (Math.round(p * target * 10) / 10);
          el.textContent = val + suffix;
          if (p < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
      });
    },
    { threshold: 0.8 }
  );

  document.querySelectorAll(".hero-metrics li").forEach(function (li) {
    counterObserver.observe(li);
  });

  /* ── 7. Header: add .scrolled class for subtle shadow ────── */
  var siteHeader = document.querySelector(".site-header");

  function updateHeader() {
    if (!siteHeader) return;
    siteHeader.classList.toggle("scrolled", window.scrollY > 50);
  }

  window.addEventListener("scroll", updateHeader, { passive: true });
  updateHeader(); /* run once on load */

  /* ── 8. Cursor glow ──────────────────────────────────────── */
  var glow = document.querySelector(".cursor-glow");

  if (glow) {
    document.addEventListener("mousemove", function (e) {
      glow.style.transform = "translate(" + e.clientX + "px, " + e.clientY + "px)";
    }, { passive: true });
  }

  /* ── 9. Particles canvas ─────────────────────────────────── */
  var canvas = document.getElementById("particles-canvas");
  if (!canvas) return;

  var ctx = canvas.getContext("2d");
  if (!ctx) return;

  var W = 0, H = 0;
  var mouse = { x: -999, y: -999 };

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener("resize", resize, { passive: true });

  document.addEventListener("mousemove", function (e) {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  }, { passive: true });

  /* Build particles */
  var PARTICLE_COUNT = 48;
  var MAX_DIST       = 120;
  var particles      = [];

  for (var i = 0; i < PARTICLE_COUNT; i++) {
    particles.push({
      x:  Math.random() * window.innerWidth,
      y:  Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r:  Math.random() * 1.4 + 0.6,
    });
  }

  function drawParticles() {
    ctx.clearRect(0, 0, W, H);

    var accentColor = getComputedStyle(document.documentElement)
      .getPropertyValue("--accent").trim() || "#81A6C6";

    for (var i = 0; i < particles.length; i++) {
      var p = particles[i];

      /* Gentle mouse repulsion */
      var dx0 = p.x - mouse.x;
      var dy0 = p.y - mouse.y;
      var d0  = Math.sqrt(dx0 * dx0 + dy0 * dy0);
      if (d0 < 80 && d0 > 0) {
        var force = (80 - d0) / 80;
        p.vx += (dx0 / d0) * force * 0.25;
        p.vy += (dy0 / d0) * force * 0.25;
      }

      /* Dampen + move */
      p.vx *= 0.995;
      p.vy *= 0.995;
      p.x  += p.vx;
      p.y  += p.vy;

      /* Bounce off edges */
      if (p.x <= 0 || p.x >= W) p.vx *= -1;
      if (p.y <= 0 || p.y >= H) p.vy *= -1;

      /* Draw dot */
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle   = accentColor;
      ctx.globalAlpha = 0.4;
      ctx.fill();

      /* Draw lines to nearby particles */
      for (var j = i + 1; j < particles.length; j++) {
        var q    = particles[j];
        var dx   = p.x - q.x;
        var dy   = p.y - q.y;
        var dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < MAX_DIST) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.strokeStyle = accentColor;
          ctx.globalAlpha = (1 - dist / MAX_DIST) * 0.18;
          ctx.lineWidth   = 1;
          ctx.stroke();
        }
      }
    }

    ctx.globalAlpha = 1;
    requestAnimationFrame(drawParticles);
  }

  requestAnimationFrame(drawParticles);

})();
