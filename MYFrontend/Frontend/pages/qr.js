document.addEventListener("DOMContentLoaded", () => {
  const qrButton = document.getElementById("generateQR");
  const qrContainer = document.getElementById("qrcode");

  qrButton.addEventListener("click", () => {
    // Clear any existing QR code
    qrContainer.innerHTML = "";

    // Generate a URL based on the current profile (you can customize this)
    const profileURL = window.location.href;

    // Create QR code
    new QRCode(qrContainer, {
      text: profileURL,
      width: 160,
      height: 160,
      colorDark: "#000000",
      colorLight: "#ffffff",
      correctLevel: QRCode.CorrectLevel.H
    });
  });
});
