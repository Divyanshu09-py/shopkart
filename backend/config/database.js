const mysql = require("mysql2");

const db = mysql.createPool({
    host: "localhost",
    user: "shopkart_user",
    password: process.env.DB_PASSWORD,
    database: "shopkart"
});

module.exports = db;