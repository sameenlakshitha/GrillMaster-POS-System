const foodCards = document.querySelectorAll(".menu-grid .foodcard");
const floatingCart = document.getElementById("floatingCart");
const cartModal = document.getElementById("cartModal");
const cartItems = document.getElementById("cartItems");
let cart = JSON.parse(localStorage.getItem("grillMasterCart")) || [];
foodCards.forEach((card, index) => {
    const heart = card.querySelector(".mhrt");
    const food = {
        id: index,
        name: card.querySelector("h3").textContent.trim().replace(/\s+/g, " "),
        image: card.querySelector(".card-img img").getAttribute("src"),
        price: parseFloat(card.querySelector(".new-price").textContent.replace("$", "")),
        quantity: 1
    };
    heart.addEventListener("click", () => {
        const existing = cart.find(item => item.id === food.id);
        if (existing) {
            cart = cart.filter(item => item.id !== food.id);
        } else {
            cart.push(food);
        }
        updateCart();
    });
});
function updateCart() {
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    const total = cart.reduce((total, item) => total + item.price * item.quantity, 0);
    document.getElementById("cartCount").textContent = count;
    document.getElementById("cartSubtotal").textContent = "$" + total.toFixed(2);
    document.getElementById("cartTotal").textContent = "$" + total.toFixed(2);
    floatingCart.classList.toggle("show", count > 0);
    document.getElementById("checkoutBtn").disabled = count === 0;
    foodCards.forEach((card, index) => {
        const heart = card.querySelector(".mhrt");
        const selected = cart.some(item => item.id === index);
        heart.classList.toggle("selected", selected);
        heart.querySelector("i").className = selected ? "fas fa-heart" : "far fa-heart";
    });
    localStorage.setItem("grillMasterCart", JSON.stringify(cart));
    renderCart();
}
function renderCart() {
    cartItems.innerHTML = "";
    if (cart.length === 0) {
        cartItems.textContent = "Your cart is empty.";
        return;
    }
    cart.forEach(item => {
        cartItems.innerHTML += `
            <div class="cart-item">
                <img src="${item.image}" alt="${item.name}">
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <p class="cart-item-price">$${(item.price * item.quantity).toFixed(2)}</p>
                    <div class="cart-quantity">
                        <button onclick="changeQuantity(${item.id}, -1)">−</button>
                        <span>${item.quantity}</span>
                        <button onclick="changeQuantity(${item.id}, 1)">+</button>
                    </div>
                </div>
                <button class="cart-remove" onclick="removeCartItem(${item.id})">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>`;
    });
}
function changeQuantity(id, amount) {
    const item = cart.find(item => item.id === id);
    if (!item) return;
    item.quantity += amount;
    if (item.quantity <= 0) {
        cart = cart.filter(item => item.id !== id);
    }
    updateCart();
}
function removeCartItem(id) {
    cart = cart.filter(item => item.id !== id);
    updateCart();
}
floatingCart.addEventListener("click", () => {
    cartModal.showModal();
});
document.getElementById("closeCart").addEventListener("click", () => {
    cartModal.close();
});
cartModal.addEventListener("click", event => {
    if (event.target === cartModal) {
        cartModal.close();
    }
});

updateCart();

const checkoutModal = document.getElementById("checkoutModal");
const checkoutForm = document.getElementById("checkoutForm");
const checkoutBtn = document.getElementById("checkoutBtn");
const locationStatus = document.getElementById("locationStatus");
const checkoutStatus = document.getElementById("checkoutStatus");
let deliveryLocation = null;
let pendingOrder = null;
checkoutBtn.addEventListener("click", () => {
    if (cart.length === 0) return;
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    document.getElementById("checkoutSubtotal").textContent = "$" + total.toFixed(2);
    document.getElementById("checkoutTotal").textContent = "$" + total.toFixed(2);
    checkoutStatus.textContent = "";
    cartModal.close();
    checkoutModal.showModal();
});
document.getElementById("closeCheckout").addEventListener("click", () => {
    checkoutModal.close();
});
document.getElementById("backToCart").addEventListener("click", () => {
    checkoutModal.close();
    cartModal.showModal();
});
checkoutModal.addEventListener("click", event => {
    if (event.target === checkoutModal) {
        checkoutModal.close();
    }
});
document.querySelectorAll('input[name="orderPayment"]').forEach(option => {
    option.addEventListener("change", () => {
        document.getElementById("demoCard").hidden = option.value !== "card";
    });
});
document.getElementById("detectLocation").addEventListener("click", () => {
    if (!navigator.geolocation) {
        locationStatus.textContent = "Location detection is not supported.";
        return;
    }
    locationStatus.textContent = "Detecting your location...";
    navigator.geolocation.getCurrentPosition(position => {
        deliveryLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        };
        locationStatus.textContent = "✓ Location detected! Please enter your street address.";
        locationStatus.style.color = "green";
    }, () => {
        locationStatus.textContent = "Unable to detect location. Enter your address manually.";
        locationStatus.style.color = "red";
    }, {
        timeout: 10000
    });
});
checkoutForm.addEventListener("submit", event => {
    event.preventDefault();
    const name = document.getElementById("orderName").value.trim();
    const phone = document.getElementById("orderPhone").value.trim();
    const address = document.getElementById("orderAddress").value.trim();
    const payment = document.querySelector('input[name="orderPayment"]:checked').value;
    if (!name || !phone || !address || cart.length === 0) {
        checkoutStatus.textContent = "Please complete all required details.";
        checkoutStatus.style.color = "red";
        return;
    }
    if (!/^\+?[\d\s()-]{7,20}$/.test(phone) || phone.replace(/\D/g, "").length < 7) {
        checkoutStatus.textContent = "Please enter a valid phone number.";
        checkoutStatus.style.color = "red";
        return;
    }
    pendingOrder = {
        customer: name,
        phone: phone,
        address: address,
        location: deliveryLocation,
        payment: payment,
        items: cart.map(item => ({ ...item })),
        total: Number(cart.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)),
        date: new Date().toLocaleString()
    };
    completeOrder(pendingOrder);
});

const successModal = document.getElementById("successModal");
function completeOrder(order) {
    order.id = "GM-" + Date.now();
    order.status = "Confirmed";
    order.estimatedDelivery = "20 - 35 min";
    order.createdAt = new Date().toISOString();
    document.getElementById("successOrderId").textContent = "#" + order.id;
    document.getElementById("successMessage").textContent =
        "Thank you, " + order.customer + "! Your demo order has been successfully placed.";
    document.getElementById("successPayment").textContent =
        order.payment === "cash" ? "Cash on Delivery" : "Card (Demo)";
    document.getElementById("successAddress").textContent = order.address;
    document.getElementById("successTotal").textContent = "$" + order.total.toFixed(2);
    checkoutModal.close();
    successModal.showModal();
    startTracking(order);
    cart = [];
    updateCart();
    checkoutForm.reset();
    document.getElementById("demoCard").hidden = true;
    locationStatus.textContent = "";
    checkoutStatus.textContent = "";
    deliveryLocation = null;
    pendingOrder = null;
}
document.getElementById("closeSuccess").addEventListener("click", () => {
    successModal.close();
});
document.getElementById("continueExploring").addEventListener("click", () => {
    successModal.close();
    document.getElementById("menu").scrollIntoView({
        behavior: "smooth"
    });
});
successModal.addEventListener("click", event => {
    if (event.target === successModal) {
        successModal.close();
    }
});

const floatingTrack = document.getElementById("floatingTrack");
const trackingModal = document.getElementById("trackingModal");
const trackingSteps = document.querySelectorAll(".tracking-step");
const DELIVERY_DURATION = 30 * 1000;
let activeOrder = JSON.parse(localStorage.getItem("grillMasterActiveOrder")) || null;
const trackingMessages = [
    "Your order has been received.",
    "Our chefs are preparing your delicious meal.",
    "Your delivery is on the way!",
    "Your order has been delivered. Enjoy your meal!"
];
function startTracking(order) {
    activeOrder = {
        id: order.id,
        total: order.total,
        startTime: Date.now(),
        deliveryTime: Date.now() + DELIVERY_DURATION
    };
    localStorage.setItem("grillMasterActiveOrder", JSON.stringify(activeOrder));
    updateTracking();
}
function updateTracking() {
    if (!activeOrder) {
        floatingTrack.classList.remove("show");
        return;
    }
    floatingTrack.classList.add("show");
    const now = Date.now();
    const remaining = Math.max(0, activeOrder.deliveryTime - now);
    const duration = activeOrder.deliveryTime - activeOrder.startTime;
    const progress = 1 - remaining / duration;
    let stage;
    if (progress < 0.15) {
        stage = 0;
    } else if (progress < 0.65) {
        stage = 1;
    } else if (progress < 1) {
        stage = 2;
    } else {
        stage = 3;
    }
    const seconds = Math.ceil(remaining / 1000);
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    document.getElementById("trackingOrderId").textContent = "ORDER #" + activeOrder.id;
    document.getElementById("trackingTotal").textContent = "$" + activeOrder.total.toFixed(2);
    document.getElementById("trackingMessage").textContent = trackingMessages[stage];
    document.getElementById("trackingCountdown").textContent =
        stage === 3 ? "Delivered!" :
        String(minutes).padStart(2, "0") + ":" + String(secs).padStart(2, "0");
    document.getElementById("trackingProgressBar").style.width = ((stage + 1) * 25) + "%";
    trackingSteps.forEach((step, index) => {
        step.classList.toggle("active", index === stage && stage !== 3);
        step.classList.toggle("completed", index < stage || stage === 3);
    });
    document.getElementById("trackingDone").textContent =
        stage === 3 ? "Finish Order ✓" : "Continue Exploring →";
    floatingTrack.querySelector("span").textContent =
        stage === 3 ? "Order Delivered" : "Track My Order";
}
floatingTrack.addEventListener("click", () => {
    updateTracking();
    trackingModal.showModal();
});
document.getElementById("closeTracking").addEventListener("click", () => {
    trackingModal.close();
});
document.getElementById("trackingDone").addEventListener("click", () => {
    trackingModal.close();
    if (activeOrder && Date.now() >= activeOrder.deliveryTime) {
        localStorage.removeItem("grillMasterActiveOrder");
        activeOrder = null;
        floatingTrack.classList.remove("show");
    }
});
trackingModal.addEventListener("click", event => {
    if (event.target === trackingModal) {
        trackingModal.close();
    }
});
setInterval(updateTracking, 1000);
updateTracking();

document.getElementById("trackFromSuccess").addEventListener("click", () => {
    successModal.close();
    updateTracking();
    trackingModal.showModal();
});