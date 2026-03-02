## 🚀 Live Demo
Check out the live application here: [Polling System Live](https://polling-system-dusky.vercel.app/)

# Polling System (Fullstack)

Fullstack polling app with team-based polls, built with an Express/MongoDB backend and a Vite + React frontend.

## Features
- User authentication with JWT
- Create teams and manage members
- Create polls with multiple options
- Team-scoped access control for polls

## Tech Stack
- Backend: Node.js, Express, MongoDB, Mongoose, JWT
- Frontend: React, Vite, Tailwind CSS, React Router

## Project Structure
```
Polling-system/
  backend/
  frontend/
```

## Prerequisites
- Node.js (LTS recommended)
- MongoDB Atlas or local MongoDB instance

## Environment Variables
Create `backend/.env` with:
```
PORT=3000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

## Install
From the project root:
```
cd backend
npm install

cd ../frontend
npm install
```

## Run (Development)
Backend:
```
cd backend
npm start
```

Frontend:
```
cd frontend
npm run dev
```

The frontend dev server will show the local URL in the terminal. The backend defaults to `http://localhost:3000` (or your `PORT`).

## Notes
- The backend `start` script uses `nodemon`. If you don’t have it globally, install it with `npm install -D nodemon` and update the script, or run `node index.js`.
- If you change backend port, update frontend API base URL accordingly (wherever you configure Axios or fetch).

## License
MIT (or update as needed)


## 🎮 How to use
1. **Join a Team**: Create or join a team using a unique Team Name.
2. **Launch a Poll**: Open the creation menu (burger icon) to set a question and duration.
3. **Vote**: Cast your vote and watch the results update live on the chart.
4. **Track**: Check the history panel to see how previous polls ended.
