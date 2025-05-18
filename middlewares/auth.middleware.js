import jwt from "jsonwebtoken"
import Apperror from "../utils/error.util.js"

const isLoggedin=async(req,res,next)=>{
    console.log(`cokkies:`,req.cookies)
    
    const {token}=req.cookies
    if(!token){
        return next(new Apperror("no cookie found please login again",400))
    }
    const userdetails=await jwt.verify(token,process.env.JWT_SECRET);
        req.user=userdetails;
        next()
    

}

export {
    isLoggedin
}