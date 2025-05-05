document.addEventListener("DOMContentLoaded", function() {
  const userId = localStorage.getItem("userId"); // Set it in localStorage for consistency

  if (!userId) {
    alert("Not logged in.");
    window.location.href = "login.html";
    return;
  }

  // Setup event listeners
  setupEventListeners();
  
  // Check for updates from other tabs
  window.addEventListener('storage', (event) => {
    if (event.key === 'cardUpdatedAt') {
      console.log("Card update detected from another tab");
      // Reload card data from localStorage
      loadCardFromStorage();
    }
  });

  // Initial load of card data
  loadCardData();
  
  
  function setupEventListeners() {
    // Handle gradient change
    const gradientSelect = document.getElementById("gradientSelect");
    if (gradientSelect) {
      gradientSelect.addEventListener("change", function() {
        updateGradient(this.value);
        
        // Save gradient preference if we have cardId
        if (window.cardData && window.cardData.id) {
          saveGradientPreference(window.cardData.id, this.value);
        }
      });
    }
    
    // QR code button toggle functionality
    const qrButton = document.getElementById('qrButton');
    if (qrButton) {
      qrButton.addEventListener('click', function() {
        const qrContainer = document.getElementById('qrcode-container');
        if (qrContainer.style.display === 'none' || qrContainer.style.display === '') {
          qrContainer.style.display = 'block';
          this.textContent = 'Hide QR Code';
        } else {
          qrContainer.style.display = 'none';
          this.textContent = 'Show QR Code';
        }
      });
    }
  }

  async function loadCardData() {
    try {
      // First try to load from localStorage for instant display
      if (loadCardFromStorage()) {
        // If successful, still fetch from server in background for latest data
        fetchCardFromServer();
      } else {
        // If no localStorage data, fetch from server
        await fetchCardFromServer();
      }
    } catch (err) {
      console.error("Error loading card:", err);
      alert("Unable to load profile data.");
    }
  }

  function loadCardFromStorage() {
    const cardDataStr = localStorage.getItem("cardData");
    if (cardDataStr) {
      try {
        const card = JSON.parse(cardDataStr);
        displayCardData(card);
        window.cardData = card; // Store for later use
        return true;
      } catch (e) {
        console.error("Error parsing card data from localStorage:", e);
        return false;
      }
    }
    return false;
  }

  async function fetchCardFromServer() {
    try {
      console.log("Fetching card data from server for user:", userId);
      const res = await fetch(`http://localhost:9000/scrollodex/${userId}`);
      const cards = await res.json();
      const card = cards.find(c => c.user.id == userId);

      if (!card) {
        console.warn("No business card found for user.");
        return false;
      }

      // Display and store the fetched data
      console.log("Card data fetched:", card);
      displayCardData(card);
      window.cardData = card;
      localStorage.setItem("cardData", JSON.stringify(card));
      return true;
    } catch (e) {
      console.error("Error fetching from server:", e);
      return false;
    }
  }

  function displayCardData(card) {
    // Update all UI elements with card data
    const userNameElement = document.getElementById("user-name");
    if (userNameElement) userNameElement.textContent = card.user?.name || "";
    
    const usernameElement = document.getElementById("username");
    if (usernameElement) usernameElement.textContent = card.user?.username || "";
    
    const userEmailElement = document.getElementById("user-email");
    if (userEmailElement) userEmailElement.textContent = card.email || "";

    const userDescElement = document.getElementById("user-desc");
    if (userDescElement) userDescElement.textContent = card.customBio || "";
    
    const userExperienceElement = document.getElementById("user-experience");
    if (userExperienceElement) userExperienceElement.textContent = card.experience || "";
    
    const userEducationElement = document.getElementById("user-education");
    if (userEducationElement) userEducationElement.textContent = card.education || "";
    
    const userProjectsElement = document.getElementById("user-projects");
    if (userProjectsElement) userProjectsElement.textContent = card.projects || "";

    // Handle banner image
    if (card.bannerImageUrl) {
      const bannerImage = document.getElementById("bannerImage");
      if (bannerImage) {
        bannerImage.src = card.bannerImageUrl;
      }
    }

    // Handle profile image
    if (card.profileImageUrl) {
      const profilePic = document.getElementById("profilePic");
      if (profilePic) {
        profilePic.src = card.profileImageUrl;
      }
    }

    // Handle gradient
    if (card.gradient) {
      const gradientSelect = document.getElementById("gradientSelect");
      if (gradientSelect) {
        gradientSelect.value = card.gradient;
      }
      updateGradient(card.gradient);
    }

    // Generate QR code if the container exists
    const qrContainer = document.getElementById('qrcode');
    if (qrContainer) {
      generateQRCode(card);
    }
  }

  function generateQRCode(card) {
    const qrContainer = document.getElementById('qrcode');
    if (!qrContainer) return;
    
    qrContainer.innerHTML = ''; // Clear existing QR code
    
    // Create QR code with user data
    const qrData = {
      name: card.user?.name || "",
      username: card.user?.username || "",
      bio: card.customBio || "",
      school: card.companyName || "",
      major: card.jobTitle || "",
      graduation: card.graduationInfo || ""
    };
    
    if (typeof QRCode !== 'undefined') {
      new QRCode(qrContainer, {
        text: JSON.stringify(qrData),
        width: 180,
        height: 180,
        colorDark: "#000000",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H
      });
    }
  }

  async function saveGradientPreference(cardId, gradient) {
    try {
      console.log("Saving gradient preference:", gradient);
      
      // Update localStorage
      const cardData = JSON.parse(localStorage.getItem("cardData") || "{}");
      cardData.gradient = gradient;
      localStorage.setItem("cardData", JSON.stringify(cardData));

      // Notify other tabs
      localStorage.setItem("cardUpdatedAt", new Date().toISOString());
      
      console.log("Gradient preference saved successfully");
    } catch (e) {
      console.error("Error saving gradient preference:", e);
    }
  }
});

function updateGradient(selectedGradient) {
  console.log("Updating gradient to:", selectedGradient);
  switch (selectedGradient) {
    case 'gradient1': document.body.style.background = 'linear-gradient(45deg, #ff7e5f, #feb47b)'; break;
    case 'gradient2': document.body.style.background = 'linear-gradient(45deg, #4ca1af, #c4e0e5)'; break;
    case 'gradient3': document.body.style.background = 'linear-gradient(45deg, #2d3e50, #4d9e3e)'; break;
    case 'gradient4': document.body.style.background = 'linear-gradient(45deg, #833ef2, #559cd6)'; break;
  }

  document.body.style.backgroundAttachment = 'fixed';
  document.body.style.backgroundRepeat = 'no-repeat';
  document.body.style.backgroundSize = 'cover';
}