import express from "express";
import {
  updateProfile,
  updateAvatar,
  updatePassword,
  getAllUsers,
  updateUserStatus,
} from "../controllers/user.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { roleCheckMiddleware } from "../middlewares/roleCheckMiddleware.js";
import upload from "../middlewares/upload.middleware.js";

const userRouter = express.Router();

// Apply auth middleware only to /users routes
userRouter.use("/users", authMiddleware);

userRouter.put("/users/profile", updateProfile);
userRouter.put("/users/avatar", upload.single("avatar"), updateAvatar);
userRouter.put("/users/password", updatePassword);

// Admin-only user management routes
userRouter.get("/users", roleCheckMiddleware, getAllUsers);
userRouter.patch("/users/:use rId/status", roleCheckMiddleware, updateUserStatus);

export default userRouter;