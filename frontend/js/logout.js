/*
 * File: logout.js
 * Description: Handles user logout and erases the previous session token
 * Author: Caitlin Coulombe
 * Created: 2025-05-24
 * Last Updated: 2025-05-24
 */

"use strict";

/**
 * Handles logout button press.
 * Removes the access token from local storage and refreshes the page.
 *
 * @function logoutUser
 */
function logoutUser() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("current_user");

    window.location.href="../src/index.html"
}