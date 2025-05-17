import { Schema,model } from "mongoose";


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
        maxLength:[20,"password must be 20 character"],
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
    forgotpasword:Date
},
{
    timestamps:true
})

const User=model("User",userSchema);

export default User;