import { Policy } from "../models/Policy.js";
import fs from "fs";
import path from "path";
import { exec } from "child_process";
// ------------------ ADD POLICY ------------------
export const addPolicy = async (req, res) => {
  try {
    const {
      policyName,
      policyNumber,
      insuranceCompany,
      policyType,
      premiumAmount,
      premiumFrequency,
      coverageAmount,
      status,
      startDate,
      endDate,
      notes,
    } = req.body;

    if (!policyName || !policyNumber || !insuranceCompany) {
      return res.status(400).json({ message: "Please fill required fields" });
    }

    // Save file paths locally
    const documents = req.files
      ? req.files.map((file) => `/uploads/${file.filename}`)
      : [];

    const policy = await Policy.create({
      policyName,
      policyNumber,
      insuranceCompany,
      policyType,
      premiumAmount,
      premiumFrequency,
      coverageAmount,
      status: status.toLowerCase(),
      startDate,
      endDate,
      notes,
      documents,
      userId: req.user.id,
    });

    // -------------------- Python ChromaDB ingestion --------------------
    const pyPath = path.join(
      process.cwd(),
      "policy_vector_pipeline",
      "pipeline.py"
    );

    // Call Python script with the newly created policy ID
    exec(`python "${pyPath}" ${policy.id}`, (error, stdout, stderr) => {
      if (error) console.error("Python ingestion error:", error.message);
      if (stderr) console.error("Python ingestion stderr:", stderr);
      if (stdout) console.log("Python ingestion stdout:", stdout);
    });
    // -------------------------------------------------------------------

    res.status(201).json({ message: "Policy created ✅", policy });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// ------------------ GET ALL POLICIES ------------------
export const getPolicies = async (req, res) => {
  try {
    const policies = await Policy.findAll({
      where: { userId: req.user.id },
      order: [["createdAt", "DESC"]],
    });

    res.json({ message: "Policies retrieved ✅", policies });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// ------------------ DELETE POLICY ------------------
export const deletePolicy = async (req, res) => {
  try {
    const { id } = req.params;

    const policy = await Policy.findByPk(id);

    if (!policy) {
      return res.status(404).json({ message: "Policy not found" });
    }

    // Only allow deletion if the policy belongs to the user
    if (policy.userId !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Delete files from local storage
    if (policy.documents && policy.documents.length > 0) {
      policy.documents.forEach((filePath) => {
        const fullPath = path.join(process.cwd(), filePath);
        if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
      });
    }

    await policy.destroy();

    res.json({ message: "Policy deleted ✅" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// ------------------ GET DASHBOARD STATS ------------------
export const getDashboard = async (req, res) => {
  try {
    const policies = await Policy.findAll({ where: { userId: req.user.id } });

    const activePolicies = policies.filter((p) => p.status === "active").length;
    const totalCoverage = policies.reduce(
      (sum, p) => sum + Number(p.coverageAmount),
      0
    );
    const monthlyPremiums = policies
      .filter((p) => p.premiumFrequency === "Monthly")
      .reduce((sum, p) => sum + Number(p.premiumAmount), 0);
    const expiringSoon = policies.filter(
      (p) => new Date(p.endDate) - new Date() <= 7 * 24 * 60 * 60 * 1000
    );

    res.json({
      message: "Dashboard stats ✅",
      stats: { activePolicies, totalCoverage, monthlyPremiums, expiringSoon },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// ------------------ GET POLICY BY ID ------------------
export const getPolicyById = async (req, res) => {
  try {
    const { id } = req.params;

    const policy = await Policy.findOne({
      where: { id, userId: req.user.id }, // ensure user can only fetch their own
    });

    if (!policy) {
      return res.status(404).json({ message: "Policy not found" });
    }

    res.json({ message: "Policy retrieved ✅", policy });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};
