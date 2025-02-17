import express from "express";
import 'dotenv/config';

const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.get("/", (req, res) => {
    res.send("Hello World");
});

export {app};