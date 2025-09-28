import React, { useState } from "react";
import axios from "axios";
import { Send } from "lucide-react"; // arrow send icon

const Chat = () => {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    const newMessage = { type: "user", text: query };
    setMessages((prev) => [...prev, newMessage]);
    setQuery("");
    setLoading(true);

    try {
      //Get token from local storage
      const token = localStorage.getItem("token");
      const { data } = await axios.post(
        "http://localhost:8000/api/chatbot/query", //backend route
        { query: newMessage.text },
        {
          headers: { Authorization: `Bearer ${token}` }, //send token
        }
      );

      setMessages((prev) => [...prev, { type: "bot", text: data.response }]);
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        { type: "bot", text: "An error occurred." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat messages */}
      <div className="flex-1 bg-gray-50 p-4 flex flex-col space-y-2 bg-transparent">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex w-full ${
              msg.type === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`inline-block px-4 py-2 rounded-2xl text-sm shadow break-words ${
                msg.type === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-900"
              }`}
              style={{ maxWidth: "50%" }} // ✅ bubble won’t exceed half page
            >
              {msg.text}
            </div>
          </div>
        ))}

        {loading && (
          <div className="text-sm text-gray-500 italic">Thinking...</div>
        )}
      </div>

      {/* Input area fixed at bottom */}
      <form
        onSubmit={handleSend}
        className="p-4 bg-gray-50 bg-transparent flex items-center"
      >
        <div className="flex items-center w-full bg-gray-50 bg-trasnparent rounded-full shadow px-4">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search"
            className="flex-1 p-3 bg-white text-gray-900 placeholder-gray-400 rounded-full focus:outline-none"
          />
          <button
            type="submit"
            disabled={loading}
            className="ml-2 p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center"
          >
            <Send size={18} />
          </button>
        </div>
      </form>
    </div>
  );
};

export default Chat;
