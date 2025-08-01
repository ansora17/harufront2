import { Link, useNavigate, useParams } from "react-router-dom";
import React, { useEffect, useState } from "react";
import SubLayout from "../../../layout/SubLayout";
import { getBoardById, updateBoard } from "../../../api/board/boardApi";

function WriteUpdate() {
  const [post, setPost] = useState(null);
  const { id } = useParams(); // URL에서 게시글 ID 꺼냄
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updateLoading, setUpdateLoading] = useState(false);
  const navigate = useNavigate();

  // API에서 게시글 데이터 가져오기
  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getBoardById(id);
        console.log("게시글 조회 성공:", response);

        if (response) {
          setPost(response);
          setTitle(response.title || ""); // ✅ 제목 입력 필드 채우기
          setContent(response.content || ""); // ✅ 내용 입력 필드 채우기
        }
      } catch (error) {
        console.error("게시글 조회 실패:", error);
        setError("게시글을 불러오는데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPost();
    }
  }, [id]);

  const handleUpdate = async () => {
    if (!title.trim() || !content.trim()) {
      alert("제목과 내용을 모두 입력해주세요.");
      return;
    }

    try {
      setUpdateLoading(true);
      const updatedData = {
        title: title.trim(),
        content: content.trim(),
      };

      console.log("게시글 수정 요청:", updatedData);
      const response = await updateBoard(id, updatedData);
      console.log("게시글 수정 성공:", response);

      alert("수정이 완료되었습니다!");
      navigate(`/community/board/writeview/${id}`);
    } catch (error) {
      console.error("게시글 수정 실패:", error);
      alert("게시글 수정에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setUpdateLoading(false);
    }
  };

  // // 로딩 중일 때
  // if (loading) {
  //   return (
  //     <div className="w-full max-w-[1020px] mx-auto px-4 sm:px-6">
  //       <SubLayout to="/community" menu="커뮤니티" label="자유게시판" />
  //       <div className="flex justify-center items-center py-12">
  //         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
  //         <span className="ml-2 text-gray-600">게시글을 불러오는 중...</span>
  //       </div>
  //     </div>
  //   );
  // }

  // 에러 상태
  if (error) {
    return (
      <div className="w-full max-w-[1020px] mx-auto px-4 sm:px-6">
        <SubLayout to="/community" menu="커뮤니티" label="자유게시판" />
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-6">
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
                onClick={() => window.location.reload()}
                className="mt-2 text-sm text-red-600 hover:text-red-500 underline"
              >
                다시 시도
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1020px] mx-auto px-4 sm:px-6">
      <SubLayout to="/community" menu="커뮤니티" label="자유게시판" />
      <div className="mt-6 sm:mt-10 space-y-6">
        {/* 상단 안내 섹션 */}
        <div className="bg-purple-50 rounded-lg p-4 sm:p-6 border border-purple-100">
          <div className="flex items-center gap-3 mb-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-purple-500"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            <h2 className="font-bold text-gray-900 text-lg sm:text-xl">
              게시글 수정하기
            </h2>
          </div>
          <p className="text-purple-700 text-sm sm:text-base">
            작성하신 게시글의 내용을 수정할 수 있습니다.
          </p>
        </div>

        {/* 입력 폼 섹션 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100">
          {/* 제목 입력 */}
          <div className="p-4 sm:p-6 border-b border-gray-100">
            <label
              className="block text-gray-700 text-sm sm:text-base font-medium mb-2"
              htmlFor="title"
            >
              제목
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full h-12 rounded-lg bg-gray-50 px-4 border border-gray-200 
                       focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent
                       placeholder-gray-400 transition-colors duration-200"
            />
          </div>

          {/* 내용 입력 */}
          <div className="p-4 sm:p-6">
            <label
              className="block text-gray-700 text-sm sm:text-base font-medium mb-2"
              htmlFor="content"
            >
              내용
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full h-[300px] sm:h-[500px] rounded-lg bg-gray-50 p-4 border border-gray-200
                       focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent
                       placeholder-gray-400 transition-colors duration-200 resize-none"
            />
          </div>
        </div>

        {/* 하단 버튼 섹션 */}
        <div className="flex justify-between items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 
                     transition-colors duration-200 text-sm sm:text-base"
          >
            취소
          </button>
          <button
            onClick={handleUpdate}
            disabled={updateLoading}
            className={`px-6 py-2.5 rounded-lg transition-colors duration-200 text-sm sm:text-base
                     ${
                       updateLoading
                         ? "bg-gray-400 text-white cursor-not-allowed"
                         : "bg-purple-500 text-white"
                     }`}
          >
            {updateLoading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                수정 중...
              </div>
            ) : (
              "수정완료"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default WriteUpdate;
