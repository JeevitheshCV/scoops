document.addEventListener("DOMContentLoaded", () => {
  const hero = document.querySelector(".menu-hero");
  if (!hero) return;

  const revealHero = () => hero.classList.add("is-visible");

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            revealHero();
            obs.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.18,
      }
    );

    observer.observe(hero);
  } else {
    revealHero();
  }
});