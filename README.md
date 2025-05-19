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
- Create posts
- Comment on posts
- Like posts
- Add friends

The backend API is partially functional, and users can interact with it through Postman for testing purposes.

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
   http://127.0.0.1:8000

---

## **Usage**
You can test the backend API by using Postman or by visiting the interactive API docs provided by FastAPI:
* Swagger UI: http://127.0.0.1:8000/docs
* ReDoc: http://127.0.0.1:8000/redoc

---

## **API Documentation**
The backend exposes several endpoints to manage posts and users. Other functionality will be added in the future (i.e. commentting on posts, liking posts, friendships with other users)

### Base URL:
http://127.0.0.1:8000

### Endpoints:
- Posts
   1. GET /posts
      * Fetches a list of all posts
   2. POST / posts
      * Creates a new post. Requires a JSON payload with post content
   3. GET /posts/{id}
      * Fetches a specific post by its ID
   4. DELETE /posts/{id}
      * Deletes a specific post by its ID
   5. PUT /posts/{id}
      * Updates a single post by its ID. Uses PUT functionality and replaces the entire database entry with a new entry
- Users
  1. POST /users
      * Creates a new user. Requires a JSON payload with user content. Hashes the password before inserting it into the database 
  3. GET /users/{id}
      * Fetches a single user by its ID, retutning all fields except the password
- Auth
  1. POST /login
      * Verifies the attempted username and password and generates a JWT token on a successful attempt, granting the user access.
- Like
  1. POST /like
      * Allows the user to add a like to a post they have not previously liked or to remove a like from a post they have already liked.
    
---

## **Technologies Used**
- Frontend: (to be added)
- Backend: FastAPI, Uvicorn
- Database: PostgreSQL
 
