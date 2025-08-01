import React from "react";
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

const NutritionBalanceChart = ({ period, data = {} }) => {
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

  return (
    <div className="w-full">
      {/* 레이더 차트 */}
      <div className="h-[250px]">
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
      <div className="h-[300px] mb-6">
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
    </div>
  );
};

export default NutritionBalanceChart;
