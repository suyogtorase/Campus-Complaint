import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./config/db.js";
import { startSlaCronJobs } from "./services/sla.service.js";

import authRoutes from "./routes/auth.routes.js";
import complaintRoutes from "./routes/complaint.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import feedbackRoutes from "./routes/feedback.routes.js";

dotenv.config();

const app = express();

// Connect Database
connectDB();

// Start Background Services
startSlaCronJobs();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/feedback", feedbackRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("Smart Campus System API is running");
});

// Start Server
const PORT = process.env.PORT || 7000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});