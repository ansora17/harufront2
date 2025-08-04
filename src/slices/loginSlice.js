import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { loginPost } from "../api/memberApi";
import { getCookie, removeCookie, setCookie } from "../utils/cookieUtils";

const initState = {
  email: "",
  nickname: "",
  memberId: null,
  name: "",
  height: null,
  weight: null,
  targetCalories: null,
  activityLevel: "",
  role: "",
  photo: "",
  profileImageUrl: "", // 🔥 초기 상태에 추가
  isLoggedIn: false, // 🔥 로그인 상태 초기값
};

const loadMemberCookie = () => {
  const memberInfo = getCookie("member");

  if (memberInfo) {
    // 닉네임 디코딩
    if (memberInfo.nickname) {
      memberInfo.nickname = decodeURIComponent(memberInfo.nickname);
    }

    // 🔥 이미지 정보 정규화 (양방향 동기화)
    if (memberInfo.profileImageUrl && !memberInfo.photo) {
      memberInfo.photo = memberInfo.profileImageUrl;
      console.log(
        "🔄 profileImageUrl → photo 복사:",
        memberInfo.profileImageUrl
      );
    } else if (memberInfo.photo && !memberInfo.profileImageUrl) {
      memberInfo.profileImageUrl = memberInfo.photo;
      console.log("🔄 photo → profileImageUrl 복사:", memberInfo.photo);
    }
  } else {
  }

  return memberInfo;
};

export const loginPostAsync = createAsyncThunk("loginPost", (param) => {
  return loginPost(param);
});

const loginSlice = createSlice({
  name: "loginSlice",
  initialState: (() => {
    const cookieData = loadMemberCookie();
    const finalState = cookieData || initState;

    return finalState;
  })(),
  reducers: {
    login: (state, action) => {
      return state;
    },
    logout: (state, action) => {
      removeCookie("member");
      // state를 초기값(initState)으로 변경
      window.location.href = "/";
      return { ...initState };
    },
    // 🔥 추가
    editProfile: (state, action) => {
      const updatedState = { ...state, ...action.payload };
      setCookie("member", JSON.stringify(updatedState), 1);
      return updatedState;
    },
    updatePhoto: (state, action) => {
      const updatedState = {
        ...state,
        photo: action.payload,
        profileImageUrl: action.payload, // 🔥 두 필드 모두 업데이트
      };

      try {
        setCookie("member", JSON.stringify(updatedState), 1);
        console.log("✅ 쿠키 저장 성공");

        // 🔍 저장 직후 검증
        setTimeout(() => {
          const savedCookie = getCookie("member");
        }, 100);
      } catch (error) {
        console.error("❌ 쿠키 저장 실패:", error);
      }

      return updatedState;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginPostAsync.fulfilled, (state, action) => {
        // 🔥 이미지 정보 우선순위 결정
        const serverPhoto =
          action.payload.photo || action.payload.profileImageUrl;
        const statePhoto = state.photo || state.profileImageUrl;
        const finalPhoto = serverPhoto || statePhoto;

        // 🔥 기존 이미지 정보 보존하면서 새 데이터 병합
        const mergedPayload = {
          ...action.payload,
          isLoggedIn: true,
          photo: finalPhoto,
          profileImageUrl: finalPhoto,
        };

        if (!mergedPayload.error) {
          setCookie("member", JSON.stringify(mergedPayload), 1);
          console.log("✅ 로그인 후 쿠키 저장 완료");
        }
        console.log("🔄 === 로그인 상태 병합 완료 ===");
        return mergedPayload;
      })
      .addCase(loginPostAsync.pending, (state, action) => {
        console.log("pending......");
      });
  },
});

export default loginSlice.reducer;
export const { login, logout, editProfile, updatePhoto } = loginSlice.actions; // 🔥 추가
