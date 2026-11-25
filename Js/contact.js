const contactForm = document.querySelector(".contact-form");
const contactStatus = document.getElementById("contactStatus");

contactForm.querySelector(".clear-form").addEventListener("click", () => {
    contactForm.reset();
    contactStatus.textContent = "";
});

contactForm.addEventListener("submit", function(event) {
    event.preventDefault();
    const contact = {
        name: document.getElementById("contactName").value.trim(),
        email: document.getElementById("contactEmail").value.trim(),
        phone: document.getElementById("contactPhone").value.trim(),
        subject: document.getElementById("contactSubject").value,
        message: document.getElementById("contactMessage").value.trim(),
        date: new Date().toLocaleString()
    };
    if (!contact.name || !contact.email || !contact.message) {
        contactStatus.textContent = "Please fill in all required fields.";
        contactStatus.style.color = "red";
        return;
    }
    let messages = JSON.parse(localStorage.getItem("contactMessages")) || [];
    messages.push(contact);
    localStorage.setItem("contactMessages", JSON.stringify(messages));
    contactStatus.textContent = "✓ Thank you! Your message has been saved.";
    contactStatus.style.color = "green";
    contactForm.reset();
    setTimeout(() => {
        contactStatus.textContent = "";
    }, 5000);
});
