import { Router } from "express";
import verifyJWT from "../middlewares/auth.middleware";
import { getAllGames, getGame, getUser } from "../controllers/user";

const userRouter = Router();

userRouter.route("/get-all-games").get(verifyJWT, getAllGames);
userRouter.route("/get-game").get(verifyJWT, getGame);
userRouter.route("/get-user").get(verifyJWT, getUser);

export default userRouter;