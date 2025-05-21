/**
 * File: users.js
 * Description: Handles user path operations including creating a new user and retrieving the information of a single user
 * Author: Caitlin Coulombe
 * Created: 2025-05-19
 * Last Updated: 2025-05-20
 */

"use strict";

const userPrefix = "http://localhost:8000/users"

// TODO add a username/display name field when creating a user - keep the sign on as the email but give a display name option

/**
 * Handles logic for creating and storing a new user.
 * Sends a POST request to the /users endpoint containing the email and password for a new user.
 *
 * @async
 * @function newUser
 * @throws {Error} If the network request fails or response is not OK.
 */
async function newUser() {
    event.preventDefault();

    const username = document.getElementById("emailInput").value;
    const password = document.getElementById("passwordInput").value;

    // console.log(username, password);
    
    try {
        const created = await createUser(username, password);
        if(created == 1)
            await loginNewUser(username, password);
    } catch (err) {
        console.error("Error during signup/login:", err.message);
    }
}

/**
 * Handles logic for creating and storing a new user.
 * Sends a POST request to the /users endpoint containing the email and password for a new user.
 *
 * @async
 * @function createUser
 * @param {string} username - The user's username (email address).
 * @param {string} password - The user's password.
 * @returns {Promise<void>} Resolves when post is created, stored in the database, and displayed on page.
 * @throws {Error} If the network request fails or response is not OK.
 */
async function createUser(email, password) {
    const url = userPrefix;

    // console.log(JSON.stringify({ email, password }));

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify ({email, password})
        });

        if(!response.ok) {
            throw new Error('Reponse status: ${response.status}');
        }

        const json = await response.json();
        document.getElementById("displayDiv").innerHTML = JSON.stringify(json);
        console.log(json);
        return 1;
    }
    catch (error) {
        window.alert("Sign in attempt unsuccessful.");
        console.error(error.message);
        return 0;
    }
}

/**
 * Handles logic for retrieving a single user.
 * Sends a GET request to the /users/{id} endpoint, receiving a single user based on id. 
 *
 * @async
 * @function getUser
 * @returns {Promise<void>} Resolves when user is retrieved and displayed on page.
 * @throws {Error} If the network request fails or response is not OK.
 */
async function getUser() {
    const user_id = 44;

    const url = userPrefix + "/" + user_id;

    try {
        const response = await fetch(url, {
            method: "GET"
        });

        if(!response.ok) {
            throw new Error('Reponse status: ${response.status}');
        }

        const json = await response.json();
        document.getElementById("displayDiv").innerHTML = JSON.stringify(json);
        console.log(json);
    }
    catch (error) {
        console.error(error.message);
    }
}
