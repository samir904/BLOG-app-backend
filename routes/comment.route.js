import { Router } from "express";
import asyncWrap from "../utils/asyncWrap.js"
import { isLoggedin } from "../middlewares/auth.middleware.js";
import {  deleteComment, updateComment } from "../controllers/comment.controller.js";

const router=Router();

//comment route

router.put("/:commentId",asyncWrap(isLoggedin),asyncWrap(updateComment));
router.delete("/:commentId",asyncWrap(isLoggedin),asyncWrap(deleteComment))

export default router;