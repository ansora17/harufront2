import React, { useRef, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";

const WeightChart = ({ period }) => {
  const containerRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(0);

  // 🔥 Redux에서 사용자 정보와 meal 데이터 가져오기
  const loginState = useSelector((state) => state.login);
  const monthlyMealRecords = useSelector(
    (state) => state.meal.monthlyMealRecords
  );
  const targetWeight = loginState.weight || 65; // 기본값 65kg

  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };

    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  // 🔥 최근 7일간의 체중 데이터 처리
  const getWeightData = () => {
    if (!monthlyMealRecords || monthlyMealRecords.length === 0) {
      if (process.env.NODE_ENV === "development") {
        console.log("🔍 WeightChart: monthlyMealRecords가 비어있음");
      }
      return [];
    }

    if (process.env.NODE_ENV === "development") {
      console.log(
        "🔍 WeightChart: 전체 monthlyMealRecords 수:",
        monthlyMealRecords.length
      );
      console.log(
        "🔍 WeightChart: 첫 번째 레코드 전체 구조:",
        monthlyMealRecords[0]
      );

      // 모든 필드명 확인
      if (monthlyMealRecords[0]) {
        console.log(
          "🔍 WeightChart: 첫 번째 레코드의 모든 필드:",
          Object.keys(monthlyMealRecords[0])
        );
      }
    }

    // 🔍 디버깅: 체중 데이터가 있는 레코드 확인 (개발 환경에서만)
    const weightRecords = monthlyMealRecords.filter(
      (record) =>
        record.record_weight ||
        record.recordWeight ||
        record.weight ||
        record.userWeight ||
        record.memberWeight
    );

    if (process.env.NODE_ENV === "development") {
      console.log(
        "🔍 WeightChart: 체중 데이터가 있는 레코드 수:",
        weightRecords.length
      );

      // 체중 데이터가 없다면 다른 가능한 필드명들 확인
      if (weightRecords.length === 0) {
        console.log(
          "🔍 WeightChart: 체중 데이터 없음. 다른 가능한 필드명 확인 중..."
        );
        monthlyMealRecords.slice(0, 3).forEach((record, index) => {
          const possibleWeightFields = Object.keys(record).filter(
            (key) =>
              key.toLowerCase().includes("weight") ||
              key.toLowerCase().includes("kg") ||
              key.toLowerCase().includes("체중")
          );
          console.log(
            `🔍 WeightChart: 레코드 ${index}의 체중 관련 필드들:`,
            possibleWeightFields
          );

          possibleWeightFields.forEach((field) => {
            console.log(`🔍 WeightChart: ${field}: ${record[field]}`);
          });
        });
      } else {
        console.log(
          "🔍 WeightChart: 첫 번째 체중 레코드 샘플:",
          weightRecords[0]
        );
      }
    }

    // 🔥 더 간단한 방법: 모든 체중 데이터를 날짜별로 그룹화 후 최근 7개만 표시
    const weightDataByDate = new Map();

    // meal 데이터에서 체중 정보 추출하여 날짜별로 그룹화
    monthlyMealRecords.forEach((record) => {
      if (
        record.record_weight ||
        record.recordWeight ||
        record.weight ||
        record.userWeight ||
        record.memberWeight
      ) {
        const recordDate = new Date(record.modifiedAt || record.createDate);
        const dateStr = recordDate.toISOString().split("T")[0];
        const displayDate = `${
          recordDate.getMonth() + 1
        }/${recordDate.getDate()}`;

        if (!weightDataByDate.has(dateStr)) {
          weightDataByDate.set(dateStr, {
            date: displayDate,
            weights: [],
            actualDate: recordDate,
          });
        }

        const weight =
          record.record_weight ||
          record.recordWeight ||
          record.weight ||
          record.userWeight ||
          record.memberWeight;
        weightDataByDate.get(dateStr).weights.push(weight);
      }
    });

    // 날짜별 데이터를 배열로 변환하고 날짜순 정렬
    const result = Array.from(weightDataByDate.values())
      .sort((a, b) => a.actualDate - b.actualDate)
      .map(({ date, weights }) => {
        // 하루에 여러 체중 기록이 있으면 평균값 사용
        const averageWeight =
          weights.reduce((sum, w) => sum + w, 0) / weights.length;
        return {
          date,
          weight: Math.round(averageWeight * 10) / 10, // 소수점 1자리로 반올림
        };
      })
      .slice(-7); // 최근 7개만 표시

    if (process.env.NODE_ENV === "development") {
      console.log("🔍 WeightChart: 최종 처리된 체중 데이터:", result);
    }
    return result;
  };

  const data = getWeightData();

  // 🔥 체중 변화 추세 분석
  const getWeightTrend = () => {
    if (data.length < 2) return null;

    const firstWeight = data[0].weight;
    const lastWeight = data[data.length - 1].weight;
    const change = lastWeight - firstWeight;
    const changePercent = ((change / firstWeight) * 100).toFixed(1);

    return {
      change: Math.round(change * 10) / 10,
      changePercent: parseFloat(changePercent),
      trend: change > 0 ? "증가" : change < 0 ? "감소" : "유지",
      color:
        change > 0
          ? "text-red-500"
          : change < 0
          ? "text-blue-500"
          : "text-gray-500",
    };
  };

  // 가장 최recent 체중 데이터 처리
  const currentWeight = data.length > 0 ? data[data.length - 1].weight : null;
  const weightTrend = getWeightTrend();

  return (
    <div ref={containerRef}>
      {/* 🔥 개선된 체중 정보 헤더 */}
      <div className="mb-4 space-y-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div>
              <span className="text-gray-600">현재 체중:</span>
              <span className="ml-2 font-bold text-lg text-gray-800">
                {currentWeight ? `${currentWeight}kg` : "기록 없음"}
              </span>
            </div>
            {weightTrend && (
              <div className="flex items-center space-x-2">
                <span className={`font-semibold ${weightTrend.color}`}>
                  {weightTrend.change > 0 ? "+" : ""}
                  {weightTrend.change}kg
                </span>
                <span className="text-sm text-gray-500">
                  ({weightTrend.trend})
                </span>
              </div>
            )}
          </div>
        </div>

        {weightTrend && (
          <div className="text-xs text-gray-400">
            최근 7일간 {Math.abs(weightTrend.changePercent)}%{" "}
            {weightTrend.trend}
          </div>
        )}
      </div>

      {data.length > 0 ? (
        <div className="w-full h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" stroke="#666" fontSize={12} />
              <YAxis
                domain={["dataMin - 1", "dataMax + 1"]}
                stroke="#666"
                fontSize={12}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #ccc",
                  borderRadius: "8px",
                  fontSize: "14px",
                }}
                formatter={(value) => [`${value}kg`, "체중"]}
                labelFormatter={(label) => `날짜: ${label}`}
              />
              <ReferenceLine
                y={targetWeight}
                label={{ value: "목표", position: "topRight", fontSize: 12 }}
                stroke="#ff7300"
                strokeDasharray="5 5"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="weight"
                stroke="#8884d8"
                strokeWidth={3}
                dot={{ fill: "#8884d8", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: "#8884d8", strokeWidth: 2 }}
                name="체중"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="w-full h-[280px] flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200">
          <div className="text-center p-8">
            <div className="mb-4"></div>
            <p className="text-gray-600 font-medium mb-2">
              최근 7일간 체중 기록이 없습니다
            </p>
            <p className="text-sm text-gray-500">
              식사 기록 시 체중을 함께 입력하면 <br />
              체중 변화 추이를 확인할 수 있어요
            </p>
          </div>
        </div>
      )}

      {/* 🔥 체중 기록 팁 */}
      {data.length > 0 && data.length < 3 && (
        <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-700">
            💡 더 정확한 체중 변화 추이를 보려면 매일 체중을 기록해보세요!
          </p>
        </div>
      )}
    </div>
  );
};

export default WeightChart;
