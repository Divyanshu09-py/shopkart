const ordersContainer =
    document.getElementById("ordersContainer");

const orderSearch =
    document.getElementById("orderSearch");

const orderStatusFilter =
    document.getElementById("orderStatusFilter");

const orderUser =
    JSON.parse(localStorage.getItem("user"));

let allOrders = [];


if (!orderUser) {

    alert("Please login to view your orders.");

    window.location.href =
        "login.html";

} else {

    loadOrders();

}


/* =========================
   LOAD ORDERS
========================= */

async function loadOrders() {

    try {

        const response =
            await fetch(
                `http://localhost:5000/api/orders/user/${orderUser.id}`
            );

        const orders =
            await response.json();

        console.log(
            "Orders received:",
            orders
        );

        allOrders = orders;

        displayOrders(allOrders);

    } catch (error) {

        console.error(
            "Order history error:",
            error
        );

        ordersContainer.innerHTML = `
            <p>
                Unable to load your orders.
            </p>
        `;
    }
}


/* =========================
   DISPLAY ORDERS
========================= */

function displayOrders(orders) {

    if (orders.length === 0) {

        ordersContainer.innerHTML = `
            <p class="no-orders">
                No matching orders found.
            </p>
        `;

        return;
    }


    ordersContainer.innerHTML = "";


    const orderGroups = {};


    orders.forEach(item => {

        if (!orderGroups[item.order_id]) {

            orderGroups[item.order_id] = {

                order_id:
                    item.order_id,

                customer_name:
                    item.customer_name,

                address:
                    item.address,

                city:
                    item.city,

                pin_code:
                    item.pin_code,

                phone:
                    item.phone,

                total_amount:
                    item.total_amount,

                order_date:
                    item.order_date,

                status:
                    item.status,

                products: []

            };
        }


        orderGroups[item.order_id]
            .products
            .push({

                product_name:
                    item.product_name,

                quantity:
                    item.quantity,

                price:
                    item.price

            });

    });


    Object.values(orderGroups)
        .forEach(order => {

            const orderCard =
                document.createElement("div");

            orderCard.classList.add(
                "order-card"
            );


            let productsHTML = "";


            order.products.forEach(
                product => {

                    productsHTML += `

                        <div class="order-product">

                            <div>

                                <strong>
                                    ${product.product_name}
                                </strong>

                                <p>
                                    Quantity:
                                    ${product.quantity}
                                </p>

                            </div>

                            <strong>
                                ₹${product.price}
                            </strong>

                        </div>

                    `;
                }
            );


            orderCard.innerHTML = `

                <div class="order-header">

                    <div>

                        <h2>
                            Order #${order.order_id}
                        </h2>

                        <span>
                            ${new Date(
                                order.order_date
                            ).toLocaleDateString()}
                        </span>

                    </div>


                    <span class="order-status">
                        ${order.status}
                    </span>

                </div>


                <div class="order-details">

                    <h3>
                        Delivery Details
                    </h3>

                    <p>
                        <strong>Name:</strong>
                        ${order.customer_name}
                    </p>

                    <p>
                        <strong>Address:</strong>
                        ${order.address}
                    </p>

                    <p>
                        <strong>City:</strong>
                        ${order.city}
                    </p>

                    <p>
                        <strong>PIN Code:</strong>
                        ${order.pin_code}
                    </p>

                    <p>
                        <strong>Phone:</strong>
                        ${order.phone}
                    </p>

                </div>


                <div class="order-products">

                    <h3>
                        Products
                    </h3>

                    ${productsHTML}

                </div>


                <div class="order-total">

                    <strong>
                        Total:
                    </strong>

                    <strong>
                        ₹${order.total_amount}
                    </strong>

                </div>

            `;


            ordersContainer.appendChild(
                orderCard
            );

        });
}


/* =========================
   FILTER ORDERS
========================= */

function filterOrders() {

    const searchText =
        orderSearch.value
            .trim()
            .toLowerCase();


    const selectedStatus =
        orderStatusFilter.value;


    const filteredOrders =
        allOrders.filter(order => {

            const matchesSearch =
                String(order.order_id)
                    .toLowerCase()
                    .includes(searchText);


            const matchesStatus =
                selectedStatus === "all" ||
                order.status === selectedStatus;


            return (
                matchesSearch &&
                matchesStatus
            );

        });


    displayOrders(
        filteredOrders
    );
}


/* =========================
   FILTER EVENTS
========================= */

if (orderSearch) {

    orderSearch.addEventListener(
        "input",
        filterOrders
    );

}


if (orderStatusFilter) {

    orderStatusFilter.addEventListener(
        "change",
        filterOrders
    );

}