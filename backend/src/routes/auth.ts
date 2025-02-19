import { Router } from "express";
import { githubLogin, githubLoginCallback, googleLogin, googleLoginCallback } from "../controllers/auth";
import passport from "passport";

const authRouter = Router();

authRouter.route("/github").get(githubLogin);
authRouter.route("/github/callback").get(passport.authenticate("github", { session: false }), githubLoginCallback);

authRouter.route("/google").get(googleLogin);
authRouter.route("/google/callback").get(passport.authenticate("google", { session: false }), googleLoginCallback);

export default authRouter;