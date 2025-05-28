/*
 * File: validateLogin.js
 * Description: Ensures the information being submitted in the login and create new account forms is valid (i.e. matching email and password)
 * Author: Caitlin Coulombe
 * Created: 2025-05-24
 * Last Updated: 2025-05-24
 */

"use strict";

const createEmail = document.getElementById('createEmail');
const confirmEmail = document.getElementById('confirmEmail');
const matchEmail = document.getElementById('matchEmail');
const createPassword = document.getElementById('createPassword');
const confirmPassword = document.getElementById('confirmPassword');
const matchPassword = document.getElementById('matchPassword');
const submit = document.getElementById('submitNewAccount');

/**
 * Determines if the passed input are matching
 *
 * @function validateInputMatching
 * @param {string} input1 - the first input to compare
 * @param {string} input2 - the second input to compare
 * @returns {Boolean} Returns true if the inputs match exactly
 */

function validateInputMatching(input_1, input_2) {
    if(input_1 === input_2) {
        return true;
    }
    return false;
}

/**
 * Extracts the emails and determines if they are matching
 *
 * @function getEmails
 */

function getEmails() {
    console.log("into getEmail");
    const email_1 = createEmail.value;
    const email_2 = confirmEmail.value;

    if(!validateInputMatching(email_1, email_2)) {
        matchEmail.style.display = "block"
        submit.disabled = true;
        return;
    }
    matchEmail.style.display = "none"
    submit.disabled = false;
}

/**
 * Extracts the passwords and determines if they are matching
 *
 * @function getPasswords
 * @returns {Boolean} Returns true if the inputs match exactly
 */

function getPasswords() {
    const pass_1 = createPassword.value;
    const pass_2 = confirmPassword.value;

    if(!validateInputMatching(pass_1, pass_2)) {
        matchPassword.style.display = "block"
        submit.disabled = true;
        return;
    }
    matchPassword.style.display = "none"
    submit.disabled = false;
}

createEmail.addEventListener('input', getEmails);
confirmEmail.addEventListener('input', getEmails);
createPassword.addEventListener('input', getPasswords);
confirmPassword.addEventListener('input', getPasswords);