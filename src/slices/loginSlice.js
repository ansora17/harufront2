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

    console.log("🖼️ 이미지 정보 확인:");
    console.log("  - 기존 photo:", memberInfo.photo);
    console.log("  - 기존 profileImageUrl:", memberInfo.profileImageUrl);

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

    console.log("🖼️ 정규화 후 이미지 정보:");
    console.log("  - 최종 photo:", memberInfo.photo);
    console.log("  - 최종 profileImageUrl:", memberInfo.profileImageUrl);
  } else {
    console.log("🍪 쿠키에 저장된 회원 정보 없음");
  }

  console.log("🍪 === 쿠키 로드 완료 ===");
  return memberInfo;
};

export const loginPostAsync = createAsyncThunk("loginPost", (param) => {
  console.log("loginAsync : ", param);
  return loginPost(param);
});

const loginSlice = createSlice({
  name: "loginSlice",
  initialState: (() => {
    const cookieData = loadMemberCookie();
    const finalState = cookieData || initState;
    console.log("🔄 loginSlice 초기화:");
    console.log("  - 쿠키 데이터:", cookieData);
    console.log("  - 최종 초기 상태:", finalState);
    console.log("  - photo:", finalState.photo);
    console.log("  - profileImageUrl:", finalState.profileImageUrl);
    return finalState;
  })(),
  reducers: {
    login: (state, action) => {
      return state;
    },
    logout: (state, action) => {
      console.log("logOut....");
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
      console.log("🍪 updatePhoto 액션 실행:");
      console.log("  - 이전 상태:", state);
      console.log("  - 새로운 이미지 URL:", action.payload);
      console.log("  - 업데이트될 상태:", updatedState);

      try {
        setCookie("member", JSON.stringify(updatedState), 1);
        console.log("✅ 쿠키 저장 성공");

        // 🔍 저장 직후 검증
        setTimeout(() => {
          const savedCookie = getCookie("member");
          console.log("🔍 저장 검증 - 쿠키에서 다시 읽은 데이터:", savedCookie);
          console.log("🔍 검증 - photo:", savedCookie?.photo);
          console.log(
            "🔍 검증 - profileImageUrl:",
            savedCookie?.profileImageUrl
          );
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
        console.log("🔄 === 로그인 성공 - 상태 병합 시작 ===");
        console.log("🏠 기존 상태:");
        console.log("  - photo:", state.photo);
        console.log("  - profileImageUrl:", state.profileImageUrl);
        console.log("🌐 서버 응답:");
        console.log("  - 전체:", action.payload);
        console.log("  - photo:", action.payload.photo);
        console.log("  - profileImageUrl:", action.payload.profileImageUrl);

        // 🔥 이미지 정보 우선순위 결정
        const serverPhoto =
          action.payload.photo || action.payload.profileImageUrl;
        const statePhoto = state.photo || state.profileImageUrl;
        const finalPhoto = serverPhoto || statePhoto;

        console.log("🖼️ 이미지 정보 결정:");
        console.log("  - 서버 이미지:", serverPhoto);
        console.log("  - 기존 이미지:", statePhoto);
        console.log("  - 최종 선택:", finalPhoto);

        // 🔥 기존 이미지 정보 보존하면서 새 데이터 병합
        const mergedPayload = {
          ...action.payload,
          isLoggedIn: true,
          photo: finalPhoto,
          profileImageUrl: finalPhoto,
        };

        console.log("🔄 병합 완료:");
        console.log("  - 최종 photo:", mergedPayload.photo);
        console.log("  - 최종 profileImageUrl:", mergedPayload.profileImageUrl);

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
