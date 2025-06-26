import express from "express";
import 'dotenv/config';
import authRouter from "./routes/auth.routes";
import passport from "./config/passport";
import cors from 'cors';
import cookieParser from "cookie-parser";
import leaderboardRouter from "./routes/leaderboard.routes";

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use(passport.initialize());

app.use("/auth", authRouter);
app.use("/leaderboard", leaderboardRouter);

export {app};