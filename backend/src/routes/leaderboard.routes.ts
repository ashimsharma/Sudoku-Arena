import { Router } from "express";
import verifyJWT from "../middlewares/auth.middleware";
import { getLeaderboard } from "../controllers/leaderboard";

const leaderboardRouter = Router();

leaderboardRouter.route("/get-leaderboard").get(verifyJWT, getLeaderboard);

export default leaderboardRouter;