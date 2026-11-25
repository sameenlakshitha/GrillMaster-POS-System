const deliveryModal = document.getElementById("deliveryModal");
const openDeliveryBtn = document.getElementById("openDelivery");
const closeDeliveryBtn = document.getElementById("closeDelivery");
const copyDeliveryBtn = document.getElementById("copyDeliveryCode");
const deliveryExplore = document.getElementById("deliveryExplore");

let deliveryTimer;
let deliveryDeadline;

// Open delivery popup
openDeliveryBtn.addEventListener("click", () => {
    deliveryModal.showModal();

    deliveryDeadline = new Date();
    deliveryDeadline.setHours(24, 0, 0, 0);

    updateDeliveryCountdown();
    clearInterval(deliveryTimer);
    deliveryTimer = setInterval(updateDeliveryCountdown, 1000);
});

// Close popup
closeDeliveryBtn.addEventListener("click", () => {
    deliveryModal.close();
});

// Close when clicking outside
deliveryModal.addEventListener("click", event => {
    if (event.target === deliveryModal) {
        deliveryModal.close();
    }
});

// Stop timer when popup closes
deliveryModal.addEventListener("close", () => {
    clearInterval(deliveryTimer);
});

// Live countdown until midnight
function updateDeliveryCountdown() {
    const now = new Date();
    const difference = Math.max(0, deliveryDeadline - now);
    const hours = Math.floor(difference / (1000 * 60 * 60));
    const minutes = Math.floor((difference / (1000 * 60)) % 60);
    const seconds = Math.floor((difference / 1000) % 60);

    document.getElementById("deliveryHours").textContent =
        String(hours).padStart(2, "0");
    document.getElementById("deliveryMinutes").textContent =
        String(minutes).padStart(2, "0");
    document.getElementById("deliverySeconds").textContent =
        String(seconds).padStart(2, "0");

    if (difference === 0) {
        clearInterval(deliveryTimer);
    }
}

// Copy promo code
copyDeliveryBtn.addEventListener("click", async () => {
    const code = document.getElementById("deliveryCode").textContent.trim();

    try {
        await navigator.clipboard.writeText(code);

        copyDeliveryBtn.innerHTML =
            '<i class="fa-solid fa-check"></i> Copied!';

        setTimeout(() => {
            copyDeliveryBtn.innerHTML =
                '<i class="fa-regular fa-copy"></i> Copy';
        }, 2000);
    } catch (error) {
        alert("Your promo code is: " + code);
    }
});

// Navigate to menu
deliveryExplore.addEventListener("click", () => {
    deliveryModal.close();
    document.getElementById("menu").scrollIntoView({
        behavior: "smooth"
    });
});
