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
    API_BASE + "/api/members/login",
    formData,
    header
  );

  // 출력이 안되므로 아래 코드로 변경
  // console.log(API_BASE);

  return response.data;
};

export const updateProfileImage = async (id, profileImage) => {
  const formData = new FormData();
  formData.append("profileImage", profileImage);
  return axios.put(`${API_BASE}/${id}/profile-image`, formData);
};
