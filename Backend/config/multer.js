import multer from "multer";

// Store files in memory for Cloudinary
const storage = multer.memoryStorage(); 

const upload = multer({ storage });

export default upload;
