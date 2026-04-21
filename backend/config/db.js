import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(`MongoDB Atlas connected`);
    
  } catch (error) {
    console.error("MongoDB connection failed");
    console.error(error.message);

    // Exit process if DB fails
    process.exit(1);
  }
};