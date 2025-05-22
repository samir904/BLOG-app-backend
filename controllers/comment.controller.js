import mongoose from "mongoose";
import Apperror from "../utils/error.util.js";
import Post from "../models/post.model.js"
import Comment from "../models/comment.model.js";
export const createComment=async(req,res,next)=>{
    const user=req.user;
    const{postId}=req.params;//get post id from url params

    const {content}=req.body;

    //validate post id
    if(!postId||!mongoose.Types.ObjectId.isValid(postId)){
        return next(new Apperror("Invalid or missing post id",400))
    }

    //validate user
    if(!user||!user.id){
        return next (new Apperror ("user not authenticated:missing or invalid",401))
    }

    const post=await Post.findById(postId);
    if(!post){
        return next(new Apperror("Post not found",404))
    }

    //create and save  the comment ||or you can use new keyword to create it then save it both are ok
    const comment =await Comment.create({
        user:user.id,
        post:postId,
        content:content
    })

    //add the comment to post comment array
    post.comments.push(comment._id);
    await post.save();

    //populate the user field in the comment
    const populatedComment=await Comment.findById(comment._id)
    .populate("user","userName email avatar ")

    res.status(201).json({
        success:true,
        message:"Comment created successfully",
        comment:populatedComment,
    })
}

export const getComments=async(req,res,next)=>{
    const {postId}=req.params;

    if(!postId||!mongoose.Types.ObjectId.isValid(postId)){
        return next(new Apperror("Inavlid or missing post id",400))
    }

    const post=await Post.findById(postId);
    if(!post){
        return next(new Apperror("Post not found",404))
    }

    const comments=await Comment.find({post:postId})
    .populate("user","userName email avatar ")
    .sort({createdAt:-1});//sort the newest first

    res.status(200).json({
        success:true,
        message:"Comments fetched successfully",
        comments
    })

}

export const updateComment=async(req,res,next)=>{
    const{commentId}=req.params;
    const{content}=req.body;
    const user=req.user;
    // Validate comment ID
  if (!commentId || !mongoose.Types.ObjectId.isValid(commentId)) {
    return next(new Apperror("Invalid or missing comment ID", 400));
  }

  //validate user
  if(!user||!user.id){
    return next(new Apperror("user is not authenticated: inavalid or missing"))
  }

  //fetch the comment
  const comment=await Comment.findById(commentId);
  if(!comment){
    return next(new Apperror("Comment not found",404))
  }

  //check if the authenticated user is the comment's author

  if(comment.user.toString()!==user.id.toString()){
    return next(new Apperror("You are not authorized to update this comment",403))
  }

 
  //populate the user field
  const updatedComment=await Comment.findByIdAndUpdate(
    commentId,
    {
        $set:{content:content}
    },{
            runValidators:true,
            new:true
        }
    ).populate("user","userName email avatar ")

    if(!updatedComment){
        return next(new Apperror("Comment not found",404))
    }

  res.status(200).json({
    success:true,
    message:"Comment updated successfully",
    comment:updatedComment
  })

}

export const deleteComment=async(req,res,next)=>{
    const {commentId}=req.params;
    const user=req.user;
      // Validate comment ID
  if (!commentId || !mongoose.Types.ObjectId.isValid(commentId)) {
    return next(new Apperror("Invalid or missing comment ID", 400));
  }

   //validate user
  if(!user||!user.id){
    return next(new Apperror("user is not authenticated: invalid or missing",401))
  }

  //fetch the comment
  const comment=await Comment.findById(commentId);
  if(!comment){
    return next(new Apperror("Comment not found",404))
  }

  //check if the authenticated user is the comment's author

  if(comment.user.toString()!==user.id.toString()){
    return next(new Apperror("You are not authorized to update this comment",403))
  }
  
  //remove the associated post's comment array
  const post=await Post.findById(comment.post);
  if(!post){
    return next(new Apperror("Associated post not found",404))
  }
  post.comments=post.comments.filter((id)=>id.toString()!==commentId);
  await post.save();

  //delete the comment
  await Comment.findByIdAndDelete(commentId);

  res.status(200).json({
    success:true,
    message:"Comment deleted successfully"
  })

}