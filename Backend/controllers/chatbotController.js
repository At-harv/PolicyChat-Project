// controllers/chatbotController.js
export const chatbotQuery = async (req, res) => {
    try {
      const { query } = req.body;
  
      if (!query) {
        return res.status(400).json({ message: "Query is required" });
      }
  
      // For now, return a mock response (later integrate AI/logic here)
      const response = `You asked: "${query}". This is a placeholder chatbot response.`;
  
      res.json({ message: "Chatbot response ✅", response });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: error.message });
    }
  };
  