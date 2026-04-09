document.addEventListener("DOMContentLoaded", () => {
  const menuPreview = document.querySelector(".menu-preview");

  if (!menuPreview) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          menuPreview.classList.add("is-visible");
          observer.unobserve(menuPreview);
        }
      });
    },
    {
      threshold: 0.18,
    }
  );

  observer.observe(menuPreview);
});