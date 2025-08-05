import axios from "axios";

const instance = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL || "http://localhost:8080",
  withCredentials: true, // 🔥 This enables cookies to be sent with requests
});

// ✅ Simplified request interceptor - no manual token handling needed
instance.interceptors.request.use((config) => {
  console.log("🔍 Axios interceptor - URL:", config.url);
  console.log(
    "🔍 Axios interceptor - withCredentials:",
    config.withCredentials
  );

  // Cookies will be sent automatically with withCredentials: true
  // No need to manually set Authorization header
  return config;
});

// ✅ Simplified response interceptor - handle 401 errors
instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    console.error(
      "🔍 Axios response error:",
      error.response?.status,
      error.response?.data
    );

    // Log detailed error information for debugging
    if (error.response) {
      console.error("❌ Response error details:", {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        headers: error.response.headers,
        url: error.config?.url,
        method: error.config?.method,
      });
    } else if (error.request) {
      console.error("❌ Request error (no response):", {
        request: error.request,
        message: error.message,
      });
    } else {
      console.error("❌ Error setting up request:", error.message);
    }

    // 🔥 401 에러 처리 수정 - 자동 리다이렉트 제거
    if (error.response?.status === 401) {
      console.log("❌ Authentication failed - 401 error");

      // 🔥 자동 리다이렉트 제거, 로그만 출력
      console.warn(
        "⚠️ 401 에러 발생: 인증이 필요합니다. 수동으로 로그인을 확인해주세요."
      );

      // 자동 localStorage 클리어도 제거 (필요시 수동으로)
      // localStorage.removeItem("accessToken");
      // localStorage.removeItem("refreshToken");

      // 자동 리다이렉트 제거
      // window.location.href = "/member/login";
    }

    return Promise.reject(error);
  }
);

export default instance;
