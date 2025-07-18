/*
 * File: login.js
 * Description: Handles user login and retrieves a JWT token from the backend.
 * Author: Caitlin Coulombe
 * Created: 2025-05-19
 * Last Updated: 2025-06-26
 */

"use strict";

let access_token;
const token_type = "bearer";


// localhost
// const loginPrefix= "http://localhost:9000/api/login"

// Render
const loginPrefix = "https://social-media-backend-z6jf.onrender.com/api/login"

/**
 * Handles login form submission.
 * Sends a POST request to the /login endpoint using form-encoded credentials.
 *
 * @async
 * @function loginUser
 * @returns {Promise<void>} Resolves when login is complete and token is stored.
 * @throws {Error} If the network request fails or response is not OK.
 */
async function loginUser(email, password) {
    const url = loginPrefix

    const formData = new URLSearchParams();
    formData.append("username", email);
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
            throw new Error(`Response status: ${response.status}`);
        }

        const json = await response.json();
        access_token = json.token.access_token;
        const user_id = json.token.id;
        localStorage.setItem("access_token", access_token);  // stores is so it can be called on refresh
        localStorage.setItem("current_user", email);  
        localStorage.setItem("user_id", user_id);
        console.log("User id: ",user_id);

        // console.log(email);
        // console.log(json, access_token);
        // redirect to the home page
        window.location.href = "home.html";
    }
    catch (error) {
        window.alert("Invalid login attempt. Please verify email and password then try again.");
        console.error(error.message)
    }
}

/**
 * Handles login button press (redirects to loginUser())
 */
document.getElementById("loginForm").addEventListener("submit", function(event) {
    event.preventDefault();

    const username = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;
    loginUser(username, password);
});

