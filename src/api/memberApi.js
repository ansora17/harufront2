import axios from "axios";
const API_BASE = import.meta.env.VITE_BACKEND_URL;

// 로그인 (cookie-based)
export const loginPost = async (loginParam) => {
  const header = {
    headers: {
      "Content-Type": "x-www-form-urlencoded",
    },
  };

  const formData = new FormData();
  formData.append("nickname", loginParam.nickname);
  formData.append("password", loginParam.password);

  const response = await axios.post(
    `${API_BASE}/api/members/login`,
    formData,
    header
  );

  // 🔍 로그인 응답 디버깅
  console.log("🔐 로그인 API 응답 확인:");
  console.log("  - 전체 응답:", response.data);
  console.log("  - photo 필드:", response.data?.photo);
  console.log("  - profileImageUrl 필드:", response.data?.profileImageUrl);
  console.log(
    "  - 이미지 관련 모든 필드:",
    Object.keys(response.data || {}).filter(
      (key) =>
        key.toLowerCase().includes("image") ||
        key.toLowerCase().includes("photo")
    )
  );

  return response.data;
};

export const updateProfileImage = async (id, profileImageUrl) => {
  console.log("🔥 프로필 이미지 URL 업데이트:", profileImageUrl);
  console.log("🔍 사용자 ID:", id);

  // 🔥 성공한 테스트 방식: {"profileImageUrl":"img11.jpg"}
  const updateData = {
    profileImageUrl: profileImageUrl,
  };

  console.log("📤 전송할 데이터:", updateData);

  try {
    const response = await axios.put(
      `${API_BASE}/api/members/${id}`,
      updateData,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ 프로필 이미지 업데이트 성공:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ 프로필 이미지 업데이트 실패:", error);
    console.error("❌ 에러 상세:", error.response?.data);
    throw error;
  }
};
