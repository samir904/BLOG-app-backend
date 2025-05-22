import { Router } from "express";
import asyncWrap from "../utils/asyncWrap.js";
import { isLoggedin } from "../middlewares/auth.middleware.js";
import upload from "../middlewares/multer.middleware.js";
import { createPost, deletePost, getPost, getPosts, likePost, updatePost } from "../controllers/post.controller.js";
import { createComment, getComments } from "../controllers/comment.controller.js";

const router=Router();


router.post("/create",asyncWrap(isLoggedin),upload.single("media"),asyncWrap(createPost));
router.get("/",asyncWrap(getPosts));
router.get("/:id",asyncWrap(getPost));
router.put("/:id",asyncWrap(isLoggedin),upload.single("media"),asyncWrap(updatePost));
router.delete("/:id",asyncWrap(isLoggedin),asyncWrap(deletePost));
router.post("/:id/like",asyncWrap(isLoggedin),asyncWrap(likePost))
router.post("/:postId/comment", asyncWrap(isLoggedin), asyncWrap(createComment)); // Moved here
router.get("/:postId/comments", asyncWrap(getComments)); // Moved here
export default router;