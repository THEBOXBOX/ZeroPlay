// src/app/Map/components/MapView.tsx - 디버깅 버전
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Navigation, Tag } from 'lucide-react';
import CategoryFilter from './CategoryFilter';
import BottomSheet from './BottomSheet';
import KakaoMap from './KakaoMap'; // 🔥 기존 KakaoMap으로 되돌림
// import MapWithPins from './MapWithPins'; // 🔥 임시로 주석 처리
import { LocalSpot } from '../lib/api';

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

  // 🔥 기존 드래그 이벤트 처리
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
      />

      {/* 지도 영역 */}
      <div className="flex-1 relative overflow-hidden">
        {/* 🔥 기존 KakaoMap으로 테스트 */}
        <KakaoMap 
          width="100%" 
          height="100%" 
          level={3}
          lat={37.5665}
          lng={126.9780}
          onMapClick={handleMapClick}
          showCurrentLocation={true}
        />

        {/* 🔥 API 데이터 테스트 표시 */}
        <div className="absolute top-2 left-2 bg-white px-3 py-1 rounded-lg shadow-md z-50">
          <div className="text-sm">
            <div>카테고리: {activeCategory}</div>
            <div className="text-xs text-gray-500">
              API 테스트: 콘솔 확인
            </div>
          </div>
        </div>

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
        />
      </div>

      {/* 선택된 스팟 정보 */}
      {selectedSpot && (
        <div className="absolute bottom-2 left-2 right-2 bg-white rounded-lg shadow-lg p-3 z-40">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">{selectedSpot.name}</h3>
              <p className="text-sm text-gray-600">{selectedSpot.address}</p>
              {selectedSpot.price_range && (
                <p className="text-sm text-blue-600">{selectedSpot.price_range}</p>
              )}
            </div>
            <button 
              onClick={() => setSelectedSpot(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapView;