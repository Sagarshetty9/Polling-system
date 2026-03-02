import express from "express";
import { registerController } from "../controller/register.js";
import { loginController } from "../controller/login.js";


const authRouter = express.Router();

authRouter.post("/register", registerController);
authRouter.post("/login", loginController);

export default authRouter;