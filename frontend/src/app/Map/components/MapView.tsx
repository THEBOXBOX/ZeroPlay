// src/app/Map/components/MapView.tsx - 최종 핀 연동 버전
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Navigation, Tag } from 'lucide-react';
import CategoryFilter from './CategoryFilter';
import BottomSheet from './BottomSheet';
import KakaoMap from './KakaoMap'; // 🔥 핀 기능이 추가된 KakaoMap
import { LocalSpot } from '../lib/api';
import { useLocalSpots } from '../hooks/useLocalSpots';

const MapView = () => {
  const [activeCategory, setActiveCategory] = useState('전체');
  const [showBottomSheet, setShowBottomSheet] = useState(true);
  const [showLocalDeals, setShowLocalDeals] = useState(false);
  const [bottomSheetHeight, setBottomSheetHeight] = useState(180);
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [startHeight, setStartHeight] = useState(0);
  const [selectedSpot, setSelectedSpot] = useState<LocalSpot | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const floatingButtonBottom = bottomSheetHeight + 15;

  // 🔥 훅으로 데이터 가져오기
  const { spots, loading, error } = useLocalSpots(activeCategory, 150);

  // 드래그 이벤트 처리
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;
      
      const maxHeight = 500;
      const deltaY = startY - e.clientY;
      const newHeight = Math.min(Math.max(startHeight + deltaY, 120), maxHeight);
      setBottomSheetHeight(newHeight);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, startY, startHeight]);

  const handleDragStart = (clientY: number) => {
    setIsDragging(true);
    setStartY(clientY);
    setStartHeight(bottomSheetHeight);
  };

  const handleMapClick = () => {
    setBottomSheetHeight(120);
    setSelectedSpot(null);
  };

  // 🔥 스팟 클릭 핸들러 (상세정보 모드)
  const handleSpotClick = (spot: LocalSpot) => {
    console.log('🏪 [MapView] 스팟 선택:', spot.name);
    setSelectedSpot(spot);
    setShowBottomSheet(true);
    setBottomSheetHeight(450); // 🔥 상세정보용으로 높이 증가
    setShowLocalDeals(false);
  };

  // 🔥 뒤로가기 핸들러 (리스트 모드로 복귀)
  const handleBackToList = () => {
    console.log('🔙 [MapView] 리스트 모드로 복귀');
    setSelectedSpot(null);
    setBottomSheetHeight(180); // 기본 높이로 복귀
  };

  const handleGPSClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if ((window as any).moveToCurrentLocation) {
      (window as any).moveToCurrentLocation();
    } else {
      alert('지도가 로딩 중입니다. 잠시 후 다시 시도해주세요.');
    }
  };

  const handleLocalDealsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowLocalDeals(!showLocalDeals);
    setShowBottomSheet(true);
    if (!showLocalDeals) {
      setActiveCategory('');
    } else {
      setActiveCategory('전체');
    }
  };

  return (
    <div 
      ref={containerRef}
      className="relative flex flex-col h-full"
    >
      {/* 카테고리 필터 */}
      <CategoryFilter 
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
        setShowBottomSheet={setShowBottomSheet}
        setShowLocalDeals={setShowLocalDeals}
        onCategoryChange={() => {
          // 🔥 상세보기 모드에서 리스트 모드로 전환
          if (selectedSpot) {
            console.log('📋 상세보기 → 리스트 모드로 전환');
            setSelectedSpot(null);
            setBottomSheetHeight(180);
          }
        }}
      />

      {/* 지도 영역 */}
      <div className="flex-1 relative overflow-hidden">
        {/* 🔥 핀이 추가된 KakaoMap */}
        <KakaoMap 
          width="100%" 
          height="100%" 
          level={3}
          lat={37.5665}
          lng={126.9780}
          onMapClick={handleMapClick}
          showCurrentLocation={true}
          spots={spots} // 🔥 핀 데이터 전달
          onSpotClick={handleSpotClick} // 🔥 핀 클릭 핸들러 전달
        />

        {/* 🔥 로딩/에러 상태 표시 */}
        {loading && (
          <div className="absolute top-2 left-2 bg-white px-3 py-1 rounded-full shadow-md z-50">
            <div className="flex items-center space-x-2">
              <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
              <span className="text-sm text-gray-600">핀 로딩 중...</span>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute top-2 left-2 bg-red-100 px-3 py-1 rounded-full shadow-md z-50">
            <span className="text-sm text-red-600">⚠️ 데이터 로딩 실패</span>
          </div>
        )}

        {/* 🔥 스팟 개수 표시 */}
        {!loading && spots.length > 0 && (
          <div className="absolute top-2 right-2 bg-white px-3 py-1 rounded-full shadow-md z-50">
            <span className="text-sm font-medium text-gray-700">
              📍 {spots.length}개 스팟
            </span>
          </div>
        )}

        {/* 로컬딜 마커들 */}
        {showLocalDeals && (
          <>
            <div className="absolute top-1/3 left-1/3 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
              <div className="bg-red-500 rounded-full p-1.5 shadow-lg animate-pulse">
                <Tag className="w-3 h-3 text-white" />
              </div>
            </div>
            <div className="absolute top-2/3 right-1/3 transform translate-x-1/2 -translate-y-1/2 pointer-events-none">
              <div className="bg-red-500 rounded-full p-1.5 shadow-lg animate-pulse">
                <Tag className="w-3 h-3 text-white" />
              </div>
            </div>
            <div className="absolute bottom-1/3 left-1/2 transform -translate-x-1/2 translate-y-1/2 pointer-events-none">
              <div className="bg-red-500 rounded-full p-1.5 shadow-lg animate-pulse">
                <Tag className="w-3 h-3 text-white" />
              </div>
            </div>
          </>
        )}

        {/* 플로팅 버튼들 */}
        <button 
          className="absolute left-3 bg-white rounded-full p-2.5 shadow-lg hover:shadow-xl transition-all z-30"
          style={{ bottom: `${floatingButtonBottom}px` }}
          onClick={handleGPSClick}
        >
          <Navigation className="w-4 h-4 text-gray-600" />
        </button>

        <button 
          onClick={handleLocalDealsClick}
          className={`absolute right-3 rounded-full p-2.5 shadow-lg hover:shadow-xl transition-all border-2 z-30 ${
            showLocalDeals 
              ? 'bg-red-500 border-red-500' 
              : 'bg-white border-gray-300 hover:border-gray-400'
          }`}
          style={{ bottom: `${floatingButtonBottom}px` }}
        >
          <Tag className={`w-4 h-4 ${showLocalDeals ? 'text-white' : 'text-gray-600'}`} />
        </button>

        {/* 바텀시트 - 🔥 실제 데이터 전달 */}
        <BottomSheet 
          showBottomSheet={showBottomSheet}
          setShowBottomSheet={setShowBottomSheet}
          bottomSheetHeight={bottomSheetHeight}
          setBottomSheetHeight={setBottomSheetHeight}
          activeCategory={activeCategory}
          showLocalDeals={showLocalDeals}
          handleDragStart={handleDragStart}
          isDragging={isDragging}
          startY={startY}
          startHeight={startHeight}
          containerRef={containerRef}
          spots={spots} // 🔥 실제 스팟 데이터 전달
          loading={loading} // 🔥 로딩 상태 전달
          selectedSpot={selectedSpot} // 🔥 선택된 스팟 전달
          onBackToList={handleBackToList} // 🔥 뒤로가기 핸들러 전달
        />
      </div>

      {/* 🔥 선택된 스팟 오버레이 제거 - 바텀시트에서 처리하므로 불필요 */}
    </div>
  );
};

export default MapView;