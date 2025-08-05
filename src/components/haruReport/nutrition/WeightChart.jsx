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
  const [selectedPeriod, setSelectedPeriod] = useState("week"); // 'week' 또는 'month'

  // 🔥 Redux에서 사용자 정보와 meal 데이터 가져오기
  const loginState = useSelector((state) => state.login);
  const monthlyMealRecords = useSelector(
    (state) => state.meal.monthlyMealRecords
  );
  // 목표 체중 계산: (키(cm) - 100) x 0.9
  const calculateTargetWeight = (height) => {
    if (!height) return 65; // 기본값
    return Math.round((height - 100) * 0.9 * 10) / 10; // 소수점 첫째자리까지
  };

  console.log("사용자 키:", loginState.height);
  const targetWeight = calculateTargetWeight(loginState.height);
  console.log("계산된 목표 체중:", targetWeight);

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

    // 🔥 체중 데이터를 날짜별로 그룹화
    const weightDataByDate = new Map();

    // 현재 날짜 설정
    const realToday = new Date();
    const today = new Date(
      realToday.getFullYear(),
      realToday.getMonth(),
      realToday.getDate(),
      0,
      0,
      0,
      0
    );

    // 7월 15일 날짜 설정
    const startDate = new Date(2023, 6, 15, 0, 0, 0, 0); // 월은 0부터 시작하므로 6이 7월

    if (process.env.NODE_ENV === "development") {
      console.log("오늘 날짜:", today.toISOString());
      console.log("시작 날짜:", startDate.toISOString());
    }

    // meal 데이터에서 체중 정보 추출하여 날짜별로 그룹화 (과거 20일 데이터)
    monthlyMealRecords.forEach((record) => {
      if (
        record.record_weight ||
        record.recordWeight ||
        record.weight ||
        record.userWeight ||
        record.memberWeight
      ) {
        const recordDate = new Date(record.modifiedAt || record.createDate);
        const normalizedRecordDate = new Date(
          recordDate.getFullYear(),
          recordDate.getMonth(),
          recordDate.getDate(),
          0,
          0,
          0,
          0
        );

        // 현재 날짜보다 미래이거나 20일 이전의 데이터는 제외
        if (normalizedRecordDate > today || normalizedRecordDate < startDate) {
          if (process.env.NODE_ENV === "development") {
            console.log("제외된 데이터:", normalizedRecordDate.toISOString());
          }
          return;
        }

        const dateKey = normalizedRecordDate.toISOString().split("T")[0];
        const displayDate = `${
          normalizedRecordDate.getMonth() + 1
        }/${normalizedRecordDate.getDate()}`;

        const weight =
          record.record_weight ||
          record.recordWeight ||
          record.weight ||
          record.userWeight ||
          record.memberWeight;

        if (!weightDataByDate.has(dateKey)) {
          weightDataByDate.set(dateKey, {
            dateKey,
            date: displayDate,
            weights: [],
            actualDate: recordDate,
          });
        }
        weightDataByDate.get(dateKey).weights.push(weight);
      }
    });

    if (process.env.NODE_ENV === "development") {
      console.log("수집된 전체 체중 데이터:", weightDataByDate);
    }

    // 데이터가 있는 날짜들만 추출하고 정렬
    // 현재 날짜 이전의 데이터만 필터링하고 날짜순으로 정렬
    const availableDates = Array.from(weightDataByDate.entries())
      .map(([dateKey, data]) => ({
        dateKey,
        date: new Date(data.actualDate),
        displayDate: data.date,
        weights: data.weights,
      }))
      .filter(({ date }) => date <= today)
      .sort((a, b) => b.date - a.date); // 최신 날짜순 정렬

    if (process.env.NODE_ENV === "development") {
      console.log("사용 가능한 데이터:", availableDates);
    }

    // 선택된 기간에 따라 데이터 개수 결정 (7일 또는 30일)
    const dataLimit = selectedPeriod === "week" ? 7 : 30;

    // 필터링된 데이터 중에서 최근 N개 선택
    const result = availableDates
      .slice(0, dataLimit) // 선택된 기간만큼 선택
      .reverse() // 과거순으로 정렬
      .map(({ displayDate, weights }) => {
        // 하루에 여러 체중 기록이 있으면 평균값 사용
        const avgWeight =
          weights.reduce((sum, w) => sum + w, 0) / weights.length;
        return {
          date: displayDate,
          weight: Math.round(avgWeight * 10) / 10,
        };
      });

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
          <div className="flex justify-end mb-4 space-x-2">
            <button
              onClick={() => setSelectedPeriod("week")}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                selectedPeriod === "week"
                  ? "bg-purple-700 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              7일
            </button>
            <button
              onClick={() => setSelectedPeriod("month")}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                selectedPeriod === "month"
                  ? "bg-purple-700 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              30일
            </button>
          </div>
        </div>
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
                label={{
                  value: `목표 ${targetWeight}kg`,
                  position: "right",
                  fontSize: 12,
                }}
                stroke="#ff7300"
                strokeDasharray="5 5"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="weight"
                stroke="#8884d8"
                strokeWidth={3}
                dot={(props) => {
                  const isEstimated = props.payload.isEstimated;
                  return (
                    <circle
                      cx={props.cx}
                      cy={props.cy}
                      r={4}
                      fill={isEstimated ? "#ffffff" : "#8884d8"}
                      stroke="#8884d8"
                      strokeWidth={2}
                      style={isEstimated ? { strokeDasharray: "2 2" } : {}}
                    />
                  );
                }}
                activeDot={(props) => {
                  const isEstimated = props.payload.isEstimated;
                  return (
                    <circle
                      cx={props.cx}
                      cy={props.cy}
                      r={6}
                      fill={isEstimated ? "#ffffff" : "#8884d8"}
                      stroke="#8884d8"
                      strokeWidth={2}
                      style={isEstimated ? { strokeDasharray: "2 2" } : {}}
                    />
                  );
                }}
                name="체중"
                connectNulls={true}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="w-full h-[280px] flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200">
          <div className="text-center p-8">
            <div className="mb-4"></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WeightChart;
