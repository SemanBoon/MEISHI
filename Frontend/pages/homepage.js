// written by: Yezan and Sewa
// tested by: Yezan and Sewa
// debugged by: Yezan and Sewa

document.addEventListener("DOMContentLoaded", () => {
  // Get the status message element
  const statusMessage = document.getElementById("status-message");
  if (!statusMessage) return;
  
  // Add CSS styles for the welcome container
  const styleElement = document.createElement('style');
  styleElement.textContent = `
    .welcome-container {
      text-align: center;
      margin: 15px auto;
      width: 100%;
      position: relative; /* Ensures it moves properly */
      top: -30px; /* Moves it upwards */
    }

    #status-message {
      font-size: 24px;
      font-weight: 500;
      color: #FFFFFF;
      margin: 0;
    }
  `;
  document.head.appendChild(styleElement);
  
  // Try to get user data from localStorage first (set by profile.js)
  const storedCardData = localStorage.getItem("cardData");
  
  if (storedCardData) {
    try {
      // Parse the stored card data
      const cardData = JSON.parse(storedCardData);
      // Get the user's name from the stored data
      const userName = cardData.user?.name || "User";
      
      // Display the welcome message with the user's name
      statusMessage.innerHTML = `Welcome, <span style="color: #076aff;">${userName}</span>`;

    } catch (err) {
      console.error("Error parsing stored card data:", err);
      statusMessage.textContent = "Welcome";
    }
  } else {
    // If no stored data exists, display a generic welcome message
    statusMessage.textContent = "Welcome to MEISHI";
    console.log("No stored card data found");
  }
});