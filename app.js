import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors"
import { config } from "dotenv";
import cloudinary from "cloudinary"

import userroute from "./routes/user.route.js"
import morgan from "morgan";
import errormiddleware from "./middlewares/error.middleware.js";




config();
const app=express();
app.use(express.json())
app.use(express.urlencoded({extended:true}));
app.use(cookieParser())
app.use(morgan("dev"))

app.use("/ping",(req,res)=>{
    res.send(`pong`)
})

app.use("/api/v1/user",userroute)
//more route for blog post and else


app.use(errormiddleware);

export default app;