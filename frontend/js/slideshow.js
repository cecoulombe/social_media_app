/**
 * File: slideshow.js
 * Description: Allows the user to use the controls to navigate through multiple images on each post
 * Author: Caitlin Coulombe
 * Created: 2025-05-26
 * Last Updated: 2025-05-26
 */

"use strict";

// after rendering each post, create the slideshow
function setupSlideshow(postElement) {
    const slides = postElement.querySelectorAll(".slides");
    const dots = postElement.querySelectorAll(".dot");
    const prev = postElement.querySelector(".prev");
    const next = postElement.querySelector(".next");

    
    if (slides.length === 0) return;
    
    let currentIndex = 0;

    function showSlide(n) {
        console.log("Running showSlide with n =", n, "slides length =", slides.length);

        if(n >= slides.length) {
            n = 0;
        }

        if(n < 0) {
            n = slides.length - 1;
        }

        slides.forEach(slide => {
            slide.classList.remove("active");
            slide.style.display = "none";
        });        
        dots.forEach(dot => dot.classList.remove("active"));

        slides[n].classList.add("active");
        slides[n].style.display = "block";
        if(dots[n]) {
            dots[n].classList.add("active");
        }

        currentIndex = n;
    }

    if(prev && next) {
        prev.addEventListener("click", () => showSlide(currentIndex - 1));
        next.addEventListener("click", () => showSlide(currentIndex + 1));
    }

    dots.forEach((dot, idx) => {
        dot.addEventListener("click", () => showSlide(idx));
    });

    showSlide(0);
}