const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");

if (!reducedMotion.matches && "IntersectionObserver" in window) {
  document.documentElement.classList.add("enhanced");

  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add("entered");
        observer.unobserve(entry.target);
      }
    }
  }, { threshold: 0.16 });

  document.querySelectorAll("[data-reveal]").forEach((section) => observer.observe(section));
}
