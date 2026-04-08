const menuToggle = document.querySelector(".site-header__menu-toggle");
const mobileMenu = document.querySelector(".mobile-menu");
const mobileOverlay = document.querySelector(".mobile-menu__overlay");
const mobileClose = document.querySelector(".mobile-menu__close");
const mobileLinks = document.querySelectorAll(".mobile-menu__nav a");

if (menuToggle && mobileMenu && mobileOverlay && mobileClose) {
  const openMenu = () => {
    document.body.classList.add("mobile-menu-open");
    menuToggle.setAttribute("aria-expanded", "true");
    mobileMenu.setAttribute("aria-hidden", "false");
  };

  const closeMenu = () => {
    document.body.classList.remove("mobile-menu-open");
    menuToggle.setAttribute("aria-expanded", "false");
    mobileMenu.setAttribute("aria-hidden", "true");
  };

  menuToggle.addEventListener("click", openMenu);
  mobileClose.addEventListener("click", closeMenu);
  mobileOverlay.addEventListener("click", closeMenu);

  mobileLinks.forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMenu();
    }
  });
}