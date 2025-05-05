document.addEventListener("DOMContentLoaded", function () {
  console.log("🌐 edit.js running");
  setTimeout(() => window.scrollTo({ top: 0, behavior: "auto" }), 50);

  const userId = localStorage.getItem("userId");
  if (!userId) {
    alert("Not logged in.");
    window.location.href = "login.html";
    return;
  }

  let bannerImageDataUrl = localStorage.getItem("bannerImageDataUrl") || null;
  let profileImageDataUrl = localStorage.getItem("profileImageDataUrl") || null;
  let cardId = null;
  let websites = [];
  let socials = [];

  // Load card from localStorage
  const storedCardData = localStorage.getItem("cardData");
  if (storedCardData) {
    const card = JSON.parse(storedCardData);
    cardId = card.id;
    document.getElementById("nameInput").value = card.jobTitle || "";
    document.getElementById("usernameInput").value = card.companyName || "";
    document.getElementById("emailInput").value = card.email || "";
    document.getElementById("descInput").value = card.customBio || "";
    document.getElementById("experienceInput").value = card.experience || "";
    document.getElementById("educationInput").value = card.education || "";
    document.getElementById("projectsInput").value = card.projects || "";
    websites = card.websites || [];
    socials = card.socials || [];

    if (card.bannerImageUrl) {
      bannerImageDataUrl = card.bannerImageUrl;
      document.getElementById("bannerImage").src = bannerImageDataUrl;
    }

    if (card.profileImageUrl) {
      profileImageDataUrl = card.profileImageUrl;
      document.getElementById("profilePic").src = profileImageDataUrl;
    }

    if (card.gradient) {
      document.getElementById("gradientSelect").value = card.gradient;
      updateGradient(card.gradient);
    }
  }

  function updateGradient(gradient) {
    console.log("🎨 Applying gradient:", gradient);
    const gradients = {
      gradient1: "linear-gradient(45deg, #ff7e5f, #feb47b)",
      gradient2: "linear-gradient(45deg, #4ca1af, #c4e0e5)",
      gradient3: "linear-gradient(45deg, #2d3e50, #4d9e3e)",
      gradient4: "linear-gradient(45deg, #833ef2, #559cd6)",
    };
    document.body.style.background = gradients[gradient] || "black";
    document.body.style.backgroundAttachment = "fixed";
    document.body.style.backgroundRepeat = "no-repeat";
    document.body.style.backgroundSize = "cover";
  }

  function uploadImage(type) {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "image/*";

    fileInput.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const imageDataUrl = event.target.result;
          if (type === "banner") {
            document.getElementById("bannerImage").src = imageDataUrl;
            bannerImageDataUrl = imageDataUrl;
            localStorage.setItem("bannerImageDataUrl", imageDataUrl);
          } else {
            document.getElementById("profilePic").src = imageDataUrl;
            profileImageDataUrl = imageDataUrl;
            localStorage.setItem("profileImageDataUrl", imageDataUrl);
          }
        };
        reader.readAsDataURL(file);
      }
    };

    fileInput.click();
  }

  async function saveChanges() {
    const jobTitle = document.getElementById("nameInput").value;
    const companyName = document.getElementById("usernameInput").value;
    const email = document.getElementById("emailInput").value;
    const customBio = document.getElementById("descInput").value;
    const education = document.getElementById("educationInput").value;
    const experience = document.getElementById("experienceInput").value;
    const projects = document.getElementById("projectsInput").value;
    const gradient = document.getElementById("gradientSelect").value;

    const payload = {
      jobTitle,
      companyName,
      phoneNumber: "0000000000", // placeholder
      email,
      customBio,
      education,
      experience,
      projects,
      gradient,
      userId: Number(userId),
      websites,
      socials,
      bannerImageUrl: bannerImageDataUrl,
      profileImageUrl: profileImageDataUrl,
    };

    if (cardId) payload.cardId = cardId;

    console.log("📤 Sending card payload:", payload);

    try {
      const res = await fetch(`http://localhost:9000/${cardId ? "update-business-cards" : "create-business-card"}`, {
        method: cardId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (!res.ok) throw new Error(result.error || "Failed to save card");

      localStorage.setItem("cardData", JSON.stringify(result));
      localStorage.setItem("cardUpdatedAt", new Date().toISOString());
      alert("✅ Profile saved!");
      window.location.href = "profile.html";
    } catch (err) {
      console.error("❌ Error saving card:", err);
      alert("Error saving card.");
    }
  }

  function setupEventListeners() {
    document.getElementById("gradientSelect")?.addEventListener("change", e => updateGradient(e.target.value));
    document.getElementById("bannerUploadBtn")?.addEventListener("click", () => uploadImage("banner"));
    document.getElementById("profilePicUploadBtn")?.addEventListener("click", () => uploadImage("profile"));
    document.getElementById("saveBtn")?.addEventListener("click", saveChanges);
  }

  setupEventListeners();
});
