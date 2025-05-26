/**
 * File: renderUI.js
 * Description: Uses the template in index.html to create a post
 * Author: Caitlin Coulombe
 * Created: 2025-05-20
 * Last Updated: 2025-05-26
 */

"use strict";

let postTemplate = null;
// console.log("setupSlideshow is", typeof setupSlideshow);


// load the template from template.html
async function loadTemplate() {
    if(!postTemplate) {
        const res = await fetch(`/src/template.html?nocache=${Date.now()}`);
        const html = await res.text();
        const container = document.createElement('div');
        container.innerHTML = html;
        postTemplate = container.querySelector("#postTemplate");
    }
}

/**
 * Uses template.html to generate multiple post
 *
 * @async
 * @function renderMultiplePost
 * @param {json} posts - the posts that are to be rendered
 */
async function renderMultiplePosts(posts) {
    await loadTemplate();

    let prevArrow;
    let nextArrow;

    const container = document.getElementById("postsContainer");

    // clear any old posts
    container.innerHTML = "";

    posts.forEach(post => {
        // clone the template
        const clone = postTemplate.content.cloneNode(true);
        // get the .post element inside the fragment
        const postElement = clone.querySelector(".post");
        postElement.id = post.id;

        // console.log(post.id);

        // fill in the data
        postElement.querySelector(".postAuthor").textContent = post.author.email; // change this to be the display name
        postElement.querySelector(".postContent").textContent = post.content;
        postElement.querySelector(".likeCounter").textContent = post.like_count; 
        
        const updateButton = postElement.querySelector(".updateButton");

        // make sure only the poster can edit the post
        if(current_user != post.author.email) {
            updateButton.style.display = "none";
        }

        updateButton.addEventListener("click", () => createUpdateForm(post.id));

        // if there is media, add it
        if(post.media && post.media.length > 0) {
            const imageContainer = postElement.querySelector(".images");
            const dotContainer = postElement.querySelector(".dotContainer");

            // add images to the post (no movies/videos allowed as of right now)
            post.media.forEach((mediaItem) => {
                const img = document.createElement("img");
                img.classList.add("slides");
                // console.log(mediaItem.url);
                img.src = "http://localhost:9000/" + mediaItem.url;
                // console.log(img.src);
                img.alt = mediaItem.filename;
                imageContainer.appendChild(img);

                if(post.media.length > 1) {
                    const dot = document.createElement("span");
                    dot.classList.add("dot")
                    dotContainer.appendChild(dot);
                    // console.log("Adding a dot for the image");
                }
            });

            // if there is more than 1 media, add the ppt controls
            if(post.media.length > 1) {
                // add the nav arrows
                prevArrow = document.createElement("a");
                prevArrow.classList.add("prev");
                prevArrow.innerHTML = "&#10094;";
                postElement.querySelector(".media").appendChild(prevArrow);

                nextArrow = document.createElement("a");
                nextArrow.classList.add("next");
                nextArrow.innerHTML = "&#10095;";
                postElement.querySelector(".media").appendChild(nextArrow);
            }

        } else {
            // console.log("No media for post: " + post.id)
            // hide the media section
            postElement.querySelector(".media").style.display ="none";
        }

        // add an event listener to the like button
        postElement.querySelector(".likeButton").addEventListener("click", () => {
            likePost(post.id);
        });

        // add an event listener to the update button
        postElement.querySelector(".updateButton").addEventListener("click", (event) => {
            event.preventDefault();
            createUpdateForm(post.id);
            window.location.href = "home.html#" + post.id;
        });

        // add the postElement to the container
        container.appendChild(postElement); 
        // console.log("Calling setupSlideshow for post", post.id);
        setTimeout(() => setupSlideshow(postElement), 0);

    });
}

/**
 * Uses template.html to generate the post
 *
 * @async
 * @function renderPost
 * @param {json} post - the post that is to be rendered
 */
async function renderPost(post) {
    await loadTemplate();

    const container = document.getElementById("postContainer");
    const template = document.getElementById("postTemplate");

    // clear any old posts
    container.innerHTML = "";

    // clone the template
    const clone = template.content.cloneNode(true);
    clone.id = post.id;
    // console.log(post.id);

    // fill in the data
    clone.querySelector(".postAuthor").textContent = post.author.email; // change this to be the display name
    clone.querySelector(".content").textContent = post.content;
    clone.querySelector(".likeCounter").textContent = post.like_count;

    // if there is media, add it
    if(post.media && post.media.length > 0)
    {
        clone.querySelector(".media").textContent = "There is media";
    } else {
        clone.querySelector(".media").textContent = "No media";
    }

    // add an event listener to the like button
    clone.querySelector(".likeButton").addEventListener("click", () => {
        likePost(post.id);
    });

    // add an event listener to the update button
    clone.querySelector(".updateButton").addEventListener("click", () => {
        createUpdateForm(post.id);
    });

    // add the clone to the container
    container.appendChild(clone);
}

/**
 * Fills in the existing value for the content and makes the form visible.
 *
 * @async
 * @function createUpdateForm
 */
async function createUpdateForm(post_id){
    window.location.href = "home.html#" + post_id;

    const post = await getPost(post_id);    
    console.log(post);

    const postElem = document.getElementById(post_id);

    // create a form where the content is
    // empty the content container
    const contentContainer = postElem.querySelector(".contentContainer");
    contentContainer.innerHTML = "";

    // fill it with a form
    const updateForm = document.createElement("form");
    updateForm.id = "updateForm";
    const updateContent = document.createElement("textarea");
    
    updateContent.name = "updateContent";
    updateContent.id = "updateContent";
    updateContent.value = post.content;
    updateContent.required = true;

    const submitUpdate = document.createElement("input");
    submitUpdate.type = "submit";
    submitUpdate.id = "submitUpdate";

    updateForm.appendChild(updateContent);
    updateForm.appendChild(submitUpdate);
    contentContainer.appendChild(updateForm);

    updateForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        const newContent = updateContent.value;
        
        await updatePost(newContent, post_id);
        await getPosts();

        const updatedPost = document.getElementById(post_id);
        if(updatedPost) {
            updatedPost.scrollIntoView({behavior: "smooth", block: "start"});
        }
    });
}