/*
 * File: login.js
 * Description: Handles user login and retrieves a JWT token from the backend.
 * Author: Caitlin Coulombe
 * Created: 2025-05-19
 * Last Updated: 2025-05-20
 */

"use strict";

const loginPrefix = "http://localhost:8000/login"

/**
 * Handles login form submission.
 * Sends a POST request to the /login endpoint using form-encoded credentials.
 *
 * @async
 * @function loginUser
 * @returns {Promise<void>} Resolves when login is complete and token is stored.
 * @throws {Error} If the network request fails or response is not OK.
 */
async function loginUser() {
    const url = loginPrefix

    // hardcoded username/password for testing: replace with input from text fields for both
    const username = "jimmy@gmail.com"    // replace with the value from the username input when created
    const password = "password12345"      // replace with the value from the password input when created

    const formData = new URLSearchParams();
    formData.append("username", username);
    formData.append("password", password);

    // console.log(JSON.stringify({ username, password }));

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
        localStorage.setItem("access_token", json.token.access_token);  // stores is so it can be called on refresh

        document.getElementById("displayDiv").innerHTML = JSON.stringify(json);
        console.log(json, access_token);
    }
    catch (error) {
        console.error(error.message)
    }
}

/**
 * Handles login form submission.
 * Sends a POST request to the /login endpoint using form-encoded credentials.
 *
 * @async
 * @function loginUser
 * @param {string} username - The user's username (email address).
 * @param {string} password - The user's password.
 * @returns {Promise<void>} Resolves when login is complete and token is stored.
 * @throws {Error} If the network request fails or response is not OK.
 */
async function loginNewUser(username, password) {
    const url = loginPrefix

    const formData = new URLSearchParams();
    formData.append("username", username);
    formData.append("password", password);

    // console.log(JSON.stringify({ username, password }));

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

/**
 * Handles logout button press.
 * Removes the access token from local storage and refreshes the page.
 *
 * @function logoutUser
 */
function logoutUser() {
    localStorage.removeItem("access_token");
    window.location.href="../src/index.html"
}