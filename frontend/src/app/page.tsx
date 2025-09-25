'use client';

import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header'; // 공통 헤더 import
import BottomNavBar from './components/NavBar'; // 공통 네비바 import
import { BenefitsSection, AIRoutesSection, LocalDealsSection } from './components';
import Image from 'next/image';

const HomePage = () => {
  const [activeTab, setActiveTab] = useState('홈');

  const BannerSlider = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const bannerRef = useRef(null);

    const banners = [
      { 
        id: 1, 
        title: "청년 여행 지원금", 
        subtitle: "최대 20만원 지원",
        image: "/Banner01.png"
      },
      { 
        id: 2, 
        title: "AI 맞춤 루트 추천", 
        subtitle: "나만의 여행 코스",
        image: "/Banner02.png"
      },
      { 
        id: 3, 
        title: "로컬딜 특가", 
        subtitle: "지역 맛집 할인",
        image: "/Banner03.png"
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
                position: "relative"
              }}
            >
              <Image
                src={banner.image}
                alt={banner.title}
                fill
                sizes="393px" 
                style={{
                  objectFit: 'cover'
                }}
              />
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
                backgroundColor: index === currentIndex ? 
                  "white" : "rgba(255,255,255,0.5)",
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
    <div className="min-h-screen bg-gray-20 flex items-center justify-center">
      <div className="w-[393px] min-h-[852px] bg-white flex flex-col relative shadow-lg">
      {/* 공통 헤더 컴포넌트 */}
      <div className="fixed top-0 left-1/2 transform -translate-x-1/2 w-full max-w-[393px] z-50">
        <Header 
          title="ZeroPlay"
          showSearch={false} // 홈에서는 검색 버튼 숨김
          onNotificationClick={() => console.log('알림 클릭')}
          onSettingsClick={() => console.log('설정 클릭')}
          className="h-[60px] border-b border-gray-100"
        />
      </div>

      {/* Main Content */}
      <div 
        className="max-w-[393px] mx-auto bg-white"
        style={{ 
          marginTop: '70px',
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

      {/* 공통 하단 네비게이션 */}
      <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-[393px] z-50">
        <BottomNavBar
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      </div>
    </div>
    </div>
  );
};

export default HomePage;