import cron from "node-cron";
import Complaint from "../models/complaint.model.js";

// Run every hour
export const startSlaCronJobs = () => {
  cron.schedule("0 * * * *", async () => {
    try {
      console.log("[SLA Service] Running cron job to check SLA breaches...");
      
      const fortyEightHoursAgo = new Date();
      fortyEightHoursAgo.setHours(fortyEightHoursAgo.getHours() - 48);

      const staleComplaints = await Complaint.find({
        status: { $in: ["pending", "in_progress"] },
        createdAt: { $lt: fortyEightHoursAgo },
      });

      if (staleComplaints.length > 0) {
        for (let comp of staleComplaints) {
          comp.status = "escalated";
          comp.priority = "high";
          await comp.save();
        }
        console.log(`[SLA Service] Escalated ${staleComplaints.length} complaints.`);
      } else {
        console.log("[SLA Service] No complaints breached SLA.");
      }
    } catch (error) {
      console.error("[SLA Service Error]:", error);
    }
  });

  console.log("[SLA Service] Node-Cron job started.");
};
