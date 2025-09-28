import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import policyRoutes from "./routes/policyRoutes.js";
import { sequelize } from "./config/db.js";
import { User } from "./models/User.js";
import path from "path";
import { Policy } from "./models/Policy.js";
import chatbotRoutes from "./routes/chatbotRoutes.js";

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log("PostgreSQL Connected ✅");

    // Sync all models
    await sequelize.sync({ alter: true }); // alter:true updates DB structure
    console.log("All tables synced ✅");

    app.listen(process.env.PORT || 8000, () => {
      console.log(`Server running on port ${process.env.PORT || 8000}`);
    });
  } catch (error) {
    console.error("DB Connection Failed ❌", error.message);
  }
};

startServer();


dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // ✅ MUST be present to parse JSON
app.use(express.urlencoded({ extended: true })); // for form-data
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
// Routes
app.use("/api/auth", authRoutes);
app.use("/api/policies", policyRoutes);
app.use("/api/chatbot", chatbotRoutes);

app.listen(process.env.PORT || 8000, () =>
  console.log(`Server running on port ${process.env.PORT || 8000}`)
);
