import mongoose from "mongoose";

const complaintSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ["lab", "mess", "hostel", "infra", "other"],
      required: true,
    },
    department: {
      type: String,
      enum: ["COMP", "IT", "AI&DS", "ENTC", "ECE", "NONE"],
      default: "NONE",
    },
    location: {
      building: { type: String, default: "" },
      floor: { type: String, default: "" },
      room: { type: String, default: "" },
    },
    media: [
      {
        type: String, // URLs from Cloudinary
      },
    ],
    raisedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null, // Will be auto-assigned by routing service
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "low",
    },
    status: {
      type: String,
      enum: ["pending", "in_progress", "resolved", "escalated"],
      default: "pending",
    },
    upvotes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    resolutionNotes: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

const Complaint = mongoose.model("Complaint", complaintSchema);

export default Complaint;
