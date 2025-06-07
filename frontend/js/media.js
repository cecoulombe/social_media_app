/**
 * File: media.js
 * Description: Adds submitted media to the database
 * Author: Caitlin Coulombe
 * Created: 2025-05-31
 * Last Updated: 2025-05-31
 */


"use strict";

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

    const url = `http://localhost:9000/api/media/upload/${post_id}`;

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