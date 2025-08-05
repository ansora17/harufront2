import React from "react";
import { Link } from "react-router-dom";
import Footer from "../../layout/Footer";

function WelcomeMain() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-purple-300">
      {/* 헤더 */}
      <header className="w-full bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <img
              src="/images/main_icon.png"
              alt="하루칼로리"
              className="w-full max-w-[150px] sm:max-w-[200px] md:max-w-[300px] h-10 sm:h-14 object-contain"
            />
          </div>
          <div className="flex gap-3">
            <Link
              to="/member/login"
              className="px-4 py-2 text-sm text-purple-500 hover:text-purple-700 transition-colors"
            >
              로그인
            </Link>
            <Link
              to="/member/signup"
              className="px-4 py-2 text-sm bg-purple-500 text-white rounded-lg hover:bg-purple-500 transition-colors"
            >
              회원가입
            </Link>
          </div>
        </div>
      </header>

      {/* 메인 히어로 섹션 */}
      <section className="max-w-6xl mx-auto px-4 py-8 sm:py-14 text-center">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-6 sm:mb-9 leading-tight px-4">
          <div className="whitespace-pre-line">
            AI로 쉽고 간편한
            {/* 모바일에서는 자연스러운 줄바꿈, 데스크톱에서는 강제 줄바꿈 */}
            <span className="hidden sm:inline">
              <br />
            </span>{" "}
            <span className="text-purple-500">칼로리 식단 기록</span>
          </div>
        </h1>
        <p className="text-lg sm:text-xl text-gray-600 mb-6 sm:mb-8 max-w-2xl mx-auto leading-relaxed px-4">
          <span className="whitespace-pre-line">
            사진 한 장으로 영양소를 자동 분석하고, 개인 맞춤형 식단 관리로
            건강한 습관을 만들어보세요.
          </span>
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/member/signup"
            className="px-8 py-4 bg-purple-500 text-white text-lg font-semibold rounded-lg hover:bg-purple-700 transition-colors"
          >
            무료로 시작하기
          </Link>
        </div>
      </section>

      {/* 앱 스크린샷 섹션 */}
      <section className="max-w-4xl mx-auto px-4 py-6 sm:py-8 mb-6 sm:mb-10">
        <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <div className="text-center">
              <div className="bg-gray-100 rounded-xl h-48 sm:h-64 mb-4 flex items-center justify-center">
                <img
                  src="/images/food_1.jpg"
                  alt="음식 분석"
                  className="h-36 w-36 sm:h-48 sm:w-48 object-cover rounded-lg"
                />
              </div>
              <h3 className="font-bold text-lg mb-2">사진으로 간편 분석</h3>
              <p className="text-gray-600 text-sm sm:text-base whitespace-pre-line px-2">
                음식 사진만 찍으면 AI가 자동으로 칼로리와 영양소를 분석해드려요
              </p>
            </div>
            <div className="text-center">
              <div className="bg-gray-100 rounded-xl h-64 mb-4 flex items-center justify-center">
                <div className=" bg-purple-100 rounded-full flex items-center justify-center">
                  <img
                    src="/images/report.jpg"
                    alt="음식 분석"
                    className="h-48 w-48 object-cover rounded-lg"
                  />
                </div>
              </div>
              <h3 className="font-bold text-lg mb-2">맞춤형 리포트</h3>
              <p className="text-gray-600 text-sm sm:text-base whitespace-pre-line px-2">
                개인별 목표에 맞는 영양 분석과 식습관 리포트를 제공해요
              </p>
            </div>
            <div className="text-center">
              <div className="bg-gray-100 rounded-xl h-64 mb-4 flex items-center justify-center">
                <div className="2 bg-purple-100 rounded-full flex items-center justify-center">
                  <img
                    src="/images/community.jpg"
                    alt="음식 분석"
                    className="h-48 w-48 object-cover rounded-lg"
                  />
                </div>
              </div>
              <h3 className="font-bold text-lg mb-2">커뮤니티</h3>
              <p className="text-gray-600 text-sm sm:text-base whitespace-pre-line px-2">
                같은 목표를 가진 사람들과 정보를 공유하고 동기부여 받으세요
              </p>
            </div>
          </div>
        </div>
      </section>
      <img
        src="/images/bg7.jpg"
        alt=""
        className="w-full h-48 sm:h-96 object-cover"
      />

      {/* 주요 기능 섹션 */}
      <section id="features" className="max-w-6xl mx-auto px-4 py-10 sm:py-16">
        <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-8 sm:mb-12">
          왜 하루칼로리를 선택해야 할까요?
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
          <div className="text-center p-6 bg-white rounded-lg shadow-md">
            <div className="w-16 h-16 bg-purple-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <img
                src="/images/light2.png"
                alt="ai"
                className="w-18 h-16 rounded-full p-1"
              />
            </div>
            <h3 className="font-bold text-lg mb-2">AI 자동 분석</h3>
            <p className="text-gray-600 text-sm sm:text-base whitespace-pre-line">
              복잡한 입력 없이 사진만으로 정확한 영양 정보 제공
            </p>
          </div>
          <div className="text-center p-6 bg-white rounded-lg shadow-md">
            <div className="w-16 h-16 bg-purple-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <img
                src="/images/light2.png"
                alt="ai"
                className="w-18 h-16 rounded-full p-1"
              />
            </div>
            <h3 className="font-bold text-lg mb-2">개인 맞춤 목표</h3>
            <p className="text-gray-600 text-sm sm:text-base whitespace-pre-line">
              체중, 활동량에 따른 개인별 칼로리 목표 설정
            </p>
          </div>
          <div className="text-center p-6 bg-white rounded-lg shadow-md">
            <div className="w-16 h-16 bg-purple-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <img
                src="/images/light2.png"
                alt="ai"
                className="w-18 h-16 rounded-full p-1"
              />
            </div>
            <h3 className="font-bold text-lg mb-2">상세한 리포트</h3>
            <p className="text-gray-600 text-sm sm:text-base whitespace-pre-line">
              영양소 밸런스와 식습관 패턴을 한눈에 확인
            </p>
          </div>
          <div className="text-center p-6 bg-white rounded-lg shadow-md">
            <div className="w-16 h-16 bg-purple-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <img
                src="/images/light2.png"
                alt="ai"
                className="w-18 h-16 rounded-full p-1"
              />
            </div>
            <h3 className="font-bold text-lg mb-2">지속 가능한 습관</h3>
            <p className="text-gray-600 text-sm sm:text-base whitespace-pre-line">
              간편한 기록으로 건강한 식습관을 꾸준히 유지
            </p>
          </div>
        </div>
      </section>
      <img
        src="/images/bg6.jpg"
        alt=""
        className="w-full h-48 sm:h-96 object-cover"
      />

      {/* CTA 섹션 */}
      <section className="bg-purple-500 text-white py-10 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4 leading-tight">
            지금 시작해서 건강한 습관을 만들어보세요
          </h2>
          <p className="text-lg sm:text-xl mb-6 sm:mb-8 opacity-90">
            무료로 가입하고 AI 칼로리 분석을 체험해보세요
          </p>
          <Link
            to="/member/signup"
            className="inline-block px-8 py-4 bg-white text-gray-800 text-lg font-semibold rounded-lg hover:bg-gray-100 transition-colors"
          >
            무료로 시작하기
          </Link>
        </div>
      </section>

      {/* 푸터 */}
      <Footer />
    </div>
  );
}

export default WelcomeMain;
