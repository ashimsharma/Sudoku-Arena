import { Router } from "express";
import verifyJWT from "../middlewares/auth.middleware";
import { getAllGames } from "../controllers/user";

const userRouter = Router();

userRouter.route("/get-all-games").get(verifyJWT, getAllGames);

export default userRouter;