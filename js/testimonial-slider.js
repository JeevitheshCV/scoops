(function () {
  const sliderSection = document.querySelector(".testimonial-slider");
  const stage = document.getElementById("testimonialStage");

  if (!sliderSection || !stage) return;

  const slides = Array.from(stage.querySelectorAll(".testimonial-slide"));
  const progressBar = stage.querySelector(".testimonial-slider__progress-bar");

  if (!slides.length) return;

  const autoplayEnabled = stage.dataset.autoplay !== "false";
  const interval = Number(stage.dataset.interval) || 20000;

  let currentIndex = 0;
  let autoplayTimer = null;

  function updateSlides(nextIndex) {
    slides.forEach((slide, index) => {
      const isActive = index === nextIndex;

      slide.classList.toggle("is-active", isActive);
      slide.setAttribute("aria-hidden", String(!isActive));
    });
  }

  function restartProgress() {
    if (!progressBar) return;

    progressBar.style.transition = "none";
    progressBar.style.transform = "scaleX(0)";

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        progressBar.style.transition = `transform ${interval}ms linear`;
        progressBar.style.transform = "scaleX(1)";
      });
    });
  }

  function goToSlide(nextIndex) {
    currentIndex = (nextIndex + slides.length) % slides.length;
    updateSlides(currentIndex);
    restartProgress();
  }

  function nextSlide() {
    goToSlide(currentIndex + 1);
  }

  function startAutoplay() {
    if (!autoplayEnabled || slides.length <= 1) return;

    stopAutoplay();
    restartProgress();

    autoplayTimer = window.setInterval(nextSlide, interval);
  }

  function stopAutoplay() {
    if (autoplayTimer) {
      window.clearInterval(autoplayTimer);
      autoplayTimer = null;
    }
  }

  updateSlides(currentIndex);
  startAutoplay();

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      stopAutoplay();
    } else {
      startAutoplay();
    }
  });
})();