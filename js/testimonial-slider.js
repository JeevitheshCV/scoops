(function () {
  const sliderSection = document.querySelector(".testimonial-slider");
  const stage = document.getElementById("testimonialStage");

  if (!sliderSection || !stage) return;

  const slides = Array.from(stage.querySelectorAll(".testimonial-slide"));
  const progressBar = stage.querySelector(".testimonial-slider__progress-bar");

  if (!slides.length) return;

  const autoplayEnabled = stage.dataset.autoplay !== "false";
  const interval = Number(stage.dataset.interval) || 5000;

  let currentIndex = 0;
  let autoplayTimer = null;
  let isPaused = false;

  function updateAria(nextIndex) {
    slides.forEach((slide, index) => {
      const isActive = index === nextIndex;
      slide.classList.toggle("is-active", isActive);
      slide.setAttribute("aria-hidden", String(!isActive));
    });
  }

  function restartProgress() {
    sliderSection.classList.remove("is-playing");

    if (!progressBar) return;

    progressBar.style.animationDuration = "0ms";
    progressBar.style.transform = "scaleX(0)";

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        progressBar.style.animationDuration = `${interval}ms`;
        sliderSection.classList.add("is-playing");
      });
    });
  }

  function goToSlide(nextIndex) {
    currentIndex = (nextIndex + slides.length) % slides.length;
    updateAria(currentIndex);
    restartProgress();
  }

  function nextSlide() {
    goToSlide(currentIndex + 1);
  }

  function startAutoplay() {
    if (!autoplayEnabled || isPaused) return;
    stopAutoplay();
    restartProgress();
    autoplayTimer = window.setInterval(nextSlide, interval);
  }

  function stopAutoplay() {
    sliderSection.classList.remove("is-playing");
    if (autoplayTimer) {
      window.clearInterval(autoplayTimer);
      autoplayTimer = null;
    }
  }

  function pauseAutoplay() {
    isPaused = true;
    stopAutoplay();
  }

  function resumeAutoplay() {
    isPaused = false;
    startAutoplay();
  }

  updateAria(currentIndex);

  stage.addEventListener("mouseenter", pauseAutoplay);
  stage.addEventListener("mouseleave", resumeAutoplay);
  stage.addEventListener("focusin", pauseAutoplay);
  stage.addEventListener("focusout", resumeAutoplay);

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      stopAutoplay();
    } else if (!isPaused) {
      startAutoplay();
    }
  });

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return;
  }

  startAutoplay();
})();