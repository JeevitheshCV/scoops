const announcementBar = document.querySelector(".announcement-bar");
const siteHeader = document.getElementById("siteHeader");
const menuToggle = document.getElementById("menuToggle");
const mobileMenu = document.getElementById("mobileMenu");
const mobileLinks = document.querySelectorAll(".mobile-menu__nav a");

const orderDropdown = document.querySelector(".order-dropdown");
const orderDropdownToggle = document.getElementById("orderDropdownToggle");
const mobileOrderDropdown = document.querySelector(".mobile-order-dropdown");
const mobileOrderDropdownToggle = document.getElementById("mobileOrderDropdownToggle");

const SCROLL_THRESHOLD = 18;
const DESKTOP_BREAKPOINT = 980;

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

function closeDesktopOrderDropdown() {
  orderDropdown?.classList.remove("is-open");
  orderDropdownToggle?.setAttribute("aria-expanded", "false");
}

function toggleDesktopOrderDropdown(event) {
  event?.stopPropagation();
  const isOpen = orderDropdown?.classList.toggle("is-open");
  orderDropdownToggle?.setAttribute("aria-expanded", String(Boolean(isOpen)));
}

function closeMobileOrderDropdown() {
  mobileOrderDropdown?.classList.remove("is-open");
  mobileOrderDropdownToggle?.setAttribute("aria-expanded", "false");
}

function toggleMobileOrderDropdown(event) {
  event?.stopPropagation();
  const isOpen = mobileOrderDropdown?.classList.toggle("is-open");
  mobileOrderDropdownToggle?.setAttribute("aria-expanded", String(Boolean(isOpen)));
}

function closeMobileMenu() {
  mobileMenu?.classList.remove("is-open");
  menuToggle?.classList.remove("is-active");
  menuToggle?.setAttribute("aria-expanded", "false");
  closeMobileOrderDropdown();
  document.body.style.overflow = "";
}

function toggleMobileMenu() {
  const isOpen = mobileMenu?.classList.toggle("is-open");
  menuToggle?.classList.toggle("is-active");
  menuToggle?.setAttribute("aria-expanded", String(Boolean(isOpen)));
  document.body.style.overflow = isOpen ? "hidden" : "";

  if (!isOpen) {
    closeMobileOrderDropdown();
  }
}

window.addEventListener("scroll", handleHeaderState, { passive: true });
window.addEventListener("load", handleHeaderState);

menuToggle?.addEventListener("click", toggleMobileMenu);

orderDropdownToggle?.addEventListener("click", toggleDesktopOrderDropdown);
mobileOrderDropdownToggle?.addEventListener("click", toggleMobileOrderDropdown);

mobileLinks.forEach((link) => {
  link.addEventListener("click", closeMobileMenu);
});

document.addEventListener("click", (event) => {
  if (
    orderDropdown &&
    orderDropdown.classList.contains("is-open") &&
    !orderDropdown.contains(event.target)
  ) {
    closeDesktopOrderDropdown();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeDesktopOrderDropdown();
    closeMobileOrderDropdown();
  }
});

window.addEventListener("resize", () => {
  if (window.innerWidth > DESKTOP_BREAKPOINT) {
    closeMobileMenu();
    closeMobileOrderDropdown();
  } else {
    closeDesktopOrderDropdown();
  }
});