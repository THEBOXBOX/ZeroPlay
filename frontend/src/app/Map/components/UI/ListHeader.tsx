import React from 'react';
import SortDropdown, { SortOption } from './SortDropdown';

interface ListHeaderProps {
  activeCategory: string;
  showLocalDeals: boolean;
  dataLength: number;
  loading?: boolean;
  bookmarkLoading?: boolean;
  sortBy: SortOption;
  setSortBy: (sort: SortOption) => void;
  userLocation: { lat: number; lng: number } | null;
}

const ListHeader: React.FC<ListHeaderProps> = ({
  activeCategory,
  showLocalDeals,
  dataLength,
  loading = false,
  bookmarkLoading = false,
  sortBy,
  setSortBy,
  userLocation
}) => {
  const titleText = showLocalDeals ? '로컬딜 가게 목록' : `${activeCategory} 목록`;

  return (
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
        <span>{dataLength}개의 장소</span>
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
  );
};

export default ListHeader;