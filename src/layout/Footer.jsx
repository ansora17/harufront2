import React from "react";

function Footer() {
  return (
    <div className="bg-[#f7f7f7] ">
      {/* <div className="container m-auto flex flex-col justify-center items-center gap-3 px-3">
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <p className="text-purple-500 text-xl sm:text-2xl font-semibold">
            전화 02-3667-0008
          </p>
          <p className="text-sm sm:text-base">
            서울특별시 구로구 경인로 557 삼영빌딩 4층
          </p>
        </div>

        <p className="text-gray-400 text-sm sm:text-base">
          © 하이미디어 구로캠버스 자바 풀스택 AI 융합 웹개발
        </p>
      </div> */}
      <footer className="w-full max-w-[1020px] footer footer-vertical sm:footer-horizontal bg-base-200 text-base-content container mx-auto p-4 sm:p-10">
        <nav>
          <h6 className="footer-title">회사 소개</h6>
          <a className="link link-hover">Harukcal 소개</a>
          <a className="link link-hover">채용</a>
          <a className="link link-hover">보안</a>
          <a className="link link-hover">서비스 상태</a>
        </nav>
        <nav>
          <h6 className="footer-title">서비스</h6>
          <a className="link link-hover">브랜딩</a>
          <a className="link link-hover">설계</a>
          <a className="link link-hover">마케팅</a>
          <a className="link link-hover">광고</a>
        </nav>
        <nav>
          <h6 className="footer-title">법률</h6>
          <a className="link link-hover">이용약관</a>
          <a className="link link-hover">개인정보 보호정책</a>
          <a className="link link-hover">쿠키 정책</a>
        </nav>
      </footer>
      <footer className="w-full max-w-[1020px] footer bg-base-200 text-base-content border-base-300 container mx-auto border-t px-4 sm:px-10 py-4">
        <aside className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
            {/* <img src="public/haru.svg" alt="Harukcal Logo" className="w-8 h-8 sm:w-10 sm:h-10" /> */}
            <div className="flex flex-col">
              <p className="text-xs sm:text-sm text-gray-600">
                서울특별시 구로구 경인로 557 삼영빌딩 4층
              </p>
              <p className="text-gray-400 text-xs sm:text-sm">
                © 2025 하이미디어 구로캠버스 자바 풀스택 AI 융합 웹개발
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 mt-2 sm:mt-0">
            <p className="text-xs sm:text-sm text-gray-600">📞 02-3667-0008</p>
            <p className="text-xs sm:text-sm text-gray-600">
              📧 info@harukcal.com
            </p>
          </div>
        </aside>
      </footer>
    </div>
  );
}

export default Footer;
