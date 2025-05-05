You must make sure the backend is running before attempting to run unit tests.

## //BASIC FUNCTION TESTING

* Navigate to the backend folder:  
  ```
  cd MEISHI/Backend
  ```

### 1. Install dev testing tools:
These are needed to run Jest unit tests. You can enter these into the terminal in VS code.
```
npm install --save-dev jest supertest
```

### 2. Make sure your database is set up:
If you haven't already:
```
npx prisma generate
npx prisma migrate dev --name init
```

> Note: Ensure Postgres.app is running, and that your `.env` file is properly set up as described in the backend README.1

---

### 3. Run the tests:
```
npm test
```


You should see output for **13 total tests**:
- 2 for user signup
- 3 for user login
- 3 for card creation, editing, and QR code
- 2 for homepage and landing routes
- 3 for scrollodex behavior

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

#### USER LOGIN ENDPOINT
- `should log in successfully with correct credentials`  
- `should fail login with incorrect password`  
- `should return 404 for non-existent user`  

#### CARD CREATION + EDITING
- `should create a business card`  
- `should update a business card`  
- `should generate QR code for card`  

#### HOMEPAGE + LANDING ROUTES
- `should return greeting message on homepage route`  
- `should return landing message on root route`  

#### SCROLLODEX ROUTE
- `should return user’s business cards in Scrollodex`  
- `should return empty scrollodex array if user has no cards`  

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
