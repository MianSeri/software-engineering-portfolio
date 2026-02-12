# Dog Adoption Platform API

A secure, production-style backend API for a Dog Adoption Platform, built with **Node.js, Express, MongoDB, and JWT authentication**.

This API allows users to register, authenticate, register dogs for adoption, adopt dogs with enforced business rules, and list registered or adopted dogs with pagination and filtering.

---

## Features ##
- User registration with **hashed passwords**
- User authentication with **JWT (24h expiration)**
- Protected routes using authentication middleware
- Dog registration by authenticated users
- Adoption flow with enforced business rules:
  - Users cannot adopt their own dogs
  - Adopted dogs cannot be adopted again
- Dog removal rules:
  - Only owners can remove dogs
  - Adopted dogs cannot be removed
- Listing endpoints with **pagination and filtering**
- Robust error handling with correct HTTP status codes
- Fully tested using **Mocha, Chai, and Supertest**

---

## Tech Stack ##
- Node.js
- Express.js
- MongoDB Atlas + Mongoose
- JWT (jsonwebtoken)
- bcrypt (password hashing)
- dotenv (environment variables)
- Mocha, Chai, Supertest (testing)

---

## Project Structure ##
.
├── controllers/
├── models/
├── routes/
├── middlewares/
├── tests/
├── app.js
├── db.js
├── .env
├── package.json
└── README.md

---

## Setup Instructions 

### Install dependencies
npm install

### Create a .env file
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/dog_adoption
JWT_SECRET=dog_adoption_secret
PORT=3000

### Run the server
npm run dev

Expected output:
Connected to MongoDB
Listening on 3000

### Run Tests ###
npm test

### All tests should pass:
7 passing

---

## Authentication Flow ##

- Register a user → POST /auth/register
- Login → POST /auth/login
- Receive JWT token
- Use token in headers:
Authorization: Bearer <token>

---

## API Endpoints ##
 # Auth
POST /auth/register
POST /auth/login
 # Dogs (Protected)
POST /dogs
POST /dogs/:id/adopt
DELETE /dogs/:id
GET /dogs/mine
GET /dogs/adopted

---

## Business Rules
Rule	Result
Auth required for protected routes	401 Unauthorized
Cannot adopt your own dog	403 Forbidden
Cannot adopt an adopted dog	409 Conflict
Cannot delete an adopted dog	409 Conflict
Cannot delete someone else’s dog	403 Forbidden
Owner can delete available dog	204 No Content

All rules were manually verified using Thunder Client and automated tests.

---

## Architecture Notes
Routes handle URL mapping
Controllers enforce business logic
Models manage database interaction
Middleware handles authentication
Clean separation of concerns for maintainability and scalability

---

## Notes
This project is an API-only backend intended to be consumed by frontend or mobile applications. All interactions are performed via HTTP requests returning JSON responses.

---
