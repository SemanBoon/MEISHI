// written by: Alejandro
// tested by: Alejandro
// debugged by: Alejandro

document.addEventListener("DOMContentLoaded", () => {
  const signupForm = document.getElementById("signup-form");
  const loginForm = document.getElementById("login-form");
  const API_BASE_URL = "http://localhost:9000"; 

  // Check if user is already logged in
   function checkAuth() {
    // If we're on login/signup page and already logged in, redirect to homepage
    if (localStorage.getItem("userId") && 
        (window.location.pathname.includes('login.html') || 
         window.location.pathname.includes('signup.html'))) {
      window.location.href = "homepage.html";
    }
   }

  // Run auth check when the page loads
  checkAuth();

  // Signup handler
  if (signupForm) {
    signupForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const name = document.getElementById("name").value;
      const email = document.getElementById("email").value;
      const birthday = document.getElementById("birthday").value;
      const password = document.getElementById("password").value;

      try {
        // Show loading state if possible
        const submitButton = signupForm.querySelector('button[type="submit"]');
        if (submitButton) {
          submitButton.disabled = true;
          submitButton.textContent = "Signing up...";
        }

        const res = await fetch(`${API_BASE_URL}/user-signup`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, birthday, email, password })
        });

        const data = await res.json();

        if (res.ok) {
          // Save user data
          localStorage.setItem("userId", data.id);
          localStorage.setItem("userName", data.name);
          localStorage.setItem("userEmail", data.email);
          
          // Show success message
          const errorMessage = document.getElementById("error-message");
          if (errorMessage) {
            errorMessage.style.color = "green";
            errorMessage.textContent = "Signup successful! Redirecting...";
            errorMessage.style.display = "block";
          } else {
            alert("Signup successful!");
          }
          
          // Redirect after a short delay
          setTimeout(() => {
            window.location.href = "homepage.html";
          }, 1500);
        } else {
          // Show error message
          const errorMessage = document.getElementById("error-message");
          if (errorMessage) {
            errorMessage.textContent = data.error || "Signup failed.";
            errorMessage.style.display = "block";
          } else {
            alert(data.error || "Signup failed.");
          }
          
          // Re-enable the button
          if (submitButton) {
            submitButton.disabled = false;
            submitButton.textContent = "Sign Up";
          }
        }
      } catch (err) {
        console.error("Signup error:", err);
        
        // Show error message
        const errorMessage = document.getElementById("error-message");
        if (errorMessage) {
          errorMessage.textContent = "Could not connect to server.";
          errorMessage.style.display = "block";
        } else {
          alert("Could not connect to server.");
        }
        
        // Re-enable the button
        const submitButton = signupForm.querySelector('button[type="submit"]');
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.textContent = "Sign Up";
        }
      }
    });
  }

  // Login handler
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
  
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;
  
      try {
        // Show loading state if possible
        const submitButton = loginForm.querySelector('button[type="submit"]');
        if (submitButton) {
          submitButton.disabled = true;
          submitButton.textContent = "Logging in...";
        }
        
        const res = await fetch(`${API_BASE_URL}/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password })
        });
  
        const data = await res.json();
  
        if (res.ok) {
          // Extract user ID, handle different response formats
          let userId = null;
          if (data.id) {
            userId = data.id;
          } else if (data.user && data.user.id) {
            userId = data.user.id;
            
            // Also save other user info if available
            if (data.user.name) {
              localStorage.setItem("userName", data.user.name);
            }
            if (data.user.email) {
              localStorage.setItem("userEmail", data.user.email);
            }
          } else {
            const errorMessage = document.getElementById("error-message");
            if (errorMessage) {
              errorMessage.textContent = "Login response missing user ID.";
              errorMessage.style.display = "block";
            } else {
              alert("Login response missing user ID.");
            }
            
            // Re-enable the button
            if (submitButton) {
              submitButton.disabled = false;
              submitButton.textContent = "Login";
            }
            return;
          }
          
          // Save user ID
          localStorage.setItem("userId", userId);
          
          // Show success message
          const errorMessage = document.getElementById("error-message");
          if (errorMessage) {
            errorMessage.style.color = "green";
            errorMessage.textContent = "Login successful! Redirecting...";
            errorMessage.style.display = "block";
          } else {
            alert("Login successful!");
          }
          
          // Redirect after a short delay
          setTimeout(() => {
            window.location.href = "homepage.html"; 
          }, 1500);
        } else {
          // Show error message
          const errorMessage = document.getElementById("error-message");
          if (errorMessage) {
            errorMessage.textContent = data.error || "Login failed.";
            errorMessage.style.display = "block";
          } else {
            alert(data.error || "Login failed.");
          }
          
          // Re-enable the button
          if (submitButton) {
            submitButton.disabled = false;
            submitButton.textContent = "Login";
          }
        }
      } catch (err) {
        console.error("Login error:", err);
        
        // Show error message
        const errorMessage = document.getElementById("error-message");
        if (errorMessage) {
          errorMessage.textContent = "Could not connect to server.";
          errorMessage.style.display = "block";
        } else {
          alert("Could not connect to server.");
        }
        
        // Re-enable the button
        const submitButton = loginForm.querySelector('button[type="submit"]');
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.textContent = "Login";
        }
      }
    });
  }
  
  // Add logout functionality
  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      // Clear all stored user and card data
      localStorage.removeItem("userId");
      localStorage.removeItem("userName");
      localStorage.removeItem("userEmail");
      localStorage.removeItem("cardData");
      localStorage.removeItem("bannerImageDataUrl");
      localStorage.removeItem("profileImageDataUrl");
      localStorage.removeItem("cardUpdatedAt");
  
      // Optional: clear all localStorage (if you don't need anything persistent)
      // localStorage.clear();
  
      // Redirect to login page
      window.location.href = "login.html";
    });
  }
  
});

// Helper functions that can be called from other scripts
function isLoggedIn() {
  return !!localStorage.getItem("userId");
}

function requireAuth() {
  if (!isLoggedIn()) {
    window.location.href = "login.html";
    return false;
  }
  return true;
 }

function getCurrentUserId() {
  return localStorage.getItem("userId");
}

function getCurrentUserName() {
  return localStorage.getItem("userName");
}

function logout() {
  localStorage.removeItem("userId");
  localStorage.removeItem("userName");
  localStorage.removeItem("userEmail");
  localStorage.removeItem("cardData");
  localStorage.removeItem("bannerImageDataUrl");
  localStorage.removeItem("profileImageDataUrl");
  localStorage.removeItem("cardUpdatedAt");
  window.location.href = "login.html";
}
