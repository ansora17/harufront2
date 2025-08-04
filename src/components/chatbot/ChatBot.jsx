import React, { useState } from "react";
import { ChatBubbleOvalLeftIcon } from "@heroicons/react/24/solid";
import ChatView from "./chatview";
import FaqView from "./Faqview";
import axios from "axios";

export default function ChatBot() {
  const faqList = [
    "살 빨리빼는 법 알려줘",
    "회사에서 할만한 운동 추천해줘",
    "설탕이랑 나트륨중 머가 더 나빠?",
  ];

  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: `안녕하세요!\n😊 하루칼로리입니다!\n궁금한 게 있으면 물어보세요!`,
    },
  ]);
  const [input, setInput] = useState("");
  const [show, setShow] = useState(false);
  const [faqMode, setFaqMode] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = { sender: "user", text: input };

    // 1. 사용자 메시지 먼저 추가
    setMessages((prev) => [...prev, userMsg]);
    const currentInput = input;
    setInput("");

    // 2. 로딩 메시지 추가
    const loadingMsg = { sender: "bot", text: "작성중..." };
    setMessages((prev) => [...prev, loadingMsg]);

    console.log("API 호출 시작"); // 디버그용
    // axios 요청이 백엔드에 제대로 전송되지 않는 문제를 해결하기 위해 headers를 별도로 지정합니다.

    try {
      // 3. API 호출
      console.log(
        "API 요청 URL:",
        `${import.meta.env.VITE_PYTHON_URL}/chatbot/ask`
      );
      console.log("전송할 데이터:", { question: currentInput });

      const res = await axios.post(
        `${import.meta.env.VITE_PYTHON_URL}/chatbot/ask`,
        {
          question: currentInput,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          timeout: 30000, // 30초 타임아웃
        }
      );

      console.log("API 응답:", res.data);

      // 로딩 메시지를 제외한 이전 메시지들만 유지하고 새 응답 추가
      setMessages((prev) =>
        prev
          .filter((msg) => msg.text !== "작성중...") // 로딩 메시지 제거
          .concat({
            sender: "bot",
            text:
              res.data.answer ||
              res.data.response ||
              "죄송합니다. 답변을 찾을 수 없습니다.",
          })
      );
    } catch (error) {
      console.error("API 호출 에러:", error);
      console.log("에러 타입:", error.code, error.message); // 디버그용

      // 로딩 메시지를 제외하고 에러 메시지 추가
      setMessages((prev) =>
        prev
          .filter((msg) => msg.text !== "작성중...") // 로딩 메시지 제거
          .concat({
            sender: "bot",
            text: "죄송합니다. 답변을 가져오는 중에 문제가 발생했습니다. 잠시 후 다시 시도해주세요.",
          })
      );
    }
  };

  const handleSelectFAQ = async (question) => {
    console.log("FAQ 선택됨:", question);
    const userMsg = { sender: "user", text: question };

    // 1. 사용자 질문 먼저 추가
    setMessages((prev) => [...prev, userMsg]);
    setFaqMode(false);

    // 2. 로딩 메시지 추가
    const loadingMsg = { sender: "bot", text: "작성중..." };
    setMessages((prev) => [...prev, loadingMsg]);

    try {
      console.log("FAQ API 호출 시작:", {
        url: `${import.meta.env.VITE_PYTHON_URL}/chatbot/ask`,
        question: question,
      });

      // 3. API 호출
      console.log(
        "FAQ API 요청 URL:",
        `${import.meta.env.VITE_PYTHON_URL}/chatbot/ask`
      );
      console.log("FAQ 전송할 데이터:", { question });

      const res = await axios.post(
        `${import.meta.env.VITE_PYTHON_URL}/chatbot/ask`,
        {
          question: question,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          timeout: 30000, // 30초 타임아웃
        }
      );

      console.log("FAQ API 응답:", res.data);

      // 4. 실제 응답 추가
      const botResponse = {
        sender: "bot",
        text:
          res.data.answer ||
          res.data.response ||
          "죄송합니다. 답변을 찾을 수 없습니다.",
      };

      // 로딩 메시지를 제외한 이전 메시지들만 유지
      setMessages(
        (prev) =>
          prev
            .filter((msg) => msg.text !== "작성중...") // 로딩 메시지 제거
            .concat(botResponse) // 새로운 응답 추가
      );
    } catch (error) {
      console.error("FAQ API 호출 에러:", error);
      console.error("에러 상세:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });

      setMessages((prev) => {
        // 로딩 메시지 제거하고 에러 메시지 추가
        const withoutLoading = prev.slice(0, -1);
        return [
          ...withoutLoading,
          {
            sender: "bot",
            text: "죄송합니다. 답변을 가져오는 중에 문제가 발생했습니다. 잠시 후 다시 시도해주세요.",
          },
        ];
      });
    }
  };

  return (
    <>
      {!show && (
        <button
          className="fixed bottom-20 right-4 sm:bottom-30 sm:right-9 btn btn-circle bg-neutral text-white shadow-lg z-[9999]"
          onClick={() => setShow(true)}
        >
          <ChatBubbleOvalLeftIcon className="h-6 w-6" />
        </button>
      )}

      {show && (
        <div className="fixed bottom-0 right-0 w-full sm:w-[390px] sm:bottom-4 sm:right-4 bg-white shadow-xl border sm:rounded-3xl overflow-hidden z-[9999]">
          {/* 헤더 */}
          <div className="flex justify-between items-center p-2 sm:p-3 sm:py-4 sm:px-5 bg-gray-800 border-b">
            <div className="flex items-center">
              <img
                src="/images/chaybot_icon.png"
                alt=""
                className="w-8 h-6 sm:w-10 sm:h-8"
              />
              <span className="font-bold text-xs sm:text-sm text-white ml-2">
                <span className="hidden sm:inline">하루칼로리 챗봇 입니다</span>
                <span className="sm:hidden">하루칼로리 챗봇</span>
              </span>
            </div>
            <div>
              <button
                onClick={() => {
                  setShow(false); // 챗봇 창 닫기
                  setFaqMode(false); // FAQ 모드 해제
                  setMessages([
                    {
                      sender: "bot",
                      text: `안녕하세요!\n😊 하루칼로리입니다!\n궁금한 게 있으면 물어보세요!`,
                    },
                  ]); // ✅ 대화 초기화
                  setInput(""); // (선택) 입력창도 초기화
                }}
                className="text-xl font-bold text-white"
              >
                ✕
              </button>
            </div>
          </div>

          {/* 화면 전환 */}
          {faqMode ? (
            <FaqView faqList={faqList} onSelect={handleSelectFAQ} />
          ) : (
            <ChatView messages={messages} />
          )}

          {/* 입력창 */}
          <div className="flex p-2 sm:p-3 gap-2 items-center">
            <button
              onClick={() => setFaqMode(!faqMode)}
              className="text-2xl sm:text-3xl font-bold py-1 sm:py-3 relative group"
            >
              <img
                src="/images/faq.png"
                alt=""
                className="w-10 h-10 sm:w-13 sm:h-12 transition-transform duration-200 group-hover:scale-105"
              />
              <span className="absolute -top-1 -right-1 text-[10px] bg-gray-100 text-gray-500 px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                {faqMode ? "채팅으로" : "FAQ"}
              </span>
            </button>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="input input-bordered w-full h-[32px] sm:h-[38px] input-sm text-sm"
              placeholder="질문을 입력하세요"
            />
            <button
              className="btn btn-xs sm:btn-sm bg-purple-500 text-white h-[32px] sm:h-[38px] px-2"
              onClick={handleSend}
            >
              검색
            </button>
          </div>
        </div>
      )}
    </>
  );
}
