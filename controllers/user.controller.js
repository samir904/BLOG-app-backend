import Apperror from "../utils/error.util.js";

const register=async(req,res,next)=>{
    console.log(`register controller is hitted`)
        const{userName,email,password}=req.body;

        if(!userName||!email||!password){
            return next( new Apperror("all fields are required",400))
        }

        console.log(userName,email,password)
}
const login=async()=>{

}
const logout=async()=>{

}

export {
    register,
    login,
    logout
}