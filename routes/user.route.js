import { Router } from "express";
import { changepassword, forgotpassword, getprofile, login, logout, register, resetpassword, updateprofile } from "../controllers/user.controller.js";
import asyncWrap from "../utils/asyncWrap.js";
import { isLoggedin } from "../middlewares/auth.middleware.js";
import upload from "../middlewares/multer.middleware.js";

const router=Router();

//todo file -profile photo upload
router.post("/register",upload.single("avatar"),asyncWrap(register))
router.post("/login",asyncWrap(login))
router.get("/logout",asyncWrap(isLoggedin), logout)
router.get("/getprofile", asyncWrap(isLoggedin), asyncWrap(getprofile))
router.post("/reset",asyncWrap(forgotpassword))
router.post("/reset/:resetToken",asyncWrap(resetpassword))
router.post("/change-password",asyncWrap(isLoggedin),asyncWrap(changepassword))
router.put("/update",asyncWrap(isLoggedin),upload.single("avatar"),asyncWrap(updateprofile))


export default router;