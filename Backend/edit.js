document.addEventListener("DOMContentLoaded", async () => {
  localStorage.setItem("userId", user.id);

  if (!userId) {
    alert("Not logged in.");
    window.location.href = "login.html";
    return;
  }

  let cardId = null;
  let websites = [];
  let socials = [];

  try {
    const res = await fetch("http://localhost:9000/cards");
    const cards = await res.json();
    const card = cards.find(c => c.user.id == userId);

    if (!card) {
      alert("No business card found.");
      return;
    }

    cardId = card.id;
    websites = card.websites || [];
    socials = card.socials || [];

    // Pre-fill form
    document.getElementById("nameInput").value = card.user.name || "";
    document.getElementById("bioInput").value = card.customBio || "";
    document.getElementById("emailInput").value = card.user.email || "";
    document.getElementById("phoneInput").value = card.phoneNumber || "";
    document.getElementById("experienceInput").value = card.jobTitle || "";
    document.getElementById("educationInput").value = card.companyName || "";
    document.getElementById("projectsInput").value = websites.length > 0 ? (websites[0].url || "") : "";

    if (card.gradient) {
      document.getElementById("gradientSelect").value = card.gradient;
      updateGradient(card.gradient);
    }

    // Save button logic
    window.saveChanges = async () => {
      const name = document.getElementById("nameInput").value;
      const bio = document.getElementById("bioInput").value;
      const email = document.getElementById("emailInput").value;
      const phone = document.getElementById("phoneInput").value;
      const experience = document.getElementById("experienceInput").value;
      const education = document.getElementById("educationInput").value;
      const projectUrl = document.getElementById("projectsInput").value;
      const gradient = document.getElementById("gradientSelect").value;

      const payload = {
        cardId,
        jobTitle: experience,
        companyName: education,
        phoneNumber: phone,
        customBio: bio,
        gradient,
        websites: websites.length > 0
          ? [{ id: websites[0].id, url: projectUrl, label: "Project" }]
          : [{ url: projectUrl, label: "Project" }],
        socials
      };

      try {
        const response = await fetch("http://localhost:9000/update-business-cards", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });

        if (response.ok) {
          const userUpdatePayload = { id: userId, name, email };

          const userResponse = await fetch("http://localhost:9000/update-user", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(userUpdatePayload)
          });

          if (!userResponse.ok) {
            console.warn("User update failed, but card updated.");
          }

          // 📦 Sync to localStorage
          const updatedCard = {
            ...card,
            user: { ...card.user, name, email },
            jobTitle: experience,
            companyName: education,
            phoneNumber: phone,
            customBio: bio,
            gradient,
            websites: [{ ...websites[0], url: projectUrl, label: "Project" }],
            socials
          };
          localStorage.setItem("cardData", JSON.stringify(updatedCard));

          // 🔁 Notify other tabs/pages using localStorage + event
          localStorage.setItem("cardUpdatedAt", new Date().toISOString()); // acts as a signal

          alert("Profile updated successfully!");
          window.location.href = "profile.html"; // optional: remove if you want to stay on edit page
        } else {
          const error = await response.json();
          alert(`Update failed: ${error.message || "Unknown error"}`);
        }
      } catch (e) {
        console.error("Error updating profile:", e);
        alert("An error occurred while updating your profile.");
      }
    };

  } catch (err) {
    console.error("Error loading card:", err);
    alert("Unable to load profile data.");
  }
});

function updateGradient(selectedGradient) {
  switch (selectedGradient) {
    case 'gradient1': document.body.style.background = 'linear-gradient(45deg, #d33d3d, #f2833e)'; break;
    case 'gradient2': document.body.style.background = 'linear-gradient(45deg, #4ca1af, #c4e0e5)'; break;
    case 'gradient3': document.body.style.background = 'linear-gradient(45deg, #2d3e50, #4d9e3e)'; break;
    case 'gradient4': document.body.style.background = 'linear-gradient(45deg, #833ef2, #559cd6)'; break;
  }
}
