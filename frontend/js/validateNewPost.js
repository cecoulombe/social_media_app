/*
 * File: validateNewPost.js
 * Description: Validates the form values for the new post and creates the post when submitted
 * Author: Caitlin Coulombe
 * Created: 2025-05-31
 * Last Updated: 2025-06-04
 */

"use strict";

const mediaInput = document.getElementById("newImages");
const contentInput = document.getElementById("newContent");
const previewContainer = document.getElementById("previewContainer");
const preview = document.getElementById("previewGrid");
const MAX_FILES = 9;

/**
 * Validates the form on submission to ensure that there is either media or content for the post being added
 *
 * @event submit  when the new post form is submitted
 * @return if there is no media and no content, then attempt to create a post fails and returns
 */
document.getElementById("newPostForm").addEventListener("submit", async function(event) {
    event.preventDefault();

    // variables
    const medias = mediaInput.value;
    const content = contentInput.value;


    // ensure there is at least one media or content (can be both)
    if(!medias && !content) {
        console.log("There is no media and no content");
        return;
    }

    // UNCOMMENT THIS TO ACTUALLY MAKE THE POST
    const data = await createPost();
    // add media

    if(medias) {
        const media = await uploadMedia(data.id);
    }

    window.location.href = "home.html";

    // console.log("medias: ", medias);
    // console.log("content:", content);
});

/**
 * Limits the number of media added to each post and previews the media
 * Adds a thumbnail for each media to the post so that the user can see all of the media they are adding
 *
 * @async
 * @event change when the media input is changed
 */
mediaInput.addEventListener("change", async function() {
    preview.innerHTML = '';
    warning.textContent = '';
    const files = Array.from(this.files).filter(file => file.type.startsWith('image/'));
    const count = files.length;

    if(count === 0)
    {
        previewContainer.style.display = "none";
        return;
    }

    if(this.files.length > MAX_FILES) {
        warning.textContent = `You can only upload up to ${MAX_FILES} files.`;
        this.value = '';
        return;
    }

    previewContainer.style.display = "block";

    let gridSize = 1;
    if(count > 1 && count <= 4) {
        gridSize = 2;
    } else if(count > 4) {
        gridSize = 3;
    }

    preview.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;
    preview.style.gridTemplateRows = `repeat(${gridSize}, 1fr)`;

    for(const file of files.slice(0, 9)) {
        const dataURL = await readFileAsDataURL(file);
        const img = document.createElement('img');
        img.src = dataURL;
        img.classList.add('thumbnail');
        preview.appendChild(img);
    }
});


/**
 * Reads a file and returns a Data URL (base64-encoded string) representing the file's contents
 * 
 * Uses the FileReader API to asynchronously read a file as a data URl, 
 * which can be used for previewing the file in the browser before uploading 
 *
 * @async
 * @function readFileAsDataURL
 * @param {File} file The file to be read
 * @returns {Promise<string>} Resolves with the data URL string of the file. If reading failes, the promise is rejected with the error.
 * @throws {Error} If the network request fails or response is not OK.
 */
function readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}