document.addEventListener("DOMContentLoaded", async () => {
  const userId = localStorage.getItem("userId");
  if (!userId) {
    alert("User not logged in.");
    window.location.href = "login.html";
    return;
  }

  try {
    const res = await fetch(`http://localhost:5432/homepage/${userId}`);
    const text = await res.text();
    document.getElementById("user-name").textContent = text;
  } catch (error) {
    console.error("Failed to load profile:", error);
    alert("Could not load profile info.");
  }
});

