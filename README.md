# Multi-Agent Research Workspace

A production-grade multi-agent research workspace built with the MERN stack. This platform provides a scalable foundation for AI-powered research workflows with secure authentication and a modern UI.

## Tech Stack

### Frontend
- **React** — UI library
- **Vite** — Build tool
- **Tailwind CSS** — Utility-first CSS
- **React Router** — Client-side routing
- **Axios** — HTTP client
- **Zustand** — State management
- **Lucide React** — Icon library

### Backend
- **Node.js** — Runtime
- **Express.js** — Web framework
- **MongoDB** — Database
- **Mongoose** — ODM
- **JWT** — Authentication
- **bcryptjs** — Password hashing
- **Helmet** — Security headers
- **express-rate-limit** — Rate limiting

## Folder Structure

```
multi-agent-research-workspace/
│
├── client/
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/            # Page components
│   │   ├── layouts/          # Layout components
│   │   ├── hooks/            # Custom React hooks
│   │   ├── services/         # API service layer
│   │   ├── store/            # Zustand state management
│   │   ├── utils/            # Utility functions
│   │   ├── App.jsx           # Root component
│   │   └── main.jsx          # Entry point
│   ├── index.html
│   └── package.json
│
├── server/
│   ├── config/               # Database and app configuration
│   ├── controllers/          # Route controllers
│   ├── middleware/            # Express middleware
│   ├── models/               # Mongoose models
│   ├── routes/               # API routes
│   ├── services/             # Business logic services
│   ├── utils/                # Utility functions
│   ├── app.js                # Express app setup
│   ├── server.js             # Server entry point
│   └── package.json
│
├── .gitignore
├── .env.example
└── README.md
```

## Installation

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)

### 1. Clone the repository

```bash
git clone <repository-url>
cd multi-agent-research-workspace
```

### 2. Install backend dependencies

```bash
cd server
npm install
```

### 3. Install frontend dependencies

```bash
cd client
npm install
```

### 4. Set up environment variables

Create a `server/.env` file based on `.env.example`:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/research-workspace
JWT_SECRET=your_secure_random_secret_key
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

## Running the Application

### Start the backend

```bash
cd server
npm run dev
```

The API server will start on `http://localhost:5000`.

### Start the frontend

```bash
cd client
npm run dev
```

The client will start on `http://localhost:5173`.

## API Endpoints

### Health Check

| Method | Endpoint       | Description              | Auth |
|--------|----------------|--------------------------|------|
| GET    | /api/health    | Check API status         | No   |

### Authentication

| Method | Endpoint          | Description              | Auth |
|--------|-------------------|--------------------------|------|
| POST   | /api/auth/register | Register a new user     | No   |
| POST   | /api/auth/login    | Login and get JWT       | No   |
| GET    | /api/auth/me       | Get current user        | Yes  |
| POST   | /api/auth/logout   | Logout                  | Yes  |

### Request / Response Examples

**Register:**
```json
POST /api/auth/register
{
  "name": "Vishal",
  "email": "vishal@example.com",
  "password": "password123"
}
```

**Login:**
```json
POST /api/auth/login
{
  "email": "vishal@example.com",
  "password": "password123"
}
```

**Success Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { "name": "Vishal", "email": "vishal@example.com", "role": "user" },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

## Testing Authentication

1. **Start both servers** (backend on port 5000, frontend on port 5173)
2. **Register** — Go to `http://localhost:5173/register` and create an account
3. **Login** — Go to `http://localhost:5173/login` and sign in
4. **Dashboard** — You'll be redirected to the protected dashboard
5. **Persistence** — Refresh the page; your session persists via JWT
6. **Logout** — Click the logout button to clear authentication

## Environment Variables

| Variable      | Description                    | Required |
|---------------|--------------------------------|----------|
| PORT          | Server port                    | Yes      |
| MONGODB_URI   | MongoDB connection string      | Yes      |
| JWT_SECRET    | Secret key for JWT signing     | Yes      |
| JWT_EXPIRES_IN| Token expiration (e.g. 7d)     | No       |
| CLIENT_URL    | Frontend URL for CORS          | Yes      |
| NODE_ENV      | Environment (development/production) | No |

## Security

- Passwords hashed with bcrypt (12 salt rounds)
- JWT-based authentication
- Helmet security headers
- CORS configured
- Rate limiting (100 requests per 15 minutes)
- Input validation
- No secrets committed to version control
- Passwords never returned in API responses

## License

MIT
