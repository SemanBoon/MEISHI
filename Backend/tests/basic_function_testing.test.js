//written by: Bhavana
//tested by: Bhavana
//debugged by: Bhavana

const request = require('supertest');
const app = require('../index'); // adjust path if needed

let userId;
let cardId;

const generatedEmail = `user${Date.now()}@example.com`; // always unique for testing

beforeAll(async () => {
  const res = await request(app).post('/user-signup').send({
    name: 'Test User',
    email: generatedEmail,
    password: 'testpass123', // ✅ added
    birthday: '2000-01-01'
  });

  userId = res.body.id;
});

describe('User Signup Endpoint', () => {
  test('should create a new user', async () => {
    const res = await request(app).post('/user-signup').send({
      name: 'Another User',
      email: `another${Date.now()}@example.com`, // fresh email
      password: 'anotherpass456', // ✅ added
      birthday: '1998-05-15'
    });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('id');
    expect(res.body.email).toMatch(/@example\.com/);
  });

  test('should return error for duplicate email', async () => {
    const res = await request(app).post('/user-signup').send({
      name: 'Test User',
      email: generatedEmail, // reuse from beforeAll
      password: 'testpass123', // ✅ must match existing one
      birthday: '2000-01-01'
    });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });
});

describe('Card Creation and Fetching', () => {
  test('should create a business card', async () => {
    const res = await request(app).post('/create-business-card').send({
      jobTitle: 'Founder and CEO',
      companyName: 'MEISHI',
      phoneNumber: '469(454)-9900',
      customBio: 'I am the founder of MEISHI, a website to exchange business cards! ',
      bannerImageUrl: 'https://theeinsteinschool.com/wp-content/uploads/2022/11/UT_Dallas_tex_orange-1320x488.jpeg',
      profileImageUrl: 'https://img.freepik.com/premium-photo/woman-png-sticker-circle-profile-transparent-background_53876-944803.jpg?w=360',
      gradient: 'gradient2',
      education: 'B.S. in Computer Science',
      experience: 'CS 3354 - Software Engineering',
      projects: 'MEISHI, SWE Project',
      email: 'meishimail@gmail.com',
      userId: userId, // from beforeAll
      websites: [
        { url: 'https://example.com', label: 'Portfolio' }
      ],
      socials: [
        { url: 'https://www.linkedin.com/in/bhavana-chemuturi/', platform: 'LinkedIn' }
      ]
    });
  
    // ✅ Expectations
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.userId).toBe(userId);
  
    // Store card ID for future tests
    cardId = res.body.id;
  
    console.log('✅ Successfully created business card ID:', cardId);
  });

  test('should get all business cards', async () => {
    const res = await request(app).get('/cards');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('should generate QR code for card', async () => {
    const res = await request(app).get(`/cards/${cardId}/qr`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('qrImage');
  });
});

describe('Additional Routes', () => {
  test('should return greeting message on homepage route', async () => {
    const res = await request(app).get(`/homepage/${userId}`);
    expect(res.statusCode).toBe(200);
    expect(res.text).toContain('Welcome to the MEISHI');
  });

  test('should update a business card', async () => {
    const res = await request(app).put('/update-business-cards').send({
      cardId: cardId,
      jobTitle: 'Senior Developer',
      customBio: 'Updated bio for testing'
    });
    expect(res.statusCode).toBe(200);
    expect(res.body.jobTitle).toBe('Senior Developer');
    expect(res.body.customBio).toBe('Updated bio for testing');
  });

  test('should return landing message on root route', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(200);
    expect(res.text).toBe('Initial Selection Page');
  });
});

// added 4/18/2025 (After Project deliverable 1 due)
describe('User Login Endpoint', () => {
  let testUser;

  beforeAll(async () => {
    // Create a test user first
    const res = await request(app).post('/user-signup').send({
      name: 'Login Test',
      email: 'logintest@example.com',
      password: 'securePass123'
    });
    testUser = res.body;
  });

  test('should log in successfully with correct credentials', async () => {
    const res = await request(app).post('/login').send({
      email: 'logintest@example.com',
      password: 'securePass123'
    });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message', 'Login successful');
    expect(res.body).toHaveProperty('user');
    expect(res.body.user.email).toBe('logintest@example.com');
  });

  test('should fail login with incorrect password', async () => {
    const res = await request(app).post('/login').send({
      email: 'logintest@example.com',
      password: 'wrongpassword'
    });

    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('error', 'Invalid credentials');
  });

  test('should return 404 for non-existent user', async () => {
    const res = await request(app).post('/login').send({
      email: 'notreal@example.com',
      password: 'irrelevant'
    });

    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('error', 'User not found');
  });
});

describe('Scrollodex Route', () => {
  test('should return user’s business cards in Scrollodex', async () => {
    const res = await request(app).get(`/scrollodex/${userId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('scrollodex');
    expect(Array.isArray(res.body.scrollodex)).toBe(true);
    expect(res.body.scrollodex.length).toBeGreaterThan(0);
  });

  test('should return empty scrollodex array if user has no cards', async () => {
    const newUserRes = await request(app).post('/user-signup').send({
      name: 'NoCard User',
      email: `nocard${Date.now()}@example.com`,
      password: 'test123'
    });
  
    const newUserId = newUserRes.body.id;
  
    const res = await request(app).get(`/scrollodex/${newUserId}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.scrollodex)).toBe(true);
    expect(res.body.scrollodex.length).toBe(0); // should be empty
  });
  

});
