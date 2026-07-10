# Thinkly

A modern full-stack interactive quiz platform with a React + TypeScript frontend and a Node.js + Express backend.

## Project Overview

This repository contains:

- `backend/`: API server for authentication, quizzes, attempts, analytics, file uploads, and real-time quiz events using Socket.IO.
- `frontend/`: React + Vite + TypeScript application with user authentication, admin dashboard, quiz management, analytics, participant management, and quiz play interfaces.

The application supports:

- user registration, login, and guest access
- secure JWT-based authentication
- quiz creation, update, and deletion
- real-time quiz interactions and participant tracking
- file uploads with local storage and Cloudinary support
- analytics and attempt reporting

## Architecture

- Backend: Node.js, Express, MongoDB, Mongoose, Socket.IO
- Frontend: React, TypeScript, Vite, Redux Toolkit, Mantine, Axios
- Deployment: configured for Vercel / cloud hosting

## Requirements

- Node.js 20.x
- npm 10+ or compatible package manager
- MongoDB connection string
- Optional Cloudinary and email credentials for uploads and notifications

## Setup
 
### 1. Clone repository

```bash
git clone https://github.com/globaltechgirl/thinkly.git
cd thinkly
```

### 2. Install dependencies

```bash
npm install
cd backend
npm install
cd ../frontend
npm install
```

### 3. Configure environment variables

Create a `.env` file inside `backend/` with values for your environment.

Example `backend/.env`:

```env
NODE_ENV=development
PORT=5001
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>/<database>
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5173

CLOUD_NAME=your_cloudinary_cloud_name
CLOUD_API_KEY=your_cloudinary_api_key
CLOUD_API_SECRET=your_cloudinary_api_secret

EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USER=your-email@example.com
EMAIL_PASS=your-email-password
```

### 4. Configure frontend variables

Create a `.env` file inside `frontend/` if needed:

```env
VITE_API_BASE_URL=http://localhost:5001/api
VITE_APP_BASE_URL=http://localhost:5173
```

## Development

From the repository root, start both backend and frontend together:

```bash
npm run dev
```

This runs:

- backend on `http://localhost:5001`
- frontend on `http://localhost:5173`

If you prefer running services separately:

```bash
cd backend
npm run dev
```

```bash
cd frontend
npm run dev
```

## Production / Build

### Backend

```bash
cd backend
npm start
```

### Frontend

```bash
cd frontend
npm run build
```

Then serve the generated frontend build with a static server or deploy to your preferred hosting provider.

## Key Backend Endpoints

- `POST /api/auth/register` — register new user
- `POST /api/auth/login` — login existing user
- `POST /api/auth/guest` — guest access flow
- `GET /api/quiz` — list quizzes
- `POST /api/quiz` — create quiz
- `PUT /api/quiz/:id` — update quiz
- `DELETE /api/quiz/:id` — delete quiz
- `POST /api/uploads/local` — local file upload
- `POST /api/uploads/cloud` — Cloudinary upload
- `GET /api/analytics` — analytics and report data
- `GET /api/play/...` — quiz play and participant actions

## Project Structure

- `backend/controllers/`: request handling and business logic
- `backend/models/`: Mongoose schema definitions
- `backend/routes/`: API route definitions
- `backend/middleware/`: authentication, validation, file upload handlers
- `backend/services/`: reusable service logic for auth, quiz, analytics, and attempts
- `frontend/src/`: React application source code
- `frontend/src/api/`: Axios API helpers
- `frontend/src/components/`: UI components and page layouts
- `frontend/src/pages/`: route pages and views

## Notes

- The backend validates `MONGODB_URI` and requires `JWT_SECRET` at runtime.
- Frontend uses `VITE_API_BASE_URL` to connect to the backend API.
- Socket.IO is configured for real-time quiz room management and live participant tracking.

## Troubleshooting

- If the backend fails to start, verify `backend/.env` values and correct MongoDB URI.
- If the frontend cannot reach the API, verify `VITE_API_BASE_URL` and CORS origin settings.
- For Cloudinary uploads, confirm credentials and `CLOUD_NAME` / `CLOUD_API_KEY` / `CLOUD_API_SECRET` are set.

## License

This project is currently under ISC license.
