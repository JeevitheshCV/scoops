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

  const heroMedia = document.querySelector(".gallery-hero__media");
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

  const bannerImage = document.querySelector(".gallery-banner__media img");
  if (bannerImage && window.matchMedia("(min-width: 769px)").matches) {
    window.addEventListener(
      "scroll",
      () => {
        const bannerSection = document.querySelector(".gallery-banner");
        if (!bannerSection) return;

        const rect = bannerSection.getBoundingClientRect();
        const viewport = window.innerHeight;
        const progress = (viewport - rect.top) / (viewport + rect.height);

        if (progress > 0 && progress < 1.4) {
          const shift = (progress - 0.5) * 18;
          bannerImage.style.transform = `scale(1.04) translate3d(0, ${shift}px, 0)`;
        }
      },
      { passive: true }
    );
  }
});