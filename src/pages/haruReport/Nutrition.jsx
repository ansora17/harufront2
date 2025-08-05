import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  setMonthlyMealRecords,
  setCurrentMonth,
  setMonthlyLoading,
  setMonthlyError,
  clearMonthlyError,
  fetchMealRecordsByDateRangeThunk,
} from "../../slices/mealSlice";
import {
  fetchMonthlyMeals,
  fetchMealsByDateRange,
  fetchMonthlyMealsAlternative,
} from "../../api/mealApi";
import WeightChart from "../../components/haruReport/nutrition/WeightChart";
import CalorieDonutChart from "../../components/haruReport/nutrition/CalorieDonutChart";
import DailyCalorieChart from "../../components/haruReport/nutrition/DailyCalorieChart";
import NutritionBalanceChart from "../../components/haruReport/nutrition/NutritionBalanceChart";
import SubLayout from "../../layout/SubLayout";
import ChatBot from "../../components/chatbot/ChatBot";

const Nutrition = () => {
  const dispatch = useDispatch();

  // AI 모달 상태
  const [showAIModal, setShowAIModal] = useState(false);
  const [aiAdvice, setAiAdvice] = useState("");
  const [isLoadingAdvice, setIsLoadingAdvice] = useState(false);

  // AI 조언 생성 함수
  const generateAIAdvice = async () => {
    setIsLoadingAdvice(true);
    try {
      // 현재 영양소 데이터 가져오기
      const nutritionData = getSelectedDetailDateNutritionData();
      const dailyCalories = getSelectedDetailDateTotalCalories();
      const targetWeight =
        Math.round((loginState.height - 100) * 0.9 * 10) / 10;
      const currentWeight = loginState.weight || 0;

      // AI 프롬프트 생성
      const prompt = `
        사용자 정보:
        - 이름: ${nickname}
        - 현재 체중: ${currentWeight}kg
        - 목표 체중: ${targetWeight}kg
        - 오늘의 영양 섭취:
          * 총 칼로리: ${dailyCalories}kcal
          * 탄수화물: ${nutritionData.carbs}g
          * 단백질: ${nutritionData.protein}g
          * 지방: ${nutritionData.fat}g

        위 정보를 바탕으로 사용자의 영양 섭취 상태를 분석하고, 
        목표 체중 달성을 위한 구체적인 조언을 해주세요. 
        답변은 친근하고 격려하는 톤으로 작성해주세요.
      `;

      // TODO: OpenAI API 호출 로직 구현
      // 임시로 하드코딩된 응답 사용
      const response = `
        ${nickname}님, 안녕하세요! 오늘의 영양 섭취를 분석해보았어요.

        1. 칼로리 섭취: ${dailyCalories}kcal
           - 목표 체중 ${targetWeight}kg 달성을 위해서는 적절한 수준이에요.

        2. 영양소 밸런스:
           - 탄수화물: ${nutritionData.carbs}g
           - 단백질: ${nutritionData.protein}g
           - 지방: ${nutritionData.fat}g

        💡 조언:
        - 단백질 섭취를 조금 더 늘려보세요. 하루 체중 1kg당 1.2~1.6g이 적절해요.
        - 식사 시간을 규칙적으로 유지하면 더 좋은 결과를 얻을 수 있어요.
        - 수분 섭취도 잊지 마세요!

        이대로만 꾸준히 하신다면 목표 체중에 도달하실 수 있을 거예요. 
        화이팅! 👊
      `;

      setAiAdvice(response);
    } catch (error) {
      console.error("AI 조언 생성 중 에러:", error);
      setAiAdvice("죄송합니다. 조언을 생성하는 중에 문제가 발생했습니다.");
    } finally {
      setIsLoadingAdvice(false);
    }
  };

  // 기간 선택 상태
  const [period, setPeriod] = useState("week"); // 'week' | 'month'
  // 🔥 실제 데이터 확인을 위해 현재 날짜 사용
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today;
  }); // 월 변경용

  const [selectedDetailDate, setSelectedDetailDate] = useState(() => {
    // 🔥 현재 날짜 사용
    const today = new Date();
    return today;
  }); // 오늘의 칼로리용 날짜 선택

  // Redux에서 월별 데이터 가져오기 (기록습관과 동일)
  const monthlyMealRecords = useSelector(
    (state) => state.meal.monthlyMealRecords
  );
  const { isMonthlyLoading, monthlyError, currentMonth, currentYear } =
    useSelector((state) => state.meal);

  // 🔥 로그인된 사용자 정보 가져오기 - 기본값 제거
  const loginState = useSelector((state) => state.login);
  const { isLoggedIn, memberId } = loginState;

  // 월 변경 함수
  const changeMonth = (direction) => {
    const newDate = new Date(selectedDate);
    if (direction === "prev") {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setSelectedDate(newDate);
    console.log(
      "🔍 Nutrition - 월 변경:",
      newDate.getFullYear(),
      newDate.getMonth() + 1
    );
  };

  // 현재 월을 포맷팅하는 함수
  const formatCurrentMonth = () => {
    return selectedDate.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
    });
  };

  // 🔥 월별 데이터 로드 로직 (Record.jsx와 동일)
  useEffect(() => {
    if (!isLoggedIn || !memberId) {
      console.warn("로그인이 필요하거나 memberId가 없습니다.", {
        isLoggedIn,
        memberId,
      });
      return;
    }

    console.log("✅ Nutrition - 로그인 확인됨:", { isLoggedIn, memberId });

    const targetMonth = selectedDate.getMonth();
    const targetYear = selectedDate.getFullYear();

    console.log("✅ Nutrition - 로그인 확인됨, thunk 액션 dispatch:", {
      isLoggedIn,
      memberId,
      targetYear,
      targetMonth: targetMonth + 1,
    });

    // 이미 해당 월 데이터가 있고, Redux 월과 일치하면 스킵
    if (
      currentMonth === targetMonth &&
      currentYear === targetYear &&
      monthlyMealRecords.length > 0
    ) {
      return;
    }

    // 🔥 mealSlice thunk 액션 dispatch - 3개월 데이터 가져오기
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 3);

    dispatch(
      fetchMealRecordsByDateRangeThunk({
        memberId,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      })
    );
  }, [
    selectedDate,
    dispatch,
    memberId,
    isLoggedIn,
    currentMonth,
    currentYear,
    monthlyMealRecords.length,
  ]);

  // 기간별 데이터 필터링 함수 - 단순화
  const getFilteredData = () => {
    if (!monthlyMealRecords.length) return [];

    // 🔥 간단한 방법: 현재 월의 모든 데이터를 반환
    const currentMonth = selectedDate.getMonth();
    const currentYear = selectedDate.getFullYear();

    const filtered = monthlyMealRecords.filter((record, index) => {
      const recordDate = new Date(record.modifiedAt || record.createDate);
      const recordMonth = recordDate.getMonth();
      const recordYear = recordDate.getFullYear();

      const isCurrentMonth =
        recordMonth === currentMonth && recordYear === currentYear;

      return isCurrentMonth;
    });

    return filtered;
  };

  // 오늘의 데이터 가져오기 - 실제 오늘 날짜 기준 유지
  const getTodayData = () => {
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];

    const todayMeals = monthlyMealRecords.filter((record) => {
      const recordDate = new Date(record.modifiedAt || record.createDate);
      const recordDateStr = recordDate.toISOString().split("T")[0];
      return recordDateStr === todayStr;
    });

    return todayMeals;
  };

  // 🔍 원본 데이터 구조 확인을 위한 디버깅 함수 추가
  const debugOriginalData = () => {
    if (monthlyMealRecords.length > 0) {
      // foods 배열도 확인
      if (
        monthlyMealRecords[0].foods &&
        monthlyMealRecords[0].foods.length > 0
      ) {
      }

      // 몇 개 더 확인
      monthlyMealRecords.slice(0, 3).forEach((record, index) => {});
    }
  };

  // 일별 칼로리 데이터 계산 - 대폭 단순화
  const getDailyCalorieData = () => {
    const filteredData = getFilteredData();

    if (filteredData.length === 0) {
      // 빈 데이터라도 현재 월의 날짜들을 보여주기
      const currentMonth = selectedDate.getMonth();
      const currentYear = selectedDate.getFullYear();
      const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

      const emptyData = [];
      for (let day = 1; day <= Math.min(daysInMonth, 7); day++) {
        const date = new Date(currentYear, currentMonth, day);
        emptyData.push({
          date: date.toISOString().split("T")[0],
          calories: 0,
          formattedDate: date.toLocaleDateString("ko-KR", {
            month: "short",
            day: "numeric",
          }),
        });
      }
      return emptyData;
    }

    const dailyData = {};

    // 🔥 간단한 방법: 실제 데이터가 있는 날짜들만 처리
    filteredData.forEach((record, index) => {
      const recordDate = new Date(record.modifiedAt || record.createDate);
      const dateStr = recordDate.toISOString().split("T")[0];

      if (!dailyData[dateStr]) {
        dailyData[dateStr] = 0;
      }

      // 🔥 확실한 칼로리 값 사용
      const calories = record.totalKcal || record.calories || 0;
      dailyData[dateStr] += calories;
    });

    // 데이터가 있는 날짜들을 결과로 반환
    const result = Object.entries(dailyData)
      .map(([date, calories]) => ({
        date,
        calories,
        formattedDate: new Date(date).toLocaleDateString("ko-KR", {
          month: "short",
          day: "numeric",
        }),
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    return result;
  };

  // 🔥 더 간단한 테스트: 실제 데이터로 즉시 확인
  const getSimpleTestData = () => {
    if (monthlyMealRecords.length === 0) {
      return [];
    }

    // 처음 몇 개 데이터를 직접 변환
    const testResult = monthlyMealRecords.slice(0, 7).map((record, index) => {
      const recordDate = new Date(record.modifiedAt || record.createDate);
      const calories = record.totalKcal || record.calories || 0;

      return {
        date: recordDate.toISOString().split("T")[0],
        calories: calories,
        formattedDate: recordDate.toLocaleDateString("ko-KR", {
          month: "short",
          day: "numeric",
        }),
      };
    });

    return testResult;
  };

  // 영양소 밸런스 데이터 계산 - 정확한 필드명으로 수정
  const getNutritionBalanceData = () => {
    const filteredData = getFilteredData();

    const totals = filteredData.reduce(
      (acc, record) => {
        // 🔍 개별 record에서 영양소 값 계산
        let recordCarbs = 0;
        let recordProtein = 0;
        let recordFat = 0;

        // 1. record 레벨에서 영양소 값 확인 - 🔥 정확한 필드명 사용
        const directCarbs = record.totalCarbs || 0; // Record 레벨은 totalCarbs
        const directProtein = record.totalProtein || 0;
        const directFat = record.totalFat || 0;

        // 2. foods 배열에서 영양소 계산 - 🔥 정확한 필드명 사용
        let foodsCarbs = 0;
        let foodsProtein = 0;
        let foodsFat = 0;

        if (record.foods && Array.isArray(record.foods)) {
          record.foods.forEach((food) => {
            foodsCarbs += food.carbohydrate || 0; // Food 레벨은 carbohydrate
            foodsProtein += food.protein || 0;
            foodsFat += food.fat || 0;
          });
        }

        // 3. 우선순위: 직접 값이 있으면 사용, 없으면 foods에서 계산한 값 사용
        recordCarbs = directCarbs > 0 ? directCarbs : foodsCarbs;
        recordProtein = directProtein > 0 ? directProtein : foodsProtein;
        recordFat = directFat > 0 ? directFat : foodsFat;

        acc.carbs += recordCarbs;
        acc.protein += recordProtein;
        acc.fat += recordFat;

        return acc;
      },
      { carbs: 0, protein: 0, fat: 0 }
    );

    return totals;
  };

  // 🔍 영양소 원본 데이터 확인 함수 - 정확한 필드명으로 수정
  const debugNutritionData = () => {
    if (monthlyMealRecords.length === 0) {
      return;
    }

    // 첫 번째 record 상세 분석
    const firstRecord = monthlyMealRecords[0];

    // foods 배열 분석
    if (firstRecord.foods && firstRecord.foods.length > 0) {
      firstRecord.foods.forEach((food, index) => {});
    }

    // 모든 record의 영양소 요약 - 정확한 필드명 사용

    monthlyMealRecords.forEach((record, index) => {
      const totalCarbs = record.totalCarbs || 0; // 🔥 Record 레벨
      const totalProtein = record.totalProtein || 0;
      const totalFat = record.totalFat || 0;

      let foodsCarbs = 0;
      let foodsProtein = 0;
      let foodsFat = 0;

      if (record.foods) {
        record.foods.forEach((food) => {
          foodsCarbs += food.carbohydrate || 0; // 🔥 Food 레벨
          foodsProtein += food.protein || 0;
          foodsFat += food.fat || 0;
        });
      }
    });
  };

  // 🔍 더 상세한 원본 데이터 분석 함수
  const detailedDebugNutritionData = () => {
    if (monthlyMealRecords.length === 0) {
      return;
    }

    // 첫 3개 record 완전 분해 분석
    monthlyMealRecords.slice(0, 3).forEach((record, recordIndex) => {
      // Record 레벨의 모든 영양소 관련 필드 찾기
      const nutritionFields = {};
      Object.keys(record).forEach((key) => {
        const lowerKey = key.toLowerCase();
        if (
          lowerKey.includes("carb") ||
          lowerKey.includes("protein") ||
          lowerKey.includes("fat") ||
          lowerKey.includes("calori") ||
          lowerKey.includes("kcal")
        ) {
          nutritionFields[key] = record[key];
        }
      });

      // Foods 배열 상세 분석
      if (record.foods && Array.isArray(record.foods)) {
        record.foods.forEach((food, foodIndex) => {
          // Food 레벨의 모든 영양소 관련 필드 찾기
          const foodNutritionFields = {};
          Object.keys(food).forEach((key) => {
            const lowerKey = key.toLowerCase();
            if (
              lowerKey.includes("carb") ||
              lowerKey.includes("protein") ||
              lowerKey.includes("fat") ||
              lowerKey.includes("calori") ||
              lowerKey.includes("kcal")
            ) {
              foodNutritionFields[key] = food[key];
            }
          });
        });
      } else {
      }
    });

    // 전체 데이터에서 가능한 모든 키 수집
    const allKeys = new Set();
    const allFoodKeys = new Set();

    monthlyMealRecords.forEach((record) => {
      Object.keys(record).forEach((key) => allKeys.add(key));

      if (record.foods && Array.isArray(record.foods)) {
        record.foods.forEach((food) => {
          Object.keys(food).forEach((key) => allFoodKeys.add(key));
        });
      }
    });

    // 탄수화물 관련 키들만 필터링
    const carbKeys = Array.from(allKeys).filter((key) =>
      key.toLowerCase().includes("carb")
    );
    const foodCarbKeys = Array.from(allFoodKeys).filter((key) =>
      key.toLowerCase().includes("carb")
    );
  };

  // 선택된 월의 통계 데이터 계산
  const getMonthlyStats = () => {
    const monthData = monthlyMealRecords.filter((record) => {
      const recordDate = new Date(record.modifiedAt || record.createDate);
      return (
        recordDate.getMonth() === selectedDate.getMonth() &&
        recordDate.getFullYear() === selectedDate.getFullYear()
      );
    });

    // 🔥 DB 필드명 추가
    const totalCalories = monthData.reduce((sum, record) => {
      const calories =
        record.totalKcal || record.calories || record.total_calories || 0;
      return sum + calories;
    }, 0);
    const daysInMonth = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth() + 1,
      0
    ).getDate();
    const avgCalories =
      monthData.length > 0 ? Math.round(totalCalories / daysInMonth) : 0;

    return {
      totalRecords: monthData.length,
      totalCalories,
      avgCalories,
    };
  };

  // 선택된 상세 날짜의 데이터 가져오기
  const getSelectedDetailDateData = () => {
    const selectedDateStr = selectedDetailDate.toISOString().split("T")[0];

    const selectedDateMeals = monthlyMealRecords.filter((record) => {
      const recordDate = new Date(record.modifiedAt || record.createDate);
      const recordDateStr = recordDate.toISOString().split("T")[0];
      const isSelectedDate = recordDateStr === selectedDateStr;

      if (isSelectedDate) {
      }

      return isSelectedDate;
    });

    return selectedDateMeals;
  };

  // 선택된 상세 날짜의 총 칼로리 계산
  const getSelectedDetailDateTotalCalories = () => {
    const selectedDateMeals = getSelectedDetailDateData();
    return selectedDateMeals.reduce((total, meal) => {
      const calories = meal.totalKcal || meal.calories || 0;
      return total + calories;
    }, 0);
  };

  // 선택된 상세 날짜 포맷팅
  const formatSelectedDetailDate = () => {
    return selectedDetailDate.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "short",
    });
  };

  // 상세 날짜 변경 함수
  const changeDetailDate = (direction) => {
    const newDate = new Date(selectedDetailDate);
    if (direction === "prev") {
      newDate.setDate(newDate.getDate() - 1);
    } else {
      newDate.setDate(newDate.getDate() + 1);
    }
    setSelectedDetailDate(newDate);
  };

  // 선택된 상세 날짜의 영양소 데이터 계산 (새로 추가)
  const getSelectedDetailDateNutritionData = () => {
    const selectedDateMeals = getSelectedDetailDateData();

    if (selectedDateMeals.length === 0) {
      return { carbs: 0, protein: 0, fat: 0 };
    }

    const totals = selectedDateMeals.reduce(
      (acc, record) => {
        // Record 레벨에서 영양소 값 확인
        const directCarbs = record.totalCarbs || 0;
        const directProtein = record.totalProtein || 0;
        const directFat = record.totalFat || 0;

        // foods 배열에서 영양소 계산
        let foodsCarbs = 0;
        let foodsProtein = 0;
        let foodsFat = 0;

        if (record.foods && Array.isArray(record.foods)) {
          record.foods.forEach((food) => {
            foodsCarbs += food.carbohydrate || 0;
            foodsProtein += food.protein || 0;
            foodsFat += food.fat || 0;
          });
        }

        // 우선순위: 직접 값이 있으면 사용, 없으면 foods에서 계산한 값 사용
        const recordCarbs = directCarbs > 0 ? directCarbs : foodsCarbs;
        const recordProtein = directProtein > 0 ? directProtein : foodsProtein;
        const recordFat = directFat > 0 ? directFat : foodsFat;

        acc.carbs += recordCarbs;
        acc.protein += recordProtein;
        acc.fat += recordFat;

        return acc;
      },
      { carbs: 0, protein: 0, fat: 0 }
    );

    return totals;
  };

  const { nickname, weight, profileImageUrl } = useSelector(
    (state) => state.login
  );

  return (
    <div className="w-full max-w-[1020px] mx-auto px-4 sm:px-6">
      <SubLayout to="/haruReport" menu="리포트" label="영양습관" />
      <div className="mt-6 sm:mt-10 space-y-6">
        {/* 월 변경 및 기간 선택 UI */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
          {/* 월 변경 컨트롤 */}
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-4">
              <button
                onClick={() => changeMonth("prev")}
                className="btn  btn-sm hover:bg-purple-100"
                disabled={isMonthlyLoading}
              >
                ◀ 이전 월
              </button>

              <div className="text-xl font-bold text-gray-700 min-w-[140px] text-center">
                {formatCurrentMonth()}
              </div>

              <button
                onClick={() => changeMonth("next")}
                className="btn  btn-sm hover:bg-purple-100"
                disabled={isMonthlyLoading}
              >
                다음 월 ▶
              </button>
            </div>

            <div className="flex items-center justify-center">
              <div className="bg-purple-50 rounded-xl px-6 py-2 shadow-sm">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-medium text-purple-700">
                    {nickname} 님의 목표 체중은
                  </span>
                  <span className="text-xl font-bold text-purple-700">
                    {Math.round((loginState.height - 100) * 0.9 * 10) / 10}
                    <span className="text-lg ml-1">kg</span>
                  </span>
                  <span className="text-lg font-medium text-purple-700">
                    입니다
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 로딩 상태 */}
        {isMonthlyLoading && (
          <div className="text-center py-8">
            <span className="loading loading-spinner loading-lg text-purple-500"></span>
            <p className="text-purple-500 mt-2">영양 데이터를 불러오는 중...</p>
          </div>
        )}

        {/* 에러 상태 */}
        {monthlyError && (
          <div className="alert alert-error">
            <span>에러: {monthlyError}</span>
            <button
              onClick={() => window.location.reload()}
              className="btn btn-sm"
            >
              새로고침
            </button>
          </div>
        )}

        {/* 차트 그리드 */}
        {!isMonthlyLoading && !monthlyError && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* 1. 체중 변화 차트 */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold">체중 변화 추이</h2>
              <WeightChart period={period} />
            </div>

            {/* 2. 일별 칼로리 상세보기 차트 */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">
                일별 칼로리 상세보기
              </h2>

              {/* 날짜 선택 UI */}
              <div className="mb-4">
                <div className="flex items-center justify-center gap-4 mb-2">
                  <button
                    onClick={() => changeDetailDate("prev")}
                    className="btn  btn-sm"
                    disabled={isMonthlyLoading}
                  >
                    ◀
                  </button>

                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-700">
                      {formatSelectedDetailDate()}
                    </div>
                  </div>

                  <button
                    onClick={() => changeDetailDate("next")}
                    className="btn  btn-sm"
                    disabled={isMonthlyLoading}
                  >
                    ▶
                  </button>
                </div>
              </div>

              <CalorieDonutChart data={getSelectedDetailDateData()} />
              {/* 해당 날짜 요약 정보 */}
              <div className="text-center text-sm text-gray-600 bg-blue-50 p-2 rounded ">
                총 섭취 칼로리:{" "}
                <span className="font-bold text-blue-600">
                  {getSelectedDetailDateTotalCalories()}kcal
                </span>
                {" | "}
                식사 횟수:{" "}
                <span className="font-bold text-blue-600">
                  {getSelectedDetailDateData().length}회
                </span>
              </div>

              {/* 데이터 없음 메시지 */}
              {getSelectedDetailDateData().length === 0 && (
                <div className="text-center py-4 text-gray-500">
                  선택된 날짜에 식사 기록이 없습니다.
                </div>
              )}
            </div>

            {/* 3. 일자별 칼로리 섭취 차트 */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold">일자별 칼로리 섭취량</h2>

              <DailyCalorieChart data={getDailyCalorieData()} period={period} />
            </div>

            {/* 4. 일별 영양소 밸런스 차트 */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">일별 영양소 밸런스</h2>

              {/* 날짜 선택 UI 추가 (일별 칼로리 차트와 동일) */}
              <div className="mb-4">
                <div className="flex items-center justify-center gap-4 mb-2">
                  <button
                    onClick={() => changeDetailDate("prev")}
                    className="btn btn-sm"
                    disabled={isMonthlyLoading}
                  >
                    ◀
                  </button>

                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-700">
                      {formatSelectedDetailDate()}
                    </div>
                  </div>

                  <button
                    onClick={() => changeDetailDate("next")}
                    className="btn  btn-sm"
                    disabled={isMonthlyLoading}
                  >
                    ▶
                  </button>
                </div>
              </div>

              <NutritionBalanceChart
                period="day"
                data={getSelectedDetailDateNutritionData()}
              />

              {/* 데이터 없음 메시지 */}
              {getSelectedDetailDateData().length === 0 && (
                <div className="text-center py-4 text-gray-500">
                  선택된 날짜에 식사 기록이 없습니다.
                </div>
              )}
            </div>
          </div>
        )}

        {/* 데이터 없음 상태 */}
        {monthlyMealRecords.length === 0 &&
          !isMonthlyLoading &&
          !monthlyError && (
            <div className="text-center py-8">
              <p className="text-gray-500">
                선택한 월에 등록된 식사 기록이 없습니다.
              </p>
              <p className="text-yellow-600 mb-2">
                📍 식사 기록을 먼저 등록해주세요
              </p>
            </div>
          )}

        {/* 챗봇 */}
        <ChatBot />
      </div>
    </div>
  );
};

export default Nutrition;
