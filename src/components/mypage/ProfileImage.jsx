import React, { useState, useRef, useEffect } from "react";
import supabase from "../../utils/supabases";
import { useDispatch, useSelector } from "react-redux";

export default function ProfileImage({
  photo,
  currentImage,

  onImageChange,
  readOnly = false,
  size = "medium",
}) {
  const getInitial = (name) => name?.charAt(0).toUpperCase();
  const fileInputRef = useRef(null);

  // 🔥 단순화: 이미지 URL은 photo 또는 currentImage 사용
  const imageUrl = photo || currentImage;

  // Size classes
  const sizeClasses = {
    small: "w-16 h-16",
    medium: "w-24 h-24 sm:w-28 sm:h-28",
    large: "w-32 h-32 sm:w-36 sm:h-36",
  };

  // State
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [uploading, setUploading] = useState(false);

  // 🔥 imageUrl이 변경될 때마다 이미지 상태 리셋
  useEffect(() => {
    console.log("🖼️ === ProfileImage 상태 변경 ===");
    console.log("  - 받은 photo prop:", photo);
    console.log("  - 받은 currentImage prop:", currentImage);
    console.log("  - 최종 imageUrl:", imageUrl);
    console.log("  - imageUrl 존재여부:", !!imageUrl);
    console.log("  - imageUrl 길이:", imageUrl?.length || 0);
    console.log("  - 상태 리셋 - imageLoaded: false, imageError: false");
    setImageLoaded(false);
    setImageError(false);
  }, [imageUrl, photo, currentImage]);

  // 🔍 실시간 상태 추적
  useEffect(() => {
    console.log("🔄 === 이미지 상태 업데이트 ===");
    console.log("  - imageLoaded:", imageLoaded);
    console.log("  - imageError:", imageError);
    console.log("  - uploading:", uploading);
    console.log("  - 최종 표시 조건:");
    console.log("    - imageUrl 존재:", !!imageUrl);
    console.log("    - imageError 없음:", !imageError);
    console.log("    - 조건 만족:", !!(imageUrl && !imageError));
    console.log(
      "    - 이미지 투명도:",
      imageLoaded ? "opacity-100" : "opacity-0"
    );
    console.log("================================");
  }, [imageLoaded, imageError, uploading, imageUrl]);

  const handleImageError = (e) => {
    console.error("🚨 === 이미지 로딩 실패 ===");
    console.error("  - 실패한 URL:", imageUrl);
    console.error("  - 에러 이벤트:", e);
    console.error("  - img.naturalWidth:", e.target?.naturalWidth);
    console.error("  - img.naturalHeight:", e.target?.naturalHeight);
    setImageError(true);
    setImageLoaded(false);
    e.target.style.display = "none";
  };

  const handleImageLoad = () => {
    console.log("✅ === 이미지 로딩 성공 ===");
    console.log("  - 성공한 URL:", imageUrl);
    console.log("  - 이미지 크기: 약간의 로딩 지연 후 확인");
    setImageLoaded(true);
    setImageError(false);
  };

  // 🔥 파일 선택 창 열기
  const openFileDialog = () => {
    if (!readOnly && !uploading) {
      fileInputRef.current?.click();
    }
  };

  // 🔥 단순화된 파일 업로드 처리
  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    try {
      setUploading(true);

      // 🔥 단순한 파일명 생성
      const fileExt = selectedFile.name.split(".").pop();
      const fileName = `${Date.now()}_${Math.random()
        .toString(36)
        .substring(2)}.${fileExt}`;
      const filePath = `member/${fileName}`;

      console.log("🔥 Supabase 업로드 시작:", filePath);

      // 🔥 Supabase Storage에 업로드
      const { data, error } = await supabase.storage
        .from("harukcal")
        .upload(filePath, selectedFile);

      if (error) {
        console.error("❌ 업로드 에러:", error);
        alert("업로드 실패: " + error.message);
        return;
      }

      // 🔥 공개 URL 가져오기
      const { data: urlData } = supabase.storage
        .from("harukcal")
        .getPublicUrl(filePath);

      const publicUrl = urlData.publicUrl;
      console.log("✅ 업로드 성공, URL:", publicUrl);

      // 🔥 상위 컴포넌트로 결과 전달 (파일과 URL)
      if (onImageChange) {
        onImageChange(selectedFile, publicUrl);
      }

      // alert("이미지가 업로드되었습니다!");
    } catch (error) {
      console.error("❌ 업로드 중 에러:", error);
      alert("업로드 중 오류가 발생했습니다.");
    } finally {
      setUploading(false);
    }
  };

  const { nickname, weight, memberId, isLoggedIn, profileImageUrl } =
    useSelector((state) => state.login);

  return (
    <div className="relative text-center">
      {/* 🔥 숨겨진 파일 입력 */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* 🔥 클릭 가능한 이미지 또는 플레이스홀더 */}
      <div
        className={`${
          sizeClasses[size]
        } mx-auto rounded-full cursor-pointer transition-transform hover:scale-105 ${
          uploading ? "opacity-50" : ""
        }`}
        onClick={openFileDialog}
      >
        <img
          src={profileImageUrl}
          alt="profile"
          className="w-35 h-35 mr-10 rounded-full "
        />

        {/* 🔥 로딩 인디케이터 */}
        {/* {((imageUrl && !imageLoaded && !imageError) || uploading) && (
          <div className="absolute inset-0 rounded-full bg-gray-200 flex items-center justify-center animate-pulse">
            <div className="w-6 h-6 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )} */}
      </div>

      {/* 🔥 업로드 버튼 (편의용) */}
      {onImageChange && !readOnly && (
        <button
          onClick={openFileDialog}
          disabled={uploading}
          className={`mt-2 text-sm text-blue-500 hover:underline ${
            uploading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {uploading ? "업로드 중..." : "사진 변경"}
        </button>
      )}
    </div>
  );
}
