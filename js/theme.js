(function () {
  const root = document.documentElement;
  const toggle = document.getElementById("themeToggle");
  const storageKey = "portfolio-theme";

  const applyTheme = (theme) => {
    root.setAttribute("data-theme", theme);
  };

  const saved = localStorage.getItem(storageKey);
  const initialTheme = saved || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  applyTheme(initialTheme);

  toggle?.addEventListener("click", () => {
    const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    applyTheme(next);
    localStorage.setItem(storageKey, next);
  });
})();
