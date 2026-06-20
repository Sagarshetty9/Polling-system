//Importing dependencies
import express from "express";
import {createServer} from "http";
import dotenv from "dotenv";
import connectDb from "./config/databaseConnection.js";
import authRouter from "./routes/authRouter.js";
import pollRouter from "./routes/pollRouter.js";
import teamRouter from "./routes/teamRouter.js";
import cors from "cors";
import { initIO } from './config/socket.js';

dotenv.config();


//Setting up the port
const PORT = process.env.PORT || 3000;
const FRONTEND_URL = process.env.FRONTEND_URL?.replace(/\/+$/, "") || "http://localhost:5173";


//Connecting to the database
await connectDb();

//Creating the express app
const app = express();
const server = createServer(app);

//Initializing socket
initIO(server);

//Middleware
app.use(express.json());


app.use(cors({
  origin: FRONTEND_URL,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS" , "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));


//Defining the routes
app.get("/", (req, res) => {
    res.send("Hello World");
});

//Auth routes
app.use("/api/auth", authRouter);

//Poll routes
app.use("/api/polls", pollRouter);

//Team routes
app.use("/api/teams", teamRouter);



server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
