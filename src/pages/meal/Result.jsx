import React, { useState, useEffect, memo } from "react";
import SubLayout from "../../layout/SubLayout";
import { useLocation, useParams } from "react-router-dom";
import axios from "axios";

function Result() {
  const [mealRecord, setMealRecord] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [resultData, setResultData] = useState([]);
  const [error, setError] = useState(null);
  const location = useLocation();
  const { id } = useParams(); // URL 파라미터에서 meal ID 가져오기
  const passedRecord = location.state;

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

        console.log("처리된 mealData:", mealData);
        setMealRecord(mealData);
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
            <p className="text-purple-600 mt-2 ml-2">
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
      <div className="w-full max-w-[1020px] mx-auto px-4 py-3">
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
          <div className="bg-gray-200 h-60 sm:h-64 md:h-72 rounded-xl flex items-center justify-center mb-6">
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
            <div className="flex justify-between font-bold text-lg mb-4 px-10">
              <h2>총 섭취량</h2>
              <div className="flex">
                <p>
                  {passedRecord.totalCalories || passedRecord.calories || 0}
                </p>
                <span className="text-purple-500">kcal</span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center text-base">
              {[
                [
                  "탄수화물",
                  passedRecord.totalCarbs || passedRecord.carbohydrate || 0,
                ],
                [
                  "단백질",
                  passedRecord.totalProtein || passedRecord.protein || 0,
                ],
                ["지방", passedRecord.totalFat || passedRecord.fat || 0],
                [
                  "나트륨",
                  Math.round(
                    (passedRecord.totalSodium || passedRecord.sodium || 0) * 10
                  ) / 10,
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
        <div className="overflow-x-auto no-scrollbar mb-8">
          <div className="flex gap-4 w-max px-1">
            {/* 음식 추가 버튼 */}
            <div
              className="min-w-[44px] h-56 bg-purple-500 rounded-xl flex items-center justify-center text-white text-2xl cursor-pointer"
              // onClick={handleImageClick}
            >
              +
            </div>

            {/* 🔥 음식 카테고리 아이콘 카드 */}
            {resultData.map((food, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="relative w-[200px] h-[200px] bg-gray-200 rounded-xl flex items-center justify-center">
                  {/* 🔥 카테고리별 아이콘 */}
                  <div className="text-6xl">
                    {(() => {
                      const category = food.foodType || "알 수 없음";
                      switch (category) {
                        case "한식":
                          return "🍚";
                        case "중식":
                          return "🥢";
                        case "일식":
                          return "🍣";
                        case "양식":
                          return "🍝";
                        case "분식":
                          return "🍢";
                        case "음료":
                          return "🥤";
                        default:
                          return "🍽️";
                      }
                    })()}
                  </div>
                  <button
                    onClick={() => handleRemoveImage(i)}
                    className="absolute top-2 right-2 bg-black/50 text-white rounded-full w-6 h-6 flex items-center justify-center cursor-pointer"
                  >
                    ×
                  </button>
                </div>
                <div className="flex items-center gap-1 mt-2">
                  <p className="text-sm font-medium text-center">
                    {food.name || "요리명"} {/* 🔥 name으로 변경 */}
                  </p>
                  <p className="text-sm text-gray-600">
                    ({food.foodType || "카테고리 없음"})
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 🔥 메모 입력 필드 추가 */}
        <div className="mb-4">
          <textarea
            className="textarea textarea-bordered w-full"
            placeholder="메모를 입력하세요 (예: 저녁은 간단하게 샌드위치와 주스)"
            value={passedRecord.memo}
            onChange={(e) => setMemo(e.target.value)}
            rows={2}
          />
        </div>

        {/* 이미지별 분석 결과는 아래쪽에 세로로 나열 */}
        {resultData.map((data, i) => (
          <div key={i} className="mb-8">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xl font-bold">{data.name || "요리명"}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {data.gram || "총량 정보 없음"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button className="w-8 h-8 rounded-full bg-gray-200 text-lg font-bold text-purple-500">
                  −
                </button>
                <div className="w-10 h-8 flex items-center justify-center border border-gray-300 rounded-md">
                  1
                </div>
                <button className="w-8 h-8 rounded-full bg-gray-200 text-lg font-bold text-purple-500">
                  ＋
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* 기록 버튼 */}
        <div>
          <button className="btn bg-purple-500 text-white w-full rounded-lg text-base mb-2">
            기록하기
          </button>
          <button className="btn bg-red text-white w-full rounded-lg text-base">
            삭제하기
          </button>
        </div>
      </div>
    </>
  );
}

export default Result;
