import { Router } from "express";
import { login, logout, register } from "../controllers/user.controller.js";
import asyncWrap from "../utils/asyncWrap.js";

const router=Router();

//todo file -profile photo upload
router.post("/register",asyncWrap(register))
router.post("/login",login)
router.get("/logout",logout)

export default router;