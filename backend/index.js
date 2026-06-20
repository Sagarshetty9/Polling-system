// Importing dependencies
import express from "express";
import { createServer } from "http";
import dotenv from "dotenv";
import connectDb from "./config/databaseConnection.js";
import authRouter from "./routes/authRouter.js";
import pollRouter from "./routes/pollRouter.js";
import teamRouter from "./routes/teamRouter.js";
import cors from "cors";
import { initIO } from './config/socket.js';

// Add this at the absolute top of backend/index.js right after imports:
process.on('uncaughtException', (err) => {
  console.error("=========================================");
  console.error("🔥 ACTUAL CRASH SOURCE DETECTED 🔥");
  console.error(err.stack); // 👈 This prints the EXACT file name and line number
  console.error("=========================================");
  process.exit(1);
});

dotenv.config();

// Setting up the port
const PORT = process.env.PORT || 3000;
const FRONTEND_URL = process.env.FRONTEND_URL?.replace(/\/+$/, "") || "http://localhost:5173";

// Connecting to the database
await connectDb();

// Creating the express app
const app = express();
const server = createServer(app);

// Global CORS gate
app.use(cors({
  origin: FRONTEND_URL,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS" , "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.options('*', cors());

app.use(express.json());

// Initializing socket 
initIO(server);

// Routes
app.get("/", (req, res) => {
    res.send("Hello World");
});

app.use("/api/auth", authRouter);
app.use("/api/polls", pollRouter);
app.use("/api/teams", teamRouter);

// Start Server listener
server.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
});