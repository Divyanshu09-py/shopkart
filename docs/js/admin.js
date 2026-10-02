const adminUser =
    JSON.parse(localStorage.getItem("user"));


// Check login
if (!adminUser) {

    alert("Please login first.");

    window.location.href =
        "login.html";

}


// Check admin permission
else {

    fetch(
        `https://shopkart-production-5ef6.up.railway.app/api/users/${adminUser.id}/admin`
    )
    .then(response => response.json())

    .then(data => {

        if (!data.isAdmin) {

            alert(
                "Access denied. Admins only."
            );

            window.location.href =
                "index.html";

        }

    })

    .catch(error => {

        console.error(
            "Admin check error:",
            error
        );

        alert(
            "Unable to verify admin access."
        );

        window.location.href =
            "index.html";

    });

}


// Logout
const logoutLink =
    document.getElementById("logoutLink");

if (logoutLink) {

    logoutLink.addEventListener(
        "click",
        function(event) {

            event.preventDefault();

            localStorage.removeItem("user");

            alert(
                "Logged out successfully!"
            );

            window.location.href =
                "login.html";

        }
    );

}