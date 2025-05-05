                                            WELCOME TO MEISHI


Here is a list of all the files in MEISHI:

Frontend:

activity.html  -    The acitvity page where the user can see all their metrics.
auth.js        -    The javascript for the login/signup page.
edit.js        -    The javascript for the edit page that allows the edit page to update info live.
editcard.html  -    The edit page and its design.
homepage.html  -    The main page from which the user navigates around the app.
homepage.js    -    Mostly for creating the welcome message for the user.
login.html     -    The login page where the user should login if they have an account.
profile.html   -    The user's personal profile page.
profile.js     -    The javascript that allows the profile page to recieve information from the edit page.
qr.html        -    The QR code page.
qr.js          -    The javascript for generating the QR code as well as giving the share buttons functionality.
settings.html  -    Placeholder page for settings.
signup.html    -    The signup page where a user can create an account.

Backend:

schema.prisma  -    The database model that manages and organizes the information of the user.
index.js       -    The HTTP endpoints for MEISHI.





To setup and run MEISHI:

You must make sure the backend is running first, before you try to run the frontend.

//BACKEND 
* Navigate to the backend server: cd MEISHI/Backend
    * install prisma in your vs code terminal
       1. npm install @prisma/client --save
       2. npm install prisma --save-dev
       3. npx prisma init
    * install dependencies: npm install
    * install pgAdmin4: https://www.postgresql.org/ftp/pgadmin/pgadmin4/v9.0/
    * install postgres.app: https://postgresapp.com/downloads.html
        1. Open postgres.app and make sure it's running
        2. Then open PGAdmin4, right click on servers, select register -> Server
        3. Edit the Name to be MEISHI or whatever you want, Click on the Connections tab and make host name localhost, leave everything else the way it is. Type in a password then select save.
        4. Back to vscode..after running the commands from earlier you should have a .env file in the Backend/ folder. 
        5. Edit the link and replace johndoe with postgres(the username) and password with the password you enterd in pgAdmin4 e.g 
            DATABASE_URL="postgresql://postgres:*232*Sewa@localhost:5432/mydb?schema=public"
    * Run Prisma migration to set up the database: npx prisma migrate dev --name init
    * Start the server: node index.js
    * The server will start on: http://localhost:5432


//FRONTEND
* Navigate back to the frontend: cd MEISHI/Frontend
    * Install dependencies: npm install
    * Start the frontend (Backend must be started before): serve .
        * You will see something like this:
        ┌─────────────────────────────────────────┐
        │                                         │
        │   Serving!                              │
        │                                         │
        │   - Local:    http://localhost:3000     │
        │   - Network:  http://25.5.123.81:3000   │
        │                                         │
        │   Copied local address to clipboard!    │
        │                                         │
        └─────────────────────────────────────────┘
        * Ctrl+Click on the local link
    * Welcome to MEISHI
        * You will be directed to the login page first. Don't have an account? Make one!