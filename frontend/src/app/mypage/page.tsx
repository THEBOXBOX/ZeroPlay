// ============================================================================
// 타입 안전한 마이페이지 메인 컴포넌트
// 파일: frontend/src/app/mypage/page.tsx (타입 수정)
// ============================================================================

'use client';

import { useState, useEffect } from 'react';
import { ApiClient } from '@/lib/api';
import { SessionManager } from '@/lib/session';
import BenefitBookmarks from './components/BenefitBookmarks';
import RouteBookmarks from './components/RouteBookmarks';
import MapBookmarks from './components/MapBookmarks';

type BookmarkTab = 'benefits' | 'routes' | 'maps';

interface BookmarkSummary {
  benefits: number;
  aiRoutes: number;
  mapPlaces: number;
  total: number;
}

// ✅ API 응답 타입 정의
interface APIResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export default function MyPage() {
  const [activeTab, setActiveTab] = useState<BookmarkTab>('benefits');
  const [summary, setSummary] = useState<BookmarkSummary>({
    benefits: 0,
    aiRoutes: 0,
    mapPlaces: 0,
    total: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [sessionId, setSessionId] = useState('');

  useEffect(() => {
    const session = SessionManager.getSessionId();
    setSessionId(session);
    loadBookmarkSummary(session);
  }, []);

  const loadBookmarkSummary = async (session: string) => {
    try {
      setIsLoading(true);
      // ✅ 타입 단언 사용 (45-46열 수정)
      const response = await ApiClient.getBookmarkSummary(session) as APIResponse<BookmarkSummary>;
      if (response.success) {
        setSummary(response.data);
      }
    } catch (error) {
      console.error('북마크 요약 로드 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [
    {
      id: 'benefits' as BookmarkTab,
      name: '청년혜택',
      icon: '🎯',
      count: summary.benefits,
      color: 'blue',
      description: '저장된 혜택 정보'
    },
    {
      id: 'routes' as BookmarkTab,
      name: 'AI 루트',
      icon: '🗺️',
      count: summary.aiRoutes,
      color: 'green',
      description: 'AI 추천 여행코스'
    },
    {
      id: 'maps' as BookmarkTab,
      name: '지도 장소',
      icon: '📍',
      count: summary.mapPlaces,
      color: 'purple',
      description: '관심 장소 모음'
    }
  ];

  const getTabColorClasses = (color: string, isActive: boolean) => {
    const colors = {
      blue: isActive ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-gray-200 text-gray-600',
      green: isActive ? 'bg-green-50 border-green-200 text-green-700' : 'bg-white border-gray-200 text-gray-600',
      purple: isActive ? 'bg-purple-50 border-purple-200 text-purple-700' : 'bg-white border-gray-200 text-gray-600',
    };
    return colors[color as keyof typeof colors];
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-sm mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button 
                onClick={() => window.history.back()}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center mr-3 hover:bg-gray-200 transition-colors"
              >
                <span className="text-gray-600">←</span>
              </button>
              <div>
                <h1 className="text-lg font-bold text-gray-900">마이페이지</h1>
                <p className="text-xs text-gray-500">저장된 북마크 모음</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="text-right">
                <div className="text-sm font-bold text-gray-900">{summary.total}</div>
                <div className="text-xs text-gray-500">전체</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-sm mx-auto">
        {/* 요약 카드 */}
        <div className="p-4">
          <div className="bg-white rounded-2xl shadow-sm border p-4 mb-4">
            <div className="text-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl text-white">📱</span>
              </div>
              <h2 className="text-lg font-bold text-gray-900 mb-1">내 북마크</h2>
              <p className="text-sm text-gray-600">
                {summary.total}개의 항목을 저장했어요
              </p>
            </div>
            
            <div className="grid grid-cols-3 gap-3">
              {tabs.map((tab) => (
                <div key={tab.id} className="text-center p-3 bg-gray-50 rounded-xl">
                  <div className="text-xl mb-1">{tab.icon}</div>
                  <div className="text-sm font-bold text-gray-900">{tab.count}</div>
                  <div className="text-xs text-gray-500">{tab.name}</div>
                </div>
              ))}
            </div>
          </div>

          {/* 탭 네비게이션 */}
          <div className="flex space-x-2 mb-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 p-3 rounded-xl border-2 transition-all ${getTabColorClasses(tab.color, activeTab === tab.id)}`}
              >
                <div className="flex items-center justify-center mb-1">
                  <span className="text-lg mr-1">{tab.icon}</span>
                  {tab.count > 0 && (
                    <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${
                      activeTab === tab.id 
                        ? `bg-${tab.color}-500 text-white` 
                        : 'bg-gray-400 text-white'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </div>
                <div className="font-medium text-sm">{tab.name}</div>
                <div className="text-xs opacity-75">{tab.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* 탭 내용 */}
        <div className="px-4 pb-8">
          {isLoading ? (
            <div className="bg-white rounded-2xl shadow-sm border p-8 text-center">
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">북마크를 불러오는 중...</p>
            </div>
          ) : (
            <>
              {activeTab === 'benefits' && (
                <BenefitBookmarks 
                  sessionId={sessionId} 
                  onCountChange={(count) => setSummary(prev => ({ 
                    ...prev, 
                    benefits: count,
                    total: prev.aiRoutes + count + prev.mapPlaces
                  }))} 
                />
              )}
              {activeTab === 'routes' && (
                <RouteBookmarks 
                  sessionId={sessionId} 
                  onCountChange={(count) => setSummary(prev => ({ 
                    ...prev, 
                    aiRoutes: count,
                    total: prev.benefits + count + prev.mapPlaces
                  }))} 
                />
              )}
              {activeTab === 'maps' && (
                <MapBookmarks 
                  sessionId={sessionId} 
                  onCountChange={(count) => setSummary(prev => ({ 
                    ...prev, 
                    mapPlaces: count,
                    total: prev.benefits + prev.aiRoutes + count
                  }))} 
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}