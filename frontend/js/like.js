/**
 * File: likes.js
 * Description: Handles like path operations which involves adding or removing a like from the passed post
 * Author: Caitlin Coulombe
 * Created: 2025-05-19
 * Last Updated: 2025-05-20
 */


"use strict";

const likePrefix = "http://localhost:8000/like"

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
    // TODO: there will be an icon that changes based on if the post is liked or not
    // the id of the post will probably be passed in the event in some way? wont be a form submission and won't hardcode so I'll have to find a way to do that (maybe like a parent id?)
    // const post_id = 51;
    
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

        const dir = await get_response.json();
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
        document.getElementById("displayDiv").innerHTML = JSON.stringify(json);
        console.log(json);
    }
    catch (error) {
        console.error(error.message);
    }
}
