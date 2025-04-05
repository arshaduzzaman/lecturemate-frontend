import { useState } from "react";
import axios from "axios";

const ChatbotPage = ({darkMode}) => {
  const [input, setInput] = useState("");
  const [chat, setChat] = useState([
    {
      role: "assistant",
      content: "Please ask me any questions regarding your lecture!",
    },
  ]);

  const getGptResponse = async (latestChat) => {
    const url = import.meta.env.VITE_URL;
    const response = await axios.post(
      `${url}/get-response`,
      { chat: latestChat },
      { headers: { "Content-Type": "application/json" } }
    );
    setChat((prevChat) => [
      ...prevChat,
      { role: "assistant", content: response.data.gptResponse },
    ]);
  };

  const handleSendMessage = () => {
    if (!input.trim()) return;
    const newMessage = { role: "user", content: input };
    setChat((prevChat) => [...prevChat, newMessage]);
    getGptResponse([...chat, newMessage]);
    setInput("");
  };

  return (
    <div  className={`mt-10 rounded-lg ${
      darkMode ? " text-white" : "bg-white"
    }`}>
      <h1 className="text-4xl font-bold text-center bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-lg shadow-lg mb-6">
        Chatbot</h1>
        <div
              className={`w-full overflow-auto rounded-lg pb-2 mt-2 p-4 ${
                darkMode ? "bg-gray-700" : "bg-gray-200"
              }`}
            >
      <div className="flex flex-col">
        {chat.map((c, index) => (
          <div key={index} className={`flex py-3 ${c.role === "user" ? "justify-end" : "justify-start"}`}>
            <p className={`m-2 p-3 rounded-lg ${c.role === "user" ? "bg-blue-600 text-white" : "bg-gray-500 text-white"}`}>
              {c.content}
            </p>
          </div>
        ))}
      </div>
      <div className="flex mt-4 mb-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSendMessage();
            }
          }}
          placeholder="Ask any questions"
          className="w-full placeholder:text-gray-600 p-3 rounded-l-md bg-white"
        />
        <button
          onClick={handleSendMessage}
          className="bg-blue-500 text-white font-semibold p-3 rounded-r-md hover:bg-blue-600 transition duration-200"
        >
          Send
        </button>
      </div>
    </div>
    </div>
  );
};

export default ChatbotPage;
