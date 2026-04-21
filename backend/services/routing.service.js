import User from "../models/user.model.js";

/**
 * Smart Routing Rule:
 * - lab -> assign to incharge of that department
 * - mess / hostel -> assign to specific global incharge or admin? Let's just assign admin if no specific one found, else the first incharge.
 * - infra -> admin or general incharge.
 */
export const assignIncharge = async (category, department) => {
  try {
    // 1. Try to find an incharge exactly matching the department (highest priority)
    if (department && department !== "NONE") {
      const deptIncharge = await User.findOne({
        role: "incharge",
        department: department,
      });
      if (deptIncharge) return deptIncharge._id;
    }

    // 2. If no specific department was provided or none found, look for a general incharge
    const generalIncharge = await User.findOne({ 
      role: "incharge", 
      department: "NONE" 
    });
    if (generalIncharge) return generalIncharge._id;

    // 3. Last resort among incharges: Any incharge available
    const anyIncharge = await User.findOne({ role: "incharge" });
    if (anyIncharge) return anyIncharge._id;

    // 4. Default to admin if absolutely no incharges are registered
    const admin = await User.findOne({ role: "admin" });
    return admin ? admin._id : null;
  } catch (err) {
    console.error("Routing error:", err);
    return null;
  }
};
