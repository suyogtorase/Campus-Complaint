import express from "express";
import { getDashboardStats, getAllUsers } from "../controllers/admin.controller.js";
import { protect, roleCheck } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(protect, roleCheck(["admin"]));

router.get("/stats", getDashboardStats);
router.get("/users", getAllUsers);

export default router;
