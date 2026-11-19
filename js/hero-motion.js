/* Hero motion: split the name and heading for staggered animation,
   and feed pointer position to CSS (--mx / --my) for depth. */
(function () {
  var stage = document.querySelector(".stage");
  if (!stage) return;

  /* Name letters */
  var n = 0;
  stage.querySelectorAll(".stage-name-line").forEach(function (line) {
    var text = line.textContent;
    line.textContent = "";
    text.split("").forEach(function (c) {
      var s = document.createElement("span");
      s.className = "ch";
      s.textContent = c;
      s.style.setProperty("--i", n++);
      line.appendChild(s);
    });
  });

  /* Heading words (keeps the full sentence for screen readers) */
  var h1 = stage.querySelector(".stage-intro h1");
  if (h1) {
    var sentence = h1.textContent.trim();
    h1.setAttribute("aria-label", sentence);
    h1.textContent = "";
    sentence.split(/\s+/).forEach(function (word, i, all) {
      var w = document.createElement("span");
      w.className = "w";
      w.setAttribute("aria-hidden", "true");
      if (/^(mobile|love)/i.test(word)) w.classList.add("accent");
      var inner = document.createElement("span");
      inner.textContent = word;
      inner.style.setProperty("--i", i);
      w.appendChild(inner);
      h1.appendChild(w);
      if (i < all.length - 1) h1.appendChild(document.createTextNode(" "));
    });
  }

  /* Waving hand */
  var eyebrow = stage.querySelector(".stage-intro .eyebrow");
  if (eyebrow && eyebrow.innerHTML.indexOf("👋") > -1) {
    eyebrow.innerHTML = eyebrow.innerHTML.replace("👋", '<span class="wave" aria-hidden="true">👋</span>');
  }

  /* Pointer depth */
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (!window.matchMedia("(hover: hover)").matches) return;

  var raf = null;
  stage.addEventListener("pointermove", function (e) {
    if (raf) return;
    raf = requestAnimationFrame(function () {
      raf = null;
      var x = e.clientX / window.innerWidth - 0.5;
      var y = e.clientY / window.innerHeight - 0.5;
      stage.style.setProperty("--mx", (x * 2).toFixed(3));
      stage.style.setProperty("--my", (y * 2).toFixed(3));
    });
  });
  stage.addEventListener("pointerleave", function () {
    stage.style.setProperty("--mx", "0");
    stage.style.setProperty("--my", "0");
  });
})();
