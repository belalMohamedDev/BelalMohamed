/* ══════════════════════════════════════════════════════════
   sections.js — interactive upgrades for the sections below
   the hero. Everything here is progressive enhancement: the
   HTML content stays the same, so the page still works (and
   search engines still read it) without this script.
   ══════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var desktop = window.matchMedia("(min-width: 900px)");
  var scrollHandlers = [];

  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

  function onScroll(fn) { scrollHandlers.push(fn); }

  var ticking = false;
  function runScroll() {
    ticking = false;
    for (var i = 0; i < scrollHandlers.length; i++) scrollHandlers[i]();
  }
  function requestScroll() {
    if (!ticking) { ticking = true; requestAnimationFrame(runScroll); }
  }
  window.addEventListener("scroll", requestScroll, { passive: true });
  window.addEventListener("resize", requestScroll);

  /* ── 1. Giant outlined word behind each section ──────── */
  var bgSections = [];
  document.querySelectorAll("main > .section").forEach(function (section) {
    var eyebrow = section.querySelector(".section-head .eyebrow");
    if (!eyebrow) return;
    var word = document.createElement("span");
    word.className = "section-bg-word";
    word.setAttribute("aria-hidden", "true");
    word.textContent = eyebrow.textContent.trim().toUpperCase();
    section.classList.add("has-bg-word");
    section.prepend(word);
    bgSections.push({ section: section, word: word });
  });

  if (!reduceMotion) {
    onScroll(function () {
      var vh = window.innerHeight;
      bgSections.forEach(function (s) {
        var r = s.section.getBoundingClientRect();
        if (r.bottom < 0 || r.top > vh) return;
        var p = clamp((vh - r.top) / (vh + r.height), 0, 1);
        s.word.style.setProperty("--wp", p.toFixed(3));
      });
    });
  }

  /* ── 2. Experience: line fills while scrolling ───────── */
  var timeline = document.querySelector(".timeline");
  if (timeline) {
    timeline.classList.add("timeline-live");
    var fill = document.createElement("span");
    fill.className = "timeline-fill";
    fill.setAttribute("aria-hidden", "true");
    timeline.prepend(fill);
    var tItems = timeline.querySelectorAll(".timeline-item");

    onScroll(function () {
      var r = timeline.getBoundingClientRect();
      var mark = window.innerHeight * 0.6;
      var p = clamp((mark - r.top) / r.height, 0, 1);
      timeline.style.setProperty("--fill", p.toFixed(4));
      tItems.forEach(function (item) {
        item.classList.toggle("is-active", item.getBoundingClientRect().top < mark);
      });
    });
  }

  /* ── 3. Skills: one panel + category tabs ────────────── */
  var groupsWrap = document.querySelector(".skills-groups");
  if (groupsWrap) {
    var groups = Array.prototype.slice.call(groupsWrap.querySelectorAll(".skill-group"));
    var nav = document.createElement("div");
    nav.className = "skills-nav";
    nav.setAttribute("role", "tablist");
    nav.setAttribute("aria-label", "Skill categories");

    groups.forEach(function (g, i) {
      var title = g.querySelector("h3").textContent.trim();
      var count = g.querySelectorAll(".skill-tags li").length;
      var tab = document.createElement("button");
      tab.type = "button";
      tab.className = "skills-tab";
      tab.id = "skills-tab-" + i;
      tab.setAttribute("role", "tab");
      tab.setAttribute("aria-controls", "skills-panel-" + i);
      tab.innerHTML = "<span></span><em>" + count + "</em>";
      tab.firstChild.textContent = title;
      tab.addEventListener("click", function () { select(i, true); });
      nav.appendChild(tab);

      g.id = "skills-panel-" + i;
      g.setAttribute("role", "tabpanel");
      g.setAttribute("aria-labelledby", tab.id);
      g.classList.add("is-visible");
      g.querySelectorAll(".skill-tags li").forEach(function (li, j) {
        li.style.setProperty("--i", j);
      });
    });

    nav.addEventListener("keydown", function (e) {
      var tabs = nav.querySelectorAll(".skills-tab");
      var cur = Array.prototype.indexOf.call(tabs, document.activeElement);
      if (cur < 0) return;
      var next = null;
      if (e.key === "ArrowDown" || e.key === "ArrowRight") next = (cur + 1) % tabs.length;
      if (e.key === "ArrowUp" || e.key === "ArrowLeft") next = (cur - 1 + tabs.length) % tabs.length;
      if (next === null) return;
      e.preventDefault();
      select(next, true);
      tabs[next].focus();
    });

    function select(i, userAction) {
      nav.querySelectorAll(".skills-tab").forEach(function (t, j) {
        var on = i === j;
        t.setAttribute("aria-selected", String(on));
        t.tabIndex = on ? 0 : -1;
        t.classList.toggle("is-active", on);
        if (on && userAction && nav.scrollWidth > nav.clientWidth) {
          t.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
        }
      });
      groups.forEach(function (g, j) {
        g.hidden = i !== j;
        if (i === j) {
          g.classList.remove("is-shown");
          void g.offsetWidth; // restart the pop-in animation
          g.classList.add("is-shown");
        }
      });
    }

    groupsWrap.classList.add("skills-tabbed");
    groupsWrap.prepend(nav);
    select(0, false);
  }

  /* ── 3b. Projects: filter by company ─────────────────── */
  (function () {
    var section = document.getElementById("projects");
    var grid = section && section.querySelector(".projects-grid");
    if (!grid) return;
    var all = Array.prototype.slice.call(grid.querySelectorAll(".project-card"));
    var groups = [
      { key: "all", label: "All" },
      { key: "digitbox", label: "DIGITBOX" },
      { key: "aleman", label: "مؤسسة الإيمان" },
      { key: "freelance", label: "Freelance & clients" }
    ].filter(function (g) {
      return g.key === "all" || all.some(function (c) { return (c.dataset.company || "freelance") === g.key; });
    });
    if (groups.length < 3) return;

    var bar = document.createElement("div");
    bar.className = "projects-filter";
    bar.setAttribute("role", "group");
    bar.setAttribute("aria-label", "Filter projects by company");
    groups.forEach(function (g, i) {
      var count = g.key === "all" ? all.length
        : all.filter(function (c) { return (c.dataset.company || "freelance") === g.key; }).length;
      var b = document.createElement("button");
      b.type = "button";
      b.className = "projects-filter-btn" + (i === 0 ? " is-active" : "");
      b.setAttribute("aria-pressed", i === 0 ? "true" : "false");
      b.innerHTML = "<span></span><em>" + count + "</em>";
      b.firstChild.textContent = g.label;
      b.addEventListener("click", function () {
        bar.querySelectorAll("button").forEach(function (x) {
          var on = x === b;
          x.classList.toggle("is-active", on);
          x.setAttribute("aria-pressed", String(on));
        });
        all.forEach(function (c) {
          c.hidden = g.key !== "all" && (c.dataset.company || "freelance") !== g.key;
        });
        section.dispatchEvent(new CustomEvent("projects:relayout"));
        var top = section.getBoundingClientRect().top + window.scrollY;
        if (window.scrollY > top) window.scrollTo({ top: top, behavior: "smooth" });
      });
      bar.appendChild(b);
    });
    section.querySelector(".section-head").after(bar);
  })();

  /* ── 4. Projects: pinned horizontal gallery on desktop ─ */
  var projSection = document.getElementById("projects");
  var track = projSection && projSection.querySelector(".projects-grid");
  if (projSection && track) {
    var container = projSection.querySelector(".container");
    var sticky = document.createElement("div");
    sticky.className = "projects-sticky";
    projSection.insertBefore(sticky, container);
    sticky.appendChild(container);

    var counter = document.createElement("div");
    counter.className = "projects-counter";
    counter.setAttribute("aria-hidden", "true");
    var cards = track.querySelectorAll(".project-card");
    counter.innerHTML = '<b>01</b><span class="projects-bar"><i></i></span><span>' +
      String(cards.length).padStart(2, "0") + "</span>";
    container.appendChild(counter);
    cards.forEach(function (c) { c.classList.add("is-visible"); });

    var distance = 0;
    function layout() {
      var horizontal = desktop.matches && !reduceMotion;
      projSection.classList.toggle("projects-horizontal", horizontal);
      projSection.classList.toggle("projects-swipe", !horizontal);
      if (!horizontal) {
        projSection.style.height = "";
        track.style.transform = "";
        return;
      }
      distance = Math.max(0, track.scrollWidth - container.clientWidth);
      projSection.style.height = (window.innerHeight + distance) + "px";
      updateProjects();
    }

    function updateProjects() {
      if (!projSection.classList.contains("projects-horizontal")) return;
      var r = projSection.getBoundingClientRect();
      var travel = projSection.offsetHeight - window.innerHeight;
      var p = clamp(-r.top / (travel || 1), 0, 1);
      track.style.transform = "translate3d(" + (-p * distance).toFixed(1) + "px,0,0)";
      projSection.style.setProperty("--pp", p.toFixed(4));
      var idx = Math.min(cards.length, Math.round(p * (cards.length - 1)) + 1);
      counter.firstChild.textContent = String(idx).padStart(2, "0");
    }

    onScroll(updateProjects);
    window.addEventListener("resize", layout);
    projSection.addEventListener("projects:relayout", function () {
      cards = track.querySelectorAll(".project-card:not([hidden])");
      counter.lastChild.textContent = String(cards.length).padStart(2, "0");
      layout();
    });
    if (desktop.addEventListener) desktop.addEventListener("change", layout);
    window.addEventListener("load", layout);
    layout();
  }

  /* ── 5. Services: spotlight that follows the pointer ─── */
  document.querySelectorAll(".service-card").forEach(function (card, i) {
    card.setAttribute("data-num", String(i + 1).padStart(2, "0"));
    card.addEventListener("pointermove", function (e) {
      var r = card.getBoundingClientRect();
      card.style.setProperty("--sx", (e.clientX - r.left) + "px");
      card.style.setProperty("--sy", (e.clientY - r.top) + "px");
    });
  });

  /* ── 6. Feedback: endless marquee ────────────────────── */
  var fGrid = document.querySelector(".feedback-grid");
  if (fGrid && !reduceMotion) {
    var originals = Array.prototype.slice.call(fGrid.children);
    var lane = document.createElement("div");
    lane.className = "feedback-lane";
    originals.forEach(function (c) { c.classList.add("is-visible"); lane.appendChild(c); });
    // two extra copies so the loop never shows a gap; copies are hidden from screen readers
    for (var k = 0; k < 2; k++) {
      originals.forEach(function (c) {
        var clone = c.cloneNode(true);
        clone.setAttribute("aria-hidden", "true");
        lane.appendChild(clone);
      });
    }
    fGrid.appendChild(lane);
    fGrid.classList.add("feedback-marquee");
  }

  /* ── 7. Magnetic primary buttons below the hero ──────── */
  if (!reduceMotion && window.matchMedia("(hover: hover)").matches) {
    document.querySelectorAll("main > .section .btn").forEach(function (btn) {
      btn.addEventListener("pointermove", function (e) {
        var r = btn.getBoundingClientRect();
        var x = (e.clientX - r.left - r.width / 2) * 0.25;
        var y = (e.clientY - r.top - r.height / 2) * 0.35;
        btn.style.translate = x.toFixed(1) + "px " + y.toFixed(1) + "px";
      });
      btn.addEventListener("pointerleave", function () { btn.style.translate = ""; });
    });
  }

  requestScroll();
})();
