import React, { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import SubLayout from "../../../layout/SubLayout";

function IssueDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const currentUser = useSelector((state) => state.login);
  const isLoggedIn = currentUser.isLoggedIn;

  const [issue, setIssue] = useState(null);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) {
      alert("로그인이 필요합니다.");
      navigate("/member/login");
      return;
    }

    // Load issue data
    const storedIssues = JSON.parse(localStorage.getItem("issues")) || [];
    const foundIssue = storedIssues.find((i) => i.id === parseInt(id));

    if (!foundIssue) {
      alert("게시글을 찾을 수 없습니다.");
      navigate("/community/issue");
      return;
    }

    setIssue(foundIssue);
  }, [id, isLoggedIn, navigate]);

  // 🔍 로딩 상태가 아직 확인되지 않은 경우 로딩 상태 표시
  if (isLoggedIn === undefined) {
    return (
      <div className="w-full max-w-[1020px] mx-auto px-4 sm:px-6">
        <SubLayout to="/community" menu="커뮤니티" label="핫이슈" />
        <div className="mt-6 sm:mt-10">
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
            <p className="text-gray-600">로딩 중...</p>
          </div>
        </div>
      </div>
    );
  }

  // 🔍 데이터가 없으면 아무것도 렌더링하지 않음 (빠른 로딩을 위해)
  if (!issue) {
    return (
      <div className="w-full max-w-[1020px] mx-auto px-4 sm:px-6">
        <SubLayout to="/community" menu="커뮤니티" label="핫이슈" />
        <div className="mt-6 sm:mt-10"></div>
      </div>
    );
  }

  const isAdmin =
    currentUser?.role === "admin" || currentUser?.role === "ADMIN";
  const isWriter = issue.writer === currentUser?.nickname;

  const handleDelete = () => {
    if (window.confirm("정말 삭제하시겠습니까?")) {
      const storedIssues = JSON.parse(localStorage.getItem("issues")) || [];
      const updated = storedIssues.filter((item) => item.id !== Number(id));
      localStorage.setItem("issues", JSON.stringify(updated));
      alert("삭제되었습니다.");
      navigate("/community/issue");
    }
  };

  return (
    <div className="w-full max-w-[1020px] mx-auto px-4 sm:px-6">
      <SubLayout to="/community" menu="커뮤니티" label="핫이슈" />

      <div className="mt-6 sm:mt-10 space-y-6">
        {/* 🎨 WriteView와 동일한 게시글 내용 카드 */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {/* 게시글 헤더 */}
          <div className="border-b border-gray-100 p-6">
            <div className="flex justify-between items-start mb-4">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                {issue.title}
              </h1>
              <div className="relative">
                {showMenu && isAdmin && (
                  <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-100 py-2 w-32">
                    <button
                      onClick={() =>
                        navigate(`/community/issue/update/${issue.id}`)
                      }
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                    >
                      수정하기
                    </button>
                    <button
                      onClick={handleDelete}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-50"
                    >
                      삭제하기
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center text-sm text-gray-500 gap-4">
              <span>{issue.writer ? `${issue.writer}` : "알 수 없음"}</span>
              <span>{issue.date}</span>
            </div>
          </div>

          {/* 게시글 본문 */}
          <div className="p-6">
            <div className="prose max-w-none">
              <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                {issue.content}
              </div>
            </div>
          </div>
        </div>

        {/* 🎨 WriteView와 동일한 하단 버튼 영역 */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex  sm:items-end gap-4">
            <Link
              to="/community/issue"
              className="inline-flex items-center  px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              목록으로
            </Link>

            {isAdmin && (
              <div className="flex gap-2">
                <button
                  onClick={() =>
                    navigate(`/community/issue/update/${issue.id}`)
                  }
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-purple-500 border border-transparent rounded-lg hover:bg-purple-600 transition-colors duration-200"
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                  수정하기
                </button>
                <button
                  onClick={handleDelete}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-red-500 border border-transparent rounded-lg hover:bg-red-600 transition-colors duration-200"
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                  삭제하기
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default IssueDetail;
