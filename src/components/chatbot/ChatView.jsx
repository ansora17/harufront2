import React from "react";
import { useSelector } from "react-redux";

export default function ChatView({ messages }) {
  const { nickname } = useSelector((state) => state.login);
  return (
    <div className="flex-1 overflow-y-auto p-2 sm:p-3 h-[350px] sm:h-[450px] space-y-3 sm:space-y-4">
      {messages.map((msg, idx) => {
        const isBot = msg.sender === "bot";
        const now = new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });

        return (
          <div
            key={idx}
            className={`chat ${isBot ? "chat-start" : "chat-end"}`}
          >
            {/* 이름과 시간 */}
            <div className="chat-header text-sm flex items-center gap-2 ">
              <span className="mb-2">
                {isBot ? "😊 하루칼로리" : nickname || "사용자"}
              </span>
              <time className="text-xs opacity-50 mb-2">{now}</time>
            </div>

            {/* 말풍선 */}
            <div
              className={`chat-bubble whitespace-pre-wrap text-xs rounded-2xl max-w-[75%] sm:max-w-[85%] ${
                isBot ? "bg-gray-100" : "bg-purple-500 text-white"
              }`}
            >
              {msg.text}
            </div>
          </div>
        );
      })}
    </div>
  );
}
