import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import UserRouter from "./routes/user.route.js";

dotenv.config();

const app = express();

// Connect Database
connectDB();

// Middleware
app.use(express.json());

app.use("/api/user", UserRouter);

// Test route
app.get("/", (req, res) => {
  res.send("API is running");
});

// Start Server
const PORT = process.env.PORT || 7000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});