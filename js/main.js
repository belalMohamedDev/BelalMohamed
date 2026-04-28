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

  const headerHeight = document.querySelector('.site-header')?.offsetHeight || 80;

  // Custom smooth scroll function
  const smoothScrollTo = (targetPosition, duration = 800) => {
    const startPosition = window.scrollY;
    const distance = targetPosition - startPosition;
    let startTime = null;

    const easeInOutCubic = (t, b, c, d) => {
      t /= d / 2;
      if (t < 1) return c / 2 * t * t * t + b;
      t -= 2;
      return c / 2 * (t * t * t + 2) + b;
    };

    const animation = (currentTime) => {
      if (startTime === null) startTime = currentTime;
      const timeElapsed = currentTime - startTime;
      const run = easeInOutCubic(timeElapsed, startPosition, distance, duration);
      window.scrollTo(0, run);
      if (timeElapsed < duration) {
        requestAnimationFrame(animation);
      } else {
        window.scrollTo(0, targetPosition);
      }
    };

    requestAnimationFrame(animation);
  };

  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      const targetId = link.getAttribute("href");
      
      if (targetId && targetId.startsWith("#")) {
        e.preventDefault();
        closeMenu();
        
        const targetSection = document.querySelector(targetId);
        if (targetSection) {
          const offsetTop = targetSection.getBoundingClientRect().top + window.scrollY - headerHeight - 20;
          smoothScrollTo(offsetTop, 800); // 800ms duration
        }
      } else {
        closeMenu();
      }
    });
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
