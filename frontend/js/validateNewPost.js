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
 * Handles submission of the new post form
 */
document.getElementById("newPostForm").addEventListener("submit", function(event) {
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
    // const data = createPost();
    // add media
    // console.log(data);

    // console.log("medias: ", medias);
    // console.log("content:", content);
});



/**
 * Limits the number of media added to each post and previews the media
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

function readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}