(function () {
  const section = document.getElementById("menu-tier-1");
  const lottieContainer = document.getElementById("menu-tier-1-lottie");

  if (!section || !lottieContainer || typeof lottie === "undefined") {
    return;
  }

  const isMobile = window.matchMedia("(max-width: 768px)");
  let animationInstance = null;
  let totalFrames = 0;
  let ticking = false;

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function getSectionProgress() {
    const rect = section.getBoundingClientRect();
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    const totalScrollable = rect.height - viewportHeight;

    if (totalScrollable <= 0) {
      return 0;
    }

    const traveled = clamp(-rect.top, 0, totalScrollable);
    return traveled / totalScrollable;
  }

  function updateFrameByScroll() {
    if (!animationInstance || !totalFrames) {
      return;
    }

    if (isMobile.matches) {
      return;
    }

    const progress = getSectionProgress();
    const targetFrame = Math.round(progress * (totalFrames - 1));
    animationInstance.goToAndStop(targetFrame, true);
  }

  function requestTick() {
    if (ticking) {
      return;
    }

    ticking = true;

    window.requestAnimationFrame(() => {
      updateFrameByScroll();
      ticking = false;
    });
  }

  function applyMobileBehavior() {
    if (!animationInstance) {
      return;
    }

    if (isMobile.matches) {
      animationInstance.loop = true;
      animationInstance.setSpeed(0.85);
      animationInstance.play();
    } else {
      animationInstance.stop();
      updateFrameByScroll();
    }
  }

  animationInstance = lottie.loadAnimation({
    container: lottieContainer,
    renderer: "svg",
    loop: false,
    autoplay: false,
    path: "assets/lottie/menu-overview-tier-1.json",
    rendererSettings: {
      preserveAspectRatio: "xMidYMid meet",
      progressiveLoad: true
    }
  });

  animationInstance.addEventListener("DOMLoaded", () => {
    totalFrames = Math.max(1, Math.floor(animationInstance.getDuration(true)));
    applyMobileBehavior();
    updateFrameByScroll();
  });

  window.addEventListener("scroll", requestTick, { passive: true });
  window.addEventListener("resize", () => {
    applyMobileBehavior();
    requestTick();
  });

  if (typeof isMobile.addEventListener === "function") {
    isMobile.addEventListener("change", applyMobileBehavior);
  } else if (typeof isMobile.addListener === "function") {
    isMobile.addListener(applyMobileBehavior);
  }
})();