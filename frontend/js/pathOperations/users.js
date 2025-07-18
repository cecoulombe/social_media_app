/**
 * File: users.js
 * Description: Handles user path operations including creating a new user and retrieving the information of a single user
 * Author: Caitlin Coulombe
 * Created: 2025-05-19
 * Last Updated: 2025-05-24
 */

"use strict";

// localhost
// const userPrefix= "http://localhost:9000/api/users"

// Render
const userPrefix= "https://social-media-backend-z6jf.onrender.com/api/users"

// TODO add a username/display name field when creating a user - keep the sign on as the email but give a display name option

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
        return json.data.id;
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
 * @param {string} user_id - the user id of theuser being retrieved

 * @returns {Promise<void>} Resolves when user is retrieved and displayed on page.
 * @throws {Error} If the network request fails or response is not OK.
 */
async function getUser(user_id) {
    console.log("in getUser()");
    const url = userPrefix + "/" + user_id;

    try {
        const response = await fetch(url, {
            method: "GET"
        });

        if(!response.ok) {
            throw new Error('Reponse status: ${response.status}');
        }

        const data = await response.json();
        console.log("from getUser:", data);
        return data;
    }
    catch (error) {
        console.error(error.message);
    }
}


/**
 * Handles logic for updating the current user's display name
 * Sends a PUT request to the /users/update_name/{id} endpoint containing the new display name.
 *
 * @async
 * @function updateUser
 * @param {string} display_name - the new display_name
 * @returns {Promise<void>} Resolves when post is updated in the database, and displayed on page.
 * @throws {Error} If the network request fails or response is not OK.
 */
async function updateUser(display_name) {
    console.log("user id: " + user_id);
    const url = userPrefix + "/update_name/" + user_id;

    console.log(JSON.stringify({display_name}));

    try {
        const response = await fetch(url, {
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${access_token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify ({display_name})
        });

        if(!response.ok) {
            throw new Error(`Reponse status: ${response.status}`);
        }

        const json = await response.json();
        console.log(json);
    }
    catch (error) {
        console.error(error.message);
    }
}

/**
 * Handles logic for deleting an existing user.
 * Sends a DELETE request to the /users/{id} endpoint to remove the user from the database.
 *
 * @async
 * @function deleteUser
 * @returns {Promise<void>} Resolves when post is deleted from the database.
 * @throws {Error} If the network request fails or response is not OK.
 */
async function deleteUser() {
    console.log("deleting the user");
    const url = userPrefix + "/" + user_id;

    try {
        const response = await fetch(url, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${access_token}`,
                "Content-Type": "application/json"
            }
        });

        if(!response.ok) {
            throw new Error('Reponse status: ${response.status}');
        }

        const msg = "User successfully deleted.";
        console.log(msg);
    }
    catch (error) {
        console.error(error.message);
    }
}

/**
 * Handles logic for deleting an existing user.
 * Sends a DELETE request to the /users/{id} endpoint to remove the user from the database.
 *
 * @async
 * @function deleteUser
 * @returns {Promise<void>} Resolves when post is deleted from the database.
 * @throws {Error} If the network request fails or response is not OK.
 */
async function validatePassword(password) {
    console.log("Validating the attempting password");
    const url = userPrefix + "/verify-password/" + user_id;

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${access_token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify ({password})
        });

        if(!response.ok) {
            throw new Error('Reponse status: ${response.status}');
        }

        const msg = "Password validated";
        console.log(msg);
        return 1;
    }
    catch (error) {
        console.error(error.message);
        return 0;
    }
}