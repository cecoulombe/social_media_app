/*
 * File: validateNewPost.js
 * Description: Validates the form values for the new post and creates the post when submitted
 * Author: Caitlin Coulombe
 * Created: 2025-05-31
 * Last Updated: 2025-05-31
 */

"use strict";

/**
 * Handles submission of the new post form
 */
document.getElementById("newPostForm").addEventListener("submit", function(event) {
    event.preventDefault();

    // create a new post and get the id for the new post
    // add media to the new post
    // go to the feed and show the new post 

    const medias = document.getElementById("newImages").value;
    const content = document.getElementById("newContent").value;

    // ensure there is at least one media or content (can be both)
    if(!medias && !content) {
        console.log("There is no media and no content");
        return;
    }

    const data = createPost();
    console.log(data);

    // console.log("medias: ", medias);
    // console.log("content:", content);
});