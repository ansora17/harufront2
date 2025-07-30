import React, { useState, useRef } from "react";
import supabase from "../../utils/supabases"; // 🔥 { supabase } → supabase로 변경 (default import)
//import { getThumbnailUrl } from "../../utils/imageUpload/uploadImageToSupabase";

export default function ProfileImage({
  photo,
  currentImage,
  nickname,
  onImageChange,
  readOnly = false,
  size = "medium",
  useThumbnail = true,
}) {
  const getInitial = (name) => name?.charAt(0).toUpperCase();
  const fileInputRef = useRef(null);

  // Handle both prop names for backward compatibility
  const imageUrl = photo || currentImage;

  // Try to get thumbnail URL if useThumbnail is enabled
  // const thumbnailUrl = useThumbnail && imageUrl ? getThumbnailUrl(imageUrl) : null; // 🔥 임시 비활성화
  const thumbnailUrl = null; // 🔥 수파베이스 설정 후 활성화
  const displayUrl = thumbnailUrl || imageUrl;

  // Size classes
  const sizeClasses = {
    small: "w-16 h-16",
    medium: "w-24 h-24 sm:w-28 sm:h-28",
    large: "w-32 h-32 sm:w-36 sm:h-36",
  };

  // State for image loading and upload
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false); // 🔥 업로드 상태 추가

  const handleImageError = (e) => {
    console.error("ProfileImage - Failed to load image:", displayUrl);
    setImageError(true);
    setImageLoaded(false);
    e.target.style.display = "none";
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  // 🔥 파일 입력 창 열기 함수
  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  // 🔥 파일 선택 시 처리 함수
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      console.log("선택된 파일:", selectedFile);

      // 자동으로 업로드 시작
      handleUpload(selectedFile);
    }
  };

  // 🔥 Supabase 업로드 함수 수정
  const handleUpload = async (uploadFile = file) => {
    if (!uploadFile) {
      return alert("파일을 선택해주세요");
    }

    try {
      setUploading(true);

      // 파일명 생성 (중복 방지)
      const fileExt = uploadFile.name.split(".").pop();
      const fileName = `${Date.now()}_${Math.random()
        .toString(36)
        .substring(2)}.${fileExt}`;
      const filePath = `member/${fileName}`; // 🔥 경로 변경: profiles/${fileName} → member/${fileName}

      console.log("🔥 Supabase 업로드 시작:", filePath);

      // Supabase Storage에 업로드
      const { data, error } = await supabase.storage
        .from("harukcal") // 🔥 버킷명 변경: profile-images → harukcal
        .upload(filePath, uploadFile);

      if (error) {
        console.error("❌ 업로드 에러:", error);
        alert("업로드 실패: " + error.message);
        return;
      }

      console.log("✅ 업로드 성공:", data);

      // 업로드된 파일의 공개 URL 가져오기
      const { data: urlData } = supabase.storage
        .from("harukcal") // 🔥 버킷명 변경: profile-images → harukcal
        .getPublicUrl(filePath);

      const imageUrl = urlData.publicUrl;
      console.log("✅ 이미지 공개 URL:", imageUrl);

      // 상위 컴포넌트로 업로드된 URL 전달
      if (onImageChange) {
        onImageChange(uploadFile, imageUrl);
      }

      alert("프로필 이미지가 업로드되었습니다!");
    } catch (error) {
      console.error("❌ 업로드 중 에러:", error);
      alert("업로드 중 오류가 발생했습니다.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="relative text-center">
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Clickable image or placeholder */}
      <div
        className={`${
          sizeClasses[size]
        } mx-auto rounded-full cursor-pointer transition-transform hover:scale-105 ${
          uploading ? "opacity-50" : ""
        }`}
        onClick={!uploading ? openFileDialog : undefined} // 🔥 업로드 중일 때는 클릭 비활성화
      >
        {displayUrl && !imageError ? (
          <img
            src={displayUrl}
            alt="profile"
            className={`w-full h-full rounded-full object-cover transition-opacity duration-300 ${
              imageLoaded ? "opacity-100" : "opacity-0"
            }`}
            onError={handleImageError}
            onLoad={handleImageLoad}
            loading="lazy"
          />
        ) : (
          <div
            className={`w-full h-full rounded-full bg-green-300 flex items-center justify-center text-white font-bold text-3xl`}
          >
            {getInitial(nickname)}
          </div>
        )}

        {/* Loading indicator */}
        {(displayUrl && !imageLoaded && !imageError) ||
          (uploading && (
            <div
              className={`absolute inset-0 rounded-full bg-gray-200 flex items-center justify-center animate-pulse`}
            >
              <div className="w-6 h-6 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ))}
      </div>

      {/* Upload button */}
      {onImageChange && !readOnly && (
        <button
          onClick={openFileDialog}
          disabled={uploading} // 🔥 업로드 중일 때 비활성화
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
