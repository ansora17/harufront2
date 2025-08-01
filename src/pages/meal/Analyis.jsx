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
  // 🔥 선택된 음식 인덱스 상태 추가
  const [selectedFoodIndex, setSelectedFoodIndex] = useState(null);
  // 🔥 이미지 선택 모달 상태 추가
  const [showImageChoiceModal, setShowImageChoiceModal] = useState(false);
  // 🔥 이미지 입력 모달 상태 추가
  const [showImageInputModal, setShowImageInputModal] = useState(false);
  // 🔥 이미지 URL 입력 상태 추가
  const [imageInputUrl, setImageInputUrl] = useState("");

  // 로그인 정보
  const { isLoggedIn, memberId } = useSelector((state) => state.login);

  // 🔥 현재 사용자 정보 가져오기
  const currentUser = useSelector((state) => state.login);
  console.log("Current user data:", currentUser);

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
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // 🔥 파일 유효성 검사 추가
    for (const file of files) {
      // 파일 크기 검사 (10MB 제한)
      if (file.size > 10 * 1024 * 1024) {
        alert(
          `파일 ${file.name}이 너무 큽니다. 10MB 이하의 파일을 선택해주세요.`
        );
        continue;
      }

      // 파일 타입 검사
      if (!file.type.startsWith("image/")) {
        alert(
          `파일 ${file.name}은 이미지 파일이 아닙니다. 이미지 파일을 선택해주세요.`
        );
        continue;
      }

      // 지원하는 이미지 형식 검사
      const supportedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
      ];
      if (!supportedTypes.includes(file.type)) {
        alert(
          `파일 ${file.name}은 지원하지 않는 형식입니다. JPG, PNG, WEBP 파일을 사용해주세요.`
        );
        continue;
      }
    }

    // 각 파일에 대해 개별적으로 처리
    files.forEach((file, fileIndex) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result;
        const newImage = {
          file,
          url: base64,
        };

        setImages((prev) => [...prev, newImage]);
        // 각 이미지에 대해 개별적으로 분석 수행
        sendImageToBackend(file, images.length + fileIndex);
      };

      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setResultData((prev) => prev.filter((_, i) => i !== index));
    // 🔥 선택된 음식이 제거되면 선택 상태 초기화
    if (selectedFoodIndex === index) {
      setSelectedFoodIndex(null);
    } else if (selectedFoodIndex > index) {
      setSelectedFoodIndex(selectedFoodIndex - 1);
    }
  };

  // 🔥 음식명 직접 입력 처리 함수 추가
  const handleFoodNameInput = async (foodName) => {
    if (!foodName) return;

    try {
      setIsLoading(true);

      // 🔥 새로운 텍스트 분석 API 호출
      const AI_API_URL =
        import.meta.env.VITE_AI_API_URL || "http://localhost:8080";

      console.log("📤 텍스트 분석 API 요청:", {
        url: `${AI_API_URL}/api/meals/analyze-food-text`,
        foodName: foodName,
        env: import.meta.env.VITE_AI_API_URL ? "설정됨" : "기본값 사용",
      });

      // 🔥 서버 연결 테스트 추가
      try {
        const testResponse = await axios.get(`${AI_API_URL}/health`, {
          timeout: 5000,
        });
        console.log("✅ 서버 연결 확인:", testResponse.status);
      } catch (testErr) {
        console.warn("⚠️ 서버 연결 테스트 실패:", testErr.message);
        console.log(
          "🔍 서버 상태 확인이 필요합니다. API 요청을 계속 진행합니다."
        );
      }

      // 🔥 백엔드 API 구조에 맞게 food_name 필드로 요청
      const response = await axios.post(
        `${AI_API_URL}/api/meals/analyze-food-text`,
        { food_name: foodName },
        {
          headers: {
            "Content-Type": "application/json",
          },
          timeout: 30000, // 30초 타임아웃
        }
      );

      console.log("📥 텍스트 분석 API 응답:", response.data);

      // 🔥 백엔드 API 응답 구조에 맞게 수정 (success, result 구조)
      if (response.data && response.data.success && response.data.result) {
        console.log("텍스트 분석 결과:", response.data);

        const result = response.data.result;
        console.log("🔍 분석된 음식 데이터:", result);

        // 🔥 백엔드 응답 구조에 맞게 데이터 변환
        const foodData = {
          name: result.foodName || foodName,
          calories: result.calories || 0,
          carbohydrate: result.carbohydrate || 0,
          protein: result.protein || 0,
          fat: result.fat || 0,
          sodium: result.sodium || 0,
          fiber: result.fiber || 0,
          gram: result.totalAmount || "알 수 없음",
          foodCategory: result.foodCategory || "알 수 없음",
        };

        console.log("🔍 변환된 음식 데이터:", foodData);
        const foodDataArray = [foodData];

        // 결과 데이터에 추가
        setResultData((prev) => [...prev, ...foodDataArray]);

        // 더미 이미지 추가 (UI 표시용)
        const newImage = {
          file: null,
          url: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjEwMCIgeT0iMTAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiM5Q0EzQUYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj7snbTrgqjrjIDtlZjqs6A8L3RleHQ+Cjwvc3ZnPgo=",
        };
        setImages((prev) => [...prev, newImage]);

        // 모달 닫기
        setShowImageInputModal(false);
        setImageInputUrl("");

        console.log("✅ 텍스트 분석 완료:", foodDataArray);
      } else {
        console.error("텍스트 분석 실패:", response.data);
        alert(
          "텍스트 분석에 실패했습니다. 응답 데이터 형식이 올바르지 않습니다."
        );
      }
    } catch (err) {
      console.error("텍스트 분석 오류:", err);

      let errorMessage = "텍스트 분석 중 오류가 발생했습니다.";

      if (err.response) {
        console.error("서버 응답 오류:", err.response.data);
        console.error("상태 코드:", err.response.status);
        console.error("응답 헤더:", err.response.headers);

        if (err.response.status === 404) {
          errorMessage =
            "API 엔드포인트를 찾을 수 없습니다. 서버 설정을 확인해주세요.";
        } else if (err.response.status === 400) {
          errorMessage = "잘못된 요청입니다. 음식명을 확인해주세요.";
        } else if (err.response.status === 500) {
          errorMessage = "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
        } else {
          errorMessage = `서버 오류 (${err.response.status}): ${
            err.response.data?.message || err.response.data || "알 수 없는 오류"
          }`;
        }
      } else if (err.request) {
        console.error("네트워크 오류:", err.request);
        errorMessage =
          "서버에 연결할 수 없습니다. 네트워크 연결과 서버 상태를 확인해주세요.";
      } else {
        console.error("요청 설정 오류:", err.message);
        errorMessage = `요청 설정 오류: ${err.message}`;
      }

      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // 🔥 음식 카드 클릭 핸들러 추가
  const handleFoodCardClick = (index) => {
    setSelectedFoodIndex(selectedFoodIndex === index ? null : index);
  };

  // 🔥 개선된 AI 백엔드 통신 함수로 교체
  const sendImageToBackend = async (file, index) => {
    // 파일 유효성 검사 추가
    if (!file || file.size === 0) {
      console.error("유효하지 않은 파일입니다:", file);
      alert("유효한 이미지 파일을 선택해주세요.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setIsLoading(true);
      // 🔥 환경변수 사용으로 변경
      const AI_API_URL =
        import.meta.env.VITE_AI_API_URL || "http://localhost:8000";

      console.log("📤 API 요청 정보:", {
        url: `${AI_API_URL}/api/food/analyze`,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
      });

      const res = await axios.post(`${AI_API_URL}/api/food/analyze`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        timeout: 30000, // 30초 타임아웃 추가
      });

      console.log("전체 응답:", res.data);

      if (res.data.success) {
        const result = res.data.result;
        console.log("분석 결과:", result);

        // 🔥 배열 형태의 결과 처리
        let foodDataArray = [];
        if (Array.isArray(result)) {
          // 배열인 경우 각 음식을 개별 데이터로 변환
          foodDataArray = result.map((food, index) => {
            console.log(`🔍 음식 ${index + 1} 원본 데이터:`, food);
            const foodData = {
              name: food.foodName || "알 수 없음",
              calories: food.calories || 0,
              carbohydrate: food.carbohydrate || 0,
              protein: food.protein || 0,
              fat: food.fat || 0,
              sodium: food.sodium || 0,
              fiber: food.fiber || 0,
              gram: food.totalAmount || "알 수 없음",
              foodCategory: food.foodCategory || "알 수 없음",
            };
            console.log(`🔍 음식 ${index + 1} 변환된 데이터:`, foodData);
            return foodData;
          });
        } else {
          // 단일 객체인 경우
          console.log("🔍 단일 음식 원본 데이터:", result);
          const foodData = {
            name: result.foodName || "알 수 없음",
            calories: result.calories || 0,
            carbohydrate: result.carbohydrate || 0,
            protein: result.protein || 0,
            fat: result.fat || 0,
            sodium: result.sodium || 0,
            fiber: result.fiber || 0,
            gram: result.totalAmount || "알 수 없음",
            foodCategory: result.foodCategory || "알 수 없음",
          };
          console.log("🔍 단일 음식 변환된 데이터:", foodData);
          foodDataArray = [foodData];
        }

        // 기존 데이터에 새로운 음식들 추가
        setResultData((prev) => {
          // 기존 배열에 새로운 음식들을 추가
          return [...prev, ...foodDataArray];
        });
      } else {
        console.error("분석 실패:", res.data.error);
        alert(`이미지 분석에 실패했습니다: ${res.data.error}`);
      }
    } catch (err) {
      console.error("이미지 분석 실패:", err);

      // 🔥 더 자세한 오류 정보 제공
      let errorMessage = "이미지 분석 중 오류가 발생했습니다.";

      if (err.response) {
        // 서버에서 응답이 왔지만 오류 상태인 경우
        console.error("서버 응답 오류:", err.response.data);
        console.error("상태 코드:", err.response.status);

        if (err.response.status === 400) {
          errorMessage = "잘못된 요청입니다. 이미지 파일을 확인해주세요.";
        } else if (err.response.status === 413) {
          errorMessage =
            "파일 크기가 너무 큽니다. 더 작은 이미지를 사용해주세요.";
        } else if (err.response.status === 415) {
          errorMessage =
            "지원하지 않는 파일 형식입니다. JPG, PNG 파일을 사용해주세요.";
        } else if (err.response.status === 500) {
          errorMessage = "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
        } else {
          errorMessage = `서버 오류 (${err.response.status}): ${
            err.response.data?.message || err.response.data || "알 수 없는 오류"
          }`;
        }
      } else if (err.request) {
        // 요청은 보냈지만 응답을 받지 못한 경우
        console.error("네트워크 오류:", err.request);
        errorMessage =
          "서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.";
      } else {
        // 요청 설정 중 오류가 발생한 경우
        console.error("요청 설정 오류:", err.message);
        errorMessage = `요청 설정 오류: ${err.message}`;
      }

      alert(errorMessage);
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
      foodName: data["음식명"] || "알 수 없음",
      calories: get("칼로리"),
      carbohydrate: get("탄수화물"),
      protein: get("단백질"),
      fat: get("지방"),
      sugar: get("당류"),
      sodium: get("나트륨"),
      fiber: get("식이섬유"),
      totalAmount: text.match(/총량:\s*(.+)/)?.[1] || "알 수 없음",
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

    // 🔥 식사 타입 매핑 추가
    const mealTypeMap = {
      아침: "BREAKFAST",
      점심: "LUNCH",
      저녁: "DINNER",
      간식: "SNACK",
      BREAKFAST: "BREAKFAST",
      LUNCH: "LUNCH",
      DINNER: "DINNER",
      SNACK: "SNACK",
    };

    // 🔥 디버깅을 위한 로그 추가
    console.log("🔍 resultData 확인:", resultData);

    // foods 배열 생성
    const foods = resultData.map((food) => {
      const foodData = {
        foodName: food.name,
        calories: food.calories || 0,
        carbohydrate: food.carbohydrate || 0,
        protein: food.protein || 0,
        fat: food.fat || 0,
        sodium: food.sodium || 0,
        fiber: food.fiber || 0,
        gram: food.gram || "알 수 없음",
        foodCategory: categoryMap[food.foodCategory] || "ETC", // 🔥 카테고리 매핑
      };

      return foodData;
    });

    // 🔥 백엔드 API 호출 시 memo 포함
    const mealData = {
      mealType: mealTypeMap[selectedMeal] || "정보 없음",
      imageUrl: "",
      memo: memo || "", // 🔥 메모 추가
      foods: foods,
      modifiedAt: modifiedAtStr,
      totalCalories: parseInt(totalNutrition.kcal) || 0,
      totalCarbs: parseInt(totalNutrition.carbs) || 0,
      totalProtein: parseInt(totalNutrition.protein) || 0,
      totalFat: parseInt(totalNutrition.fat) || 0,
      // 🔥 사용자 체중 정보 추가
      recordWeight:
        currentUser && currentUser.weight ? currentUser.weight : null,
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
            className="relative bg-gray-200 h-60 sm:h-64 md:h-82 rounded-xl flex items-center justify-center mb-6 cursor-pointer"
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
              multiple // ✅ 이거 추가
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
        <div className="overflow-x-auto mb-8 pt-1 scroll-smooth">
          <div className="flex gap-4 w-max px-1 pb-2 min-w-full">
            {/* 음식 추가 버튼 */}
            <div
              className={`min-w-[44px] h-56 bg-purple-500 rounded-xl flex items-center justify-center text-white text-2xl ${
                resultData && resultData.length > 0
                  ? "cursor-pointer"
                  : "cursor-not-allowed opacity-50"
              }`}
              onClick={() => {
                if (resultData && resultData.length > 0) {
                  setShowImageChoiceModal(true);
                }
                // resultData가 없으면 아무 동작도 하지 않음 (파일 선택도 X)
              }}
            >
              +
            </div>
            {/* 이미지 선택/입력 모달 */}
            {showImageChoiceModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                <div className="bg-white rounded-xl p-6 w-80 shadow-lg flex flex-col gap-4">
                  <h3 className="text-lg font-bold mb-2 text-center">
                    이미지가 이미 있습니다
                  </h3>
                  <p className="text-center text-gray-600 mb-4">
                    음식을 추가하려면 기존 이미지를 삭제하거나, 아래에서
                    선택하세요.
                  </p>
                  <button
                    className="btn btn-primary w-full"
                    onClick={() => {
                      setShowImageChoiceModal(false);
                      handleImageClick(); // 파일에서 선택
                    }}
                  >
                    파일에서 선택하기
                  </button>
                  <button
                    className="btn btn-secondary w-full"
                    onClick={() => {
                      setShowImageChoiceModal(false);
                      // 입력하기 로직 (예: URL 입력 등)
                      setShowImageInputModal(true);
                    }}
                  >
                    직접 입력하기
                  </button>
                  <button
                    className="btn w-full mt-2"
                    onClick={() => setShowImageChoiceModal(false)}
                  >
                    취소
                  </button>
                </div>
              </div>
            )}
            {/* 직접 입력 모달 예시 */}
            {showImageInputModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                <div className="bg-white rounded-xl p-6 w-80 shadow-lg flex flex-col gap-4">
                  <h3 className="text-lg font-bold mb-2 text-center">
                    음식명 입력
                  </h3>
                  <input
                    type="text"
                    className="input input-bordered w-full"
                    placeholder="음식명을 입력하세요"
                    value={imageInputUrl}
                    onChange={(e) => setImageInputUrl(e.target.value)}
                  />
                  <button
                    className="btn btn-primary w-full"
                    onClick={async () => {
                      if (imageInputUrl) {
                        await handleFoodNameInput(imageInputUrl);
                      }
                    }}
                  >
                    추가하기
                  </button>
                  <button
                    className="btn w-full mt-2"
                    onClick={() => {
                      setShowImageInputModal(false);
                      setImageInputUrl("");
                    }}
                  >
                    취소
                  </button>
                </div>
              </div>
            )}

            {/* 🔥 음식 카테고리 아이콘 카드 */}
            {resultData.map((food, i) => (
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
                    onClick={(e) => {
                      e.stopPropagation(); // 🔥 이벤트 버블링 방지
                      handleRemoveImage(i);
                    }}
                    className="absolute top-2 right-2 bg-black/40 text-white rounded-full w-6 h-6 flex items-center justify-center cursor-pointer"
                  >
                    ×
                  </button>
                </div>
                <div className="flex items-center gap-1 mt-2">
                  <p className="text-sm font-medium text-center">
                    {food.name || "요리명"}
                  </p>
                  <p className="text-sm text-gray-600">
                    ({food.foodCategory || "카테고리 없음"})
                  </p>
                </div>
                {/* 칼로리 정보 추가 */}
                {/* <p className="text-xs text-purple-500 mt-1">
                  {food.calories || 0} kcal
                </p> */}
              </div>
            ))}
          </div>
        </div>

        {/* 🔥 이미지별 분석 결과는 아래쪽에 세로로 나열 - 필터링 적용 */}
        {selectedFoodIndex !== null && resultData[selectedFoodIndex] && (
          <div
            key={selectedFoodIndex}
            className="p-4 mb-5 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1)]"
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xl font-bold">
                  {resultData[selectedFoodIndex].name || "요리명"}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {resultData[selectedFoodIndex].gram || "총량 정보 없음"}g
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

            {/* 영양소 정보 추가 */}
            <div className="mt-4 bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-green-600">칼로리</span>
                  <div className="font-bold">
                    {resultData[selectedFoodIndex].calories || 0} kcal
                  </div>
                </div>
                <div>
                  <span className="text-green-600">탄수화물</span>
                  <div className="font-bold">
                    {resultData[selectedFoodIndex].carbohydrate || 0}g
                  </div>
                </div>
                <div>
                  <span className="text-yellow-600">단백질</span>
                  <div className="font-bold">
                    {resultData[selectedFoodIndex].protein || 0}g
                  </div>
                </div>
                <div>
                  <span className="text-red-600">지방</span>
                  <div className="font-bold">
                    {resultData[selectedFoodIndex].fat || 0}g
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm mt-2">
                <div>
                  <span className="text-blue-600">나트륨</span>
                  <div className="font-bold">
                    {resultData[selectedFoodIndex].sodium || 0}mg
                  </div>
                </div>
                <div>
                  <span className="text-orange-600">식이섬유</span>
                  <div className="font-bold">
                    {resultData[selectedFoodIndex].fiber || 0}g
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 🔥 사용자 정보 표시 */}
        {currentUser && (currentUser.weight || currentUser.height) && (
          <>
            <div className="rounded-xl pt-7 pr-7 pb-3 ps-0">
              <div className="flex justify-between font-bold text-2xl ">
                <h2 className="text-lg sm:text-xl font-semibold">
                  사용자 정보
                </h2>
              </div>
            </div>
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-4">
                {currentUser.weight && (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">현재 체중:</span>
                    <span className="font-bold text-purple-500">
                      {currentUser.weight} kg
                    </span>
                  </div>
                )}
                {currentUser.height && (
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
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            rows={2}
          />
        </div>

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
