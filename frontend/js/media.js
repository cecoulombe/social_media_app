/**
 * File: media.js
 * Description: Adds submitted media to the database
 * Author: Caitlin Coulombe
 * Created: 2025-05-31
 * Last Updated: 2025-05-31
 */


"use strict";

const mediaPrefix = "http://localhost:9000/api/media"
/**
 * Handles the logic for uploading any media to the database, including either a single media or a series
 * Sends a POST request to the /uploads/{id} endpoint containing the file as a form submission
 *
 * @async
 * @function uploadMedia
 * @param {int} post_id The id of the post that the media are attached to
 * @returns {Promise<void>} Resolves when posts are retrieved and displayed on page.
 * @throws {Error} If the network request fails or response is not OK.
 */
async function uploadMedia(post_id) {
    console.log("in uploadMedia");
    
    const fileList = mediaInput.files;
    const formData = new FormData();

    for(const file of fileList)
    {
        formData.append("files", file);
    }

    for (const pair of formData.entries()) {
        console.log(pair[0], pair[1]);
    }


    console.log("Uploading formData: ", formData);

    const url = mediaPrefix + `/upload/${post_id}`;

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${access_token}`
            },
            body: formData
        });

        if(!response.ok) {
            const errorText = await response.text();
            throw new Error(`Response status: ${response.status}, message: ${errorText}`);
        }

        const json = await response.json();
        console.log(json.url);

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
 * @function updateProfilePic
 * @param {string} newContent - the only part of the post that can change is the content so it needs to be passed
 * @param {int} post_id - the id of the post to be changed
 * @returns {Promise<void>} Resolves when post is updated in the database, and displayed on page.
 * @throws {Error} If the network request fails or response is not OK.
 */
async function updateProfilePic(newPic) {
    console.log("user id: " + user_id);

    const url = mediaPrefix + `/profile/update/${user_id}`;

    const formData = new FormData();
    formData.append("file", newPic);

    try {
        const response = await fetch(url, {
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${access_token}`
            },
            body: formData
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