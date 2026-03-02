import express from 'express';
import { createPoll, getTeamPolls, votePollOption, deletePoll } from '../controller/createPoll.js';
import { protect } from '../middleware/authMiddleware.js';


const pollRouter = express.Router();

pollRouter.post("/createPoll/:teamId", protect, createPoll);
pollRouter.get("/teamPoll/:teamId", protect, getTeamPolls);
pollRouter.patch("/:pollId/vote", protect, votePollOption);
pollRouter.delete("/:pollId", protect, deletePoll);


export default pollRouter;
