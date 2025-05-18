import Apperror from "../utils/error.util.js";
import User from "../models/user.model.js"
import cloudinary from "cloudinary"
import fs from "fs";
import sendEmail from "../utils/sendEmail.js";
import crypto from "crypto"
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
        if(req.file){
            try{
                const result=await cloudinary.v2.uploader.upload(req.file.path,{
                   folder:"BLOG" ,
                   width:250,
                   height:250,
                   gravity:"faces",
                   crop:"fill",
                });
                if(result){
                    user.avatar.public_id=result.public_id;
                    user.avatar.secure_url=result.secure_url;
                    await fs.rm(`uploads/${req.file.filename}`);
                }
            }catch(error){
                return next(new Apperror(error.message||"file upload failed, please try again",500))
            }
        }

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

const forgotpassword=async(req,res,next)=>{
    const{email}=req.body;
    if(!email){
        return next(new Apperror("email is required",400))
    }
    const user=await User.findOne({email});
    if(!user){
        return next(new Apperror("email id not registred",400))
    }
    
        console.log(user)
    const resetToken=await user.generatePasswordResetToken();
    console.log(resetToken)
    await user.save();

    const resetpasswordUrl=`${process.env.FRONTED_URL}/reset-password/${resetToken}`
    console.log(resetpasswordUrl);

    const subject="Password Reset Request";
    //change name blog to as the name  of your app 
    const message=`
        <h1>Password Reset</h1>
        <p>You requested a password reset for your Snip Story accout.</p>
        <p>Click the link below to reset your password:</p>
      <a href="${resetpasswordUrl}">${resetpasswordUrl}</a>
      <p>This link expires in 15 minutes.</p>
      <p>If you didn’t request this, ignore this email.</p>
    `;
    await sendEmail(email,subject,message);

    res.status(200).json({
        success:true,
        message:`Reset password link sent to ${email} successfully  `
    })

}
const resestpassword=async(req,res,next)=>{
    const{resetToken}=req.params;
    const{password}=req.body;

    const forgotPasswordToken=crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

    const user=await User.findOne({
        forgotPasswordToken,
        forgotPasswordExpiry:{$gt:Date.now()},
    });
    if(!user){
        return next(new Apperror("link is invalid expired, please try again! ",400))
    }
    user.password=undefined;
    user.forgotPasswordToken=undefined;
    user.forgotPasswordExpiry=undefined;

    await user.save();

    res.status(200).json({
        success:true,
        message:"password changed successfully"
    })
}

const getprofile=async(req,res,next)=>{
        const userid=req.user.id;
        console.log(userid)
        const user=await User.findOne({_id:userid});//mongoose find one functionecepts a object but you are passing a value if you will pass{_id:useridthen } then it wont give any error ok understand this 
        //or use find by id method here ok 
        if(!user){
            return next(new Apperror("something went wrong please try again!"))
        }
        res.status(200).json({
            success:true,
            message:"user details",
            data:user
        })
}
const changepassword=async(req,res,next)=>{
    const{oldPassword,newPassword}=req.body;
    const{id}=req.user;

    if(!oldPassword||!newPassword){
        return next(new Apperror("All fields are required",400))
    }
    const user=await User.findById(id).select('+password')
    if(!user){
        return next(new Apperror("user does not exist",400))
    }
    const isPasswordValid=await user.comparePassword(oldPassword);
    if(!isPasswordValid){
        return next(new Apperror("Invalid password, please try again!",400))
    }
    user.password=newPassword;
    await user.save();

    res.status(200).json({
        success:true,
        message:"password changed successfully"
    })
}

const updateprofile=async(req,res,next)=>{
    const{userName}=req.body;
    const id=req.user;
    const user=await User.findById(id)
    if(!user){
        return next(new Apperror("User does not exist",400))
    }
    if(!userName){
        return next(new Apperror("All fields are required",400))
    }

    if(req.file){
        await cloudinary.v2.uploader.destroy(user.avatar.public_id);
        try{
            const result=cloudinary.v2.uploader.upload(req.file.path,{
                folder:"BLOG",
                width:250,
                height:250,
                gravity:"faces",
                crop:"fill"
            });
            if(result){
                user.avatar.public_id=(await result).public_id;
                user.avatar.secure_url=(await result).secure_url;
                await fs.rm(`uploads/${req.file.filename}`)
            }
        }catch(error){
            return next(new Apperror(error.message||"File not uploaded, please try again!",500))
        }
    }
    await user.save();

    res.status(200).json({
        success:true,
        message:"profile updated successfully",
        user
    })
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