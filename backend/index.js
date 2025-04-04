require('dotenv').config(); // Load environment variables from .env
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const cors = require('cors'); // For frontend-backend communication

// Initialize Express and Prisma
const app = express();
const prisma = new PrismaClient();

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Parse JSON bodies

// Health Check Endpoint
app.get('/', (req, res) => {
  res.status(200).json({ status: 'MEISHI Backend is running!' });
});

// ------------------
// USER ROUTES
// ------------------

// Create a new user
app.post('/users', async (req, res) => {
  try {
    const { email, name } = req.body;
    const newUser = await prisma.user.create({
      data: { email, name }
    });
    res.status(201).json(newUser);
  } catch (error) {
    console.error('Error creating user:', error);
    if (error.code === 'P2002') { // Prisma unique constraint error
      res.status(409).json({ error: 'Email already exists' });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

// Get all users with their cards
app.get('/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      include: { cards: true } // Include related business cards
    });
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ------------------
// BUSINESS CARD ROUTES
// ------------------

// Create a new business card for a user
app.post('/cards', async (req, res) => {
  try {
    const { title, userId } = req.body;
    
    // Verify user exists first
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const newCard = await prisma.businessCard.create({
      data: { title, userId }
    });
    res.status(201).json(newCard);
  } catch (error) {
    console.error('Error creating business card:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all business cards with user info
app.get('/cards', async (req, res) => {
  try {
    const cards = await prisma.businessCard.findMany({
      include: { user: true } // Include related user data
    });
    res.status(200).json(cards);
  } catch (error) {
    console.error('Error fetching business cards:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ------------------
// SERVER SETUP
// ------------------

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// Handle shutdown gracefully
process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

// Add this route to view all users in browser
app.get('/users-page', async (req, res) => {
    const users = await prisma.user.findMany({
      include: { cards: true }
    });
    res.send(`
      <h1>Users</h1>
      <pre>${JSON.stringify(users, null, 2)}</pre>
    `);
  });

  const QRCode = require('qrcode');

// Generate QR Code for a business card

//When a user clicks "Share", your frontend calls /cards/:id/qr.

app.get('/cards/:id/qr', async (req, res) => {
  try {
    const cardId = parseInt(req.params.id);
    const card = await prisma.businessCard.findUnique({
      where: { id: cardId },
      include: { user: true }  // Include user details
    });

    if (!card) {
      return res.status(404).json({ error: 'Card not found' });
    }

    // Data to encode in QR (e.g., card details or a shareable link)
    const qrData = JSON.stringify({
      cardId: card.id,
      title: card.title,
      userName: card.user.name,
      userEmail: card.user.email
    });

    // Generate QR as a PNG image
    const qrImage = await QRCode.toDataURL(qrData);
    res.json({ qrImage, cardDetails: card });  // Send QR + card data

  } catch (error) {
    res.status(500).json({ error: 'Failed to generate QR code' });
  }
});

// Add a shared card to another user's rolodex
app.post('/cards/share', async (req, res) => {
    try {
      const { cardId, recipientUserId } = req.body;
  
      // Verify the card exists
      const card = await prisma.businessCard.findUnique({
        where: { id: cardId }
      });
      if (!card) {
        return res.status(404).json({ error: 'Card not found' });
      }
  
      // Create a copy in the recipient's rolodex
      const sharedCard = await prisma.businessCard.create({
        data: {
          title: card.title,
          userId: recipientUserId  // Assign to recipient
        }
      });
  
      res.status(201).json(sharedCard);
  
    } catch (error) {
      res.status(500).json({ error: 'Failed to share card' });
    }
  });

// to get the QR code image, as well as the shareable link
app.get('/cards/:id/share', async (req, res) => {
    try {
      const cardId = parseInt(req.params.id);
      const card = await prisma.businessCard.findUnique({
        where: { id: cardId },
        include: { user: true }
      });
  
      if (!card) {
        return res.status(404).json({ error: 'Card not found' });
      }
  
      // Generate QR code (as before)
      const qrData = JSON.stringify({
        cardId: card.id,
        title: card.title,
        user: card.user.name
      });
      const qrImage = await QRCode.toDataURL(qrData);
  
      // Create a shareable link
      const shareableLink = `http://yourdomain.com/card/${card.id}`; // Replace with your frontend URL
  
      res.json({
        qrImage,
        shareableLink, // Send both to frontend
        cardDetails: card
      });
  
    } catch (error) {
      res.status(500).json({ error: 'Failed to generate share options' });
    }
  });