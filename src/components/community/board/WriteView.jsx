import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux"; // ✅ Redux 활성화
import SubLayout from "../../../layout/SubLayout";
import {
  getBoardById,
  deleteBoard,
  getCommentsByBoardId,
  addComment,
  deleteComment,
} from "../../../api/board/boardApi";

function WriteView() {
  const { id } = useParams();
  const navigate = useNavigate();

  // ✅ 실제 로그인한 사용자 정보 가져오기
  const loginState = useSelector((state) => state.login);
  const { memberId: currentMemberId, nickname: currentNickname } = loginState;

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [showMenu, setShowMenu] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [commentLoading, setCommentLoading] = useState(false);

  // ✅ 작성자 표시 함수
  const getMemberDisplayName = (memberId) => {
    if (memberId === currentMemberId) {
      return currentNickname || `회원${memberId}`;
    }
    // 다른 사용자는 임시로 회원+ID 형태로 표시
    // 향후 백엔드에서 작성자 닉네임을 포함해주면 개선 가능
    return `회원${memberId}`;
  };

  // 반응형 날짜 포맷팅 함수
  const formatDate = (dateString, isShort = false) => {
    if (!dateString) return "";
    const date = new Date(dateString);

    if (isShort) {
      // 모바일용 짧은 형식: "08/01"
      return date
        .toLocaleDateString("ko-KR", {
          month: "2-digit",
          day: "2-digit",
        })
        .replace(/\./g, "/")
        .replace(/\s/g, "");
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

  // 게시글 가져오기
  const fetchPost = async () => {
    try {
      const response = await getBoardById(id);
      console.log("게시글 조회 성공:", response);
      setPost(response);
    } catch (error) {
      console.error("게시글 조회 실패:", error);
      setError("게시글을 불러오는데 실패했습니다.");
    }
  };

  // 댓글 가져오기
  const fetchComments = async () => {
    try {
      const response = await getCommentsByBoardId(id);
      console.log("댓글 조회 성공:", response);
      setComments(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error("댓글 조회 실패:", error);
      setComments([]);
    }
  };

  // 게시글과 댓글 모두 가져오기
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      await Promise.all([fetchPost(), fetchComments()]);
    } catch (error) {
      console.error("데이터 로딩 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim()) {
      alert("댓글을 입력해주세요.");
      return;
    }

    // 테스트용: 로그인 체크 주석처리
    // if (!user || !user.userid) {
    //   alert("로그인이 필요합니다.");
    //   return;
    // }

    try {
      setCommentLoading(true);

      const commentData = {
        content: commentText.trim(),
      };

      // 테스트용: 하드코딩된 memberId 사용 (DB의 실제 memberId)
      const testMemberId = 9;
      console.log("댓글 작성 요청:", {
        boardId: id,
        memberId: testMemberId,
        commentData,
      });

      // 실제 API 호출
      const response = await addComment(id, testMemberId, commentData);
      console.log("댓글 작성 성공:", response);

      // 댓글 목록 새로고침
      await fetchComments();
      setCommentText("");
    } catch (error) {
      console.error("댓글 작성 실패:", error);
      alert("댓글 작성에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setCommentLoading(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("댓글을 삭제하시겠습니까?")) return;

    try {
      console.log("댓글 삭제 요청:", commentId);

      // 실제 API 호출
      await deleteComment(commentId);
      console.log("댓글 삭제 성공");

      // 댓글 목록 새로고침
      await fetchComments();
    } catch (error) {
      console.error("댓글 삭제 실패:", error);
      alert("댓글 삭제에 실패했습니다. 다시 시도해주세요.");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;

    try {
      console.log("게시글 삭제 요청:", id);

      // 실제 API 호출
      await deleteBoard(id);
      console.log("게시글 삭제 성공");

      alert("삭제 완료!");
      navigate("/community/board");
    } catch (error) {
      console.error("게시글 삭제 실패:", error);
      alert("게시글 삭제에 실패했습니다. 다시 시도해주세요.");
    }
  };

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id]);

  const handleEdit = () => {
    navigate(`/community/board/update/${id}`);
  };

  // 🚨 에러 상태 (실제 에러가 있을 때만)
  if (error) {
    return (
      <div className="w-full max-w-[1020px] mx-auto px-4 sm:px-6">
        <SubLayout to="/community" menu="커뮤니티" label="자유게시판" />
        <div className="mt-6 sm:mt-10">
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="text-red-500 mb-4">
              <svg
                className="h-12 w-12 mx-auto"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.768-.833-2.538 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <p className="text-red-600 mb-4">
              {error || "게시글을 찾을 수 없습니다."}
            </p>
            <button
              onClick={() => fetchData()}
              className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors duration-200 mr-4"
            >
              다시 시도
            </button>
            <Link
              to="/community/board"
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200"
            >
              목록으로
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 🔍 데이터가 없으면 아무것도 렌더링하지 않음 (빠른 로딩을 위해)
  if (!post) {
    return (
      <div className="w-full max-w-[1020px] mx-auto px-4 sm:px-6">
        <SubLayout to="/community" menu="커뮤니티" label="자유게시판" />
        <div className="mt-6 sm:mt-10"></div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1020px] mx-auto px-4 sm:px-6">
      <SubLayout to="/community" menu="커뮤니티" label="자유게시판" />
      <div className="mt-6 sm:mt-10 space-y-6">
        {/* 게시글 내용 */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {/* 게시글 헤더 */}
          <div className="border-b border-gray-100 p-6">
            <div className="flex justify-between items-start mb-4">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                {post.title}
              </h1>
              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-gray-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                    />
                  </svg>
                </button>
                {showMenu && (
                  <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-100 py-2 w-32">
                    <button
                      onClick={handleEdit}
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
              <span>
                {post.memberId
                  ? `${getMemberDisplayName(post.memberId)}`
                  : "알 수 없음"}
              </span>
              <span>
                {/* 데스크톱: 전체 날짜, 모바일: 짧은 날짜 */}
                <span className="hidden sm:inline">
                  {formatDate(post.createdAt, false)}
                </span>
                <span className="sm:hidden">
                  {formatDate(post.createdAt, true)}
                </span>
              </span>
            </div>
          </div>

          {/* 게시글 본문 */}
          <div className="p-6 min-h-[200px] text-gray-700 whitespace-pre-wrap">
            {post.content}
          </div>

          {/* 댓글 섹션 */}
          <div className="border-t border-gray-100">
            <div className="p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">댓글</h2>

              {/* 댓글 입력 */}
              <div className="flex gap-2 mb-6">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="댓글을 입력하세요"
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  onKeyPress={(e) => e.key === "Enter" && handleAddComment()}
                />
                <button
                  onClick={handleAddComment}
                  disabled={commentLoading}
                  className={`px-4 py-2 text-white rounded-lg transition-colors duration-200 
                          ${
                            commentLoading
                              ? "bg-gray-400 cursor-not-allowed"
                              : "bg-purple-500 "
                          }`}
                >
                  {commentLoading ? "등록 중..." : "등록"}
                </button>
              </div>

              {/* 댓글 목록 */}
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="flex justify-between items-start bg-gray-50 rounded-lg p-4"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium text-gray-900">
                          {comment.memberId
                            ? `${getMemberDisplayName(comment.memberId)}`
                            : "알 수 없음"}
                        </span>
                        <span className="text-sm text-gray-500">
                          {comment.createdAt
                            ? new Date(comment.createdAt).toLocaleString(
                                "ko-KR"
                              )
                            : ""}
                        </span>
                      </div>
                      <p className="text-gray-700">{comment.content}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteComment(comment.id)}
                      className="text-sm text-gray-500 hover:text-red-500"
                    >
                      삭제
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 목록으로 돌아가기 버튼 */}
        <div className="flex justify-center">
          <Link
            to="/community/board"
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200"
          >
            목록으로
          </Link>
        </div>
      </div>
    </div>
  );
}

export default WriteView;
