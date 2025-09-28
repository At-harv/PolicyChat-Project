// // src/pages/Chat.jsx
// import React, { useState } from "react";
// import axios from "axios";
// import MainLayout from "./mainlayout";

// const Chat = () => {
//   const [query, setQuery] = useState("");
//   const [messages, setMessages] = useState([]);
//   const [loading, setLoading] = useState(false);

//   const handleSend = async (e) => {
//     e.preventDefault();
//     if (!query.trim()) return;

//     const newMessage = { type: "user", text: query };
//     setMessages((prev) => [...prev, newMessage]);
//     setQuery("");
//     setLoading(true);

//     try {
//       const { data } = await axios.post("/chatbot/query", {
//         query: newMessage.text,
//       });

//       setMessages((prev) => [...prev, { type: "bot", text: data.response }]);
//     } catch (error) {
//       setMessages((prev) => [
//         ...prev,
//         { type: "bot", text: "An error occurred." },
//       ]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="flex flex-col h-full">
//       <div className="flex-1 overflow-y-auto border rounded-lg p-4 space-y-4 bg-gray-50">
//         {messages.map((msg, index) => (
//           <div
//             key={index}
//             className={`max-w-xs p-3 rounded-lg ${
//               msg.type === "user"
//                 ? "bg-blue-100 self-end text-right ml-auto"
//                 : "bg-gray-200 self-start text-left"
//             }`}
//           >
//             {msg.text}
//           </div>
//         ))}
//         {loading && <div className="text-sm text-gray-500">Thinking...</div>}
//       </div>

//       <form onSubmit={handleSend} className="mt-4 flex">
//         <input
//           type="text"
//           value={query}
//           onChange={(e) => setQuery(e.target.value)}
//           placeholder="Ask me anything..."
//           className="flex-1 p-2 border rounded-l-md focus:outline-none"
//         />
//         <button
//           type="submit"
//           disabled={loading}
//           className="bg-blue-600 text-white px-4 py-2 rounded-r-md hover:bg-blue-700 disabled:opacity-50"
//         >
//           Send
//         </button>
//       </form>
//     </div>
//   );
// };

// export default Chat;

import React, { useState } from "react";
import axios from "axios";
import MainLayout from "./mainlayout";

const Chat = () => {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  // const handleSend = async (e) => {
  //   e.preventDefault();
  //   if (!query.trim()) return;

  //   const newMessage = { type: "user", text: query };
  //   setMessages((prev) => [...prev, newMessage]);
  //   setQuery("");
  //   setLoading(true);

  //   try {
  //     // Point to your backend explicitly
  //     const { data } = await axios.post(
  //       "http://localhost:8000/api/chatbot/query",
  //       {
  //         query: newMessage.text,
  //       },
  //       {
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //         },
  //       }
  //     );

  //     setMessages((prev) => [...prev, { type: "bot", text: data.response }]);
  //   } catch (error) {
  //     console.error(error);
  //     setMessages((prev) => [
  //       ...prev,
  //       { type: "bot", text: "An error occurred." },
  //     ]);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    const newMessage = { type: "user", text: query };
    setMessages((prev) => [...prev, newMessage]);
    setQuery("");
    setLoading(true);

    try {
      // Get token from localStorage
      const token = localStorage.getItem("token");

      const { data } = await axios.post(
        "http://localhost:8000/api/chatbot/query", // backend route
        { query: newMessage.text },
        {
          headers: { Authorization: `Bearer ${token}` }, // send token
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
      <div className="flex-1 overflow-y-auto border rounded-lg p-4 space-y-4 bg-gray-50">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`max-w-xs p-3 rounded-lg ${
              msg.type === "user"
                ? "bg-blue-100 self-end text-right ml-auto"
                : "bg-gray-200 self-start text-left"
            }`}
          >
            {msg.text}
          </div>
        ))}
        {loading && <div className="text-sm text-gray-500">Thinking...</div>}
      </div>

      <form onSubmit={handleSend} className="mt-4 flex">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask me anything..."
          className="flex-1 p-2 border rounded-l-md focus:outline-none"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded-r-md hover:bg-blue-700 disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default Chat;
