import Complaint from "../models/complaint.model.js";
import { assignIncharge } from "../services/routing.service.js";
import { suggestCategory } from "../services/ai.service.js";
import { sendNotification } from "../services/notification.service.js";
import { v2 as cloudinary } from "cloudinary";

// ─── Cloudinary Upload Helper ─────────────────────────────────────────────────
// Lazily uploads a file buffer using streams (no temp file on disk).
// Returns the secure URL string, or null if Cloudinary is not configured.
const uploadToCloudinary = (fileBuffer, folder = "campus_complaints") => {
  const isConfigured =
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET;

  if (!isConfigured) return Promise.resolve(null);

  // Configure right before use (safe guard)
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  return new Promise((resolve, reject) => {
    // Use dynamic import to avoid crash if streamifier is somehow missing
    import("streamifier").then(({ default: streamifier }) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder, resource_type: "auto" },
        (error, result) => {
          if (error) return reject(error);
          resolve(result.secure_url);
        }
      );
      streamifier.createReadStream(fileBuffer).pipe(uploadStream);
    }).catch(reject);
  });
};

// ─── Create Complaint ─────────────────────────────────────────────────────────
export const createComplaint = async (req, res) => {
  try {
    const { title, description, category, department, location } = req.body;

    // AI-assisted category suggestion if not manually selected
    const finalCategory = category || suggestCategory(description);

    // Upload media to Cloudinary — skip silently if not configured
    let mediaUrls = [];
    if (req.files && req.files.length > 0) {
      try {
        const uploads = req.files.map((file) => uploadToCloudinary(file.buffer));
        const results = await Promise.all(uploads);
        mediaUrls = results.filter(Boolean); // Remove nulls (unconfigured)
        if (mediaUrls.length > 0) {
          console.log(`[Cloudinary] Uploaded ${mediaUrls.length} file(s).`);
        } else {
          console.log(`[Cloudinary] Skipped — keys not set in .env. ${req.files.length} file(s) received.`);
        }
      } catch (uploadErr) {
        console.warn("[Cloudinary] Upload failed, continuing without media:", uploadErr.message);
      }
    }

    // Smart routing — assign to best-fit incharge
    const assignedToId = await assignIncharge(finalCategory, department);

    const complaint = await Complaint.create({
      title,
      description,
      category: finalCategory,
      department: department || "NONE",
      location: typeof location === "string" ? JSON.parse(location) : (location || {}),
      media: mediaUrls,
      raisedBy: req.user._id,
      assignedTo: assignedToId,
    });

    if (assignedToId) {
      sendNotification(assignedToId, `New complaint assigned: "${title}"`);
    }

    res.status(201).json(complaint);
  } catch (error) {
    console.error("[createComplaint error]:", error.message);
    res.status(500).json({ message: error.message });
  }
};

// ─── Get My Complaints (Student/Teacher) ─────────────────────────────────────
export const getMyComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({ raisedBy: req.user._id })
      .populate("assignedTo", "name department")
      .sort({ createdAt: -1 });
    res.json(complaints);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Get Assigned Complaints (Incharge) ──────────────────────────────────────
export const getAssignedComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({ assignedTo: req.user._id })
      .populate("raisedBy", "name email department")
      .sort({ createdAt: -1 });
    res.json(complaints);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Update Complaint Status (Incharge/Admin) ─────────────────────────────────
export const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, resolutionNotes } = req.body;

    const complaint = await Complaint.findById(id);
    if (!complaint) return res.status(404).json({ message: "Complaint not found" });

    // Authorization check
    if (
      req.user.role !== "admin" &&
      (!complaint.assignedTo || complaint.assignedTo.toString() !== req.user._id.toString())
    ) {
      return res.status(403).json({ message: "Not authorized to update this complaint" });
    }

    // Resolution notes required when marking resolved
    if (status === "resolved" && !resolutionNotes?.trim()) {
      return res.status(400).json({ message: "Resolution notes are required when marking as resolved" });
    }

    complaint.status = status || complaint.status;
    if (resolutionNotes) complaint.resolutionNotes = resolutionNotes;

    await complaint.save();

    sendNotification(
      complaint.raisedBy,
      `Your complaint "${complaint.title}" has been updated to: ${complaint.status}`
    );

    res.json(complaint);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Upvote Complaint ─────────────────────────────────────────────────────────
export const upvoteComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    const complaint = await Complaint.findById(id);
    if (!complaint) return res.status(404).json({ message: "Complaint not found" });

    // Prevent self-upvote
    if (complaint.raisedBy.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: "You cannot upvote your own complaint" });
    }

    // Prevent duplicate upvote
    if (complaint.upvotes.map(String).includes(String(req.user._id))) {
      return res.status(400).json({ message: "You have already upvoted this complaint" });
    }

    complaint.upvotes.push(req.user._id);

    // Auto-escalate priority based on upvote count
    if (complaint.upvotes.length > 10) complaint.priority = "high";
    else if (complaint.upvotes.length > 4) complaint.priority = "medium";

    await complaint.save();
    res.json(complaint);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Get All Complaints (Admin) ───────────────────────────────────────────────
export const getAllComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find()
      .populate("raisedBy", "name email department role")
      .populate("assignedTo", "name email department role")
      .sort({ createdAt: -1 });
    res.json(complaints);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
