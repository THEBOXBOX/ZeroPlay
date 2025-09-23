// frontend/src/app/mypage/page.tsx (TypeScript 에러 수정)
'use client';

import { useState, useEffect } from 'react';
import { SessionManager } from '@/lib/session';
import { ApiClient } from '@/lib/api';

// 탭 타입 정의
type MyPageTab = 'ai-routes' | 'benefits' | 'map-places' | 'profile';

// API 응답 타입 정의
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

// 북마크 데이터 타입 정의
interface BookmarkedAIRoute {
  id: number;
  route_id: string;
  title: string;
  route_data: any;
  total_budget: number;
  duration_hours: number;
  places_count: number;
  created_at: string;
}

interface BookmarkedBenefit {
  id: number;
  benefit_id: string;
  title: string;
  provider: string;
  amount: string;
  category: string;
  created_at: string;
}

interface BookmarkedMapPlace {
  id: number;
  place_id: string;
  name: string;
  address: string;
  category: string;
  rating: number;
  memo?: string;
  created_at: string;
}

interface BookmarkStats {
  totalBookmarks: number;
  totalBudget: number;
  totalPlaces: number;
  mostLikedRegion: string;
  breakdown: {
    aiRoutes: number;
    benefits: number;
    mapPlaces: number;
  };
  averageBudgetPerRoute: number;
}

export default function MyPage() {
  const [activeTab, setActiveTab] = useState<MyPageTab>('ai-routes');
  const [sessionId, setSessionId] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // 각 카테고리별 북마크 데이터
  const [aiRoutes, setAiRoutes] = useState<BookmarkedAIRoute[]>([]);
  const [benefits, setBenefits] = useState<BookmarkedBenefit[]>([]);
  const [mapPlaces, setMapPlaces] = useState<BookmarkedMapPlace[]>([]);

  // 통계 데이터
  const [stats, setStats] = useState<BookmarkStats>({
    totalBookmarks: 0,
    totalBudget: 0,
    totalPlaces: 0,
    mostLikedRegion: 'none',
    breakdown: {
      aiRoutes: 0,
      benefits: 0,
      mapPlaces: 0
    },
    averageBudgetPerRoute: 0
  });

  useEffect(() => {
    const currentSessionId = SessionManager.getSessionId();
    setSessionId(currentSessionId);
    loadAllBookmarks(currentSessionId);
  }, []);

  // 모든 북마크 데이터 로드 (타입 안전하게 수정)
  const loadAllBookmarks = async (sessionId: string) => {
    setLoading(true);
    try {
      // 각각 개별적으로 호출하여 타입 안전성 확보
      const aiRoutesRes = await ApiClient.getAIBookmarks(sessionId) as any;
      
      // 팀원 기능이 완성되지 않았으므로 임시로 빈 응답 처리
      const benefitsRes = { 
        success: true, 
        data: [] 
      };
      const mapPlacesRes = { 
        success: true, 
        data: [] 
      };
      
      const statsRes = await ApiClient.getBookmarkSummary(sessionId) as any;

      // 각 응답 처리
      if (aiRoutesRes?.success && aiRoutesRes?.data) {
        setAiRoutes(aiRoutesRes.data);
      }
      
      if (benefitsRes?.success && benefitsRes?.data) {
        setBenefits(benefitsRes.data);
      }
      
      if (mapPlacesRes?.success && mapPlacesRes?.data) {
        setMapPlaces(mapPlacesRes.data);
      }
      
      if (statsRes?.success && statsRes?.data) {
        setStats(statsRes.data);
      }

    } catch (error) {
      console.error('북마크 데이터 로드 실패:', error);
      
      // 에러 발생시 기본값 설정
      setAiRoutes([]);
      setBenefits([]);
      setMapPlaces([]);
    } finally {
      setLoading(false);
    }
  };

  // 탭별 개수 계산
  const getTabCounts = () => ({
    'ai-routes': aiRoutes.length,
    'benefits': benefits.length,
    'map-places': mapPlaces.length,
    'profile': 0
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            👤 마이페이지
            <span className="ml-3 text-sm font-normal text-gray-500">
              내가 저장한 여행 정보들
            </span>
          </h1>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6">
        
        {/* 요약 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">전체 북마크</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalBookmarks}</p>
              </div>
              <span className="text-2xl">📌</span>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">예상 총 예산</p>
                <p className="text-2xl font-bold text-blue-600">
                  {Math.floor(stats.totalBudget / 10000)}만원
                </p>
              </div>
              <span className="text-2xl">💰</span>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">AI 추천 코스</p>
                <p className="text-2xl font-bold text-green-600">{aiRoutes.length}</p>
              </div>
              <span className="text-2xl">🤖</span>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">선호 지역</p>
                <p className="text-sm font-bold text-purple-600">
                  {stats.mostLikedRegion === 'none' ? '아직 없음' : stats.mostLikedRegion}
                </p>
              </div>
              <span className="text-2xl">❤️</span>
            </div>
          </div>
        </div>

        {/* 탭 네비게이션 */}
        <div className="bg-white rounded-xl shadow-sm border mb-6">
          <div className="border-b">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'ai-routes', label: 'AI 추천 코스', icon: '🤖', count: getTabCounts()['ai-routes'] },
                { id: 'benefits', label: '청년 혜택', icon: '🎁', count: getTabCounts()['benefits'] },
                { id: 'map-places', label: '저장한 장소', icon: '📍', count: getTabCounts()['map-places'] },
                { id: 'profile', label: '내 정보', icon: '⚙️', count: 0 }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as MyPageTab)}
                  className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors relative ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="flex items-center">
                    <span className="mr-2">{tab.icon}</span>
                    {tab.label}
                    {tab.count > 0 && (
                      <span className="ml-2 bg-blue-100 text-blue-600 text-xs rounded-full px-2 py-0.5 font-bold">
                        {tab.count}
                      </span>
                    )}
                  </span>
                </button>
              ))}
            </nav>
          </div>

          {/* 탭 콘텐츠 */}
          <div className="p-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <p className="mt-4 text-gray-500">북마크 데이터를 불러오는 중...</p>
              </div>
            ) : (
              <>
                {activeTab === 'ai-routes' && <AIRoutesTab routes={aiRoutes} onRefresh={() => loadAllBookmarks(sessionId)} />}
                {activeTab === 'benefits' && <BenefitsTab benefits={benefits} onRefresh={() => loadAllBookmarks(sessionId)} />}
                {activeTab === 'map-places' && <MapPlacesTab places={mapPlaces} onRefresh={() => loadAllBookmarks(sessionId)} />}
                {activeTab === 'profile' && <ProfileTab sessionId={sessionId} />}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// AI 추천 코스 탭 컴포넌트
function AIRoutesTab({ routes, onRefresh }: { routes: BookmarkedAIRoute[]; onRefresh: () => void }) {
  if (routes.length === 0) {
    return (
      <div className="text-center py-12">
        <span className="text-6xl mb-4 block">🤖</span>
        <h3 className="text-xl font-bold text-gray-900 mb-2">저장된 AI 추천 코스가 없어요</h3>
        <p className="text-gray-500 mb-6">AI와 대화하여 맞춤 여행 코스를 받고 저장해보세요!</p>
        <a 
          href="/AI-route" 
          className="inline-flex items-center px-6 py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors"
        >
          AI 추천 받기 🚀
        </a>
      </div>
    );
  }

  const handleDeleteRoute = async (routeId: number) => {
    try {
      const sessionId = SessionManager.getSessionId();
      await ApiClient.deleteAIBookmark(routeId.toString(), sessionId);
      onRefresh(); // 목록 새로고침
      alert('✅ 코스가 삭제되었습니다.');
    } catch (error) {
      console.error('삭제 실패:', error);
      alert('❌ 삭제 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="space-y-4">
      {routes.map((route) => (
        <div key={route.id} className="border rounded-xl p-4 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between mb-3">
            <h3 className="font-bold text-lg text-gray-900">{route.title}</h3>
            <span className="text-sm text-gray-500">
              {new Date(route.created_at).toLocaleDateString()}
            </span>
          </div>
          
          <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
            <span>🏃‍♂️ {route.duration_hours}시간</span>
            <span>📍 {route.places_count}곳</span>
            <span>💰 {route.total_budget?.toLocaleString()}원</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <button className="text-blue-500 text-sm font-medium px-3 py-1 rounded border border-blue-200 hover:bg-blue-50">
                상세보기
              </button>
              <button className="text-green-500 text-sm font-medium px-3 py-1 rounded border border-green-200 hover:bg-green-50">
                다시 사용
              </button>
            </div>
            <button 
              onClick={() => handleDeleteRoute(route.id)}
              className="text-red-500 text-sm hover:text-red-700"
            >
              🗑️ 삭제
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// 청년 혜택 탭 컴포넌트 (팀원 구현 후 연동)
function BenefitsTab({ benefits, onRefresh }: { benefits: BookmarkedBenefit[]; onRefresh: () => void }) {
  return (
    <div className="text-center py-12">
      <span className="text-6xl mb-4 block">🎁</span>
      <h3 className="text-xl font-bold text-gray-900 mb-2">청년 혜택 북마크</h3>
      <p className="text-gray-500 mb-6">팀원분이 청년 혜택 기능을 완성하면 연동될 예정입니다</p>
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-800">
        🚧 개발 중인 기능입니다
      </div>
    </div>
  );
}

// 지도 장소 탭 컴포넌트 (팀원 구현 후 연동)
function MapPlacesTab({ places, onRefresh }: { places: BookmarkedMapPlace[]; onRefresh: () => void }) {
  return (
    <div className="text-center py-12">
      <span className="text-6xl mb-4 block">📍</span>
      <h3 className="text-xl font-bold text-gray-900 mb-2">저장한 장소</h3>
      <p className="text-gray-500 mb-6">팀원분이 지도 기능을 완성하면 연동될 예정입니다</p>
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-800">
        🚧 개발 중인 기능입니다
      </div>
    </div>
  );
}

// 프로필 탭 컴포넌트
function ProfileTab({ sessionId }: { sessionId: string }) {
  const handleClearAllData = async () => {
    if (confirm('⚠️ 정말로 모든 데이터를 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.')) {
      try {
        await ApiClient.deleteAllBookmarks(sessionId);
        alert('✅ 모든 데이터가 삭제되었습니다.');
        window.location.reload(); // 페이지 새로고침
      } catch (error) {
        console.error('데이터 삭제 실패:', error);
        alert('❌ 데이터 삭제 중 오류가 발생했습니다.');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">내 정보</h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">세션 ID</span>
            <span className="text-sm font-mono text-gray-800">
              {sessionId.slice(0, 20)}...
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">계정 타입</span>
            <span className="text-gray-800">브라우저 세션 기반</span>
          </div>
        </div>
      </div>
      
      <div className="bg-white border rounded-xl p-6">
        <h4 className="font-bold text-gray-900 mb-4">설정</h4>
        <div className="space-y-3">
          <button className="w-full text-left px-4 py-3 rounded-lg border hover:bg-gray-50 transition-colors">
            🔔 알림 설정
          </button>
          <button className="w-full text-left px-4 py-3 rounded-lg border hover:bg-gray-50 transition-colors">
            🌙 다크모드
          </button>
          <button 
            onClick={handleClearAllData}
            className="w-full text-left px-4 py-3 rounded-lg border hover:bg-red-50 text-red-600 transition-colors"
          >
            🗑️ 모든 데이터 삭제
          </button>
        </div>
      </div>
    </div>
  );
}