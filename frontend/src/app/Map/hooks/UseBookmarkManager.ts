import { useState, useEffect } from 'react';
import { LocalSpot } from '../lib/api';
import { toggleBookmark, isBookmarked } from '../utils/bookmarkUtils';
import { getUserId } from '../utils/UserIdUtils';

interface UseBookmarkManagerReturn {
  bookmarkStatuses: Record<string, boolean>;
  bookmarkLoading: boolean;
  handleBookmarkToggle: (spotId: string, currentStatus: boolean) => Promise<void>;
}

export const useBookmarkManager = (sortedDisplayData: LocalSpot[]): UseBookmarkManagerReturn => {
  const [bookmarkStatuses, setBookmarkStatuses] = useState<Record<string, boolean>>({});
  const [bookmarkLoading, setBookmarkLoading] = useState(true);
  const userId = getUserId();

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

  return {
    bookmarkStatuses,
    bookmarkLoading,
    handleBookmarkToggle,
  };
};