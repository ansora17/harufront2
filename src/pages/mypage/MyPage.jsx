import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import InfoList from "../../components/mypage/InfoList";
import ProfileImage from "../../components/mypage/ProfileImage";
import SubLayout from "../../layout/SubLayout";
import calculateCalories from "../../components/mypage/calculateCalories";
import { updateProfileImage } from "../../api/memberApi";
import { updatePhoto } from "../../slices/loginSlice";
import { getCookie } from "../../utils/cookieUtils";
export default function MyPage() {
  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state.login); // 🔥 수정: .user 제거
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(false); // 🔥 true → false로 변경
  const [previewImage, setPreviewImage] = useState(null);
  // const logout = useLogout(); // 🔥 제거

  // 🔍 실시간 쿠키 상태 확인
  const currentCookie = getCookie("member");

  // Calculate recommended calories
  const recommendedCalories =
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
      : null;

  // Handle profile image upload
  const handleImageChange = async (file, imageUrl) => {
    // 🔥 imageUrl 매개변수 추가
    try {
      setIsLoading(true);

      if (imageUrl) {
        // 🔥 사용자 ID 추출
        const userId =
          currentUser.id || currentUser.memberId || currentUser.userId;

        // 🔥 백엔드 API 호출하여 프로필 이미지 URL 업데이트
        await updateProfileImage(userId, imageUrl);

        // 🔥 Redux 상태 즉시 업데이트 (화면에 바로 반영)
        console.log("🔄 Redux 업데이트 전 상태:", currentUser.profileImageUrl);
        dispatch(updatePhoto(imageUrl));
        console.log("🔄 Redux 상태 업데이트 시도:", imageUrl);

        // 🔥 상태 업데이트 후 잠시 기다린 후 확인
        setTimeout(() => {
          const updatedCookie = getCookie("member");
        }, 500);

        alert("프로필 이미지가 업데이트되었습니다!");
        console.log("✅ 프로필 이미지 업데이트 완료:", imageUrl);
      }
    } catch (error) {
      alert("프로필 사진 업로드에 실패했습니다.");
      console.error("❌ Image upload error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 🔥 useEffect 전체 제거 또는 간소화
  useEffect(() => {
    // 이미 로그인 상태에서 사용자 데이터가 Redux에 있으므로 별도 API 호출 불필요
    setIsLoading(false);
  }, []);

  if (!currentUser) return null;

  return (
    <div className="w-full max-w-[1020px] mx-auto px-4">
      <SubLayout to="/" menu="마이페이지" label="내 정보" />

      <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
        <div className="space-y-8">
          {/* Profile Section */}
          <div className="flex flex-col items-center space-y-1">
            <ProfileImage
              photo={currentUser.profileImageUrl || currentUser.photo}
              currentImage={currentUser.profileImageUrl || currentUser.photo}
              nickname={currentUser.nickname}
              onImageChange={handleImageChange}
              size="large"
            />
            <h2 className="text-2xl font-bold">{currentUser.nickname}</h2>
            <p className="text-gray-600">{currentUser.email}</p>
          </div>

          {/* User Info Section */}
          <div className="space-y-6">
            <InfoList
              items={[
                { label: "이름", value: currentUser.name },
                {
                  label: "성별",
                  value: currentUser.gender === "FEMALE" ? "여성" : "남성",
                },
                { label: "생년월일", value: currentUser.birthAt },
                { label: "키", value: `${currentUser.height} cm` },
                { label: "몸무게", value: `${currentUser.weight} kg` },
                {
                  label: "활동량",
                  value:
                    {
                      HIGH: "매우 활동적",
                      MODERATE: "활동적",
                      LOW: "낮음",
                    }[currentUser.activityLevel] || "활동적",
                },
                {
                  label: "목표 칼로리",
                  value: `${
                    currentUser.targetCalories ||
                    recommendedCalories ||
                    "계산 불가"
                  } kcal`,
                },
              ]}
            />
          </div>

          {/* Actions Section */}
          <div className="flex flex-col sm:flex-row justify-end gap-4">
            <Link
              to="/mypage/edit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 text-center"
            >
              프로필 수정
            </Link>
            {/* 🔥 회원탈퇴 버튼 제거 */}
            {/* <Link
              to="/mypage/withdraw"
              className="px-4 py-2 text-sm font-medium text-red-600 border border-red-600 rounded-md hover:bg-red-50 text-center"
            >
              회원탈퇴
            </Link> */}
          </div>
        </div>
      </div>
    </div>
  );
}
