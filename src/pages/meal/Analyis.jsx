import React, { useRef, useState, useEffect } from "react";
import SubLayout from "../../layout/SubLayout";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import supabase from "../../utils/supabases";
import {
  setSelectedDate,
  fetchDailyMealRecordsThunk,
  saveMealRecordThunk,
  setSelectedMeal,
} from "../../slices/mealSlice";
import axios from "axios";

function Analyis() {
  const fileInputRef = useRef(null);
  const fileAlbumInputRef = useRef(null);
  const [showImageSourceModal, setShowImageSourceModal] = useState(false);
  const [timestamp, setTimestamp] = useState(null);
  const selectedMeal = useSelector((state) => state.meal.selectedMeal);
  const [resultData, setResultData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [images, setImages] = useState([]);
  const mealRecords = useSelector((state) => state.meal.mealRecords);
  const { isLoading: isSaving } = useSelector((state) => state.meal); // 저장 로딩 상태
  const dispatch = useDispatch();
  const [memo, setMemo] = useState("");
  // 🔥 체중 입력을 위한 상태 추가
  const [recordWeight, setRecordWeight] = useState("");
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
  const navigate = useNavigate(); // 🔥 페이지 이동을 위한 navigate 추가
  console.log("Current user data:", currentUser);

  useEffect(() => {
    setTimestamp(new Date());
  }, []);

  // 로그인 체크
  // if (!isLoggedIn) {
  //   return (
  //     <div className="text-center py-8">
  //       <p className="text-red-500">로그인이 필요한 서비스입니다.</p>
  //     </div>
  //   );
  // }

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

  // 🔥 음식만 삭제하는 함수 (이미지는 유지)
  const handleRemoveFood = (index) => {
    console.log("🍽️ 음식 삭제:", index);

    // 음식 데이터만 삭제 (이미지는 유지)
    setResultData((prev) => prev.filter((_, i) => i !== index));

    // 🔥 선택된 음식이 제거되면 선택 상태 초기화
    if (selectedFoodIndex === index) {
      setSelectedFoodIndex(null);
    } else if (selectedFoodIndex > index) {
      setSelectedFoodIndex(selectedFoodIndex - 1);
    }
  };

  // 🔥 이미지 전체 삭제하는 함수 (기존 함수명 유지)
  const handleRemoveImage = (index) => {
    console.log("🖼️ 이미지 전체 삭제:", index);
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

      // 🔥 새로운 텍스트 분석 API 호출  // import.meta.env.VITE_AI_API_URL ||
      const AI_API_URL = import.meta.env.VITE_PYTHON_URL;

      // console.log("📤 텍스트 분석 API 요청:", {
      //   url: `${AI_API_URL}/api/meals/analyze-food-text`,
      //   foodName: foodName,
      //   env: import.meta.env.VITE_AI_API_URL ? "설정됨" : "기본값 사용",
      // });

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
          quantity:
            result.quantity && result.quantity > 0 ? result.quantity : 1, // 🔥 quantity가 0이거나 없으면 1로 설정
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
            console.log(
              `🔍 음식 ${index + 1} AI API에서 받은 quantity:`,
              food.quantity
            );
            const foodData = {
              name: food.foodName || "알 수 없음",
              calories: food.calories || 0,
              carbohydrate: food.carbohydrate || 0,
              protein: food.protein || 0,
              fat: food.fat || 0,
              sodium: food.sodium || 0,
              fiber: food.fiber || 0,
              gram: food.totalAmount || "알 수 없음",
              quantity: food.quantity && food.quantity > 0 ? food.quantity : 1, // 🔥 quantity가 0이거나 없으면 1로 설정
              foodCategory: food.foodCategory || "알 수 없음",
            };
            console.log(`🔍 음식 ${index + 1} 변환된 데이터:`, foodData);
            return foodData;
          });
        } else {
          // 단일 객체인 경우
          console.log("🔍 단일 음식 원본 데이터:", result);
          console.log(
            "🔍 단일 음식 AI API에서 받은 quantity:",
            result.quantity
          );
          const foodData = {
            name: result.foodName || "알 수 없음",
            calories: result.calories || 0,
            carbohydrate: result.carbohydrate || 0,
            protein: result.protein || 0,
            fat: result.fat || 0,
            sodium: result.sodium || 0,
            fiber: result.fiber || 0,
            gram: result.totalAmount || "알 수 없음",
            quantity:
              result.quantity && result.quantity > 0 ? result.quantity : 1, // 🔥 quantity가 0이거나 없으면 1로 설정
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

  // 🔥 이미지를 Supabase에 업로드하는 함수 (ProfileImage.jsx 참고)
  const uploadImageToSupabase = async (file) => {
    try {
      console.log("🔥 Supabase 업로드 시작:", file.name);

      // 🔥 단순한 파일명 생성 (ProfileImage.jsx와 동일한 방식)
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}_${Math.random()
        .toString(36)
        .substring(2)}.${fileExt}`;
      const filePath = `meal-images/${fileName}`;

      console.log("📁 파일 경로:", filePath);

      // 🔥 Supabase Storage에 업로드 (ProfileImage.jsx와 동일한 방식)
      const { data, error } = await supabase.storage
        .from("harukcal")
        .upload(filePath, file);

      if (error) {
        console.error("❌ 업로드 에러:", error);
        throw error;
      }

      // 🔥 공개 URL 가져오기 (ProfileImage.jsx와 동일한 방식)
      const { data: urlData } = supabase.storage
        .from("harukcal")
        .getPublicUrl(filePath);

      const publicUrl = urlData.publicUrl;
      console.log("✅ 업로드 성공, URL:", publicUrl);

      return publicUrl;
    } catch (error) {
      console.error("❌ 업로드 중 에러:", error);
      throw error;
    }
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
    const foods = resultData.map((food, index) => {
      console.log(`🔍 음식 ${index + 1} 원본 데이터:`, food);
      console.log(`🔍 음식 ${index + 1} quantity 값:`, food.quantity);

      // quantity가 0, undefined, null이면 1로 설정
      const quantity = food.quantity && food.quantity > 0 ? food.quantity : 1;
      console.log(`🔍 음식 ${index + 1} 최종 quantity 값:`, quantity);

      const foodData = {
        foodName: food.name,
        calories: Math.round((food.calories || 0) * quantity),
        carbohydrate: Math.round((food.carbohydrate || 0) * quantity),
        protein: Math.round((food.protein || 0) * quantity),
        fat: Math.round((food.fat || 0) * quantity),
        sodium: Math.round((food.sodium || 0) * quantity),
        fiber: Math.round((food.fiber || 0) * quantity),
        totalAmount: food.gram || 0, // 🔥 gram을 totalAmount로 매핑
        quantity: quantity, // 🔥 최소 1로 설정된 quantity 값
        foodCategory: categoryMap[food.foodCategory] || "ETC", // 🔥 카테고리 매핑
      };

      console.log("🔍 저장할 음식 데이터:", foodData); // 🔥 디버깅 로그 추가
      return foodData;
    });

    // 🔥 이미지 업로드 처리 (ProfileImage.jsx 참고)
    let imageUrl = "";
    if (images.length > 0 && images[0].file) {
      try {
        console.log("📤 이미지를 Supabase에 업로드 중...");
        console.log("📁 업로드할 파일:", images[0].file.name);
        console.log("📏 파일 크기:", images[0].file.size, "bytes");

        imageUrl = await uploadImageToSupabase(images[0].file);
        console.log("✅ 이미지 업로드 완료:", imageUrl);
      } catch (error) {
        console.error("❌ 이미지 업로드 실패:", error);
        alert(
          "이미지 업로드에 실패했습니다. 식사 기록은 저장되지만 이미지는 포함되지 않습니다."
        );
      }
    } else {
      console.log("ℹ️ 업로드할 이미지가 없습니다.");
    }

    // 🔥 백엔드 API 호출 시 memo 포함
    const mealData = {
      mealType: mealTypeMap[selectedMeal] || "정보 없음",
      imageUrl: imageUrl, // 🔥 Supabase에서 받은 이미지 URL
      memo: memo || "", // 🔥 메모 추가
      foods: foods,
      modifiedAt: modifiedAtStr,
      totalCalories: parseInt(totalNutrition.kcal) || 0,
      totalCarbs: parseInt(totalNutrition.carbs) || 0,
      totalProtein: parseInt(totalNutrition.protein) || 0,
      totalFat: parseInt(totalNutrition.fat) || 0,
      // 🔥 사용자 체중 정보 추가
      recordWeight: recordWeight ? parseFloat(recordWeight) : null,
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
      navigate("/dashboard");

      // 🔥 폼 초기화
      setImages([]);
      setResultData([]);
      setMemo(""); // 메모도 초기화
      setRecordWeight(""); // 체중 입력 필드도 초기화
      setTimestamp(new Date());
    } catch (error) {
      console.error("❌ 식사 저장 실패:", error);
      alert("식사 기록 저장에 실패했습니다: " + error);
    }
  };

  return (
    <>
      <SubLayout to={"/"} menu={"식단분석"} label={"식사요약"} />
      <div className="w-full max-w-[1020px] mx-auto px-4 py-4 pb-28">
        {/* 날짜 / 시간 / 식사타입 */}
        <div className="flex flex-row sm:flex-row gap-2 mb-4">
          <input
            type="date"
            value={timestamp ? timestamp.toISOString().split("T")[0] : ""}
            onChange={(e) => {
              const newDate = new Date(e.target.value);
              if (timestamp) {
                newDate.setHours(timestamp.getHours());
                newDate.setMinutes(timestamp.getMinutes());
              }
              setTimestamp(newDate);
            }}
            placeholder="날짜를 입력해 주세요"
            className="input input-bordered flex-1 text-center"
          />
          <input
            type="time"
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
            onChange={(e) => {
              if (timestamp) {
                const [hours, minutes] = e.target.value.split(":");
                const newDate = new Date(timestamp);
                newDate.setHours(parseInt(hours));
                newDate.setMinutes(parseInt(minutes));
                setTimestamp(newDate);
              }
            }}
            placeholder="시간을 입력해 주세요"
            className="input input-bordered flex-1 text-center"
          />
          <select
            value={selectedMeal || ""}
            onChange={(e) => dispatch(setSelectedMeal(e.target.value))}
            className="input input-bordered flex-1 text-center"
          >
            <option value="">식사 타입 선택</option>
            <option value="BREAKFAST">아침</option>
            <option value="LUNCH">점심</option>
            <option value="DINNER">저녁</option>
            <option value="SNACK">간식</option>
          </select>
        </div>

        <div className="border-b border-gray-300">
          {/* 이미지 업로드 */}
          {/* 이미지 업로드 (모바일: 카메라/앨범 선택 모달) */}
          <div
            className="relative bg-gray-200 h-60 sm:h-64 md:h-92 rounded-xl flex items-center justify-center mb-6 cursor-pointer"
            onClick={() => {
              // 모바일 환경 감지
              const isMobile =
                /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
                  navigator.userAgent
                );
              if (isMobile) {
                setShowImageSourceModal(true);
              } else {
                handleImageClick();
              }
            }}
          >
            {images.length > 0 ? (
              <>
                <img
                  src={images[0].url}
                  alt="업로드된 이미지"
                  className="object-cover w-full h-full rounded-xl"
                />
                {resultData[0]?.name && (
                  <div className="absolute top-4 left-4 bg-purple-500/70 text-white text-xl font-bold px-4 py-2 rounded-full">
                    {resultData[0].name}
                  </div>
                )}
                {/* 🔥 이미지 전체 삭제 버튼 */}
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // 이벤트 버블링 방지
                    if (
                      confirm("이미지와 모든 음식 정보를 삭제하시겠습니까?")
                    ) {
                      handleRemoveImage(0); // 첫 번째 이미지 삭제
                    }
                  }}
                  className="absolute top-4 right-4 text-white rounded-full flex items-center justify-center cursor-pointer"
                  title="이미지 전체 삭제"
                >
                  <img src="/images/Trash.png" alt="" />
                </button>
              </>
            ) : (
              <span className="text-4xl text-gray-400">＋</span>
            )}

            {/* 실제 파일 input 2개 (카메라/앨범용) */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              capture="environment"
              onChange={handleImageChange}
              className="hidden"
              multiple
            />
            <input
              type="file"
              ref={fileAlbumInputRef}
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
              multiple
            />

            {/* 카메라/앨범 선택 모달 */}
            {showImageSourceModal && (
              <div
                className="fixed inset-0 z-50 flex items-end justify-center bg-black/40"
                onClick={() => setShowImageSourceModal(false)}
              >
                <div
                  className="bg-white w-full max-w-xs rounded-t-2xl p-6 pb-4 flex flex-col gap-3"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    className="w-full py-3 rounded-xl bg-purple-500 text-white font-bold text-lg mb-2"
                    onClick={() => {
                      setShowImageSourceModal(false);
                      // 카메라 input 클릭
                      fileInputRef.current && fileInputRef.current.click();
                    }}
                  >
                    카메라로 촬영
                  </button>
                  <button
                    className="w-full py-3 rounded-xl bg-gray-200 text-gray-800 font-bold text-lg"
                    onClick={() => {
                      setShowImageSourceModal(false);
                      // 앨범 input 클릭
                      fileAlbumInputRef.current &&
                        fileAlbumInputRef.current.click();
                    }}
                  >
                    앨범에서 선택
                  </button>
                  <button
                    className="w-full py-2 text-gray-500 mt-2"
                    onClick={() => setShowImageSourceModal(false)}
                  >
                    취소
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 총 섭취량 */}
          <div className="bg-gray-100 rounded-xl p-7 pb-7 mb-6">
            <div className="flex justify-between font-bold text-lg sm:text-lg text-base mb-6 px-4 sm:px-10">
              <h2 className="sm:text-lg text-base">총 섭취량</h2>
              <div className="flex items-end">
                <p className="sm:text-lg text-base">
                  {totalNutrition.kcal || 0}
                </p>
                <span className="text-purple-500 sm:text-base text-sm ml-1">
                  kcal
                </span>
              </div>
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-4 gap-2 sm:gap-4 text-center sm:text-base text-sm">
              {[
                ["탄수화물", totalNutrition.carbs],
                ["단백질", totalNutrition.protein],
                ["지방", totalNutrition.fat],
                ["나트륨", Math.round((totalNutrition.sodium ?? 0) * 10) / 10],
              ].map(([label, value], i) => (
                <div
                  key={i}
                  className="flex flex-col items-center gap-1 sm:gap-2"
                >
                  <div className="w-14 h-14 sm:w-20 sm:h-20 bg-gray-300 rounded-full flex items-center justify-center font-bold text-base sm:text-lg">
                    {value ?? 0}
                  </div>
                  <span className="sm:text-base text-xs">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-xl pt-7 pr-7 pb-3 ps-0">
          <div className="flex justify-between font-bold text-2xl ">
            <h2 className="text-base sm:text-xl font-semibold">
              음식 정보 수정
            </h2>
          </div>
        </div>

        {/* 음식 카테고리 아이콘 카드 수평 슬라이드 */}
        <div className="overflow-x-auto mb-8 pt-1 scroll-smooth">
          <div className="flex gap-4 w-max px-1 pb-2 min-w-full">
            {/* 음식 추가 버튼 */}
            <div
              className={`min-w-[44px] h-44 bg-purple-500 rounded-xl flex items-center justify-center text-white text-2xl ${
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
                  className={`relative w-[150px] h-[150px] bg-gray-200 rounded-xl flex items-center justify-center cursor-pointer transition-all duration-200 ${
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
                      handleRemoveFood(i); // 🔥 음식만 삭제 (이미지는 유지)
                    }}
                    className="absolute top-2 right-2 bg-black/40 text-white rounded-full w-6 h-6 flex items-center justify-center cursor-pointer hover:bg-black/60 transition-colors"
                    title="이 음식만 삭제"
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
                <button
                  className="w-8 h-8 rounded-full bg-gray-200 text-lg font-bold text-purple-500"
                  onClick={() => {
                    const currentQuantity =
                      resultData[selectedFoodIndex]?.quantity || 1;
                    if (currentQuantity > 1) {
                      const updatedData = [...resultData];
                      updatedData[selectedFoodIndex] = {
                        ...updatedData[selectedFoodIndex],
                        quantity: currentQuantity - 1,
                      };
                      setResultData(updatedData);
                    }
                  }}
                >
                  −
                </button>
                <div className="w-10 h-8 flex items-center justify-center border border-gray-300 rounded-md">
                  {resultData[selectedFoodIndex]?.quantity || 1}
                </div>
                <button
                  className="w-8 h-8 rounded-full bg-gray-200 text-lg font-bold text-purple-500"
                  onClick={() => {
                    const currentQuantity =
                      resultData[selectedFoodIndex]?.quantity || 1;
                    const updatedData = [...resultData];
                    updatedData[selectedFoodIndex] = {
                      ...updatedData[selectedFoodIndex],
                      quantity: currentQuantity + 1,
                    };
                    setResultData(updatedData);
                  }}
                >
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
                    {Math.round(
                      (resultData[selectedFoodIndex].calories || 0) *
                        (resultData[selectedFoodIndex]?.quantity || 1)
                    )}{" "}
                    kcal
                  </div>
                </div>
                <div>
                  <span className="text-green-600">탄수화물</span>
                  <div className="font-bold">
                    {Math.round(
                      (resultData[selectedFoodIndex].carbohydrate || 0) *
                        (resultData[selectedFoodIndex]?.quantity || 1)
                    )}
                    g
                  </div>
                </div>
                <div>
                  <span className="text-yellow-600">단백질</span>
                  <div className="font-bold">
                    {Math.round(
                      (resultData[selectedFoodIndex].protein || 0) *
                        (resultData[selectedFoodIndex]?.quantity || 1)
                    )}
                    g
                  </div>
                </div>
                <div>
                  <span className="text-red-600">지방</span>
                  <div className="font-bold">
                    {Math.round(
                      (resultData[selectedFoodIndex].fat || 0) *
                        (resultData[selectedFoodIndex]?.quantity || 1)
                    )}
                    g
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm mt-2">
                <div>
                  <span className="text-blue-600">나트륨</span>
                  <div className="font-bold">
                    {Math.round(
                      (resultData[selectedFoodIndex].sodium || 0) *
                        (resultData[selectedFoodIndex]?.quantity || 1)
                    )}
                    mg
                  </div>
                </div>
                <div>
                  <span className="text-orange-600">식이섬유</span>
                  <div className="font-bold">
                    {Math.round(
                      (resultData[selectedFoodIndex].fiber || 0) *
                        (resultData[selectedFoodIndex]?.quantity || 1)
                    )}
                    g
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 🔥 사용자 체중 입력 섹션 */}
        <div className="rounded-xl pt-7 pr-7 pb-3 ps-0">
          <div className="flex justify-between font-bold text-2xl ">
            <h2 className="text-base sm:text-xl font-semibold">체중 기록</h2>
          </div>
        </div>
        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-gray-600 font-medium">현재 체중:</span>
              <input
                type="number"
                step="0.1"
                min="0"
                max="300"
                placeholder="체중을 입력하세요"
                value={recordWeight}
                onChange={(e) => {
                  const value = e.target.value;
                  setRecordWeight(value);
                  console.log("체중 입력:", value); // 디버깅용
                }}
                onKeyPress={(e) => {
                  // 숫자와 소수점만 허용
                  if (!/[0-9.]/.test(e.key)) {
                    e.preventDefault();
                  }
                }}
                className="input input-bordered w-32 text-center focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
              <span className="text-gray-600 font-medium">kg</span>
            </div>
            {/* {currentUser && currentUser.height && (
              <div className="flex items-center gap-2">
                <span className="text-gray-600">키:</span>
                <span className="font-bold text-purple-500">
                  {currentUser.height} cm
                </span>
              </div>
            )} */}
          </div>
        </div>

        {/* 🔥 메모 입력 필드 추가 */}
        <div className="rounded-xl pt-7 pr-7 pb-3 ps-0">
          <div className="flex justify-between font-bold text-2xl ">
            <h2 className="text-base sm:text-xl font-semibold">메모</h2>
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
    </>
  );
}

export default Analyis;
