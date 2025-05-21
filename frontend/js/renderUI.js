/**
 * File: renderUI.js
 * Description: Uses the template in index.html to create a post
 * Author: Caitlin Coulombe
 * Created: 2025-05-20
 * Last Updated: 2025-05-20
 */

"use strict";

// renders multiple posts
function renderMultiplePosts(posts) {
    const container = document.getElementById("postContainer");
    const template = document.getElementById("postTemplate");

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

        // add an event listener to the like button
        clone.querySelector(".likeButton").addEventListener("click", () => {
            likePost(post.id);
        });

        // add the clone to the container
        container.appendChild(clone);

    });
}

// renders a single post
function renderSinglePost(post) {
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

    // add an event listener to the like button
    clone.querySelector(".likeButton").addEventListener("click", () => {
        likePost(post.id);
    });

    // add the clone to the container
    container.appendChild(clone);
}