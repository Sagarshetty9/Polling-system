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