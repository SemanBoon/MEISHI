// written by: Sewa and Bhavana
// tested by: Sewa and Bhavana
// debugged by: Sewa and Bhavana

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


app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

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
      const {
        jobTitle,
        companyName,
        phoneNumber,
        websites,
        socials,
        customBio,
        userId,
        bannerImageUrl,
        profileImageUrl,
        gradient,
        education,
        experience,
        projects,
        email
      } = req.body;
  
      // Verify user exists first
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) return res.status(404).json({ error: 'User not found' });
  
      const newCard = await prisma.businessCard.create({
        data: {
          jobTitle,
          companyName,
          phoneNumber,
          customBio,
          bannerImageUrl,
          profileImageUrl,
          gradient,
          education,
          experience,
          projects,
          email,
          userId,
          websites: { create: websites || [] },
          socials: { create: socials || [] }
        },
        include: {
          user: true,
          websites: true,
          socials: true
        }
      });
  
      console.log("✅ Created new card:", newCard);
      res.status(201).json(newCard);
    } catch (error) {
      console.error('❌ Error creating business card:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
app.use('/pdfs', express.static(path.join(__dirname, 'pdfs')));

const PDFDocument = require('pdfkit');
const fs = require('fs');


app.get('/pdf/:userId', async (req, res) => {
    const userId = parseInt(req.params.userId);

    try {
        const user = await prisma.user.findUnique({
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

        if (!user) return res.status(404).send('User not found');

        const doc = new PDFDocument();
        const filePath = path.join(__dirname, `pdfs/user_${userId}.pdf`);
        const writeStream = fs.createWriteStream(filePath);

        doc.pipe(writeStream);

        // Header
        doc.fontSize(22).text('MEISHI Business Card', { underline: true });
        doc.moveDown();

        // User Info
        doc.fontSize(14).text(`Name: ${user.name}`);
        doc.text(`Email: ${user.email}`);
        if (user.birthday) doc.text(`Birthday: ${user.birthday}`);
        doc.moveDown();

        // Card Info (if any)
        if (user.cards.length > 0) {
            const card = user.cards[0];
            doc.text(`Job Title: ${card.jobTitle || '-'}`);
            doc.text(`Company: ${card.companyName || '-'}`);
            doc.text(`Phone: ${card.phoneNumber || '-'}`);
            doc.moveDown();

            if (card.websites.length > 0) {
                doc.text('Websites:');
                card.websites.forEach(w => doc.text(`- ${w.label}: ${w.url}`));
                doc.moveDown();
            }

            if (card.socials.length > 0) {
                doc.text('Social Media:');
                card.socials.forEach(s => doc.text(`- ${s.platform}: ${s.url}`));
            }
        } else {
            doc.text('No business card data found.');
        }

        doc.end();

        // Wait for file to finish writing
        writeStream.on('finish', () => {
            res.download(filePath);
        });
    } catch (error) {
        console.error('Error generating PDF:', error);
        res.status(500).send('Internal Server Error');
    }
});


//api for homepage"
app.get('/homepage/:id', async (req, res) => {
    const id = parseInt(req.params.id); // convert to Int
    try {
        const profile = await prisma.user.findUnique({
            where: { id },
        });
        res.send(`Welcome to MEISHI, ${profile.name}`);
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
      cardId,
      bannerImageUrl,
      profileImageUrl,
      gradient,
      education,
      experience,
      projects,
      email
    } = req.body;
  
    const data = {};
    if (jobTitle !== undefined) data.jobTitle = jobTitle;
    if (customBio !== undefined) data.customBio = customBio;
    if (companyName !== undefined) data.companyName = companyName;
    if (phoneNumber !== undefined) data.phoneNumber = phoneNumber;
    if (bannerImageUrl !== undefined) data.bannerImageUrl = bannerImageUrl;
    if (profileImageUrl !== undefined) data.profileImageUrl = profileImageUrl;
    if (gradient !== undefined) data.gradient = gradient;
    if (education !== undefined) data.education = education;
    if (experience !== undefined) data.experience = experience;
    if (projects !== undefined) data.projects = projects;
    if (email !== undefined) data.email = email;
  
    if (websites && Array.isArray(websites)) {
      data.websites = {
        update: websites.map(site => ({
          where: { id: site.id },
          data: { url: site.url, label: site.label }
        }))
      };
    }
  
    if (socials && Array.isArray(socials)) {
      data.socials = {
        update: socials.map(social => ({
          where: { id: social.id },
          data: { url: social.url, platform: social.platform }
        }))
      };
    }
  
    try {
      const updatedProfile = await prisma.businessCard.update({
        where: { id: cardId },
        data,
        include: {
          user: true,
          websites: true,
          socials: true
        }
      });
      console.log("🔄 Updated card:", updatedProfile);
      res.json(updatedProfile);
    } catch (e) {
      console.error("❌ Update failed:", e);
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
                scrollodex: []  
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




// Add a shared card to another user's srolodex
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
            }
        });

        res.status(201).json(sharedCard);

    } catch (error) {
        res.status(500).json({ error: 'Failed to share card' });
    }
});


app.get('/activity/:userId', async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      // 1) Verify user
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, name: true }
      });
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      // 2) Fetch counts & activity
      const [
        cardsSharedByUser,
        cardsSharedWithUser,
        scrollodexCount,
        recentActivity
      ] = await Promise.all([
        prisma.share.count({ where: { fromUserId: userId } }),
        prisma.share.count({ where: { toUserId: userId } }),
        prisma.businessCard.count({ where: { userId: userId } }),
        prisma.share.findMany({
          where: {
            OR: [{ fromUserId: userId }, { toUserId: userId }]
          },
          include: {
            card: { select: { jobTitle: true, companyName: true } },
            fromUser: { select: { id: true, name: true } },
            toUser:   { select: { id: true, name: true } }
          },
          orderBy: { createdAt: 'desc' },
          take: 10
        })
      ]);
  
      // 3) (Optional) debug log
      console.log('Activity data for', userId, { cardsSharedByUser, cardsSharedWithUser, scrollodexCount });
  
      // 4) Return full payload
      return res.json({
        user,
        cardsSharedByUser,
        cardsSharedWithUser,
        scrollodexCount,
        recentActivity
      });
    } catch (e) {
      console.error('Activity error:', e);
      return res.status(500).json({ error: 'Failed to fetch activity' });
    }
  });
  
  