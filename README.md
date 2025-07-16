# Social Media Web Application

A small social media web application for users to interact with each other. This project is focused on deepening my understanding of database management and APIs while creating a platform for users to post content, comment, and connect with friends.

## Table of Contents
- [Project Overview](#project-overview)
- [Hosted Demo](#hosted-demo)
- [Installation](#installation)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [Technologies Used](#technologies-used)
- [Hosting Services](#hosting-services)

---

## Project Overview

This web application allows users to:

- Create, view, update, and delete posts
- Comment on posts and reply to other comments (nested comments)
- Like and unlike posts
- Update their display name and profile picture

Both the frontend and backend are implemented with full CRUD functionality.

---

## Hosted Demo

You can now try out the demo version of the app without installing anything.

**Access the hosted version here:**  
[https://demo.createabuzz.ca](https://demo.createabuzz.ca)

Use the following credentials to sign in:

- **Email:** `demo@example.com`
- **Password:** `pass123`

Anyone can log in with this account to explore the app's features.

**Performance Notes**

- The backend is hosted on a free instance of Render, which enters sleep mode after periods of inactivity. As a result, the **first request (such as logging in)** may take **up to 50 seconds** to respond while the server spins back up. Subsequent interactions will be much faster.

- The database is running on a cost-optimized AWS RDS instance. This may cause **slightly longer load times** when fetching or submitting data.  
  When submitting a new post or comment, please **click the Submit button once** and allow a few seconds for the action to complete to avoid duplicate entries.

---

## Installation

To get started with this project locally:

1. Clone this repository:
   ```bash
   git clone https://github.com/cecoulombe/social-media-web-app.git
2. Navigate to the project directory:
   ```bash
   cd social_media_app
3. (Optional) Create and activate a virtual environment:
   ```bash
   python3 -m venv .venv
   source .venv/bin.activate   # On Windows: .venv/Scripts/activate
4. Install the required dependencies:
   ```bash
   pip install -r requirements.txt
5. Start the FastAPI server using uvicorn:
   ```bash
   uvicorn app.main:app --reload
6. The API will be availabe at:
   http://127.0.0.1:9000

---

## Usage

You can test the backend API using:

- **Swagger UI:** [http://127.0.0.1:9000/docs](http://127.0.0.1:9000/docs)  
- **ReDoc:** [http://127.0.0.1:9000/redoc](http://127.0.0.1:9000/redoc)

---

## API Documentation

### Base URL

- **Local:** `http://127.0.0.1:9000`  
- **Hosted:** `https://demo.d3hhdjdcpgfljz.amplifyapp.com`

---

### Endpoints

#### Authentication

- `POST /login`  
  Log in and receive an access token.

- `POST /register`  
  Create a new user account.

---

#### Users

- `POST /users`  
  Create a new user.

- `GET /users/get-user/{email}`  
  Fetch user by email.

- `GET /users/{id}`  
  Fetch user by ID.

- `PUT /users/update-name/{id}`  
  Update a user's display name.

- `POST /users/verify-password/{id}`  
  Verify a password before deletion.

- `DELETE /users/{id}`  
  Delete a user account.

---

#### Posts

- `GET /posts`  
  Fetch all posts. Supports the following optional query parameters:  
  `?limit=<int>&skip=<int>&search=<str>&published=<bool>`

- `GET /posts/{id}`  
  Fetch a specific post by ID.

- `GET /posts/get-user/{id}`  
  Fetch posts by a specific user.

- `POST /posts`  
  Create a new post.

- `PUT /posts/{id}`  
  Update a post.

- `DELETE /posts/{id}`  
  Delete a post.

---

#### Likes

- `POST /like`  
  Like or unlike a post.

- `GET /like/{id}`  
  Return like status of a post for the current user.

---

#### Comments

- `GET /comment/{post_id}`  
  Fetch all comments for a post.

- `GET /comment/parent/{post_id}`  
  Fetch parent comments (used on homepage).

- `POST /comment/{post_id}`  
  Create a new parent comment.

- `POST /comment/{post_id}/{parent_id}`  
  Create a reply to a comment.

- `PUT /comment/{comment_id}`  
  Update a comment.

- `DELETE /comment/{comment_id}`  
  Delete a comment.

---

#### Media

- `POST /media/upload/{post_id}`  
  Upload up to 9 media files for a post.

- `GET /media/by-id/{post_id}`  
  Get all media for a post.

- `POST /media/profile/upload/{user_id}`  
  Upload a profile picture (default if new).

- `GET /media/by-user/{user_id}`  
  Get a user's profile picture.

- `PUT /media/profile/update/{user_id}`  
  Update a user's profile picture.

---

## Technologies Used

- **Frontend:** HTML, CSS, JS
- **Backend:** FastAPI, Uvicorn
- **Database:** PostgreSQL

---

## Hosting Services

This project is deployed using a combination of cloud services to handle different parts of the application stack:

- **Frontend:**  
  Hosted with [AWS S3](https://aws.amazon.com/s3/)  
  URL: [https://demo.createabuzz.ca](https://demo.createabuzz.ca)

- **Backend (FastAPI):**  
  Deployed on [Render](https://render.com/) for automatic builds and scalable API hosting
  In the process of migrating backend from Render to AWS Lambda as of July 16, 2025

- **Database:**  
  Hosted on [AWS RDS](https://aws.amazon.com/rds/) using PostgreSQL

- **Media Storage:**  
  Uploaded images and profile pictures are stored in [AWS S3](https://aws.amazon.com/s3/) buckets

_Last updated: July 16, 2025_
