/**
 * File: renderComments.js
 * Description: Uses the template in home.html to create a comment
 * Author: Caitlin Coulombe
 * Created: 2025-06-28
 * Last Updated: 2025-06-29
 */

"use strict";

let commentTemplate_Parent = null;
let commentTemplate_Child = null;

// load the template from commentTemplate_parent.html
async function loadParentCommentTemplate() {
    if(!commentTemplate_Parent) {
        const res = await fetch(`../../commentTemplate_parent.html?nocache=${Date.now()}`);
        const html = await res.text();
        const container = document.createElement('div');
        container.innerHTML = html;
        commentTemplate_Parent = container.querySelector("#parentCommentTemplate");
    }
}

// load the template from commentTemplate_child.html
async function loadChildCommentTemplate() {
    if(!commentTemplate_Child) {
        const res = await fetch(`../../commentTemplate_child.html?nocache=${Date.now()}`);
        const html = await res.text();
        const container = document.createElement('div');
        container.innerHTML = html;
        commentTemplate_Child = container.querySelector("#childCommentTemplate");
    }
}

/**
 * Uses commentTemplate_parent.html to generate the comment
 *
 * @async
 * @function renderParentComment
 * @param {json} comment - the comment that is to be rendered
 */
async function renderParentComment(comment, container){
    await loadParentCommentTemplate();

    // clone the template
    // const clone = commentTemplate_Parent.content.cloneNode(true);
    // clone.id = comment.id;

    const fragment = commentTemplate_Parent.content.cloneNode(true);
    const clone = fragment.querySelector(".comment"); // Get actual root element
    clone.id = comment.id;
    // clone.querySelector(".comment").id = comment.id;

    // RENDER THE COMMENT
    // AUTHOR
    const commentAuthor = clone.querySelector(".commentAuthor");
    commentAuthor.textContent = comment.author.display_name;
    clone.querySelector(".commentContent").textContent = comment.content;

    commentAuthor.addEventListener("click", () => {
        window.location.href = `user.html?user_id=${comment.author.id}`;
    });

    // TIMESTAMP
    const timestampDaysAgo = clone.querySelector(".daysAgo");
    const timestampDate = clone.querySelector(".date");
    
    const date = new Date(comment.created_at);
    const formattedDate = date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric"
    });
    timestampDate.textContent = formattedDate;

    const now = new Date();
    const daysDiff = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    let daysAgo;
    if(daysDiff > 14) {
        daysAgo = `${Math.floor(daysDiff / 7)}w`;
    } else if (daysDiff > 0) {
        daysAgo = `${daysDiff}d`;
    } else {
        daysAgo = "Today";
    }

    timestampDaysAgo.textContent = daysAgo;

    // PROFILE PICTURE
    const profilePic =  clone.querySelector(".profilePic");
    if(comment.author.profile_pic) {
        // console.log("Has a profile pic: " + post.author.profile_pic.url)
        profilePic.src = "http://localhost:9000/" + comment.author.profile_pic.url;
        profilePic.alt = comment.author.profile_pic.filename;
    } else {
        profilePic.src = "/../res/img/default_icon.png";
        profilePic.alt = "Default icon"
    }

    profilePic.addEventListener("click", () => {
        window.location.href = `user.html?user_id=${comment.author.id}`;
    });

    // EDIT BUTTON
    const editButton = clone.querySelector(".editButton");
    if(comment.author.id != user_id)
    {
        editButton.style.display = "None";
    }

    clone.querySelector(".childContainer").style.display = "None";

    // add the clone to the container
    container.appendChild(clone);

    return clone;
}

/**
 * Uses commentTemplate_child.html to generate the comment
 *
 * @async
 * @function renderChildComment
 * @param {json} comment - the comment that is to be rendered
 */
async function renderChildComment(comment, container){
    await loadChildCommentTemplate();

    // clone the template
    // const clone = commentTemplate_Parent.content.cloneNode(true);
    // clone.id = comment.id;

    const fragment = commentTemplate_Child.content.cloneNode(true);
    const clone = fragment.querySelector(".comment"); // Get actual root element
    clone.id = comment.id;
    // clone.querySelector(".comment").id = comment.id;

    // RENDER THE COMMENT
    // AUTHOR
    const commentAuthor = clone.querySelector(".commentAuthor");
    commentAuthor.textContent = comment.author.display_name;
    clone.querySelector(".commentContent").textContent = comment.content;

    commentAuthor.addEventListener("click", () => {
        window.location.href = `user.html?user_id=${comment.author.id}`;
    });

    // TIMESTAMP
    const timestampDaysAgo = clone.querySelector(".daysAgo");
    const timestampDate = clone.querySelector(".date");
    
    const date = new Date(comment.created_at);
    const formattedDate = date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric"
    });
    timestampDate.textContent = formattedDate;

    const now = new Date();
    const daysDiff = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    let daysAgo;
    if(daysDiff > 14) {
        daysAgo = `${Math.floor(daysDiff / 7)}w`;
    } else if (daysDiff > 0) {
        daysAgo = `${daysDiff}d`;
    } else {
        daysAgo = "Today";
    }

    timestampDaysAgo.textContent = daysAgo;

    // PROFILE PICTURE
    const profilePic =  clone.querySelector(".profilePic");
    if(comment.author.profile_pic) {
        // console.log("Has a profile pic: " + post.author.profile_pic.url)
        profilePic.src = comment.author.profile_pic.url;
        // profilePic.src = "http://localhost:9000/" + comment.author.profile_pic.url;
        profilePic.alt = comment.author.profile_pic.filename;
    } else {
        profilePic.src = "..'../res/img/default_icon.png";
        profilePic.alt = "Default icon"
    }

    profilePic.addEventListener("click", () => {
        window.location.href = `user.html?user_id=${comment.author.id}`;
    });

    // EDIT BUTTON
    const editButton = clone.querySelector(".editButton");
    if(comment.author.id != user_id)
    {
        editButton.style.display = "None";
    }

    // add the clone to the container
    container.appendChild(clone);

    return clone;
}