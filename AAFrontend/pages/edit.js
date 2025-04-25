document.addEventListener("DOMContentLoaded", async () => {
  const userId = localStorage.getItem("userId");
  if (!userId) {
    alert("Not logged in.");
    window.location.href = "login.html";
    return;
  }

  try {
    // Get user's business card
    const res = await fetch("http://localhost:5432/cards");
    const cards = await res.json();
    const card = cards.find(c => c.user.id == userId);

    if (!card) return alert("No business card found.");

    // Pre-fill fields
    document.getElementById("nameInput").value = card.user.name || "";
    document.getElementById("bioInput").value = card.customBio || "";
    document.getElementById("emailInput").value = card.user.email || "";
    document.getElementById("phoneInput").value = card.phoneNumber || "";
    document.getElementById("experienceInput").value = card.jobTitle || "";
    document.getElementById("educationInput").value = card.companyName || "";
    document.getElementById("projectsInput").value = (card.websites[0]?.url || "").substring(0, 100);

    // Update logic
    window.saveChanges = async () => {
      const name = document.getElementById("nameInput").value;
      const bio = document.getElementById("bioInput").value;
      const email = document.getElementById("emailInput").value;
      const phone = document.getElementById("phoneInput").value;
      const experience = document.getElementById("experienceInput").value;
      const education = document.getElementById("educationInput").value;
      const projectUrl = document.getElementById("projectsInput").value;

      const payload = {
        cardId: card.id,
        jobTitle: experience,
        companyName: education,
        phoneNumber: phone,
        customBio: bio,
        websites: [{ id: card.websites[0]?.id, url: projectUrl, label: "Project" }],
        socials: []
      };

      try {
        const updateRes = await fetch("http://localhost:5432/update-business-cards", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });

        if (updateRes.ok) {
          alert("Profile updated!");
          window.location.href = "profile.html";
        } else {
          alert("Update failed.");
        }
      } catch (e) {
        console.error("Error updating card:", e);
        alert("Server error.");
      }
    };

  } catch (err) {
    console.error("Error loading card:", err);
    alert("Unable to load profile data.");
  }
});