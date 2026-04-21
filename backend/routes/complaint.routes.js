import express from "express";
import { createComplaint, getMyComplaints, getAssignedComplaints, updateStatus, upvoteComplaint, getAllComplaints } from "../controllers/complaint.controller.js";
import { protect, roleCheck } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/upload.middleware.js";

const router = express.Router();

router.route("/")
  .post(protect, upload.array("media", 3), createComplaint)
  .get(protect, roleCheck(["admin"]), getAllComplaints); // Admin sees all

router.get("/my", protect, getMyComplaints);
router.get("/assigned", protect, roleCheck(["incharge", "admin"]), getAssignedComplaints);

router.put("/:id/status", protect, roleCheck(["incharge", "admin"]), updateStatus);
router.put("/:id/upvote", protect, upvoteComplaint);

export default router;
