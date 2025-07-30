import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  fetchMonthlyMeals,
  fetchMealsByDateRange,
  fetchMonthlyMealsAlternative,
  fetchMealsByMemberId,
} from "../api/mealApi";
import axios from "axios";

// 🔥 월별 식사 기록 가져오기 thunk 액션
export const fetchMonthlyMealRecordsThunk = createAsyncThunk(
  "meal/fetchMonthlyMealRecords",
  async ({ memberId, year, month }, { rejectWithValue }) => {
    try {
      console.log("🔍 mealSlice - API 호출 시작:", {
        memberId,
        year,
        month: month + 1,
      });

      // 🔥 먼저 전체 데이터를 가져와서 필터링하는 방식 사용
      let monthlyData;
      try {
        console.log("🔍 1단계: fetchMealsByMemberId 호출 (전체 데이터)");
        const allData = await fetchMealsByMemberId(memberId);
        console.log("✅ fetchMealsByMemberId 응답:", allData);

        if (allData && Array.isArray(allData)) {
          // 해당 월 데이터만 필터링
          monthlyData = allData.filter((meal) => {
            const mealDate = new Date(
              meal.modifiedAt || meal.createDate || meal.createdDate
            );
            return (
              mealDate.getFullYear() === year && mealDate.getMonth() === month
            );
          });
          console.log("✅ 필터링된 월별 데이터:", monthlyData);
        } else {
          monthlyData = [];
        }
      } catch (error) {
        console.log("❌ fetchMealsByMemberId 실패:", error);
        monthlyData = [];
      }

      // 🔥 데이터 가공 (기존 로직 유지)
      const processedData = Array.isArray(monthlyData) ? monthlyData : [];

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
        };
      });

      console.log("✅ mealSlice - 최종 변환된 데이터:", transformedData);

      return {
        data: transformedData,
        month,
        year,
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
        `/api/meals/modified-date/member/${memberId}?date=${date}`
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
      const response = await axios.post(
        `/api/meals?memberId=${memberId}`,
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

const initialState = {
  selectedMeal: null,
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
      .addCase(fetchMonthlyMealRecordsThunk.pending, (state) => {
        state.isMonthlyLoading = true;
        state.monthlyError = null;
        console.log("🔄 mealSlice - 월별 데이터 로딩 시작");
      })
      .addCase(fetchMonthlyMealRecordsThunk.fulfilled, (state, action) => {
        state.isMonthlyLoading = false;
        state.monthlyMealRecords = action.payload.data;
        state.currentMonth = action.payload.month;
        state.currentYear = action.payload.year;
        state.monthlyError = null;
        console.log(
          "✅ mealSlice - 월별 데이터 로딩 완료:",
          action.payload.data
        );
      })
      .addCase(fetchMonthlyMealRecordsThunk.rejected, (state, action) => {
        state.isMonthlyLoading = false;
        state.monthlyError = action.payload;
        console.error("❌ mealSlice - 월별 데이터 로딩 실패:", action.payload);
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
