import Feedback from "../models/feedback.model.js";
import Complaint from "../models/complaint.model.js";

export const createFeedback = async (req, res) => {
  try {
    const { complaintId, rating, comment } = req.body;

    const complaint = await Complaint.findById(complaintId);
    if (!complaint) return res.status(404).json({ message: "Complaint not found" });

    if (complaint.status !== "resolved") {
      return res.status(400).json({ message: "Can only feedback on resolved complaints" });
    }

    const existingFeedback = await Feedback.findOne({ complaintId, givenBy: req.user._id });
    if (existingFeedback) {
      return res.status(400).json({ message: "Feedback already submitted" });
    }

    const feedback = await Feedback.create({
      complaintId,
      rating,
      comment,
      givenBy: req.user._id,
    });

    res.status(201).json(feedback);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getFeedbackForComplaint = async (req, res) => {
  try {
    const { complaintId } = req.params;
    const feedback = await Feedback.find({ complaintId }).populate("givenBy", "name");
    res.json(feedback);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
