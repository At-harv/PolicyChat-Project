import express from "express";
import { addPolicy, getPolicies } from "../controllers/policyController.js";
import multer from "multer";

const router = express.Router();

// Multer storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"), // folder to store PDFs
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});

const upload = multer({ storage });

// Routes
router.post("/policies", upload.array("documents"), addPolicy);
router.get("/policies", getPolicies);

export default router;
