const cartContainer = document.getElementById("cartContainer");
const cartTotal = document.getElementById("cartTotal");
const cartCount = document.getElementById("cartCount");

let cart = JSON.parse(localStorage.getItem("cart")) || [];


function displayCart() {

    cartContainer.innerHTML = "";
    if (cartCount) {
    const itemCount = cart.reduce(
        (total, product) => total + product.quantity,
        0
    );

    cartCount.textContent = itemCount;
}

    if (cart.length === 0) {

        cartContainer.innerHTML = `
            <p style="color:black;">Your cart is empty.</p>
        `;

        cartTotal.innerHTML = "";

        return;
    }

    let total = 0;

    cart.forEach(product => {

        const itemTotal =
            product.price * product.quantity;

        total += itemTotal;

        const cartItem =
            document.createElement("div");

        cartItem.classList.add("cart-item");
cartItem.innerHTML = `
    <div class="cart-product-image">
        ${
            product.image
            ? `<img src="${product.image}" alt="${product.name}">`
            : ""
        }
    </div>

    <div class="cart-product-details">
        <h3>${product.name}</h3>
            <p>Price: ₹${product.price}</p>

            <div class="quantity-control">

                <button onclick="decreaseQuantity(${product.id})">
                    −
                </button>

                <span>${product.quantity}</span>

                <button onclick="increaseQuantity(${product.id})">
                    +
                </button>

            </div>

            <p class="available-stock">
                Available stock: ${product.stock}
            </p>

            <p>Subtotal: ₹${itemTotal}</p>

            <button onclick="removeFromCart(${product.id})">
                Remove
            </button>
            </div>
        `;

        cartContainer.appendChild(cartItem);
    });


    cartTotal.innerHTML = `
        <h2>Total: ₹${total}</h2>

        <button onclick="goToCheckout()" class="checkout-btn">
            Proceed to Checkout
        </button>
    `;
}


// Increase quantity
function increaseQuantity(productId) {

    const product =
        cart.find(product => product.id === productId);

    if (!product) {
        return;
    }

    // Check available stock
    if (product.quantity >= product.stock) {
        alert("Sorry! No more stock available.");
        return;
    }

    product.quantity += 1;

    localStorage.setItem(
        "cart",
        JSON.stringify(cart)
    );

    displayCart();
}


// Decrease quantity
function decreaseQuantity(productId) {

    const product =
        cart.find(product => product.id === productId);

    if (product) {

        if (product.quantity > 1) {
            product.quantity -= 1;
        } else {
            removeFromCart(productId);
            return;
        }
    }

    localStorage.setItem(
        "cart",
        JSON.stringify(cart)
    );

    displayCart();
}


// Remove product
function removeFromCart(productId) {

    cart = cart.filter(
        product => product.id !== productId
    );

    localStorage.setItem(
        "cart",
        JSON.stringify(cart)
    );

    displayCart();
}


// Go to checkout
function goToCheckout() {
    window.location.href = "checkout.html";
}


displayCart();