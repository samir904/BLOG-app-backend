import Apperror from "../utils/error.util.js";
import User from "../models/user.model.js"


const cookieOptions={
    maxAge:7*24*60*60*1000,
    httpOnly:true,
    secure:true
}
const register=async(req,res,next)=>{
        const{userName,email,password}=req.body;

        if(!userName||!email||!password){
            return next( new Apperror("all fields are required",400))
        }

        const userExist=await User.findOne({email});
        if(userExist){
            return next(new Apperror("user is already registred with this email id ",400))
        }

        const user=await User.create({
            userName,
            email,
            password,
            avatar:{
                public_id:email,
                secure_url:"dummyurl"
            }
        })
        if(!user){
            return next(new Apperror("user registration failed ",500))
        }
        //to do file upload

        await user.save();
        user.password=undefined;


        //completed-learn about it-to do token generation and set it into user cookie 
       
        const token=await user.generateJWTToken();
        
        
        res.cookie("token",token,cookieOptions)
        res.status(200).json({
            success:true,
            message:"user registered successfully",
            data:user
        })

        
}
const login=async(req,res,next)=>{
    const{email,password}=req.body;

    if(!email||!password){
        return next(new Apperror("All fields are required",400))
    }

    const user=await User.findOne({email})
    .select('+password')

if(!user){
    return next(new Apperror("user is not finded something went wrong please try again ",400))
}
    if(!user||!await user.comparePassword(password)){
        return next(new Apperror("email or password does not match  please try again!",500))
    }
    const token =await user.generateJWTToken();
    user.password=undefined,
    res.cookie("token",token,cookieOptions)
    
    res.status(200).json({
        success:true,
        message:"user looged in successfully",
        data:user
    })

}
const logout=async(req,res,next)=>{
        res.cookie("token",null,{
            secure:true,
            httpOnly:true,
            maxAge:0
        })

        res.status(200).json({
            success:true,
            message:"user logged out successfully ",
        })
}

const forgotpassword=(req,res,next)=>{

}
const resestpassword=(req,res,next)=>{

}

const getprofile=(req,res,next)=>{

}
const changepassword=(req,res,next)=>{
    
}

const updateprofile=(req,res,next)=>{
    
}

export {
    register,
    login,
    logout,
    forgotpassword,
    resestpassword,
    getprofile,
    changepassword,
    updateprofile
}