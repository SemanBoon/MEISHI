You must make sure the backend is running before attempting to run unit tests.

## //BASIC FUNCTION TESTING

* Navigate to the backend folder:  
  ```bash
  cd MEISHI/Backend
  ```

### 1. Install dev testing tools:
These are needed to run Jest unit tests. You can enter these into the terminal in VS code.
```bash
npm install --save-dev jest supertest
```

### 2. Make sure your database is set up:
If you haven't already:
```bash
npx prisma generate
npx prisma migrate dev --name init
```

> Note: Ensure Postgres.app is running, and that your `.env` file is properly set up as described in the backend README.1

---

### 3. Run the tests:
```bash
npm test
```

You should see output for 5 tests:
- 2 for user signup
- 3 for business card features

### What’s Being Tested?

The unit tests for MEISHI are located in:

```
/tests/basic_function_testing.test.js
```

This file includes tests for the following core backend features:

#### USER SIGNUP ENDPOINT
- `should create a new user`  
  Ensures a user can be registered successfully with unique credentials.

- `should return error for duplicate email`  
  Verifies that the system blocks accounts with emails already in use.

#### CARD CREATION + RETRIEVAL
- `should create a business card`  
  Tests the POST `/create-business-card` route for valid user inputs.

- `should get all business cards`  
  Confirms the `/cards` route returns all stored business card entries.

- `should generate QR code for card`  
  Verifies that a QR code is returned for a given card using its ID.

---

### 🛠 Notes
- The tests use dynamic emails like `user{timestamp}@example.com` to avoid conflicts from using the same email.
- A test user is created once using `beforeAll()` so other tests (like card creation) can reference a valid `userId`.
- All routes and logic must be functioning correctly for the tests to pass.

---

### 📂 File Structure
```
/MEISHI/
│
├── README3.txt                        # This file
├── Backend/
│   ├── index.js                       # Main backend server file
│   ├── tests/
│   │   └── basic_function_testing.test.js   # Contains all Jest test cases
│   └── ...
```

Make sure the server is running and PostgreSQL is connected before testing.
