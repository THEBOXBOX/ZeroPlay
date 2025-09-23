// ============================================================================
// 타입 안전한 AI 루트 북마크 컴포넌트
// 파일: frontend/src/app/mypage/components/RouteBookmarks.tsx
// ============================================================================

'use client';

import { useState, useEffect } from 'react';
import { ApiClient } from '@/lib/api';

// ✅ API 응답 타입 정의
interface APIResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

interface BookmarksResponse {
  bookmarks: RouteBookmark[];
  count: number;
}

interface RouteBookmark {
  id: number;
  title: string;
  route_data: {
    id: string;
    title: string;
    duration: string;
    totalBudget: number;
    places: Array<{
      name: string;
      type: string;
      cost: number;
    }>;
    highlights: string[];
    difficulty: string;
  };
  created_at: string;
}

interface RouteBookmarksProps {
  sessionId: string;
  onCountChange?: (count: number) => void;
}

export default function RouteBookmarks({ sessionId, onCountChange }: RouteBookmarksProps) {
  const [bookmarks, setBookmarks] = useState<RouteBookmark[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedItems, setExpandedItems] = useState<number[]>([]);

  useEffect(() => {
    if (sessionId) {
      loadBookmarks();
    }
  }, [sessionId]);

  const loadBookmarks = async () => {
    try {
      setIsLoading(true);
      // ✅ 타입 단언 사용
      const response = await ApiClient.getAIBookmarks(sessionId) as APIResponse<BookmarksResponse>;
      
      if (response.success) {
        setBookmarks(response.data.bookmarks);
        onCountChange?.(response.data.count);
      }
    } catch (error) {
      console.error('루트 북마크 로드 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteBookmark = async (bookmarkId: number) => {
    try {
      // ✅ 타입 단언 사용
      const response = await ApiClient.deleteAIBookmark(bookmarkId.toString(), sessionId) as APIResponse;
      
      if (response.success) {
        setBookmarks(prev => prev.filter(b => b.id !== bookmarkId));
        onCountChange?.(bookmarks.length - 1);
      }
    } catch (error) {
      console.error('북마크 삭제 실패:', error);
      alert('삭제 중 오류가 발생했습니다.');
    }
  };

  const toggleExpand = (bookmarkId: number) => {
    setExpandedItems(prev => 
      prev.includes(bookmarkId) 
        ? prev.filter(id => id !== bookmarkId)
        : [...prev, bookmarkId]
    );
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-700';
      case 'moderate': return 'bg-yellow-100 text-yellow-700';
      case 'hard': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return '쉬움';
      case 'moderate': return '보통';
      case 'hard': return '어려움';
      default: return '알 수 없음';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white rounded-2xl shadow-sm border p-4">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded mb-2 w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (bookmarks.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border p-8 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl text-gray-400">🗺️</span>
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">저장된 AI 루트가 없어요</h3>
        <p className="text-sm text-gray-600 mb-6">
          AI 추천 코스에서 마음에 드는<br />
          루트를 북마크해보세요!
        </p>
        <button
          onClick={() => window.location.href = '/AI-route'}
          className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all"
        >
          AI 루트 추천받기 🚀
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {bookmarks.map((bookmark) => {
        const isExpanded = expandedItems.includes(bookmark.id);
        const route = bookmark.route_data;

        return (
          <div key={bookmark.id} className="bg-white rounded-2xl shadow-sm border overflow-hidden">
            {/* 카드 헤더 */}
            <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold bg-white/20`}>
                      {getDifficultyText(route.difficulty)}
                    </span>
                    <span className="text-xs opacity-75">
                      {formatDate(bookmark.created_at)}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold mb-1">{route.title}</h3>
                  <div className="flex items-center gap-3 text-sm opacity-90">
                    <span>⏱️ {route.duration}</span>
                    <span>📍 {route.places?.length || 0}곳</span>
                    <span>💰 {Math.floor((route.totalBudget || 0)/10000)}만원</span>
                  </div>
                </div>
                <button
                  onClick={() => deleteBookmark(bookmark.id)}
                  className="w-8 h-8 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center transition-colors ml-2"
                >
                  🗑️
                </button>
              </div>
            </div>

            {/* 하이라이트 */}
            {route.highlights && route.highlights.length > 0 && (
              <div className="bg-green-50 p-3">
                <div className="flex flex-wrap gap-1">
                  {route.highlights.slice(0, 4).map((highlight, index) => (
                    <span key={index} className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                      #{highlight}
                    </span>
                  ))}
                  {route.highlights.length > 4 && (
                    <span className="text-green-600 text-xs px-2 py-1">
                      +{route.highlights.length - 4}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* 장소 미리보기 */}
            <div className="p-4">
              {route.places && route.places.length > 0 && (
                <div className="mb-3">
                  <h4 className="text-sm font-bold text-gray-800 mb-2">포함된 장소</h4>
                  <div className="space-y-2">
                    {route.places.slice(0, isExpanded ? undefined : 3).map((place, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded-lg">
                        <span className="text-sm font-medium text-gray-800">{place.name}</span>
                        <span className="text-xs text-gray-500">
                          {place.cost === 0 ? '무료' : `${place.cost.toLocaleString()}원`}
                        </span>
                      </div>
                    ))}
                  </div>
                  {route.places.length > 3 && !isExpanded && (
                    <div className="text-center mt-2">
                      <span className="text-xs text-gray-500">
                        외 {route.places.length - 3}곳 더
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* 액션 버튼들 */}
              <div className="flex gap-2">
                <button
                  onClick={() => toggleExpand(bookmark.id)}
                  className="flex-1 bg-gray-100 text-gray-700 py-2 px-3 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                >
                  {isExpanded ? '간단히 보기' : '자세히 보기'}
                </button>
                <button
                  onClick={() => {
                    // TODO: 실제 루트로 이동 로직
                    alert('해당 루트 페이지로 이동합니다!');
                  }}
                  className="flex-1 bg-green-500 text-white py-2 px-3 rounded-lg hover:bg-green-600 transition-colors text-sm font-medium"
                >
                  다시 보기
                </button>
              </div>
            </div>
          </div>
        );
      })}

      {/* 더 불러오기 버튼 (페이지네이션 대신) */}
      {bookmarks.length >= 10 && (
        <div className="text-center py-4">
          <button className="text-green-600 text-sm font-medium hover:text-green-700">
            더 불러오기
          </button>
        </div>
      )}
    </div>
  );
}