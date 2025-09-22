'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Bell, Settings, ChevronLeft, ChevronRight } from 'lucide-react';
import { BenefitsSection, AIRoutesSection, LocalDealsSection } from '../components';

const HomePage = () => {
  const Header = () => (
    <div className="fixed top-0 left-1/2 transform -translate-x-1/2 w-full max-w-[393px] bg-white px-4 py-3 flex items-center justify-between border-b border-gray-100 h-[60px] z-50">
      <div className="flex items-center">
        <div className="flex items-center bg-gray-100 px-2 py-1 rounded-lg">
          <span className="text-black font-bold text-sm">my</span>
          <span className="text-orange-500 font-bold text-sm">SUBWAY</span>
          <span className="text-xs text-gray-500 ml-1">(임시로고)</span>
        </div>
      </div>
      <div className="flex items-center space-x-3">
        <Bell className="w-5 h-5 text-gray-600" />
        <Settings className="w-5 h-5 text-gray-600" />
      </div>
    </div>
  );

  const BannerSlider = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const bannerRef = useRef(null);

    const banners = [
      { 
        id: 1, 
        title: "청년 여행 지원금", 
        subtitle: "최대 20만원 지원",
        bgColor: "#4f46e5" 
      },
      { 
        id: 2, 
        title: "AI 맞춤 루트 추천", 
        subtitle: "나만의 여행 코스",
        bgColor: "#059669" 
      },
      { 
        id: 3, 
        title: "로컬딜 특가", 
        subtitle: "지역 맛집 할인",
        bgColor: "#dc2626" 
      },
    ];

    useEffect(() => {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % banners.length);
      }, 3000);

      return () => clearInterval(interval);
    }, [banners.length]);

    return (
      <div
        style={{
          overflow: "hidden",
          width: "100%",
          height: "250px",
          margin: 0,
          padding: 0,
        }}
      >
        <div
          ref={bannerRef}
          style={{
            display: "flex",
            transition: "transform 0.5s ease-in-out",
            transform: `translateX(-${currentIndex * 100}%)`,
          }}
        >
          {banners.map((banner) => (
            <div
              key={banner.id}
              style={{
                minWidth: "100%",
                height: "250px",
                backgroundColor: banner.bgColor,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                fontSize: "18px",
                fontWeight: "bold",
                color: "white",
                flexDirection: "column",
                gap: "8px"
              }}
            >
              <div style={{ fontSize: "20px", fontWeight: "bold" }}>
                {banner.title}
              </div>
              <div style={{ fontSize: "16px", opacity: 0.9 }}>
                {banner.subtitle}
              </div>
            </div>
          ))}
        </div>
        
        {/* 인디케이터 */}
        <div style={{
          position: "absolute",
          bottom: "16px",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          gap: "8px"
        }}>
          {banners.map((_, index) => (
            <div
              key={index}
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                backgroundColor: index === currentIndex ? "white" : "rgba(255,255,255,0.5)",
                cursor: "pointer"
              }}
              onClick={() => setCurrentIndex(index)}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <div 
        className="max-w-[393px] mx-auto bg-white"
        style={{ 
          marginTop: '60px',
          minHeight: 'calc(100vh - 160px)'
        }}
      >
        {/* Banner Carousel - 393px 컨테이너 안에서 꽉 채우기 */}
        <div className="w-full relative">
          <BannerSlider />
        </div>

        {/* Sections */}
        <div className="px-4 pt-2 pb-20 space-y-6">
          {/* Section 01: 청년 혜택 정보 */}
          <div className="mt-2">
            <BenefitsSection 
              title="💎 합리적 여행의 시작, 청년 혜택 모음.zip"
              limit={4}
              showMore={true}
            />
          </div>

          {/* Section 02: AI 루트 추천 */}
          <div>
            <AIRoutesSection 
              title="✈️ 고민 끝! AI가 추천하는 코스 모음.zip"
              showRoutes={true}
            />
          </div>

          {/* Section 03: 로컬딜 */}
          <div>
            <LocalDealsSection 
              title="🔥 단기간 오픈! 여행을 가치로 바꾸는 로컬딜"
              limit={6}
              layout="card"
            />
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-[393px] bg-white border-t border-gray-200 px-2 py-1 h-[60px] z-50">
        <div className="flex justify-around items-center h-full">
          <div className="flex flex-col items-center py-1 px-2 text-black">
            <div className="w-6 h-6 mb-1">🏠</div>
            <span className="text-xs font-medium">홈</span>
            <div className="w-8 h-1 bg-black rounded-full mt-1"></div>
          </div>
          <div className="flex flex-col items-center py-1 px-2 text-gray-500">
            <div className="w-6 h-6 mb-1">🤖</div>
            <span className="text-xs">AI 루트</span>
          </div>
          <div className="flex flex-col items-center py-1 px-2 text-gray-500">
            <div className="w-6 h-6 mb-1">🎁</div>
            <span className="text-xs">혜택 정보</span>
          </div>
          <div className="flex flex-col items-center py-1 px-2 text-gray-500">
            <div className="w-6 h-6 mb-1">🗺️</div>
            <span className="text-xs">지도</span>
          </div>
          <div className="flex flex-col items-center py-1 px-2 text-gray-500">
            <div className="w-6 h-6 mb-1">👤</div>
            <span className="text-xs">내 정보</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;