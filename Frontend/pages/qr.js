document.addEventListener("DOMContentLoaded", () => {
  const userId = localStorage.getItem("userId");
  const userName = localStorage.getItem("userName") || "YourNameHere";

  const qrContainer = document.getElementById("qrcode");
  const usernameDisplay = document.getElementById("username");
  const shareBtn = document.getElementById("share-btn");
  const copyBtn = document.getElementById("copy-btn");
  const downloadBtn = document.getElementById("download-btn");

  usernameDisplay.textContent = userName;

  if (!userId) {
    alert("User not logged in.");
    return;
  }

  const pdfUrl = `http://localhost:5432/pdf/${userId}`;

  // Generate QR Code
  new QRCode(qrContainer, {
    text: pdfUrl,
    width: 200,
    height: 200,
    colorDark: "#000000",
    colorLight: "#ffffff",
    correctLevel: QRCode.CorrectLevel.H
  });

  // Copy link
  copyBtn?.addEventListener("click", () => {
    navigator.clipboard.writeText(pdfUrl).then(() => {
      alert("PDF link copied to clipboard!");
    }).catch(() => {
      alert("Failed to copy link.");
    });
  });

  // Download link
  downloadBtn?.addEventListener("click", () => {
    const link = document.createElement("a");
    link.href = pdfUrl;
    link.download = `MEISHI_Profile_${userId}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });

  // Share with Web Share API
  shareBtn?.addEventListener("click", async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "My MEISHI Profile",
          text: "Check out my MEISHI business card!",
          url: pdfUrl
        });
      } catch (err) {
        alert("Share cancelled or failed.");
      }
    } else {
      alert("Web Share API not supported on this browser.");
    }
  });
});
