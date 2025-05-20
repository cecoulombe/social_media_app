/*
 * File: login.js
 * Description: Handles user login and retrieves a JWT token from the backend.
 * Author: Caitlin Coulombe
 * Created: 2025-05-19
 * Last Updated: 2025-05-19
 *
 * Usage:
 * - Called when the login form is submitted
 * - Sends a POST request to the /login endpoint with username/password
 * - Stores the JWT token for use in authenticated requests
 */

"use strict";

const loginPrefix = "http://localhost:8000/login"

let access_token;
const token_type = "bearer";

// this method is currently the onclick for a button but it will be better as the event listener for submit for the login form
async function loginUser() {
    const url = loginPrefix

    // hardcoded username/password for testing: replace with input from text fields for both
    let username = "jimmy@gmail.com"    // replace with the value from the username input when created
    let password = "password12345"      // replace with the value from the password input when created

    const formData = new URLSearchParams();
    formData.append("username", username);
    formData.append("password", password);

    console.log(JSON.stringify({ username, password }));

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: formData.toString()
        });

        if(!response.ok) {
            throw new Error('Response status: ${response.status');
        }

        const json = await response.json();
        access_token = json.token.access_token;

        document.getElementById("displayDiv").innerHTML = JSON.stringify(json);
        console.log(json, access_token);
    }
    catch (error) {
        console.error(error.message)
    }
}
