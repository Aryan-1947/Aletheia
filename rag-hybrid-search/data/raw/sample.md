# Python FastAPI Guide

## Installation
Install FastAPI using pip: `pip install fastapi uvicorn`

## Creating Your First App
Create a file called main.py and add the following code to define routes.
FastAPI automatically generates OpenAPI documentation at /docs.

## Request Handling
FastAPI supports path parameters, query parameters, and request bodies.
Use Pydantic models to validate request data automatically.

## Error Handling
Use HTTPException to return error responses with status codes.
FastAPI handles validation errors automatically and returns 422 responses.