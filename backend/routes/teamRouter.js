import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  createTeamController,
  getMyTeams,
  joinTeamController,
  leaveTeamController,
  getTeamByIdController
} from "../controller/teamController.js";


 const teamRouter = express.Router();

teamRouter.get("/myTeams", protect, getMyTeams);
teamRouter.get("/myTeams/:teamId", protect, getTeamByIdController);
teamRouter.post("/createTeam", protect, createTeamController);
teamRouter.post("/joinTeam", protect, joinTeamController);
teamRouter.delete("/:teamId/leave", protect, leaveTeamController);

export default teamRouter;
