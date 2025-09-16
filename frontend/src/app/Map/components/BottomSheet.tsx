'use client';

import React from 'react';
import { Bookmark, Navigation, MapPin, Tag } from 'lucide-react';

interface Shop {
  id: number;
  name: string;
  category: string;
  status: string;
  time: string;
  reviews: number;
  price: string;
  image: string;
  bookmarked: boolean;
  phone: string;
  address: string;
  website?: string;
}

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
}

const BottomSheet: React.FC<BottomSheetProps> = ({
  showBottomSheet,
  bottomSheetHeight,
  setBottomSheetHeight,
  activeCategory,
  showLocalDeals,
  handleDragStart,
  isDragging,
  startY,
  startHeight,
  containerRef
}) => {
  // 더미 상점 데이터
  const shopData: Shop[] = [
    {
      id: 1,
      name: '베이드안',
      category: '맛집 공방',
      status: '영업중',
      time: '19:00까지 영업',
      reviews: 243,
      price: '45,000원',
      image: '🥘',
      bookmarked: false,
      phone: '02-1234-5678',
      address: '서울시 강남구 테헤란로 123',
      website: 'https://example.com'
    },
    {
      id: 2,
      name: '그로티',
      category: '요리 공방',
      status: '영업중',
      time: '19:00까지 영업',
      reviews: 513,
      price: '50,000원',
      image: '🍳',
      bookmarked: false,
      phone: '02-2345-6789',
      address: '서울시 서초구 서초대로 456'
    },
    {
      id: 3,
      name: '오드레',
      category: '비누 공방',
      status: '오늘 휴무',
      time: '',
      reviews: 345,
      price: '30,000원',
      image: '🧼',
      bookmarked: true,
      phone: '02-3456-7890',
      address: '서울시 마포구 홍대입구 789'
    },
    {
      id: 4,
      name: '루티아의 작업실',
      category: '패브릭 공방',
      status: '영업종료',
      time: '17:00까지 영업',
      reviews: 341,
      price: '75,000원',
      image: '🧵',
      bookmarked: false,
      phone: '02-4567-8901',
      address: '서울시 종로구 인사동길 321',
      website: 'https://rutia-workshop.com'
    },
    {
      id: 5,
      name: '코도앱',
      category: '금속 공방',
      status: '영업중',
      time: '18:00까지 영업',
      reviews: 167,
      price: '80,000원',
      image: '🔨',
      bookmarked: false,
      phone: '02-5678-9012',
      address: '서울시 용산구 이태원로 654'
    }
  ];

  // 표시할 데이터 필터링
  const getDisplayData = () => {
    if (showLocalDeals) {
      return shopData.filter(shop => shop.bookmarked || shop.id % 2 === 0);
    } else if (activeCategory === '전체') {
      return shopData;
    } else {
      return shopData.filter(shop => shop.category.includes(activeCategory) || shop.id % 3 === 0);
    }
  };

  const displayData = getDisplayData();
  const titleText = showLocalDeals ? '로컬딜 목록' : `${activeCategory} 목록`;

  // 터치 이벤트 핸들러
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    
    // 바텀시트 최대 높이를 500px로 제한
    const maxHeight = 500;
    const deltaY = startY - e.touches[0].clientY;
    const newHeight = Math.min(Math.max(startHeight + deltaY, 120), maxHeight);
    setBottomSheetHeight(newHeight);
  };

  const handleTouchEnd = () => {
    // isDragging은 부모 컴포넌트에서 관리됨
  };

  return (
    <div 
      className={`absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl transition-all duration-300 ease-out z-10 ${
        showBottomSheet ? 'translate-y-0' : 'translate-y-full'
      }`}
      style={{ height: `${bottomSheetHeight}px` }}
    >
      {/* 드래그 핸들 */}
      <div 
        className="flex justify-center py-2 cursor-grab active:cursor-grabbing select-none bg-white rounded-t-2xl touch-none"
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
        onTouchEnd={(e) => {
          e.preventDefault();
          handleTouchEnd();
        }}
      >
        <div className="w-8 h-1 bg-gray-300 rounded-full"></div>
      </div>
      
      {/* 헤더 */}
      <div className="px-4 pb-2 border-b border-gray-100">
        <h3 className="text-base font-semibold text-gray-900">
          {titleText}
        </h3>
        <p className="text-xs text-gray-500 mt-1">
          {displayData.length}개의 장소
        </p>
      </div>

      {/* 가게 리스트 */}
      <div className="overflow-y-auto" style={{ height: `${bottomSheetHeight - 70}px` }}>
        <div className="space-y-0">
          {displayData.map((shop) => (
            <div 
              key={shop.id} 
              className="flex items-center space-x-3 bg-white p-3 border-b border-gray-50 hover:bg-gray-50 transition-colors"
            >
              {/* 가게 이미지 */}
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-lg flex-shrink-0">
                {shop.image}
              </div>

              {/* 가게 정보 */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-xs text-gray-500">{shop.category}</span>
                  {showLocalDeals && (
                    <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full">할인</span>
                  )}
                </div>
                <h3 className="font-semibold text-gray-900 mb-1 truncate text-sm">{shop.name}</h3>
                <div className="flex items-center space-x-2 mb-1">
                  <span className={`text-xs ${
                    shop.status === '영업중' ? 'text-green-600' : 
                    shop.status === '오늘 휴무' ? 'text-red-500' : 'text-gray-500'
                  }`}>
                    {shop.status}
                  </span>
                  {shop.time && (
                    <span className="text-xs text-gray-500">{shop.time}</span>
                  )}
                </div>
                <div className="flex items-center space-x-2 text-xs text-gray-500 mb-2">
                  <span>리뷰 {shop.reviews}</span>
                  <span>•</span>
                  <span className={showLocalDeals ? 'line-through' : ''}>
                    최근 가격 {shop.price}
                  </span>
                  {showLocalDeals && (
                    <span className="text-red-600 font-semibold">20% 할인</span>
                  )}
                </div>

                {/* 외부 앱 연동 버튼들 */}
                <div className="flex items-center space-x-1">
                  {/* 전화걸기 버튼 */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(`tel:${shop.phone}`, '_self');
                    }}
                    className="flex items-center space-x-1 bg-green-100 hover:bg-green-200 text-green-600 px-1.5 py-0.5 rounded text-xs transition-colors"
                  >
                    <span>📞</span>
                    <span>전화</span>
                  </button>

                  {/* 지도앱 연결 버튼 */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const encodedAddress = encodeURIComponent(shop.address);
                      const kakaoMapUrl = `kakaomap://search?q=${encodedAddress}`;
                      const googleMapUrl = `https://maps.google.com/maps?q=${encodedAddress}`;
                      
                      window.open(kakaoMapUrl, '_blank');
                      
                      setTimeout(() => {
                        window.open(googleMapUrl, '_blank');
                      }, 1000);
                    }}
                    className="flex items-center space-x-1 bg-blue-100 hover:bg-blue-200 text-blue-600 px-1.5 py-0.5 rounded text-xs transition-colors"
                  >
                    <MapPin className="w-3 h-3" />
                    <span>길찾기</span>
                  </button>

                  {/* 웹사이트 방문 버튼 */}
                  {shop.website && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(shop.website, '_blank');
                      }}
                      className="flex items-center space-x-1 bg-purple-100 hover:bg-purple-200 text-purple-600 px-1.5 py-0.5 rounded text-xs transition-colors"
                    >
                      <span>🌐</span>
                      <span>홈페이지</span>
                    </button>
                  )}
                </div>
              </div>

              {/* 북마크 버튼 */}
              <button className="p-1 flex-shrink-0">
                <Bookmark 
                  className={`w-4 h-4 ${
                    shop.bookmarked ? 'text-red-500 fill-current' : 'text-gray-400'
                  }`} 
                />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BottomSheet;