'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Heart, MapPin, ChevronDown } from 'lucide-react';
import { LocalSpot, CATEGORY_MAP_REVERSE } from '../lib/api';
import { toggleBookmark, isBookmarked } from '../utils/bookmarkUtils';
import SpotListItem from './SpotListItem';
import SpotDetailView from './SpotDetailView';

// 정렬 옵션 타입
type SortOption = 'recommended' | 'distance' | 'rating';

// 정렬 드롭다운 컴포넌트
interface SortDropdownProps {
  currentSort: SortOption;
  onSortChange: (sort: SortOption) => void;
  userLocation?: { lat: number; lng: number } | null;
}

const SortDropdown: React.FC<SortDropdownProps> = ({ 
  currentSort, 
  onSortChange,
  userLocation 
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const sortOptions = [
    { value: 'recommended' as SortOption, label: '추천순'},
    { 
      value: 'distance' as SortOption, 
      label: '거리순', 
      disabled: !userLocation 
    },
    { value: 'rating' as SortOption, label: '평점순'}
  ];

  const currentOption = sortOptions.find(option => option.value === currentSort);

  return (
    <div className="relative mt-2">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
      >
        <span className="text-sm"></span>
        <span className="text-sm font-medium text-gray-700">
          {currentOption?.label}
        </span>
        <ChevronDown 
          className={`w-4 h-4 text-gray-500 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`} 
        />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-30"
            onClick={() => setIsOpen(false)}
          />
          
          <div className="absolute top-full right-0 mt-2 w-32 bg-white border border-gray-200 rounded-lg shadow-lg z-40">
            {sortOptions.map((option, index) => (
              <button
                key={option.value}
                onClick={() => {
                  if (!option.disabled) {
                    onSortChange(option.value);
                    setIsOpen(false);
                  }
                }}
                disabled={option.disabled}
                className={`w-full flex items-center space-x-2 px-3 py-2 text-sm text-left hover:bg-gray-50 transition-colors
                  ${option.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                  ${currentSort === option.value ? 'bg-blue-50 text-blue-600' : 'text-gray-700'}
                  ${index === 0 ? 'rounded-t-lg' : ''}
                  ${index === sortOptions.length - 1 ? 'rounded-b-lg' : ''}
                `}
              >
                <span></span>
                <span className="font-medium">{option.label}</span>
                {currentSort === option.value && (
                  <span className="ml-auto text-blue-600">✓</span>
                )}
                {option.disabled && (
                  <span className="ml-auto text-gray-400 text-xs">위치필요</span>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

// 거리 계산 함수 (Haversine formula)
const calculateDistance = (
  lat1: number, 
  lng1: number, 
  lat2: number, 
  lng2: number
): number => {
  const R = 6371; // 지구 반지름 (km)
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// 스팟 정렬 함수
const sortSpots = (
  spots: LocalSpot[], 
  sortBy: SortOption, 
  userLocation?: { lat: number; lng: number } | null
): LocalSpot[] => {
  const sortedSpots = [...spots];

  switch (sortBy) {
    case 'recommended':
      return sortedSpots.sort((a, b) => {
        const aHasLocalDeal = DUMMY_LOCAL_DEALS.some(deal => deal.spot_id === a.id && deal.is_active);
        const bHasLocalDeal = DUMMY_LOCAL_DEALS.some(deal => deal.spot_id === b.id && deal.is_active);
        
        const aScore = (a.rating || 0) * 0.6 + 
                      Math.log(Math.max(a.review_count || 1, 1)) * 0.3 +
                      (aHasLocalDeal ? 0.5 : 0);
        const bScore = (b.rating || 0) * 0.6 + 
                      Math.log(Math.max(b.review_count || 1, 1)) * 0.3 +
                      (bHasLocalDeal ? 0.5 : 0);
        return bScore - aScore;
      });

    case 'distance':
      if (!userLocation) return sortedSpots;
      
      return sortedSpots.sort((a, b) => {
        const distanceA = calculateDistance(
          userLocation.lat, 
          userLocation.lng, 
          a.latitude, 
          a.longitude
        );
        const distanceB = calculateDistance(
          userLocation.lat, 
          userLocation.lng, 
          b.latitude, 
          b.longitude
        );
        return distanceA - distanceB;
      });

    case 'rating':
      return sortedSpots.sort((a, b) => {
        const ratingA = a.rating || 0;
        const ratingB = b.rating || 0;
        if (ratingA === ratingB) {
          return (b.review_count || 0) - (a.review_count || 0);
        }
        return ratingB - ratingA;
      });

    default:
      return sortedSpots;
  }
};

// 거리 포맷 함수
const formatDistance = (
  userLocation: { lat: number; lng: number } | null,
  spot: LocalSpot
): string => {
  if (!userLocation) return '';
  
  const distance = calculateDistance(
    userLocation.lat,
    userLocation.lng,
    spot.latitude,
    spot.longitude
  );
  
  if (distance < 1) {
    return `${Math.round(distance * 1000)}m`;
  } else {
    return `${distance.toFixed(1)}km`;
  }
};

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

// 실제 DB 연결된 로컬딜 데이터
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
  const [bookmarkStatuses, setBookmarkStatuses] = useState<Record<string, boolean>>({});
  const [bookmarkLoading, setBookmarkLoading] = useState(true);
  
  // 정렬 관련 State
  const [sortBy, setSortBy] = useState<SortOption>('recommended');
  const [userLocation, setUserLocation] = useState<{lat: number; lng: number} | null>(null);
  
  // 쿠폰 받기 상태 관리
  const [receivedCoupons, setReceivedCoupons] = useState<Set<string>>(new Set());
  
  const userId = getUserId();

  // 로컬딜 관련 헬퍼 함수들
  const hasLocalDeal = (spotId: string): boolean => {
    return DUMMY_LOCAL_DEALS.some(deal => deal.spot_id === spotId && deal.is_active);
  };

  const getLocalDealForSpot = (spotId: string): LocalDeal | undefined => {
    return DUMMY_LOCAL_DEALS.find(deal => deal.spot_id === spotId && deal.is_active);
  };

  // 현재 위치 가져오기
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.warn('위치 정보를 가져올 수 없습니다:', error);
        }
      );
    }
  }, []);

  // 표시할 데이터 계산 (메모이제이션)
  const displayData = useMemo((): LocalSpot[] => {
    if (showLocalDeals) {
      const localDealSpots = spots.filter(spot => hasLocalDeal(spot.id));
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
  }, [spots, showLocalDeals, activeCategory]);

  // 정렬된 데이터 계산
  const sortedDisplayData = useMemo((): LocalSpot[] => {
    return sortSpots(displayData, sortBy, userLocation);
  }, [displayData, sortBy, userLocation]);

  // 북마크 상태 일괄 조회
  useEffect(() => {
    const loadBookmarkStatuses = async () => {
      if (sortedDisplayData.length === 0) {
        setBookmarkLoading(false);
        return;
      }
      
      try {
        setBookmarkLoading(true);
        
        // 모든 스팟의 북마크 상태를 병렬로 조회
        const statusPromises = sortedDisplayData.map(async (spot) => {
          try {
            const result = await isBookmarked(userId, spot.id, 'spot');
            return { 
              id: spot.id, 
              isBookmarked: result.success ? (result.isBookmarked || false) : false 
            };
          } catch (error) {
            console.warn(`북마크 상태 조회 실패 (${spot.id}):`, error);
            return { id: spot.id, isBookmarked: false };
          }
        });
        
        const results = await Promise.all(statusPromises);
        const statusMap: Record<string, boolean> = {};
        results.forEach(({ id, isBookmarked }) => {
          statusMap[id] = isBookmarked;
        });
        setBookmarkStatuses(statusMap);
        
      } catch (error) {
        console.error('북마크 상태 일괄 조회 실패:', error);
        // 실패 시 모든 항목을 false로 설정
        const fallbackStatuses: Record<string, boolean> = {};
        sortedDisplayData.forEach(spot => {
          fallbackStatuses[spot.id] = false;
        });
        setBookmarkStatuses(fallbackStatuses);
      } finally {
        setBookmarkLoading(false);
      }
    };

    loadBookmarkStatuses();
  }, [sortedDisplayData, userId]);

  // 북마크 토글 핸들러
  const handleBookmarkToggle = async (spotId: string, currentStatus: boolean) => {
    try {
      // UI 즉시 업데이트 (낙관적 업데이트)
      setBookmarkStatuses(prev => ({
        ...prev,
        [spotId]: !currentStatus
      }));

      // 실제 API 호출
      const result = await toggleBookmark(userId, spotId, 'spot');
      
      if (result.success) {
        // API 응답으로 실제 상태 업데이트
        setBookmarkStatuses(prev => ({
          ...prev,
          [spotId]: result.isBookmarked || false
        }));
      } else {
        // 실패 시 UI 되돌리기
        setBookmarkStatuses(prev => ({
          ...prev,
          [spotId]: currentStatus
        }));
        console.error('북마크 토글 실패:', result.error);
      }
      
    } catch (error) {
      console.error('북마크 토글 실패:', error);
      // 실패 시 UI 되돌리기
      setBookmarkStatuses(prev => ({
        ...prev,
        [spotId]: currentStatus
      }));
    }
  };


  // 로컬딜 쿠폰 받기
  const handleGetCoupon = (deal: LocalDeal) => {
    // 이미 받은 쿠폰인지 확인
    if (receivedCoupons.has(deal.id)) {
      alert('이미 받은 쿠폰입니다! 🎟️');
      return;
    }

    // 쿠폰 받기 처리
    setReceivedCoupons(prev => new Set([...prev, deal.id]));
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

  // 경량화된 북마크 버튼 컴포넌트
  const OptimizedBookmarkButton: React.FC<{
    spotId: string;
    variant?: 'default' | 'icon-only';
    className?: string;
  }> = ({ spotId, variant = 'default', className = '' }) => {
    const isBookmarkedState = bookmarkStatuses[spotId] || false;
    
    const handleClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      handleBookmarkToggle(spotId, isBookmarkedState);
    };

    if (variant === 'icon-only') {
      return (
        <button 
          onClick={handleClick}
          className={`${className}`}
          disabled={bookmarkLoading}
        >
          <Heart 
            className={`w-5 h-5 transition-colors ${
              isBookmarkedState 
                ? 'text-red-500 fill-red-500' 
                : 'text-gray-400 hover:text-red-400'
            }`} 
          />
        </button>
      );
    }

    return (
      <button 
        onClick={handleClick}
        className={`flex items-center space-x-2 px-3 py-2 border rounded-lg transition-colors ${
          isBookmarkedState 
            ? 'border-red-200 bg-red-50 text-red-600' 
            : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-red-200 hover:bg-red-50 hover:text-red-600'
        } ${className}`}
        disabled={bookmarkLoading}
      >
        <Heart 
          className={`w-4 h-4 ${
            isBookmarkedState ? 'fill-red-500 text-red-500' : ''
          }`} 
        />
        <span className="text-sm">
          {isBookmarkedState ? '저장됨' : '저장'}
        </span>
      </button>
    );
  };

  // 리스트 모드 렌더링
  const renderListMode = () => {
    const titleText = showLocalDeals ? '로컬딜 가게 목록' : `${activeCategory} 목록`;

    return (
      <div className="h-full flex flex-col">
        {/* 헤더 */}
        <div className="px-4 pb-3 border-b border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-900">
              {titleText}
            </h3>
            
            {/* 정렬 드롭다운 */}
            <div className="mt-1">
              <SortDropdown 
                currentSort={sortBy}
                onSortChange={setSortBy}
                userLocation={userLocation}
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-3 text-sm text-gray-500">
            <span>{sortedDisplayData.length}개의 장소</span>
            {showLocalDeals && (
              <span className="text-green-600 font-medium">🎟️ 쿠폰 제공</span>
            )}
            {(loading || bookmarkLoading) && (
              <div className="flex items-center space-x-1">
                <div className="animate-spin w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                <span>{loading ? '로딩중' : '북마크 로딩중'}</span>
              </div>
            )}
          </div>
        </div>

        {/* 스팟 리스트 */}
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          {sortedDisplayData.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-gray-500">
              <MapPin className="w-8 h-8 mb-2" />
              <p className="text-sm">
                {showLocalDeals ? '로컬딜을 제공하는 가게가 없습니다' : '해당 카테고리의 스팟이 없습니다'}
              </p>
            </div>
          ) : (
            <div className="space-y-0">
              {sortedDisplayData.map((spot: LocalSpot, index) => {
                const businessStatus = getBusinessStatus(spot);
                const spotDeal = getLocalDealForSpot(spot.id);
                const distance = userLocation ? formatDistance(userLocation, spot) : '';
                
                return (
                  <SpotListItem
                    key={spot.id}
                    spot={spot}
                    index={index}
                    sortBy={sortBy}
                    userLocation={userLocation}
                    spotDeal={spotDeal}
                    distance={distance}
                    businessStatus={businessStatus}
                    bookmarkStatuses={bookmarkStatuses}
                    bookmarkLoading={bookmarkLoading}
                    onSpotClick={onSpotClick}
                    onBookmarkToggle={handleBookmarkToggle}
                  />
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
          {selectedSpot ? (
            <SpotDetailView
              spot={selectedSpot}
              currentImageIndex={currentImageIndex}
              onPrevImage={goToPrevImage}
              onNextImage={goToNextImage}
              onBackToList={onBackToList}
              bookmarkStatuses={bookmarkStatuses}
              bookmarkLoading={bookmarkLoading}
              onBookmarkToggle={handleBookmarkToggle}
              localDeals={DUMMY_LOCAL_DEALS}
              receivedCoupons={receivedCoupons}
              onReceiveCoupon={handleGetCoupon}
            />
          ) : (
            renderListMode()
          )}
      </div>
    </div>
  );
};

export default BottomSheet;