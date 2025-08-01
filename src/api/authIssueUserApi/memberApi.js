// import axios from "./axiosInstance";
import axios from "./axiosInstance";
const API_BASE = import.meta.env.VITE_BACKEND_URL;

// axios 기본 설정
const axiosConfig = {
  // withCredentials는 axiosInstance에서 이미 설정됨
};

// 회원 가입 (multipart: data + profileImage)
export const signupMember = async (memberData, profileImage) => {
  const formData = new FormData();
  formData.append(
    "data",
    new Blob([JSON.stringify(memberData)], { type: "application/json" })
  );
  if (profileImage) {
    formData.append("profileImage", profileImage);
  }
  return axios.post(`${API_BASE}/multipart`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
    ...axiosConfig,
  });
};

// 로그인 (cookie-based)
export const loginMember = async (loginParam) => {
  const header = {
    headers: {
      "Content-Type": "x-www-form-urlencoded",
    },
  };

  const formData = new FormData();
  formData.append("nickname", loginParam.nickname);
  formData.append("password", loginParam.password);

  const response = await axios.post(
    API_BASE + "/api/members/login",
    formData,
    header
  );

  // 출력이 안되므로 아래 코드로 변경
  // console.log(API_BASE);

  return response;
};

// 로그아웃 (cookie-based)
export const logoutMember = async () => {
  try {
    console.log("📡 Calling backend logout endpoint...");
    const response = await axios.post(`${API_BASE}/logout`, {}, axiosConfig);
    console.log("✅ Backend logout response:", response.status);
    return response;
  } catch (error) {
    console.error(
      "❌ Backend logout error:",
      error.response?.status,
      error.response?.data
    );
    // Don't throw the error - let the frontend continue with logout
    // The backend might not have a logout endpoint yet
    return null;
  }
};

// 현재 로그인된 사용자 정보 가져오기
// export const fetchCurrentMember = async () => {
//   const res = await axios.get(`${API_BASE}/me`, axiosConfig);
//   return res.data;
// };

// 🔥 Redux에서 토큰 가져오기 위한 import 추가
// import store from "../../store/store"; // 🔥 올바른 경로로 수정 (default import)

// 프로필 이미지 변경 - 기존 정상 작동하는 엔드포인트 활용
export const updatePhoto = async (photoUrl) => {
  try {
    console.log(
      "🔥 프로필 이미지 URL 업데이트 (기존 엔드포인트 활용):",
      photoUrl
    );

    // 🔥 정상 작동하는 /me 엔드포인트 사용
    const response = await axios.put(`/api/members/me`, {
      profileImageUrl: photoUrl, // DTO 필드명에 맞춤
    });

    console.log("✅ 프로필 이미지 업데이트 성공:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ 프로필 이미지 업데이트 실패:", error);
    throw error;
  }
};

// 회원 탈퇴 (내 계정)
export const deleteAccount = async () => {
  return axios.delete(`${API_BASE}/me`, axiosConfig).then((res) => res.data);
};

// 이메일 중복 확인
export const checkEmailExists = async (email) => {
  return axios.get(`${API_BASE}/check-email`, {
    params: { email },
    ...axiosConfig,
  });
};

// 닉네임 중복 확인
export const checkNicknameExists = async (nickname) => {
  return axios.get(`${API_BASE}/check-nickname`, {
    params: { nickname },
    ...axiosConfig,
  });
};

// 닉네임 찾기 (이름+이메일)
export const searchNickname = async (form) => {
  return axios.post(`${API_BASE}/search-nickname`, form, axiosConfig);
};

// 비밀번호 재설정 요청
export const requestPasswordReset = async ({ name, email }) => {
  return axios.post(`${API_BASE}/reset-password`, { name, email }, axiosConfig);
};

// 프로필 정보 수정 (general profile update without image)
export const updateProfile = async (profileData) => {
  console.log("Profile update requested:", profileData);

  try {
    // Use axios (which is your configured axiosInstance)
    const response = await axios.put(`/api/members/me`, profileData, {
      headers: {
        "Content-Type": "application/json",
      },
      ...axiosConfig,
    });

    console.log("✅ Profile update successful:", response.data);
    return response.data;
  } catch (error) {
    console.error("Profile update error:", error);

    if (error.response?.status === 405) {
      alert(
        "프로필 수정 기능이 백엔드에서 아직 구현되지 않았습니다.\n\n" +
          "백엔드 개발자에게 다음 사항을 요청해주세요:\n" +
          "• MemberController에 PUT /api/members/me 엔드포인트 추가\n" +
          "• 프로필 업데이트 서비스 메서드 구현\n\n" +
          "Spring 로그: 'Request method PUT is not supported'"
      );
    } else if (error.response?.status === 401) {
      alert("인증이 필요합니다. 다시 로그인해주세요.");
    } else if (error.response?.status === 403) {
      alert("접근 권한이 없습니다.");
    } else {
      const message =
        error.response?.data?.message || "프로필 수정에 실패했습니다.";
      alert(message);
    }

    throw error;
  }
};

// 회원 정보 수정 (multipart: data + profileImage)
export const updateMemberWithImage = async (id, memberData, profileImage) => {
  console.log("Profile update with image requested:", {
    id,
    memberData,
    hasImage: !!profileImage,
  });

  const formData = new FormData();
  formData.append(
    "data",
    new Blob([JSON.stringify(memberData)], { type: "application/json" })
  );
  if (profileImage) {
    formData.append("profileImage", profileImage);
  }

  try {
    // Use axios (which is your configured axiosInstance)
    const response = await axios.put(`/api/members/${id}/multipart`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      ...axiosConfig,
    });

    console.log("✅ Profile update with image successful:", response.data);
    return response.data;
  } catch (error) {
    console.error("Profile update with image error:", error);

    if (error.response?.status === 401) {
      alert("인증이 필요합니다. 다시 로그인해주세요.");
    } else if (error.response?.status === 403) {
      alert("접근 권한이 없습니다.");
    } else if (error.response?.status === 404) {
      alert("회원을 찾을 수 없습니다.");
    } else {
      const message =
        error.response?.data?.message || "프로필 수정에 실패했습니다.";
      alert(message);
    }

    throw error;
  }
};
