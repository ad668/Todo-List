# Todo - Task Management Workspace (Angular + ASP.NET Core)

A full-stack **task management** web application featuring **JWT authentication**, role-based access (**Admin vs User**), task lifecycle/status transitions, and an operational dashboard.

---

## Project overview

The system consists of:

- **TodoApi** (ASP.NET Core .NET 8)
  - REST API secured with **JWT Bearer tokens**
  - **Entity Framework Core** with **SQL Server** persistence
  - Database seeding for an initial **Admin** user
  - Swagger UI in development
- **todo-client** (Angular)
  - Standalone Angular components for **Login/Register**, **Dashboard**, and **Task Board**
  - Stores the JWT in `localStorage` and sends it via `Authorization: Bearer <token>`

---

## Features

### Authentication & users

- **Register** a user (stores password using **BCrypt**)  
- **Login** to receive a JWT token
- JWT contains:
  - `ClaimTypes.Name` (username)
  - `ClaimTypes.Role` (role)

### Authorization (Role-based)

- **Admin**:
  - Can view all tasks
  - Can update task statuses across users
- **User**:
  - Can only view and manage their own tasks

### Task management

Tasks move through these statuses:

- `TCS Pending`
- `WIP`
- `ECU Pending`
- `Complete`

Backend behavior highlights:

- `PUT /api/tasks/{id}` supports:
  - updating title/description/taskType/shiftTime
  - updating `status`
  - completing a task via `status == "Complete"` or `isCompleted`
- **Completion is irreversible** (a completed task cannot be reverted back to incomplete)
- Status transitions update `AuditDescr` with timestamps

### Dashboard

Dashboard provides:

- Summary counts:
  - `total`, `pending`, `wip`, `ecuPending`, `completed`
- Board views grouping tasks by status
- (API includes chart endpoints; the current Angular dashboard focuses on board grouping)

---

## Tech stack

- Frontend: **Angular 18** (standalone components)
- Backend: **ASP.NET Core (.NET 8)**
- Database: **SQL Server** via **EF Core**
- Security:
  - JWT authentication (`JwtBearerDefaults.AuthenticationScheme`)
  - BCrypt password hashing
- API docs: **Swagger** (development)

---

## API endpoints

All endpoints are under:

- `http://localhost:5023/api`

### Auth

- `POST /api/auth/register`
  - Body: `RegisterRequest`
  - Creates user with role `User`
- `POST /api/auth/login`
  - Body: `LoginRequest`
  - Returns: JWT + user info

### Tasks (secured)

Base: `TasksController` (`[Authorize]`)

- `GET /api/tasks`
  - Optional query params:
    - `status` (e.g., `WIP`)
    - `taskType`
    - `shift` (Morning/Evening/General)
    - `search` (searches `Title` or `Description`)
  - Admin sees all tasks; User sees only their tasks

- `GET /api/tasks/mytasks`
  - Only tasks for the current user

- `GET /api/tasks/{id}`
  - Admin can fetch any task
  - User can fetch only their task

- `POST /api/tasks`
  - Body: `TaskCreateRequest`
  - Creates a task for the authenticated user

- `PUT /api/tasks/{id}`
  - Body: `TaskUpdateRequest`
  - Updates task fields + status
  - Enforces completion irreversibility

- `DELETE /api/tasks/{id}`
  - Admin or owner can delete

### Dashboard (secured)

- `GET /api/dashboard/summary`
  - Returns task counts by status

- `GET /api/dashboard/charts`
  - Returns grouped counts (status, user, shift, and last 6 months trend)

---

## Frontend routes & behavior

The Angular UI is implemented with standalone components.

- `/login`
  - Login and registration (via the backend Auth endpoints)
- `/dashboard`
  - Shows summary counts and the task board grouped by statuses
  - Admin sees user names on task cards
  - Allows Admin to move tasks between statuses via `updateTaskStatus`
- `/tasks`
  - Task creation form
  - Displays latest tasks (top 5) after saving
  - Sends create request to `POST /api/tasks`

Auth handling in the UI:

- JWT token is stored in `localStorage` as `token`
- API calls attach `Authorization: Bearer <token>`
- Logout clears token and navigates to `/login`

---

## Setup & run

### 1) Prerequisites

- **SQL Server** instance available to the app
- **.NET 8 SDK**
- **Node.js** + npm
- **Angular CLI** (optional; repo includes scripts)

### 2) Configure backend

`TodoApi` reads:

- Connection string: `ConnectionStrings:DefaultConnection`
- JWT signing key: `Jwt:Key`

Check/apply settings in:

- `TodoApi/appsettings.json`
- `TodoApi/appsettings.Development.json`

Notes:

- `Program.cs` seeds an **Admin** user if it doesn’t exist:
  - **Username:** `admin`
  - **Password:** `Admin@123`
  - **Role:** `Admin`

### 3) Run TodoApi

From the repository root:

```bash
cd TodoApi
dotnet run
```

- Swagger UI is available in development.
- Default API base used by the Angular app is:
  - `http://localhost:5023/api`

### 4) Run todo-client

From the repository root:

```bash
cd todo-client
npm install
npm start
```

- Frontend runs on one of the configured Angular dev ports (commonly `http://localhost:4200/`).

---

## CORS

Backend enables CORS for the frontend origins configured in `Program.cs`:

- `http://localhost:65199`
- `http://localhost:4200`

If your frontend runs on a different port, update the CORS origins in the backend.

---

## Troubleshooting

- **401 Unauthorized**
  - Ensure you are logged in and `localStorage.token` is present.
  - Verify the token is sent in `Authorization` header.

- **403 Forbidden**
  - The current user likely lacks permission to read/update that task.

- **CORS errors**
  - Update backend CORS `WithOrigins(...)` to match your Angular dev URL.

- **Database connection issues**
  - Confirm `DefaultConnection` points to a reachable SQL Server.

---

## Notes / current limitations

- The root Angular CLI template README is present under `todo-client/README.md` (this repository README focuses on the full-stack app description).
- Chart rendering on the UI depends on additional frontend implementation; `GET /api/dashboard/charts` is already available.

