document.addEventListener("DOMContentLoaded", async () => {
  const userId = localStorage.getItem("userId");
  if (!userId) return alert("User not logged in");

  try {
    // Get user's business card
    const res = await fetch("http://localhost:5432/cards");
    const cards = await res.json();
    const card = cards.find(c => c.user.id == userId);

    if (!card) return alert("Card not found");

    const qrRes = await fetch(`http://localhost:5432/cards/${card.id}/qr`);
    const data = await qrRes.json();

    const img = document.createElement("img");
    img.src = data.qrImage;
    img.alt = "QR Code";
    img.style.width = "200px";

    document.getElementById("qrcode").appendChild(img);
  } catch (error) {
    console.error("Error loading QR code:", error);
    alert("Could not generate QR code.");
  }
});