# Social Media Web Application

A small social media web application for users to interact with each other. This project is focused on deepening my understanding of database management and APIs while creating a platform for users to post content, comment, and connect with friends.

### **Table of Contents**
- [Project Overview](#project-overview)
- [Installation](#installation)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [Technologies Used](#technologies-used)

---

## **Project Overview**
This web application will allow users to:
- Create posts, view, update, and delete posts created by themselves and others
- Comment on posts and reply to other comments
- Like posts
- Update their display name and profile picture

Both the frontend and backend have the functionality described above using the path operations described below.

---

## **Installation**
To get started with this project, follow the steps below:

1. Clone this repository:
   ```bash
   git clone https://github.com/cecoulombe/social-media-web-app.git
2. Navigate to the project directory:
   ```bash
   cd social_media_app
3. (If needed) Create and activate a virtual environment:
   ```bash
   python3 -m venv .venv
   source .venv/bin/activate   # On Windows: .venv\Scripts\activate
4. Install the required dependencies:
   ```bash
   pip install -r requirements.txt
5. Start the FastAPI server using uvicorn:
   ```bash
   uvicorn app.main:app --reload
6. The API will be available at
   http://127.0.0.1:9000

---

## **Usage**
You can test the backend API by using Postman or by visiting the interactive API docs provided by FastAPI:
* Swagger UI: http://127.0.0.1:9000/docs
* ReDoc: http://127.0.0.1:9000/redoc

---

## **API Documentation**
The backend exposes several endpoints to manage posts and users. Other functionality will be added in the future (i.e. commentting on posts, liking posts, friendships with other users)

### Base URL:
http://127.0.0.1:9000

### Endpoints:
- Posts
   1. GET /posts
      * Fetches a list of all posts
   2. GET /posts/get-user/{id}
      * Fetches a list of all posts from a specific user
   3. GET /posts/{id}
      * Fetches a specific post by its ID
   4. POST /posts
      * Creates a new post. Requires a JSON payload with post content
   5. DELETE /posts/{id}
      * Deletes a specific post by its ID
   6. PUT /posts/{id}
      * Updates a single post by its ID. Uses PUT functionality and replaces the entire database entry with a new entry
- Users
  1. POST /users
      * Creates a new user. Requires a JSON payload with user content. Hashes the password before inserting it into the database 
  2. GET /users/get-user/{email}
      * Fetches a single user by its email, retutning all fields except the password
  3. GET /users/{id}
      * Fetches a single user by its ID, retutning all fields except the password
  4. PUT /users/update-name/{id}
      * Updates the user's stored display name
  5. POST /users/verify-password/{id}
      * Compares a password attempt to the stored password in the database to determine if the user has entered it correctly (used for deleting the user)
  6. DELETE /users/{id}
      * Deletes the user from the database based on ID
- Auth
  1. POST /login
      * Verifies the attempted username and password and generates a JWT token on a successful attempt, granting the user access.
- Like
  1. POST /like
      * Allows the user to add a like to a post they have not previously liked or to remove a like from a post they have already liked.
  2. GET /like/{id}
      * Returns 1 if the post has been liked by the current user (used to determine which heart icon to use, filled for liked and empty for not).
- Media
  1. POST /media/upload/{post_id}
      * Allows the user to add up to 9 posts (limited on the front end). The images are stored in the directory backent/media.
  2. GET /media/by-id/{post_id}
      * Retrieves all of the media related to a single post
  3. POST /media/profile/upload/{user_id}
      * Adds a profile picture to the user. Only a single profile picture can exist per user. This is called during new user creation and is filled with the default icon.
  4. GET /media/by-user/{user_id}
      * Gets the profile picture associated with the user id
  4. PUT /media/profile/update/{user_id}
      * Replaces the current profile picture for a user with a new one.
- Comment
   1. GET /comment/{post_id}
      * Fetches a list of all comments for a single post specified by id
   2. GET /comment/parent/{post_id}
      * Gets all of the parent comments for a post specified by id. Usually limited to 3 and used on the home page/user page
   3. POST /comment/{post_id}
      * Creates a new parent comment for a post
   4. POST /comment/{post_id}/{parent_id}
      * Creates a new child comment for a post. The parent of the comment is specified by id
   5. PUT /comment/{comment_id}
      * Updates a single comment based on its id
   6. DELETE /comment/{comment_id}
      * Deletes a specific comment by its id
---

## **Technologies Used**
- Frontend: (to be added)
- Backend: FastAPI, Uvicorn
- Database: PostgreSQL

 ## *Last updated: June 29, 2025*
