import { supabase } from "./lib/supabase";

export const uploadImage = async (file) => {
  const fileExt = file.name.split(".").pop();
  const fileName = `${Date.now()}.${fileExt}`;
  const filePath = `${fileName}`;

  let { error } = await supabase.storage
    .from("food-images") // ← 버킷 이름
    .upload(filePath, file);

  if (error) {
    throw new Error("파일 업로드 실패: " + error.message);
  }

  const { data } = supabase.storage.from("food-images").getPublicUrl(filePath);

  return data.publicUrl; // 👈 이거 이미지 URL로 바로 쓸 수 있음
};
