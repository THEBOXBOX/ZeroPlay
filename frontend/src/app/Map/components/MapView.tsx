// src/app/Map/components/MapView.tsx - 무한 리렌더링 문제 해결
'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Navigation, Tag, X } from 'lucide-react';
import CategoryFilter from './CategoryFilter';
import BottomSheet from './BottomSheet';
import KakaoMap from './KakaoMap';
import { LocalSpot, CATEGORY_NAMES } from '../lib/api';
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
  
  // 툴팁 관련 상태
  const [tooltipSpot, setTooltipSpot] = useState<LocalSpot | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{ x: number; y: number } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const floatingButtonBottom = bottomSheetHeight + 15;

  // 훅으로 데이터 가져오기
  const { spots, loading, error } = useLocalSpots(activeCategory, 100);

  // 🔥 스팟 클릭 핸들러 - useCallback으로 참조 안정화
  const handleSpotClick = useCallback((spot: LocalSpot, screenPosition?: { x: number; y: number }) => {
  console.log('🏪 [MapView] 스팟 클릭:', spot.name, screenPosition);
  
    // 🔥 툴팁 표시
    setTooltipSpot(spot);
    setTooltipPosition(screenPosition || null);
    
    // 🔥 동시에 바텀시트 상세모드로 전환
    setSelectedSpot(spot);
    setBottomSheetHeight(400);
  }, []);

  // 🔥 툴팁 닫기 핸들러 - useCallback으로 참조 안정화
  const handleTooltipClose = useCallback(() => {
    console.log('❌ [MapView] 툴팁 닫기');
    setTooltipSpot(null);
    setTooltipPosition(null);
  }, []);

  // 🔥 지도 클릭 핸들러 - useCallback으로 참조 안정화
  const handleMapClick = useCallback(() => {
    console.log('🗺️ [MapView] 지도 클릭 - 툴팁 및 바텀시트 리셋');
    setBottomSheetHeight(120);
    setSelectedSpot(null);
    setTooltipSpot(null);
    setTooltipPosition(null);
  }, []);

  // 🔥 뒤로가기 핸들러 - useCallback으로 참조 안정화
  const handleBackToList = useCallback(() => {
    console.log('🔙 [MapView] 리스트 모드로 복귀');
    setSelectedSpot(null);
    setBottomSheetHeight(180);
  }, []);

  // 🔥 바텀시트 스팟 클릭 핸들러 - useCallback으로 참조 안정화
  const handleBottomSheetSpotClick = useCallback((spot: LocalSpot) => {
    console.log('🏪 [MapView] 바텀시트에서 스팟 클릭:', spot.name);
    setSelectedSpot(spot);
    setBottomSheetHeight(400); // 상세보기 모드로 높이 조정
    
    // 툴팁 닫기
    setTooltipSpot(null);
    setTooltipPosition(null);
  }, []);

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
    
    // 로컬딜 모드 전환 시 툴팁 닫기
    setTooltipSpot(null);
    setTooltipPosition(null);
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
          // 카테고리 변경 시 툴팁 닫기
          setTooltipSpot(null);
          setTooltipPosition(null);
          
          // 상세보기 모드에서 리스트 모드로 전환
          if (selectedSpot) {
            console.log('📋 상세보기 → 리스트 모드로 전환');
            setSelectedSpot(null);
            setBottomSheetHeight(180);
          }
        }}
      />

      {/* 지도 영역 */}
      <div className="flex-1 relative overflow-hidden">
        {/* 카카오맵 */}
        <KakaoMap 
          width="100%" 
          height="100%" 
          level={3}
          lat={37.5665}
          lng={126.9780}
          onMapClick={handleMapClick}
          showCurrentLocation={true}
          spots={spots}
          onSpotClick={handleSpotClick} // 🔥 이제 안정화된 참조
        />

        {/* 툴팁 - 지도 영역 안에 위치 */}
        {tooltipSpot && tooltipPosition && (
          
          <div
            className="absolute z-50 bg-white rounded-lg shadow-xl border border-gray-200 p-4 w-72 max-w-xs"
            style={{
              // 🔥 임시로 화면 상단 고정
              left: `50px`,
              top: `50px`,
              animation: 'fadeIn 0.2s ease-out'
            }}
          >
            {/* 헤더 */}
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 text-sm leading-tight pr-2">
                  {tooltipSpot.name}
                </h3>
                <div className="flex items-center mt-1">
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-gray-100 text-gray-700">
                    {CATEGORY_NAMES[tooltipSpot.category]}
                  </span>
                  {tooltipSpot.rating && tooltipSpot.rating > 0 && (
                    <span className="ml-2 text-xs text-yellow-600">
                      ⭐ {tooltipSpot.rating}
                    </span>
                  )}
                </div>
              </div>
              
              {/* 닫기 버튼 */}
              <button
                onClick={handleTooltipClose}
                className="flex-shrink-0 p-1 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>

            {/* 주소 */}
            <div className="text-xs text-gray-600 mb-3">
              📍 {tooltipSpot.address}
            </div>

            {/* 가격 정보 */}
            {tooltipSpot.price_range && (
              <div className="text-xs text-gray-500 mb-2">
                💰 {tooltipSpot.price_range}
              </div>
            )}

            {/* 하단 버튼 */}
            <div className="flex space-x-2">
              <button 
                onClick={() => {
                  console.log('상세정보 보기:', tooltipSpot.name);
                  // 🔥 바텀시트 상세모드로 전환
                  setSelectedSpot(tooltipSpot);
                  setBottomSheetHeight(400);
                  handleTooltipClose();
                }}
                className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs py-2 px-3 rounded-md transition-colors font-medium"
              >
                상세보기
              </button>
              
              {tooltipSpot.reservation_link && (
                <button 
                  onClick={() => {
                    window.open(tooltipSpot.reservation_link, '_blank');
                    handleTooltipClose();
                  }}
                  className="flex-1 bg-green-50 hover:bg-green-100 text-green-700 text-xs py-2 px-3 rounded-md transition-colors font-medium"
                >
                  예약하기
                </button>
              )}
            </div>
          </div>
        )}

        {/* 로딩/에러 상태 표시 */}
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

        {/* 스팟 개수 표시 */}
        {!loading && spots.length > 0 && (
          <div className="absolute top-2 right-2 bg-white px-3 py-1 rounded-full shadow-md z-50">
            <span className="text-sm font-medium text-gray-700">
              📍 {spots.length}개 스팟
            </span>
          </div>
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

        {/* 바텀시트 */}
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
          spots={spots}
          loading={loading}
          selectedSpot={selectedSpot}
          onBackToList={handleBackToList}
          onSpotClick={handleBottomSheetSpotClick} // 🔥 바텀시트용 핸들러 추가
        />

        {/* CSS 애니메이션 */}
        <style jsx>{`
          @keyframes fadeIn {
            from { 
              opacity: 0;
              transform: scale(0.95);
            }
            to { 
              opacity: 1;
              transform: scale(1);
            }
          }
        `}</style>
      </div>
    </div>
  );
};

export default MapView;