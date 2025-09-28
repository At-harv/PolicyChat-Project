// routes/chatbotRoutes.js
import express from "express";
import { chatbotQuery } from "../controllers/chatbotController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// protected route - only logged in users can chat
router.post("/query",protect,chatbotQuery);

export default router;
