// document.addEventListener("DOMContentLoaded", () => {
//   /*
//    * Hero Section Two reveal animation
//    */
//   const heroSectionTwo = document.querySelector(".hero-section-two");

//   if (heroSectionTwo) {
//     const observer = new IntersectionObserver(
//       (entries) => {
//         entries.forEach((entry) => {
//           if (entry.isIntersecting) {
//             heroSectionTwo.classList.add("is-visible");
//           }
//         });
//       },
//       {
//         threshold: 0.2,
//       }
//     );

//     observer.observe(heroSectionTwo);
//   }

//   /*
//    * Mascot video Safari/iOS loop fallback
//    */
//   const mascotVideo = document.getElementById("mascotVideo");

//   if (!mascotVideo) return;

//   const userAgent = navigator.userAgent || "";
//   const isSafari =
//     /^((?!chrome|android|crios|fxios|edgios).)*safari/i.test(userAgent);

//   const tryPlayMascotVideo = () => {
//     const playPromise = mascotVideo.play();

//     if (playPromise !== undefined) {
//       playPromise.catch(() => {
//         /*
//          * Safari may block/delay autoplay in some cases.
//          * Since the video is muted and playsinline, it should usually resume.
//          */
//       });
//     }
//   };

//   // Make sure required autoplay attributes are present.
//   mascotVideo.muted = true;
//   mascotVideo.loop = true;
//   mascotVideo.playsInline = true;
//   mascotVideo.setAttribute("muted", "");
//   mascotVideo.setAttribute("loop", "");
//   mascotVideo.setAttribute("playsinline", "");
//   mascotVideo.setAttribute("webkit-playsinline", "");

//   // Manual loop fallback for Safari.
//   mascotVideo.addEventListener("ended", () => {
//     mascotVideo.currentTime = 0;
//     tryPlayMascotVideo();
//   });

//   // Safari sometimes pauses heavy MOV files at the end instead of firing clean loop behavior.
//   mascotVideo.addEventListener("pause", () => {
//     if (!isSafari) return;

//     const duration = mascotVideo.duration;

//     if (!Number.isFinite(duration)) return;

//     const isNearEnd = duration - mascotVideo.currentTime < 0.35;

//     if (isNearEnd) {
//       mascotVideo.currentTime = 0;
//       tryPlayMascotVideo();
//     }
//   });

//   // Resume if Safari stalls or suspends playback.
//   mascotVideo.addEventListener("stalled", () => {
//     if (isSafari) {
//       tryPlayMascotVideo();
//     }
//   });

//   mascotVideo.addEventListener("suspend", () => {
//     if (isSafari && !mascotVideo.paused) {
//       tryPlayMascotVideo();
//     }
//   });

//   // Resume when user returns to the tab/page.
//   document.addEventListener("visibilitychange", () => {
//     if (!document.hidden && mascotVideo.paused) {
//       tryPlayMascotVideo();
//     }
//   });

//   // Initial playback attempt.
//   tryPlayMascotVideo();
// });


document.addEventListener("DOMContentLoaded", () => {
  /*
   * Hero Section Two reveal animation
   */
  const heroSectionTwo = document.querySelector(".hero-section-two");

  if (heroSectionTwo) {
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
  }

  /*
   * Safari/iOS gets APNG only.
   * Other browsers get WebM only.
   */
  const userAgent = navigator.userAgent || "";

  const isSafari =
    /^((?!chrome|android|crios|fxios|edgios|opr|opera).)*safari/i.test(userAgent);

  const mascotVideo = document.getElementById("mascotVideo");

  if (isSafari) {
    document.body.classList.add("is-safari");

    if (mascotVideo) {
      mascotVideo.pause();
      mascotVideo.removeAttribute("src");
      mascotVideo.load();
      mascotVideo.remove();
    }

    return;
  }

  if (!mascotVideo) return;

  mascotVideo.muted = true;
  mascotVideo.loop = true;
  mascotVideo.playsInline = true;

  mascotVideo.setAttribute("muted", "");
  mascotVideo.setAttribute("loop", "");
  mascotVideo.setAttribute("playsinline", "");

  const playPromise = mascotVideo.play();

  if (playPromise !== undefined) {
    playPromise.catch(() => {});
  }
});