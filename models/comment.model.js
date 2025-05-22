import {Schema,model} from "mongoose"

const commentSchema=new Schema({
    user:{
        type:Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    post:{
        type:Schema.Types.ObjectId,
        ref:"Post",
        required:true
    },
    content:{
        type:String,
        required:true,
        trim:true,
        minLength:[2,"Comment length must be minimum of two character"],
        maxLength:[200,"comment must be less than 200 character  "]
    }
},{
    timestamps:true
}
)

const Comment=model("Comment",commentSchema);

export default Comment;