'use client';

import React from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Heart, 
  MapPin, 
  Phone, 
  Clock, 
  Star, 
  ExternalLink,
  Ticket 
} from 'lucide-react';
import { LocalSpot } from '../lib/api';

interface SpotDetailViewProps {
  spot: LocalSpot;
  currentImageIndex: number;
  onPrevImage: () => void;
  onNextImage: () => void;
  onBackToList?: () => void;
  bookmarkStatuses: Record<string, boolean>;
  bookmarkLoading: boolean;
  onBookmarkToggle: (spotId: string, currentStatus: boolean) => void;
  localDeals?: any[];
  receivedCoupons: Set<string>;
  onReceiveCoupon: (deal: any) => void;
}

const SpotDetailView: React.FC<SpotDetailViewProps> = ({
  spot,
  currentImageIndex,
  onPrevImage,
  onNextImage,
  onBackToList,
  bookmarkStatuses,
  bookmarkLoading,
  onBookmarkToggle,
  localDeals = [],
  receivedCoupons,
  onReceiveCoupon
}) => {
  const isBookmarked = bookmarkStatuses[spot.id] || false;
  
  // 영업시간 체크
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

  const businessStatus = getBusinessStatus(spot);
  const spotDeals = localDeals.filter((deal: any) => deal.spot_id === spot.id && deal.is_active);

  return (
    <div className="h-full flex flex-col">
      {/* 헤더 */}
      <div className="flex items-center justify-between p-4 border-b">
        <button 
          onClick={() => onBackToList?.()}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="text-sm">목록으로</span>
        </button>
        
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onBookmarkToggle(spot.id, isBookmarked);
          }}
          disabled={bookmarkLoading}
          className={`flex items-center space-x-2 px-3 py-2 border rounded-lg transition-colors ${
            isBookmarked 
              ? 'bg-red-50 hover:bg-red-100 text-red-600 border-red-200' 
              : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-200'
          } ${bookmarkLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {bookmarkLoading ? (
            <>
              <div className="w-4 h-4 animate-spin rounded-full border-2 border-gray-300 border-t-red-500" />
              <span className="text-sm">처리중...</span>
            </>
          ) : (
            <>
              <Heart 
                className={`w-4 h-4 transition-colors ${
                  isBookmarked 
                    ? 'fill-red-500 text-red-500' 
                    : 'text-gray-400'
                }`}
              />
              <span className="text-sm">
                {isBookmarked ? '북마크됨' : '북마크'}
              </span>
            </>
          )}
        </button>
      </div>

      {/* 스크롤 가능한 콘텐츠 */}
      <div className="flex-1 overflow-y-auto">
        {/* 이미지 갤러리 */}
        {spot.images && spot.images.length > 0 && (
          <div className="relative h-48 bg-gray-100">
            <img 
              src={spot.images[currentImageIndex]} 
              alt={spot.name}
              className="w-full h-full object-cover"
            />
            
            {spot.images.length > 1 && (
              <>
                <button 
                  onClick={onPrevImage}
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button 
                  onClick={onNextImage}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                
                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-2 py-1 rounded text-xs">
                  {currentImageIndex + 1} / {spot.images.length}
                </div>
              </>
            )}
          </div>
        )}

        {/* 기본 정보 */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-bold text-gray-900">{spot.name}</h2>
            <span className={`text-sm font-medium ${businessStatus.color}`}>
              {businessStatus.status}
            </span>
          </div>
          
          <div className="flex items-center space-x-2 mb-3">
            <MapPin className="w-4 h-4 text-gray-500" />
            <span className="text-gray-600 text-sm">{spot.address}</span>
          </div>

          {spot.rating && (
            <div className="flex items-center space-x-2 mb-3">
              <Star className="w-4 h-4 text-yellow-500 fill-current" />
              <span className="text-sm font-medium">{spot.rating.toFixed(1)}</span>
              {spot.review_count && (
                <span className="text-sm text-gray-500">({spot.review_count}개 리뷰)</span>
              )}
            </div>
          )}

          {spot.description && (
            <p className="text-gray-700 text-sm mb-4 leading-relaxed">
              {spot.description}
            </p>
          )}

          {/* 연락처 & 웹사이트 */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            {(spot as any).phone && (
              <a 
                href={`tel:${(spot as any).phone}`}
                className="flex items-center justify-center space-x-2 p-3 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <Phone className="w-4 h-4" />
                <span className="text-sm font-medium">전화하기</span>
              </a>
            )}
            
            {(spot as any).website && (
              <a 
                href={(spot as any).website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center space-x-2 p-3 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                <span className="text-sm font-medium">웹사이트</span>
              </a>
            )}
          </div>

          {/* 로컬딜 쿠폰 섹션 */}
          {spotDeals.length > 0 && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 mb-4">
              <div className="flex items-center space-x-2 mb-3">
                <Ticket className="w-5 h-5 text-green-600" />
                <h3 className="font-bold text-green-800">🎟️ 특별 혜택</h3>
              </div>
              
              <div className="space-y-3">
                {spotDeals.map((deal: any) => (
                  <div key={deal.id} className="bg-white border border-green-200 rounded-lg p-3">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-gray-900">{deal.title}</h4>
                      <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full">
                        {deal.deal_value}
                      </span>
                    </div>
                    
                    {deal.description && (
                      <p className="text-sm text-gray-600 mb-3">{deal.description}</p>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        {deal.valid_until}까지
                        {deal.remaining_count && ` • ${deal.remaining_count}개 남음`}
                      </span>
                      
                      <button
                        onClick={() => onReceiveCoupon(deal)}
                        disabled={receivedCoupons.has(deal.id)}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                          receivedCoupons.has(deal.id)
                            ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                            : 'bg-green-500 text-white hover:bg-green-600'
                        }`}
                      >
                        {receivedCoupons.has(deal.id) ? '받음 ✓' : '쿠폰 받기'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 영업시간 */}
          {(spot as any).business_hours && (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
              <div className="flex items-center space-x-2 mb-3">
                <Clock className="w-5 h-5 text-gray-600" />
                <h3 className="font-bold text-gray-800">영업시간</h3>
              </div>
              
              <div className="space-y-2">
                {Object.entries((spot as any).business_hours).map(([day, hours]: [string, any]) => (
                  <div key={day} className="flex justify-between text-sm">
                    <span className="text-gray-600">{day}</span>
                    <span className="text-gray-900">
                      {hours.closed ? '휴무' : `${hours.open} - ${hours.close}`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SpotDetailView;