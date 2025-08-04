import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { logout } from "../slices/loginSlice";

function Header() {
  // Use the proper logout hook
  // const doLogout = useLogout();

  // Only use Redux state - no more mixed logic
  const { nickname, weight, memberId, isLoggedIn, profileImageUrl } =
    useSelector((state) => state.login);
  const dispatch = useDispatch();
  const handleLogout = () => {
    // Use the proper logout function that clears everything
    // doLogout();
    dispatch(logout());
  };

  return (
    <div className="flex justify-between w-full items-center mx-auto bg-white px-2">
      <div className="container flex justify-between w-[1020px] py-2 items-center mx-auto">
        <h1>
          <Link to="/dashboard">
            <img
              src="/images/main_icon.png"
              alt="main icon"
              className="w-[150px] sm:w-[200px] md:w-[250px] h-15 object-contain"
            />
          </Link>
        </h1>

        <ul className="flex gap-2 items-center text-sm">
          {isLoggedIn ? (
            <>
              <img
                src={profileImageUrl}
                alt="profile"
                className="w-8 h-8 rounded-full mr-1"
              />
              <li>
                <Link
                  to="/mypage"
                  className="font-semibold text-purple-500 hover:underline"
                >
                  <span className="hidden sm:inline">
                    {nickname} 님 , 반갑습니다!
                  </span>
                  <span className="sm:hidden">{nickname} 님</span>
                </Link>
              </li>
              <li></li>
              <li>
                <button
                  onClick={handleLogout}
                  className="text-sm text-gray-400 hover:underline"
                >
                  로그아웃
                </button>
              </li>
            </>
          ) : (
            <li>
              <Link to="/member/login">
                <p className="text-sm text-gray-400 hover:underline">로그인</p>
              </Link>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}

export default Header;
