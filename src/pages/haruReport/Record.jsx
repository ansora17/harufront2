import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  setMealRecords,
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
  fetchMealsByMemberId,
} from "../../api/mealApi";

import HaruCalendar from "../../components/haruReport/record/Calendar";
import MealCard from "../../components/haruReport/record/MealCard";
import { Link } from "react-router-dom";
import MealSummary from "../../components/haruReport/record/MealSummary";
import SubLayout from "../../layout/SubLayout";
import ChatBot from "../../components/chatbot/ChatBot";

function Record() {
  const dispatch = useDispatch();

  // 🔥 현재 이렇게 되어 있음 (임시 설정)
  const [selectedDate, setSelectedDate] = useState(() => {
    return new Date(); // 현재 날짜로 변경
  });
  const [selectedDates, setSelectedDates] = useState([]);

  // 🔥 Redux에서 월별 데이터 가져오기 (기존 mealRecords 대신)
  const monthlyMealRecords = useSelector(
    (state) => state.meal.monthlyMealRecords
  );
  const { isMonthlyLoading, monthlyError, currentMonth, currentYear } =
    useSelector((state) => state.meal);
  const entireReduxState = useSelector((state) => state.meal); // 전체 상태 확인용

  // 🔥 로그인된 사용자 정보 가져오기 - 수정됨
  const loginState = useSelector((state) => state.login);
  const { isLoggedIn, memberId } = loginState; // 직접 구조분해

  // 🔥 selectedDate가 유효하지 않으면 오늘 날짜로 복구
  useEffect(() => {
    if (!selectedDate || isNaN(selectedDate.getTime())) {
      setSelectedDate(new Date());
    }
  }, [selectedDate]);

  // 🔥 월별 데이터 로드 로직 - 로그인 체크 수정
  useEffect(() => {
    // 정확한 로그인 체크
    if (!isLoggedIn || !memberId) {
      console.warn("로그인이 필요하거나 memberId가 없습니다.", {
        isLoggedIn,
        memberId,
      });
      return;
    }

    console.log("✅ 로그인 확인됨:", {
      isLoggedIn,
      memberId,
      nickname: loginState.nickname,
    });

    const loadData = async () => {
      // 3개월 전부터 현재까지의 데이터를 가져옴
      const endDate = new Date();
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 3);

      console.log("🔍 API 호출 시작:", {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        memberId,
      });

      dispatch(setMonthlyLoading(true));
      dispatch(clearMonthlyError());

      dispatch(
        fetchMealRecordsByDateRangeThunk({
          memberId,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        })
      );
    };

    loadData();
  }, [selectedDate, dispatch, memberId, isLoggedIn]); // selectedDate, memberId, 로그인 상태 변경 시마다 월별 데이터 로드

  // 🔍 실제 데이터 내용 확인
  if (monthlyMealRecords && monthlyMealRecords.length > 0) {
    // 🔍 날짜 관련 필드 찾기
    monthlyMealRecords.forEach((record, index) => {
      const possibleDateFields = Object.keys(record).filter(
        (key) =>
          key.toLowerCase().includes("date") ||
          key.toLowerCase().includes("time") ||
          key.toLowerCase().includes("created") ||
          key.toLowerCase().includes("updated")
      );
    });
  }

  const [mealCounts, setMealCounts] = useState({
    아침: 0,
    점심: 0,
    저녁: 0,
    간식: 0,
  });

  // 날짜 클릭 핸들러
  const handleDateClick = (date) => {
    // 🔥 입력된 date 유효성 검사
    if (!date) {
      console.error("🚨 날짜가 null 또는 undefined:", date);
      return;
    }

    // 🔥 Date 객체가 아닌 경우 변환 시도
    let validDate;
    if (date instanceof Date) {
      validDate = date;
    } else {
      validDate = new Date(date);
    }

    // 🔥 유효한 Date 객체인지 확인
    if (isNaN(validDate.getTime())) {
      console.error("🚨 유효하지 않은 날짜 형식:", date);
      return;
    }

    setSelectedDate(validDate);
    setSelectedDates((prev) => {
      const dateStr = validDate.toISOString().split("T")[0];

      const exists = prev.some((d) => {
        if (!d || isNaN(d.getTime())) return false;
        return d.toISOString().split("T")[0] === dateStr;
      });

      if (exists) {
        return prev.filter((d) => {
          if (!d || isNaN(d.getTime())) return false;
          return d.toISOString().split("T")[0] !== dateStr;
        });
      } else {
        return [...prev, validDate];
      }
    });
  };

  // 선택된 날짜의 식사 데이터를 가져오는 함수
  const getSelectedMeals = () => {
    if (!selectedDates.length || !monthlyMealRecords) return [];

    const result = selectedDates
      .flatMap((date) => {
        // 🔥 Date 객체 유효성 검사 추가
        if (!date || isNaN(date.getTime())) {
          console.error("🚨 유효하지 않은 날짜:", date);
          return [];
        }

        // 선택된 날짜의 시작과 끝 시간을 한국 시간대 기준으로 설정
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        const filtered = monthlyMealRecords.filter((record) => {
          // 🔥 record 전체 구조 확인

          // 🔥 다양한 날짜 필드명 시도 (modifiedAt 우선)
          const possibleDateField =
            record.modifiedAt ||
            record.createDate ||
            record.createdDate ||
            record.date ||
            record.dateTime ||
            record.created_at ||
            record.updatedDate ||
            record.updateDate;

          if (!possibleDateField) {
            console.warn("🚨 날짜 필드를 찾을 수 없음:", {
              availableFields: Object.keys(record),
              record: record,
            });
            return false;
          }

          const recordDate = new Date(possibleDateField);

          // 🔥 recordDate 유효성 검사 추가
          if (isNaN(recordDate.getTime())) {
            console.error("🚨 유효하지 않은 날짜:", possibleDateField);
            return false;
          }

          // 날짜만 비교 (시간 제외)
          const recordDateOnly = recordDate.toISOString().split("T")[0];
          const selectedDateOnly = date.toISOString().split("T")[0];

          const isInRange = recordDate >= startOfDay && recordDate <= endOfDay;
          const isSameDate = recordDateOnly === selectedDateOnly;

          // 🔥 더 확실한 방법: 문자열 날짜 비교도 사용
          return isSameDate || isInRange;
        });

        return filtered;
      })
      .sort((a, b) => {
        // 🔥 modifiedAt으로 소팅 (최신 순)
        const dateA = new Date(a.modifiedAt || a.createDate);
        const dateB = new Date(b.modifiedAt || b.createDate);
        return dateB - dateA;
      });

    return result;
  };

  // 선택된 월의 식사 타입별 카운트 계산 (Redux 데이터 기반)
  useEffect(() => {
    const counts = {
      아침: 0,
      점심: 0,
      저녁: 0,
      간식: 0,
    };

    if (monthlyMealRecords && monthlyMealRecords.length > 0) {
      monthlyMealRecords.forEach((record) => {
        // 🔥 modifiedAt 우선으로 날짜 가져오기
        const recordDateField =
          record.modifiedAt ||
          record.createDate ||
          record.createdDate ||
          record.date;

        if (!recordDateField) {
          console.warn("🚨 record에서 날짜 필드 없음:", record);
          return;
        }

        const recordDate = new Date(recordDateField);

        if (isNaN(recordDate.getTime())) {
          return;
        }

        const recordMonth = recordDate.getMonth();
        const recordYear = recordDate.getFullYear();
        const selectedMonth = selectedDate.getMonth();
        const selectedYear = selectedDate.getFullYear();

        if (recordMonth === selectedMonth && recordYear === selectedYear) {
          counts[record.type] = (counts[record.type] || 0) + 1;
        }
      });
    }

    setMealCounts(counts);
  }, [monthlyMealRecords, selectedDate]);

  // 날짜별로 그룹화하고 공복시간 계산하는 함수
  const getGroupedMealsByDate = () => {
    const selectedMeals = getSelectedMeals();

    // 날짜별로 그룹화
    const groupedByDate = selectedMeals.reduce((acc, meal) => {
      const mealDate = new Date(meal.modifiedAt || meal.createDate);
      const dateStr = mealDate.toLocaleDateString("ko-KR");

      if (!acc[dateStr]) {
        acc[dateStr] = [];
      }
      acc[dateStr].push(meal);
      return acc;
    }, {});

    // 각 날짜별 식사를 최신 시간순으로 정렬 (최신이 위로)
    Object.keys(groupedByDate).forEach((date) => {
      groupedByDate[date].sort((a, b) => {
        const timeA = new Date(a.modifiedAt || a.createDate);
        const timeB = new Date(b.modifiedAt || b.createDate);
        return timeB - timeA; // 최신순 정렬
      });
    });

    return groupedByDate;
  };

  // 공복시간 계산 함수 (시간 단위)
  const calculateFastingTime = (meal1, meal2) => {
    const time1 = new Date(meal1.modifiedAt || meal1.createDate);
    const time2 = new Date(meal2.modifiedAt || meal2.createDate);
    const diffMs = Math.abs(time2 - time1);
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    return diffHours;
  };

  // 사용자 이름 표시도 수정
  return (
    <div className="w-full max-w-[1020px] mx-auto px-4 sm:px-6">
      <SubLayout to="/haruReport" menu="리포트" label="기록습관" />
      {/* 🔥 수정: loginState.nickname 사용 */}

      <div className="mt-6 sm:mt-10 space-y-6">
        <MealSummary mealCounts={mealCounts} />
        <HaruCalendar
          selectedDate={
            selectedDate && !isNaN(selectedDate.getTime())
              ? selectedDate
              : new Date()
          }
          mealData={monthlyMealRecords}
          onDateClick={handleDateClick}
          onMonthChange={(date) => {
            if (date && !isNaN(date.getTime())) {
              setSelectedDate(date);
              setSelectedDates([]);
            } else {
              console.error("🚨 onMonthChange에서 유효하지 않은 날짜:", date);
            }
          }}
          className="mb-8"
        />

        {selectedDates.length > 0 && (
          <div className="mt-8">
            <h2 className="text-lg sm:text-2xl font-bold mb-4 text-gray-700 ml-2">
              |선택된 날짜의 식사 기록
            </h2>

            {(() => {
              const groupedMeals = getGroupedMealsByDate();
              // 날짜를 최신순으로 정렬 (7월2일이 7월1일보다 위에)
              const dates = Object.keys(groupedMeals).sort((a, b) => {
                const dateA = new Date(a);
                const dateB = new Date(b);
                return dateB - dateA; // 최신 날짜가 먼저
              });

              return dates.map((date, idx) => {
                const meals = groupedMeals[date];

                // 날짜 간 공복시간 계산 (최신순 정렬이므로 로직 수정)
                let fastingGap = null;
                if (idx < dates.length - 1) {
                  // 다음 날짜(더 이전 날짜)와 비교
                  const nextDate = dates[idx + 1]; // 더 이전 날짜
                  const nextMeals = groupedMeals[nextDate];
                  if (nextMeals.length > 0 && meals.length > 0) {
                    // 현재 날짜의 마지막 식사(가장 이른 시간)와 이전 날짜의 첫 식사(가장 늦은 시간) 비교
                    const lastMealCurrentDay = meals[meals.length - 1]; // 현재 날짜 가장 이른 식사
                    const firstMealPrevDay = nextMeals[0]; // 이전 날짜 가장 늦은 식사
                    fastingGap = calculateFastingTime(
                      firstMealPrevDay,
                      lastMealCurrentDay
                    );
                  }
                }

                return (
                  <React.Fragment key={date}>
                    {/* 날짜별 카드 묶음 */}
                    <div className="border border-gray-300 rounded-2xl p-4 sm:p-6 bg-white shadow">
                      <h3 className="text-mb font-semibold text-gray-700 mb-1 mr-3 flex justify-end">
                        {date}
                      </h3>

                      {meals.map((meal, index) => (
                        <div key={meal.mealId} className="relative">
                          <MealCard meal={meal} />

                          {/* 같은 날짜 내 식사 사이 공복 */}
                          {index < meals.length - 1 && (
                            <div className="flex items-center ml-5 ">
                              <img
                                src="/images/mark.png"
                                alt="공복 타임라인"
                                className="h-12 mr-2"
                              />
                              {(() => {
                                const currentMeal = meal;
                                const nextMeal = meals[index + 1];
                                const fastingTime = calculateFastingTime(
                                  nextMeal,
                                  currentMeal
                                ); // 순서 변경 (최신순이므로)
                                return (
                                  <span className="text-sm text-gray-500 font-semibold">
                                    공복시간: {fastingTime}시간
                                  </span>
                                );
                              })()}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    {/* 날짜 간 공복 구간 표시 */}
                    {idx < dates.length - 1 && fastingGap && (
                      <div className="flex items-center ml-5 ">
                        <img
                          src="/images/mark.png"
                          alt="날짜 사이 공복 타임라인"
                          className="h-12 mr-2"
                        />
                        <span className="text-sm text-purple-600 font-semibold">
                          공복시간: {fastingGap}시간
                        </span>
                      </div>
                    )}
                  </React.Fragment>
                );
              });
            })()}
          </div>
        )}

        {selectedDates.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">
              달력에서 날짜를 선택하면 해당 날짜의 식사 기록을 볼 수 있습니다.
            </p>
          </div>
        )}

        {isMonthlyLoading && (
          <div className="text-center py-8">
            <p className="text-blue-500">월별 식사 데이터를 불러오는 중...</p>
          </div>
        )}

        {monthlyError && (
          <div className="text-center py-8">
            <p className="text-red-500">에러: {monthlyError}</p>
            <button
              onClick={() => window.location.reload()}
              className="btn btn-primary mt-2"
            >
              새로고침
            </button>
          </div>
        )}

        {monthlyMealRecords.length === 0 &&
          !isMonthlyLoading &&
          !monthlyError && (
            <div className="text-center py-8">
              <p className="text-gray-500">아직 등록된 식사 기록이 없습니다.</p>
              <div className="mt-4">
                <p className="text-yellow-600 mb-2">
                  📍 Meal 페이지에서 먼저 데이터를 로드해주세요
                </p>
                <Link to="/dashboard" className="btn btn-primary mt-2">
                  식사 기록 페이지로 이동
                </Link>
              </div>
            </div>
          )}
      </div>
      {/* 챗봇 */}
      <ChatBot />
    </div>
  );
}

export default Record;
