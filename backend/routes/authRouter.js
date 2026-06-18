import { Router } from "express";
import { registerController } from "../controller/register.js";
import { loginController } from "../controller/login.js";


const authRouter = Router();

authRouter.post("/register", registerController);
authRouter.post("/login", loginController);

export default authRouter;