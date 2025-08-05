import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  fetchMonthlyMeals,
  fetchMealsByDateRange,
  fetchMonthlyMealsAlternative,
  fetchMealsByMemberId,
} from "../api/mealApi";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL + "/api";

// 🔥 날짜 범위로 식사 기록 가져오기 thunk 액션
export const fetchMealRecordsByDateRangeThunk = createAsyncThunk(
  "meal/fetchMealRecordsByDateRange",
  async ({ memberId, startDate, endDate }, { rejectWithValue }) => {
    try {
      console.log("🔍 mealSlice - API 호출 시작:", {
        memberId,
        startDate,
        endDate,
      });

      // 🔥 전체 데이터를 가져와서 날짜 범위로 필터링
      let filteredData;
      try {
        console.log("🔍 1단계: fetchMealsByMemberId 호출 (전체 데이터)");
        const allData = await fetchMealsByMemberId(memberId);
        console.log("✅ fetchMealsByMemberId 응답:", allData);

        if (allData && Array.isArray(allData)) {
          // 시작일과 종료일 사이의 데이터만 필터링
          const start = new Date(startDate);
          const end = new Date(endDate);
          start.setHours(0, 0, 0, 0);
          end.setHours(23, 59, 59, 999);

          filteredData = allData.filter((meal) => {
            const mealDate = new Date(
              meal.modifiedAt || meal.createDate || meal.createdDate
            );
            return mealDate >= start && mealDate <= end;
          });
          console.log("✅ 필터링된 데이터:", filteredData);
        } else {
          filteredData = [];
        }
      } catch (error) {
        console.log("❌ fetchMealsByMemberId 실패:", error);
        filteredData = [];
      }

      // 🔥 데이터 가공 (기존 로직 유지)
      const processedData = Array.isArray(filteredData) ? filteredData : [];

      const transformedData = processedData.map((record) => {
        // mealType → type 변환
        const convertMealType = (mealType) => {
          const typeMap = {
            BREAKFAST: "아침",
            LUNCH: "점심",
            DINNER: "저녁",
            SNACK: "간식",
          };
          return typeMap[mealType] || mealType;
        };

        // 영양소 계산
        let recordCalories = 0;
        let recordCarbs = 0;
        let recordProtein = 0;
        let recordFat = 0;

        if (record.foods && Array.isArray(record.foods)) {
          record.foods.forEach((food) => {
            recordCalories += food.calories || 0;
            recordCarbs += food.carbohydrate || 0;
            recordProtein += food.protein || 0;
            recordFat += food.fat || 0;
          });
        }

        const finalCalories =
          record.totalKcal || record.calories || recordCalories;
        const finalCarbs = record.totalCarbs || recordCarbs;
        const finalProtein = record.totalProtein || recordProtein;
        const finalFat = record.totalFat || recordFat;

        const dateField =
          record.modifiedAt ||
          record.createDate ||
          record.createdDate ||
          record.date;

        return {
          ...record,
          type: convertMealType(record.mealType),
          createDate: dateField,
          modifiedAt: record.modifiedAt,
          totalKcal: finalCalories,
          calories: finalCalories,
          totalCarbs: finalCarbs,
          carbs: finalCarbs,
          totalProtein: finalProtein,
          totalFat: finalFat,
          // 🔥 체중 데이터 포함
          record_weight: record.record_weight || record.recordWeight,
          recordWeight: record.record_weight || record.recordWeight,
        };
      });

      console.log("✅ mealSlice - 최종 변환된 데이터:", transformedData);

      return {
        data: transformedData,
        startDate,
        endDate,
      };
    } catch (error) {
      console.error("❌ mealSlice - 전체 에러:", error);
      return rejectWithValue("월별 식사 기록을 불러오는데 실패했습니다.");
    }
  }
);

// fetchDailyMealRecordsThunk 수정 (완전한 변환 로직 추가)
export const fetchDailyMealRecordsThunk = createAsyncThunk(
  "meal/fetchDailyMealRecords",
  async ({ memberId, date }, { rejectWithValue }) => {
    try {
      console.log("🔍 일별 데이터 API 호출:", { memberId, date });

      const response = await axios.get(
        `${API_BASE_URL}/meals/modified-date/member/${memberId}?date=${date}`
      );

      console.log("✅ 일별 데이터 API 응답:", response.data);

      // 데이터 가공 (Meal.jsx와 동일한 로직)
      const processedData = Array.isArray(response.data)
        ? response.data
        : response.data.data || [];

      const transformedData = processedData.map((record) => {
        // mealType → type 변환
        const convertMealType = (mealType) => {
          const typeMap = {
            BREAKFAST: "아침",
            LUNCH: "점심",
            DINNER: "저녁",
            SNACK: "간식",
          };
          return typeMap[mealType] || mealType;
        };

        // 영양소 계산
        let recordCalories = 0;
        let recordCarbs = 0;
        let recordProtein = 0;
        let recordFat = 0;

        if (record.foods && Array.isArray(record.foods)) {
          record.foods.forEach((food) => {
            recordCalories += food.calories || 0;
            recordCarbs += food.carbohydrate || 0;
            recordProtein += food.protein || 0;
            recordFat += food.fat || 0;
          });
        }

        // DB에서 직접 가져온 총합 값 우선 사용
        const finalCalories =
          record.totalKcal || record.calories || recordCalories;
        const finalCarbs = record.totalCarbs || recordCarbs;
        const finalProtein = record.totalProtein || recordProtein;
        const finalFat = record.totalFat || recordFat;

        // 날짜 필드 설정
        const dateField =
          record.modifiedAt ||
          record.createDate ||
          record.createdDate ||
          record.date;

        return {
          ...record,
          type: convertMealType(record.mealType),
          createDate: dateField,
          modifiedAt: record.modifiedAt,
          totalKcal: finalCalories,
          calories: finalCalories,
          totalCarbs: finalCarbs,
          carbs: finalCarbs,
          totalProtein: finalProtein,
          totalFat: finalFat,
          // 🔥 체중 데이터 포함
          record_weight: record.record_weight || record.recordWeight,
          recordWeight: record.record_weight || record.recordWeight,
        };
      });

      // 전체 영양소 계산
      const totalCalories = transformedData.reduce(
        (sum, record) => sum + (record.totalKcal || 0),
        0
      );
      const totalCarbsSum = transformedData.reduce(
        (sum, record) => sum + (record.totalCarbs || 0),
        0
      );
      const totalProteinSum = transformedData.reduce(
        (sum, record) => sum + (record.totalProtein || 0),
        0
      );
      const totalFatSum = transformedData.reduce(
        (sum, record) => sum + (record.totalFat || 0),
        0
      );

      console.log("✅ 변환된 일별 데이터:", transformedData);

      return {
        mealRecords: transformedData,
        nutritionTotals: {
          totalKcal: totalCalories,
          totalCarbs: totalCarbsSum,
          totalProtein: totalProteinSum,
          totalFat: totalFatSum,
        },
      };
    } catch (error) {
      console.error("❌ 일별 데이터 로드 실패:", error);
      return rejectWithValue("일별 식사 기록을 불러오는데 실패했습니다.");
    }
  }
);

// 식사 기록 저장 thunk
export const saveMealRecordThunk = createAsyncThunk(
  "meal/saveMealRecord",
  async ({ memberId, mealData }, { rejectWithValue }) => {
    try {
      console.log("🔍 saveMealRecordThunk - 전송할 데이터:", mealData);
      console.log("🔍 saveMealRecordThunk - foods 배열:", mealData.foods);
      
      const response = await axios.post(
        `${API_BASE_URL}/meals?memberId=${memberId}`,
        mealData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "식사 기록 저장에 실패했습니다."
      );
    }
  }
);

// localStorage에서 선택된 식사 타입 가져오기
const getStoredSelectedMeal = () => {
  try {
    const stored = localStorage.getItem("selectedMeal");
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error("localStorage에서 selectedMeal 읽기 실패:", error);
    return null;
  }
};

const initialState = {
  selectedMeal: getStoredSelectedMeal(),
  selectedDate: new Date().toISOString().slice(0, 10),
  mealRecords: [], // 특정 날짜 데이터 (Meal 페이지용)
  monthlyMealRecords: [], // 🔥 월별 전체 데이터 (Record 페이지용)
  currentMonth: new Date().getMonth(),
  currentYear: new Date().getFullYear(),
  totalKcal: 0,
  totalCarbs: 0,
  totalProtein: 0,
  totalFat: 0,
  isLoading: false,
  isMonthlyLoading: false, // 🔥 월별 데이터 로딩 상태
  error: null,
  monthlyError: null, // 🔥 월별 데이터 에러 상태
};

const mealSlice = createSlice({
  name: "meal",
  initialState,
  reducers: {
    setSelectedMeal: (state, action) => {
      state.selectedMeal = action.payload;
      // localStorage에 선택된 식사 타입 저장
      try {
        localStorage.setItem("selectedMeal", JSON.stringify(action.payload));
      } catch (error) {
        console.error("localStorage에 selectedMeal 저장 실패:", error);
      }
    },
    setSelectedDate: (state, action) => {
      state.selectedDate = action.payload;
    },
    setMealRecords: (state, action) => {
      state.mealRecords = action.payload;
    },
    // 🔥 월별 데이터 관리 리듀서들
    setMonthlyMealRecords: (state, action) => {
      state.monthlyMealRecords = action.payload;
    },
    setCurrentMonth: (state, action) => {
      state.currentMonth = action.payload.month;
      state.currentYear = action.payload.year;
    },
    setMonthlyLoading: (state, action) => {
      state.isMonthlyLoading = action.payload;
    },
    setMonthlyError: (state, action) => {
      state.monthlyError = action.payload;
    },
    clearMonthlyError: (state) => {
      state.monthlyError = null;
    },
    setNutritionTotals: (state, action) => {
      const { totalKcal, totalCarbs, totalProtein, totalFat } = action.payload;
      state.totalKcal = totalKcal;
      state.totalCarbs = totalCarbs;
      state.totalProtein = totalProtein;
      state.totalFat = totalFat;
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // 🔥 fetchMonthlyMealRecordsThunk 처리
      .addCase(fetchMealRecordsByDateRangeThunk.pending, (state) => {
        state.isMonthlyLoading = true;
        state.monthlyError = null;
        console.log("🔄 mealSlice - 데이터 로딩 시작");
      })
      .addCase(fetchMealRecordsByDateRangeThunk.fulfilled, (state, action) => {
        state.isMonthlyLoading = false;
        state.monthlyMealRecords = action.payload.data;
        // 날짜 범위의 첫 번째 날짜로 currentMonth와 currentYear 설정
        const firstDate = new Date(action.payload.startDate);
        state.currentMonth = firstDate.getMonth();
        state.currentYear = firstDate.getFullYear();
        state.monthlyError = null;
        console.log("✅ mealSlice - 데이터 로딩 완료:", action.payload.data);
      })
      .addCase(fetchMealRecordsByDateRangeThunk.rejected, (state, action) => {
        state.isMonthlyLoading = false;
        state.monthlyError = action.payload;
        console.error("❌ mealSlice - 데이터 로딩 실패:", action.payload);
      })
      // 🔥 일별 데이터 thunk 처리 추가
      .addCase(fetchDailyMealRecordsThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        console.log("🔄 일별 데이터 로딩 시작");
      })
      .addCase(fetchDailyMealRecordsThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.mealRecords = action.payload?.mealRecords || [];
        state.totalKcal = action.payload?.nutritionTotals?.totalKcal || 0;
        state.totalCarbs = action.payload?.nutritionTotals?.totalCarbs || 0;
        state.totalProtein = action.payload?.nutritionTotals?.totalProtein || 0;
        state.totalFat = action.payload?.nutritionTotals?.totalFat || 0;
        state.error = null;
        console.log("✅ 일별 데이터 로딩 완료:", action.payload);
      })
      .addCase(fetchDailyMealRecordsThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        console.error("❌ 일별 데이터 로딩 실패:", action.payload);
      });
  },
});

export const {
  setSelectedMeal,
  setSelectedDate,
  setMealRecords,
  setMonthlyMealRecords,
  setCurrentMonth,
  setMonthlyLoading,
  setMonthlyError,
  clearMonthlyError,
  setNutritionTotals,
  setLoading,
  setError,
  clearError,
} = mealSlice.actions;

export default mealSlice.reducer;
