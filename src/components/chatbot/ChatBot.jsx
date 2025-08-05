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
  const [showGuide, setShowGuide] = useState(false);

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

  // 가이드 메시지 내용을 상수로 정의
  const guideMessage = {
    sender: "bot",
    text: `📚 챗봇 이용 가이드

🔍 답변 가능한 주제
• 영양 및 식단 관련 질문
• 칼로리 계산 및 권장량
• 운동 방법 및 추천
• 건강한 생활 습관
• 식품 영양 정보

💡 이렇게 질문해보세요
• "오늘 점심으로 뭘 먹으면 좋을까요?"
• "운동 없이 살 빼는 방법 알려주세요"
• "단백질이 많은 음식 추천해주세요"
• "회사에서 할 수 있는 간단한 운동이 있나요?"
• "저녁 식사 후 야식이 먹고 싶을 때는 어떻게 하나요?"

ℹ️ 챗봇은 일반적인 건강/영양 정보를 제공합니다.
구체적인 의학적 조언이 필요한 경우 전문가와 상담해주세요.`,
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
            <div className="flex items-center gap-2">
              {/* 도움말 버튼 추가 */}
              <button
                onClick={() => {
                  setMessages((prev) => [...prev, guideMessage]);
                  // 가이드 메시지가 보이도록 스크롤
                  setTimeout(() => {
                    const chatContainer =
                      document.querySelector(".chat-container");
                    if (chatContainer) {
                      chatContainer.scrollTop = chatContainer.scrollHeight;
                    }
                  }, 100);
                }}
                className="text-white opacity-80 hover:opacity-100 transition-opacity"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
              {/* 기존 닫기 버튼 */}
              <button
                onClick={() => {
                  setShow(false);
                  setFaqMode(false);
                  setMessages([
                    {
                      sender: "bot",
                      text: `안녕하세요!\n😊 하루칼로리입니다!\n궁금한 게 있으면 물어보세요!`,
                    },
                  ]);
                  setInput("");
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

      {/* 가이드 모달 추가 */}
      {showGuide && (
        <div className="fixed inset-0 flex items-center justify-center z-[10000]  bg-opacity-10">
          <div className="bg-white rounded-xl max-w-md w-full mx-4 shadow-lg">
            <div className="p-5">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold">챗봇 이용 가이드</h3>
                <button
                  onClick={() => setShowGuide(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-purple-700 mb-2">
                    답변 가능한 주제
                  </h4>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    <li>영양 및 식단 관련 질문</li>
                    <li>칼로리 계산 및 권장량</li>
                    <li>운동 방법 및 추천</li>
                    <li>건강한 생활 습관</li>
                    <li>식품 영양 정보</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-purple-700 mb-2">
                    이렇게 질문해보세요
                  </h4>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    <li>"오늘 점심으로 뭘 먹으면 좋을까요?"</li>
                    <li>"운동 없이 살 빼는 방법 알려주세요"</li>
                    <li>"단백질이 많은 음식 추천해주세요"</li>
                    <li>"회사에서 할 수 있는 간단한 운동이 있나요?"</li>
                    <li>"저녁 식사 후 야식이 먹고 싶을 때는 어떻게 하나요?"</li>
                  </ul>
                </div>
                <div className="text-xs text-gray-500 mt-4">
                  * 챗봇은 일반적인 건강 및 영양 정보를 제공합니다. 구체적인
                  의학적 조언이 필요한 경우 전문가와 상담해주세요.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
