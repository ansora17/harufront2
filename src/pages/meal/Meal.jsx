// src/pages/meal/Meal.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  setSelectedDate,
  fetchDailyMealRecordsThunk, // 🔥 추가 필요
} from "../../slices/mealSlice";
import MealPickerModal from "../../components/meal/MealPickerModal";
import MealCard from "../../components/haruReport/record/MealCard";
import SubLayout from "../../layout/SubLayout";
import { useNavigate } from "react-router-dom";
import MealCalendarModal from "../../components/meal/MealCalendarModal";
import calculateCalories from "../../components/mypage/calculateCalories";

function Meal() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // 로그인 정보
  const currentUser = useSelector((state) => state.login);
  const { isLoggedIn, memberId } = currentUser;

  // Redux에서 상태 가져오기
  const {
    selectedDate,
    mealRecords,
    totalKcal,
    totalCarbs,
    totalProtein,
    totalFat,
    isLoading,
    error,
  } = useSelector((state) => state.meal);

  const [isMealPickerOpen, setIsMealPickerOpen] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState("");
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  // 목표 칼로리
  console.log("Current user data:", currentUser);
  const calorieGoal =
    currentUser?.birthAt &&
    currentUser?.gender &&
    currentUser?.height &&
    currentUser?.weight &&
    currentUser?.activityLevel
      ? calculateCalories({
          birthAt: currentUser.birthAt,
          gender: currentUser.gender,
          height: currentUser.height,
          weight: currentUser.weight,
          activityLevel: currentUser.activityLevel,
        })
      : 2000;
  console.log("Calculated calorie goal:", calorieGoal);

  // 날짜 변경 함수
  const changeDate = (days) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    const newDateString = newDate.toISOString().slice(0, 10);
    dispatch(setSelectedDate(newDateString));
  };

  // 카드 클릭 핸들러
  const handleCardClick = (record) => {
    const id = record.mealId || record.id;
    navigate(`/dashboard/result/${id}`, { state: record });
  };

  // 🔥 식사 기록 불러오기 - 단순화
  useEffect(() => {
    if (!isLoggedIn || !memberId) {
      console.warn("로그인이 필요하거나 memberId가 없습니다.");
      return;
    }

    // thunk 액션 dispatch (데이터 가공은 thunk에서 처리)
    dispatch(
      fetchDailyMealRecordsThunk({
        memberId,
        date: selectedDate,
      })
    );
  }, [selectedDate, dispatch, memberId, isLoggedIn]);

  const handleMealTypeClick = (mealType) => {
    setSelectedMealType(mealType);
    setIsMealPickerOpen(true);
  };

  return (
    <>
      <div className="p-4 mb-28 sm:p-6 container mx-auto space-y-8 sm:w-[1020px]">
        {/* 날짜 선택 */}
        <div className="flex gap-4 items-center justify-center">
          <div
            className="text-center text-lg sm:text-2xl font-bold cursor-pointer"
            onClick={() => changeDate(-1)}
          >
            〈
          </div>
          <div
            className="text-center text-lg sm:text-2xl font-bold cursor-pointer"
            onClick={() => setIsCalendarOpen(true)}
          >
            {new Date(selectedDate)
              .toLocaleDateString("ko-KR", {
                year: "2-digit",
                month: "2-digit",
                day: "2-digit",
                weekday: "short",
              })
              .replace(/\./g, ".")
              .replace(/\s/g, " ")}
          </div>
          <div
            className={`text-center text-lg sm:text-2xl font-bold cursor-pointer ${
              new Date(selectedDate).toDateString() ===
              new Date().toDateString()
                ? "text-gray-400 cursor-not-allowed"
                : ""
            }`}
            onClick={() => {
              // 오늘 날짜면 아무 동작도 하지 않음
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              const current = new Date(selectedDate);
              current.setHours(0, 0, 0, 0);
              if (current >= today) return; // 오늘이거나 미래면 이동 불가
              changeDate(1);
            }}
          >
            〉
          </div>
        </div>
        {/* 로딩 상태 - 스켈레톤 UI */}
        {isLoading && (
          <>
            {/* 영양소 요약 스켈레톤 */}
            <div className="card bg-base-100 shadow-lg p-4 px-0 sm:px-40">
              <div className="text-md mb-4">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-32"></div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4 mb-2 animate-pulse"></div>
              <div className="flex gap-10 justify-between">
                {[1, 2, 3].map((i) => (
                  <div key={i}>
                    <div className="text-md mb-4 pr-10 sm:pr-24">
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
                    </div>
                    <div className="bg-gray-200 rounded-full h-4 mb-2 animate-pulse"></div>
                  </div>
                ))}
              </div>
            </div>

            {/* 식사 기록 스켈레톤 */}
            <div className="h-6 bg-gray-200 rounded animate-pulse w-24 mb-4"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="card justify-between bg-base-100 w-full rounded-xl shadow-lg p-[20px]"
                >
                  <figure className="mt-4">
                    <div className="rounded-xl h-[180px] w-full bg-gray-200 animate-pulse"></div>
                  </figure>
                  <div className="card-body p-0">
                    <div className="card-title flex mt-2">
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
                    </div>
                    <div className="text-[16px] font-semibold flex gap-4">
                      {[1, 2, 3].map((j) => (
                        <div
                          key={j}
                          className="h-4 bg-gray-200 rounded animate-pulse w-12"
                        ></div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
        {/* 에러 상태 */}
        {error && (
          <div className="alert alert-error">
            <span>에러: {error}</span>
          </div>
        )}
        {/* 영양소 요약 */}
        {!isLoading && !error && (
          <>
            <div className="card bg-base-100 shadow-lg p-4 px-0 sm:px-40">
              <div className="text-md mb-4">
                <span className="font-bold">총 섭취량</span>{" "}
                <span className="text-purple-500 font-bold">{totalKcal}</span> /{" "}
                {calorieGoal}kcal
              </div>

              {/* 칼로리 프로그레스 바 */}
              <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
                <div
                  className="bg-gradient-to-r from-purple-500 to-purple-700 h-4 rounded-full"
                  style={{
                    width: `${Math.min((totalKcal / calorieGoal) * 100, 100)}%`,
                  }}
                ></div>
              </div>

              {/* 영양소 프로그레스 바들 */}
              <div className="flex gap-10 justify-between">
                <div>
                  <div className="text-md mb-4 pr-10 sm:pr-24">
                    <span className="font-bold text-sm sm:text-base">
                      탄수화물 <span className="text-green">{totalCarbs}</span>g
                    </span>
                  </div>
                  <div className="bg-gray-200 rounded-full h-4 mb-2">
                    <div
                      className="bg-gradient-to-r from-green to-green-700 h-4 rounded-full"
                      style={{
                        width: `${Math.min((totalCarbs / 300) * 100, 100)}%`,
                      }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="text-md mb-4 pr-10 sm:pr-24">
                    <span className="font-bold text-sm sm:text-base">
                      단백질{" "}
                      <span className="text-yellow-500">{totalProtein}</span>g
                    </span>
                  </div>
                  <div className="bg-gray-200 rounded-full h-4 mb-2">
                    <div
                      className="bg-gradient-to-r from-yellow to-yellow-500 h-4 rounded-full"
                      style={{
                        width: `${Math.min((totalProtein / 60) * 100, 100)}%`,
                      }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="text-md mb-4 pr-10 sm:pr-24">
                    <span className="font-bold text-sm sm:text-base">
                      지방 <span className="text-red">{totalFat}</span>g
                    </span>
                  </div>
                  <div className="bg-gray-200 rounded-full h-4 mb-2">
                    <div
                      className="bg-gradient-to-r from-red to-red-700 h-4 rounded-full"
                      style={{
                        width: `${Math.min((totalFat / 70) * 100, 100)}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* 식사 기록 */}
            <h2 className="m-0 text-lg sm:text-xl font-semibold">식사기록</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {mealRecords.map((record) => (
                <div
                  key={record.mealId || record.id}
                  onClick={() => handleCardClick(record)}
                >
                  <div className="card justify-between bg-base-100 w-full rounded-xl shadow-lg p-[20px] hover:bg-gray-100 transition-colors duration-200 cursor-pointer">
                    <figure className="mt-4">
                      <img
                        className="rounded-xl h-[180px] w-full object-cover"
                        src={
                          record.imageUrl || record.image || "/images/noimg.jpg"
                        }
                        alt="음식 사진"
                        onError={(e) => {
                          console.error("이미지 로드 실패:", record.imageUrl);
                          e.target.style.display = "none";
                          // 이미지 로드 실패 시 기본 아이콘 표시
                          const fallbackDiv = e.target.nextSibling;
                          if (fallbackDiv) {
                            fallbackDiv.style.display = "flex";
                          }
                        }}
                      />
                      {/* 이미지 로드 실패 시 표시할 기본 아이콘 */}
                      <div
                        className="rounded-xl h-[180px] w-full bg-gray-200 flex items-center justify-center text-4xl text-gray-400"
                        style={{ display: "none" }}
                      >
                        🍽️
                      </div>
                    </figure>
                    <div className="card-body p-0">
                      <h2 className="card-title flex mt-2">
                        <span className="text-sm text-gray-500">
                          {record.type || record.mealType}
                        </span>
                        <span className="text-purple-500">
                          {record.totalKcal || record.kcal || record.calories}
                          kcal
                        </span>
                      </h2>
                      <div className="text-[16px] font-semibold flex gap-4">
                        <p className="flex items-center gap-1">
                          <span className="w-6 h-6 rounded-full bg-green-700 text-white text-xs flex items-center justify-center">
                            탄
                          </span>
                          <span className="text-black">
                            {record.totalCarbs ||
                              record.carbs ||
                              (record.foods
                                ? record.foods.reduce(
                                    (sum, food) => sum + (food.carbs || 0),
                                    0
                                  )
                                : 0)}
                          </span>
                          <span className="text-black">g</span>
                        </p>
                        <p className="flex items-center gap-1">
                          <span className="w-6 h-6 rounded-full bg-yellow-500 text-white text-xs flex items-center justify-center">
                            단
                          </span>
                          <span className="text-black">
                            {record.totalProtein ||
                              record.protein ||
                              (record.foods
                                ? record.foods.reduce(
                                    (sum, food) => sum + (food.protein || 0),
                                    0
                                  )
                                : 0)}
                          </span>
                          <span className="text-black">g</span>
                        </p>
                        <p className="flex items-center gap-1">
                          <span className="w-6 h-6 rounded-full bg-red-700 text-white text-xs flex items-center justify-center">
                            지
                          </span>
                          <span className="text-black">
                            {record.totalFat ||
                              record.fat ||
                              (record.foods
                                ? record.foods.reduce(
                                    (sum, food) => sum + (food.fat || 0),
                                    0
                                  )
                                : 0)}
                          </span>
                          <span className="text-black">g</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* 데이터 없음 상태 */}
            {mealRecords.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">
                  선택한 날짜에 식사 기록이 없습니다.
                </p>
              </div>
            )}
          </>
        )}
      </div>

      <MealPickerModal />
      <MealCalendarModal
        open={isCalendarOpen}
        onClose={() => setIsCalendarOpen(false)}
        onSelectDate={(date) => dispatch(setSelectedDate(date))}
        memberId={memberId}
      />
    </>
  );
}

export default Meal;
