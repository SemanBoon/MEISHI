document.addEventListener("DOMContentLoaded", function () {
  setTimeout(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, 50);  

  // Load existing card data from localStorage
  const storedCardData = localStorage.getItem("cardData");
  let bannerImageDataUrl = localStorage.getItem("bannerImageDataUrl") || null;
  let profileImageDataUrl = localStorage.getItem("profileImageDataUrl") || null;

  const userId = localStorage.getItem("userId"); 
  if (!userId) {
    alert("Not logged in.");
    window.location.href = "login.html";
    return;
  }

  let cardId = null;
  let websites = [];
  let socials = [];

  if (storedCardData) {
    const card = JSON.parse(storedCardData);
    cardId = card.id;

    document.getElementById("nameInput").value = card.user.name || "";
    document.getElementById("usernameInput").value = card.user.username || "";
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

  function updateGradient(selectedGradient) {
    console.log("Updating gradient to:", selectedGradient);
    switch (selectedGradient) {
      case 'gradient1':
        document.body.style.background = 'linear-gradient(45deg, #ff7e5f, #feb47b)';
        break;
      case 'gradient2':
        document.body.style.background = 'linear-gradient(45deg, #4ca1af, #c4e0e5)';
        break;
      case 'gradient3':
        document.body.style.background = 'linear-gradient(45deg, #2d3e50, #4d9e3e)';
        break;
      case 'gradient4':
        document.body.style.background = 'linear-gradient(45deg, #833ef2, #559cd6)';
        break;
    }
    document.body.style.backgroundAttachment = 'fixed';
    document.body.style.backgroundRepeat = 'no-repeat';
    document.body.style.backgroundSize = 'cover';
  }

  function uploadImage(type) {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "image/*";

    fileInput.onchange = function (e) {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function (event) {
          const imageDataUrl = event.target.result;

          if (type === "banner") {
            document.getElementById("bannerImage").src = imageDataUrl;
            bannerImageDataUrl = imageDataUrl;
            localStorage.setItem("bannerImageDataUrl", imageDataUrl);
          } else if (type === "profile") {
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

  function saveChanges() {
    const name = document.getElementById("nameInput").value;
    const username = document.getElementById("usernameInput").value;
    const email = document.getElementById("emailInput").value;
    const bio = document.getElementById("descInput").value;
    const education = document.getElementById("educationInput").value;
    const experience = document.getElementById("experienceInput").value;
    const projects = document.getElementById("projectsInput").value;
    const gradient = document.getElementById("gradientSelect").value;

    localStorage.setItem("userName", username);

    const updatedCard = {
      id: cardId || "test-card-id",
      user: { id: userId, name, username },
      email,
      customBio: bio,
      education,
      experience,
      projects,
      gradient,
      websites,
      socials,
      bannerImageUrl: bannerImageDataUrl,
      profileImageUrl: profileImageDataUrl
    };

    localStorage.setItem("cardData", JSON.stringify(updatedCard));
    localStorage.setItem("cardUpdatedAt", new Date().toISOString());

    alert("Profile updated successfully!");
    window.location.href = "profile.html";
  }

  function setupEventListeners() {
    const gradientSelect = document.getElementById("gradientSelect");
    if (gradientSelect) {
      gradientSelect.addEventListener("change", function () {
        updateGradient(this.value);
      });
    }

    const bannerUploadBtn = document.getElementById("bannerUploadBtn");
    if (bannerUploadBtn) {
      bannerUploadBtn.addEventListener("click", function () {
        uploadImage("banner");
      });
    }

    const profilePicUploadBtn = document.getElementById("profilePicUploadBtn");
    if (profilePicUploadBtn) {
      profilePicUploadBtn.addEventListener("click", function () {
        uploadImage("profile");
      });
    }

    const saveBtn = document.getElementById("saveBtn");
    if (saveBtn) {
      saveBtn.addEventListener("click", saveChanges);
    }
  }

  setupEventListeners();
});
