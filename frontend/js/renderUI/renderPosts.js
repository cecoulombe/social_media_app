/**
 * File: renderPosts.js
 * Description: Uses the template in index.html to create a post. Contains all of the logic related to rendering a post
 * Author: Caitlin Coulombe
 * Created: 2025-05-20
 * Last Updated: 2025-06-28
 */

"use strict";

let postTemplate = null;

// load the template from template.html
async function loadPostTemplate() {
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
    console.log("from render multiple posts:",posts);

    await loadPostTemplate();

    const container = document.getElementById("postsContainer");

    // clear any old posts
    container.innerHTML = "";

    for (const post of posts) {
        // clone the template
        const clone = postTemplate.content.cloneNode(true);
        // get the .post element inside the fragment
        const postElement = clone.querySelector(".post");
        postElement.id = post.id;

        // console.log(post.id);

        // RENDER THE POST DATA
        // PROFILE PICTURE
        const profilePic = postElement.querySelector(".profilePic");
        if(post.author.profile_pic) {
            // console.log("Has a profile pic: " + post.author.profile_pic.url)
            profilePic.src = "http://localhost:9000/" + post.author.profile_pic.url;
            profilePic.alt = post.author.profile_pic.filename;
        } else {
            profilePic.src = "../res/img/default_icon.png";
            profilePic.alt = "Default icon"
        }

        profilePic.addEventListener("click", () => {
            window.location.href = `user.html?user_id=${post.author.id}`;
        });
    
        // AUTHOR
        const postAuthor = postElement.querySelector(".postAuthor");
        postAuthor.textContent = post.author.display_name;

        postAuthor.addEventListener("click", () => {
            window.location.href = `user.html?user_id=${post.author.id}`;
        });
        
        // TIMESTAMP
        const timestampDate = postElement.querySelector(".date");
        const timestampTime = postElement.querySelector(".time");
        const date = new Date(post.created_at);
        const formattedDate = date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric"
        });
        timestampDate.textContent = formattedDate;

        const formattedTime = date.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true
        });
        timestampTime.textContent = formattedTime;

        // CONTENT
        const postContent = postElement.querySelector(".postContent");
        const contentContainer = postElement.querySelector(".contentContainer");
        postContent.textContent = post.content;
        if(!post.content)
        {
            contentContainer.style.display="none";
        }

        // LIKE COUNT
        const likeCount = postElement.querySelector(".likeCounter");
        likeCount.textContent = post.like_count; 
        
        // COMMENT COUNT
        const commentCount = postElement.querySelector(".commentCounter");
        commentCount.textContent = post.comment_count; 
    
        // OTHER COMPONENTS
        // LIKE BUTTON
        await renderPost_likeButton(post, postElement, likeCount);

        // UPDATE BUTTON
        await renderPost_updateButton(post, postElement);

        // MEDIA
        await renderPost_media(post, postElement);

        // COMMENTS
        await renderPost_comments(post, postElement, post.comment_count);
        // loadAll = false by default so that not all of the comments are loaded. Calls from either the reply or see all button will say true to load all posts

        // add the postElement to the container
        container.appendChild(postElement); 

        setTimeout(() => setupSlideshow(postElement), 0);
    }
}

/**
 * Renders the like button for the current iteration
 *
 * @async
 * @function renderPost_likeButton
 * @param {int} likeCount - the number of likes on the post
 * @param {*} post - the current json data for the post that is being rendered
 * @param {*} postElement - the post element that is currently being created to append to the page
 */
async function renderPost_likeButton(post, postElement, likeCount) {
    // change the like button based on if its been liked or not
    const likeButton = postElement.querySelector(".likeButton");
    likeButton.innerHTML = ""; // clear old content

    let heartImg = document.createElement("img");
    heartImg.classList.add("likeButtonImg")

    if(await getIsLiked(post.id)) {
        // console.log("is liked");
        heartImg.src = "../res/img/full_heart.png";
    } else {
        // console.log("is NOT liked");
        heartImg.src = "../res/img/empty_heart_red.png";
    }

    likeButton.appendChild(heartImg);

        likeButton.addEventListener("click", async () => {
        await likePost(post.id);
        const isLiked = await getIsLiked(post.id);
        if(isLiked) {
            // console.log("is liked");
            heartImg.src = "../res/img/full_heart.png";
        } else {
            // console.log("is NOT liked");
            heartImg.src = "../res/img/empty_heart_red.png";
        }
        likeCount.textContent = await getLikeCount(post.id);
    });
}

/**
 * Renders the update button for the current iteration
 *
 * @async
 * @function renderPost_updateButton
 * @param {*} post - the current json data for the post that is being rendered
 * @param {*} postElement - the post element that is currently being created to append to the page
 */
async function renderPost_updateButton(post, postElement) {
    const updateButton = postElement.querySelector(".updateButton");

    // make sure only the poster can edit the post
    if(current_user != post.author.email) {
        updateButton.style.display = "none";
    }

    // add an event listener to the update button
    postElement.querySelector(".updateButton").addEventListener("click", (event) => {
        event.preventDefault();
        createUpdateForm(post.id);
        const currentPage = window.location.pathname.split("/").pop();
        // console.log("Current page:", currentPage);
        // window.location.href = currentPage + "#" + post.id;
        window.location.hash = post.id;
    });
}

/**
 * Renders the media section for the current iteration
 *
 * @async
 * @function renderPost_media
 * @param {*} post - the current json data for the post that is being rendered
 * @param {*} postElement - the post element that is currently being created to append to the page
 */
async function renderPost_media(post, postElement) {
    let prevArrow;
    let nextArrow;

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
}

/**
 * Renders the comment section for the current iteration
 *
 * @async
 * @function renderPost_comments
 * @param {int} commentCount - the number of comments on the post
 * @param {*} loadAll - a flag used to decide how many posts to load
 * @param {*} post - the current json data for the post that is being rendered
 * @param {*} postElement - the post element that is currently being created to append to the page
 */
async function renderPost_comments(post, postElement, commentCount) {
    // show the first three parent comments
    const commentContainer = postElement.querySelector(".commentContainer");
    const comments = await getComments_Home(post.id);
    
    // console.log("IN RENDER UI, FROM GET COMMENTS PARENTS: ", comments);

    const loadCommentsButton = document.createElement("button");
    loadCommentsButton.classList.add("loadCommentsButton", "text-center");

    // render parent comments
    if(comments && comments.length > 0) {
        // console.log("Dont display all");
            for (const comment of comments) {
                const commentElement = await renderParentComment(comment, commentContainer);
                
                // REPLY BUTTON LISTENER
                const replyButton = commentElement.querySelector(".replyButton");
                replyButton.onclick = async (event) => {
                    event.preventDefault();
                    // console.log("Reply clicked for comment ID:", comment.id);
                    await renderPost_allComments(post, postElement, comment.id);
                };

                // EDIT BUTTON LISTENER
                const editButton = commentElement.querySelector(".editButton");
                editButton.onclick = async (event) => {
                    event.preventDefault();

                    console.log("Editting a parent from home");
                    // console.log("Reply clicked for comment ID:", parent.id);
                    await createCommentUpdateForm(post, postElement, commentElement, comment.id);

                    // await renderPost_allComments(post, postElement, null);
                };
            }
            
            if(commentCount > 3) {
                loadCommentsButton.textContent = "See more comments";
                commentContainer.appendChild(loadCommentsButton);
            } else {
                loadCommentsButton.textContent = "Add comment";
                commentContainer.appendChild(loadCommentsButton);
            }
    } else {
        // console.log("No comments, showing the add comment button");
        // commentContainer.style.display = "None";

        loadCommentsButton.textContent = "Add the first comment!";
        commentContainer.appendChild(loadCommentsButton);
        // replace with a "there are no comments button, add one?"
    }

    loadCommentsButton.onclick = async (event) => {
        event.preventDefault();

        // console.log("LOADING ALL COMMENTS");
        await renderPost_allComments(post, postElement, null);

        // load only this post with all of its comments, included children, formatted properly, but keep the rest of the posts? more like fb than ig
        // add a text area where users can add their comment then append it to the POST but NO PARENT
        // on submit, reload the homepage with this element in focus and all comments loaded
    };
}


/**
 * Renders the comment section for the current iteration
 *
 * @async
 * @function renderPost_allComments
 * @param {int} parent_id - refers to the id of the parent if the user clicked to add a reply. If null, the user just loaded all, not a reply specifically
 * @param {*} post - the current json data for the post that is being rendered
 * @param {*} postElement - the post element that is currently being created to append to the page
 */
async function renderPost_allComments(post, postElement, parent_id) {
    // show the first three parent comments
    const commentContainer = postElement.querySelector(".commentContainer");
    commentContainer.innerHTML = "";
    const comments = await getComments(post.id)
    
    // console.log("IN RENDER UI, FROM GET ALL COMMENTS: ", comments);

    // Text area for adding a comment
    const newCommentForm = document.createElement("form");
    newCommentForm.id = "newCommentForm";

    const commentContent = document.createElement("textarea");
    commentContent.name = "commentContent";
    commentContent.id = "commentContent";
    commentContent.required = true;
    commentContent.placeholder = "What do you want to say?";
    
    const submitComment = document.createElement("input");
    submitComment.type = "submit";
    submitComment.id = "submitComment";


    // add a listener to create a new comment or reply
    submitComment.onclick = async (event) => {
        event.preventDefault();
        const newComment = commentContent.value;

        // console.log("In renderPosts, content = " + newComment);
        
        await createComment(post.id, parent_id, newComment);

        await renderPost_allComments(post, postElement, null);
    }

    newCommentForm.appendChild(commentContent);
    newCommentForm.appendChild(submitComment);

    // render parent comments
    if(comments && comments.length > 0) {
        // split the comments into parents and children
        const parents = [];
        const children = [];

        for(const comment of comments) {
            if(comment.parent_id === null || comment.parent_id === undefined) {
                // console.log("This is a parent: ", comment);
                parents.push(comment);
            } else {
                // console.log("This is a child: ", comment)
                children.push(comment);
            }
        }

        // sort chronologically
        parents.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        children.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

        // console.log("Parents: ", parents);
        // console.log("Children: ", children);

        // for each parent: load it, get its child container, give it all its children
        for (const parent of parents) {
            // console.log("Rendering parent: ", parent);
            const commentElement = await renderParentComment(parent, commentContainer);
            
            // REPLY BUTTON LISTENER
            const replyButton = commentElement.querySelector(".replyButton");
            replyButton.onclick = async (event) => {
                event.preventDefault();
                // console.log("Reply clicked for comment ID:", parent.id);
                await renderPost_allComments(post, postElement, parent.id);

                // actually let the user reply to the comment, but don't need to re-render the whole thing again
            };

            // EDIT BUTTON LISTENER
            const editButton = commentElement.querySelector(".editButton");
            editButton.onclick = async (event) => {
                event.preventDefault();

                console.log("Editting a parent");
                // console.log("Reply clicked for comment ID:", parent.id);
                await createCommentUpdateForm(post, postElement, commentElement, parent.id);

                // await renderPost_allComments(post, postElement, null);
            };
            
            // console.log("Need to append children now");
            const childContainer = commentElement.querySelector(".childContainer");

            for (const child of children) {
                // console.log(`Checking if child ${child.id} belongs to parent ${parent.id}`);
                // console.log("child.parent_id type:", typeof child.parent_id, "value:", child.parent_id);
                // console.log("parent.id type:", typeof parent.id, "value:", parent.id);

                if (Number(child.parent_id) === Number(parent.id)) {
                    // console.log(`Match found! child ${child.id} belongs to parent ${parent.id}`);
                    const childElement = await renderChildComment(child, childContainer);
                    childContainer.style.display = "block";
                            
                    // EDIT BUTTON LISTENER
                    const editButton = childElement.querySelector(".editButton");
                    editButton.onclick = async (event) => {
                        event.preventDefault();
                        console.log("Editting a child");
                        // console.log("Reply clicked for comment ID:", parent.id);
                        await createCommentUpdateForm(post, postElement, childElement, child.id);

                        // await renderPost_allComments(post, postElement, null);
                    };
                }
            }

            if(parent_id != null && parent_id == parent.id) {
                // console.log("Adding a reply to comment " + parent_id + ", show the reply text area");
                childContainer.appendChild(newCommentForm);
                childContainer.style.display = "block";
            }
        }
    } 
    if(parent_id == null) {
        // console.log("Not adding a reply (" + parent_id + "), show the generic text area");
        commentContainer.appendChild(newCommentForm);
    }
}

/**
 * Fills in the existing value for the content and makes the form visible.
 *
 * @async
 * @function createUpdateForm
 * @param {int} post_id - the id of the post that is being edited
 */
async function createUpdateForm(post_id){
    const currentPage = window.location.pathname.split("/").pop();
    // console.log("Current page:", currentPage);

    // window.location.href = currentPage + "#" + post_id;
    window.location.hash = post_id;

    const post = await getPost(post_id);    
    // console.log(post);

    const postElem = document.getElementById(post_id);

    // create a form where the content is
    // empty the content container
    const contentContainer = postElem.querySelector(".contentContainer");
    contentContainer.innerHTML = "";

    // hide the update button and show the delete post button instead
    const updateButton = postElem.querySelector(".updateButton");
    updateButton.style.display = "none";
    const deleteButton = postElem.querySelector(".deleteButton");
    deleteButton.style.display = "block";

    deleteButton.onclick = async (event) => {
        event.preventDefault();

        // confirm delete
        const deleteConfirm = window.confirm("Are you sure you want to delete this post?");
        if (deleteConfirm) {
            // console.log("Delete the post");
            await deletePost(post_id);
            await reloadPage();
        } else {
            console.log("Delete post cancelled");
        }
    };

    // fill it with a form
    const updateForm = document.createElement("form");
    updateForm.id = "updateForm";

    // form elements
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
        // window.location.reload;
        // await getPosts();
        await reloadPage();

        const updatedPost = document.getElementById(post_id);
        if(updatedPost) {
            updatedPost.scrollIntoView({behavior: "smooth", block: "start"});
        }
    });
}

/**
 * Fills in the existing value for the content and makes the form visible.
 *
 * @async
 * @function createCommentUpdateForm
 * @param {*} comment - the comment element that is being edited
 * @param {int} comment_id - the id of the comment that is being edited
 */
async function createCommentUpdateForm(post, postElement, commentElem, comment_id){
    // create a form where the content is
    // empty the content container after getting the original value

    console.log("Comment id: " + comment_id);

    const content = commentElem.querySelector(".commentContent").innerHTML;
    // console.log("Old content: " + content);

    // console.log("Comment to edit: ", commentElem);

    const contentContainer = commentElem.querySelector(".commentContent");
    contentContainer.innerHTML = "";

    // hide the update button and show the delete post button instead
    const editButton = commentElem.querySelector(".editButton");
    editButton.style.display = "none";
    const deleteCommentButton = commentElem.querySelector(".deleteCommentButton");
    deleteCommentButton.style.display = "block";

    deleteCommentButton.onclick = async (event) => {
        event.preventDefault();

        // confirm delete
        const deleteConfirm = window.confirm("Are you sure you want to delete this comment?");
        if (deleteConfirm) {
            console.log("Delete the post"); 
            await deleteComment(comment_id);
            await renderPost_allComments(post, postElement, null);
        } else {
            console.log("Delete post cancelled");
        }
    };

    // fill it with a form
    const updateForm = document.createElement("form");
    updateForm.id = "updateForm";

    // form elements
    const updateContent = document.createElement("textarea");
    
    updateContent.name = "updateContent";
    updateContent.id = "updateContent";

    updateContent.value = content;
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
        
        await updateComment(newContent, comment_id);
        // window.location.reload;
        // await getPosts();
        

        // const updatedComment = document.getElementById(comment_id);
        // if(updatedComment) {
        //     updatedComment.scrollIntoView({behavior: "smooth", block: "start"});
        // }
        await renderPost_allComments(post, postElement, null);

    });
}