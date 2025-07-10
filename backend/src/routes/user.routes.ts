import { Router } from "express";
import verifyJWT from "../middlewares/auth.middleware";
import { acceptFriend, addFriend, exitGame, getActiveGames, getAllGames, getFriendRequests, getFriends, getGame, getUser, rejectFriend, removeFriend } from "../controllers/user";

const userRouter = Router();

userRouter.route("/get-all-games").get(verifyJWT, getAllGames);
userRouter.route("/get-game").get(verifyJWT, getGame);
userRouter.route("/get-user").get(verifyJWT, getUser);
userRouter.route("/add-friend").post(verifyJWT, addFriend);
userRouter.route("/get-friend-requests").get(verifyJWT, getFriendRequests);
userRouter.route("/accept-friend").post(verifyJWT, acceptFriend);
userRouter.route("/reject-friend").post(verifyJWT, rejectFriend);
userRouter.route("/remove-friend").post(verifyJWT, removeFriend);
userRouter.route("/get-friends").get(verifyJWT, getFriends);
userRouter.route("/get-active-game").get(verifyJWT, getActiveGames);
userRouter.route("/exit-game").post(verifyJWT, exitGame);

export default userRouter;