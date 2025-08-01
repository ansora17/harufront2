import React, { useRef, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";

const DailyCalorieChart = ({ data = [], period = "week" }) => {
  const containerRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [showTooltip, setShowTooltip] = useState(window.innerWidth > 768);

  // 🔥 Redux에서 사용자의 권장 칼로리 가져오기
  const loginState = useSelector((state) => state.login);
  const targetCalories =
    loginState.targetCalories || loginState.recommendedCalories || 2200; // 기본값 2200

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
      setShowTooltip(window.innerWidth > 768);
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  // 실제 데이터가 없으면 기본 데이터 사용
  const chartData =
    data.length > 0
      ? data.map((item) => ({
          date: item.formattedDate || item.date,
          calories: item.calories,
        }))
      : [{ date: "데이터 없음", calories: 0 }];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const calories = payload[0].value;
      const isOverTarget = calories > targetCalories;
      return (
        <div className="bg-white p-2 border rounded shadow">
          <p className="font-semibold">{label}</p>
          <p>{calories}kcal</p>
          <p
            className={`text-sm ${
              isOverTarget ? "text-red-500" : "text-blue-500"
            }`}
          >
            {isOverTarget ? "권장 초과" : "권장 미달"}
          </p>
        </div>
      );
    }
    return null;
  };

  const getStatusStyle = (calories) => {
    const isOverTarget = calories > targetCalories;
    return {
      color: isOverTarget ? "text-red-500" : "text-blue-500",
      text: isOverTarget ? "권장 초과" : "권장 미달",
      bgColor: isOverTarget ? "bg-red-50" : "bg-blue-50",
    };
  };

  return (
    <div ref={containerRef} className="w-full">
      <div className="mb-2 p-2 flex justify-end">
        <div className="flex items-center">
          <span className="text-gray-600 ">권장 칼로리:</span>
          <span className="ml-2 font-bold">{targetCalories}kcal</span>
        </div>
      </div>

      <div className="w-full h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis
              domain={[
                0,
                Math.max(
                  2500,
                  Math.max(...chartData.map((d) => d.calories)) + 500
                ),
              ]}
            />
            {showTooltip && <Tooltip content={<CustomTooltip />} />}
            <Legend
              formatter={(value) => (
                <span style={{ color: "black" }}>{value}</span>
              )}
            />
            <ReferenceLine
              y={targetCalories}
              label=""
              stroke="#ff7300"
              strokeDasharray="6 6"
            />
            <Bar
              dataKey="calories"
              fill="#46D2AF"
              name="섭취 칼로리"
              radius={[5, 5, 0, 0]}
              barSize={30}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 일별 칼로리 섭취 리스트 */}
      {data.length > 0 && (
        <div className="mt-3 px-2 sm:px-4">
          <h3 className="text-base sm:text-lg font-semibold mb-3">
            일별 칼로리 섭취 현황
          </h3>
          <div className="grid gap-2 max-h-90 overflow-y-auto">
            {data.map((item, index) => {
              const status = getStatusStyle(item.calories);
              return (
                <div
                  key={index}
                  className={`p-2 sm:p-2 w-full sm:w-[370px] rounded-lg ${status.bgColor} flex justify-between items-center`}
                >
                  <div className="flex items-center gap-2 sm:gap-4">
                    <span className="font-medium text-sm sm:text-sm">
                      {item.formattedDate || item.date}
                    </span>
                    <span className="text-sm sm:text-sm">
                      {item.calories}kcal
                    </span>
                  </div>
                  <span
                    className={`px-2 py-1 rounded text-xs sm:text-sm ${status.color}`}
                  >
                    {status.text}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default DailyCalorieChart;
