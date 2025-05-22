import Post from "../models/post.model.js";
import Apperror from "../utils/error.util.js"
import cloudinary from "cloudinary"
import fs from "fs/promises"
import mongoose from "mongoose";
import path from "path";
 export const createPost=async(req,res,next)=>{
    const {content}=req.body;
    const user=req.user;//from isloggedin middleware
    console.log(content,user)
    if(!content){
        return next(new Apperror("All fields are required",400))
    }

    const post=await Post.create({
        content,
        user:user.id,
        media:{
            public_id:"dummy",
            secure_url:"dummy"
        }

    });
    if(!post){
        return next(new Apperror("Course could not be created, please try again!"))
    }

    


    if(req.file){
        try{
            const result=await cloudinary.v2.uploader.upload(req.file.path,{
                folder:"BLOG",
                 resource_type: "auto", // Handle both images and videos
        transformation: [{ width: 800, crop: "scale" }, { quality: "auto" }],
            })
            console.log('Cloudinary upload result:', result);
      if (result) {
        post.media.public_id = result.public_id;
        post.media.secure_url = result.secure_url;
      }
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      return next(new Apperror(error.message || "File upload to Cloudinary failed, please try again", 500));
    } finally {
      try {
        await fs.rm(`uploads/${req.file.filename}`);
        console.log('Local file deleted:', req.file.filename);
      } catch (deleteError) {
        console.error('Error deleting local file:', deleteError);
      }
    
        }
    }

    

    await post.save();
    res.status(201).json({
        success:true,
        message:"Post created successfully",
        post
    })
}

export const getPosts=async(req,res,next)=>{
    const posts=await Post.find()
    .populate("user","userName email")//populate username and other fields ,select only username and email
    .populate("comments")//optionally populate comments if needed
    .sort({createdAt:-1});//sort by newest first

    res.status(200).json({
        success:true,
        message:"Post fetched successfully",
        posts
    })
}

export const getPost=async(req,res,next)=>{
    const {id} =req.params;
   // Validate post ID
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    return next(new Apperror("Invalid or missing post ID", 400));
  }
    const post =await Post.findById(id)
    .populate("user","userName email avatar")//populate user details
    .populate({
        path:'comments',
        populate:{path:"user",select:"userName email avatar"},//populate user details in comments
    })
    if(!post){
        return next(new Apperror("post not found",404))

    }
    res.status(200).json({
        success:true,
        message:'post fetched successfully',
        post
    })
}

export const updatePost = async (req, res, next) => {
  const { id } = req.params;
  const user = req.user;

  // Validate post ID
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    return next(new Apperror("Invalid or missing post ID", 400));
  }

  // Validate user
  if (!user || !user.id ) {
    return next(new Apperror("User not authenticated: Invalid or missing user ID", 401));
  }

  try {
    // Fetch the post to check ownership
    const post = await Post.findById(id);
    if (!post) {
      return next(new Apperror("Post not found", 404));
    }

    // Check if the authenticated user is the post's author
    if (post.user.toString() !== user.id.toString()) {
      return next(new Apperror("You are not authorized to update this post", 403));
    }

    // Filter req.body to allow only specific fields (e.g., content)
    const allowedFields = { content: req.body.content };
    if (!allowedFields.content || allowedFields.content.trim() === "") {
      delete allowedFields.content; // Remove if not provided or empty
    }

    // Handle media update if a new file is uploaded
    if (req.file) {
      // Validate file size and type
      if (req.file.size > 10 * 1024 * 1024) {
        await fs.rm(req.file.path);
        return next(new Apperror("File size exceeds 10MB limit", 400));
      }

      const allowedTypes = ["image/jpeg", "image/png", "video/mp4"];
      if (!allowedTypes.includes(req.file.mimetype)) {
        await fs.rm(req.file.path);
        return next(new Apperror("Only JPEG, PNG images, and MP4 videos are allowed", 400));
      }

      // Delete old media from Cloudinary if it exists
      if (post.media && post.media.public_id && post.media.public_id !== "dummy") {
        await cloudinary.v2.uploader.destroy(post.media.public_id, {
          resource_type: post.media.resource_type || "image",
        });
      }

      // Upload new media to Cloudinary
      const result = await cloudinary.v2.uploader.upload(req.file.path, {
        folder: "BLOG",
        resource_type: "auto", // Handle both images and videos
        transformation: [{ width: 800, crop: "scale" }, { quality: "auto" }],
      });
      console.log("Cloudinary upload result:", result);

      if (result) {
        // Update media field
        allowedFields.media = {
          public_id: result.public_id,
          secure_url: result.secure_url,
          resource_type: result.resource_type,
          width: result.width,
          height: result.height,
          bytes: result.bytes,
          duration: result.duration,
          format: result.format,
        };
      }

      // Delete local file
      try {
        await fs.rm(req.file.path);
        console.log("Local file deleted:", req.file.path);
      } catch (deleteError) {
        console.error("Error deleting local file:", deleteError);
      }
    }

    // Check if there are any fields to update
    if (Object.keys(allowedFields).length === 0) {
      return next(new Apperror("No changes provided to update the post", 400));
    }

    // Update the post
    const newpost = await Post.findByIdAndUpdate(
      id,
      {
        $set: allowedFields,
      },
      {
        runValidators: true,
        new: true, // Return the updated document
      }
    );

    if (!newpost) {
      return next(new Apperror("Post with given id does not exist", 404));
    }

    res.status(200).json({
      success: true,
      message: "Post updated successfully",
      newpost,
    });
  } catch (error) {
    // Clean up local file if an error occurs
    if (req.file) {
      try {
        await fs.rm(req.file.path);
        console.log("Local file deleted in error catch:", req.file.path);
      } catch (deleteError) {
        console.error("Error deleting local file:", deleteError);
      }
    }
    return next(new Apperror(error.message || "Failed to update post", 500));
  }
};

export const deletePost=async(req,res,next)=>{
    const {id} =req.params;
    // Validate post ID
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    return next(new Apperror("Invalid or missing post ID", 400));
  }
    const user=req.user;
    const post=await Post.findById(id);
    if(!post){
        return next(new Apperror("Post not found",404))
    }
    //check authenticity
    if(post.user.toString()!==user.id.toString()){
        return next (new Apperror("You are not authorized to delete the post",400))
    }

    // Delete associated media from Cloudinary if it exists
    if (post.media && post.media.public_id && post.media.public_id !== "dummy") {
      await cloudinary.v2.uploader.destroy(post.media.public_id, {
        resource_type: post.media.resource_type || "image",
      });
      console.log("Cloudinary media deleted:", post.media.public_id);
    }

   // Delete the post
    await Post.findByIdAndDelete(id);

    res.status(200).json({
        success:true,
        message:"Post deleted successfully"
    })

}

export const likePost=async(req,res,next)=>{
    const {id} =req.params;
    const user=req.user;

    if(!id||!mongoose.Types.ObjectId.isValid(id)){
        return next(new Apperror("Invalid or missing post id",400))
    }
    //validate user
    if(!user||!user.id){
        return next(new Apperror("User not authenticated: inavlid or missing",400))
    }

    //fetch the post
    const post=await Post.findById(id)
    if(!post){
        return next(new Apperror("Post not found",404))
    }
    //check if the user has already liked the post
    const userIdStr=user.id.toString();
    const hasLiked=post.likes.some((likeId)=>likeId.toString()===userIdStr);

    if(hasLiked){
        //unlike:remove the user's id from the likes array
        post.likes=post.likes.filter((likeId)=>likeId.toString()!==userIdStr)
    }else{
        //like :add the user's id to likes array
        post.likes.push(user.id);
    }

    //save the updated post
    await post.save();

    const updatedPost=await Post.findById(id)
    .populate("user","userName email avatar ")
    .populate({
        path:"comments",
        populate:{
            path:"user",
            select:"userName email avatar "
        }
    })

    res.status(200).json({
        success:true,
        message:hasLiked?"Post unliked successfully":"post liked successfully",
        post:updatedPost,
    })
}