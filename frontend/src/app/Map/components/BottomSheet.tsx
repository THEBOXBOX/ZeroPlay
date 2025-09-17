// src/app/Map/components/BottomSheet.tsx - 상세정보 모드 추가
'use client';

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Bookmark, Navigation, MapPin, Tag, Phone, Clock, Star, ArrowLeft, ExternalLink, Share2 } from 'lucide-react';
import { LocalSpot, CATEGORY_MAP_REVERSE } from '../lib/api';

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
  // 🔥 모드 판단: selectedSpot이 있으면 상세정보 모드
  const isDetailMode = !!selectedSpot;

  // 실제 데이터 필터링 (리스트 모드용)
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

  const displayData = getDisplayData();
  
  // 카테고리 관련 함수들
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

  // 터치 이벤트 핸들러
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !containerRef.current) return;
    e.preventDefault();
    
    const maxHeight = 500;
    const deltaY = startY - e.touches[0].clientY;
    const newHeight = Math.min(Math.max(startHeight + deltaY, 120), maxHeight);
    setBottomSheetHeight(newHeight);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
  };

  // 🔥 상세정보 모드 렌더링
  const renderDetailMode = () => {
    if (!selectedSpot) return null;
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    
    const businessStatus = getBusinessStatus(selectedSpot);
    const hasMultipleImages = selectedSpot.images && selectedSpot.images.length > 1;

      // 이미지 네비게이션 함수들
    const goToPrevImage = () => {
      if (!selectedSpot.images) return;
      setCurrentImageIndex(prev => 
        prev === 0 ? selectedSpot.images!.length - 1 : prev - 1
      );
    };

    const goToNextImage = () => {
      if (!selectedSpot.images) return;
      setCurrentImageIndex(prev => 
        prev === selectedSpot.images!.length - 1 ? 0 : prev + 1
      );
    };

    return (
      <div className="h-full flex flex-col">
        {/* 헤더 - 뒤로가기 버튼 */}
        <div className="px-4 py-3 border-b border-gray-100 flex items-center space-x-3">
          <button 
            onClick={() => {
              console.log('🔙 뒤로가기 클릭');
              if (onBackToList) {
                onBackToList();
              }
            }}
            className="p-1 rounded-full hover:bg-gray-100"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-gray-900">{selectedSpot.name}</h2>
            <span className="text-sm text-gray-500">{getCategoryName(selectedSpot.category)}</span>
          </div>
          <button className="p-1 rounded-full hover:bg-gray-100">
            <Share2 className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* 스크롤 가능한 상세 컨텐츠 */}
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          {/* 🔥 이미지 갤러리 - 수정된 부분 */}
          <div className="relative">
            {selectedSpot.images && selectedSpot.images.length > 0 ? (
              <div className="h-48 bg-gray-200 relative overflow-hidden group">
                
                <img 
                src={selectedSpot.images[currentImageIndex]}
                alt={`${selectedSpot.name} - ${currentImageIndex + 1}`}
                className="w-full h-full object-cover transition-opacity duration-300"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  console.error('Image load failed:', target.src);
                  target.style.display = 'none';
                }}
                onLoad={() => {
                  console.log('✅ 이미지 로드 성공!', currentImageIndex + 1);
                }}
              />

              {/* 좌우 화살표 (이미지가 여러개일 때만) */}
              {hasMultipleImages && (
                <>
                  <button 
                    onClick={goToPrevImage}
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  
                  <button 
                    onClick={goToNextImage}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}

              {/* 이미지 카운터 */}
              {hasMultipleImages && (
                <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded-full">
                  {currentImageIndex + 1}/{selectedSpot.images.length}
                </div>
              )}

              {/* 🔥 점 인디케이터 (이미지가 여러개일 때) */}
              {hasMultipleImages && (
                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
                  {selectedSpot.images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                        index === currentImageIndex 
                          ? 'bg-white' 
                          : 'bg-white bg-opacity-50'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
            ) : (
              <div className="h-48 bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl mb-2">{getCategoryIcon(selectedSpot.category)}</div>
                  <p className="text-gray-600 text-sm">이미지 없음</p>
                </div>
              </div>
            )}
          </div>

          {/* 기본 정보 */}
          <div className="p-4 space-y-4">
            {/* 영업 상태 & 가격 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className={`text-sm font-medium ${businessStatus.color}`}>
                  {businessStatus.status}
                </span>
                {selectedSpot.price_range && (
                  <span className="text-sm bg-blue-100 text-blue-600 px-2 py-1 rounded-full font-medium">
                    {selectedSpot.price_range}
                  </span>
                )}
              </div>
              
              {/* 평점 */}
              {selectedSpot.rating && (
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  <span className="font-medium">{selectedSpot.rating.toFixed(1)}</span>
                  {selectedSpot.review_count && (
                    <span className="text-gray-500 text-sm">({selectedSpot.review_count})</span>
                  )}
                </div>
              )}
            </div>

            {/* 주소 */}
            <div className="flex items-start space-x-3">
              <MapPin className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-gray-700">{selectedSpot.address}</p>
                <button className="text-blue-600 text-sm hover:text-blue-800 mt-1">
                  길찾기
                </button>
              </div>
            </div>

            {/* 설명 */}
            {selectedSpot.description && (
              <div className="flex items-start space-x-3">
                <div className="w-5 h-5 flex items-center justify-center mt-0.5">
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                </div>
                <p className="text-gray-700 leading-relaxed">{selectedSpot.description}</p>
              </div>
            )}

            {/* 운영시간 (operating_hours가 있다면) */}
            {selectedSpot.operating_hours && (
              <div className="flex items-start space-x-3">
                <Clock className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-gray-700">운영시간</p>
                  <p className="text-sm text-gray-500">매일 09:00 - 22:00</p>
                </div>
              </div>
            )}

            {/* 연락처 */}
            <div className="flex items-center space-x-3">
              <Phone className="w-5 h-5 text-gray-400 flex-shrink-0" />
              <button 
                onClick={() => {
                  // 전화걸기 기능
                  window.location.href = `tel:02-1234-5678`;
                }}
                className="text-blue-600 hover:text-blue-800"
              >
                02-1234-5678
              </button>
            </div>
          </div>
        </div>

        {/* 🔥 하단 액션 버튼들 */}
        <div className="border-t border-gray-100 p-4">
          <div className="flex space-x-3">
            <button 
              onClick={() => {
                console.log('🔖 북마크:', selectedSpot.name);
              }}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
            >
              <Bookmark className="w-4 h-4" />
              <span>북마크</span>
            </button>
            
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

  // 🔥 리스트 모드 렌더링 (기존 코드)
  const renderListMode = () => {
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
                      // 🔥 상세보기 모드로 전환
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

                    {/* 북마크 버튼 */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        console.log('🔖 북마크 토글:', spot.name);
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

  return (
    <div 
      className={`absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl transition-all duration-300 ease-out z-20 ${
        showBottomSheet ? 'translate-y-0' : 'translate-y-full'
      }`}
      style={{ height: `${bottomSheetHeight}px` }}
    >
      {/* 드래그 핸들 */}
      <div 
        className="flex justify-center py-3 cursor-grab active:cursor-grabbing select-none bg-white rounded-t-2xl touch-none"
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
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="w-10 h-1.5 bg-gray-300 rounded-full"></div>
      </div>
      
      {/* 🔥 조건부 렌더링: 상세모드 vs 리스트모드 */}
      <div style={{ height: `${bottomSheetHeight - 20}px` }}>
        {isDetailMode ? renderDetailMode() : renderListMode()}
      </div>
    </div>
  );
};

export default BottomSheet;