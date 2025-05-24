/**
 * File: users.js
 * Description: Handles user path operations including creating a new user and retrieving the information of a single user
 * Author: Caitlin Coulombe
 * Created: 2025-05-19
 * Last Updated: 2025-05-20
 */

"use strict";

const userPrefix = "http://localhost:9000/api/users"

// TODO add a username/display name field when creating a user - keep the sign on as the email but give a display name option

/**
 * Handles logic for creating and storing a new user.
 */
// document.getElementById("newAccountForm").addEventListener("submit", async function(event) {
//     event.preventDefault();

//     const email = document.getElementById("createEmail").value;
//     const password = document.getElementById("createPassword").value;
//     const display_name = document.getElementById("createDisplayName").value;

//     let user = await userExists(email);

//     // check if there is a user with that email already
//     if (user) {
//         console.log("User with that email already exists.")
//         return;
//     }
    
//     try {
//         const created = await createUser(email, password, display_name);
//         if(created == 1)
//             await loginUser(email, password);
//     } catch (err) {
//         console.error("Error during signup/login:", err.message);
//     }
// });


/**
 * Handles logic for creating and storing a new user.
 * Sends a POST request to the /users endpoint containing the email and password for a new user.
 *
 * @async
 * @function createUser
 * @param {string} username - The user's username (email address).
 * @param {string} password - The user's password.
 * * @param {string} display_name - The user's display name.
 * @returns {Promise<void>} Resolves when post is created, stored in the database, and displayed on page.
 * @throws {Error} If the network request fails or response is not OK.
 */
async function createUser(email, password, display_name) {
    const url = userPrefix;

    // console.log(JSON.stringify({ email, password }));

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify ({email, password, display_name})
        });

        if(!response.ok) {
            throw new Error('Reponse status: ${response.status}');
        }

        const json = await response.json();
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
        return json;
    }
    catch (error) {
        console.error(error.message);
    }
}

/**
 * Verifies if there is already a user with the passed email
 *
 * @async
 * @function getUser
 * @param {string} email the email the user is attempting to create an account with
 * @returns {Boolean} True if there is already a user with that email, otherwise false.
 * @throws {Error} If the network request fails or response is not OK.
 */
async function userExists(email) {
    const url = userPrefix + "/get-user/" + email;

    try {
        const response = await fetch(url, {
            method: "GET"
        });

        if(!response.ok) {
            throw new Error('Reponse status: ${response.status}');
        }

        const json = await response.json();
        return json === 1 || json.data === 1;
    }
    catch (error) {
        console.error(error.message);
    }
}