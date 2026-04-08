(function () {
  const section = document.getElementById("menu-tier-2");
  const lottieContainer = document.getElementById("menu-tier-2-lottie");

  if (!section || !lottieContainer || typeof lottie === "undefined") {
    return;
  }

  const mobileQuery = window.matchMedia("(max-width: 768px)");
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

  function easeOutCubic(value) {
    return 1 - Math.pow(1 - value, 3);
  }

  function remapForTierTwo(progress) {
    const earlyWindow = 0.55;

    if (progress <= earlyWindow) {
      return easeOutCubic(progress / earlyWindow) * 0.82;
    }

    const restProgress = (progress - earlyWindow) / (1 - earlyWindow);
    return 0.82 + restProgress * 0.18;
  }

  function updateFrameByScroll() {
    if (!animationInstance || !totalFrames || mobileQuery.matches) {
      return;
    }

    const progress = getSectionProgress();
    const mappedProgress = remapForTierTwo(progress);
    const targetFrame = Math.round(mappedProgress * (totalFrames - 1));

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

  function applyResponsiveBehavior() {
    if (!animationInstance) {
      return;
    }

    if (mobileQuery.matches) {
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
    path: "assets/lottie/menu-overview-tier-2.json",
    rendererSettings: {
      preserveAspectRatio: "xMidYMid meet",
      progressiveLoad: true
    }
  });

  animationInstance.addEventListener("DOMLoaded", () => {
    totalFrames = Math.max(1, Math.floor(animationInstance.getDuration(true)));
    applyResponsiveBehavior();
    updateFrameByScroll();
  });

  window.addEventListener("scroll", requestTick, { passive: true });
  window.addEventListener("resize", () => {
    applyResponsiveBehavior();
    requestTick();
  });

  if (typeof mobileQuery.addEventListener === "function") {
    mobileQuery.addEventListener("change", applyResponsiveBehavior);
  } else if (typeof mobileQuery.addListener === "function") {
    mobileQuery.addListener(applyResponsiveBehavior);
  }
})();s