(function () {
  const year = document.getElementById("currentYear");
  if (year) year.textContent = String(new Date().getFullYear());

  const nav = document.getElementById("siteNav");
  const menuToggle = document.getElementById("menuToggle");
  const navLinks = [...document.querySelectorAll(".nav-link")];
  const sections = [...document.querySelectorAll("main section[id]")];
  const glow = document.querySelector(".cursor-glow");

  const closeMenu = () => {
    nav?.classList.remove("is-open");
    menuToggle?.setAttribute("aria-expanded", "false");
  };

  menuToggle?.addEventListener("click", () => {
    const isOpen = nav?.classList.toggle("is-open");
    menuToggle.setAttribute("aria-expanded", String(Boolean(isOpen)));
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  const setActiveNav = () => {
    const scrollY = window.scrollY + 140;
    let current = sections[0]?.id || "home";
    sections.forEach((section) => {
      if (scrollY >= section.offsetTop) current = section.id;
    });
    navLinks.forEach((link) => {
      const isMatch = link.getAttribute("href") === `#${current}`;
      link.classList.toggle("is-active", isMatch);
    });
  };

  setActiveNav();
  window.addEventListener("scroll", setActiveNav, { passive: true });

  window.addEventListener("mousemove", (event) => {
    if (!glow) return;
    glow.style.transform = `translate(${event.clientX}px, ${event.clientY}px)`;
  });
})();
