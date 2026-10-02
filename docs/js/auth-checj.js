const user = JSON.parse(localStorage.getItem("user"));

if (!user) {
    alert("Please login before checkout.");
    window.location.href = "login.html";
}