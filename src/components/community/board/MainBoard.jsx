import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux"; // ✅ Redux 추가
import SearchBar from "./SearchBar";
import SubLayout from "../../../layout/SubLayout";
import ChatBot from "../../chatbot/ChatBot";
import { getAllBoards } from "../../../api/board/boardApi";

function MainBoard() {
  // ✅ 실제 로그인한 사용자 정보 가져오기
  const loginState = useSelector((state) => state.login);
  const { memberId: currentMemberId, nickname: currentNickname } = loginState;

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ✅ 작성자 표시 함수
  const getMemberDisplayName = (memberId) => {
    if (memberId === currentMemberId) {
      return currentNickname || `회원${memberId}`;
    }
    // 다른 사용자는 임시로 회원+ID 형태로 표시
    // 향후 백엔드에서 작성자 닉네임을 포함해주면 개선 가능
    return `회원${memberId}`;
  };

  // 페이지네이션 상태 추가
  const [pagination, setPagination] = useState({
    page: 0,
    size: 10,
    totalPages: 0,
    totalElements: 0,
    hasNext: false,
    hasPrevious: false,
  });

  const [searchInput, setSearchInput] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");

  const handleSearch = () => {
    setSearchKeyword(searchInput.trim());
  };

  // 게시글 목록 가져오기
  const fetchPosts = async (page = 0, size = 10) => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAllBoards(page, size);
      console.log("API 응답:", response); // 디버깅용

      // 🔥 응답 형식 확인 및 처리
      if (Array.isArray(response)) {
        // 🔥 클라이언트 사이드 페이지네이션
        const totalElements = response.length;
        const totalPages = Math.ceil(totalElements / size);
        const startIndex = page * size;
        const endIndex = startIndex + size;
        const currentPagePosts = response.slice(startIndex, endIndex);

        setPosts(currentPagePosts);
        setPagination({
          page: page,
          size: size,
          totalPages: totalPages,
          totalElements: totalElements,
          hasNext: page < totalPages - 1,
          hasPrevious: page > 0,
        });
      } else if (
        response &&
        response.content &&
        Array.isArray(response.content)
      ) {
        // 기존 서버 사이드 페이지네이션
        setPosts(response.content);
        setPagination({
          page: response.page,
          size: response.size,
          totalPages: response.totalPages,
          totalElements: response.totalElements,
          hasNext: response.hasNext,
          hasPrevious: response.hasPrevious,
        });
      } else {
        console.error("예상하지 못한 응답 형식:", response);
        setPosts([]);
      }
    } catch (error) {
      console.error("게시글 로딩 에러:", error);
      setError("게시글을 불러오는데 실패했습니다.");
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  // 페이지 변경 함수들
  const handleNextPage = () => {
    if (pagination.hasNext) {
      fetchPosts(pagination.page + 1, pagination.size);
    }
  };

  const handlePrevPage = () => {
    if (pagination.hasPrevious) {
      fetchPosts(pagination.page - 1, pagination.size);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < pagination.totalPages) {
      fetchPosts(newPage, pagination.size);
    }
  };

  // 반응형 날짜 포맷팅 함수
  const formatDate = (dateString, isShort = false) => {
    if (!dateString) return "";
    const date = new Date(dateString);

    if (isShort) {
      // 모바일용 짧은 형식: "07. 30"
      return date
        .toLocaleDateString("ko-KR", {
          month: "2-digit",
          day: "2-digit",
        })
        .replace(/\s/g, ""); // 공백만 제거하고 점은 유지
    } else {
      // 데스크톱용 긴 형식: "2024. 08. 01"
      return date
        .toLocaleDateString("ko-KR", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        })
        .replace(/\./g, ". ")
        .trim();
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const sortedPosts = [...posts].sort((a, b) => b.id - a.id);
  const filteredPosts = searchKeyword
    ? sortedPosts.filter((post) =>
        post.title.toLowerCase().includes(searchKeyword.toLowerCase())
      )
    : sortedPosts;

  return (
    <div className="w-full max-w-[1020px] mx-auto px-4 sm:px-6 mb-10">
      <SubLayout to="/community" menu="커뮤니티" label="자유게시판" />

      {/* 에러 상태 */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <div className="text-red-400">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
              <button
                onClick={() => fetchPosts(pagination.page, pagination.size)}
                className="mt-2 text-sm text-red-600 hover:text-red-500 underline"
              >
                다시 시도
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 메인 콘텐츠 - 로딩 중이 아닐 때만 표시 */}
      {!loading && (
        <div className="mt-6 sm:mt-10 space-y-6">
          {/* 상단 검색 섹션 */}
          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                전체 게시글
              </h2>
              <Link
                to="/community/board/write"
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
            </div>
            <SearchBar
              searchInput={searchInput}
              setSearchInput={setSearchInput}
              handleSearch={handleSearch}
            />
          </div>

          {/* 게시글 목록 */}
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
                      {/* 데스크톱: "작성일", 모바일: "날짜" */}
                      <span className="hidden sm:inline">작성일</span>
                      <span className="sm:hidden">날짜</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredPosts.map((post) => (
                    <tr
                      key={post.id}
                      className="hover:bg-purple-50 transition-colors duration-150"
                    >
                      <td className="hidden sm:table-cell py-4 px-6 text-gray-600">
                        {post.id}
                      </td>
                      <td className="py-4 px-3 sm:px-6">
                        <Link
                          to={`/community/board/writeview/${post.id}`}
                          className="text-gray-900 transition-colors duration-150 line-clamp-1 hover:text-purple-600"
                          onClick={() =>
                            localStorage.setItem("selectedPostId", post.id)
                          }
                        >
                          {post.title}
                        </Link>
                      </td>
                      <td className="py-4 px-3 sm:px-6 text-gray-600 text-sm">
                        {post.memberId
                          ? `${getMemberDisplayName(post.memberId)}`
                          : "알 수 없음"}
                      </td>
                      <td className="py-4 px-3 sm:px-6 text-gray-600 text-sm">
                        {/* 데스크톱: 전체 날짜, 모바일: 짧은 날짜 */}
                        <span className="hidden sm:inline">
                          {formatDate(post.createdAt, false)}
                        </span>
                        <span className="sm:hidden">
                          {formatDate(post.createdAt, true)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 페이지네이션 */}
          {pagination.totalElements > pagination.size && (
            <div className="flex justify-center">
              <div className="join shadow-sm">
                {/* 이전 페이지 버튼 */}
                <button
                  className={`join-item btn btn-sm bg-white hover:bg-gray-50 text-gray-600 ${
                    !pagination.hasPrevious ? "btn-disabled" : ""
                  }`}
                  onClick={handlePrevPage}
                  disabled={!pagination.hasPrevious}
                >
                  «
                </button>

                {/* 페이지 번호 버튼들 */}
                {Array.from({ length: pagination.totalPages }, (_, index) => (
                  <button
                    key={index}
                    className={`join-item btn btn-sm ${
                      pagination.page === index
                        ? "bg-purple-500 text-white "
                        : "bg-white hover:bg-gray-50 text-gray-600"
                    }`}
                    onClick={() => handlePageChange(index)}
                  >
                    {index + 1}
                  </button>
                ))}

                {/* 다음 페이지 버튼 */}
                <button
                  className={`join-item btn btn-sm bg-white hover:bg-gray-50 text-gray-600 ${
                    !pagination.hasNext ? "btn-disabled" : ""
                  }`}
                  onClick={handleNextPage}
                  disabled={!pagination.hasNext}
                >
                  »
                </button>
              </div>
            </div>
          )}
        </div>
      )}
      {/* 챗봇 추가 */}
      <ChatBot />
    </div>
  );
}

export default MainBoard;
