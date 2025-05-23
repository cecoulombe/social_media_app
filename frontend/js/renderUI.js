/**
 * File: renderUI.js
 * Description: Uses the template in index.html to create a post
 * Author: Caitlin Coulombe
 * Created: 2025-05-20
 * Last Updated: 2025-05-20
 */

"use strict";

let postTemplate = null;

// load the template from template.html
async function loadTemplate() {
    if(!postTemplate) {
        const res = await fetch("../src/template.html");
        const html = await res.text();
        const container = document.createElement('div');
        container.innerHTML = html;
        postTemplate = container.querySelector("#postTemplate");
    }
}

// renders multiple posts
async function renderMultiplePosts(posts) {
    await loadTemplate();

    const container = document.getElementById("postContainer");

    // clear any old posts
    container.innerHTML = "";

    posts.forEach(post => {
        // clone the template
        const clone = template.content.cloneNode(true);
        clone.id = post.id;
        console.log(post.id);

        // fill in the data
        clone.querySelector(".postTitle").textContent = post.title;
        clone.querySelector(".postAuthor").textContent = post.author.email; // change this to be the display name
        clone.querySelector(".content").textContent = post.content;
        clone.querySelector(".likeCounter").textContent = post.like_count;

        // if there is media, add it
        if(post.media && post.media.length > 0) {
            // add images to the post (no movies/videos allowed as of right now)
            post.media.forEach((mediaItem) => {
                const img = document.createElement("img");
                img.src = "../../backend/" + mediaItem.url;
                img.alt = mediaItem.filename;
                img.style.maxWidth = '200px';   // get rid of this after creating the css
                clone.querySelector(".media").appendChild(img);
            });

        } else {
            console.log("No media for post: " + post.id)
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

    });
}

// renders a single post
async function renderPost(post) {
    await loadTemplate();

    const container = document.getElementById("postContainer");
    const template = document.getElementById("postTemplate");

    // clear any old posts
    container.innerHTML = "";

    // clone the template
    const clone = template.content.cloneNode(true);
    clone.id = post.id;
    console.log(post.id);

    // fill in the data
    clone.querySelector(".postTitle").textContent = post.title;
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