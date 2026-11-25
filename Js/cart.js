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