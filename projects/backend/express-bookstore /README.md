## Express Bookstore

A full-stack bookstore application built with Node.js, Express, PostgreSQL, and Axios.

This project demonstrates RESTful API architecture, schema validation, database integration, automated 
testing, and frontend-backend communication in a production-style environment.

## Impact & Highlights

- Designed and implemented 6 RESTful endpoints covering full CRUD functionality
- Built schema validation layer preventing invalid data writes (100% request validation coverage)
- Implemented centralized error handling middleware reducing duplicated error logic across routes
- Achieved full automated test coverage for core API endpoints using Jest & Supertest
- Structured PostgreSQL database with isolated test database for safe CI-style testing
- Built frontend integration consuming live API endpoints via Axios

## Features

## Backend
- RESTful CRUD API for books
- JSON Schema validation for request bodies
- Partial updates using PATCH
- Centralized error handling middleware
- PostgreSQL database with test isolation
- Automated tests using Jest and Supertest

## Frontend
- Load books from API
- Add new books
- Delete books
- Update book pages
- Async status messaging

## Tech Stack
- Node.js
- Express
- PostgreSQL
- Axios
- Jest
- Supertest

# Installation & Running Locally

# Clone the repository
git clone https://github.com/MianSeri/software-engineering-portfolio.git
cd express-bookstore

# Install dependencies
npm install

# Set up the database
Make sure PostgreSQL is running, then:
psql < data.sql

# Start the server
node server.js

# Server runs at:
http://localhost:3000

# Run Tests
npm test

## Project Structure
express-bookstore/
├─ app.js
├─ server.js
├─ routes/
├─ models/
├─ schemas/
├─ tests/
├─ frontend/
└─ package.json
