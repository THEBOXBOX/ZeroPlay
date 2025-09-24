// src/app/Map/components/MapView.tsx - 로컬딜 마커 연동
'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Navigation, Tag, X } from 'lucide-react';
import CategoryFilter from './CategoryFilter';
import BottomSheet from './BottomSheet';
import KakaoMap from './KakaoMap';
import { LocalSpot, CATEGORY_NAMES } from '../lib/api';
import { useLocalSpots } from '../hooks/useLocalSpots';
import { DUMMY_LOCAL_DEALS, hasLocalDeal } from './LocalDealsData';

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

  const containerRef = useRef<HTMLDivElement>(null);
  const floatingButtonBottom = bottomSheetHeight + 15;

  // 훅으로 데이터 가져오기
  const { spots, loading, error } = useLocalSpots(activeCategory, 100);


  const getLocalDealSpots = (): LocalSpot[] => {
    return spots.filter(spot => hasLocalDeal(spot.id));
  };

  // 🔥 지도에 표시할 스팟들 계산
  const getMapSpots = (): LocalSpot[] => {
    if (showLocalDeals) {
      // 로컬딜 모드: 로컬딜 보유 스팟만 표시
      const localDealSpots = getLocalDealSpots();
      console.log('🗺️ 지도에 표시할 로컬딜 스팟:', localDealSpots.length, '개');
      return localDealSpots;
    } else {
      // 일반 모드: 카테고리별 필터링된 스팟들
      if (activeCategory === '전체') {
        return spots;
      } else {
        const categoryKey = {
          '체험': 'experience',
          '문화': 'culture',
          '맛집': 'restaurant',
          '카페': 'cafe'
        }[activeCategory] as 'experience' | 'culture' | 'restaurant' | 'cafe';
        
        if (categoryKey) {
          return spots.filter(spot => spot.category === categoryKey);
        }
        return spots;
      }
    }
  };

  // 마우스 이벤트 처리
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;
      
      const screenHeight = window.innerHeight || 852;
      const maxHeight = Math.min(screenHeight * 0.8, 680);
      const minHeight = 120;
      
      const deltaY = startY - e.clientY;
      const newHeight = Math.min(Math.max(startHeight + deltaY, minHeight), maxHeight);
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

  // 지도 클릭 핸들러
  const handleMapClick = () => {
    console.log('🗺️ [MapView] 지도 클릭 - 툴팁 닫기');
    setTooltipSpot(null);
    
    if (bottomSheetHeight > 120) {
      setBottomSheetHeight(120);
    }
  };

  // 바텀시트 스팟 클릭 핸들러 (상세보기로 전환)
  const handleBottomSheetSpotClick = useCallback((spot: LocalSpot) => {
    console.log('📋 [MapView] 바텀시트에서 스팟 클릭 (상세보기):', spot.name);
    setSelectedSpot(spot);
    setBottomSheetHeight(Math.min(window.innerHeight * 0.8, 680));
    
    // 툴팁 닫기
    setTooltipSpot(null);
  }, []);

  // 🔥 스팟 클릭 핸들러 - useCallback으로 참조 안정화
  const handleSpotClick = useCallback((spot: LocalSpot, screenPosition?: { x: number; y: number }) => {
  console.log('🏪 [MapView] 스팟 클릭:', spot.name);
  
  // 툴팁 표시
  setTooltipSpot(spot);
  
  // 바텀시트 상세모드로 전환
  setSelectedSpot(spot);
  setBottomSheetHeight(Math.min(window.innerHeight * 0.6, 500));
}, []);

  // 툴팁 닫기 핸들러
  const handleTooltipClose = () => {
    console.log('❌ [MapView] 툴팁 닫기');
    setTooltipSpot(null);
  };

  // 뒤로가기 핸들러 (바텀시트 상세보기 모드용)
  const handleBackToList = () => {
    console.log('🔙 [MapView] 리스트 모드로 복귀');
    setSelectedSpot(null);
    setBottomSheetHeight(180);
  };

  const handleGPSClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if ((window as any).moveToCurrentLocation) {
      (window as any).moveToCurrentLocation();
    } else {
      alert('지도가 로딩 중입니다. 잠시 후 다시 시도해주세요.');
    }
  };

  // 🔥 로컬딜 버튼 클릭 핸들러
  const handleLocalDealsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    const newShowLocalDeals = !showLocalDeals;
    console.log('🎟️ [MapView] 로컬딜 모드 전환:', newShowLocalDeals ? 'ON' : 'OFF');
    
    setShowLocalDeals(newShowLocalDeals);
    setShowBottomSheet(true);
    
    if (newShowLocalDeals) {
      // 로컬딜 모드로 전환
      setActiveCategory('');
      console.log('🗺️ 지도를 로컬딜 모드로 전환');
    } else {
      // 일반 모드로 복귀
      setActiveCategory('전체');
      console.log('🗺️ 지도를 일반 모드로 복귀');
    }
    
    // 툴팁 닫기
    setTooltipSpot(null);
    
    // 상세보기에서 리스트로 복귀
    if (selectedSpot) {
      setSelectedSpot(null);
      setBottomSheetHeight(180);
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
          // 카테고리 변경 시 툴팁 닫기
          setTooltipSpot(null);
          
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
          spots={getMapSpots()} // 🔥 필터링된 스팟들만 전달
          onSpotClick={handleSpotClick}
          showLocalDeals={showLocalDeals} // 🔥 로컬딜 모드 정보 전달
        />

        {/* 툴팁 - 좌측 상단 고정 */}
        {tooltipSpot && (
          <div
            className="absolute z-50 bg-white rounded-lg shadow-xl border border-gray-200 p-4 w-72 max-w-xs"
            style={{
              // 🔥 좌측 상단 고정
              left: `20px`,
              top: `20px`,
              animation: 'fadeIn 0.2s ease-out'
            }}
          >
            {/* 헤더 */}
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-sm text-blue-600 font-medium">
                    {CATEGORY_NAMES[tooltipSpot.category] || tooltipSpot.category}
                  </span>
                  {/* 🔥 로컬딜 배지 */}
                  {hasLocalDeal(tooltipSpot.id) && (
                    <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full font-medium">
                      🎟️ 딜
                    </span>
                  )}
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{tooltipSpot.name}</h3>
                <p className="text-sm text-gray-600 mb-2">{tooltipSpot.address}</p>
              </div>
              <button 
                onClick={handleTooltipClose}
                className="ml-2 p-1 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>

            {/* 액션 버튼들 */}
            <div className="flex space-x-2">
              <button 
                onClick={() => {
                  handleBottomSheetSpotClick(tooltipSpot);
                }}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors"
              >
                상세보기
              </button>
            </div>
          </div>
        )}

        {/* GPS 버튼 */}
        <button 
          className="absolute left-3 bg-white rounded-full p-2.5 shadow-lg hover:shadow-xl transition-all z-30"
          style={{ bottom: `${floatingButtonBottom}px` }}
          onClick={handleGPSClick}
        >
          <Navigation className="w-4 h-4 text-gray-600" />
        </button>

        {/* 🔥 로컬딜 플로팅 버튼 */}
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
          spots={spots} // 🔥 전체 스팟 데이터는 바텀시트에서 필터링
          loading={loading}
          selectedSpot={selectedSpot}
          onBackToList={handleBackToList}
          onSpotClick={handleBottomSheetSpotClick}
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