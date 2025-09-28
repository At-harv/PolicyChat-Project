// controllers/chatbotController.js
import axios from "axios";

export const chatbotQuery = async (req, res) => {
  try {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({ message: "Query is required" });
    }

    // Get the logged-in user id (assuming your auth middleware sets req.user)
    const userId = req.user?.id || 1; // fallback to 1 if you don’t have auth yet

    // Call the Python retrieval API
    const pythonRes = await axios.post("http://localhost:9000/query", {
      user_id: userId,
      query: query,
      top_k: 3,
    });

    const { answer, sources } = pythonRes.data;

    res.json({
      message: "Chatbot response ✅",
      response: answer,
      sources: sources,
    });
  } catch (error) {
    console.error("Chatbot error:", error.response?.data || error.message);
    res.status(500).json({
      message: "Chatbot service failed",
      error: error.response?.data || error.message,
    });
  }
};
