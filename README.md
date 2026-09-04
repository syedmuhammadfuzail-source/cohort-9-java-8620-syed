# Contact Management System

> **Cohort 9 — JAVA Fullstack (Java + ReactJS) assignment**  
> A full-stack Contact Management System built with **Java 21, Spring Boot, Spring Security, JWT, JPA/Hibernate, Flyway, Microsoft SQL Server, React, Vite, Axios, and Nginx**.

---

## 📌 Overview

The Contact Management System is a full-stack web application that allows authenticated users to maintain their personal contact list.

The application provides:

- User registration using **email or phone number**
- User login using **email or phone number**
- JWT-based authentication
- Protected application routes
- View, search, paginate, create, edit, and delete contacts
- Multiple email addresses per contact
- Multiple phone numbers per contact
- Labels for contact email addresses and phone numbers
- User profile
- Change-password functionality
- Form validation and error handling
- Toast notifications
- SQL Server persistence
- Flyway database migrations
- Dockerized frontend, backend, and database
- Automated backend and frontend tests
- JaCoCo test coverage support
- SonarQube configuration

---

## ✨ Main Features

### Authentication

The authentication module supports:

1. **Registration**
   - First name and last name
   - Email or phone number
   - Password
   - Duplicate email/phone validation
   - Password hashing using Spring Security's password encoder

2. **Login**
   - Login with either email or phone
   - JWT token generation after successful authentication
   - Invalid credentials are handled without exposing sensitive information

3. **Authenticated session**
   - JWT is stored by the frontend
   - Axios automatically sends the JWT as a `Bearer` token for protected API calls
   - Protected React routes redirect unauthenticated users to `/login`

4. **Change password**
   - Requires the current password
   - Requires a new password
   - Prevents reusing the current password

### Contact Management

Authenticated users can:

- View their contacts
- Search contacts by first or last name
- Navigate through paginated contact results
- Add a new contact
- Add multiple email addresses
- Add multiple phone numbers
- Assign labels such as work/personal
- Open a contact's details
- Edit an existing contact
- Delete a contact with confirmation

### User Profile

The profile page displays the authenticated user's information and provides access to:

- Change Password
- Logout

---

## 🖼️ Application Screenshots

The project already contains the screenshots in the `Screenshots/` directory.

### Login

The login screen allows a user to authenticate with an email address or phone number.

![Login Screen](<Screenshots/Screenshot 2026-09-03 105827.png>)

### Registration

The registration screen allows a new user to create an account.

![Registration Screen](<Screenshots/Screenshot 2026-09-03 105019.png>)

### Contacts List

The contacts page displays the user's contacts and provides search, pagination, and contact actions.

![Contacts List](<Screenshots/Screenshot 2026-09-03 105146.png>)

### Contact Details

The details page displays the selected contact, including email addresses, phone numbers, labels, and additional information.

![Contact Details](<Screenshots/Screenshot 2026-09-03 105306.png>)

### Edit Contact

The edit screen allows existing contact information, email addresses, and phone numbers to be updated.

![Edit Contact](<Screenshots/Screenshot 2026-09-03 105421.png>)

### Delete Confirmation

A confirmation dialog is shown before deleting a contact.

![Delete Confirmation](<Screenshots/Screenshot 2026-09-03 105650.png>)

### User Profile

The profile page displays the authenticated user's account information.

![User Profile](<Screenshots/Screenshot 2026-09-03 105721.png>)

### Change Password

The change-password dialog lets the authenticated user update their password.

![Change Password](<Screenshots/Screenshot 2026-09-03 105746.png>)

---

## 🏗️ Architecture

The application is organized as a three-part stack:

```text
                    ┌─────────────────────────┐
                    │       React Frontend     │
                    │   React + Vite + Axios   │
                    └────────────┬────────────┘
                                 │
                           HTTP / JSON
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │     Spring Boot API     │
                    │ Security + JWT + JPA    │
                    └────────────┬────────────┘
                                 │
                           JDBC / JPA
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │    Microsoft SQL Server │
                    │      contact_management │
                    └─────────────────────────┘
```

### Docker architecture

When using Docker Compose:

```text
Browser
   │
   ▼
localhost:3000
   │
   ▼
Nginx / React
   │
   │ /api/*
   ▼
Backend :8080
   │
   ▼
SQL Server :1433
```

The frontend Nginx configuration proxies `/api/` requests to the backend container.

---

## 🧰 Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 |
| Frontend build tool | Vite |
| Routing | React Router |
| HTTP client | Axios |
| Frontend testing | Vitest + Testing Library + jsdom |
| Frontend linting | Oxlint |
| Backend | Java 21 |
| Backend framework | Spring Boot 4.1.0 |
| Web/API | Spring MVC |
| Security | Spring Security |
| Authentication | JWT |
| Persistence | Spring Data JPA / Hibernate |
| Database | Microsoft SQL Server |
| Database migrations | Flyway |
| Validation | Jakarta Validation |
| Code generation | Lombok |
| Backend testing | Spring Boot Test + JUnit + Testcontainers |
| Coverage | JaCoCo |
| Code quality | SonarQube |
| Containerization | Docker + Docker Compose |
| Frontend web server | Nginx |

---

## 📁 Project Structure

```text
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
│   │   │   │   └── service/
│   │   │   └── resources/
│   │   │       ├── db/migration/
│   │   │       ├── application.properties
│   │   │       └── application-local.properties
│   │   └── test/
│   │       └── java/com/contactmanagement/backend/
│   ├── Dockerfile
│   ├── pom.xml
│   └── mvnw
│
├── frontend/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── package.json
│   └── vite.config.js
│
├── Screenshots/
│   └── application screenshots
│
├── docker-compose.yml
├── .env.example
└── README.md
```

---

# 🔐 Authentication & Authorization

The backend uses **Spring Security + JWT**.

### Authentication flow

```text
User
 │
 │ Login / Register
 ▼
React Frontend
 │
 │ POST /api/auth/login
 ▼
Spring Boot
 │
 │ Validate credentials
 ▼
JWT Service
 │
 │ Generate signed token
 ▼
React
 │
 │ Store token
 ▼
Protected API Requests
 │
 │ Authorization: Bearer <JWT>
 ▼
JwtAuthenticationFilter
 │
 ▼
Authenticated Controller
```

The frontend's Axios instance automatically reads the token from `localStorage` and adds it to protected requests.

Public authentication requests are excluded from the Authorization header:

- `/api/auth/login`
- `/api/auth/register`

---

# 🌐 API Endpoints

The backend is exposed under `/api`.

## Authentication

| Method | Endpoint | Authentication | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | No | Register a new user |
| `POST` | `/api/auth/login` | No | Login using email or phone |
| `GET` | `/api/auth/me` | Yes | Get authenticated user |
| `PUT` | `/api/auth/change-password` | Yes | Change current password |

## Contacts

| Method | Endpoint | Authentication | Description |
|---|---|---|---|
| `GET` | `/api/contacts` | Yes | List contacts |
| `GET` | `/api/contacts/{id}` | Yes | Get one contact |
| `POST` | `/api/contacts` | Yes | Create contact |
| `PUT` | `/api/contacts/{id}` | Yes | Update contact |
| `DELETE` | `/api/contacts/{id}` | Yes | Delete contact |

### Contact search and pagination

The contacts endpoint supports:

```text
GET /api/contacts?search=John&page=0&size=10
```

- `search` — optional first-name/last-name search
- `page` — zero-based page number
- `size` — page size, from 1 to 100

---

# 🗄️ Database Design

The application uses Microsoft SQL Server.

### Main tables

```text
users
  │
  │ 1-to-many
  ▼
contacts
  │
  ├──────────────► contact_emails
  │
  └──────────────► contact_phones
```

### `users`

Stores application users.

Important fields:

- `id`
- `email`
- `phone`
- `password`
- `first_name`
- `last_name`
- `created_at`
- `updated_at`

A user must have at least an email address or phone number.

### `contacts`

Stores contacts belonging to an authenticated user.

Important fields:

- `id`
- `user_id`
- `first_name`
- `last_name`
- `title`
- `created_at`
- `updated_at`

### `contact_emails`

Allows each contact to have multiple email addresses.

Fields:

- `id`
- `contact_id`
- `email`
- `label`

### `contact_phones`

Allows each contact to have multiple phone numbers.

Fields:

- `id`
- `contact_id`
- `phone`
- `label`

Foreign keys use cascading deletion so child contact records are removed when their parent contact is deleted.

---

# 🔄 Database Migrations

Flyway migrations are located at:

```text
backend/src/main/resources/db/migration/
```

### V1 — Users

`V1__create_users_table.sql`

Creates the `users` table with unique email/phone constraints and the requirement that at least one identifier is supplied.

### V2 — Contacts

`V2__create_contacts_tables.sql`

Creates:

- `contacts`
- `contact_emails`
- `contact_phones`

and their foreign-key relationships.

### V3 — Nullable identifier uniqueness

`V3__fix_nullable_user_identifier_uniqueness.sql`

Replaces the original uniqueness constraints with filtered unique indexes so multiple `NULL` values are handled correctly while non-null email and phone values remain unique.

---

# 🧩 Backend Layers

The backend follows a layered architecture.

### Controllers

Located in:

```text
backend/src/main/java/com/contactmanagement/backend/controller/
```

Controllers expose REST endpoints and receive authenticated requests.

Main controllers:

- `AuthController`
- `ContactController`

### Services

Located in:

```text
backend/src/main/java/com/contactmanagement/backend/service/
```

Main services:

- `AuthService`
- `ContactService`
- `UserService`

Business logic is kept in the service layer rather than directly in controllers.

### Repositories

Located in:

```text
backend/src/main/java/com/contactmanagement/backend/repository/
```

Repositories provide database access through Spring Data JPA.

### DTOs

Located in:

```text
backend/src/main/java/com/contactmanagement/backend/dto/
```

DTOs separate API request/response models from persistence entities.

Examples:

- `RegisterRequest`
- `LoginRequest`
- `LoginResponse`
- `ContactRequest`
- `ContactResponse`
- `ChangePasswordRequest`

### Security

Located in:

```text
backend/src/main/java/com/contactmanagement/backend/security/
```

Important classes:

- `JwtService`
- `JwtAuthenticationFilter`

---

# ⚛️ Frontend Structure

The React application uses page-based routing.

### Pages

Located in:

```text
frontend/src/pages/
```

Available pages:

- `Login.jsx`
- `Register.jsx`
- `Contacts.jsx`
- `AddContact.jsx`
- `ContactDetails.jsx`
- `EditContact.jsx`
- `Profile.jsx`

### Components

Located in:

```text
frontend/src/components/
```

Includes reusable UI such as toast notifications.

### Context

Located in:

```text
frontend/src/context/
```

Includes:

- `AuthContext`
- `ToastContext`

`AuthContext` manages authentication state, while `ToastContext` provides application-wide notifications.

### API service

Located at:

```text
frontend/src/services/api.js
```

Axios is configured with:

```text
baseURL: /api
```

and an interceptor that attaches the JWT to protected requests.

---

# 🐳 Running the Full Application with Docker

Docker Compose is the recommended way to run the complete stack because it starts the database, backend, and frontend together.

## 1. Prerequisites

Install:

- Docker Desktop
- Git

Verify Docker:

```bash
docker --version
docker compose version
```

## 2. Configure environment variables

Copy:

```text
.env.example
```

to:

```text
.env
```

Then provide your own values for:

```env
MSSQL_SA_PASSWORD=your_strong_sql_server_password
JWT_SECRET=your_base64_encoded_jwt_secret
JWT_EXPIRATION_MS=3600000
```

**Do not commit `.env` to source control.**

## 3. Start the application

From the project root:

```bash
.\setup-docker.ps1
```

Docker Compose starts:

1. SQL Server
2. Database initialization
3. Spring Boot backend
4. React frontend served by Nginx

## 4. Open the application

Frontend:

```text
http://localhost:3000
```

Backend:

```text
http://localhost:8080
```

The browser application should normally be accessed through the frontend URL.

## 5. Stop the application

```bash
docker compose down
```

To also remove the persistent SQL Server volume:

```bash
docker compose down -v
```

> `-v` deletes the Docker database volume and therefore removes persisted database data.

---

# 💻 Running Backend Locally

The backend uses **Java 21** and Maven.

## Requirements

- Java 21
- Microsoft SQL Server
- Maven, or the included Maven Wrapper

Configure the local Spring profile in:

```text
backend/src/main/resources/application-local.properties
```

Then run:

### Linux/macOS

```bash
cd backend
./mvnw spring-boot:run -Dspring-boot.run.profiles=local
```

### Windows

```bat
cd backend
mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=local
```

The backend runs on:

```text
http://localhost:8080
```

---

# 💻 Running Frontend Locally

## Requirements

- Node.js
- npm

Install dependencies:

```bash
cd frontend
npm install
```

Run the Vite development server:

```bash
npm run dev
```

Vite normally starts the frontend at:

```text
http://localhost:5173
```

> The Docker setup is the simplest full-stack configuration because the included Nginx configuration proxies `/api/` requests to the backend container.

---

# 🧪 Testing

## Backend tests

Backend tests are located under:

```text
backend/src/test/java/
```

They include tests for:

- Application context
- Authentication service
- Contact service
- Contact controller

Run:

```bash
cd backend
./mvnw test
```

On Windows:

```bat
cd backend
mvnw.cmd test
```

The project also includes Testcontainers support for SQL Server integration testing.

## Frontend tests

Frontend tests use Vitest and Testing Library.

Run:

```bash
cd frontend
npm test
```

For a single non-watch test run:

```bash
npm test -- --run
```

Coverage:

```bash
npm run test:coverage
```

Coverage reports are generated under:

```text
frontend/coverage/
```

---

# 📊 Code Coverage

The backend includes JaCoCo.

Run:

```bash
cd backend
./mvnw test
```

The JaCoCo report is generated during the Maven test lifecycle.

The frontend uses V8 coverage through Vitest:

```bash
npm run test:coverage
```

---

# 🔎 Code Quality / SonarQube

The project contains SonarQube configuration for backend and frontend analysis.

The backend Maven configuration includes:

```text
sonar.projectKey=contact-management-backend
sonar.projectName=Contact Management Backend
sonar.host.url=http://localhost:9000
```

A SonarQube server should be running before performing a Sonar analysis.

---

# 🧱 Docker Images

### Backend

The backend Dockerfile uses a multi-stage build:

```text
Maven + Eclipse Temurin 21
        │
        ├── compile
        └── package
              │
              ▼
Eclipse Temurin 21 JRE
```

The final runtime image contains the packaged Spring Boot JAR.

### Frontend

The frontend Dockerfile also uses a multi-stage build:

```text
Node 24 Alpine
     │
     ├── npm ci
     └── npm run build
             │
             ▼
        Nginx Alpine
             │
             └── serves React dist/
```

---

# 🛡️ Security Considerations

The project implements several security-related measures:

- JWT-based authentication
- Password hashing through Spring Security
- Protected API endpoints
- Protected React routes
- Authenticated user ownership checks for contacts
- Input validation using Jakarta Validation
- Duplicate email/phone checks
- JWT expiration
- Environment-based secrets for Docker deployment

### Important

Never publish real database credentials or JWT secrets.

The repository uses:

```text
.env.example
```

as the safe configuration template, while `.env` is ignored by Git.

If credentials contained in a local development configuration have ever been exposed publicly, they should be replaced/rotated.

---

# 🔁 Typical User Workflow

```text
1. Open application
       │
       ▼
2. Register account
       │
       ▼
3. Login
       │
       ▼
4. Receive JWT
       │
       ▼
5. View contacts
       │
       ├── Search
       ├── Paginate
       ├── View details
       ├── Add
       ├── Edit
       └── Delete
       │
       ▼
6. Open profile
       │
       ├── Change password
       └── Logout
```

---

# 📋 Validation & Error Handling

The backend uses Jakarta Bean Validation on request DTOs and controller parameters.

Examples include:

- Required fields
- Password validation
- Page number validation
- Page-size limits
- Contact request validation
- Duplicate user identifiers

A global exception handler is provided at:

```text
backend/src/main/java/com/contactmanagement/backend/exception/GlobalExceptionHandler.java
```

The frontend provides user feedback through its toast notification system.

---

# 📦 Useful Commands

## Docker

```bash
docker compose up --build
docker compose down
docker compose down -v
```

## Backend

```bash
cd backend
./mvnw test
./mvnw clean package
./mvnw spring-boot:run -Dspring-boot.run.profiles=local
```

## Frontend

```bash
cd frontend
npm install
npm run dev
npm run build
npm run preview
npm test
npm run test:coverage
npm run lint
```

---

# 📝 Notes for Developers

### Environment configuration

Production/container configuration is supplied through environment variables such as:

```text
SPRING_DATASOURCE_URL
SPRING_DATASOURCE_USERNAME
SPRING_DATASOURCE_PASSWORD
JWT_SECRET
JWT_EXPIRATION_MS
```

### Database schema management

Flyway migrations live under:

```text
backend/src/main/resources/db/migration/
```

Do not casually rename or reorder already-applied Flyway migrations. Add a new migration for subsequent schema changes.

### Contact ownership

Contact queries are scoped to the authenticated user. This prevents one authenticated user from directly accessing another user's contacts through an ID.

---

# 👨‍💻 Project

**Project:** Contact Management System  
**Cohort:** 9  
**Track:** JAVA Fullstack (Java + ReactJS)  
**Repository:** `cohort-9-java-8620-syed`

---

## 📸 Screenshot Gallery

| Screen | Preview |
|---|---|
| Login | `Screenshots/Screenshot 2026-09-03 105827.png` |
| Register | `Screenshots/Screenshot 2026-09-03 105019.png` |
| Contacts | `Screenshots/Screenshot 2026-09-03 105146.png` |
| Contact Details | `Screenshots/Screenshot 2026-09-03 105306.png` |
| Edit Contact | `Screenshots/Screenshot 2026-09-03 105421.png` |
| Delete Confirmation | `Screenshots/Screenshot 2026-09-03 105650.png` |
| Profile | `Screenshots/Screenshot 2026-09-03 105721.png` |
| Change Password | `Screenshots/Screenshot 2026-09-03 105746.png` |

