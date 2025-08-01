import React, { useState, useEffect, memo } from "react";
import SubLayout from "../../layout/SubLayout";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";

function Result() {
  const [mealRecord, setMealRecord] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [memo, setMemo] = useState("");
  const location = useLocation();
  const { id } = useParams(); // URL 파라미터에서 meal ID 가져오기
  const passedRecord = location.state;
  const [selectedFoodIndex, setSelectedFoodIndex] = useState(null);
  const navigate = useNavigate(); // 🔥 페이지 이동을 위한 navigate 추가

  // 🔥 현재 사용자 정보 가져오기
  const currentUser = useSelector((state) => state.login);
  console.log("Current user data:", currentUser);

  // 음식 제거 함수
  const handleRemoveImage = (index) => {
    console.log("음식 제거:", index);
    // 실제 제거 로직은 나중에 구현
  };

  // 🔥 음식 카드 클릭 핸들러 추가
  const handleFoodCardClick = (index) => {
    setSelectedFoodIndex(selectedFoodIndex === index ? null : index);
  };

  useEffect(() => {
    const fetchMealRecord = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // URL 파라미터에서 ID를 가져오거나 location state에서 ID를 가져옴
        const mealId = id || passedRecord?.id;

        console.log("URL 파라미터 id:", id);
        console.log("passedRecord:", passedRecord);
        console.log("사용할 mealId:", mealId);

        if (!mealId) {
          setError("식사 기록 ID가 없습니다.");
          setIsLoading(false);
          return;
        }

        // API 호출
        const response = await axios.get(
          `http://localhost:8080/api/meals/${mealId}`
        );

        console.log("API 응답:", response.data);

        // 응답 구조 확인 및 처리
        let mealData;
        if (response.data.success) {
          mealData = response.data.result;
        } else if (response.data) {
          // success 필드가 없지만 데이터가 있는 경우
          mealData = response.data;
        } else {
          setError("식사 기록을 불러오는데 실패했습니다.");
          return;
        }

        // 🔥 사용자 weight 정보 추가
        if (currentUser && currentUser.weight) {
          mealData.userWeight = currentUser.weight;
          console.log("사용자 체중 정보 추가:", currentUser.weight);
        }

        // 배열인 경우 전체 배열을 foods로 설정
        let finalMealData = mealData;
        if (Array.isArray(mealData) && mealData.length > 0) {
          // 배열이 음식 데이터인 경우 - totalAmount를 gram으로 매핑
          const processedFoods = mealData.map((food) => ({
            ...food,
            gram: food.gram || food.totalAmount || "알 수 없음",
          }));

          finalMealData = {
            foods: processedFoods,
            totalCalories: mealData.reduce(
              (sum, food) => sum + (food.calories || 0),
              0
            ),
            totalCarbs: mealData.reduce(
              (sum, food) =>
                sum + (food.carbohydrate || food.carbohydrates || 0),
              0
            ),
            totalProtein: mealData.reduce(
              (sum, food) => sum + (food.protein || 0),
              0
            ),
            totalFat: mealData.reduce((sum, food) => sum + (food.fat || 0), 0),
            totalSodium: mealData.reduce(
              (sum, food) => sum + (food.sodium || 0),
              0
            ),
            totalQuantity: mealData.reduce(
              (sum, food) => sum + (food.quantity || 0),
              0
            ),
            modifiedAt: new Date().toISOString(),
            mealType: "LUNCH", // 기본값
          };
          console.log("배열을 foods로 변환:", finalMealData);
        }

        setMealRecord(finalMealData);
      } catch (err) {
        console.error("식사 기록 조회 실패:", err);
        console.error("에러 상세:", err.response?.data);
        console.error("에러 상태:", err.response?.status);

        if (err.response?.status === 404) {
          setError("해당 식사 기록을 찾을 수 없습니다.");
        } else if (err.response?.status === 500) {
          setError("서버 오류가 발생했습니다.");
        } else {
          setError(`식사 기록을 불러오는데 실패했습니다: ${err.message}`);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchMealRecord();
  }, [id, passedRecord]);

  // 로딩 상태
  if (isLoading) {
    return (
      <>
        <SubLayout to={"/"} menu={"식단분석"} label={"식사요약"} />
        <div className="w-full max-w-[1020px] mx-auto px-4 py-3">
          <div className="flex items-center justify-center py-8">
            <span className="loading loading-spinner loading-lg text-purple-500"></span>
            <p className="text-purple-500 mt-2 ml-2">
              식사 데이터를 불러오는 중...
            </p>
          </div>
        </div>
      </>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <>
        <SubLayout to={"/"} menu={"식단분석"} label={"식사요약"} />
        <div className="w-full max-w-[1020px] mx-auto px-4 py-3">
          <div className="alert alert-error">
            <span>{error}</span>
          </div>
        </div>
      </>
    );
  }

  // 데이터가 없는 경우
  if (!mealRecord) {
    return (
      <>
        <SubLayout to={"/"} menu={"식단분석"} label={"식사요약"} />
        <div className="w-full max-w-[1020px] mx-auto px-4 py-3">
          <div className="text-center py-8">
            <p className="text-gray-500">식사 기록을 찾을 수 없습니다.</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <SubLayout to={"/"} menu={"식단분석"} label={"식사요약"} />
      <div className="w-full max-w-[1020px] mx-auto px-4 py-4">
        {/* 날짜 / 시간 / 식사타입 */}
        <div className="flex flex-row sm:flex-row gap-2 mb-4">
          <input
            type="text"
            value={
              mealRecord.modifiedAt ? mealRecord.modifiedAt.split("T")[0] : ""
            }
            placeholder="날짜를 입력해 주세요"
            className="input input-bordered flex-1 text-center"
            readOnly
          />
          <input
            type="text"
            value={
              mealRecord.modifiedAt
                ? mealRecord.modifiedAt.split("T")[1]?.slice(0, 5)
                : ""
            }
            placeholder="시간을 입력해 주세요"
            className="input input-bordered flex-1 text-center"
            readOnly
          />
          <input
            type="text"
            value={
              mealRecord.mealType === "BREAKFAST"
                ? "아침"
                : mealRecord.mealType === "LUNCH"
                ? "점심"
                : mealRecord.mealType === "DINNER"
                ? "저녁"
                : mealRecord.mealType === "SNACK"
                ? "간식"
                : mealRecord.mealType
            }
            readOnly
            className="input input-bordered flex-1 text-center"
          />
        </div>

        <div className="border-b border-gray-300">
          {/* 이미지 업로드 박스 */}
          <div className="bg-gray-200 h-60 sm:h-64 md:h-82 rounded-xl flex items-center justify-center mb-6">
            {mealRecord.imageUrl ? (
              <img
                src={mealRecord.imageUrl}
                alt="기록된 음식"
                className="object-cover w-full h-full rounded-xl"
              />
            ) : (
              <div className="text-gray-400 text-4xl">🍽️</div>
            )}
          </div>

          {/* 총 섭취량 */}
          <div className="bg-gray-100 rounded-xl p-7 pb-7 mb-6">
            <div className="flex justify-between font-bold text-lg mb-6 px-10">
              <h2>총 섭취량</h2>
              <div className="flex">
                <p>
                  {mealRecord.foods && Array.isArray(mealRecord.foods)
                    ? mealRecord.foods.reduce(
                        (sum, food) => sum + (food.calories || food.kcal || 0),
                        0
                      )
                    : mealRecord.totalCalories || mealRecord.calories || 0}
                </p>
                <span className="text-purple-500">kcal</span>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center text-base">
              {[
                [
                  "탄수화물",
                  mealRecord.foods && Array.isArray(mealRecord.foods)
                    ? mealRecord.foods.reduce(
                        (sum, food) =>
                          sum +
                          (food.carbohydrate ||
                            food.carbohydrates ||
                            food.carbs ||
                            0),
                        0
                      )
                    : mealRecord.totalCarbs || mealRecord.carbohydrate || 0,
                ],
                [
                  "단백질",
                  mealRecord.foods && Array.isArray(mealRecord.foods)
                    ? mealRecord.foods.reduce(
                        (sum, food) => sum + (food.protein || 0),
                        0
                      )
                    : mealRecord.totalProtein || mealRecord.protein || 0,
                ],
                [
                  "지방",
                  mealRecord.foods && Array.isArray(mealRecord.foods)
                    ? mealRecord.foods.reduce(
                        (sum, food) => sum + (food.fat || 0),
                        0
                      )
                    : mealRecord.totalFat || mealRecord.fat || 0,
                ],
                [
                  "수량",
                  mealRecord.foods && Array.isArray(mealRecord.foods)
                    ? mealRecord.foods.reduce(
                        (sum, food) => sum + (food.quantity || 0),
                        0
                      )
                    : mealRecord.totalQuantity || 0,
                ],
              ].map(([label, value], i) => (
                <div key={i} className="flex flex-col items-center gap-2">
                  <div className="w-20 h-20 bg-gray-300 rounded-full flex items-center justify-center text-lg font-bold">
                    {value}
                  </div>
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-xl pt-7 pr-7 pb-3 ps-0">
          <div className="flex justify-between font-bold text-2xl ">
            <h2 className="text-lg sm:text-xl font-semibold">음식 정보 수정</h2>
          </div>
        </div>

        {/* 음식 카테고리 아이콘 카드 수평 슬라이드 */}
        <div className="overflow-x-auto mb-8 pt-1 scroll-smooth">
          <div className="flex gap-4 w-max px-1 pb-2 min-w-full">
            {/* 음식 추가 버튼 */}
            <div
              className="min-w-[44px] h-56 bg-purple-500 rounded-xl flex items-center justify-center text-white text-2xl cursor-pointer"
              // onClick={handleImageClick}
            >
              +
            </div>

            {/* 🔥 음식 카테고리 아이콘 카드 */}
            {mealRecord.foods &&
              Array.isArray(mealRecord.foods) &&
              mealRecord.foods.map((food, i) => (
                <div key={i} className="flex flex-col items-center">
                  <div
                    className={`relative w-[200px] h-[200px] bg-gray-200 rounded-xl flex items-center justify-center cursor-pointer transition-all duration-200 ${
                      selectedFoodIndex === i
                        ? "ring-4 ring-purple-500 bg-purple-100"
                        : ""
                    }`}
                    onClick={() => handleFoodCardClick(i)}
                  >
                    {/* 🔥 카테고리별 아이콘 */}
                    <div className="text-6xl">
                      {(() => {
                        const category = food.foodCategory || "알 수 없음";
                        switch (category) {
                          case "한식":
                          case "KOREAN":
                            return "🍚";
                          case "중식":
                          case "CHINESE":
                            return "🥢";
                          case "일식":
                          case "JAPANESE":
                            return "🍣";
                          case "양식":
                          case "WESTERN":
                            return "🍝";
                          case "분식":
                          case "SNACK":
                            return "🍢";
                          case "음료":
                          case "BEVERAGE":
                            return "🥤";
                          default:
                            return "🍽️";
                        }
                      })()}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveImage(i);
                      }}
                      className="absolute top-2 right-2 bg-black/50 text-white rounded-full w-6 h-6 flex items-center justify-center cursor-pointer"
                    >
                      ×
                    </button>
                  </div>
                  <div className="flex items-center gap-1 mt-2">
                    <p className="text-sm font-medium text-center">
                      {food.foodName || "요리명"}
                    </p>
                    <p className="text-sm text-gray-600">
                      (
                      {(() => {
                        const category = food.foodCategory || "카테고리 없음";
                        switch (category) {
                          case "KOREAN":
                            return "한식";
                          case "CHINESE":
                            return "중식";
                          case "JAPANESE":
                            return "일식";
                          case "WESTERN":
                            return "양식";
                          case "SNACK":
                            return "분식";
                          case "BEVERAGE":
                            return "음료";
                          default:
                            return category;
                        }
                      })()}
                      )
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* 🔥 이미지별 분석 결과는 아래쪽에 세로로 나열 - 필터링 적용 */}
        {selectedFoodIndex !== null &&
          mealRecord.foods &&
          Array.isArray(mealRecord.foods) &&
          mealRecord.foods[selectedFoodIndex] && (
            <div
              key={selectedFoodIndex}
              className="p-4 mb-5 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1)]"
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-xl font-bold">
                    {mealRecord.foods[selectedFoodIndex].foodName ||
                      mealRecord.foods[selectedFoodIndex].name ||
                      "요리명"}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {mealRecord.foods[selectedFoodIndex].gram ||
                      mealRecord.foods[selectedFoodIndex].totalAmount ||
                      "총량 정보 없음"}
                    g
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button className="w-8 h-8 rounded-full bg-gray-200 text-lg font-bold text-purple-500">
                    −
                  </button>
                  <div className="w-10 h-8 flex items-center justify-center border border-gray-300 rounded-md">
                    {mealRecord.foods[selectedFoodIndex].quantity || 1}
                  </div>
                  <button className="w-8 h-8 rounded-full bg-gray-200 text-lg font-bold text-purple-500">
                    ＋
                  </button>
                </div>
              </div>

              {/* 영양소 정보 추가 */}
              <div className="mt-4 bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-green-600">칼로리</span>
                    <div className="font-bold">
                      {mealRecord.foods[selectedFoodIndex].calories ||
                        mealRecord.foods[selectedFoodIndex].kcal ||
                        0}{" "}
                      kcal
                    </div>
                  </div>
                  <div>
                    <span className="text-green-600">탄수화물</span>
                    <div className="font-bold">
                      {mealRecord.foods[selectedFoodIndex].carbohydrate ||
                        mealRecord.foods[selectedFoodIndex].carbohydrates ||
                        mealRecord.foods[selectedFoodIndex].carbs ||
                        0}
                      g
                    </div>
                  </div>
                  <div>
                    <span className="text-yellow-600">단백질</span>
                    <div className="font-bold">
                      {mealRecord.foods[selectedFoodIndex].protein || 0}g
                    </div>
                  </div>
                  <div>
                    <span className="text-red-600">지방</span>
                    <div className="font-bold">
                      {mealRecord.foods[selectedFoodIndex].fat || 0}g
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm mt-2">
                  <div>
                    <span className="text-blue-600">나트륨</span>
                    <div className="font-bold">
                      {mealRecord.foods[selectedFoodIndex].sodium || 0}mg
                    </div>
                  </div>
                  <div>
                    <span className="text-orange-600">식이섬유</span>
                    <div className="font-bold">
                      {mealRecord.foods[selectedFoodIndex].fiber || 0}g
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        {/* 🔥 사용자 체중 정보 표시 */}
        {mealRecord.userWeight && (
          <>
            <div className="rounded-xl pt-7 pr-7 pb-3 ps-0 hidden">
              <div className="flex justify-between font-bold text-2xl ">
                <h2 className="text-lg sm:text-xl font-semibold">
                  사용자 정보
                </h2>
              </div>
            </div>
            <div className="mb-4 p-4 bg-gray-50 rounded-lg hidden">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">현재 체중:</span>
                  <span className="font-bold text-purple-500">
                    {mealRecord.userWeight} kg
                  </span>
                </div>
                {currentUser && currentUser.height && (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">키:</span>
                    <span className="font-bold text-purple-500">
                      {currentUser.height} cm
                    </span>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* 🔥 메모 입력 필드 추가 */}
        <div className="rounded-xl pt-7 pr-7 pb-3 ps-0">
          <div className="flex justify-between font-bold text-2xl ">
            <h2 className="text-lg sm:text-xl font-semibold">메모</h2>
          </div>
        </div>
        <div className="mb-4">
          <textarea
            className="textarea textarea-bordered w-full"
            placeholder="메모를 입력하세요 (예: 저녁은 간단하게 샌드위치와 주스)"
            value={mealRecord.memo}
            onChange={(e) => setMemo(e.target.value)}
            rows={2}
          />
        </div>

        {/* 기록 버튼 */}
        <div className="pt-8">
          <button className="btn bg-purple-500 text-white w-full rounded-lg py-6 text-base mb-2">
            기록하기
          </button>
          <button
            className="btn bg-red text-white w-full rounded-lg py-6 text-base"
            onClick={async () => {
              try {
                // 🔥 mealId를 URL 파라미터나 passedRecord에서 가져오기
                const mealId = id || passedRecord?.id || mealRecord?.id;

                console.log("삭제할 mealId:", mealId);
                console.log("mealRecord:", mealRecord);

                if (!mealId) {
                  alert("삭제할 식사 기록 ID를 찾을 수 없습니다.");
                  return;
                }

                const response = await axios.delete(
                  `http://localhost:8080/api/meals/${mealId}`
                );

                console.log("삭제 응답:", response);

                if (response.status === 204) {
                  alert("기록이 삭제되었습니다.");
                  // 🔥 삭제 성공 시 dashboard 페이지로 이동
                  navigate("/dashboard");
                } else {
                  alert("기록 삭제에 실패했습니다.");
                }
              } catch (error) {
                console.error("삭제 오류:", error);
                console.error("오류 응답:", error.response?.data);
                console.error("오류 상태:", error.response?.status);

                if (error.response?.status === 404) {
                  alert("삭제할 식사 기록을 찾을 수 없습니다.");
                } else if (error.response?.status === 500) {
                  alert("서버 오류가 발생했습니다.");
                } else {
                  alert("기록 삭제 중 오류가 발생했습니다.");
                }
              }
            }}
          >
            삭제하기
          </button>
        </div>
      </div>
    </>
  );
}

export default Result;
