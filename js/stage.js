/* Scroll stage: drives --p on the section and --t on each item.
   Each .stage-item has:
     data-in   progress at which it starts flying in  (-1 = visible from the start)
     data-out  progress at which it starts flying out (omit = stays)
     data-fx / data-fy  where it flies in from (px offset)            */
(function () {
  var stage = document.querySelector(".stage");
  if (!stage) return;

  var items = Array.prototype.map.call(stage.querySelectorAll(".stage-item"), function (el) {
    el.style.setProperty("--fx", (el.getAttribute("data-fx") || 0) + "px");
    el.style.setProperty("--fy", (el.getAttribute("data-fy") || 0) + "px");
    return {
      el: el,
      inAt: parseFloat(el.getAttribute("data-in") || "0"),
      outAt: el.hasAttribute("data-out") ? parseFloat(el.getAttribute("data-out")) : null,
      on: null
    };
  });

  var RAMP = 0.07; // how much scroll progress a fly-in / fly-out takes
  var ticking = false;

  function clamp(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }

  function ease(v) { return 1 - Math.pow(1 - v, 3); }

  function update() {
    ticking = false;
    var rect = stage.getBoundingClientRect();
    var travel = stage.offsetHeight - window.innerHeight;
    var p = clamp(-rect.top / (travel || 1));
    stage.style.setProperty("--p", p.toFixed(4));

    for (var i = 0; i < items.length; i++) {
      var it = items[i];
      var t = it.inAt < 0 ? 1 : clamp((p - it.inAt) / RAMP);
      if (it.outAt !== null) t = Math.min(t, 1 - clamp((p - it.outAt) / RAMP));
      t = ease(t);
      it.el.style.setProperty("--t", t.toFixed(3));
      var on = t > 0.6;
      if (on !== it.on) {
        it.on = on;
        it.el.classList.toggle("is-on", on);
        it.el.inert = !on; // hidden items can't be focused or read
      }
    }
  }

  function request() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  }

  window.addEventListener("scroll", request, { passive: true });
  window.addEventListener("resize", request);
  update();
})();
