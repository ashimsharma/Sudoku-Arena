import { Router } from "express";
import { githubLogin, githubLoginCallback } from "../controllers/auth";
import passport from "passport";

const authRouter = Router();

authRouter.route("/github").get(githubLogin);
authRouter.route("/github/callback").get(passport.authenticate("github", { session: false }), githubLoginCallback);

export default authRouter;