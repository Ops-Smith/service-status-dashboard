# Service Status Dashboard

A small full-stack application designed as a foundation for DevOps practice.

## Stack

- Frontend: HTML, CSS, JavaScript
- Backend: Node.js + Express.js
- Database: MongoDB Atlas
- ODM: Mongoose

The application manages a small inventory of services and their operational status.

## Why this application?

The application is intentionally simple. The goal is to use it as a realistic application workload for DevOps activities such as:

- Git and GitHub
- Docker containerization
- CI/CD
- automated testing
- code quality and security scanning
- secrets management
- infrastructure as code
- cloud deployment
- Kubernetes
- health checks
- monitoring and observability

The application already includes a `/health` endpoint so it can later be used by Docker, Kubernetes and monitoring systems.

## Project Structure

```text
service-status-dashboard/
├── frontend/
│   ├── index.html
│   ├── script.js
│   └── style.css
├── backend/
│   ├── middleware/
│   │   └── errorHandler.js
│   ├── models/
│   │   └── Service.js
│   ├── routes/
│   │   └── services.js
│   ├── .env.example
│   ├── package.json
│   └── server.js
├── .gitignore
└── README.md
```

## Prerequisites

Install:

- Node.js
- npm
- Git
- MongoDB Atlas account
- A browser

Check Node and npm:

```bash
node --version
npm --version
```

## 1. Configure MongoDB Atlas

Create a MongoDB Atlas deployment.

Create a database user and password.

Configure Network Access so your development machine can connect.

Copy the MongoDB connection string supplied by Atlas. It will look similar to:

```text
mongodb+srv://USERNAME:PASSWORD@YOUR-CLUSTER.mongodb.net/service_status_dashboard?retryWrites=true&w=majority
```

## 2. Configure the backend

From the project root:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Create `.env` from the example.

Linux/macOS:

```bash
cp .env.example .env
```

Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Open:

```text
backend/.env
```

Set:

```env
PORT=5000
MONGODB_URI=YOUR_MONGODB_ATLAS_CONNECTION_STRING
```

Never commit `.env`.

## 3. Start the backend

Development mode:

```bash
npm run dev
```

Or normal mode:

```bash
npm start
```

Expected output:

```text
Connected to MongoDB Atlas
Server running on http://localhost:5000
```

## 4. Test the health endpoint

Open:

```text
http://localhost:5000/health
```

Expected response:

```json
{
  "success": true,
  "status": "healthy",
  "service": "service-status-dashboard-api",
  "timestamp": "..."
}
```

## 5. Test the API

Get all services:

```bash
curl http://localhost:5000/api/services
```

Create a service:

```bash
curl -X POST http://localhost:5000/api/services   -H "Content-Type: application/json"   -d '{"name":"Frontend","environment":"development","url":"http://localhost:5500","status":"healthy"}'
```

Get a service:

```bash
curl http://localhost:5000/api/services/SERVICE_ID
```

Update a service:

```bash
curl -X PUT http://localhost:5000/api/services/SERVICE_ID   -H "Content-Type: application/json"   -d '{"status":"degraded"}'
```

Delete a service:

```bash
curl -X DELETE http://localhost:5000/api/services/SERVICE_ID
```

Replace `SERVICE_ID` with the MongoDB document ID.

You can also test these endpoints using Postman or another API client.

## 6. Run the frontend

The frontend is static and does not require npm.

Open:

```text
frontend/index.html
```

For development, VS Code Live Server can be used.

If Live Server runs on port 5500, the frontend will call:

```text
http://localhost:5000/api/services
```

Make sure the Node.js backend is running at the same time.

## 7. Verify MongoDB Atlas

After creating a service:

1. Open MongoDB Atlas.
2. Open your deployment.
3. Open the `service_status_dashboard` database.
4. Open the `services` collection.
5. Confirm that the service document exists.

## API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/health` | Backend health check |
| GET | `/api` | API information |
| GET | `/api/services` | List services |
| POST | `/api/services` | Create service |
| GET | `/api/services/:id` | Get one service |
| PUT | `/api/services/:id` | Update service |
| DELETE | `/api/services/:id` | Delete service |

## Application Flow

```text
Browser
   |
   | HTTP / REST API
   v
HTML + CSS + JavaScript
   |
   | fetch()
   v
Node.js + Express
   |
   | Mongoose
   v
MongoDB Atlas
```

## Important security rule

The browser must never contain the MongoDB connection string.

The MongoDB URI belongs in:

```text
backend/.env
```

The `.gitignore` prevents `.env` from being committed.

## Suggested DevOps progression

Once the application works locally, use the same project to practice:

### Stage 1 — Git

Create a Git repository and push the application to GitHub.

### Stage 2 — Testing

Add backend tests and make tests run automatically.

### Stage 3 — Docker

Create Dockerfiles for the frontend/backend or serve the frontend through a web server container.

### Stage 4 — CI/CD

Create a GitHub Actions pipeline that:

1. Checks out the code.
2. Installs dependencies.
3. Runs tests.
4. Performs code-quality checks.
5. Builds the application image.
6. Scans the image.
7. Pushes the image to a registry.

### Stage 5 — Security

Introduce tools such as:

- Trivy
- SonarQube
- Checkov
- secret scanning
- dependency scanning

### Stage 6 — Deployment

Deploy the application to a cloud environment.

### Stage 7 — Kubernetes

Create:

- Deployment
- Service
- ConfigMap
- Secret
- readiness probe
- liveness probe

The existing `/health` endpoint can be used for Kubernetes health checks.

### Stage 8 — Observability

Add:

- Prometheus
- Grafana
- application metrics
- logs
- alerts

This allows the application to become a practical DevOps/SRE laboratory rather than just a CRUD application.
