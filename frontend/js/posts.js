/**
 * File: posts.js
 * Description: Handles user login and retrieves a JWT token from the backend.
 * Author: Caitlin Coulombe
 * Created: 2025-05-19
 * Last Updated: 2025-05-19
 *
 * Usage:
 * - Called when the login form is submitted.
 * - Sends a POST request to the /login endpoint with username/password.
 * - Stores the JWT token for use in authenticated requests.
 */

"use strict";

const postPrefix = "http://localhost:8000/posts"

// returns the json with all of the posts
async function getPosts() {
    const url = postPrefix;

    try {
        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${access_token}`
            }
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

// returns a single post based on the id (in the future it will be submitted by the user but for now it is hardcoded)
async function getPost() {
    const post_id = 44;
    const url = postPrefix + "/" + post_id;

    try {
        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${access_token}`
            }
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

// creates a post
async function createPost() {
    const url = postPrefix;
    let title = "NEW POST FROM JS"
    let content = "this is the content for the post created via JS"

    console.log(JSON.stringify({title, content}));

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${access_token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify ({title, content})
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