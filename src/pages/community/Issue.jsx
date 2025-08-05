import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import SubLayout from "../../layout/SubLayout";
import SearchBar from "../../components/community/board/SearchBar";
import ChatBot from "../../components/chatbot/ChatBot";
import { issueApi } from "../../api/authIssueUserApi/issueApi";
import api from "../../api/authIssueUserApi/axiosConfig";

function Issue() {
  const navigate = useNavigate();
  const currentUser = useSelector((state) => state.login);
  const isLoggedIn = currentUser.isLoggedIn;

  const [issues, setIssues] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // 페이지당 게시물 수를 10개로 변경

  // Initialize issues data
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.log("🔍 Issue useEffect 실행 - isLoggedIn:", isLoggedIn);
    }

    // 로그인 상태가 명확하지 않으면 잠시 기다림
    if (isLoggedIn === undefined) {
      if (process.env.NODE_ENV === "development") {
        console.log("🔍 로그인 상태 확인 중...");
      }
      return;
    }

    // 로그인이 필요한 경우에만 리다이렉트
    if (isLoggedIn === false) {
      alert("로그인이 필요합니다");
      navigate("/member/login");
      return;
    }

    // Load issues from API
    const fetchIssues = async () => {
      try {
        // 고정된 adminId 8 사용 (포스트맨에서 작동하는 값)
        const response = await issueApi.getHotIssues(8);
        console.log("Fetched Issues:", response); // 데이터 확인용 로그

        if (response) {
          setIssues(Array.isArray(response) ? response : [response]);
        }
      } catch (error) {
        console.error("Error fetching issues:", error);
        // 자세한 에러 정보 출력
        if (error.response) {
          console.error("Status:", error.response.status);
          console.error("Data:", error.response.data);
          console.error("Headers:", error.response.headers);
        }
        alert("이슈 목록을 불러오는데 실패했습니다.");
      }
    };

    fetchIssues();
  }, [isLoggedIn, navigate]);

  const handleSearch = () => {
    setSearchKeyword(searchInput.trim());
    setCurrentPage(1);
  };

  // 🔍 로그인 상태 디버깅 (개발 환경에서만)
  if (process.env.NODE_ENV === "development") {
    console.log("🔍 Issue 페이지 - 현재 사용자 상태:", currentUser);
    console.log("🔍 Issue 페이지 - isLoggedIn:", isLoggedIn);
  }

  // 🔍 로그인 상태가 아직 확인되지 않은 경우 로딩 상태 표시
  if (isLoggedIn === undefined) {
    return (
      <div className="w-full max-w-[1020px] mx-auto px-4 sm:px-6">
        <SubLayout to="/community" menu="커뮤니티" label="이슈" />
        <div className="mt-6 sm:mt-10">
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
            <p className="text-gray-600">로딩 중...</p>
          </div>
        </div>
      </div>
    );
  }

  const isAdmin =
    currentUser?.role === "admin" || currentUser?.role === "ADMIN";

  // 🎨 자유게시판과 동일한 정렬 및 필터링 로직
  const sortedIssues = [...issues].sort((a, b) => b.id - a.id);
  const displayedIssues = searchKeyword
    ? sortedIssues.filter((issue) =>
        issue.title.toLowerCase().includes(searchKeyword.toLowerCase())
      )
    : sortedIssues;

  const totalPages = Math.ceil(displayedIssues.length / itemsPerPage);
  const paginated = displayedIssues.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="w-full max-w-[1020px] mx-auto px-4 sm:px-6 mb-10">
      <SubLayout to="/community" menu="커뮤니티" label="핫이슈" />

      <div className="mt-6 sm:mt-10 space-y-6">
        {/* 🎨 자유게시판과 동일한 상단 검색 섹션 디자인 */}
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">
              전체 이슈
            </h2>
            {isAdmin && (
              <Link
                to="/community/issue/write"
                className="px-4 py-2 bg-purple-500 text-white rounded-lg  
                         transition-colors duration-200 text-sm sm:text-base flex items-center gap-2"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                    clipRule="evenodd"
                  />
                </svg>
                글쓰기
              </Link>
            )}
          </div>
          <SearchBar
            searchInput={searchInput}
            setSearchInput={setSearchInput}
            handleSearch={handleSearch}
          />
        </div>

        {/* 🎨 자유게시판과 동일한 테이블 디자인 */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-purple-500 text-white">
                  <th className="hidden sm:table-cell py-4 px-6 text-left w-[10%]">
                    번호
                  </th>
                  <th className="py-4 px-3 sm:px-6 text-left w-[45%] sm:w-[50%]">
                    제목
                  </th>
                  <th className="py-4 px-3 sm:px-6 text-left w-[25%] sm:w-[20%]">
                    작성자
                  </th>
                  <th className="py-4 px-3 sm:px-6 text-left w-[30%] sm:w-[20%]">
                    <span className="hidden sm:inline">작성일</span>
                    <span className="sm:hidden">날짜</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginated.map((issue) => (
                  <tr
                    key={issue.id}
                    className="hover:bg-purple-50 transition-colors duration-150"
                  >
                    <td className="hidden sm:table-cell py-4 px-6 text-gray-600">
                      {issue.id}
                    </td>
                    <td className="py-4 px-3 sm:px-6">
                      <Link
                        to={`/community/issue/${issue.id}`}
                        className="text-gray-900 transition-colors duration-150 line-clamp-1 hover:text-purple-600"
                      >
                        {issue.title}
                      </Link>
                    </td>
                    <td className="py-4 px-3 sm:px-6 text-gray-600 text-sm">
                      관리자
                    </td>
                    <td className="py-4 px-3 sm:px-6 text-gray-600 text-sm">
                      <span className="hidden sm:inline">
                        {issue.createdAt
                          ? new Date(issue.createdAt).toLocaleDateString()
                          : "날짜 없음"}
                      </span>
                      <span className="sm:hidden">
                        {issue.createdAt
                          ? new Date(issue.createdAt).toLocaleDateString(
                              "ko-KR",
                              {
                                month: "numeric",
                                day: "numeric",
                              }
                            )
                          : "날짜 없음"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 🎨 자유게시판과 동일한 페이지네이션 디자인 */}
        {totalPages > 1 && (
          <div className="flex justify-center">
            <div className="join shadow-sm">
              {/* 이전 페이지 버튼 */}
              <button
                className={`join-item btn btn-sm bg-white hover:bg-gray-50 text-gray-600 ${
                  currentPage === 1 ? "btn-disabled" : ""
                }`}
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
              >
                «
              </button>

              {/* 페이지 번호 버튼들 */}
              {Array.from({ length: totalPages }, (_, index) => (
                <button
                  key={index + 1}
                  className={`join-item btn btn-sm ${
                    currentPage === index + 1
                      ? "bg-purple-500 text-white hover:bg-purple-600"
                      : "bg-white hover:bg-gray-50 text-gray-600"
                  }`}
                  onClick={() => setCurrentPage(index + 1)}
                >
                  {index + 1}
                </button>
              ))}

              {/* 다음 페이지 버튼 */}
              <button
                className={`join-item btn btn-sm bg-white hover:bg-gray-50 text-gray-600 ${
                  currentPage === totalPages ? "btn-disabled" : ""
                }`}
                onClick={() =>
                  setCurrentPage((p) => Math.min(p + 1, totalPages))
                }
                disabled={currentPage === totalPages}
              >
                »
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 챗봇 추가 */}
      <ChatBot />
    </div>
  );
}

export default Issue;
