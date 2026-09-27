const API = "http://127.0.0.1:8000";


async function login() {

    const email =
        document.getElementById("email").value.trim();

    const password =
        document.getElementById("password").value.trim();


    if (!email || !password) {

        alert("Please enter email and password.");

        return;
    }


    try {

        const response = await fetch(
            `${API}/auth/login?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`,
            {
                method: "POST"
            }
        );


        const data = await response.json();


        if (!response.ok) {

            alert(data.detail || "Invalid email or password.");

            return;
        }


        localStorage.setItem(
            "user_id",
            data.user_id
        );

        localStorage.setItem(
            "user_name",
            data.name
        );


        alert("Login successful!");


        window.location.href = "index.html";

    } catch (error) {

        console.error(error);

        alert("Unable to connect to the server.");
    }
}