import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors"
import { config } from "dotenv";
import cloudinary from "cloudinary"
import postroute from "./routes/post.route.js"
import userroute from "./routes/user.route.js"
import morgan from "morgan";
import errormiddleware from "./middlewares/error.middleware.js";
import commentroute from "./routes/comment.route.js"



config();
const app=express();
app.use(express.json())
app.use(express.urlencoded({extended:true}));
app.use(cookieParser())
app.use(morgan("dev"))
 app.use(
   cors({
     origin: process.env.FRONTED_URL,
     credentials: true,
     methods: ["GET", "POST", "PUT", "DELETE"],
     allowedHeaders: ["Content-Type"],
   })
 );
app.use("/ping",(req,res)=>{
    res.send(`pong`)
})

app.use("/api/v1/user",userroute)
app.use("/api/v1/post",postroute)
app.use("/api/v1/comment",commentroute)
//more route for blog post and else


app.use(errormiddleware);

export default app;