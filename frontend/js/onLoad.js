/*
 * File: onLoad.js
 * Description: Handles all the logic for when the page is refreshed (i.e. persist login, load ui, &c.)
 * Author: Caitlin Coulombe
 * Created: 2025-05-21
 * Last Updated: 2025-05-21
 */

"use strict";

let access_token;
const token_type = "bearer";

/**
 * when the dom is loaded, retrieve the access token from storage
 */
document.addEventListener("DOMContentLoaded", () => {
    access_token = localStorage.getItem("access_token");
    if(access_token && !isTokenExpired(access_token)) {
        console.log("Token exists: " + access_token);
        // document.getElementById("updatePostForm").style.display = "none";
        // load the desired content based on the page (i.e. all posts, specific post, comments, user's account/posts)
    } else {
        console.log("No token found, prompt login.");
        // redirect to login page
    }
});

/**
 * Determines if the jwt token has expired or not
 *
 * @function isTokenExpired
 * @param {string} token - The token that is being checked for validity
 * @returns {Boolean} Returns true if the token is expired and false if it is still valid
 */
function isTokenExpired(token) {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const isExpired = Date.now() >= payload.exp * 1000;

    console.log("Token is expired? " + isExpired);
    return isExpired;
}