const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
const header = document.querySelector(".site-header");

function isInView(element) {
  const bounds = element.getBoundingClientRect();
  const coveredTop = header && !header.contains(element) ? header.getBoundingClientRect().bottom : 0;
  return bounds.bottom > coveredTop && bounds.top < innerHeight;
}

window.addEventListener("hashchange", (event) => {
  if (location.hash) return;

  const previousHash = new URL(event.oldURL).hash;
  const returnLink = Array.from(document.links).find((link) => link.getAttribute("href") === previousHash);
  if (!returnLink) return;

  // Let browser history restore the scroll position before repairing offscreen focus.
  requestAnimationFrame(() => {
    const focused = document.activeElement;
    if (!location.hash && focused && focused !== document.body && !isInView(focused) && isInView(returnLink)) {
      returnLink.focus({ preventScroll: true });
    }
  });
});

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
