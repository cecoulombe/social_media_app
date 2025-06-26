/*
 * File: onLoad.js
 * Description: Handles all the logic for when the page is refreshed (i.e. persist login, load ui, &c.)
 * Author: Caitlin Coulombe
 * Created: 2025-06-20
 * Last Updated: 2025-06-20
 */

"use strict";

/**
 * Determines if the jwt token has expired or not
 *
 * @function isTokenExpired
 * @param {string} token - The token that is being checked for validity
 * @returns {Boolean} Returns true if the token is expired and false if it is still valid
 */
async function renderUserPage(user_id) {
    // there is a user passed, meaning it is a user profile
    const user = await getUser(user_id);

    console.log("user from reloadPage", user);

    // update My Account link and update button based on user
    const myAccountLink = document.getElementById("myAccount");
    const updateAccountButton = document.getElementById("updateAccountButton");

    if(current_user != user.data.email)
    {
        console.log("not the user");
        updateAccountButton.style.display = "none";
    } else {
        myAccountLink.classList.add("active");
    }

    // add event listener for the update button
    console.log("Attaching click handler to updateAccountButton");

    updateAccountButton.addEventListener("click", (event) => {
        event.preventDefault();
        createAccountUpdateForm(user.data.id);
    });

    // grab the profile picture
    const profilePic = document.getElementById("profilePicture");
    if (profilePic) {
        if(user.data.profile_pic) {
            console.log("There is a profile pic for the user");
            profilePic.src = "http://localhost:9000/" + user.data.profile_pic.url;
            profilePic.alt = user.data.profile_pic.filename;
        } else {
            profilePic.src = "../res/img/default_icon.png";
            profilePic.alt = "Default icon"
        }
    } else {
        console.warn("profilePicture element not found in the DOM.");
    }
    document.getElementById("displayName").innerText = user.data.display_name;
    document.getElementById("email").innerText = user.data.email;
}

/**
 * Fills in the existing value for the content and makes the form visible.
 *
 * @async
 * @function createAccountUpdateForm
 */
async function createAccountUpdateForm(user_id){
    // user can change/add a profile icon and change their display name but not the email or password
    console.log("Updating the profile");
    document.getElementById("updateAccountButton").style.display = "none";

    // change the display name
    // get the current name
    const displayNameElem = document.getElementById("displayName");
    const currentName = displayNameElem.textContent;

    // replace the display name h1 with a text input
    const nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.value = currentName;
    nameInput.id = "displayNameInput";

    displayNameElem.replaceWith(nameInput);

    // show save button
    const saveButton = document.createElement("button");
    saveButton.textContent = "Save Changes";
    saveButton.id = "saveChangesButton";
    saveButton.classList.add("updateButton");
    document.getElementById("updateButtonsContainer").appendChild(saveButton);

    // save button logic
    saveButton.addEventListener("click", async () => {
        const newDisplayName = nameInput.value;
        const newPic = fileInput.files[0];

        // replace everything here with proper frontend in users.js and media.js, storing this here for now so I don't forget
        await updateUser(newDisplayName);
        await updateProfilePic(newPic);

        // reset profile pic click behavior
        profilePic.style.cursor = "default";
        profilePic.replaceWith(profilePic.cloneNode(true)); // removes event listeners

        window.location.reload();
    });

    // show the delete account button
    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete Account";
    deleteButton.id = "deleteAccountButton";
    deleteButton.classList.add("deleteButton");
    deleteButton.style.display = "block";
    document.getElementById("updateButtonsContainer").appendChild(deleteButton);

    // delete button logic
    deleteButton.onclick = async (event) => {
        event.preventDefault();

        // confirm delete and verify password
        // TODO: at a later date, make this an html pop up that has the password filter and requests both username and password
        const passwordAttempt = prompt("Are you sure you want to delete your account? This action is permanent. \n To confirm deletion, enter your password and submit.");

        if(passwordAttempt && validatePassword(passwordAttempt))
        {
            // deleteAccount();
            console.log("Correct password, deleting account");
        } else if(passwordAttempt) {
            // invalid password
            console.log("Invalid password, do not delete");
        } else {
            // cancelled deletion
            console.log("Deletion cancelled");
        }
    };


    // change the photo
    const fileInput = document.getElementById("profilePicInput");
    fileInput.addEventListener("change", () => {
        const file = fileInput.files[0];
        if(file) {
            const previewUrl = URL.createObjectURL(file);
            console.log("previewUrl: " + previewUrl);
            document.getElementById("profilePicture").src = previewUrl;
        }
    });

    // make the profile pic clickable to open file input
    const profilePic = document.getElementById("profilePicture");
    profilePic.style.cursor = "pointer";
    profilePic.style.outline = "2px solid var(--colour-border)";
    profilePic.style.outlineOffset = "2px";

    profilePic.classList.add("editable");

    profilePic.addEventListener("click", () => {
        fileInput.click();  // opens file picker
    });
}