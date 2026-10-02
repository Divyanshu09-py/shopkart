// Get logged-in user
const checkoutUser = JSON.parse(localStorage.getItem("user"));

// Get checkout elements
const checkoutForm = document.getElementById("checkoutForm");
const customerNameInput = document.getElementById("customerName");

// Check login
if (!checkoutUser) {

    alert("Please login before placing an order.");

    window.location.href = "login.html";

} else {

    // Show logged-in user's name
    customerNameInput.value = checkoutUser.name;
}


// Handle checkout
checkoutForm.addEventListener("submit", async function(event) {

    event.preventDefault();

    // Get cart
    const cart = JSON.parse(localStorage.getItem("cart")) || [];

    if (cart.length === 0) {

        alert("Your cart is empty!");

        return;
    }


    // Calculate total
    let total = 0;

    cart.forEach(product => {

        total += product.price * product.quantity;

    });


    // Get delivery details
    const customer_name = checkoutUser.name;

    const address =
        document.querySelector(
            'textarea[placeholder="Enter your address"]'
        ).value;

    const city =
        document.querySelector(
            'input[placeholder="Enter your city"]'
        ).value;

    const pin_code =
        document.querySelector(
            'input[placeholder="Enter PIN code"]'
        ).value;

    const phone =
        document.querySelector(
            'input[placeholder="Enter phone number"]'
        ).value;


    // Send order to backend
    try {

        const response = await fetch(
            "https://shopkart-production-5ef6.up.railway.app/api/orders",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

               body: JSON.stringify({

    user_id: checkoutUser.id,

    customer_name: customer_name,

    address: address,

    city: city,

    pin_code: pin_code,

    phone: phone,

    total_amount: total,

    cart: cart

})
            }
        );


        const result = await response.json();


        if (response.ok) {

            alert(
                "Order placed successfully! Order ID: " +
                result.orderId
            );

            // Clear cart
            localStorage.removeItem("cart");

            // Go to products
            window.location.href = "products.html";

        } else {

            alert(result.message);

        }

    } catch (error) {

        console.error("Order error:", error);

        alert("Unable to place order.");

    }

});