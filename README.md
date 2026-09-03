# cohort-9-java-8620-syed
Cohort 9 — JAVA Fullstack (JAVA+ReactJS) assignment for Syed Muhammad Fuzail
Contact Management System

A full-stack Contact Management System built as part of the 10Pearls Java Full Stack internship. The project provides a secure Spring Boot REST API, a React/Vite frontend, SQL Server persistence, JWT authentication, automated testing, code coverage, and SonarQube code-quality analysis.

Table of Contents

Project Overview

Features

Architecture

Technology Stack

Project Structure

Backend

Backend Architecture

Authentication and Security

Backend API

Validation and Error Handling

Database

Flyway Migrations

Backend Testing

JaCoCo Coverage

Frontend

Frontend Pages

Routing

Authentication Context

API Integration

Forms and Validation

Toast Notifications

Frontend Testing

SonarQube Integration

Backend SonarQube

Frontend SonarQube

Coverage Integration

Run Analysis

Current Frontend Quality Result

Installation and Setup

Running the Application

Testing Commands

Build Commands

Environment and Security

Git and Pull Request Workflow

Troubleshooting

Development Notes

Project Overview

The Contact Management System allows authenticated users to manage their personal contacts through a web application.

The system consists of two main applications:

Backend — Java/Spring Boot REST API

Frontend — React/Vite single-page application

The backend communicates with Microsoft SQL Server for persistent storage.

The frontend communicates with the backend through REST APIs using Axios.

Authentication is implemented using stateless JWT tokens.

High-Level Flow

                         Contact Management System
                                    |
                    +---------------+---------------+
                    |                               |
                Frontend                         Backend
             React + Vite                   Spring Boot REST API
                    |                               |
                    |          HTTP/JSON             |
                    +------------------------------>|
                                                    |
                                             Spring Security
                                                    |
                                               JWT Filter
                                                    |
                                                Services
                                                    |
                                              Repositories
                                                    |
                                               Hibernate/JPA
                                                    |
                                               SQL Server

Features

Authentication

User registration

User login

JWT-based authentication

Authenticated-user profile retrieval

Change password

BCrypt password hashing

Stateless Spring Security configuration

Protected frontend routes

Automatic JWT Authorization header through Axios

Contact Management

Authenticated users can:

View contacts

Search contacts

Paginate contacts

View an individual contact

Create contacts

Edit contacts

Delete contacts

Store multiple email addresses

Store multiple phone numbers

Assign labels to email and phone entries

Frontend User Experience

React single-page application

Client-side routing

Protected routes

Form validation

Loading states

Error handling

Toast notifications

Responsive contact-management workflow

Dynamic email and phone fields

Quality and Testing

Backend unit/integration testing

Frontend component/page testing

Vitest

React Testing Library

Testcontainers for SQL Server testing

JaCoCo backend coverage

Vitest/V8 frontend coverage

SonarQube static analysis

SonarQube Quality Gate

Architecture

Overall Architecture

Browser
   |
   | HTTP / JSON
   v
React + Vite Frontend
   |
   | Axios
   | Authorization: Bearer <JWT>
   v
Spring Boot REST API
   |
   +--> Spring Security / JWT
   |
   +--> Controllers
   |
   +--> Services
   |
   +--> Repositories
   |
   +--> Hibernate / JPA
   |
   v
Microsoft SQL Server

Backend Layering

Controller
    |
    v
Service
    |
    v
Repository
    |
    v
Database

Cross-cutting functionality includes:

JWT security

Validation

Exception handling

Logging

Database migrations

Technology Stack

Backend

Technology

Purpose

Java 21

Programming language

Spring Boot 4.1.0

Backend framework

Spring Web MVC

REST API

Spring Data JPA

Persistence

Hibernate

ORM

Spring Security

Authentication and authorization

JJWT 0.12.6

JWT handling

BCrypt

Password hashing

Microsoft SQL Server

Database

Flyway

Database migrations

Maven Wrapper

Build and dependency management

JUnit / Spring Boot Test

Automated tests

Mockito

Mocking in tests where applicable

Testcontainers

SQL Server integration testing

JaCoCo 0.8.13

Code coverage

SonarQube Maven Scanner

Static analysis

SLF4J / Logback

Logging

Frontend

Technology

Purpose

React 19

User interface

React DOM

Browser rendering

Vite

Development/build tooling

React Router DOM

Client-side routing

Axios

API communication

Vitest

Test runner

React Testing Library

Component/page testing

Testing Library User Event

User interaction testing

Jest DOM

DOM assertions

jsdom

Browser-like test environment

V8 Coverage

Test coverage

Oxlint

Linting

sonar-scanner

SonarQube analysis

Project Structure

cohort-9-java-8620-syed/
│
├── backend/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/contactmanagement/backend/
│   │   │   │   ├── config/
│   │   │   │   ├── controller/
│   │   │   │   ├── dto/
│   │   │   │   ├── entity/
│   │   │   │   ├── exception/
│   │   │   │   ├── repository/
│   │   │   │   ├── security/
│   │   │   │   ├── service/
│   │   │   │   └── BackendApplication.java
│   │   │   └── resources/
│   │   │       ├── application.properties
│   │   │       └── db/migration/
│   │   └── test/
│   │       └── java/com/contactmanagement/backend/
│   ├── pom.xml
│   ├── mvnw
│   └── mvnw.cmd
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── test/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── index.css
│   ├── package.json
│   ├── package-lock.json
│   ├── vite.config.js
│   └── sonar-project.properties
│
└── README.md

Generated directories such as target, node_modules, coverage, .scannerwork, and build output are not intended to be committed.

Backend

Backend Architecture

The backend follows a layered architecture.

Controllers

The API controllers are:

AuthController

ContactController

Services

Business logic is separated into:

AuthService

ContactService

UserService

Repositories

Persistence is handled through:

UserRepository

ContactRepository

ContactEmailRepository

ContactPhoneRepository

Entities

The primary domain entities are:

User

Contact

ContactEmail

ContactPhone

DTOs

DTOs are used for API requests and responses, including:

Registration

Login

Change password

Contact requests/responses

Email and phone entries

User responses

Authentication and Security

The backend uses stateless JWT authentication.

Public endpoints

The following endpoints are available without authentication:

POST /api/auth/register
POST /api/auth/login

Protected endpoints

Authenticated requests require a valid JWT.

The JWT is sent through:

Authorization: Bearer <JWT>

The JwtAuthenticationFilter reads the Authorization header, validates/extracts the token information, and establishes the authenticated security context.

Spring Security is configured for:

Stateless sessions

Disabled form login

Disabled HTTP Basic authentication

JWT authentication filter

CORS

Protected application endpoints

BCrypt password encoding

Password Security

Passwords are encoded using:

BCryptPasswordEncoder

Passwords are never intended to be stored as plain text.

Backend API

Base URL:

http://localhost:8080/api

Authentication API

Register

POST /api/auth/register

Creates a new user.

Response:

201 Created

Login

POST /api/auth/login

Authenticates a user and returns login information including the JWT.

Response:

200 OK

Current User

GET /api/auth/me

Requires authentication.

Returns the currently authenticated user's information.

Change Password

PUT /api/auth/change-password

Requires authentication.

Changes the authenticated user's password after validating the request.

Contact API

Get Contacts

GET /api/contacts

Supports:

Search

Page number

Page size

Examples:

GET /api/contacts?page=0&size=10
GET /api/contacts?search=john&page=0&size=10

Page size is constrained to a maximum of 100.

Get Contact

GET /api/contacts/{id}

Returns one contact belonging to the authenticated user.

Create Contact

POST /api/contacts

Creates a contact.

A contact can contain:

First name

Last name

Title

Multiple emails

Multiple phone numbers

Update Contact

PUT /api/contacts/{id}

Updates an existing contact belonging to the authenticated user.

Delete Contact

DELETE /api/contacts/{id}

Deletes an existing contact.

Successful deletion returns:

204 No Content

Validation and Error Handling

The backend uses Jakarta Bean Validation.

Validation covers request fields such as:

Required values

Email format

Password length

Name length

Title length

Phone/email length

Nested email entries

Nested phone entries

Controllers use @Valid for request-body validation.

The application also validates pagination parameters.

GlobalExceptionHandler provides centralized exception handling so error processing is consistent across the API.

Database

The application uses:

Microsoft SQL Server

Database:

contact_management

Hibernate/JPA handles ORM and persistence.

Hibernate schema validation is configured with:

spring.jpa.hibernate.ddl-auto=validate

This means the application validates the existing schema rather than automatically generating or modifying it.

Flyway Migrations

Database schema changes are managed through Flyway.

Current migration files include:

V1__create_users_table.sql
V2__create_contacts_tables.sql
V3__fix_nullable_user_identifier_uniqueness.sql

Flyway provides version-controlled database schema evolution.

Important Migration Rule

Once a migration has already been applied, do not modify it casually.

For a new database change, create a new versioned migration.

Backend Testing

Backend tests are located under:

backend/src/test/java/

The project includes tests for:

Application startup/context

Authentication service

Contact service

Contact controller

Database-backed integration scenarios

Testcontainers is configured for SQL Server integration testing.

Run:

cd backend
.\mvnw.cmd test

JaCoCo Coverage

JaCoCo is configured in the backend Maven build.

Run:

cd backend
.\mvnw.cmd clean test

Coverage reports are generated under:

backend/target/site/jacoco/

Generated coverage/build files should remain untracked.

Frontend

Frontend Pages

The React application contains the following major pages:

Login

Authenticates an existing user.

/login

Register

Creates a new user account.

/register

Contacts

Displays the authenticated user's contacts.

/contacts

Add Contact

Creates a new contact.

/contacts/new

Contact Details

Displays a specific contact.

/contacts/:id

Edit Contact

Edits an existing contact.

/contacts/:id/edit

Profile

Displays and manages authenticated-user profile functionality.

/profile

Routing

React Router DOM is used for client-side routing.

Protected routes are wrapped with ProtectedRoute.

If an unauthenticated user attempts to access a protected route, the application redirects to:

/login

The application also handles:

/

by redirecting to login, and unknown routes are redirected to login.

Authentication Context

Authentication state is managed through:

frontend/src/context/AuthContext.jsx

The context manages:

Current user

Authentication state

Loading state

Login

Logout

On application startup, an existing token can be used to request:

GET /api/auth/me

If the token is no longer valid, the frontend clears the stored authentication token.

API Integration

Axios is configured in:

frontend/src/services/api.js

Base URL:

http://localhost:8080/api

The Axios request interceptor reads:

token

from browser local storage.

When a token is available, Axios adds:

Authorization: Bearer <JWT>

to API requests.

This connects the React frontend with the secured Spring Boot backend.

Forms and Validation

The frontend performs client-side validation before sending form data.

The Add Contact and Edit Contact pages support dynamic email and phone fields.

Each dynamic entry receives a stable identifier using:

crypto.randomUUID()

The identifier is used for React rendering and is removed before sending the API payload.

This avoids unstable index-based React keys.

The frontend also handles API validation and error responses.

Toast Notifications

Toast functionality is implemented using:

ToastContext.jsx
Toast.jsx

The context manages notification state while the reusable Toast component renders notifications.

The application uses toast feedback for successful operations and errors.

Frontend Testing

Frontend tests use:

Vitest

React Testing Library

Testing Library User Event

Jest DOM

jsdom

V8 coverage

Tests cover:

components/
context/
pages/
services/

Including:

Toast

Authentication context

Toast context

Login

Register

Contacts

Add Contact

Edit Contact

Profile

API service

Run all frontend tests:

cd frontend
npm test -- --run

Run coverage:

npm run test:coverage

SonarQube Integration

SonarQube is integrated into the project to perform static analysis and display quality metrics.

The project contains separate configurations for backend and frontend analysis.

Local SonarQube server:

http://localhost:9000

Backend SonarQube

Backend SonarQube properties are configured in pom.xml:

<sonar.projectKey>contact-management-backend</sonar.projectKey>
<sonar.projectName>Contact Management Backend</sonar.projectName>
<sonar.host.url>http://localhost:9000</sonar.host.url>

The Maven SonarQube scanner is configured with:

org.sonarsource.scanner.maven:sonar-maven-plugin

Version:

5.4.0.6343

Backend analysis can be run with:

cd backend
.\mvnw.cmd clean verify sonar:sonar

Frontend SonarQube

The frontend configuration is stored in:

frontend/sonar-project.properties

Current configuration:

sonar.projectKey=contact-management-frontend
sonar.projectName=Contact Management Frontend
sonar.projectVersion=1.0

sonar.sources=src
sonar.exclusions=**/node_modules/**,**/dist/**,**/src/assets/**

sonar.sourceEncoding=UTF-8

sonar.javascript.lcov.reportPaths=coverage/lcov.info

The frontend scanner is installed as a development dependency and can be executed with:

npx sonar-scanner

Coverage Integration

Frontend coverage is generated using Vitest and V8.

Run:

cd frontend
npm run test:coverage

The LCOV report is generated at:

frontend/coverage/lcov.info

SonarQube reads it through:

sonar.javascript.lcov.reportPaths=coverage/lcov.info

The complete quality workflow is:

React Source
    ↓
Vitest Tests
    ↓
V8 Coverage
    ↓
coverage/lcov.info
    ↓
SonarQube Scanner
    ↓
SonarQube Dashboard

Run Analysis

Frontend

Start SonarQube first, then:

cd frontend
npm install
npm run test:coverage
npx sonar-scanner

Backend

cd backend
.\mvnw.cmd clean verify sonar:sonar

Current Frontend Quality Result

The frontend SonarQube analysis has been successfully executed.

Current dashboard result:

Metric

Result

Quality Gate

PASSED

Security

A / 0

Reliability

B / 1

Maintainability

A / 22

Security Issues

0

Coverage

93.2%

Duplications

0.5%

Lines of Code

5.1k

Hotspots Reviewed

A

Quality Gate

The current frontend project has:

Quality Gate: PASSED

The existing reliability finding remains in the SonarQube report, but it does not prevent the current Quality Gate from passing.

Installation and Setup

Prerequisites

Install:

Backend

Java 21

Microsoft SQL Server

Docker Desktop if running Testcontainers integration tests

SonarQube if performing local analysis

Frontend

Node.js

npm

The project was developed/tested with:

Node.js: v24.12.0
npm: 11.12.0
Java: 21

Backend Setup

From the project root:

cd backend

The Maven Wrapper is included, so a global Maven installation is not required.

Make sure SQL Server is running and the required database is available.

The local backend configuration is kept separately in:

src/main/resources/application-local.properties

This file is ignored by Git because it contains local machine/database configuration.

Environment and Security

The JWT secret is not hardcoded in the shared application configuration.

The backend uses:

jwt.secret=${JWT_SECRET}

Set the secret locally through an environment variable.

PowerShell example:

$env:JWT_SECRET="your-base64-encoded-secret"

Do not commit:

JWT secrets

Database passwords

Private credentials

Local database configuration

The local database configuration file is intentionally ignored:

backend/src/main/resources/application-local.properties

Running the Application

The backend and frontend run separately.

Terminal 1 — Backend

cd D:\cohort-9-java-8620-syed\backend
.\mvnw.cmd spring-boot:run

Backend:

http://localhost:8080

Terminal 2 — Frontend

cd D:\cohort-9-java-8620-syed\frontend
npm install
npm run dev

Frontend:

http://localhost:5173

Application Flow

http://localhost:5173
        |
        | Axios
        v
http://localhost:8080/api
        |
        v
Microsoft SQL Server

Testing Commands

Backend

Run tests:

cd backend
.\mvnw.cmd test

Clean and test:

.\mvnw.cmd clean test

Frontend

Run tests once:

cd frontend
npm test -- --run

Run coverage:

npm run test:coverage

Run lint:

npm run lint

Build Commands

Backend

cd backend
.\mvnw.cmd clean package

Frontend

cd frontend
npm run build

Preview the production frontend:

npm run preview

Git and Pull Request Workflow

The project was developed using separate feature branches and pull requests.

Current implementation sequence:

PR01
Project Setup
    ↓
PR02
Backend Implementation
    ↓
PR03
Frontend Implementation + SonarQube Integration
    ↓
PR04
Documentation

PR01 — Project Setup

Branch:

feature/project-setup

Purpose:

Initial project structure

Initial setup/configuration

PR02 — Backend Implementation

Branch:

feature/backend-implementation

Purpose:

Spring Boot backend

REST APIs

Database

Authentication

JWT security

Contact management

Testing and backend quality configuration

PR03 — Frontend + SonarQube

Branch:

feature/frontend-implementation

Purpose:

React frontend

Routing

Authentication UI

Contact-management UI

Axios integration

Frontend tests

Coverage

SonarQube integration

PR04 — Documentation

The planned documentation PR is intended to contain the project's consolidated documentation.

The clean workflow is to create the documentation branch after PR03 has been merged, so PR04 does not accidentally include PR03's implementation commits.

Troubleshooting

Backend Cannot Connect to SQL Server

Check that:

SQL Server is running.

The contact_management database exists.

Local datasource configuration is correct.

The configured authentication method matches the JDBC connection configuration.

The SQL Server instance is accepting the expected connection.

Frontend Cannot Reach Backend

Verify the backend is running:

http://localhost:8080

Verify the frontend API service uses:

http://localhost:8080/api

Also verify that the backend CORS configuration allows:

http://localhost:5173

JWT Authentication Fails

Verify that:

JWT_SECRET

is set correctly.

PowerShell:

$env:JWT_SECRET="your-base64-encoded-secret"

If an old/invalid token is stored in browser local storage, log in again after clearing the invalid token.

Frontend Coverage Is Missing in SonarQube

Run:

cd frontend
npm run test:coverage

Verify:

coverage/lcov.info

exists.

Then run:

npx sonar-scanner

SonarQube Scanner Cannot Connect

Make sure SonarQube is running at:

http://localhost:9000

Then retry:

npx sonar-scanner

Generated Files Appear in Git

The frontend .gitignore excludes:

.scannerwork/
coverage/

The backend .gitignore excludes generated Maven output such as:

target/

Do not commit generated analysis/build directories.

Development Notes

Database Schema

Use Flyway migrations for schema changes.

Do not modify an already-applied migration unless you fully understand the migration/checksum implications. Prefer creating a new migration for new schema changes.

Security

Never place secrets directly in source code.

Use:

JWT_SECRET

for the JWT signing secret.

Keep:

application-local.properties

local and uncommitted.

React Dynamic Lists

Dynamic email and phone rows use stable generated IDs rather than array indexes as React keys.

This improves list rendering when entries are inserted or removed.

Generated Files

Do not commit:

backend/target/
frontend/node_modules/
frontend/dist/
frontend/coverage/
frontend/.scannerwork/

Complete Development Workflow

A normal development cycle is:

1. Start SQL Server
        ↓
2. Configure backend local settings
        ↓
3. Set JWT_SECRET
        ↓
4. Start Spring Boot backend
        ↓
5. Start React/Vite frontend
        ↓
6. Test application manually
        ↓
7. Run backend tests
        ↓
8. Run frontend tests
        ↓
9. Generate frontend coverage
        ↓
10. Run SonarQube analysis
        ↓
11. Review Quality Gate
        ↓
12. Commit changes
        ↓
13. Push feature branch
        ↓
14. Create Pull Request

Project Status

The Contact Management System currently includes:

Complete Spring Boot backend

SQL Server persistence

Flyway database migrations

JWT authentication

BCrypt password hashing

Protected REST APIs

Contact CRUD

Search and pagination

React/Vite frontend

Protected frontend routing

Axios API integration

Contact forms

Profile functionality

Toast notifications

Frontend automated tests

Backend automated tests

JaCoCo coverage

Frontend V8/LCOV coverage

SonarQube integration

Passing frontend SonarQube Quality Gate

Author

Syed Muhammad Fuzail

Java Full Stack Internship Project — 10Pearls