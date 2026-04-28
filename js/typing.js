(function () {
  const target = document.getElementById("typedText");
  if (!target) return;

  const words = ["Flutter Developer", "Mobile Engineer", "Performance-Driven Builder", "Product-Focused Problem Solver"];
  let wordIndex = 0;
  let charIndex = 0;
  let deleting = false;

  const tick = () => {
    const word = words[wordIndex];
    target.textContent = deleting ? word.slice(0, --charIndex) : word.slice(0, ++charIndex);

    let delay = deleting ? 40 : 75;
    if (!deleting && charIndex === word.length) {
      delay = 1100;
      deleting = true;
    } else if (deleting && charIndex === 0) {
      deleting = false;
      wordIndex = (wordIndex + 1) % words.length;
      delay = 360;
    }
    setTimeout(tick, delay);
  };

  tick();
})();
