import express from 'express'
import {getCurrentUser, registerUser, updatePassword, updateProfile, loginUser} from '../controllers/userController.js';
import authMiddleware from '../middleware/auth.js';

const userRouter = express.Router();
userRouter.post("/register",registerUser);
userRouter.post("/login",loginUser);

//protected routes (user must be locked in for this)
userRouter.get("/me", authMiddleware, getCurrentUser);
userRouter.put("/profile", authMiddleware, updateProfile);
userRouter.put("/password", authMiddleware, updatePassword);

export default userRouter;