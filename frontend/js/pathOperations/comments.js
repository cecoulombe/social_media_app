/**
 * File: comments.js
 * Description: Handles like path operations which involves adding or removing a like from the passed post
 * Author: Caitlin Coulombe
 * Created: 2025-05-19
 * Last Updated: 2025-05-20
 */


"use strict";

const commentPrefix = "http://localhost:9000/api/comment"

/**
 * Retrieves the 3 most recent parent comments (no children for the home page)
 * Sends a POST request to the /comment endpoint with a post id and limit of 3 to retrieve only the 3 most recent comments for a post (or any associated parents)
 *
 * @async
 * @function getComments_Home
 * @returns {Promise<void>} Resolves when the like is added or removed and the message is displayed on the page.
 * @throws {Error} If the network request fails or response is not OK.
 */
async function getComments_Home(post_id) {   
    const url = commentPrefix + "/parent/" + post_id + "?limit=3";

    try {
        // check if the user is adding or removing a like (based on if it is already liked or not)
        const get_response = await fetch(url, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${access_token}`
            }
        });

        if(!get_response.ok) {
            throw new Error('Get Reponse status: ${get_response.status}');
        }

        const json = await get_response.json();
        const comments = json.data;
        return comments;
    }
    catch (error) {
        console.error(error.message);
    }
}

/**
 * Retrieves all of the comments for a single post
 * Sends a POST request to the /comment endpoint with a post id and limit of 3 to retrieve only the 3 most recent comments for a post (or any associated parents)
 *
 * @async
 * @function getComments
 * @returns {Promise<void>} Resolves when the like is added or removed and the message is displayed on the page.
 * @throws {Error} If the network request fails or response is not OK.
 */
async function getComments(post_id) {   
    const url = commentPrefix + "/" + post_id;

    try {
        // check if the user is adding or removing a like (based on if it is already liked or not)
        const get_response = await fetch(url, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${access_token}`
            }
        });

        if(!get_response.ok) {
            throw new Error('Get Reponse status: ${get_response.status}');
        }

        const json = await get_response.json();
        const comments = json.data;
        console.log(comments);
        return comments;
    }
    catch (error) {
        console.error(error.message);
    }
}

/**
 * Handles logic for creating and storing a new post.
 * Sends a POST request to the /posts endpoint containing the content for a new post.
 *
 * @async
 * @function createComment
 * @param {int} parentId - 
 * @returns {Promise<void>} Resolves when post is created, stored in the database, and displayed on page.
 * @throws {Error} If the network request fails or response is not OK.
 */
async function createComment(post_id, parent_id, content) {
    let url;

    if(parent_id != null) {
        // its a child
        url = commentPrefix + "/" + post_id + "/" + parent_id;
        console.log("creating a new child");
    } else {
        // its a parent
        url = commentPrefix + "/" + post_id ;
        console.log("creating a new parent");
    }

    console.log(JSON.stringify ({content}));

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${access_token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify ({content})
        });

        if(!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }

        const json = await response.json();
        console.log(json.data);
        return json.data
    }
    catch (error) {
        console.error(error.message);
    }
}