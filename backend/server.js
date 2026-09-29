require("dotenv").config();
const express = require("express");
const cors = require("cors");
const db = require("./config/database");
const bcrypt = require("bcrypt");
const app = express();

const PORT = 5000;
app.use(cors());
app.use(express.json());

// Test route
app.get("/", (req, res) => {
    res.send("ShopKart backend is running!");
});

// Get products from MySQL
app.get("/api/products", (req, res) => {

    const sql = "SELECT * FROM products";

    db.query(sql, (err, results) => {

        if (err) {
            console.error("Database error:", err);

            return res.status(500).json({
                message: "Database error"
            });
        }

        res.json(results);
    });
});
// Add a new product
app.post("/api/products", (req, res) => {

    const { name, description, price, category, stock } = req.body;

    const sql = `
        INSERT INTO products
        (name, description, price, category, stock)
        VALUES (?, ?, ?, ?, ?)
    `;

    db.query(
        sql,
        [name, description, price, category, stock],
        (err, result) => {

            if (err) {
                console.error("Database error:", err);

                return res.status(500).json({
                    message: "Database error"
                });
            }

            res.status(201).json({
                message: "Product added successfully",
                productId: result.insertId
            });
        }
    );
});
// Update a product
app.put("/api/products/:id", (req, res) => {

    const { id } = req.params;
    const { name, description, price, category, stock } = req.body;

    const sql = `
        UPDATE products
        SET name = ?, description = ?, price = ?, category = ?, stock = ?
        WHERE id = ?
    `;

    db.query(
        sql,
        [name, description, price, category, stock, id],
        (err, result) => {

            if (err) {
                console.error("Database error:", err);

                return res.status(500).json({
                    message: "Database error"
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    message: "Product not found"
                });
            }

            res.json({
                message: "Product updated successfully"
            });
        }
    );
});
// Delete a product
app.delete("/api/products/:id", (req, res) => {

    const { id } = req.params;

    const sql = "DELETE FROM products WHERE id = ?";

    db.query(sql, [id], (err, result) => {

        if (err) {
            console.error("Database error:", err);

            return res.status(500).json({
                message: "Database error"
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        res.json({
            message: "Product deleted successfully"
        });
    });
});
// Place an order
// Place an order
// Place an order
app.post("/api/orders", (req, res) => {

    const {
        user_id,
        customer_name,
        address,
        city,
        pin_code,
        phone,
        total_amount,
        cart
    } = req.body;


    // Check cart
    if (!cart || cart.length === 0) {

        return res.status(400).json({
            message: "Cart is empty"
        });

    }


    // First check stock for every product
    const stockChecks = cart.map(product => {

        return new Promise((resolve, reject) => {

            const sql =
                "SELECT stock FROM products WHERE id = ?";

            db.query(
                sql,
                [product.id],
                (err, results) => {

                    if (err) {
                        reject(err);
                        return;
                    }


                    if (results.length === 0) {

                        reject(
                            new Error(
                                `Product ${product.id} not found`
                            )
                        );

                        return;
                    }


                    const availableStock =
                        results[0].stock;


                    if (product.quantity > availableStock) {

                        reject(
                            new Error(
                                `Not enough stock for product ${product.id}`
                            )
                        );

                        return;
                    }


                    resolve();

                }
            );

        });

    });


    // Wait until all stock checks finish
    Promise.all(stockChecks)
        .then(() => {

            // Insert order
            const orderSql = `
                INSERT INTO orders
                (user_id, customer_name, address, city, pin_code, phone, total_amount)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `;


            db.query(
                orderSql,
                [
                    user_id,
                    customer_name,
                    address,
                    city,
                    pin_code,
                    phone,
                    total_amount
                ],
                (err, result) => {

                    if (err) {

                        console.error(
                            "Order database error:",
                            err
                        );

                        return res.status(500).json({
                            message: "Failed to place order"
                        });

                    }


                    const orderId =
                        result.insertId;


                    // Insert order items
                    const itemSql = `
                        INSERT INTO order_items
                        (order_id, product_id, quantity, price)
                        VALUES ?
                    `;


                    const items = cart.map(product => [

                        orderId,
                        product.id,
                        product.quantity,
                        product.price

                    ]);


                    db.query(
                        itemSql,
                        [items],
                        (err) => {

                            if (err) {

                                console.error(
                                    "Order items error:",
                                    err
                                );

                                return res.status(500).json({
                                    message:
                                        "Order created but items could not be saved"
                                });

                            }


                            // Decrease product stock
                            const stockUpdates =
                                cart.map(product => {

                                    return new Promise(
                                        (resolve, reject) => {

                                            const updateSql = `
                                                UPDATE products
                                                SET stock = stock - ?
                                                WHERE id = ?
                                            `;


                                            db.query(
                                                updateSql,
                                                [
                                                    product.quantity,
                                                    product.id
                                                ],
                                                (err) => {

                                                    if (err) {
                                                        reject(err);
                                                    } else {
                                                        resolve();
                                                    }

                                                }
                                            );

                                        }
                                    );

                                });


                            Promise.all(stockUpdates)
                                .then(() => {

                                    res.status(201).json({

                                        message:
                                            "Order placed successfully",

                                        orderId: orderId

                                    });

                                })
                                .catch(error => {

                                    console.error(
                                        "Stock update error:",
                                        error
                                    );

                                    res.status(500).json({

                                        message:
                                            "Order placed but stock update failed"

                                    });

                                });

                        }
                    );

                }
            );

        })
        .catch(error => {

            console.error(
                "Stock check error:",
                error
            );

            res.status(400).json({

                message: error.message

            });

        });

});
// Register a new user
app.post("/api/register", async (req, res) => {

    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({
            message: "All fields are required"
        });
    }

    try {

        // Check whether email already exists
        const checkSql =
            "SELECT id FROM users WHERE email = ?";

        db.query(checkSql, [email], async (err, results) => {

            if (err) {
                console.error("Database error:", err);

                return res.status(500).json({
                    message: "Database error"
                });
            }

            if (results.length > 0) {

                return res.status(409).json({
                    message: "Email already registered"
                });
            }

            // Hash password
            const hashedPassword =
                await bcrypt.hash(password, 10);

            // Insert user
            const insertSql = `
                INSERT INTO users
                (name, email, password)
                VALUES (?, ?, ?)
            `;

            db.query(
                insertSql,
                [name, email, hashedPassword],
                (err, result) => {

                    if (err) {
                        console.error("Database error:", err);

                        return res.status(500).json({
                            message: "Registration failed"
                        });
                    }

                    res.status(201).json({
                        message: "Registration successful",
                        userId: result.insertId
                    });
                }
            );
        });

    } catch (error) {

        console.error("Registration error:", error);

        res.status(500).json({
            message: "Server error"
        });
    }
});
// Login user
app.post("/api/login", (req, res) => {

    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            message: "Email and password are required"
        });
    }

    const sql = "SELECT * FROM users WHERE email = ?";

    db.query(sql, [email], async (err, results) => {

        if (err) {
            console.error("Database error:", err);

            return res.status(500).json({
                message: "Database error"
            });
        }

        if (results.length === 0) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const user = results[0];

        const passwordMatch =
            await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        res.json({
            message: "Login successful",
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        });
    });
});

// Add a product review
app.post("/api/reviews", (req, res) => {

    const {
        product_id,
        user_id,
        rating,
        review_text
    } = req.body;

    // Basic validation
    if (!product_id || !user_id || !rating) {
        return res.status(400).json({
            message: "Product, user and rating are required"
        });
    }

    if (rating < 1 || rating > 5) {
        return res.status(400).json({
            message: "Rating must be between 1 and 5"
        });
    }

    const sql = `
        INSERT INTO reviews
        (product_id, user_id, rating, review_text)
        VALUES (?, ?, ?, ?)
    `;

    db.query(
        sql,
        [
            product_id,
            user_id,
            rating,
            review_text
        ],
        (err, result) => {

            if (err) {
                console.error(
                    "Review error:",
                    err
                );

                return res.status(500).json({
                    message: "Failed to add review"
                });
            }

            res.status(201).json({
                message: "Review added successfully",
                reviewId: result.insertId
            });
        }
    );
});

// Get reviews for a product
app.get("/api/reviews/:productId", (req, res) => {

    const { productId } = req.params;

    const sql = `
        SELECT
            r.id,
            r.rating,
            r.review_text,
            r.created_at,
            u.name AS user_name
        FROM reviews r
        JOIN users u
            ON r.user_id = u.id
        WHERE r.product_id = ?
        ORDER BY r.created_at DESC
    `;

    db.query(
        sql,
        [productId],
        (err, results) => {

            if (err) {
                console.error(
                    "Reviews fetch error:",
                    err
                );

                return res.status(500).json({
                    message: "Failed to fetch reviews"
                });
            }

            res.json(results);
        }
    );
});
// Check if user is admin
app.get("/api/users/:id/admin", (req, res) => {

    const { id } = req.params;

    const sql = `
        SELECT id, name, email, is_admin
        FROM users
        WHERE id = ?
    `;

    db.query(sql, [id], (err, results) => {

        if (err) {
            console.error("Admin check error:", err);

            return res.status(500).json({
                message: "Database error"
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        const user = results[0];

        res.json({
            isAdmin: Boolean(user.is_admin)
        });
    });
});
// Update user profile
app.put("/api/users/:id", (req, res) => {

    const { id } = req.params;
    const { name, email } = req.body;

    if (!name || !email) {
        return res.status(400).json({
            message: "Name and email are required"
        });
    }

    const sql = `
        UPDATE users
        SET name = ?, email = ?
        WHERE id = ?
    `;

    db.query(
        sql,
        [name, email, id],
        (err, result) => {

            if (err) {

                console.error(
                    "Profile update error:",
                    err
                );

                // Duplicate email
                if (err.code === "ER_DUP_ENTRY") {
                    return res.status(409).json({
                        message: "Email already registered"
                    });
                }

                return res.status(500).json({
                    message: "Failed to update profile"
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    message: "User not found"
                });
            }

            res.json({
                message: "Profile updated successfully"
            });
        }
    );
});
// Get orders of a specific user
app.get("/api/orders/user/:userId", (req, res) => {

    const { userId } = req.params;

    const sql = `
        SELECT
            o.id AS order_id,
            o.customer_name,
            o.address,
            o.city,
            o.pin_code,
            o.phone,
            o.total_amount,
            o.order_date,
            o.status,
            oi.product_id,
            oi.quantity,
            oi.price,
            p.name AS product_name
        FROM orders o
        JOIN order_items oi
            ON o.id = oi.order_id
        JOIN products p
            ON oi.product_id = p.id
        WHERE o.user_id = ?
        ORDER BY o.order_date DESC
    `;

    db.query(sql, [userId], (err, results) => {

        if (err) {
            console.error("Order history error:", err);

            return res.status(500).json({
                message: "Failed to fetch order history"
            });
        }

        res.json(results);
    });
});
// Update order status
app.put("/api/orders/:orderId/status", (req, res) => {

    const { orderId } = req.params;
    const { status } = req.body;

    const allowedStatuses = [
        "Placed",
        "Processing",
        "Shipped",
        "Delivered"
    ];

    if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
            message: "Invalid order status"
        });
    }

    const sql = `
        UPDATE orders
        SET status = ?
        WHERE id = ?
    `;

    db.query(
        sql,
        [status, orderId],
        (err, result) => {

            if (err) {
                console.error(
                    "Order status update error:",
                    err
                );

                return res.status(500).json({
                    message: "Failed to update order status"
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    message: "Order not found"
                });
            }

            res.json({
                message: "Order status updated successfully"
            });
        }
    );
});
// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
