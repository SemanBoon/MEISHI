Since our application does not collect data from sensors or APIs, we used predefined test inputs to simulate real usage.

We tested the following scenarios:

- User Signup
    Input: name, email, birthday
    Expected: User created in database

- Duplicate Email:
    Input: Repeat user signup with same email
    Expected: 400 error, user not created

- Business Card Creation:
    Input: jobTitle, companyName, phoneNumber, websites, socials, customBio, userId
    Expected: Business card is added for the user

- Get Business Cards:
    Expected: All existing business cards are returned

- Update Card:
    Input: Updated jobTitle, phoneNumber, etc.
    Expected: Updates reflect in the database

- Homepage Greeting:
    Input: User ID
    Expected: "Welcome to the MEISHI, [username]"

- QR Code Generation:
    Input: cardId
    Expected: QR code + card info

No special data scripts were needed. Testing was done via Postman and automated Jest tests in tests/basic_function_testing.test.js.