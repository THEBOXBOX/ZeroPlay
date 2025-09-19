// src/app/Map/components/BottomSheet.tsx - 완전한 구조
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
  Bookmark 
} from 'lucide-react';
import { LocalSpot, CATEGORY_MAP_REVERSE } from '../lib/api';
import { toggleBookmark, isBookmarked } from '../utils/bookmarkUtils';

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
    // 브라우저에서만 실행되도록 체크
    if (typeof window !== 'undefined' && 'crypto' in window && 'randomUUID' in window.crypto) {
      return window.crypto.randomUUID();
    }
    // 폴백: 간단한 UUID v4 생성
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

  // 🔥 로컬스토리지에서 사용자 ID 가져오기 또는 생성
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
  // ================================
  // 🔥 모든 State를 컴포넌트 최상위에 위치
  // ================================
  const [isSpotBookmarked, setIsSpotBookmarked] = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // 임시 사용자 ID (실제로는 인증 시스템에서 가져와야 함)
  const userId = getUserId();

  // ================================
  // 🔥 useEffect - 북마크 상태 확인
  // ================================
  useEffect(() => {
    const checkBookmarkStatus = async () => {
      if (!selectedSpot) {
        setIsSpotBookmarked(false);
        setCurrentImageIndex(0);
        return;
      }
      
      console.log('🔍 북마크 상태 확인 중...', {
        userId,
        spotId: selectedSpot.id,
        spotName: selectedSpot.name
      });

      try {
        const result = await isBookmarked(userId, selectedSpot.id, 'spot');
        console.log('✅ 북마크 확인 결과:', result);
        
        if (result.success) {
          setIsSpotBookmarked(result.isBookmarked || false);
        } else {
          console.error('❌ 북마크 확인 실패:', result.error);
        }
        setCurrentImageIndex(0);
      } catch (error) {
        console.error('💥 북마크 상태 확인 오류:', error);
      }
    };

    checkBookmarkStatus();
  }, [selectedSpot?.id, userId]);

  // ================================
  // 🔥 핸들러 함수들
  // ================================
  
  // 북마크 토글 함수
  const handleBookmarkToggle = async () => {
    if (!selectedSpot) return;
    
    console.log('🔖 북마크 토글 시작:', {
      userId,
      spotId: selectedSpot.id,
      spotName: selectedSpot.name
    });
    setBookmarkLoading(true);
    
    try {
      const result = await toggleBookmark(userId, selectedSpot.id, 'spot');
      
      console.log('🔖 북마크 토글 결과:', result);

      if (result.success) {
        setIsSpotBookmarked(result.isBookmarked || false);
        
        const message = result.isBookmarked ? 
          `${selectedSpot.name}이(가) 북마크에 추가되었습니다.` : 
          `${selectedSpot.name}이(가) 북마크에서 제거되었습니다.`;
        
        console.log('✅', message);

      } else {
        console.error('북마크 처리 실패:', result.error);
        alert(result.error || '북마크 처리 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('북마크 토글 오류:', error);
      alert('북마크 처리 중 오류가 발생했습니다.');
    } finally {
      setBookmarkLoading(false);
    }
  };

  // 이미지 네비게이션 함수들
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

  // 터치 이벤트 핸들러
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !containerRef.current) return;
    e.preventDefault();
    
    const screenHeight = window.innerHeight || 852;
    const maxHeight = Math.min(screenHeight * 0.8, 680); // 최대 680px
    const minHeight = 120;
    
    const deltaY = startY - e.touches[0].clientY;
    const newHeight = Math.min(Math.max(startHeight + deltaY, minHeight), maxHeight);
    setBottomSheetHeight(newHeight);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
  };

  // ================================
  // 🔥 유틸리티 함수들
  // ================================
  
  const isDetailMode = !!selectedSpot;

  const getDisplayData = (): LocalSpot[] => {
    if (showLocalDeals) {
      return spots;
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

  // ================================
  // 🔥 컴포넌트들
  // ================================
  
  // 북마크 버튼 컴포넌트
  const BookmarkButton = () => (
    <button 
      onClick={handleBookmarkToggle}
      disabled={bookmarkLoading}
      className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 ${
        isSpotBookmarked
          ? 'bg-red-50 hover:bg-red-100 text-red-600 border border-red-200'
          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
      } ${bookmarkLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <Bookmark 
        className={`w-4 h-4 ${
          isSpotBookmarked ? 'fill-red-500 text-red-500' : 'text-gray-500'
        }`}
      />
      <span>
        {bookmarkLoading ? '처리중...' : isSpotBookmarked ? '북마크됨' : '북마크'}
      </span>
    </button>
  );

  // ================================
  // 🔥 렌더링 함수들
  // ================================
  
  // 상세정보 모드 렌더링
  const renderDetailMode = () => {
    if (!selectedSpot) return null;
    
    const businessStatus = getBusinessStatus(selectedSpot);
    const hasMultipleImages = selectedSpot.images && selectedSpot.images.length > 1;

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
                
                {/* 이미지 네비게이션 */}
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
                    
                    {/* 이미지 인디케이터 */}
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
            <BookmarkButton />
            
            {selectedSpot.reservation_link && (
              <button 
                onClick={() => {
                  window.open(selectedSpot.reservation_link, '_blank');
                }}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
              >
                <ExternalLink className="w-4 h-4" />
                <span>사이트 이동</span>
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
    const titleText = showLocalDeals ? '로컬딜 목록' : `${activeCategory} 목록`;

    return (
      <div className="h-full flex flex-col">
        {/* 헤더 */}
        <div className="px-4 pb-3 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">
            {titleText}
          </h3>
          <div className="flex items-center space-x-3 text-sm text-gray-500 mt-1">
            <span>{displayData.length}개의 장소</span>
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
              <p className="text-sm">해당 카테고리의 스팟이 없습니다</p>
            </div>
          ) : (
            <div className="space-y-0">
              {displayData.map((spot: LocalSpot) => {
                const businessStatus = getBusinessStatus(spot);
                
                return (
                  <div 
                    key={spot.id} 
                    className="flex items-center space-x-3 p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => {
                      console.log('🏪 바텀시트에서 스팟 클릭:', spot.name);
                      if (onSpotClick) {
                        onSpotClick(spot);
                      }
                    }}
                  >
                    {/* 스팟 아이콘 */}
                    <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center text-xl flex-shrink-0">
                      {getCategoryIcon(spot.category)}
                    </div>

                    {/* 스팟 정보 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-xs text-gray-500 px-2 py-1 bg-gray-100 rounded-full">
                          {getCategoryName(spot.category)}
                        </span>
                        {showLocalDeals && (
                          <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full font-medium">
                            할인
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

                    {/* 북마크 버튼 (리스트용) */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        console.log('🔖 리스트에서 북마크 토글:', spot.name);
                      }}
                      className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                    >
                      <Bookmark className="w-5 h-5 text-gray-400" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  };

  // ================================
  // 🔥 메인 렌더링
  // ================================
  
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