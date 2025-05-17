import { Schema,model } from "mongoose";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
const userSchema=new Schema({
    userName:{
        type:String,
        required:true,
        trim:true,
        minLength:[5,"name must e atleast 5 character long"],
        maxLength:[20,"name must be less than 20 character"],
        lowerCase:true
    },
    email:{
        type:String,
        required:true,
        unique:true,
        match: [/^[^@]+@[^@]+\.[^@]+$/, "Please enter a valid email address"],
        trim:true,
        lowerCase:true

    },
    password:{
        type:String,
        required:true,
        minLength:[8,"pasword must minimum of 8 character"],
        //maxLength:[20,"password must be less than 20 character"],
        //it should be not there because hashed password length get increased or use 60 character
        select:false
    },
    avatar:{
        public_id:{
            type:String
        },
        secure_url:{
            type:String
        }
    },
    role:{
        type:String,
        enum:["user","ADMIN"],
        default:"user",
    },
    forgotpassword:Date
},
{
    timestamps:true
})

userSchema.pre("save",async function(next){
    console.log(`pre method hitted`)
    if(!this.isModified("password")){
        console.log("password is not hashed")
        return next();
        
    }
    try{
        console.log(`hashing the password`,this.password)
        this.password=await bcrypt.hash(this.password,10);
        console.log(`password hashed successfully`)
        next()
    }catch(error){
        console.log(`error occured while hashing password `,error)
        next(error)
    }
})

//userschema methods should be defined above model initalization
userSchema.methods={
    generateJWTToken:async function () {
        return await jwt.sign(
            {
                id:this.id,
                email:this.email,
                role:this.role
            },
                process.env.JWT_SECRET,
            {
              expiresIn:process.env.JWT_EXPIRY  
            }
        )
    },
    
    comparePassword:async function(plainTextPassword){
        return await bcrypt.compare(plainTextPassword,this.password)
    }
    //other method
}
const User=model("User",userSchema);


export default User;