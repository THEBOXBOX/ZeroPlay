'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Navigation, Tag, MapPin } from 'lucide-react';
import CategoryFilter from './CategoryFilter';
import BottomSheet from './BottomSheet';

const MapView = () => {
  const [activeCategory, setActiveCategory] = useState('전체');
  const [showBottomSheet, setShowBottomSheet] = useState(true);
  const [showLocalDeals, setShowLocalDeals] = useState(false);
  const [bottomSheetHeight, setBottomSheetHeight] = useState(180);
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [startHeight, setStartHeight] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // 플로팅 버튼의 bottom 위치 계산 (바텀시트 위에 15px)
  const floatingButtonBottom = bottomSheetHeight + 15;

  // 마우스 이벤트 처리
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;
      
      // 전체 지도 영역에서 바텀시트 최대 높이를 500px로 제한
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
      <div 
        className="flex-1 relative bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden"
        onMouseDown={() => setBottomSheetHeight(120)}
      >
        {/* 지도 패턴 배경 */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23666' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}
        />
        
        {/* 중앙 지도 핀 */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="bg-green-500 rounded-full p-2 shadow-lg">
            <MapPin className="w-5 h-5 text-white" />
          </div>
        </div>

        {/* 로컬딜 마커들 (로컬딜 모드일 때) */}
        {showLocalDeals && (
          <>
            <div className="absolute top-1/3 left-1/3 transform -translate-x-1/2 -translate-y-1/2">
              <div className="bg-red-500 rounded-full p-1.5 shadow-lg animate-pulse">
                <Tag className="w-3 h-3 text-white" />
              </div>
            </div>
            <div className="absolute top-2/3 right-1/3 transform translate-x-1/2 -translate-y-1/2">
              <div className="bg-red-500 rounded-full p-1.5 shadow-lg animate-pulse">
                <Tag className="w-3 h-3 text-white" />
              </div>
            </div>
            <div className="absolute bottom-1/3 left-1/2 transform -translate-x-1/2 translate-y-1/2">
              <div className="bg-red-500 rounded-full p-1.5 shadow-lg animate-pulse">
                <Tag className="w-3 h-3 text-white" />
              </div>
            </div>
          </>
        )}

        {/* GPS 버튼 - 바텀시트 따라다님 */}
        <button 
          className="absolute left-3 bg-white rounded-full p-2.5 shadow-lg hover:shadow-xl transition-all z-30"
          style={{ bottom: `${floatingButtonBottom}px` }}
          onClick={(e) => {
            e.stopPropagation();
            alert('현재 위치로 이동합니다');
          }}
        >
          <Navigation className="w-4 h-4 text-gray-600" />
        </button>

        {/* 로컬딜 버튼 - 바텀시트 따라다님 */}
        <button 
          onClick={(e) => {
            e.stopPropagation();
            setShowLocalDeals(!showLocalDeals);
            setShowBottomSheet(true);
            if (!showLocalDeals) {
              setActiveCategory('');
            } else {
              setActiveCategory('전체');
            }
          }}
          className={`absolute right-3 rounded-full p-2.5 shadow-lg hover:shadow-xl transition-all border-2 z-30 ${
            showLocalDeals 
              ? 'bg-red-500 border-red-500' 
              : 'bg-white border-gray-300 hover:border-gray-400'
          }`}
          style={{ bottom: `${floatingButtonBottom}px` }}
        >
          <Tag className={`w-4 h-4 ${showLocalDeals ? 'text-white' : 'text-gray-600'}`} />
        </button>

        {/* 바텀시트를 지도 영역 안에 배치 */}
        <BottomSheet 
          showBottomSheet={showBottomSheet}
          setShowBottomSheet={setShowBottomSheet}
          bottomSheetHeight={bottomSheetHeight}
          setBottomSheetHeight={setBottomSheetHeight}
          activeCategory={activeCategory}
          showLocalDeals={showLocalDeals}
          handleDragStart={handleDragStart}
          isDragging={isDragging}
          setIsDragging={setIsDragging}
          startY={startY}
          startHeight={startHeight}
          containerRef={containerRef}
        />
      </div>
    </div>
  );
};

export default MapView;