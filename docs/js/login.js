const loginForm = document.getElementById("loginForm");

loginForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {

        const response = await fetch(
            "https://shopkart-production-5ef6.up.railway.app/api/login",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email: email,
                    password: password
                })
            }
        );

        const result = await response.json();

        if (response.ok) {

            localStorage.setItem(
                "user",
                JSON.stringify(result.user)
            );

            alert("Login successful!");

            window.location.href = "index.html";

        } else {

            alert(result.message);
        }

    } catch (error) {

        console.error("Login error:", error);

        alert("Unable to connect to server.");
    }
});