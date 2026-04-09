document.addEventListener("DOMContentLoaded", () => {
  const heroSectionTwo = document.querySelector(".hero-section-two");

  if (!heroSectionTwo) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          heroSectionTwo.classList.add("is-visible");
        }
      });
    },
    {
      threshold: 0.2,
    }
  );

  observer.observe(heroSectionTwo);
});