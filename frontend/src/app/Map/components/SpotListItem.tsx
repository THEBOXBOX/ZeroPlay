'use client';

import React from 'react';
import { MapPin, Star, Heart } from 'lucide-react';
import { LocalSpot } from '../lib/api';
import BusinessStatusBadge from './BusinessStatusBadge';


interface LocalDeal {
  id: string;
  spot_id: string;
  deal_value: string;
  valid_until: string;
  description?: string;
}

type SortOption = 'recommended' | 'distance' | 'rating' | 'name';  // 🔧 recommended 추가

interface SpotListItemProps {
  spot: LocalSpot;
  index: number;
  sortBy: SortOption;  // 🔧 수정된 타입 사용
  userLocation: { lat: number; lng: number } | null;
  spotDeal?: LocalDeal;
  distance?: string;
  operatingHours?: Record<string, string>;
  bookmarkStatuses: Record<string, boolean>;
  bookmarkLoading: boolean;
  onSpotClick?: (spot: LocalSpot) => void;
  onBookmarkToggle: (spotId: string, currentStatus: boolean) => void;
}

// 카테고리 한글명 매핑
const getCategoryName = (category: string) => {
  const categoryMap = {
    'experience': '체험',
    'culture': '문화',
    'restaurant': '맛집', 
    'cafe': '카페'
  };
  return categoryMap[category as keyof typeof categoryMap] || category;
};

// 카테고리 아이콘 매핑
const getCategoryIcon = (category: string) => {
  const iconMap = {
    'experience': '🎪',
    'culture': '🎭',
    'restaurant': '🍽️',
    'cafe': '☕'
  };
  return iconMap[category as keyof typeof iconMap] || '📍';
};

const SpotListItem: React.FC<SpotListItemProps> = ({
  spot,
  index,
  sortBy,
  userLocation,
  spotDeal,
  distance,
  operatingHours,
  bookmarkStatuses,
  bookmarkLoading,
  onSpotClick,
  onBookmarkToggle
}) => {
  const isBookmarked = bookmarkStatuses[spot.id] || false;

  return (
    <div 
      className="flex items-center space-x-3 p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer"
      onClick={() => {
        if (onSpotClick) {
          onSpotClick(spot);
        }
      }}
    >
      {/* 순위 표시 (거리순일 때만) */}
      {sortBy === 'distance' && userLocation && (
        <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold mr-1">
          {index + 1}
        </div>
      )}

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
          {/* 거리 정보 (거리순일 때만) */}
          {sortBy === 'distance' && distance && (
            <span className="text-xs text-blue-600 font-medium bg-blue-50 px-2 py-1 rounded">
              📍 {distance}
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
          <BusinessStatusBadge operatingHours={spot.operating_hours} />
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
          onBookmarkToggle(spot.id, isBookmarked);
        }}
        className="p-2 rounded-full hover:bg-gray-100 transition-colors"
        disabled={bookmarkLoading}
      >
        <Heart 
          className={`w-5 h-5 transition-colors ${
            isBookmarked 
              ? 'text-red-500 fill-red-500' 
              : 'text-gray-400 hover:text-red-400'
          }`} 
        />
      </button>
    </div>
  );
};

export default SpotListItem;