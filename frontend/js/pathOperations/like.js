/**
 * File: likes.js
 * Description: Handles like path operations which involves adding or removing a like from the passed post
 * Author: Caitlin Coulombe
 * Created: 2025-05-19
 * Last Updated: 2025-05-20
 */


"use strict";

// LOCAL
// const likePrefix = "http://localhost:9000/api/likes"

// RENDER
const likePrefix = "https://social-media-backend-z6jf.onrender.com/api/likes"

/**
 * Determines if a like is to be added to or removed from the post.
 * Sends a POST request to the /likes endpoint with the id of the post and whether a like should be added or removed.
 *
 * @async
 * @function likePost
 * @returns {Promise<void>} Resolves when the like is added or removed and the message is displayed on the page.
 * @throws {Error} If the network request fails or response is not OK.
 */
async function likePost(post_id) {   
    const get_url = likePrefix + "/" + post_id;
    const post_url = likePrefix;

    try {
        // check if the user is adding or removing a like (based on if it is already liked or not)
        const get_response = await fetch(get_url, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${access_token}`
            }
        });

        if(!get_response.ok) {
            throw new Error('Get Reponse status: ${get_response.status}');
        }

        const data = await get_response.json();
        const dir = 1 - data.liked;
        console.log(dir);

        // actually add/remove the like
        const post_response = await fetch(post_url, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${access_token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify ({post_id, dir})
        });

        if(!post_response.ok) {
            throw new Error('Post Reponse status: ${post_response.status}');
        }

        const json = await post_response.json();
        console.log(json);
    }
    catch (error) {
        console.error(error.message);
    }
}

/**
 * Determines if a like is to be added to or removed from the post.
 * Sends a POST request to the /likes endpoint with the id of the post and whether a like should be added or removed.
 *
 * @async
 * @function getIsLiked
 * @returns {Boolean} returns true if this user has already liked the post
 * @throws {Error} If the network request fails or response is not OK.
 */
async function getIsLiked(post_id) {
    const url = likePrefix + "/" + post_id;

    try {
        // check if the user is adding or removing a like (based on if it is already liked or not)
        const get_response = await fetch(url, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${access_token}`
            }
        });

        if(!get_response.ok) {
            throw new Error('Reponse status: ${get_response.status}');
        }

        const data = await get_response.json();
        const isLiked = data.liked;
        // console.log("Is liked method: post " + post_id + " is liked? " + isLiked);
        return isLiked;
    }
    catch (error) {
        console.error(error.message);
    }
}


/**
 * Determines if a like is to be added to or removed from the post.
 * Sends a POST request to the /likes endpoint with the id of the post and whether a like should be added or removed.
 *
 * @async
 * @function getLikeCount
 * @returns {Boolean} returns true if this user has already liked the post
 * @throws {Error} If the network request fails or response is not OK.
 */
async function getLikeCount(post_id) {
    const url = likePrefix + "/" + post_id;

    try {
        const post = await getPost(post_id);
        const numLikes = post.like_count;
        return numLikes;
    }
    catch (error) {
        console.error(error.message);
    }
}