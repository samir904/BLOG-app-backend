import mongoose, {Schema,model} from "mongoose"

const postSchema=new Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    content:{
        type:String,
        required:true,
        trim:true,
        minLength:[2,"content must be atlest two character long"],
        maxLength:[1000,"content must be less than 1000 character"]
    },
    media:{
        public_id:{
            type:String,
            required:true
        },
        secure_url:{
            type:String,
            required:true
        }
    },
    likes:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"User"
        }
    ],
    comments:[
        {
            type:Schema.Types.ObjectId,
            ref:"Comment"
        }
    ]
},{
    timestamps:true
})

const Post=model("Post",postSchema);

export default Post;