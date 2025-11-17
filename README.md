# Yakkaw Dashboard

## Overview
Yakkaw Dashboard is a web-based dashboard application built using **Go (Echo Framework)**, **PostgreSQL**, and **Bun ORM**. It provides a modern and efficient solution for managing and visualizing data with a scalable architecture.

## Features
- Built with **Go** using the **Echo framework** for high-performance web applications.
- Utilizes **PostgreSQL** as the primary database.
- **Bun ORM** for efficient database management and queries.
- RESTful API for seamless frontend-backend communication.
- Middleware for authentication and request handling.
- Scalable architecture suitable for production deployment.

## Technologies Used
- **Go** (Echo Framework)
- **PostgreSQL**
- **Bun ORM**
- **Docker** (optional, for deployment)
- **Bun Migrations** for database schema management

## Docker Setup
You can run the complete stack (PostgreSQL, Go API, and Next.js frontend) with Docker. Each service has its own Dockerfile and a shared `docker-compose.yml`.

### Build & Run Everything
```sh
docker compose up --build
```
This command will:
- start PostgreSQL with default credentials (`yakkaw/yakkaw`)
- build the backend image from `backend/Dockerfile` and expose it on `http://localhost:8080`
- build the frontend image from `frontend/Dockerfile` (using Bun for install/build) and expose it on `http://localhost:3000`

Feel free to override any environment variables in `docker-compose.yml` (e.g., database password, `API_URL`, or frontend `NEXT_PUBLIC_BACKEND_URL`).

### Build Images Individually
```sh
# Backend (Echo + Go)
docker build -t yakkaw-backend ./backend

# Frontend (Next.js)
docker build -t yakkaw-frontend ./frontend
```

## Manual Installation
### Prerequisites
Make sure you have the following installed:
- [Go](https://go.dev/dl/)
- [PostgreSQL](https://www.postgresql.org/download/)
- [Bun ORM](https://bun.uptrace.dev/)

### Clone the Repository
```sh
git clone https://github.com/MABiuS1/yakkaw-dashboard.git
cd yakkaw-dashboard
```

### Install Dependencies
```sh
go mod tidy
```

### Configure Backend Environment Variables
Create a `.env` file inside `backend/` (or export the variables in your shell) and set the following values:
```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=your_user
DB_PASSWORD=your_password
DB_NAME=yakkaw_db
SERVER_PORT=8080
```

### Run Database Migrations
```sh
go run cmd/migrate/main.go up
```

### Start the Server
```sh
go run main.go
```
The server will be running at `http://localhost:8080`.

### Frontend (Next.js + Bun)
Inside the `frontend/` directory:
```sh
bun install
bun run dev     # or bun run build && bun run start
```
If you prefer npm, you can still run `npm install` and `npm run dev`, but Docker images use Bun for faster installs and builds.

## API Endpoints
### Public Routes
| Method | Endpoint           | Description |
|--------|-------------------|-------------|
| POST   | `/register`       | User registration |
| POST   | `/login`          | User login |
| GET    | `/sponsors`       | Get list of sponsors |
| GET    | `/notifications`  | Get all notifications |
| GET    | `/me`             | Get logged-in user info |

### Admin Routes (Protected by JWT Middleware)
| Method | Endpoint                     | Description |
|--------|-----------------------------|-------------|
| GET    | `/admin/dashboard`          | Admin dashboard |
| POST   | `/admin/notifications`      | Create a notification |
| PUT    | `/admin/notifications/:id`  | Update a notification |
| DELETE | `/admin/notifications/:id`  | Delete a notification |
| POST   | `/admin/sponsors`           | Create a sponsor |
| PUT    | `/admin/sponsors/:id`       | Update a sponsor |
| DELETE | `/admin/sponsors/:id`       | Delete a sponsor |

## Contribution
1. Fork the repository
2. Create a new branch (`git checkout -b feature-branch`)
3. Commit your changes (`git commit -m 'Add new feature'`)
4. Push to the branch (`git push origin feature-branch`)
5. Create a Pull Request

## License
This project is licensed under the MIT License.

## Contact
For any questions or inquiries, feel free to contact me via GitHub Issues or email.
