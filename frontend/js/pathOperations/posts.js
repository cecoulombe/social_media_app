/**
 * File: posts.js
 * Description: Handles post path operations including retrieving all posts, retrieving one post, creating a new post, editing an existing post, and deleting an existing post
 * Author: Caitlin Coulombe
 * Created: 2025-05-19
 * Last Updated: 2025-05-26
 */


"use strict";

console.log("Posts.js loaded");

const postPrefix = "http://localhost:9000/api/posts"

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
        // render posts - probably move this somewhere else?
        await renderMultiplePosts(posts)
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
 * @returns {Promise<void>} Resolves when post is retrieved and returned to the caller.
 * @throws {Error} If the network request fails or response is not OK.
 */
async function getPost(post_id) {
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
        // renderPost(post);
        return post;
    }
    catch (error) {
        console.error(error.message);
    }
}

/**
 * Handles logic for retrieving all posts created by the specified user.
 * Sends a GET request to the /posts/user_id endpoint, receiving all posts from the database that match the query parameters.
 *
 * @async
 * @function getUsersPosts
 * @returns {Promise<void>} Resolves when user's posts are retrieved and displayed on page.
 * @throws {Error} If the network request fails or response is not OK.
 */
async function getUserPosts(user_id) {
    console.log("in getUserPosts()");
    // query parameters
    // TODO: Update limit/skip to support pagination dynamically
    const limit = 100;  
    const skip = 0;

    const url = postPrefix + "/get-user/" + user_id + "?limit=" + limit + "&skip=" + skip;

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
        console.log(posts);
        return posts;
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
 * @function createPost
 * @returns {Promise<void>} Resolves when post is created, stored in the database, and displayed on page.
 * @throws {Error} If the network request fails or response is not OK.
 */
async function createPost() {
    event.preventDefault();
    const url = postPrefix;

    const content = document.getElementById("newContent").value;

    console.log("in CreatePost()");
    console.log(JSON.stringify({content}));

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
            throw new Error(`Reponse status: ${response.status}`);
        }

        const json = await response.json();
        console.log(json.data);
        return json.data;
    }
    catch (error) {
        console.error(error.message);
    }
}

/**
 * Handles logic for updating the content of an existing post.
 * Sends a PUT request to the /posts/{id} endpoint containing the updated content the post based on id.
 *
 * @async
 * @function updatePost
 * @param {string} newContent - the only part of the post that can change is the content so it needs to be passed
 * @param {int} post_id - the id of the post to be changed
 * @returns {Promise<void>} Resolves when post is updated in the database, and displayed on page.
 * @throws {Error} If the network request fails or response is not OK.
 */
async function updatePost(newContent, post_id) {
    const url = postPrefix + "/" + post_id;
    
    const content = newContent;

    console.log(JSON.stringify({content}));

    try {
        const response = await fetch(url, {
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${access_token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify ({content})
        });

        if(!response.ok) {
            throw new Error(`Reponse status: ${response.status}`);
        }

        const json = await response.json();
        // document.getElementById("displayDiv").innerHTML = JSON.stringify(json);
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
async function deletePost(post_id) {
    console.log("deleting the post");
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
