import { CookieOptions, NextFunction, Request, Response } from "express";
import passport from "passport";
import jwt from "jsonwebtoken";

function githubLogin(req: Request, res: Response, next: NextFunction) {
  passport.authenticate("github", { scope: ["user"] })(req, res, next);
}

interface User {
  id: string;
  email: string;
  avatarUrl: string;
  name: string;
}

function githubLoginCallback(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    res.status(401).json({
      error: "Authentication failed",
    });
  }

  const payload = { id: (req.user as User).id };

  const token = jwt.sign(
    payload,
    process.env.JWT_SECRET as jwt.Secret,
    {
        expiresIn: "2d"
    }
  );

  const options: CookieOptions = {
    httpOnly: true,
    secure: true,
    maxAge: 2 * 24 * 60 * 60 * 1000,
    sameSite: "none"
  }
  
  res
  .cookie("jwt", token, options)

  res.redirect((process.env.CLIENT_URL as string))
}

function googleLogin(req: Request, res: Response, next: NextFunction){
  passport.authenticate("google", { scope: ["profile", "email"] })(req, res, next);
}

function googleLoginCallback(req: Request, res: Response, next: NextFunction){
  if (!req.user) {
    res.status(401).json({
      error: "Authentication failed",
    });
  }

  const payload = { id: (req.user as User).id };

  const token = jwt.sign(
    payload,
    process.env.JWT_SECRET as jwt.Secret,
    {
        expiresIn: "2d"
    }
  );

  const options: CookieOptions = {
    httpOnly: true,
    secure: true,
    maxAge: 2 * 24 * 60 * 60 * 1000,
    sameSite: "none"
  }
  
  res
  .cookie("jwt", token, options)

  res.redirect((process.env.CLIENT_URL as string))
}

function loginFailed(req: Request, res: Response){
  res.status(401).json(
    {
      success: false,
      message: "Login Failed"
    }
  )
}

export { githubLogin, githubLoginCallback, googleLogin, googleLoginCallback, loginFailed };
