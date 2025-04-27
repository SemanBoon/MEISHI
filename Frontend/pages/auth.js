document.addEventListener("DOMContentLoaded", () => {
  const signupForm = document.getElementById("signup-form");
  const loginForm = document.getElementById("login-form");

  // Signup handler
  if (signupForm) {
    signupForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const name = document.getElementById("name").value;
      const email = document.getElementById("email").value;
      const birthday = document.getElementById("birthday").value;
      const password = document.getElementById("password").value;
//      const confirmPassword = document.getElementById("confirm-password").value;

   //   if (password !== confirmPassword) {
     //   alert("Passwords do not match!");
      //  return;
      //}

      try {
        const res = await fetch("http://localhost:5000/user-signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, birthday, email, password })
        });

        const data = await res.json();

        if (res.ok) {
          alert("Signup successful!");
          localStorage.setItem("userId", data.id); // optional: save userId
          window.location.href = "homepage.html";
        } else {
          alert(data.error || "Signup failed.");
        }
      } catch (err) {
        console.error("Signup error:", err);
        alert("Could not connect to server.");
      }
    });
  }

  // Login handler
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const birthday = document.getElementById("birthday").value;
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;

      try {
        const res = await fetch("http://localhost:5000/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password })
        });

        const data = await res.json();

        if (res.ok) {
          localStorage.setItem("userId", data.user.id);
          alert("Login successful!");
          window.location.href = "homepage.html";
        } else {
          alert(data.error || "Login failed.");
        }
      } catch (err) {
        console.error("Login error:", err);
        alert("Could not connect to server.");
      }
    });
  }
});
