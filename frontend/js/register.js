const API = "http://127.0.0.1:8000";


async function register() {

    const name =
        document.getElementById("name").value.trim();

    const email =
        document.getElementById("email").value.trim();

    const password =
        document.getElementById("password").value.trim();


    if (!name || !email || !password) {

        alert("Please fill all fields.");

        return;

    }


    try {

        const response = await fetch(
            `${API}/auth/register` +
            `?name=${encodeURIComponent(name)}` +
            `&email=${encodeURIComponent(email)}` +
            `&password=${encodeURIComponent(password)}`,
            {
                method: "POST"
            }
        );


        const data = await response.json();


        if (!response.ok) {

            alert(
                data.detail ||
                "Registration failed."
            );

            return;

        }


        alert(
            "Registration successful! Please login."
        );


        window.location.href =
            "login.html";

    }


    catch (error) {

        console.error(error);

        alert(
            "Unable to connect to the server."
        );

    }

}