const productDetails =
    document.getElementById("productDetails");

const reviewsContainer =
    document.getElementById("reviewsContainer");

const reviewRating =
    document.getElementById("reviewRating");

const reviewText =
    document.getElementById("reviewText");

const submitReviewBtn =
    document.getElementById("submitReviewBtn");


const urlParams =
    new URLSearchParams(window.location.search);

const productId =
    urlParams.get("id");


if (!productId) {

    productDetails.innerHTML = `
        <p>Product not found.</p>
    `;

} else {

    loadProduct();

}


/* =========================
   LOAD PRODUCT
========================= */

async function loadProduct() {

    try {

        const response =
            await fetch(
                "https://shopkart-production-5ef6.up.railway.app/api/products"
            );

        const products =
            await response.json();

        const product =
            products.find(
                product => product.id == productId
            );

        if (!product) {

            productDetails.innerHTML = `
                <p>Product not found.</p>
            `;

            return;
        }


        productDetails.innerHTML = `

            <div class="product-details-card">

                <div class="product-details-image">
    ${
        product.image
        ? `<img src="${product.image}" alt="${product.name}">`
        : "🛍️"
    }
</div>

                <div class="product-details-info">

                    <h1>
                        ${product.name}
                    </h1>

                    <p class="product-description">
                        ${product.description}
                    </p>

                    <h2>
                        ₹${product.price}
                    </h2>

                    <p>
                        <strong>Category:</strong>
                        ${product.category}
                    </p>

                    <p>
                        <strong>Stock:</strong>
                        ${product.stock}
                    </p>

                    ${
                        product.stock > 0
                        ? `
                            <button
                                onclick="addProductToCart(${product.id})"
                            >
                                Add to Cart
                            </button>
                          `
                        : `
                            <button disabled>
                                Out of Stock
                            </button>
                          `
                    }

                </div>

            </div>
        `;


        window.currentProduct =
            product;


        // Load reviews
        loadReviews();


    } catch (error) {

        console.error(
            "Product loading error:",
            error
        );

        productDetails.innerHTML = `
            <p>
                Unable to load product.
            </p>
        `;
    }
}


/* =========================
   ADD TO CART
========================= */

function addProductToCart(productId) {

    const product =
        window.currentProduct;

    let cart =
        JSON.parse(
            localStorage.getItem("cart")
        ) || [];


    const existingProduct =
        cart.find(
            item => item.id === productId
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

        cart.push({

            id: product.id,

            name: product.name,

            price: product.price,

            quantity: 1,

            stock: product.stock

        });
    }


    localStorage.setItem(
        "cart",
        JSON.stringify(cart)
    );


    alert(
        "Product added to cart!"
    );
}


/* =========================
   LOAD REVIEWS
========================= */

async function loadReviews() {

    try {

        const response =
            await fetch(
                `https://shopkart-production-5ef6.up.railway.app/api/reviews/${productId}`
            );


        const reviews =
            await response.json();


        reviewsContainer.innerHTML = "";


        if (reviews.length === 0) {

            reviewsContainer.innerHTML = `
                <p class="review-text">
                    No reviews yet.
                    Be the first to review this product!
                </p>
            `;

            return;
        }


        reviews.forEach(review => {

            const reviewCard =
                document.createElement("div");


            reviewCard.classList.add(
                "review-card"
            );


            reviewCard.innerHTML = `

                <div class="review-user">
                    ${review.user_name}
                </div>

                <div class="review-rating">
                    ${"★".repeat(review.rating)}
                    ${"☆".repeat(5 - review.rating)}
                </div>

                <div class="review-text">
                    ${review.review_text || ""}
                </div>

                <div class="review-date">
                    ${new Date(
                        review.created_at
                    ).toLocaleDateString()}
                </div>

            `;


            reviewsContainer.appendChild(
                reviewCard
            );

        });


    } catch (error) {

        console.error(
            "Review loading error:",
            error
        );


        reviewsContainer.innerHTML = `
            <p>
                Unable to load reviews.
            </p>
        `;
    }
}


/* =========================
   SUBMIT REVIEW
========================= */

if (submitReviewBtn) {

    submitReviewBtn.addEventListener(
        "click",
        submitReview
    );

}


async function submitReview() {

    console.log("Submit review clicked");


    const user =
        JSON.parse(
            localStorage.getItem("user")
        );


    if (!user) {

        alert(
            "Please login to write a review."
        );

        window.location.href =
            "login.html";

        return;
    }


    const rating =
        Number(reviewRating.value);


    const review_text =
        reviewText.value.trim();


    if (!review_text) {

        alert(
            "Please write your review."
        );

        return;
    }


    try {

        const response =
            await fetch(
                "https://shopkart-production-5ef6.up.railway.app/api/reviews",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        product_id:
                            Number(productId),

                        user_id:
                            Number(user.id),

                        rating:
                            rating,

                        review_text:
                            review_text

                    })
                }
            );


        const result =
            await response.json();


        console.log(
            "Review response:",
            result
        );


        if (response.ok) {

            alert(
                "Review added successfully!"
            );


            reviewText.value = "";

            reviewRating.value = "5";


            loadReviews();


        } else {

            alert(
                result.message ||
                "Failed to add review."
            );
        }


    } catch (error) {

        console.error(
            "Review submission error:",
            error
        );


        alert(
            "Unable to connect to server."
        );
    }
}