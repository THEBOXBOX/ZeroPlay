// src/app/Map/components/MapView.tsx - 로컬딜 마커 연동
'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Navigation, Tag, X } from 'lucide-react';
import CategoryFilter from './CategoryFilter';
import BottomSheet from './BottomSheet';
import KakaoMap from './KakaoMap';
import { LocalSpot, CATEGORY_NAMES } from '../lib/api';
import { useLocalSpots } from '../hooks/useLocalSpots';

// 🔥 로컬딜 데이터 (BottomSheet와 동일한 데이터)

// 🔥 로컬딜 데이터 (BottomSheet와 동일한 데이터)
const DUMMY_LOCAL_DEALS = [
  // === 체험 (Experience) - 4개 ===
  {
    id: 'deal-001',
    spot_id: '749d64d8-d5a9-4974-81f7-0ab046d75dd0', // 세일화방
    title: '드로잉 클래스 30% 할인!',
    description: '세일화방 원데이 드로잉 클래스 특가 이벤트',
    deal_type: 'PERCENTAGE_DISCOUNT',
    deal_value: '30% 할인',
    original_price: 35000,
    discounted_price: 24500,
    valid_until: '2025-12-31',
    remaining_count: 15,
    is_active: true
  },
  {
    id: 'deal-002',
    spot_id: '1cff6953-5cb7-4053-94c3-ab764eaf106e', // 호미캔즈
    title: '캔들 만들기 체험 1+1',
    description: '캔들 만들기 체험 시 추가 캔들 무료 제공!',
    deal_type: 'BUY_ONE_GET_ONE',
    deal_value: '1+1',
    original_price: 28000,
    discounted_price: 28000,
    valid_until: '2025-10-31',
    remaining_count: 25,
    is_active: true
  },
  {
    id: 'deal-003',
    spot_id: 'b30ebade-7b27-4d07-af80-4ba1b849709b', // 블레싱데이
    title: '체험활동 재료비 무료',
    description: '블레싱데이 체험 프로그램 참가 시 재료비 무료',
    deal_type: 'FREE_ADD_ON',
    deal_value: '재료비 무료',
    original_price: 32000,
    discounted_price: 25000,
    valid_until: '2025-11-30',
    remaining_count: 12,
    is_active: true
  },
  {
    id: 'deal-004',
    spot_id: '1dfcc3a6-b141-44f7-a95e-7e4897f855f2', // 이지댄스 신촌점
    title: '댄스 레슨 첫 달 50% 할인',
    description: '신규 회원 댄스 레슨 첫 달 반값 이벤트',
    deal_type: 'PERCENTAGE_DISCOUNT',
    deal_value: '50% 할인',
    original_price: 120000,
    discounted_price: 60000,
    valid_until: '2025-09-30',
    remaining_count: 8,
    is_active: true
  },

  // === 맛집 (Restaurant) - 6개 ===
  {
    id: 'deal-005',
    spot_id: 'fbc1c663-4cf9-4b07-a93a-49c138545512', // 산울림1992
    title: '런치세트 20% 할인',
    description: '평일 런치타임 세트메뉴 특별 할인',
    deal_type: 'PERCENTAGE_DISCOUNT',
    deal_value: '20% 할인',
    original_price: 15000,
    discounted_price: 12000,
    valid_until: '2025-09-30',
    remaining_count: 30,
    is_active: true
  },
  {
    id: 'deal-006',
    spot_id: '8cb3171c-db90-4d6f-9619-623d19daa6e1', // 신촌형제갈비
    title: '갈비 2인분 주문시 냉면 서비스',
    description: '갈비 2인분 이상 주문 시 물냉면 또는 비빔냉면 무료',
    deal_type: 'FREE_ADD_ON',
    deal_value: '냉면 무료',
    original_price: 45000,
    discounted_price: 45000,
    valid_until: '2025-10-15',
    remaining_count: 50,
    is_active: true
  },
  {
    id: 'deal-007',
    spot_id: '8770c654-8dd2-4da6-9d6e-71be1f92f55a', // 통큰갈비 신촌본점
    title: '4인 세트메뉴 15% 할인',
    description: '가족 세트메뉴 주문 시 15% 할인 혜택',
    deal_type: 'PERCENTAGE_DISCOUNT',
    deal_value: '15% 할인',
    original_price: 80000,
    discounted_price: 68000,
    valid_until: '2025-11-30',
    remaining_count: 20,
    is_active: true
  },
  {
    id: 'deal-008',
    spot_id: 'd7fcaf28-ec8d-4d13-a39c-38abee95707d', // 꼬숑돈까스
    title: '돈까스 + 우동 세트 특가',
    description: '인기 돈까스와 우동 세트메뉴 특별가',
    deal_type: 'SPECIAL_PRICE',
    deal_value: '세트 특가',
    original_price: 13000,
    discounted_price: 9900,
    valid_until: '2025-12-15',
    remaining_count: 40,
    is_active: true
  },
  {
    id: 'deal-009',
    spot_id: 'd4a97b50-6ff8-455b-8a83-0244354a0e2b', // 고삼이 신촌점
    title: '삼겹살 500g 주문시 음료 무료',
    description: '삼겹살 500g 이상 주문 시 생맥주 또는 소주 1병 서비스',
    deal_type: 'FREE_ADD_ON',
    deal_value: '음료 무료',
    original_price: 25000,
    discounted_price: 25000,
    valid_until: '2025-10-31',
    remaining_count: 35,
    is_active: true
  },
  {
    id: 'deal-010',
    spot_id: '715211eb-f127-44f4-bda3-e5f75ae94613', // 신촌수제비
    title: '수제비 2그릇 주문시 1그릇 추가',
    description: '따뜻한 수제비 2그릇 주문 시 1그릇 더 드려요',
    deal_type: 'BUY_TWO_GET_ONE',
    deal_value: '2+1',
    original_price: 16000,
    discounted_price: 16000,
    valid_until: '2025-11-15',
    remaining_count: 25,
    is_active: true
  }
];

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

  // 🔥 로컬딜 헬퍼 함수들 (BottomSheet와 동일)
  const hasLocalDeal = (spotId: string): boolean => {
    return DUMMY_LOCAL_DEALS.some(deal => deal.spot_id === spotId && deal.is_active);
  };

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