import React, { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import axios from "axios";
import { format, isToday } from "date-fns";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL + "api";

const DatePickerModal = ({
  open,
  onClose,
  onConfirm,
  initialDate,
  memberId,
}) => {
  const [recordedDates, setRecordedDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState(initialDate || "");

  useEffect(() => {
    if (!open) return;
    axios
      .get(`${API_BASE_URL}/meals/recorded-dates/member/${memberId}`)
      .then((res) => {
        setRecordedDates(res.data);
      })
      .catch(() => setRecordedDates([]));

    // 🔥 초기 날짜 설정: initialDate가 있으면 사용, 없으면 현재 날짜 사용
    const today = format(new Date(), "yyyy-MM-dd");
    setSelectedDate(initialDate || today);
  }, [open, memberId, initialDate]);

  const tileClassName = ({ date, view }) => {
    if (view === "month") {
      const dateStr = format(date, "yyyy-MM-dd");
      if (recordedDates.includes(dateStr)) {
        if (isToday(date)) {
          return "recorded-today";
        }
        return "recorded-day";
      }
    }
    return null;
  };

  const tileContent = () => null;

  if (!open) return null;

  return (
    <>
      <style>{`
        .react-calendar__tile--now {
          background:rgb(221, 223, 252) !important;
          color:#6366f1 !important;
        }
        .recorded-day {
          background: #d8b4fe !important;
          color: #7c3aed !important;
          border-radius: 50% !important;
        }
        .recorded-today {
          background: #a78bfa !important;
          color: #fff !important;
          border-radius: 50% !important;
        }
        .react-calendar {
          border: 0 !important;
        }
      `}</style>
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8 shadow-2xl relative min-w-[340px]">
          <div className="bg-white rounded-2xl shadow-2xl flex flex-col">
            <h2 className="text-xl font-bold">날짜 선택</h2>
          </div>
          <Calendar
            onClickDay={(value) => setSelectedDate(format(value, "yyyy-MM-dd"))}
            value={selectedDate ? new Date(selectedDate) : new Date()}
            defaultValue={new Date()}
            tileContent={tileContent}
            tileClassName={tileClassName}
            className=" shadow-none w-full"
          />
          <div className="flex justify-end gap-2 mt-6">
            <button className="btn" onClick={onClose}>
              취소
            </button>
            <button
              className="btn bg-purple-500 text-white"
              onClick={() => {
                if (selectedDate) onConfirm(selectedDate);
                onClose();
              }}
            >
              확인
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default DatePickerModal;
