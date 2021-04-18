# ACI Learning Exercise

This project is composed of two parts:
1. A small PostgreSQL Dockerfile with some initalization code for persistent storage
2. A Loopback project for the API's backend

## How to Run

If you have Docker installed:
1. Clone this repository
2. `cd` into the project directory
3. Run `docker-compose up` to run the Docker containers

The API is available on Port `3000`.

# Tech Stack

## PostgreSQL

PostgreSQL was chosen because it is a powerful object-relational database. Although this specific assignment did not require complex data structure hierarchies and relationships, a Course Manager could potentially be a part of a large-scale project with Course types and inheritance, etc.

All PostgreSQL-related code can be found in `db/`.

## LoopBack

LoopBack is an Express-based "Node.js and TypeScript framework for building APIs and microservices."

This was chosen over something more ubiquitous, like Express, because of its strict typing, due to TypeScript. This typing allows LoopBack to utilize Models for data structure, further ensuring safety in transactions between client, server, and the database.

All LoopBack-related code can be found in `aci-learning-exercise/`.

### Structure

The primary areas that were created and modified within the LoopBack project were:
- `/src/controllers`
- `/src/datasources`
- `/src/models`
- `/src/repositories`

#### Controllers

The Controller handles much of the business logic linking REST calls to CRUD operations, and communicating with a particular Repository to move data back and forth from the database.


#### DataSources

Data Sources link to specific data sources, in this case to a PostgreSQL database hosted in a sibling Docker container.


#### Models

The models simple house the structure and typing of the data, as well as some additional metadata.


#### Repositories

Repositories act as a service, linking a DataSource to a REST/CRUD Controller for a particular base url (in this case `/courses`).
