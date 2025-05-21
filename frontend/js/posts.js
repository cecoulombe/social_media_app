/**
 * File: posts.js
 * Description: Handles post path operations including retrieving all posts, retrieving one post, creating a new post, editing an existing post, and deleting an existing post
 * Author: Caitlin Coulombe
 * Created: 2025-05-19
 * Last Updated: 2025-05-20
 */


"use strict";

const postPrefix = "http://localhost:8000/posts"

/**
 * Handles logic for retrieving all posts.
 * Sends a GET request to the /posts endpoint, receiving all posts from the database that match the query parameters.
 *
 * @async
 * @function getPosts
 * @returns {Promise<void>} Resolves when posts are retrieved and displayed on page.
 * @throws {Error} If the network request fails or response is not OK.
 */
async function getPosts() {
    // query parameters
    // TODO: Update limit/skip to support pagination dynamically
    const limit = 100;  
    const skip = 0;
    const search = "";

    const url = postPrefix + "?limit=" + limit + "&skip=" + skip + "&search=" + search;

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
        const posts = json.data;
        renderMultiplePosts(posts);
    }
    catch (error) {
        console.error(error.message);
    }
}

/**
 * Handles logic for retrieving a single posts.
 * Sends a GET request to the /posts/{id} endpoint, receiving a single post based on the send id.
 *
 * @async
 * @function getPost
 * @returns {Promise<void>} Resolves when post is retrieved and displayed on page.
 * @throws {Error} If the network request fails or response is not OK.
 */
async function getPost() {
    // TODO: Update id to be a form value
    const post_id = 51;

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
        const post = json.data;
        renderSinglePost(post);
    }
    catch (error) {
        console.error(error.message);
    }
}

/**
 * Handles logic for creating and storing a new post.
 * Sends a POST request to the /posts endpoint containing the title and content for a new post.
 *
 * @async
 * @function createPost
 * @returns {Promise<void>} Resolves when post is created, stored in the database, and displayed on page.
 * @throws {Error} If the network request fails or response is not OK.
 */
async function createPost() {
    event.preventDefault();
    const url = postPrefix;

    // TODO: get title and content from form fields
    const title = document.getElementById("titleInput").value;
    const content = document.getElementById("contentInput").value;

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

/**
 * Handles logic for updating the content of an existing post.
 * Sends a PUT request to the /posts/{id} endpoint containing the updated title and content the post based on id.
 *
 * @async
 * @function updatePost
 * @returns {Promise<void>} Resolves when post is updated in the database, and displayed on page.
 * @throws {Error} If the network request fails or response is not OK.
 */
async function updatePost() {
    // TODO: Update id to be a form value
    const post_id = 51;

    const url = postPrefix + "/" + post_id;
    
    // TODO: the user can change either the title and/or the content so you will need to first get the post using getPost then store the existing title and content, then let the user overwrite it (probably make the existing data into the default value and then when the form submits you'll get both the title and content without extra work back here?)
    let title = "UPDATED POST FROM JS"
    let content = "updated content"

    // console.log(JSON.stringify({title, content}));

    try {
        const response = await fetch(url, {
            method: "PUT",
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


/**
 * Handles logic for deleting an existing post.
 * Sends a DELETE request to the /posts/{id} endpoint to remove the post from the database.
 *
 * @async
 * @function deletePost
 * @returns {Promise<void>} Resolves when post is deleted from the database.
 * @throws {Error} If the network request fails or response is not OK.
 */
async function deletePost() {
    // TODO: Update id to be a form value
    const post_id = 53;

    const url = postPrefix + "/" + post_id;

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

        const msg = "Post successfully deleted.";
        console.log(msg);
    }
    catch (error) {
        console.error(error.message);
    }
}