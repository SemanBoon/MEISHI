document.addEventListener("DOMContentLoaded", function() {
  // Load existing card data from localStorage
  const storedCardData = localStorage.getItem("cardData");
  let bannerImageDataUrl = localStorage.getItem("bannerImageDataUrl") || null;
  let profileImageDataUrl = localStorage.getItem("profileImageDataUrl") || null;
  
  // Hardcoded user ID for testing - replace with localStorage approach when login is implemented
  const user = { id: "12345" }; // Keep this line for testing
  localStorage.setItem("userId", user.id); // Set it in localStorage for consistency
  
  const userId = user.id; // Use the hardcoded ID
  if (!userId) {
    alert("Not logged in.");
    window.location.href = "login.html";
    return;
  }
  
  let cardId = null;
  let websites = [];
  let socials = [];
  
  // Populate form if data exists
  if (storedCardData) {
    const card = JSON.parse(storedCardData);
    cardId = card.id;
    
    document.getElementById("nameInput").value = card.user.name || "";
    document.getElementById("usernameInput").value = card.user.username || "";
    document.getElementById("descInput").value = card.customBio || "";
    document.getElementById("schoolInput").value = card.companyName || "";
    document.getElementById("majorInput").value = card.jobTitle || "";
    document.getElementById("gradInput").value = card.graduationInfo || "";
    
    websites = card.websites || [];
    socials = card.socials || [];
    
    // Set banner image if available
    if (card.bannerImageUrl) {
      bannerImageDataUrl = card.bannerImageUrl;
      document.getElementById("bannerImage").src = bannerImageDataUrl;
    }
    
    // Set profile image if available
    if (card.profileImageUrl) {
      profileImageDataUrl = card.profileImageUrl;
      document.getElementById("profilePic").src = profileImageDataUrl;
    }
    
    // Set gradient if available
    if (card.gradient) {
      document.getElementById("gradientSelect").value = card.gradient;
      updateGradient(card.gradient);
    }
  }
    window.saveChanges = function() {
    const name = document.getElementById("nameInput").value;
    const username = document.getElementById("usernameInput").value;
    const bio = document.getElementById("descInput").value;
    const school = document.getElementById("schoolInput").value;
    const major = document.getElementById("majorInput").value;
    const graduation = document.getElementById("gradInput").value;
    const gradient = document.getElementById("gradientSelect").value;
    
    // Create updated card object
    const updatedCard = {
      id: cardId || "test-card-id",
      user: { 
        id: userId,
        name, 
        username 
      },
      jobTitle: major,
      companyName: school,
      graduationInfo: graduation,
      customBio: bio,
      gradient,
      websites,
      socials,
      bannerImageUrl: bannerImageDataUrl,
      profileImageUrl: profileImageDataUrl
    };
    
    // Store in localStorage
    localStorage.setItem("cardData", JSON.stringify(updatedCard));
    
    // Notify other tabs/pages that data has changed
    localStorage.setItem("cardUpdatedAt", new Date().toISOString());
    
    alert("Profile updated successfully!");
    window.location.href = "profile.html";
  };

function updateGradient(selectedGradient) {
  console.log("Updating gradient to:", selectedGradient);
  switch (selectedGradient) {
    case 'gradient1': document.body.style.background = 'linear-gradient(45deg, #ff7e5f, #feb47b)'; break;
    case 'gradient2': document.body.style.background = 'linear-gradient(45deg, #4ca1af, #c4e0e5)'; break;
    case 'gradient3': document.body.style.background = 'linear-gradient(45deg, #2d3e50, #4d9e3e)'; break;
    case 'gradient4': document.body.style.background = 'linear-gradient(45deg, #833ef2, #559cd6)'; break;
  }
}
  // Setup event listeners
  setupEventListeners();
  
  function setupEventListeners() {
    // Gradient selector
    const gradientSelect = document.getElementById("gradientSelect");
    if (gradientSelect) {
      gradientSelect.addEventListener("change", function() {
        updateGradient(this.value);
      });
    }
    
    // Banner upload
    const bannerUploadBtn = document.getElementById("bannerUploadBtn");
    if (bannerUploadBtn) {
      bannerUploadBtn.addEventListener("click", function() {
        uploadImage("banner");
      });
    }
    
    // Profile pic upload
    const profilePicUploadBtn = document.getElementById("profilePicUploadBtn");
    if (profilePicUploadBtn) {
      profilePicUploadBtn.addEventListener("click", function() {
        uploadImage("profile");
      });
    }
    
    // Save button
    const saveBtn = document.getElementById("saveBtn");
    if (saveBtn) {
      saveBtn.addEventListener("click", saveChanges);
    }
  }
  
  function uploadImage(type) {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "image/*";
    
    fileInput.onchange = function(e) {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
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
});