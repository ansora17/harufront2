import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import * as tf from "@tensorflow/tfjs";

const NutritionBalanceChart = ({ period, data = {} }) => {
  const [showAIModal, setShowAIModal] = useState(false);
  const [isLoadingAdvice, setIsLoadingAdvice] = useState(false);
  const [model, setModel] = useState(null);
  const [aiAdvice, setAiAdvice] = useState(null);

  // 🔥 Redux에서 사용자의 권장 칼로리 가져오기
  const loginState = useSelector((state) => state.login);
  const recommendedCalories =
    loginState.targetCalories || loginState.recommendedCalories || 2200;

  // 🔥 권장 칼로리를 바탕으로 영양소 권장량 계산
  const dailyRecommended = {
    carbs: Math.round((recommendedCalories * 0.45) / 4), // 45% of calories from carbs (4kcal/g)
    protein: Math.round((recommendedCalories * 0.25) / 4), // 25% of calories from protein (4kcal/g)
    fat: Math.round((recommendedCalories * 0.3) / 9), // 30% of calories from fat (9kcal/g)
  };

  // 실제 데이터 처리
  const processedData = (() => {
    if (!data || Object.keys(data).length === 0) {
      return [
        {
          nutrient: "탄수화물",
          amount: 0,
          unit: "g",
          percentage: 0,
          displayText: "0g (0%)",
        },
        {
          nutrient: "단백질",
          amount: 0,
          unit: "g",
          percentage: 0,
          displayText: "0g (0%)",
        },
        {
          nutrient: "지방",
          amount: 0,
          unit: "g",
          percentage: 0,
          displayText: "0g (0%)",
        },
      ];
    }

    const carbs = data.carbs || 0;
    const protein = data.protein || 0;
    const fat = data.fat || 0;

    // 퍼센트 계산 (일일 권장량 기준)
    const carbsPercentage = Math.round((carbs / dailyRecommended.carbs) * 100);
    const proteinPercentage = Math.round(
      (protein / dailyRecommended.protein) * 100
    );
    const fatPercentage = Math.round((fat / dailyRecommended.fat) * 100);

    // 표시용 퍼센트 (200% 초과시 "200%+"로 표시)
    const getDisplayPercentage = (percentage) => {
      return percentage > 200 ? "200%+" : `${percentage}%`;
    };

    // 차트용 퍼센트 (최대 200%로 제한)
    const getChartPercentage = (percentage) => {
      return Math.min(percentage, 200);
    };

    const result = [
      {
        nutrient: "탄수화물",
        amount: carbs.toFixed(1),
        unit: "g",
        percentage: getChartPercentage(carbsPercentage),
        displayText: `${carbs.toFixed(1)}g (${getDisplayPercentage(
          carbsPercentage
        )})`,
      },
      {
        nutrient: "단백질",
        amount: protein.toFixed(1),
        unit: "g",
        percentage: getChartPercentage(proteinPercentage),
        displayText: `${protein.toFixed(1)}g (${getDisplayPercentage(
          proteinPercentage
        )})`,
      },
      {
        nutrient: "지방",
        amount: fat.toFixed(1),
        unit: "g",
        percentage: getChartPercentage(fatPercentage),
        displayText: `${fat.toFixed(1)}g (${getDisplayPercentage(
          fatPercentage
        )})`,
      },
    ];

    return result;
  })();

  const radarData = processedData.map((item) => ({
    subject: item.nutrient,
    value: item.percentage,
    fullMark: 100,
  }));

  // 모델 로드
  useEffect(() => {
    async function loadModel() {
      try {
        // 간단한 sequential 모델 생성
        const model = tf.sequential({
          layers: [
            tf.layers.dense({ inputShape: [3], units: 64, activation: "relu" }),
            tf.layers.dense({ units: 32, activation: "relu" }),
            tf.layers.dense({ units: 16, activation: "relu" }),
            tf.layers.dense({ units: 4, activation: "softmax" }),
          ],
        });

        // 모델 컴파일
        model.compile({
          optimizer: tf.train.adam(0.001),
          loss: "categoricalCrossentropy",
          metrics: ["accuracy"],
        });

        setModel(model);
      } catch (error) {
        console.error("모델 로드 중 오류 발생:", error);
      }
    }

    loadModel();
  }, []);

  // AI 조언 생성 함수
  const generateMLAdvice = async () => {
    if (!model) return "모델이 아직 준비되지 않았습니다.";

    try {
      // 입력 데이터 준비
      const inputData = tf.tensor2d([
        [
          processedData[0].percentage / 100, // 정규화
          processedData[1].percentage / 100,
          processedData[2].percentage / 100,
        ],
      ]);

      // 예측 수행
      const prediction = await model.predict(inputData).array();
      const result = prediction[0];

      // 예측 결과 해석
      let advice = [];

      // 영양소 균형 상태 분석
      const balance =
        Math.abs(processedData[0].percentage - processedData[1].percentage) +
        Math.abs(processedData[1].percentage - processedData[2].percentage) +
        Math.abs(processedData[2].percentage - processedData[0].percentage);

      if (balance > 100) {
        advice.push(
          " 영양소 균형이 다소 불균형합니다. 더 균형잡힌 식사를 권장드립니다."
        );
      }

      // 각 영양소별 분석
      const nutrients = [
        { name: "탄수화물", value: processedData[0].percentage, ideal: 100 },
        { name: "단백질", value: processedData[1].percentage, ideal: 100 },
        { name: "지방", value: processedData[2].percentage, ideal: 100 },
      ];

      nutrients.forEach((nutrient) => {
        const deviation = nutrient.value - nutrient.ideal;
        if (Math.abs(deviation) > 20) {
          advice.push(` ${nutrient.name}이(가) ${
            deviation > 0 ? "높습니다" : "부족합니다"
          }.
            ${
              deviation > 0
                ? "섭취를 줄이는 것이 좋습니다."
                : "섭취를 늘리는 것이 좋습니다."
            }`);
        }
      });

      // 식사 패턴 분석
      if (result[0] > 0.5) {
        advice.push(" 현재 식사 패턴이 양호합니다. 이대로 유지해주세요!");
      } else {
        advice.push(
          " 식사 패턴 개선이 필요합니다. 정해진 시간에 규칙적으로 식사하시는 것을 추천드립니다."
        );
      }

      // 운동 관련 조언
      if (processedData[1].percentage < 80) {
        advice.push(
          " 단백질 섭취가 부족한데, 운동을 하신다면 단백질 보충이 더욱 중요합니다."
        );
      }

      return advice;
    } catch (error) {
      console.error("AI 조언 생성 중 오류 발생:", error);
      return ["죄송합니다. AI 조언 생성 중 오류가 발생했습니다."];
    }
  };

  // AI 조언 버튼 클릭 핸들러
  const handleAIAdviceClick = async () => {
    setIsLoadingAdvice(true);
    setShowAIModal(true);
    const advice = await generateMLAdvice();
    setAiAdvice(advice);
    setIsLoadingAdvice(false);
  };

  // 모달 내용 수정
  const renderModalContent = () => {
    if (isLoadingAdvice) {
      return (
        <div className="flex flex-col items-center justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
          <p className="mt-2 text-gray-600">AI가 영양 분석 중입니다...</p>
        </div>
      );
    }

    return (
      <div className="prose max-w-none">
        <div className="space-y-2">
          <div className="flex justify-between items-center px-3 ">
            <h4 className="font-bold text-lg">💡 AI 영양 분석 맞춤 조언</h4>
            <button
              onClick={() => setShowAIModal(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          <ul className="list-disc pl-6 space-y-2  ">
            {aiAdvice &&
              aiAdvice.map((advice, index) => (
                <li key={index} className="text-gray-700">
                  {advice}
                </li>
              ))}
          </ul>
        </div>
      </div>
    );
  };

  // AI 조언 버튼 수정
  return (
    <div className="w-full">
      {/* 상단 제목 부분을 flex로 수정 */}
      <div className="flex justify-end items-center mb-4">
        {/* AI 조언 버튼 */}
        <button
          onClick={handleAIAdviceClick}
          className="flex items-center gap-2 px-3 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg transition-colors text-sm"
        >
          AI 영양 분석받기
        </button>
      </div>

      {/* 레이더 차트 */}
      <div className="h-[230px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
            <PolarGrid />
            <PolarAngleAxis dataKey="subject" />
            <Radar
              name="영양소 균형"
              dataKey="value"
              stroke="#8884d8"
              fill="#8884d8"
              fillOpacity={0.6}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* 영양소 막대 그래프 */}
      <div className="h-[300px] mb-3">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={processedData}
            margin={{ top: 10, right: 50, left: 20, bottom: 8 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              horizontal={true}
              vertical={false}
            />
            <XAxis dataKey="nutrient" axisLine={false} tickLine={false} />
            <YAxis
              axisLine={false}
              tickLine={false}
              domain={[0, 100]}
              ticks={[0, 25, 50, 75, 100]}
            />
            <Bar dataKey="percentage" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 영양소 수치 표 */}
      <div className="w-full">
        <table className="w-full text-center">
          <thead className="bg-gray-100">
            <tr>
              {processedData.map((item, index) => (
                <th
                  key={index}
                  className="py-2 px-2 text-gray-600 font-normal text-sm"
                >
                  {item.nutrient}({item.unit})
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              {processedData.map((item, index) => (
                <td key={index} className="py-2 px-4 text-gray-800">
                  <div className="font-semibold">{item.amount}</div>
                  {/* <div className="text-xs text-gray-500">
                    {item.displayText.split(" ")[1]}
                  </div> */}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {/* AI 조언 모달 */}
      {showAIModal && (
        <div className="fixed inset-0 flex items-center justify-center z-[9999]">
          <div
            className="fixed inset-0  bg-opacity-30"
            onClick={() => setShowAIModal(false)}
          ></div>
          <div className="relative bg-white rounded-xl max-w-lg w-full m-4 shadow-lg transform transition-all duration-300 ease-in-out animate-fadeIn">
            <div className="p-3">
              <div className="prose max-w-none">
                <div className="space-y-2">
                  <div className="flex justify-between items-center px-3">
                    <h4 className="font-bold text-lg">
                      💡 AI 영양 분석 맞춤 조언
                    </h4>
                    <button
                      onClick={() => setShowAIModal(false)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      ✕
                    </button>
                  </div>
                  <ul className="list-disc pl-6 space-y-2">
                    {aiAdvice &&
                      aiAdvice.map((advice, index) => (
                        <li key={index} className="text-gray-700">
                          {advice}
                        </li>
                      ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NutritionBalanceChart;
