const foodCards = document.querySelectorAll(".foodcard");
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