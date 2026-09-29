const productsContainer =
    document.getElementById("productsContainer");

const searchInput =
    document.getElementById("searchInput");

const categoryFilter =
    document.getElementById("categoryFilter");

const sortProducts =
    document.getElementById("sortProducts");

let products = [];
const urlParams = new URLSearchParams(window.location.search);
const categoryFromURL = urlParams.get("category");


// Display products
function displayProducts(productList) {

    productsContainer.innerHTML = "";

    // No products found
    if (productList.length === 0) {
        productsContainer.innerHTML = `
            <p class="no-products">
                No products found.
            </p>
        `;
        return;
    }

    productList.forEach(product => {

        const card = document.createElement("div");

        card.classList.add("product-card");

        card.innerHTML = `
            <div class="product-image">
                ${
                    product.image
                    ? `<img src="${product.image}" alt="${product.name}">`
                    : "🛍️"
                }
            </div>

            <h3>${product.name}</h3>

            <p>${product.description}</p>

            <h4>₹${product.price}</h4>

            ${
                product.stock > 0
                ? `
                    <p>Stock: ${product.stock}</p>

                    <button onclick="viewProduct(${product.id})">
                        View Details
                    </button>

                    <button onclick="addToCart(${product.id})">
                        Add to Cart
                    </button>
                  `
                : `
                    <p class="out-of-stock">
                        Out of Stock
                    </p>

                    <button disabled>
                        Out of Stock
                    </button>
                  `
            }
        `;

        productsContainer.appendChild(card);
    });
}


// Load products from backend
async function loadProducts() {

    try {

        const response =
            await fetch(
                "http://localhost:5000/api/products"
            );

        products = await response.json();
if (categoryFromURL) {
    categoryFilter.value = categoryFromURL;
}
        filterProducts();

    } catch (error) {

        productsContainer.innerHTML =
            "<p>Unable to load products.</p>";

        console.error(error);
    }
}


// Search + category filter + sorting
function filterProducts() {

    const searchText =
        searchInput.value.toLowerCase();

    const selectedCategory =
        categoryFilter.value;

    const selectedSort =
        sortProducts.value;

    let filteredProducts =
        products.filter(product => {

            const matchesSearch =
                product.name
                    .toLowerCase()
                    .includes(searchText)
                ||
                product.description
                    .toLowerCase()
                    .includes(searchText);

            const matchesCategory =
                selectedCategory === "all"
                ||
                product.category === selectedCategory;

            return matchesSearch && matchesCategory;
        });


    // Sorting
    if (selectedSort === "price-low") {

        filteredProducts.sort(
            (a, b) => a.price - b.price
        );

    } else if (selectedSort === "price-high") {

        filteredProducts.sort(
            (a, b) => b.price - a.price
        );

    } else if (selectedSort === "name-az") {

        filteredProducts.sort(
            (a, b) =>
                a.name.localeCompare(b.name)
        );

    } else if (selectedSort === "name-za") {

        filteredProducts.sort(
            (a, b) =>
                b.name.localeCompare(a.name)
        );
    }


    displayProducts(filteredProducts);
}


// Search box
searchInput.addEventListener(
    "input",
    filterProducts
);


// Category dropdown
categoryFilter.addEventListener(
    "change",
    filterProducts
);


// Sorting dropdown
sortProducts.addEventListener(
    "change",
    filterProducts
);


// Add product to cart
function addToCart(productId) {

    let cart =
        JSON.parse(localStorage.getItem("cart")) || [];

    const product =
        products.find(
            product => product.id === productId
        );

    if (!product) {
        return;
    }

    const existingProduct =
        cart.find(
            product => product.id === productId
        );

    if (existingProduct) {

        if (
            existingProduct.quantity >=
            product.stock
        ) {
            alert(
                "Sorry! No more stock available."
            );
            return;
        }

        existingProduct.quantity += 1;

    } else {

        if (product.stock <= 0) {

            alert(
                "Sorry! This product is out of stock."
            );

            return;
        }

       cart.push({
    id: product.id,
    name: product.name,
    price: product.price,
    image: product.image,
    quantity: 1,
    stock: product.stock
});
    }

    localStorage.setItem(
        "cart",
        JSON.stringify(cart)
    );

    alert("Product added to cart!");
}


// View product details
function viewProduct(productId) {

    window.location.href =
        `product-details.html?id=${productId}`;
}


// Start
loadProducts();