require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const express = require('express');
const http = require('http');
const cors = require('cors');
const bcrypt = require('bcrypt');
const app = express();
const server = http.createServer(app);
const QRCode = require('qrcode');

app.use(express.json());
app.use(cors())

const path = require('path');
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5432;


server.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`); //this concole.log is essential because it shows me that the backend is running and that it's running on the right port.
});

//initial landing page"
app.get("/", (req, res) => {
    res.send("Initial Selection Page");
});

// Signup as a new user
app.post("/user-signup", async (req, res) => {
    const { name, email, birthday } = req.body;
    try {
        const existingUser = await prisma.user.findUnique({
            where: {
                email: {
                    equals: email,
                    mode: 'insensitive',
                },
            }
        });
        if (existingUser) {
            return res.status(400).json({ error: "Email already in use" });
        }
        const newUser = await prisma.user.create({
            data: {
                name,
                email,
                birthday: birthday ? new Date(birthday) : null,
            },
        });
        res.status(200).json(newUser);
    } catch (e) {
        res.status(500).json({ error: e.message });
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

// Create a new business card for a user
app.post('/create-business-card', async (req, res) => {
    try {
        const { jobTitle,
            companyName,
            phoneNumber,
            websites,
            socials,
            customBio,
            userId
        } = req.body;

        // Verify user exists first
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const newCard = await prisma.businessCard.create({
            data: {
                jobTitle,
                companyName,
                phoneNumber,
                websites: {
                    create: websites,
                },
                socials: {
                    create: socials,
                },
                customBio,
                userId
            }
        });
        res.status(201).json(newCard);
    } catch (error) {
        console.error('Error creating business card:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

//get all business cards
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


//api for homepage"
app.get('/homepage/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const profile = await prisma.user.findUnique({
            where: { id },
        });
        res.send(`Welcome to the MEISHI, ${profile.name}`);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});


// Update/edit business card
app.put('/update-business-cards', async (req, res) => {
    const {
        jobTitle,
        companyName,
        phoneNumber,
        websites,
        socials,
        customBio,
        cardId
    } = req.body;

    const data = {};
    if (jobTitle !== undefined) data.jobTitle = jobTitle;
    if (customBio !== undefined) data.customBio = customBio;
    if (companyName !== undefined) data.companyName = companyName;
    if (phoneNumber !== undefined) data.phoneNumber = phoneNumber;

    if (websites && Array.isArray(websites)) {
        data.websites = {
            update: websites.map(site => ({
                where: { id: site.id },
                data: {
                    url: site.url,
                    label: site.label
                }
            }))
        };
    }

    if (socials && Array.isArray(socials)) {
        data.socials = {
            update: socials.map(social => ({
                where: { id: social.id },
                data: {
                    url: social.url,
                    platform: social.platform
                }
            }))
        };
    }

    try {
        const updatedProfile = await prisma.businessCard.update({
            where: { id: cardId },
            data,
        });
        res.json(updatedProfile);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

//generate qr code
app.get('/cards/:id/qr', async (req, res) => {
    try {
        const cardId = parseInt(req.params.id);
        const card = await prisma.businessCard.findUnique({
            where: { id: cardId },
            include: { user: true, websites: true, socials: true }  // Include user details
        });

        if (!card) {
            return res.status(404).json({ error: 'Card not found' });
        }

        // Data to encode in QR (e.g., card details or a shareable link)
        const qrData = JSON.stringify({
            cardId: card.id,
            userName: card.user.name,
            userEmail: card.user.email,
            jobTitle: card.jobTitle,
            companyName: card.companyName,
            phoneNumber: card.phoneNumber,
            websites: card.websites,
            socials: card.socials,
            customBio: card.customBio
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
            where: { id: cardId },
            include: {
                websites: true,
                socials: true
            }
        });
        if (!card) {
            return res.status(404).json({ error: 'Card not found' });
        }

        // Create a copy in the recipient's rolodex
        const sharedCard = await prisma.businessCard.create({
            data: {
                jobTitle: card.jobTitle,
                companyName: card.companyName,
                phoneNumber: card.phoneNumber,
                customBio: card.customBio,
                userId: recipientUserId,
                websites: {
                    create: card.websites.map(w => ({
                        url: w.url,
                        label: w.label
                    }))
                },
                socials: {
                    create: card.socials.map(s => ({
                        url: s.url,
                        platform: s.platform
                    }))
                }
                // Assign to recipient
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
            jobTitle: card.jobTitle,
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