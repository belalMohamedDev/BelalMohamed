/* Project cards: show the first description paragraph, tuck the
   rest behind a "Read more" toggle. Content stays in the HTML,
   so search engines still see all of it. */
(function () {
  document.querySelectorAll(".project-card").forEach(function (card, i) {
    var paras = Array.prototype.filter.call(card.children, function (el) {
      return el.tagName === "P" && !el.classList.contains("project-type");
    });
    if (paras.length < 2) return;

    var more = document.createElement("div");
    more.className = "project-more";
    more.id = "project-more-" + i;
    more.hidden = true;
    paras[0].after(more);
    paras.slice(1).forEach(function (p) { more.appendChild(p); });

    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "project-toggle";
    btn.setAttribute("aria-expanded", "false");
    btn.setAttribute("aria-controls", more.id);
    btn.innerHTML = '<span>Read more</span><iconify-icon icon="mdi:chevron-down"></iconify-icon>';
    more.after(btn);

    btn.addEventListener("click", function () {
      var open = more.hidden;
      more.hidden = !open;
      btn.setAttribute("aria-expanded", String(open));
      btn.firstChild.textContent = open ? "Show less" : "Read more";
    });
  });
})();
