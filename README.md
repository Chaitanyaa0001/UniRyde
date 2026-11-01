# UniRyde 🚗

**A Campus Carpooling Platform — Connect, Share Rides, and Travel Together.**

UniRyde is a full-stack campus carpooling platform designed to help students connect with one another, share rides, and make everyday commuting easier and more affordable.

Students can publish available rides, discover carpools, send booking requests, manage their bookings, and communicate through real-time chat once a request is accepted.

The project brings together a modern web frontend, a REST API, authentication, and real-time communication in one integrated application.

## ✨ Features

- **Authentication & Authorization** — Secure user authentication and protected routes.
- **Create a Carpool** — Publish rides with pickup locations, destinations, departure times, and available seats.
- **Discover Rides** — Browse and search available carpools.
- **Join Requests** — Request to join a carpool and let the ride owner accept or reject requests.
- **Booking Management** — View created carpools, incoming requests, and joined rides.
- **Real-Time Chat** — Communicate with carpool participants after a request is accepted.
- **Profile Management** — Manage your profile and created carpools.
- **Responsive Interface** — Access the platform through a clean, responsive web interface.

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | Next.js, React, TypeScript |
| Backend | Node.js, Express.js, TypeScript |
| Real-time Communication | Socket.IO |
| Database | Configured through the backend environment |
| Caching / Sessions | Redis |
| API Communication | REST APIs |
| Containerization | Docker, Docker Compose |

## 🏗️ Architecture

```text
                 UniRyde
                    |
          +---------+---------+
          |                   |
      Frontend             Backend
      Next.js              Express.js
          |                   |
          |             +-----+------+
          |             |            |
          |          REST API    Socket.IO
          |             |            |
          +-------------+------------+
                        |
                 Backend Services
                        |
                 Database / Redis
```

## 🚀 Getting Started

Follow these instructions to run UniRyde locally using Docker.

### Prerequisites

Make sure you have the following installed:

- [Git](https://git-scm.com/)
- [Docker](https://www.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)

Verify your installations:

```bash
git --version
docker --version
docker compose version
```

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/UniRyde.git
cd UniRyde
```

### 2. Configure environment variables

Create the required environment files using the provided examples.

For the backend:

```bash
cp backend/.env.example backend/.env
```

Configure the required values in the environment files, including:

- Database connection
- Redis connection
- Authentication and session secrets
- Frontend origin / CORS configuration
- Any additional API configuration

**Never commit your actual `.env` files or credentials to GitHub.**

### 3. Build and start using Docker

From the project root:

```bash
docker compose up --build
```

This builds the configured application images and starts the services defined in your Docker Compose configuration.

### 4. Run in the background

```bash
docker compose up --build -d
```

### 5. View running containers

```bash
docker compose ps
```

### 6. View application logs

```bash
docker compose logs -f
```

To view a particular service:

```bash
docker compose logs -f backend
```

### 7. Stop the application

```bash
docker compose down
```

To stop the application and remove its Compose-managed volumes:

```bash
docker compose down -v
```

**Warning:** The second command can delete persistent database data stored in those volumes.

> Note: The exact service names, environment variables, ports, and database migration commands depend on the repository's Docker Compose configuration.

## 📁 Project Structure

```text
UniRyde/
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── lib/
│   │   ├── middleware/
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   ├── users/
│   │   │   ├── carpools/
│   │   │   └── chat/
│   │   ├── utils/
│   │   └── server.ts
│   ├── tests/
│   ├── package.json
│   └── Dockerfile
│
├── client/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── Dockerfile
│
├── docker-compose.yml
└── README.md
```

*The structure above is illustrative; adjust it to match the actual repository.*

## 🔌 Core Application Modules

| Module | Description |
|---|---|
| Authentication | User registration, login, and session management |
| Users | User profile and account-related operations |
| Carpools | Ride creation, discovery, and management |
| Join Requests | Booking requests and owner approval |
| Chat | Real-time communication between carpool participants |

## 🧑‍💻 Development

To inspect the running containers:

```bash
docker compose ps
```

To rebuild the application after making changes:

```bash
docker compose up --build
```

## 🔐 Security

- Protected backend API routes.
- Session-based authentication.
- HTTP-only authentication cookies.
- Environment-based configuration.
- Authorization checks for carpool and chat operations.

## 📌 Project Status

UniRyde is an ongoing full-stack project. The repository contains the integrated web application and its Docker-based setup for local development and demonstration.

## 📄 License

Add your chosen license here before publishing the repository.

---

**UniRyde — Better Commutes, Stronger Campus Connections.** 🚗