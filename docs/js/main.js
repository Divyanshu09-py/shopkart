const shopNowBtn = document.getElementById("shopNowBtn");

shopNowBtn.addEventListener("click", function () {
    document.querySelector(".categories").scrollIntoView({
        behavior: "smooth"
    });
});

function shopCategory(category) {
    window.location.href =
        `products.html?category=${encodeURIComponent(category)}`;
}
const featuredProductsContainer =
    document.getElementById("featuredProductsContainer");

async function loadFeaturedProducts() {
    try {
        const response = await fetch(
            "https://shopkart-production-5ef6.up.railway.app/api/products"
        );

        const products = await response.json();

        // Show first 4 products
        const featuredProducts = products.slice(0, 4);

        featuredProductsContainer.innerHTML = "";

        featuredProducts.forEach(product => {

            const card = document.createElement("div");
            card.classList.add("featured-product-card");

            card.innerHTML = `
                <div class="featured-product-image">
                    <img
                        src="${product.image}"
                        alt="${product.name}"
                    >
                </div>

                <h3>${product.name}</h3>

                <p>₹${product.price}</p>

                <button onclick="viewFeaturedProduct(${product.id})">
                    View Details
                </button>
            `;

            featuredProductsContainer.appendChild(card);
        });

    } catch (error) {
        console.error(
            "Featured products error:",
            error
        );

        featuredProductsContainer.innerHTML = `
            <p>Unable to load featured products.</p>
        `;
    }
}

function viewFeaturedProduct(productId) {
    window.location.href =
        `product-details.html?id=${productId}`;
}
const viewAllProductsBtn =
    document.getElementById("viewAllProductsBtn");

if (viewAllProductsBtn) {
    viewAllProductsBtn.addEventListener("click", function () {
        window.location.href = "products.html";
    });
}
loadFeaturedProducts();