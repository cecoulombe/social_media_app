/*
 * File: onLoad.js
 * Description: Handles all the logic for when the page is refreshed (i.e. persist login, load ui, &c.)
 * Author: Caitlin Coulombe
 * Created: 2025-05-21
 * Last Updated: 2025-06-20
 */

"use strict";

let access_token;
let current_user;
let user_id;
const token_type = "bearer";

/**
 * when the dom is loaded, retrieve the access token from storage
 */
document.addEventListener("DOMContentLoaded", () => {
    access_token = localStorage.getItem("access_token");
    current_user = localStorage.getItem("current_user");
    user_id = localStorage.getItem("user_id");
    console.log("Access token: " + access_token);
    console.log("Current user: " + current_user);
    console.log("User id: " + user_id);
    if(access_token && !isTokenExpired(access_token) && current_user) {
        console.log("Token exists: " + access_token + ", current user is " + current_user);
        const accountLink = document.getElementById("myAccountLink");
        if (accountLink) {
            accountLink.href = "user.html?user_id=" + user_id;
        } else {
            console.warn("Could not find #myAccountLink in the DOM");
        }
        // document.getElementById("updatePostForm").style.display = "none";
        // load the desired content based on the page (i.e. all posts, specific post, comments, user's account/posts)
    } else {
        console.log("No token found, prompt login.");
        // redirect to login page
    }

    reloadPage();
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


// // loads only the appropriate posts for the current user profile
// window.addEventListener("DOMContentLoaded", async () => {
//     console.log("hi");
//     await reloadPage();
// });

/**
 * ensures the posts for the proper page are rendered
 *
 * @function reloadPage
 */
async function reloadPage() {
    const params = new URLSearchParams(window.location.search);
    const user_id = params.get("user_id");
    const pathname = window.location.pathname;

    const newPost = "/src/newPost.html"

    // console.log("user_id", user_id);
    // console.log("pathname", pathname);

    if(pathname == newPost) {
        return;
    }

    // no user passed meaning it is the homepage
    if (!user_id) {
        // console.log("on the home page, loading that instead");
        await getPosts();
        return;
    }

    // // there is a user passed, meaning it is a user profile
    // const user = await getUser(user_id);

    // console.log("user from reloadPage", user);

    // // grab the profile picture
    // const profilePic = document.getElementById("profilePicture");
    // if (profilePic) {
    //     if(user.data.profile_pic) {
    //         console.log("There is a profile pic for the user");
    //         profilePic.src = "http://localhost:9000/" + user.data.profile_pic.url;
    //         profilePic.alt = user.data.profile_pic.filename;
    //     } else {
    //         profilePic.src = "../res/img/default_icon.png";
    //         profilePic.alt = "Default icon"
    //     }
    // } else {
    //     console.warn("profilePicture element not found in the DOM.");
    // }
    // document.getElementById("displayName").innerText = user.data.display_name;
    // document.getElementById("email").innerText = user.data.email;

    // // if this is the user, show the update account button

    renderUserPage(user_id);

    const posts = await getUserPosts(user_id);
    console.log("from userpage:", posts);
    await renderMultiplePosts(posts);
}