//Importing dependencies
import express from "express";
import dotenv from "dotenv";
import connectDb from "./config/userDB.js";
import authRouter from "./routes/authRouter.js";
import pollRouter from "./routes/pollRouter.js";
import teamRouter from "./routes/teamRouter.js";
import cors from "cors";

dotenv.config();


//Setting up the port
const PORT = process.env.PORT || 5000;

//Connecting to the database
await connectDb();

//Creating the express app
const app = express();

//Middleware
app.use(express.json()) 
app.use(cors())


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


//Starting the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
