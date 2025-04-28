document.addEventListener('DOMContentLoaded', () => {
    const statusMessage = document.getElementById('status-message');
    
    // Get userId from localStorage (set during login)
    const userId = localStorage.getItem('userId') || '1'; // Default to 1 for testing
    
    // Fetch the welcome message from backend
    fetch(`http://localhost:5432/homepage/${userId}`)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.text();
      })
      .then(data => {
        // Update the welcome message
        statusMessage.textContent = data;
        console.log('Welcome message:', data);
      })
      .catch(err => {
        console.error('Error fetching data:', err);
        statusMessage.textContent = 'Unable to connect to server.';
      });
  });