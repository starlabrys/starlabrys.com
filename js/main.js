(() => {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Hero + in-view reveals
  const nodes = document.querySelectorAll("[data-animate]");
  if (reduce) {
    nodes.forEach((el) => el.classList.add("is-in"));
  } else {
    // Immediately reveal hero content
    document.querySelectorAll(".hero [data-animate]").forEach((el) => {
      requestAnimationFrame(() => el.classList.add("is-in"));
    });

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 }
    );

    nodes.forEach((el) => {
      if (!el.closest(".hero")) io.observe(el);
    });
  }

  // Mobile nav
  const header = document.querySelector(".site-header");
  const toggle = document.querySelector(".nav-toggle");
  if (header && toggle) {
    toggle.addEventListener("click", () => {
      const open = header.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });
  }
})();
