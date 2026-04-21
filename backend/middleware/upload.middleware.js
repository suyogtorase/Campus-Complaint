import multer from "multer";

// Simplest approach: Use multer to store files in memory
// We will upload to cloudinary in the controller
const storage = multer.memoryStorage();
export const upload = multer({ storage });
