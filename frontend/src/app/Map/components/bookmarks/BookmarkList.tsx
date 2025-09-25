// src/app/Map/components/BookmarkList.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  MapPin, 
  Clock, 
  Star, 
  Trash2,
  ArrowLeft,
  RefreshCw
} from 'lucide-react';
import { getUserBookmarks, removeBookmark } from '../../utils/bookmarkUtils';
import { LocalSpot, CATEGORY_MAP_REVERSE } from '../../lib/api';
import { useLocalSpots } from '../../hooks/useLocalSpots';
import { getCategoryIcon, getCategoryName } from '../utils/CategoryHelper';

interface BookmarkData {
  id?: string;
  user_id: string;
  spot_id?: string;
  deal_id?: string;
  bookmark_type: 'spot' | 'deal';
  created_at?: string;
  local_spots?: LocalSpot;
  local_deals?: any;
}

const BookmarkList: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const [bookmarks, setBookmarks] = useState<BookmarkData[]>([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState<string | null>(null);

  // 스팟 데이터 가져오기
  const { spots } = useLocalSpots('전체', 200);

  // 북마크된 스팟 ID들과 실제 스팟 정보를 매칭
  const getSpotInfo = (spotId: string): LocalSpot | null => {
    return spots.find(spot => spot.id === spotId) || null;
  };

  const getUserId = (): string => {
    if (typeof window === 'undefined') return '00000000-0000-4000-8000-000000000000';
    
    let userId = localStorage.getItem('temp_user_id');
    if (!userId) {
      userId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
      localStorage.setItem('temp_user_id', userId);
    }
    return userId;
  };

  const loadBookmarks = async () => {
    setLoading(true);
    try {
      const userId = getUserId();
      const result = await getUserBookmarks(userId);
      
      if (result.success && result.bookmarks) {
        setBookmarks(result.bookmarks);
      } else {
        console.error('북마크 로딩 실패:', result.error);
      }
    } catch (error) {
      console.error('북마크 로딩 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveBookmark = async (bookmark: BookmarkData) => {
    if (!bookmark.spot_id && !bookmark.deal_id) return;
    
    const itemId = bookmark.spot_id || bookmark.deal_id!;
    const itemType = bookmark.bookmark_type;
    
    setRemoving(itemId);
    
    try {
      const userId = getUserId();
      const result = await removeBookmark(userId, itemId, itemType);
      
      if (result.success) {
        // UI에서 즉시 제거
        setBookmarks(prev => prev.filter(b => 
          (b.spot_id !== itemId) && (b.deal_id !== itemId)
        ));
      } else {
        alert('북마크 삭제에 실패했습니다: ' + result.error);
      }
    } catch (error) {
      console.error('북마크 삭제 오류:', error);
      alert('북마크 삭제 중 오류가 발생했습니다.');
    } finally {
      setRemoving(null);
    }
  };

  useEffect(() => {
    loadBookmarks();
  }, []);

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: '2-digit',
      month: '2-digit', 
      day: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="w-full max-w-md mx-auto bg-white h-screen flex flex-col">
        {/* 헤더 */}
        <div className="flex items-center p-4 border-b border-gray-200">
          {onBack && (
            <button onClick={onBack} className="mr-3 p-1 hover:bg-gray-100 rounded-full">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
          )}
          <h1 className="text-lg font-semibold text-gray-900">내 북마크</h1>
        </div>

        {/* 로딩 */}
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center space-y-3">
            <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
            <p className="text-gray-500">북마크를 불러오는 중...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto bg-white h-screen flex flex-col">
      {/* 헤더 */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center">
          {onBack && (
            <button onClick={onBack} className="mr-3 p-1 hover:bg-gray-100 rounded-full">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
          )}
          <h1 className="text-lg font-semibold text-gray-900">내 북마크</h1>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">{bookmarks.length}개</span>
          <button 
            onClick={loadBookmarks}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <RefreshCw className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>

      {/* 북마크 목록 */}
      <div className="flex-1 overflow-y-auto">
        {bookmarks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <Heart className="w-12 h-12 mb-4 text-gray-300" />
            <p className="text-center">
              아직 북마크한 장소가 없습니다.<br />
              관심있는 장소를 북마크해보세요!
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {bookmarks.map((bookmark) => {
              const itemId = bookmark.spot_id || bookmark.deal_id || '';
              const isRemoving = removing === itemId;
              
              return (
                <div key={bookmark.id || itemId} className="p-4">
                  <div className="flex items-start space-x-3">
                    {/* 아이콘 */}
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-lg flex-shrink-0">
                      {bookmark.bookmark_type === 'spot' && bookmark.spot_id 
                        ? getCategoryIcon(getSpotInfo(bookmark.spot_id)?.category)
                        : '🎟️'
                      }
                    </div>

                    {/* 정보 */}
                    <div className="flex-1 min-w-0">
                      {bookmark.bookmark_type === 'spot' && bookmark.spot_id ? (
                        (() => {
                          const spot = getSpotInfo(bookmark.spot_id);
                          if (!spot) {
                            return (
                              <>
                                <div className="flex items-center space-x-2 mb-1">
                                  <span className="text-xs text-gray-500 px-2 py-1 bg-gray-100 rounded-full">
                                    삭제된 스팟
                                  </span>
                                  <span className="text-xs text-gray-400">
                                    {formatDate(bookmark.created_at)}
                                  </span>
                                </div>
                                <h3 className="font-medium text-gray-500 mb-1">
                                  삭제된 스팟 (ID: {bookmark.spot_id})
                                </h3>
                                <p className="text-sm text-gray-400">
                                  이 스팟은 더 이상 존재하지 않습니다.
                                </p>
                              </>
                            );
                          }

                          return (
                            <>
                              {/* 카테고리 */}
                              <div className="flex items-center space-x-2 mb-1">
                                <span className="text-xs text-gray-500 px-2 py-1 bg-gray-100 rounded-full">
                                  {getCategoryName(spot.category)}
                                </span>
                                <span className="text-xs text-gray-400">
                                  {formatDate(bookmark.created_at)}
                                </span>
                              </div>
                              
                              {/* 이름 */}
                              <h3 className="font-medium text-gray-900 mb-1">
                                {spot.name}
                              </h3>
                              
                              {/* 주소 */}
                              <div className="flex items-center text-sm text-gray-600 mb-2">
                                <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
                                <span className="truncate">{spot.address}</span>
                              </div>
                              
                              {/* 추가 정보 */}
                              <div className="flex items-center space-x-3">
                                {spot.rating && (
                                  <div className="flex items-center space-x-1">
                                    <Star className="w-3 h-3 text-yellow-500 fill-current" />
                                    <span className="text-xs text-gray-600">
                                      {spot.rating.toFixed(1)}
                                    </span>
                                  </div>
                                )}
                                {spot.price_range && (
                                  <span className="text-xs text-blue-600 font-medium">
                                    {spot.price_range}
                                  </span>
                                )}
                              </div>
                            </>
                          );
                        })()
                      ) : (
                        <>
                          {/* 딜 정보 */}
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="text-xs text-green-600 px-2 py-1 bg-green-100 rounded-full">
                              로컬딜
                            </span>
                            <span className="text-xs text-gray-400">
                              {formatDate(bookmark.created_at)}
                            </span>
                          </div>
                          <h3 className="font-medium text-gray-900 mb-1">
                            딜 ID: {bookmark.deal_id}
                          </h3>
                          <p className="text-sm text-gray-600">
                            로컬딜 상세 정보 (API 연동 필요)
                          </p>
                        </>
                      )}
                    </div>

                    {/* 삭제 버튼 */}
                    <button
                      onClick={() => handleRemoveBookmark(bookmark)}
                      disabled={isRemoving}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors disabled:opacity-50"
                    >
                      {isRemoving ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default BookmarkList;