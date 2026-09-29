const registerForm = document.getElementById("registerForm");

registerForm.addEventListener("submit", async function(event) {

    event.preventDefault();

    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;


    try {

        const response = await fetch(
            "http://localhost:5000/api/register",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    name,
                    email,
                    password
                })
            }
        );


        const result = await response.json();


        if (response.ok) {

            alert("Registration successful!");

            window.location.href = "login.html";

        } else {

            alert(result.message);
        }

    } catch (error) {

        console.error(error);

        alert("Unable to connect to server.");
    }

});