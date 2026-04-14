document.addEventListener("DOMContentLoaded", () => {
  const sections = document.querySelectorAll("[data-menu-section]");
  const navLinks = document.querySelectorAll(".menu-jump__link");

  if (!sections.length || !navLinks.length) return;

  const setActiveLink = (id) => {
    navLinks.forEach((link) => {
      const isMatch = link.getAttribute("href") === `#${id}`;
      link.classList.toggle("is-active", isMatch);
    });
  };

  const activeObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveLink(entry.target.id);
        }
      });
    },
    {
      root: null,
      threshold: 0.2,
      rootMargin: "-18% 0px -55% 0px",
    }
  );

  sections.forEach((section) => activeObserver.observe(section));

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      const targetId = link.getAttribute("href")?.replace("#", "");
      if (targetId) setActiveLink(targetId);
    });
  });
});