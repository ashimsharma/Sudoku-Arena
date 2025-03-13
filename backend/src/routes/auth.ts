import { Router } from "express";
import { githubLogin, githubLoginCallback, googleLogin, googleLoginCallback, loginFailed } from "../controllers/auth";
import passport from "passport";

const authRouter = Router();

authRouter.route("/github").get(githubLogin);
authRouter.route("/github/callback").get(passport.authenticate("github", { session: false, failureRedirect: `/login/failed` }), githubLoginCallback);

authRouter.route("/google").get(googleLogin);
authRouter.route("/google/callback").get(passport.authenticate("google", { session: false, failureRedirect: `/login/failed` }), googleLoginCallback);


authRouter.get("/login/failed", loginFailed);

export default authRouter;