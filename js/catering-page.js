document.addEventListener("DOMContentLoaded", () => {
  const body = document.body;
  const inquiryModal = document.getElementById("inquiryModal");
  const serviceInput = document.getElementById("cateringServiceInput");

  const openModal = (modal) => {
    if (!modal) return;
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    body.classList.add("modal-open");
  };

  const closeModal = (modal) => {
    if (!modal) return;
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");

    const hasOpenModal = document.querySelector(".modal.is-open");
    if (!hasOpenModal) {
      body.classList.remove("modal-open");
    }
  };

  const closeAllModals = () => {
    document.querySelectorAll(".modal.is-open").forEach((modal) => {
      modal.classList.remove("is-open");
      modal.setAttribute("aria-hidden", "true");
    });
    body.classList.remove("modal-open");
  };

  document.querySelectorAll(".js-open-gallery").forEach((button) => {
    button.addEventListener("click", () => {
      const targetId = button.dataset.gallery;
      const modal = document.getElementById(targetId);
      openModal(modal);
    });
  });

  document.querySelectorAll(".js-open-inquiry").forEach((button) => {
    button.addEventListener("click", () => {
      const serviceName = button.dataset.service || "General Catering Inquiry";

      document.querySelectorAll(".modal.is-open").forEach((modal) => {
        modal.classList.remove("is-open");
        modal.setAttribute("aria-hidden", "true");
      });

      if (serviceInput) {
        serviceInput.value = serviceName;
      }

      openModal(inquiryModal);
    });
  });

  document.querySelectorAll("[data-close-modal]").forEach((closeTrigger) => {
    closeTrigger.addEventListener("click", () => {
      const parentModal = closeTrigger.closest(".modal");
      closeModal(parentModal);
    });
  });

  document.querySelectorAll(".modal").forEach((modal) => {
    modal.addEventListener("click", (event) => {
      if (event.target === modal) {
        closeModal(modal);
      }
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeAllModals();
    }
  });

  const inquiryForm = document.querySelector(".inquiry-form");
  if (inquiryForm) {
    inquiryForm.addEventListener("submit", (event) => {
      event.preventDefault();
      alert("Form UI is ready. Submission logic can be connected next.");
    });
  }
});