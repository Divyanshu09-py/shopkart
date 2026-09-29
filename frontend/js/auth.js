const loginLink =
    document.getElementById("loginLink");

const logoutLink =
    document.getElementById("logoutLink");

const profileLink =
    document.getElementById("profileLink");

const ordersLink =
    document.querySelector(
        'a[href="orders.html"]'
    );

const user =
    JSON.parse(localStorage.getItem("user"));


if (user) {

    // Show logged-in user's name
    if (loginLink) {
        loginLink.textContent =
            "Hi, " + user.name;

        loginLink.href = "#";
    }

    // Show Logout
    if (logoutLink) {
        logoutLink.style.display = "inline";
    }

    // Show My Orders
    if (ordersLink) {
        ordersLink.style.display = "inline";
    }

    // Show My Profile
    if (profileLink) {
        profileLink.style.display = "inline";
    }

} else {

    // Show Login
    if (loginLink) {
        loginLink.textContent = "Login";
        loginLink.href = "login.html";
    }

    // Hide Logout
    if (logoutLink) {
        logoutLink.style.display = "none";
    }

    // Hide My Orders
    if (ordersLink) {
        ordersLink.style.display = "none";
    }

    // Hide My Profile
    if (profileLink) {
        profileLink.style.display = "none";
    }
}


// Logout
if (logoutLink) {

    logoutLink.addEventListener(
        "click",
        function(event) {

            event.preventDefault();

            localStorage.removeItem("user");

            alert("Logged out successfully!");

            window.location.href =
                "login.html";
        }
    );
}