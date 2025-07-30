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
};

const loadMemberCookie = () => {
  const memberInfo = getCookie("member");
  if (memberInfo && memberInfo.nickname) {
    memberInfo.nickname = decodeURIComponent(memberInfo.nickname);
  }
  return memberInfo;
};

export const loginPostAsync = createAsyncThunk("loginPost", (param) => {
  console.log("loginAsync : ", param);
  return loginPost(param);
});

const loginSlice = createSlice({
  name: "loginSlice",
  initialState: loadMemberCookie() || initState,
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
      const updatedState = { ...state, photo: action.payload };
      setCookie("member", JSON.stringify(updatedState), 1);
      return updatedState;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginPostAsync.fulfilled, (state, action) => {
        console.log("fulfilled.....");
        const payload = { ...action.payload, isLoggedIn: true };
        console.log(payload);
        if (!payload.error) {
          setCookie("member", JSON.stringify(payload), 1);
        }
        return payload;
      })
      .addCase(loginPostAsync.pending, (state, action) => {
        console.log("pending......");
      });
  },
});

export default loginSlice.reducer;
export const { login, logout, editProfile, updatePhoto } = loginSlice.actions; // 🔥 추가
