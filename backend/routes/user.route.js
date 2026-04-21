import express from "express";
import { signup, login } from "../controllers/user.controller.js";

const UserRouter = express.Router();

// Auth Routes
UserRouter.post("/signup", signup);
UserRouter.post("/login", login);

export default UserRouter;