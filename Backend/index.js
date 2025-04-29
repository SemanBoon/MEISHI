require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const express = require('express');
const http = require('http');
const cors = require('cors');
const bcrypt = require('bcrypt');
const app = express();
app.use(express.static('Frontend'));
const server = http.createServer(app);
const QRCode = require('qrcode');
module.exports = app;


app.use(express.json());
app.use(cors())

const path = require('path');
const prisma = new PrismaClient();
const PORT = process.env.PORT || 9000;


server.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`); //this concole.log is essential because it shows me that the backend is running and that it's running on the right port.
});

//initial landing page"
app.get("/", (req, res) => {
    res.send("Initial Selection Page");
});


app.post('/user-signup', async (req, res) => {
    const { name, email, birthday, password } = req.body;

    try {
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: 'Email already in use' });
        }

        const hashedPassword = await bcrypt.hash(password, 10); // 

        const newUser = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword, 
                birthday: birthday ? new Date(birthday) : null
            }
        });

        res.status(200).json(newUser);
    } catch (e) {
        console.error('Signup error:', e);
        res.status(500).json({ error: 'Internal server error' });
    }
});


app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        res.status(200).json({ message: 'Login successful', user });
    } catch (error) {
        console.error('Login error:', error);
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

// Get all users with their cards
// app.get('/users', async (req, res) => {
//     try {
//         const users = await prisma.user.findMany({
//             include: { cards: true } // Include related business cards
//         });
//         res.status(200).json(users);
//     } catch (error) {
//         console.error('Error fetching users:', error);
//         res.status(500).json({ error: 'Internal server error' });
//     }
// });

// //get all business cards
// app.get('/cards', async (req, res) => {
//     try {
//         const cards = await prisma.businessCard.findMany({
//             include: { user: true } // Include related user data
//         });
//         res.status(200).json(cards);
//     } catch (error) {
//         console.error('Error fetching business cards:', error);
//         res.status(500).json({ error: 'Internal server error' });
//     }
// });


//api for homepage"
app.get('/homepage/:id', async (req, res) => {
    const id = parseInt(req.params.id); // convert to Int
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

//gets scrollodex of a user
//returns array of business cards of user(empty array if user has none)
// scrollodex route (fix version)
app.get('/scrollodex/:userId', async (req, res) => {
    const userId = parseInt(req.params.userId);

    if (!userId || isNaN(userId)) {
        return res.status(400).json({ error: 'Invalid or missing user ID' });
    }

    try {
        const userWithCards = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                cards: {
                    include: {
                        websites: true,
                        socials: true
                    }
                }
            }
        });

        if (!userWithCards) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (!userWithCards.cards || userWithCards.cards.length === 0) {
            return res.status(200).json({
                user: {
                    id: userWithCards.id,
                    name: userWithCards.name,
                    email: userWithCards.email
                },
                scrollodex: []  // 🚫 NO test friends
            });
        }

        res.status(200).json({
            user: {
                id: userWithCards.id,
                name: userWithCards.name,
                email: userWithCards.email
            },
            scrollodex: userWithCards.cards
        });

    } catch (error) {
        console.error('Scrollodex fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch scrollodex' });
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
// app.get('/cards/:id/share', async (req, res) => {
//     try {
//         const cardId = parseInt(req.params.id);
//         const card = await prisma.businessCard.findUnique({
//             where: { id: cardId },
//             include: { user: true }
//         });

//         if (!card) {
//             return res.status(404).json({ error: 'Card not found' });
//         }

//         // Generate QR code (as before)
//         const qrData = JSON.stringify({
//             cardId: card.id,
//             jobTitle: card.jobTitle,
//             user: card.user.name
//         });
//         const qrImage = await QRCode.toDataURL(qrData);

//         // Create a shareable link
//         const shareableLink = `http://yourdomain.com/card/${card.id}`; // Replace with your frontend URL

//         res.json({
//             qrImage,
//             shareableLink, // Send both to frontend
//             cardDetails: card
//         });



//activity screen endpoint
app.get('/activity/:userId', async (req, res) => {
    try {
        const userId = parseInt(req.params.userId);
        const [ sharedCount, collectedCount ] = await Promise.all([
            prisma.share.count({ where: { fromUserId: userId } }),
            prisma.businessCard.count({ where: { userId } })
        ]);
        res.json({ sharedCount, collectedCount });
        } catch (e) {
            console.error('Activity error:', e);
            res.status(500).json({ error: 'Failed to fetch activity' });
        }
    }
);
  