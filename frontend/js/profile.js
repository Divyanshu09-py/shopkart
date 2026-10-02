const profileName =
    document.getElementById("profileName");

const profileEmail =
    document.getElementById("profileEmail");

const editProfileBtn =
    document.getElementById("editProfileBtn");

const editProfileForm =
    document.getElementById("editProfileForm");

const editName =
    document.getElementById("editName");

const editEmail =
    document.getElementById("editEmail");

const saveProfileBtn =
    document.getElementById("saveProfileBtn");

const cancelProfileBtn =
    document.getElementById("cancelProfileBtn");


const profileUser =
    JSON.parse(localStorage.getItem("user"));


if (!profileUser) {

    alert("Please login to view your profile.");

    window.location.href = "login.html";

} else {

    profileName.textContent =
        profileUser.name;

    profileEmail.textContent =
        profileUser.email;
}


// Open edit form
editProfileBtn.addEventListener(
    "click",
    function () {

        editName.value =
            profileUser.name;

        editEmail.value =
            profileUser.email;

        editProfileForm.style.display =
            "block";

        editProfileBtn.style.display =
            "none";
    }
);


// Cancel editing
cancelProfileBtn.addEventListener(
    "click",
    function () {

        editProfileForm.style.display =
            "none";

        editProfileBtn.style.display =
            "inline-block";
    }
);


// Save profile
saveProfileBtn.addEventListener(
    "click",
    async function () {

        const newName =
            editName.value.trim();

        const newEmail =
            editEmail.value.trim();


        if (!newName || !newEmail) {

            alert(
                "Name and email cannot be empty."
            );

            return;
        }


        try {

            const response =
                await fetch(
                    `https://shopkart-production-5ef6.up.railway.app/api/users/${profileUser.id}`,
                    {
                        method: "PUT",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({
                            name: newName,
                            email: newEmail
                        })
                    }
                );


            const result =
                await response.json();


            if (response.ok) {

                profileUser.name =
                    newName;

                profileUser.email =
                    newEmail;


                localStorage.setItem(
                    "user",
                    JSON.stringify(profileUser)
                );


                profileName.textContent =
                    newName;

                profileEmail.textContent =
                    newEmail;


                editProfileForm.style.display =
                    "none";

                editProfileBtn.style.display =
                    "inline-block";


                alert(
                    "Profile updated successfully!"
                );

            } else {

                alert(result.message);
            }

        } catch (error) {

            console.error(
                "Profile update error:",
                error
            );

            alert(
                "Unable to connect to server."
            );
        }
    }
);