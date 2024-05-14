# Cinema Fullstack

This project aims to create a full-stack web application for managing a cinema. It includes both the backend and frontend components.

## Backend: Django REST Framework

The backend of the application is built using Django REST Framework (DRF), a powerful toolkit for building Web APIs in Django. It provides a flexible and powerful set of tools for building APIs.

## Frontend: Vue.js

The frontend of the application is built using Vue.js, a progressive JavaScript framework for building user interfaces. Vue.js allows us to create interactive and dynamic user interfaces with ease.

Connection between Backend and Frontend

The connection between the backend and frontend is implemented using RESTful APIs. The backend exposes RESTful endpoints using DRF, which the frontend consumes to fetch and manipulate data. This allows for a decoupled architecture where the frontend and backend can be developed and deployed independently.

### Project Structure

 - backend/: Contains the Django project and application files for the backend.
 - frontend/: Contains the Vue.js project files for the frontend.
 - README.md: This file provides instructions and information about setting up and running the project.

## Getting Started

To get started with the project, follow these steps:

Clone the repository to your local machine:
```
git clone https://github.com/Evheniia96/py-cinema-full-stack.git
```

## Run with Docker
Docker should be already installed

```
docker-compose up --build
```
- Open your web browser and go to http://127.0.0.1:5173 to access the Vue.js frontend.
- The Django backend is accessible at http://127.0.0.1:8080.

## Stop server
```
docker-compose down
```
