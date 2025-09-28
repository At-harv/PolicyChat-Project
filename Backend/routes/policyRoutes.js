import express from "express";
import multer from "multer";
import {
  addPolicy,
  getPolicies,
  deletePolicy,
  getDashboard,
  getPolicyById,
} from "../controllers/policyController.js";
import { protect } from "../middleware/authMiddleware.js"; // your JWT auth

const router = express.Router();

// Multer setup for local file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"), // folder must exist
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});

const upload = multer({ storage });

// ------------------- Routes -------------------
router.post("/", protect, upload.array("documents", 5), addPolicy); // max 5 files
router.get("/", protect, getPolicies);
router.get("/dashboard", protect, getDashboard);
router.delete("/:id", protect, deletePolicy);
router.get("/:id", protect, getPolicyById);
export default router;
