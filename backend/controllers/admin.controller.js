import Complaint from "../models/complaint.model.js";
import User from "../models/user.model.js";

export const getDashboardStats = async (req, res) => {
  try {
    const totalComplaints = await Complaint.countDocuments();
    const pending = await Complaint.countDocuments({ status: "pending" });
    const inProgress = await Complaint.countDocuments({ status: "in_progress" });
    const resolved = await Complaint.countDocuments({ status: "resolved" });
    const escalated = await Complaint.countDocuments({ status: "escalated" });

    // Complaints per Department
    const deptStatsRaw = await Complaint.aggregate([
      { $group: { _id: "$department", count: { $sum: 1 } } },
    ]);
    const deptStats = deptStatsRaw.map(d => ({ name: d._id, count: d.count }));

    // Complaints by Category
    const catStatsRaw = await Complaint.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ]);
    const categoryStats = catStatsRaw.map(c => ({ name: c._id, count: c.count }));

    res.json({
      overview: { total: totalComplaints, pending, inProgress, resolved, escalated },
      departmentStats: deptStats,
      categoryStats: categoryStats,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
