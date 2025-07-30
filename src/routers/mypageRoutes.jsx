import { Navigate } from "react-router-dom";
import EditProfile from "../pages/mypage/EditProfile";
import MyPage from "../pages/mypage/MyPage";
//import ProfileSearch from "../pages/mypage/ProfileSearch";
// import WithDrawMembership from "../pages/mypage/WithdrawMembership"; // 🔥 제거

const mypageRoutes = [
  {
    path: "",
    element: <MyPage />,
  },
  // {
  //   path: "profile",
  //   element: <ProfileSearch />,
  // },
  {
    path: "edit",
    element: <EditProfile />,
  },
  // 🔥 회원탈퇴 라우트 제거
  // {
  //   path: "withdraw",
  //   element: <WithDrawMembership />,
  // },
];

export default mypageRoutes;
