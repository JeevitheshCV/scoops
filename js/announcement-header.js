const announcementBar = document.querySelector(".announcement-bar");
const siteHeader = document.getElementById("siteHeader");
const menuToggle = document.getElementById("menuToggle");
const mobileMenu = document.getElementById("mobileMenu");
const mobileLinks = document.querySelectorAll(".mobile-menu__nav a");

const SCROLL_THRESHOLD = 18;

function handleHeaderState() {
  const isScrolled = window.scrollY > SCROLL_THRESHOLD;

  if (isScrolled) {
    announcementBar?.classList.add("is-hidden");
    siteHeader?.classList.add("is-condensed");
  } else {
    announcementBar?.classList.remove("is-hidden");
    siteHeader?.classList.remove("is-condensed");
  }
}

function closeMobileMenu() {
  mobileMenu?.classList.remove("is-open");
  menuToggle?.classList.remove("is-active");
  menuToggle?.setAttribute("aria-expanded", "false");
  document.body.style.overflow = "";
}

function toggleMobileMenu() {
  const isOpen = mobileMenu?.classList.toggle("is-open");
  menuToggle?.classList.toggle("is-active");
  menuToggle?.setAttribute("aria-expanded", String(isOpen));
  document.body.style.overflow = isOpen ? "hidden" : "";
}

window.addEventListener("scroll", handleHeaderState, { passive: true });
window.addEventListener("load", handleHeaderState);

menuToggle?.addEventListener("click", toggleMobileMenu);

mobileLinks.forEach((link) => {
  link.addEventListener("click", closeMobileMenu);
});

window.addEventListener("resize", () => {
  if (window.innerWidth > 980) {
    closeMobileMenu();
  }
});