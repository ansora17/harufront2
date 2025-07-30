import React, { useRef, useState, useEffect } from "react";
import SubLayout from "../../layout/SubLayout";
import { useSelector, useDispatch } from "react-redux";
import {
  setSelectedDate,
  fetchDailyMealRecordsThunk,
  saveMealRecordThunk,
} from "../../slices/mealSlice";
import axios from "axios";
import MealCalendarModal from "../../components/meal/MealCalendarModal";
import FormSelect from "../../components/mypage/FormSelect";
import TimePickerModal from "../../components/meal/TimePickerModal";
import MealTypeModal from "../../components/meal/MealTypeModal";
import DatePickerModal from "../../components/meal/DatePickerModal";

function Analyis() {
  const fileInputRef = useRef(null);
  const [timestamp, setTimestamp] = useState(null);
  const selectedMeal = useSelector((state) => state.meal.selectedMeal);
  const [resultData, setResultData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [images, setImages] = useState([]);
  const mealRecords = useSelector((state) => state.meal.mealRecords);
  const { isLoading: isSaving } = useSelector((state) => state.meal); // 저장 로딩 상태
  const dispatch = useDispatch();
  const [isDateModalOpen, setIsDateModalOpen] = useState(false);
  const [isTimeModalOpen, setIsTimeModalOpen] = useState(false);
  const [isMealTypeModalOpen, setIsMealTypeModalOpen] = useState(false);
  const [memo, setMemo] = useState("");

  // 로그인 정보
  const { isLoggedIn, memberId } = useSelector((state) => state.login);

  useEffect(() => {
    setTimestamp(new Date());
  }, []);

  // 로그인 체크
  if (!isLoggedIn) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">로그인이 필요한 서비스입니다.</p>
      </div>
    );
  }

  const handleImageClick = (e) => {
    fileInputRef.current?.click();
  };

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result;
      const newImage = {
        file,
        url: base64,
      };

      setImages((prev) => [...prev, newImage]);
      sendImageToBackend(file, images.length);
    };

    reader.readAsDataURL(file);
  };

  const handleRemoveImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setResultData((prev) => prev.filter((_, i) => i !== index));
  };

  // 🔥 개선된 AI 백엔드 통신 함수로 교체
  const sendImageToBackend = async (file, index) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      setIsLoading(true);
      // 🔥 환경변수 사용으로 변경
      const AI_API_URL =
        import.meta.env.VITE_AI_API_URL || "http://localhost:8000";

      const res = await axios.post(`${AI_API_URL}/api/food/analyze`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("전체 응답:", res.data);

      if (res.data.success) {
        const result = res.data.result;
        console.log("분석 결과:", result);

        // 🔥 백엔드에서 받은 데이터를 프론트엔드 형식으로 변환
        const foodData = {
          name: result.foodName || "알 수 없음", // name으로 통일
          calories: result.calories || 0,
          carbohydrate: result.carbohydrates || 0,
          protein: result.protein || 0,
          fat: result.fat || 0,
          sodium: result.sodium || 0,
          fiber: result.fiber || 0,
          gram: result.total_amount || "알 수 없음",
          foodType: result.food_category || "알 수 없음", // 🔥 카테고리 추가
        };

        setResultData((prev) => {
          const updated = [...prev];
          updated[index] = foodData;
          return updated;
        });
      } else {
        console.error("분석 실패:", res.data.error);
        alert(`이미지 분석에 실패했습니다: ${res.data.error}`);
      }
    } catch (err) {
      console.error("이미지 분석 실패:", err);
      alert("이미지 분석 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  // 🔥 총 영양소 계산에 sodium 추가
  const totalNutrition = resultData.reduce(
    (acc, cur) => {
      acc.kcal += cur.calories || 0;
      acc.carbs += cur.carbohydrate || 0;
      acc.protein += cur.protein || 0;
      acc.fat += cur.fat || 0;
      acc.sodium += cur.sodium || 0; // 🔥 나트륨 추가
      return acc;
    },
    { kcal: 0, carbs: 0, protein: 0, fat: 0, sodium: 0 }
  );

  const parseNutritionData = (text) => {
    const lines = text.split("\n");
    const data = {};

    lines.forEach((line) => {
      const [key, value] = line.split(":").map((s) => s.trim());
      if (key && value) {
        data[key] = value;
      }
    });

    const get = (key) => {
      const value = data[key];
      if (!value) return 0;
      const num = parseFloat(value.replace(/[^\d.]/g, ""));
      return isNaN(num) ? 0 : num;
    };

    return {
      name: data["음식명"] || "알 수 없음",
      calories: get("칼로리"),
      carbohydrate: get("탄수화물"),
      protein: get("단백질"),
      fat: get("지방"),
      sugar: get("당류"),
      sodium: get("나트륨"),
      fiber: get("식이섬유"),
      gram: text.match(/총량:\s*(.+)/)?.[1] || "알 수 없음",
    };
  };

  const handleSaveMeal = async () => {
    // 로그인 체크
    if (!isLoggedIn || !memberId) {
      alert("로그인이 필요합니다.");
      return;
    }

    // 필수 데이터 검증
    if (!selectedMeal) {
      alert("식사 타입을 선택해주세요.");
      return;
    }

    if (!timestamp) {
      alert("날짜와 시간을 설정해주세요.");
      return;
    }

    if (resultData.length === 0) {
      alert("분석된 음식 데이터가 없습니다.");
      return;
    }

    // 식사 데이터 구성
    const year = timestamp.getFullYear();
    const month = String(timestamp.getMonth() + 1).padStart(2, "0");
    const day = String(timestamp.getDate()).padStart(2, "0");
    const hour = String(timestamp.getHours()).padStart(2, "0");
    const minute = String(timestamp.getMinutes()).padStart(2, "0");
    const modifiedAtStr = `${year}-${month}-${day}T${hour}:${minute}`;

    // 🔥 음식 카테고리 매핑 추가
    const categoryMap = {
      한식: "KOREAN",
      중식: "CHINESE",
      일식: "JAPANESE",
      양식: "WESTERN",
      분식: "SNACK",
      음료: "BEVERAGE", // 추가
    };

    // foods 배열 생성
    const foods = resultData.map((food) => ({
      name: food.name,
      calories: food.calories || 0,
      carbohydrate: food.carbohydrate || 0,
      protein: food.protein || 0,
      fat: food.fat || 0,
      sugar: food.sugar || 0,
      sodium: food.sodium || 0,
      fiber: food.fiber || 0,
      gram: food.gram || "알 수 없음",
      foodCategory: categoryMap[food.foodType] || "ETC", // 🔥 카테고리 매핑
    }));

    // 🔥 백엔드 API 호출 시 memo 포함
    const mealData = {
      mealType: selectedMeal,
      imageUrl: "",
      memo: memo || "", // 🔥 메모 추가
      foods: foods,
      modifiedAt: modifiedAtStr,
      totalCalories: parseInt(totalNutrition.kcal) || 0,
      totalCarbs: parseInt(totalNutrition.carbs) || 0,
      totalProtein: parseInt(totalNutrition.protein) || 0,
      totalFat: parseInt(totalNutrition.fat) || 0,
    };

    console.log("✅ 식사 저장 데이터:", mealData);

    // 🔥 mealSlice thunk 사용으로 변경
    try {
      const result = await dispatch(
        saveMealRecordThunk({
          memberId,
          mealData,
        })
      ).unwrap();

      console.log("✅ 식사 저장 성공:", result);
      alert("식사 기록이 저장되었습니다.");

      // 🔥 폼 초기화
      setImages([]);
      setResultData([]);
      setMemo(""); // 메모도 초기화
      setTimestamp(new Date());
    } catch (error) {
      console.error("❌ 식사 저장 실패:", error);
      alert("식사 기록 저장에 실패했습니다: " + error);
    }
  };

  const formatDate = (date) => {
    return date?.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      weekday: "short",
    });
  };

  return (
    <>
      <SubLayout to={"/"} menu={"식단분석"} label={"식사요약"} />
      <div className="w-full max-w-[1020px] mx-auto px-4 py-4">
        {/* 날짜 / 시간 / 식사타입 */}
        <div className="flex flex-row sm:flex-row gap-2 mb-4">
          <input
            type="text"
            placeholder="날짜를 입력해 주세요"
            value={timestamp ? formatDate(timestamp) : ""}
            onClick={() => setIsDateModalOpen(true)}
            readOnly
            className="input input-bordered flex-1 text-center cursor-pointer"
          />
          <input
            type="text"
            placeholder="시간을 입력해 주세요"
            value={
              timestamp
                ? `${timestamp
                    .getHours()
                    .toString()
                    .padStart(2, "0")}:${timestamp
                    .getMinutes()
                    .toString()
                    .padStart(2, "0")}`
                : ""
            }
            onClick={() => setIsTimeModalOpen(true)}
            readOnly
            className="input input-bordered flex-1 text-center cursor-pointer"
          />
          <input
            type="text"
            value={selectedMeal || "식사 타입 선택"}
            onClick={() => setIsMealTypeModalOpen(true)}
            readOnly
            className="input input-bordered flex-1 text-center cursor-pointer"
          />
        </div>

        <div className="border-b border-gray-300">
          {/* 이미지 업로드 */}
          <div
            className="relative bg-gray-200 h-60 sm:h-64 md:h-72 rounded-xl flex items-center justify-center mb-6 cursor-pointer"
            onClick={handleImageClick}
          >
            {images.length > 0 ? (
              <>
                <img
                  src={images[0].url}
                  alt="업로드된 이미지"
                  className="object-cover w-full h-full rounded-xl"
                />
                {resultData[0]?.name && (
                  <div className="absolute top-4 left-4 bg-purple-500/90 text-white text-xl font-bold px-4 py-2 rounded-full">
                    {resultData[0].name}
                  </div>
                )}
              </>
            ) : (
              <span className="text-4xl text-gray-400">＋</span>
            )}

            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              capture="environment"
              onChange={handleImageChange}
              className="hidden"
            />
          </div>

          {/* 총 섭취량 */}
          <div className="bg-gray-100 rounded-xl p-7 pb-7 mb-6">
            <div className="flex justify-between font-bold text-lg mb-6 px-10">
              <h2>총 섭취량</h2>
              <div className="flex">
                <p>{totalNutrition.kcal || 0}</p>
                <span className="text-purple-500">kcal</span>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center text-base">
              {[
                ["탄수화물", totalNutrition.carbs],
                ["단백질", totalNutrition.protein],
                ["지방", totalNutrition.fat],
                ["나트륨", Math.round((totalNutrition.sodium ?? 0) * 10) / 10],
              ].map(([label, value], i) => (
                <div key={i} className="flex flex-col items-center gap-2">
                  <div className="w-20 h-20 bg-gray-300 rounded-full flex items-center justify-center text-lg font-bold">
                    {value ?? 0}
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
              onClick={handleImageClick}
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
            value={memo}
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

        <div className="pt-8">
          <button
            className={`btn w-full rounded-lg py-6 text-base ${
              resultData.length > 0 && selectedMeal && timestamp
                ? "bg-purple-500 text-white"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`} // 🔥 버튼 상태 관리
            onClick={handleSaveMeal}
            disabled={resultData.length === 0 || !selectedMeal || !timestamp} // 🔥 비활성화 조건
          >
            기록하기
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl flex items-center gap-4">
            <span className="loader border-4 border-purple-500 border-t-transparent rounded-full w-8 h-8 animate-spin" />
            <p className="text-lg font-bold text-purple-700">
              분석 중입니다...
            </p>
          </div>
        </div>
      )}

      {/* 모달들 */}
      <MealTypeModal
        open={isMealTypeModalOpen}
        onClose={() => setIsMealTypeModalOpen(false)}
        onConfirm={(type) => {
          // selectedMeal 업데이트 로직 필요
        }}
      />

      <DatePickerModal
        open={isDateModalOpen}
        onClose={() => setIsDateModalOpen(false)}
        onConfirm={(dateString) => {
          if (dateString) {
            const date = new Date(dateString);
            if (timestamp) {
              date.setHours(timestamp.getHours());
              date.setMinutes(timestamp.getMinutes());
            }
            setTimestamp(date);
          }
        }}
        initialDate={
          timestamp
            ? formatDate(timestamp).replace(/\./g, "-").replace(/\s.*/, "")
            : ""
        }
        memberId={memberId}
      />

      <TimePickerModal
        open={isTimeModalOpen}
        onClose={() => setIsTimeModalOpen(false)}
        onConfirm={(timeString) => {
          if (timeString) {
            const [hour, minute] = timeString.split(":");
            const newDate = new Date(timestamp);
            newDate.setHours(Number(hour));
            newDate.setMinutes(Number(minute));
            setTimestamp(newDate);
          }
        }}
      />
    </>
  );
}

export default Analyis;
