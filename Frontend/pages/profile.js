document.addEventListener("DOMContentLoaded", function() {
  // Hardcoded user ID for testing - replace with localStorage approach when login is implemented
  const user = { id: "12345" }; // Keep this line for testing
  localStorage.setItem("userId", user.id); // Set it in localStorage for consistency
  
  const userId = user.id;
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
      const res = await fetch("http://localhost:9000/cards");
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
    
    const userDescElement = document.getElementById("user-desc");
    if (userDescElement) userDescElement.textContent = card.customBio || "";
    
    const userSchoolElement = document.getElementById("user-school");
    if (userSchoolElement) userSchoolElement.textContent = card.companyName || "";
    
    const userMajorElement = document.getElementById("user-major");
    if (userMajorElement) userMajorElement.textContent = card.jobTitle || "";
    
    const userGradElement = document.getElementById("user-grad");
    if (userGradElement) userGradElement.textContent = card.graduationInfo || "";

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
      
      // In a real implementation, you would also update the server
      /*
      const payload = {
        cardId,
        gradient
      };
      const response = await fetch("http://localhost:9000/update-business-cards", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      */
      
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
}