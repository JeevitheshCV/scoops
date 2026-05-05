(function () {
  emailjs.init("K7CcTpw6Aa1NbyQL1");
})();

const contactForm = document.getElementById("contactForm");
const contactSubmitBtn = document.getElementById("contactSubmitBtn");
const contactFormStatus = document.getElementById("contactFormStatus");

if (contactForm) {
  contactForm.addEventListener("submit", function (event) {
    event.preventDefault();

    contactSubmitBtn.disabled = true;
    contactSubmitBtn.textContent = "Sending...";

    contactFormStatus.style.display = "block";
    contactFormStatus.style.color = "#2c3e50";
    contactFormStatus.textContent = "Sending your message...";

    emailjs
      .send("service_2uaa94i", "template_itn4r5f", {
        name: document.getElementById("name").value.trim(),
        phone: document.getElementById("phone").value.trim(),
        email: document.getElementById("email").value.trim(),
        inquiry_type: document.getElementById("inquiry-type").value,
        message: document.getElementById("message").value.trim()
      })
      .then(function () {
        contactForm.reset();

        contactFormStatus.style.color = "#1f7a3f";
        contactFormStatus.textContent =
          "Message sent successfully. We will follow up soon.";

        contactSubmitBtn.disabled = false;
        contactSubmitBtn.textContent = "Send Message";
      })
      .catch(function (error) {
        console.error("EmailJS error:", error);

        contactFormStatus.style.color = "#b00020";
        contactFormStatus.textContent =
          "Message failed to send. Please try again or email scoopsatpeachtree@gmail.com.";

        contactSubmitBtn.disabled = false;
        contactSubmitBtn.textContent = "Send Message";
      });
  });
}