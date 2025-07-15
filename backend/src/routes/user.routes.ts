import { Router } from "express";
import verifyJWT from "../middlewares/auth.middleware";
import { acceptFriend, acceptInvite, addFriend, exitGame, getActiveGames, getAllGames, getFriendRequests, getFriends, getGame, getInvites, getUser, invite, rejectFriend, rejectInvite, removeFriend } from "../controllers/user";

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
userRouter.route("/invite").post(verifyJWT, invite);
userRouter.route("/get-invites").get(verifyJWT, getInvites);
userRouter.route("/accept-invite").post(verifyJWT, acceptInvite);
userRouter.route("/reject-invite").post(verifyJWT, rejectInvite);

export default userRouter;