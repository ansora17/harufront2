import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import FormInput from "../../components/mypage/FormInput";
import { login, loginPostAsync } from "../../slices/loginSlice";

export default function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);

  const [form, setForm] = useState({
    nickname: "testuser",
    password: "Password12@",
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!form.nickname.trim()) {
      newErrors.nickname = "닉네임을 입력해주세요.";
    }
    if (!form.password.trim()) {
      newErrors.password = "비밀번호를 입력해주세요.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // const res = await loginMember(form);
      const action = await dispatch(loginPostAsync(form));
      navigate("/dashboard");
    } catch (error) {
      let message = "로그인에 실패했습니다.";
      alert(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-start min-h-screen pt-24 px-4 bg-white">
      <div className="w-full max-w-sm bg-white rounded-xl shadow-md p-6 sm:p-8">
        <h2 className="text-2xl font-bold mb-6 text-center">로그인</h2>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label
              htmlFor="nickname"
              className="block text-sm font-medium text-gray-700"
            >
              닉네임 {form.nickname}
            </label>
            <FormInput
              name="nickname"
              id="nickname"
              value={form.nickname}
              onChange={handleChange}
              placeholder="영어 소문자 또는 숫자, 4~12자"
              disabled={isLoading}
            />
            {errors.nickname && (
              <p className="text-xs text-red-500 ml-1">{errors.nickname}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              비밀번호
            </label>
            <FormInput
              name="password"
              id="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="영어대문자,숫자,특수문자 포함, 4~20자"
              disabled={isLoading}
            />
            {errors.password && (
              <p className="text-xs text-red-500 ml-1">{errors.password}</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                로그인 중...
              </>
            ) : (
              "로그인"
            )}
          </button>
        </form>

        <div className="mt-4 flex justify-between text-sm text-gray-600">
          <Link to="/member/search-nickname" className="hover:text-blue-600">
            닉네임 찾기
          </Link>
          <Link to="/member/change-password" className="hover:text-blue-600">
            비밀번호 변경
          </Link>
          <Link to="/member/signup" className="hover:text-blue-600">
            회원가입
          </Link>
        </div>
      </div>
    </div>
  );
}
