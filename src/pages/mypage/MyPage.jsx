// import React from "react";
// import { Link, Outlet, Route, Routes } from "react-router-dom";
// import ProfileSearch from "./ProfileSearch";
// import EditProfile from "./EditProfile";
// import WithDrawMembership from "./WithdrawMembership";
// import ChatBot from "../../components/chatbot/ChatBot";

import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import InfoList from "../../components/mypage/InfoList";
import ProfileImage from "../../components/mypage/ProfileImage";
import SubLayout from "../../layout/SubLayout";
// import { fetchCurrentMember } from "../../api/authIssueUserApi/memberApi"; // 🔥 제거
//import useLogout from "../../utils/memberJwtUtil/useLogout";
import calculateCalories from "../../components/mypage/calculateCalories";
// 🔥 이 import들 제거
// import {
//   editProfile,
//   updatePhoto as updatePhotoRedux,
// } from "../../slices/loginSlice";
//import { uploadProfileImageWithCleanup } from "../../utils/imageUpload/uploadImageToSupabase";
import { updatePhoto } from "../../api/authIssueUserApi/memberApi";

export default function MyPage() {
  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state.login); // 🔥 수정: .user 제거
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(false); // 🔥 true → false로 변경
  const [previewImage, setPreviewImage] = useState(null);
  // const logout = useLogout(); // 🔥 제거

  // Debug: Log current user data
  console.log("MyPage - Current user data:", currentUser);
  console.log("MyPage - Photo URL:", currentUser?.photo);

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
        // 🔥 백엔드 API 호출하여 프로필 이미지 URL 업데이트
        await updatePhoto(imageUrl);

        // 🔥 Redux 상태 업데이트 (만약 loginSlice에 updatePhoto 액션이 있다면)
        // dispatch(updatePhoto(imageUrl));

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
    // <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
    //   <nav className="flex flex-col sm:flex-row justify-around sm:justify-start gap-4 sm:gap-10 mb-6  pb-4  font-semibold text-lg">
    //     <Link to="profile" className="hover:text-blue-600"></Link>
    //     <Link to="edit" className="hover:text-blue-600"></Link>
    //     <Link to="withdraw" className="hover:text-red-600"></Link>
    //   </nav> *
    //   <div className="bg-white p-6 sm:p-10 shadow-md rounded-xl">
    //     <Outlet />
    //     {/* 챗봇 */}
    //     <ChatBot />

    <div className="w-full max-w-[1020px] mx-auto px-4">
      <SubLayout to="/" menu="마이페이지" label="내 정보" />

      <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
        <div className="space-y-8">
          {/* Profile Section */}
          <div className="flex flex-col items-center space-y-4">
            <ProfileImage
              photo={currentUser.photo}
              currentImage={currentUser.photo}
              nickname={currentUser.nickname}
              onImageChange={handleImageChange}
              size="large"
            />
            <h2 className="text-2xl font-bold">{currentUser.nickname}</h2>
            <p className="text-gray-600">{currentUser.email}</p>
          </div>

          {/* User Info Section */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">기본 정보</h3>
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
                {
                  label: "추천 칼로리",
                  value: recommendedCalories
                    ? `${recommendedCalories} kcal`
                    : "계산 불가",
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
