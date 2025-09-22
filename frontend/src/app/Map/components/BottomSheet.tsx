// src/app/Map/components/BottomSheet.tsx - 로컬딜 통합 버전 (수정)
'use client';

import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Heart, 
  Navigation, 
  MapPin, 
  Tag, 
  Phone, 
  Clock, 
  Star, 
  ArrowLeft, 
  ExternalLink, 
  Share2,
  Bookmark,
  Ticket 
} from 'lucide-react';
import { LocalSpot, CATEGORY_MAP_REVERSE } from '../lib/api';
import { toggleBookmark, isBookmarked } from '../utils/bookmarkUtils';
import BookmarkButton from './BookmarkButton';

// 로컬딜 데이터 타입
interface LocalDeal {
  id: string;
  spot_id: string;
  title: string;
  description: string;
  deal_type: string;
  deal_value: string;
  original_price: number;
  discounted_price: number;
  deal_image?: string;
  valid_until: string;
  remaining_count: number;
  is_active: boolean;
}

// 🔥 실제 DB 연결된 로컬딜 데이터!
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

// Props 인터페이스
interface BottomSheetProps {
  showBottomSheet: boolean;
  setShowBottomSheet: (show: boolean) => void;
  bottomSheetHeight: number;
  setBottomSheetHeight: (height: number) => void;
  activeCategory: string;
  showLocalDeals: boolean;
  handleDragStart: (clientY: number) => void;
  isDragging: boolean;
  startY: number;
  startHeight: number;
  containerRef: React.RefObject<HTMLDivElement | null>;
  spots: LocalSpot[];
  loading?: boolean;
  selectedSpot?: LocalSpot | null;
  onBackToList?: () => void;
  onSpotClick?: (spot: LocalSpot) => void;
}

const generateTempUserId = (): string => {
    if (typeof window !== 'undefined' && 'crypto' in window && 'randomUUID' in window.crypto) {
      return window.crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

  const getUserId = (): string => {
    if (typeof window === 'undefined') return '00000000-0000-4000-8000-000000000000';
    
    let userId = localStorage.getItem('temp_user_id');
    if (!userId) {
      userId = generateTempUserId();
      localStorage.setItem('temp_user_id', userId);
    }
    return userId;
  };

const BottomSheet: React.FC<BottomSheetProps> = ({
  showBottomSheet,
  setShowBottomSheet,
  bottomSheetHeight,
  setBottomSheetHeight,
  activeCategory,
  showLocalDeals,
  handleDragStart,
  isDragging,
  startY,
  startHeight,
  containerRef,
  spots,
  loading = false,
  selectedSpot = null,
  onBackToList,
  onSpotClick,
}) => {
  // State
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const userId = getUserId();

  // 로컬딜 관련 헬퍼 함수들
  const hasLocalDeal = (spotId: string): boolean => {
    return DUMMY_LOCAL_DEALS.some(deal => deal.spot_id === spotId && deal.is_active);
  };

  const getLocalDealForSpot = (spotId: string): LocalDeal | undefined => {
    return DUMMY_LOCAL_DEALS.find(deal => deal.spot_id === spotId && deal.is_active);
  };

  const getLocalDealSpots = (): LocalSpot[] => {
    return spots.filter(spot => hasLocalDeal(spot.id));
  };

  // 로컬딜 쿠폰 받기
  const handleGetCoupon = (deal: LocalDeal) => {
    alert(`${deal.title} 쿠폰을 받았습니다! 🎉`);
    // 실제로는 쿠폰 저장 API 호출
    console.log('🎟️ 쿠폰 발급:', deal);
  };

  // 이미지 네비게이션
  const goToPrevImage = () => {
    if (!selectedSpot?.images) return;
    setCurrentImageIndex(prev => 
      prev === 0 ? selectedSpot.images!.length - 1 : prev - 1
    );
  };

  const goToNextImage = () => {
    if (!selectedSpot?.images) return;
    setCurrentImageIndex(prev => 
      prev === selectedSpot.images!.length - 1 ? 0 : prev + 1
    );
  };

  // 터치 이벤트
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !containerRef.current) return;
    e.preventDefault();
    
    const screenHeight = window.innerHeight || 852;
    const maxHeight = Math.min(screenHeight * 0.8, 680);
    const minHeight = 120;
    
    const deltaY = startY - e.touches[0].clientY;
    const newHeight = Math.min(Math.max(startHeight + deltaY, minHeight), maxHeight);
    setBottomSheetHeight(newHeight);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
  };

  // 유틸리티 함수들
  const isDetailMode = !!selectedSpot;

  const getDisplayData = (): LocalSpot[] => {
    if (showLocalDeals) {
      const localDealSpots = getLocalDealSpots();
      console.log('🎟️ 로컬딜 보유 스팟:', localDealSpots.length, '개');
      return localDealSpots;
    } else if (activeCategory === '전체') {
      return spots;
    } else {
      const categoryKey = {
        '체험': 'experience',
        '문화': 'culture',
        '맛집': 'restaurant',
        '카페': 'cafe'
      }[activeCategory] as keyof typeof CATEGORY_MAP_REVERSE;
      
      if (categoryKey) {
        return spots.filter(spot => spot.category === categoryKey);
      }
      return spots;
    }
  };

  const getCategoryIcon = (category: LocalSpot['category']) => {
    const icons = {
      experience: '🎨',
      culture: '🏛️',
      restaurant: '🍽️',
      cafe: '☕',
    };
    return icons[category] || '📍';
  };

  const getCategoryName = (category: LocalSpot['category']) => {
    return CATEGORY_MAP_REVERSE[category] || category;
  };

  const getBusinessStatus = (spot: LocalSpot) => {
    if (!spot.is_active) return { status: '운영종료', color: 'text-gray-500' };
    
    const now = new Date();
    const hour = now.getHours();
    
    if (hour >= 9 && hour < 22) {
      return { status: '영업중', color: 'text-green-600' };
    } else {
      return { status: '영업종료', color: 'text-orange-500' };
    }
  };

  // 북마크 버튼 컴포넌트

  // 상세정보 모드 렌더링
  const renderDetailMode = () => {
    if (!selectedSpot) return null;
    
    const businessStatus = getBusinessStatus(selectedSpot);
    const hasMultipleImages = selectedSpot.images && selectedSpot.images.length > 1;
    const localDeal = getLocalDealForSpot(selectedSpot.id);

    return (
      <div className="h-full flex flex-col">
        {/* 헤더 */}
        <div className="flex items-center p-4 border-b border-gray-100">
          <button 
            onClick={onBackToList}
            className="mr-3 p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h3 className="text-lg font-semibold text-gray-900 flex-1">
            {selectedSpot.name}
          </h3>
          <span className={`text-sm font-medium ${businessStatus.color}`}>
            {businessStatus.status}
          </span>
        </div>

        {/* 스크롤 가능한 내용 */}
        <div className="flex-1 overflow-y-auto">

          {/* 이미지 섹션 */}
          {selectedSpot.images && selectedSpot.images.length > 0 && (
            <div className="relative">
              <div className="aspect-video bg-gray-200 overflow-hidden">
                <img 
                  src={selectedSpot.images[currentImageIndex]} 
                  alt={selectedSpot.name}
                  className="w-full h-full object-cover"
                />
                
                {hasMultipleImages && (
                  <>
                    <button 
                      onClick={goToPrevImage}
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white rounded-full p-2 transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={goToNextImage}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white rounded-full p-2 transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                    
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                      {selectedSpot.images.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`w-2 h-2 rounded-full transition-colors ${
                            index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* 로컬딜 섹션 */}
          {localDeal && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-3 m-4 mb-2">
              <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Ticket className="w-4 h-4 text-green-600" />
                <span className="font-bold text-green-700 text-sm">로컬딜 쿠폰</span>
                <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {localDeal.remaining_count}개 남음
                </span>
              </div>
              <span className="text-lg font-bold text-green-600">
                {localDeal.deal_value}
              </span>
            </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-gray-800 text-sm mb-1">
                    {localDeal.title}
                  </h4>
                  <p className="text-xs text-gray-500">
                    {localDeal.valid_until}까지 유효
                  </p>
                </div>
                <button 
                  onClick={() => handleGetCoupon(localDeal)}
                  className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors"
                >
                  쿠폰 받기
                </button>
              </div>
            </div>
          )}
          
          {/* 기본 정보 */}
          <div className="p-4 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-lg">{getCategoryIcon(selectedSpot.category)}</span>
                  <span className="text-sm text-blue-600 font-medium">
                    {getCategoryName(selectedSpot.category)}
                  </span>
                  {selectedSpot.rating && selectedSpot.rating > 0 && (
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm text-gray-600">
                        {selectedSpot.rating} ({selectedSpot.review_count || 0})
                      </span>
                    </div>
                  )}
                </div>
                
                {selectedSpot.description && (
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {selectedSpot.description}
                  </p>
                )}
              </div>
            </div>

            {/* 상세 정보 */}
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700 text-sm">{selectedSpot.address}</span>
              </div>
              
              {selectedSpot.operating_hours && (
                <div className="flex items-start space-x-3">
                  <Clock className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 text-sm">
                    {typeof selectedSpot.operating_hours === 'string' 
                      ? selectedSpot.operating_hours 
                      : '운영시간 정보'}
                  </span>
                </div>
              )}
              
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-gray-400 flex-shrink-0" />
                <button 
                  onClick={() => {
                    window.location.href = `tel:02-1234-5678`;
                  }}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  02-1234-5678
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 하단 액션 버튼들 */}
        <div className="border-t border-gray-100 p-4">
          <div className="flex space-x-3">
            <BookmarkButton
              itemId={selectedSpot.id}
              itemType="spot"
              variant="default"
              onStatusChange={(isBookmarked) => {
                const message = isBookmarked 
                  ? `${selectedSpot.name}이(가) 북마크에 추가되었습니다.`
                  : `${selectedSpot.name}이(가) 북마크에서 제거되었습니다.`;
                console.log(message);
              }}
            />
            
            {selectedSpot.reservation_link && (
              <button 
                onClick={() => {
                  window.open(selectedSpot.reservation_link, '_blank');
                }}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
              >
                <ExternalLink className="w-4 h-4" />
                <span>예약하기</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  // 리스트 모드 렌더링
  const renderListMode = () => {
    const displayData = getDisplayData();
    const titleText = showLocalDeals ? '로컬딜 가게 목록' : `${activeCategory} 목록`;

    return (
      <div className="h-full flex flex-col">
        {/* 헤더 */}
        <div className="px-4 pb-3 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">
            {titleText}
          </h3>
          <div className="flex items-center space-x-3 text-sm text-gray-500 mt-1">
            <span>{displayData.length}개의 장소</span>
            {showLocalDeals && (
              <span className="text-green-600 font-medium">🎟️ 쿠폰 제공</span>
            )}
            {loading && (
              <div className="flex items-center space-x-1">
                <div className="animate-spin w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                <span>로딩중</span>
              </div>
            )}
          </div>
        </div>

        {/* 스팟 리스트 */}
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          {displayData.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-gray-500">
              <MapPin className="w-8 h-8 mb-2" />
              <p className="text-sm">
                {showLocalDeals ? '로컬딜을 제공하는 가게가 없습니다' : '해당 카테고리의 스팟이 없습니다'}
              </p>
            </div>
          ) : (
            <div className="space-y-0">
              {displayData.map((spot: LocalSpot) => {
                const businessStatus = getBusinessStatus(spot);
                const spotDeal = getLocalDealForSpot(spot.id);
                
                return (
                  <div 
                    key={spot.id} 
                    className="flex items-center space-x-3 p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => {
                      if (onSpotClick) {
                        onSpotClick(spot);
                      }
                    }}
                  >
                    {/* 스팟 아이콘 */}
                    <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center text-xl flex-shrink-0 relative">
                      {getCategoryIcon(spot.category)}
                      {spotDeal && (
                        <div className="absolute -top-1 -right-1 bg-green-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                          🎟️
                        </div>
                      )}
                    </div>

                    {/* 스팟 정보 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-xs text-gray-500 px-2 py-1 bg-gray-100 rounded-full">
                          {getCategoryName(spot.category)}
                        </span>
                        {spotDeal && (
                          <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full font-medium">
                            {spotDeal.deal_value}
                          </span>
                        )}
                      </div>
                      
                      <h3 className="font-semibold text-gray-900 mb-1 truncate text-base">
                        {spot.name}
                      </h3>
                      
                      <p className="text-sm text-gray-600 mb-2 truncate">
                        {spot.address}
                      </p>
                      
                      <div className="flex items-center space-x-3 mb-2">
                        <span className={`text-sm font-medium ${businessStatus.color}`}>
                          {businessStatus.status}
                        </span>
                        {spot.price_range && (
                          <span className="text-sm text-blue-600 font-medium">
                            {spot.price_range}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1">
                          {spot.rating ? (
                            <>
                              <Star className="w-3 h-3 text-yellow-500 fill-current" />
                              <span className="text-sm text-gray-600">
                                {spot.rating.toFixed(1)}
                              </span>
                              {spot.review_count && (
                                <span className="text-sm text-gray-400">
                                  ({spot.review_count})
                                </span>
                              )}
                            </>
                          ) : (
                            <span className="text-sm text-gray-400">평점 없음</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* 북마크 버튼 */}
                      <BookmarkButton
                        itemId={spot.id}
                        itemType="spot"
                        variant="icon-only"
                        className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                      />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  };

  if (!showBottomSheet) return null;

  const DRAG_HANDLE_HEIGHT = 12;
  const contentHeight = bottomSheetHeight - DRAG_HANDLE_HEIGHT;

  return (
    <div
      className={`absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl transition-all duration-300 ease-out z-20 ${
        showBottomSheet ? 'translate-y-0' : 'translate-y-full'
      }`}
      style={{ height: `${bottomSheetHeight}px` }}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* 드래그 핸들 */}
      <div 
        className="flex justify-center pt-2 pb-1 cursor-grab active:cursor-grabbing"
        style={{ height: `${DRAG_HANDLE_HEIGHT}px` }}
        onMouseDown={(e) => {
          e.preventDefault();
          handleDragStart(e.clientY);
        }}
        onTouchStart={(e) => {
          e.preventDefault();
          if (e.touches.length === 1) {
            handleDragStart(e.touches[0].clientY);
          }
        }}
      >
        <div className="w-10 h-1 bg-gray-300 rounded-full"></div>
      </div>

      {/* 콘텐츠 */}
      <div 
        className="overflow-hidden"
        style={{ height: `${contentHeight}px` }}
      >
        {isDetailMode ? renderDetailMode() : renderListMode()}
      </div>
    </div>
  );
};

export default BottomSheet;