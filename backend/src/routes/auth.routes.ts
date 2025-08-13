import { Router } from "express";
import { getProfile, githubLogin, githubLoginCallback, googleLogin, googleLoginCallback, isAuthenticated, logout, refreshAccessToken } from "../controllers/auth";
import passport, { authenticate } from "passport";
import verifyJWT from "../middlewares/auth.middleware";

const authRouter = Router();

authRouter.route("/github").get(githubLogin);
authRouter.route("/github/callback").get(passport.authenticate("github", { session: false, failureRedirect: process.env.GITHUB_FAILURE_REDIRECT }), githubLoginCallback);

authRouter.route("/google").get(googleLogin);
authRouter.route("/google/callback").get(passport.authenticate("google", { session: false, failureRedirect: process.env.GOOGLE_FAILURE_REDIRECT }), googleLoginCallback);

authRouter.route("/check-auth").get(verifyJWT, isAuthenticated);
authRouter.route("/logout").put(verifyJWT, logout);

authRouter.route("/get-profile").get(verifyJWT, getProfile);
authRouter.route("/refresh-access-token").get(refreshAccessToken);

export default authRouter;