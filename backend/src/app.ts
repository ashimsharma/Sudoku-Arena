import express from "express";
import 'dotenv/config';
import authRouter from "./routes/auth";
import passport from "./config/passport";

const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.get("/", (req, res) => {
    res.send("Hello World");
});

app.use(passport.initialize());

app.use("/auth", authRouter);

export {app};