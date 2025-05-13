# Social Media Web Application

A small social media web application for users to interact with each other. This project is focused on learning datanase management and APIs while creating a platform for users to post content, comment, and connect with friends.

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
   cd social_media_app/Learning/FastAPI
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
   ```bash
   http://127.0.0.1:8000

---

## **Usage**
You can test the backend API by using Postman or by visiting the interactive API docs provided by FastAPI:
* Swagger UI: http://127.0.0.1:8000/docs
* ReDoc: http://127.0.0.1:8000/redoc
   
   

 
