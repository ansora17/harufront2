import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import FormInput from "../../components/mypage/FormInput";
import FormSelect from "../../components/mypage/FormSelect";
import {
  signupMember,
  checkEmailExists,
  checkNicknameExists,
} from "../../api/authIssueUserApi/memberApi";

// 🎯 Validation 함수들
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password) => {
  const passwordRegex =
    /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{4,20}$/;
  return passwordRegex.test(password);
};

const validateNickname = (nickname) => {
  const nicknameRegex = /^[a-z0-9]{4,12}$/;
  return nicknameRegex.test(nickname);
};

export default function Signup() {
  const navigate = useNavigate();
  const [isComplete, setIsComplete] = useState(false);
  const [calories, setCalories] = useState(0);
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const [form, setForm] = useState({
    email: "",
    password: "",
    passwordConfirm: "",
    nickname: "",
    name: "",
    birthAt: "",
    gender: "FEMALE",
    height: "",
    weight: "",
    activityLevel: "MODERATE",
    role: "USER",
  });

  const [profileImage, setProfileImage] = useState(null);
  const [errors, setErrors] = useState({});
  const [dupChecked, setDupChecked] = useState({
    email: false,
    nickname: false,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
    if (name === "email" || name === "nickname") {
      setDupChecked((prev) => ({ ...prev, [name]: false }));
    }
  };

  const handleFileChange = (e) => {
    setProfileImage(e.target.files[0]);
  };

  // Duplication check for email or nickname
  const handleDupCheck = async (type) => {
    try {
      setIsLoading(true);
      if (type === "email") {
        const res = await checkEmailExists(form.email);
        if (res.data) {
          setErrors((prev) => ({
            ...prev,
            email: "이미 사용 중인 이메일입니다.",
          }));
        } else {
          setDupChecked((prev) => ({ ...prev, email: true }));
          alert("사용 가능한 이메일입니다.");
        }
      } else if (type === "nickname") {
        const res = await checkNicknameExists(form.nickname);
        if (res.data) {
          setErrors((prev) => ({
            ...prev,
            nickname: "이미 사용 중인 닉네임입니다.",
          }));
        } else {
          setDupChecked((prev) => ({ ...prev, nickname: true }));
          alert("사용 가능한 닉네임입니다.");
        }
      }
    } catch (error) {
      alert("중복 확인에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitStep1 = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!validateEmail(form.email)) {
      newErrors.email = "올바른 이메일 형식이 아닙니다.";
    }
    if (!validatePassword(form.password)) {
      newErrors.password =
        "비밀번호는 영어대문자,숫자,특수문자를 포함한 4~20자입니다.";
    }
    if (form.password !== form.passwordConfirm) {
      newErrors.passwordConfirm = "비밀번호가 일치하지 않습니다.";
    }
    if (!validateNickname(form.nickname)) {
      newErrors.nickname = "닉네임은 영어 소문자 또는 숫자, 4~12자입니다.";
    }
    if (!dupChecked.email) {
      newErrors.email = "이메일 중복 확인을 해주세요.";
    }
    if (!dupChecked.nickname) {
      newErrors.nickname = "닉네임 중복 확인을 해주세요.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setStep(2);
  };

  const handleSubmitFinal = async (e) => {
    e.preventDefault();
    const { birthAt, gender, activityLevel, height, weight } = form;
    if (!birthAt || !gender || !activityLevel || !height || !weight) {
      return alert("모든 정보를 정확히 입력해주세요.");
    }

    try {
      setIsLoading(true);
      // 숫자 필드 변환
      const signupData = {
        email: form.email,
        password: form.password,
        nickname: form.nickname,
        name: form.name,
        birthAt: form.birthAt,
        gender: form.gender,
        height: form.height ? parseFloat(form.height) : null,
        weight: form.weight ? parseFloat(form.weight) : null,
        activityLevel: form.activityLevel,
        role: form.role,
      };

      // 디버깅 로그 추가
      console.log("📤 회원가입 요청 데이터:", signupData);

      const response = await signupMember(signupData);

      //check for API testing
      console.log("Final signup POST request sent");
      //console.log("finalSignupData:", finalSignupData);
      console.log("response:", response);
      console.log("response.data:", response.data);

      setCalories(response.data.dailyCalories || 0);
      setIsComplete(true);
    } catch (error) {
      console.error("Signup failed:", error);
      const message =
        error.response?.data?.message || "회원가입에 실패했습니다.";
      alert(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-purple-200 flex flex-col justify-center py-12  sm:px-6 lg:px-8 relative overflow-hidden">
      {/* 🎨 배경 장식 요소들 */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-32 h-32 bg-purple-300 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-pink-300 rounded-full opacity-30 animate-bounce slow"></div>
        <div className="absolute bottom-32 left-1/4 w-20 h-20 bg-purple-400 rounded-full opacity-25 animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 right-1/3 w-16 h-16 bg-pink-400 rounded-full opacity-20 animate-bounce delay-500"></div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        {/* 🏠 브랜드 로고 섹션 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">하루칼로리</h1>
          <p className="text-sm text-gray-600">
            {isComplete
              ? "🎉 회원가입 완료!"
              : step === 1
              ? "새로운 시작을 환영합니다!"
              : "마지막 단계입니다!"}
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white/80 backdrop-blur-sm py-8 px-4 shadow-2xl sm:rounded-2xl sm:px-10 border border-white/50">
          {/* 🎯 진행 표시기 */}
          {!isComplete && (
            <div className="mb-8">
              <div className="flex items-center justify-center mb-4">
                <div className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      step >= 1
                        ? "bg-purple-500 text-white"
                        : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    1
                  </div>
                  <div
                    className={`w-16 h-1 mx-2 ${
                      step >= 2 ? "bg-purple-500" : "bg-gray-200"
                    }`}
                  ></div>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      step >= 2
                        ? "bg-purple-500 text-white"
                        : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    2
                  </div>
                </div>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  {step === 1 ? "기본 정보 입력" : "추가 정보 입력"}
                </p>
              </div>
            </div>
          )}

          {isComplete ? (
            <ConfirmationScreen name={form.name} calories={calories} />
          ) : step === 1 ? (
            <>
              {/* 🎯 1단계: 기본 정보 */}
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  계정 정보를 입력해주세요
                </h2>
                <p className="text-sm text-gray-600">
                  건강한 식단 관리를 위한 첫 번째 단계입니다
                </p>
              </div>

              <form onSubmit={handleSubmitStep1} className="space-y-6">
                {/* 이메일 입력 */}
                <div className="group">
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    <span className="flex items-center gap-2">
                      <svg
                        className="w-4 h-4 text-purple-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                        />
                      </svg>
                      이메일
                    </span>
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <FormInput
                        name="email"
                        id="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="example@email.com"
                        disabled={isLoading}
                        className="pl-12 pr-4 py-3 w-full border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white/90 group-hover:shadow-md"
                      />
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg
                          className="h-5 w-5 text-gray-400 group-focus-within:text-purple-500 transition-colors"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                          />
                        </svg>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="px-4 py-3 bg-purple-100 text-purple-600 rounded-xl hover:bg-purple-200 transition-colors duration-200 text-sm font-medium border border-purple-200 whitespace-nowrap"
                      onClick={() => handleDupCheck("email")}
                      disabled={isLoading || !form.email}
                    >
                      중복확인
                    </button>
                  </div>
                  {errors.email && (
                    <div className="mt-2 flex items-center gap-1 text-sm text-red-600 animate-shake">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      {errors.email}
                    </div>
                  )}
                </div>

                {/* 비밀번호 입력 */}
                <div className="group">
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    <span className="flex items-center gap-2">
                      <svg
                        className="w-4 h-4 text-purple-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      </svg>
                      비밀번호
                    </span>
                  </label>
                  <div className="relative">
                    <FormInput
                      name="password"
                      id="password"
                      type="password"
                      value={form.password}
                      onChange={handleChange}
                      placeholder="영어대문자,숫자,특수문자 포함 4~20자"
                      disabled={isLoading}
                      className="pl-12 pr-4 py-3 w-full border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white/90 group-hover:shadow-md"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg
                        className="h-5 w-5 text-gray-400 group-focus-within:text-purple-500 transition-colors"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      </svg>
                    </div>
                  </div>
                  {errors.password && (
                    <div className="mt-2 flex items-center gap-1 text-sm text-red-600 animate-shake">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      {errors.password}
                    </div>
                  )}
                </div>

                {/* 비밀번호 확인 */}
                <div className="group">
                  <label
                    htmlFor="passwordConfirm"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    <span className="flex items-center gap-2">
                      <svg
                        className="w-4 h-4 text-purple-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      비밀번호 확인
                    </span>
                  </label>
                  <div className="relative">
                    <FormInput
                      name="passwordConfirm"
                      id="passwordConfirm"
                      type="password"
                      value={form.passwordConfirm}
                      onChange={handleChange}
                      placeholder="비밀번호를 다시 입력해주세요"
                      disabled={isLoading}
                      className="pl-12 pr-4 py-3 w-full border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white/90 group-hover:shadow-md"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg
                        className="h-5 w-5 text-gray-400 group-focus-within:text-purple-500 transition-colors"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                  </div>
                  {errors.passwordConfirm && (
                    <div className="mt-2 flex items-center gap-1 text-sm text-red-600 animate-shake">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      {errors.passwordConfirm}
                    </div>
                  )}
                </div>

                {/* 닉네임 입력 */}
                <div className="group">
                  <label
                    htmlFor="nickname"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    <span className="flex items-center gap-2">
                      <svg
                        className="w-4 h-4 text-purple-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      닉네임
                    </span>
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <FormInput
                        name="nickname"
                        id="nickname"
                        value={form.nickname}
                        onChange={handleChange}
                        placeholder="영어 소문자, 숫자, 4~12자"
                        disabled={isLoading}
                        className="pl-12 pr-4 py-3 w-full border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white/90 group-hover:shadow-md"
                      />
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg
                          className="h-5 w-5 text-gray-400 group-focus-within:text-purple-500 transition-colors"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="px-4 py-3 bg-purple-100 text-purple-600 rounded-xl hover:bg-purple-200 transition-colors duration-200 text-sm font-medium border border-purple-200 whitespace-nowrap"
                      onClick={() => handleDupCheck("nickname")}
                      disabled={isLoading || !form.nickname}
                    >
                      중복확인
                    </button>
                  </div>
                  {errors.nickname && (
                    <div className="mt-2 flex items-center gap-1 text-sm text-red-600 animate-shake">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      {errors.nickname}
                    </div>
                  )}
                </div>

                {/* 이름 입력 */}
                <div className="group">
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    <span className="flex items-center gap-2">
                      <svg
                        className="w-4 h-4 text-purple-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      이름
                    </span>
                  </label>
                  <div className="relative">
                    <FormInput
                      name="name"
                      id="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="실명을 입력해주세요"
                      disabled={isLoading}
                      className="pl-12 pr-4 py-3 w-full border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white/90 group-hover:shadow-md"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg
                        className="h-5 w-5 text-gray-400 group-focus-within:text-purple-500 transition-colors"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* 프로필 이미지 */}
                <div className="group">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <span className="flex items-center gap-2">
                      <svg
                        className="w-4 h-4 text-purple-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      프로필 이미지 (선택)
                    </span>
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      disabled={isLoading}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white/90 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                    />
                  </div>
                </div>

                {/* 다음 버튼 */}
                <div>
                  <button
                    type="submit"
                    className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] transition-all duration-200 shadow-lg hover:shadow-xl"
                    disabled={isLoading}
                  >
                    <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                      {isLoading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <svg
                          className="h-5 w-5 text-purple-100 group-hover:text-white transition-colors"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 7l5 5m0 0l-5 5m5-5H6"
                          />
                        </svg>
                      )}
                    </span>
                    {isLoading ? "확인 중..." : "다음 단계"}
                  </button>
                </div>
              </form>
            </>
          ) : (
            <>
              {/* 🎯 2단계: 추가 정보 */}
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  건강 정보를 알려주세요 🏃‍♀️
                </h2>
                <p className="text-sm text-gray-600">
                  맞춤형 칼로리 계산을 위한 추가 정보입니다
                </p>
              </div>

              <form onSubmit={handleSubmitFinal} className="space-y-6">
                {/* 성별 선택 */}
                <div className="group">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <span className="flex items-center gap-2">
                      <svg
                        className="w-4 h-4 text-purple-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
                        />
                      </svg>
                      성별
                    </span>
                  </label>
                  <FormSelect
                    name="gender"
                    value={form.gender}
                    onChange={handleChange}
                    options={[
                      { value: "FEMALE", label: "여성" },
                      { value: "MALE", label: "남성" },
                    ]}
                    disabled={isLoading}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white/90"
                  />
                </div>

                {/* 생년월일 */}
                <div className="group">
                  <label
                    htmlFor="birthAt"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    <span className="flex items-center gap-2">
                      <svg
                        className="w-4 h-4 text-purple-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      생년월일
                    </span>
                  </label>
                  <div className="relative">
                    <FormInput
                      name="birthAt"
                      id="birthAt"
                      type="date"
                      value={form.birthAt}
                      onChange={handleChange}
                      placeholder="생년월일"
                      disabled={isLoading}
                      className="pl-12 pr-4 py-3 w-full border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white/90 group-hover:shadow-md"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg
                        className="h-5 w-5 text-gray-400 group-focus-within:text-purple-500 transition-colors"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* 활동 수준 */}
                <div className="group">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <span className="flex items-center gap-2">
                      <svg
                        className="w-4 h-4 text-purple-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                      </svg>
                      활동 수준
                    </span>
                  </label>
                  <FormSelect
                    name="activityLevel"
                    value={form.activityLevel}
                    onChange={handleChange}
                    options={[
                      {
                        value: "HIGH",
                        label: "매우 활동적 (주 5회 이상 운동)",
                      },
                      { value: "MODERATE", label: "활동적 (주 2-4회 운동)" },
                      { value: "LOW", label: "낮음 (운동을 거의 안함)" },
                    ]}
                    disabled={isLoading}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white/90"
                  />
                </div>

                {/* 키와 몸무게 */}
                <div className="grid grid-cols-2 gap-4">
                  {/* 키 */}
                  <div className="group">
                    <label
                      htmlFor="height"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      <span className="flex items-center gap-2">
                        <svg
                          className="w-4 h-4 text-purple-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                          />
                        </svg>
                        키 (cm)
                      </span>
                    </label>
                    <div className="relative">
                      <FormInput
                        name="height"
                        id="height"
                        value={form.height}
                        onChange={handleChange}
                        placeholder="170"
                        disabled={isLoading}
                        className="pl-12 pr-4 py-3 w-full border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white/90 group-hover:shadow-md"
                      />
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg
                          className="h-5 w-5 text-gray-400 group-focus-within:text-purple-500 transition-colors"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* 몸무게 */}
                  <div className="group">
                    <label
                      htmlFor="weight"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      <span className="flex items-center gap-2">
                        <svg
                          className="w-4 h-4 text-purple-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16l-3-1m3 1l3-1"
                          />
                        </svg>
                        몸무게 (kg)
                      </span>
                    </label>
                    <div className="relative">
                      <FormInput
                        name="weight"
                        id="weight"
                        value={form.weight}
                        onChange={handleChange}
                        placeholder="60"
                        disabled={isLoading}
                        className="pl-12 pr-4 py-3 w-full border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white/90 group-hover:shadow-md"
                      />
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg
                          className="h-5 w-5 text-gray-400 group-focus-within:text-purple-500 transition-colors"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16l-3-1m3 1l3-1"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 이전/완료 버튼 */}
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors duration-200 text-sm font-medium"
                    disabled={isLoading}
                  >
                    이전
                  </button>
                  <button
                    type="submit"
                    className="flex-1 group relative flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] transition-all duration-200 shadow-lg hover:shadow-xl"
                    disabled={isLoading}
                  >
                    <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                      {isLoading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <svg
                          className="h-5 w-5 text-purple-100 group-hover:text-white transition-colors"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                    </span>
                    {isLoading ? "처리 중..." : "가입 완료"}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

const ConfirmationScreen = ({ name, calories }) => {
  const navigate = useNavigate();
  const handleStart = () => navigate("/member/login");

  return (
    <div className="text-center space-y-8">
      {/* 🎉 축하 메시지 */}
      <div className="space-y-4">
        <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
          <svg
            className="w-10 h-10 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          🎉 가입을 축하드립니다!
        </h2>

        <p className="text-lg text-gray-600">
          안녕하세요,{" "}
          <span className="font-bold text-purple-600">{name || "회원"}</span>님!
          <br />
          건강한 여정의 시작을 환영합니다 ✨
        </p>
      </div>

      {/* 📊 칼로리 정보 카드 */}
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-center gap-2 mb-4">
          <svg
            className="w-6 h-6 text-purple-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
          <h3 className="text-lg font-semibold text-gray-800">
            맞춤형 목표 칼로리
          </h3>
        </div>

        <div className="text-center">
          <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-2">
            {calories || 2000} kcal
          </div>
          <p className="text-sm text-gray-600">
            당신의 목표와 활동 수준에 맞춘 하루 권장 칼로리입니다
          </p>
        </div>
      </div>

      {/* 💡 시작 가이드 */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-left">
        <h4 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          시작하기 전에 알아두세요
        </h4>
        <ul className="text-sm text-blue-700 space-y-2">
          <li className="flex items-start gap-2">
            <span className="text-blue-500 mt-1">•</span>
            매일 식사를 기록하여 칼로리를 관리하세요
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500 mt-1">•</span>
            운동 기록으로 더 정확한 칼로리 계산이 가능합니다
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500 mt-1">•</span>
            주간/월간 리포트로 건강 관리 현황을 확인하세요
          </li>
        </ul>
      </div>

      {/* 🚀 시작 버튼 */}
      <div className="space-y-4">
        <button
          className="group relative w-full flex justify-center py-4 px-4 border border-transparent text-lg font-medium rounded-xl text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transform hover:scale-[1.02] transition-all duration-200 shadow-lg hover:shadow-xl"
          onClick={handleStart}
        >
          <span className="absolute left-0 inset-y-0 flex items-center pl-4">
            <svg
              className="h-6 w-6 text-purple-100 group-hover:text-white transition-colors"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
              />
            </svg>
          </span>
          로그인하고 시작하기
        </button>

        <p className="text-xs text-gray-500">
          가입이 완료되었습니다. 이제 로그인하여 건강 관리를 시작해보세요! 🌟
        </p>
      </div>
    </div>
  );
};
