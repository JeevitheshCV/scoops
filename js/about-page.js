document.addEventListener("DOMContentLoaded", () => {
  const items = document.querySelectorAll(".reveal, .section-reveal");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.14,
      rootMargin: "0px 0px -8% 0px",
    }
  );

  items.forEach((item) => observer.observe(item));

  const heroMedia = document.querySelector(".about-hero__media");
  if (heroMedia && window.matchMedia("(min-width: 769px)").matches) {
    window.addEventListener(
      "scroll",
      () => {
        const y = window.scrollY * 0.08;
        heroMedia.style.transform = `translate3d(0, ${y}px, 0)`;
      },
      { passive: true }
    );
  }
});