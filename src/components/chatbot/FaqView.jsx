// components/FaqView.jsx
import React from "react";

export default function FaqView({ faqList, onSelect }) {
  return (
    <div className="h-[450px] p-4 flex flex-col gap-3 overflow-y-auto">
      {faqList.map((q, i) => (
        <button
          key={i}
          onClick={() => onSelect(q)}
          className="flex items-center gap-2 w-full bg-gray-50 hover:bg-purple-50 text-gray-700 hover:text-purple-700 border border-gray-200 hover:border-purple-200 rounded-2xl p-4 text-sm transition-all duration-200"
        >
          <div className="w-8 h-8 flex items-center justify-center bg-purple-100 text-purple-600 rounded-full text-lg font-semibold">
            Q
          </div>
          <span className="flex-1">{q}</span>
        </button>
      ))}
    </div>
  );
}
