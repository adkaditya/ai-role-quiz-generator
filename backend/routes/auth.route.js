import express from "express";
import {
  changeUserRole,
  deleteUser,
  loginUser,
  registerUser,
} from "../controllers/auth.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { roleCheckMiddleware } from "../middlewares/roleCheckMiddleware.js";
const authRouter = express.Router();
authRouter.post("/register", registerUser);
authRouter.post("/login", loginUser);
authRouter.post(
  "/change-user-role",
  authMiddleware,
  roleCheckMiddleware,
  changeUserRole
);
authRouter.delete("/delete", authMiddleware, roleCheckMiddleware, deleteUser);

export default authRouter;