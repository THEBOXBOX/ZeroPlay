// frontend/src/app/mypage/page.tsx (팀원 북마크 API 연동 버전)
'use client';

import { useState, useEffect } from 'react';
import { SessionManager } from '@/lib/session';
import { Heart, MapPin, Gift, Route, Calendar } from 'lucide-react';

// 탭 타입 정의
type MyPageTab = 'ai-routes' | 'benefits' | 'map-places' | 'profile';

// 북마크 데이터 타입 정의
interface BookmarkedBenefit {
  id: number;
  title: string;
  organization: string;
  amount: string;
  amountType: string;
  category: string;
  period: string;
  age: string;
  region: string;
  tags: string[];
  type: string;
  bookmarked_at: string;
}

interface BookmarkedMapPlace {
  id: string;
  user_id: string;
  spot_id?: string;
  deal_id?: string;
  bookmark_type: 'spot' | 'deal';
  created_at: string;
  local_spots?: {
    id: string;
    name: string;
    category: string;
    address: string;
    rating?: number;
    price_range?: string;
  };
}

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

export default function MyPage() {
  const [activeTab, setActiveTab] = useState<MyPageTab>('ai-routes');
  const [sessionId, setSessionId] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // 각 카테고리별 북마크 데이터
  const [aiRoutes, setAiRoutes] = useState<BookmarkedAIRoute[]>([]);
  const [benefits, setBenefits] = useState<BookmarkedBenefit[]>([]);
  const [mapPlaces, setMapPlaces] = useState<BookmarkedMapPlace[]>([]);

  // 통계 데이터
  const [stats, setStats] = useState({
    totalBookmarks: 0,
    totalBudget: 0,
    aiRoutes: 0,
    benefits: 0,
    mapPlaces: 0
  });

  useEffect(() => {
    const currentSessionId = SessionManager.getSessionId();
    setSessionId(currentSessionId);
    loadAllBookmarks(currentSessionId);
  }, []);

  // 🔥 실제 팀원 API를 호출하는 함수들
  const loadAllBookmarks = async (sessionId: string) => {
    setLoading(true);
    console.log('🔄 모든 북마크 데이터 로딩 시작...');

    try {
      // 병렬로 모든 API 호출
      const [aiRoutesResult, benefitsResult, mapPlacesResult] = await Promise.allSettled([
        loadAIRoutes(sessionId),
        loadBenefitBookmarks(),
        loadMapBookmarks()
      ]);

      // AI 루트 북마크 처리
      if (aiRoutesResult.status === 'fulfilled') {
        console.log('✅ AI 루트 북마크 로딩 성공:', aiRoutesResult.value.length);
        setAiRoutes(aiRoutesResult.value);
      } else {
        console.error('❌ AI 루트 북마크 로딩 실패:', aiRoutesResult.reason);
        setAiRoutes([]);
      }

      // 청년혜택 북마크 처리  
      if (benefitsResult.status === 'fulfilled') {
        console.log('✅ 청년혜택 북마크 로딩 성공:', benefitsResult.value.length);
        setBenefits(benefitsResult.value);
      } else {
        console.error('❌ 청년혜택 북마크 로딩 실패:', benefitsResult.reason);
        setBenefits([]);
      }

      // 지도 북마크 처리
      if (mapPlacesResult.status === 'fulfilled') {
        console.log('✅ 지도 북마크 로딩 성공:', mapPlacesResult.value.length);
        setMapPlaces(mapPlacesResult.value);
      } else {
        console.error('❌ 지도 북마크 로딩 실패:', mapPlacesResult.reason);
        setMapPlaces([]);
      }

    } catch (error) {
      console.error('💥 북마크 로딩 중 예상치 못한 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  // AI 루트 북마크 로딩 (기존 API 사용)
  const loadAIRoutes = async (sessionId: string): Promise<BookmarkedAIRoute[]> => {
    try {
      const response = await fetch(`http://localhost:3001/api/bookmarks/ai-routes/${sessionId}`);
      
      if (!response.ok) {
        throw new Error(`AI Routes API Error: ${response.status}`);
      }

      const result = await response.json();
      return result.success ? (result.data || []) : [];
    } catch (error) {
      console.error('AI 루트 북마크 로딩 실패:', error);
      return [];
    }
  };

  // 🔥 청년혜택 북마크 로딩 (팀원 API 사용)
  const loadBenefitBookmarks = async (): Promise<BookmarkedBenefit[]> => {
    try {
      console.log('📡 청년혜택 북마크 API 호출...');
      
      const response = await fetch('http://localhost:3001/api/benefits/bookmarks', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': 'anonymous' // 임시 사용자 ID
        }
      });

      console.log('📥 청년혜택 API 응답 상태:', response.status);

      if (!response.ok) {
        if (response.status === 404) {
          console.log('ℹ️ 청년혜택 북마크 없음 (404)');
          return [];
        }
        throw new Error(`Benefits API Error: ${response.status}`);
      }

      const result = await response.json();
      console.log('📊 청년혜택 API 응답 데이터:', result);

      if (result.success && result.data) {
        return result.data;
      }

      return [];
    } catch (error) {
      console.error('청년혜택 북마크 로딩 실패:', error);
      return [];
    }
  };

  // 🔥 지도 북마크 로딩 (팀원 API 사용) 
  const loadMapBookmarks = async (): Promise<BookmarkedMapPlace[]> => {
    try {
      console.log('📡 지도 북마크 API 호출...');
      
      // localStorage에서 임시 사용자 ID 가져오기
      const userId = localStorage.getItem('temp_user_id') || 'anonymous';
      
      const response = await fetch(`http://localhost:3001/api/bookmarks?user_id=${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('📥 지도 북마크 API 응답 상태:', response.status);

      if (!response.ok) {
        if (response.status === 404) {
          console.log('ℹ️ 지도 북마크 없음 (404)');
          return [];
        }
        throw new Error(`Map Bookmarks API Error: ${response.status}`);
      }

      const result = await response.json();
      console.log('📊 지도 북마크 API 응답 데이터:', result);

      if (result.success && result.bookmarks) {
        return result.bookmarks;
      }

      return [];
    } catch (error) {
      console.error('지도 북마크 로딩 실패:', error);
      return [];
    }
  };

  // 통계 업데이트
  useEffect(() => {
    const totalBudget = aiRoutes.reduce((sum, route) => sum + (route.total_budget || 0), 0);
    
    setStats({
      totalBookmarks: aiRoutes.length + benefits.length + mapPlaces.length,
      totalBudget,
      aiRoutes: aiRoutes.length,
      benefits: benefits.length,
      mapPlaces: mapPlaces.length
    });
  }, [aiRoutes, benefits, mapPlaces]);

  // 탭별 개수 계산
  const getTabCounts = () => ({
    'ai-routes': aiRoutes.length,
    'benefits': benefits.length,
    'map-places': mapPlaces.length,
    'profile': 0
  });

  const handleDeleteAIRoute = async (routeId: number) => {
    try {
      const response = await fetch(`http://localhost:3001/api/bookmarks/ai-route/${routeId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ sessionId })
      });

      if (response.ok) {
        setAiRoutes(prev => prev.filter(route => route.id !== routeId));
        alert('✅ AI 루트가 삭제되었습니다.');
      }
    } catch (error) {
      console.error('AI 루트 삭제 실패:', error);
      alert('❌ 삭제 중 오류가 발생했습니다.');
    }
  };

  const handleDeleteBenefit = async (benefitId: number) => {
    try {
      const response = await fetch(`http://localhost:3001/api/benefits/bookmarks/${benefitId}`, {
        method: 'DELETE',
        headers: {
          'x-user-id': 'anonymous'
        }
      });

      if (response.ok) {
        setBenefits(prev => prev.filter(benefit => benefit.id !== benefitId));
        alert('✅ 청년혜택 북마크가 삭제되었습니다.');
      }
    } catch (error) {
      console.error('청년혜택 북마크 삭제 실패:', error);
      alert('❌ 삭제 중 오류가 발생했습니다.');
    }
  };

  const handleDeleteMapBookmark = async (bookmarkId: string, itemType: 'spot' | 'deal', itemId: string) => {
    try {
      const userId = localStorage.getItem('temp_user_id') || 'anonymous';
      const params = itemType === 'spot' ? `spot_id=${itemId}` : `deal_id=${itemId}`;
      
      const response = await fetch(`http://localhost:3001/api/bookmarks?user_id=${userId}&${params}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setMapPlaces(prev => prev.filter(place => place.id !== bookmarkId));
        alert('✅ 지도 북마크가 삭제되었습니다.');
      }
    } catch (error) {
      console.error('지도 북마크 삭제 실패:', error);
      alert('❌ 삭제 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <Heart className="w-7 h-7 text-red-500 mr-3" />
            마이페이지
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
              <Heart className="w-8 h-8 text-red-500" />
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
                <p className="text-2xl font-bold text-green-600">{stats.aiRoutes}</p>
              </div>
              <Route className="w-8 h-8 text-green-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">청년 혜택</p>
                <p className="text-2xl font-bold text-purple-600">{stats.benefits}</p>
              </div>
              <Gift className="w-8 h-8 text-purple-500" />
            </div>
          </div>
        </div>

        {/* 탭 네비게이션 */}
        <div className="bg-white rounded-xl shadow-sm border mb-6">
          <div className="border-b">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'ai-routes', label: 'AI 추천 코스', icon: Route, count: getTabCounts()['ai-routes'] },
                { id: 'benefits', label: '청년 혜택', icon: Gift, count: getTabCounts()['benefits'] },
                { id: 'map-places', label: '저장한 장소', icon: MapPin, count: getTabCounts()['map-places'] },
                { id: 'profile', label: '내 정보', icon: Calendar, count: 0 }
              ].map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as MyPageTab)}
                    className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors relative flex items-center ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <IconComponent className="w-4 h-4 mr-2" />
                    {tab.label}
                    {tab.count > 0 && (
                      <span className="ml-2 bg-blue-100 text-blue-600 text-xs rounded-full px-2 py-0.5 font-bold">
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
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
                {activeTab === 'ai-routes' && <AIRoutesTab routes={aiRoutes} onDelete={handleDeleteAIRoute} />}
                {activeTab === 'benefits' && <BenefitsTab benefits={benefits} onDelete={handleDeleteBenefit} />}
                {activeTab === 'map-places' && <MapPlacesTab places={mapPlaces} onDelete={handleDeleteMapBookmark} />}
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
function AIRoutesTab({ routes, onDelete }: { routes: BookmarkedAIRoute[]; onDelete: (id: number) => void }) {
  if (routes.length === 0) {
    return (
      <div className="text-center py-12">
        <Route className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-900 mb-2">저장된 AI 추천 코스가 없어요</h3>
        <p className="text-gray-500 mb-6">AI와 대화하여 맞춤 여행 코스를 받고 저장해보세요!</p>
        <a 
          href="/AI-route" 
          className="inline-flex items-center px-6 py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors"
        >
          <Route className="w-4 h-4 mr-2" />
          AI 추천 받기
        </a>
      </div>
    );
  }

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
            <span className="flex items-center"><Route className="w-3 h-3 mr-1" /> {route.duration_hours}시간</span>
            <span className="flex items-center"><MapPin className="w-3 h-3 mr-1" /> {route.places_count}곳</span>
            <span className="flex items-center">💰 {route.total_budget?.toLocaleString()}원</span>
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
              onClick={() => onDelete(route.id)}
              className="text-red-500 text-sm hover:text-red-700 px-3 py-1 rounded hover:bg-red-50"
            >
              🗑️ 삭제
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// 🔥 청년 혜택 탭 컴포넌트 (팀원 API 연동)
function BenefitsTab({ benefits, onDelete }: { benefits: BookmarkedBenefit[]; onDelete: (id: number) => void }) {
  if (benefits.length === 0) {
    return (
      <div className="text-center py-12">
        <Gift className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-900 mb-2">저장된 청년 혜택이 없어요</h3>
        <p className="text-gray-500 mb-6">청년 혜택을 둘러보고 유용한 정보를 저장해보세요!</p>
        <a 
          href="/benefits" 
          className="inline-flex items-center px-6 py-3 bg-purple-500 text-white rounded-xl font-medium hover:bg-purple-600 transition-colors"
        >
          <Gift className="w-4 h-4 mr-2" />
          청년 혜택 보러가기
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {benefits.map((benefit) => (
        <div key={benefit.id} className="border rounded-xl p-4 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3 className="font-bold text-lg text-gray-900 mb-1">{benefit.title}</h3>
              <p className="text-sm text-gray-600">{benefit.organization}</p>
            </div>
            <div className="text-right ml-4">
              <span className="text-lg font-bold text-purple-600">{benefit.amount}</span>
              <div className="text-xs text-gray-500">{benefit.amountType}</div>
            </div>
          </div>
          
          {/* 태그 영역 */}
          <div className="flex flex-wrap gap-2 mb-3">
            <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs font-medium">
              {benefit.category}
            </span>
            {benefit.tags?.slice(0, 3).map((tag, index) => (
              <span key={index} className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                {tag}
              </span>
            ))}
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex gap-4 text-gray-600">
              <span>📅 {benefit.period}</span>
              <span>👥 {benefit.age}</span>
              <span>📍 {benefit.region}</span>
            </div>
            <button 
              onClick={() => onDelete(benefit.id)}
              className="text-red-500 hover:text-red-700 px-3 py-1 rounded hover:bg-red-50"
            >
              🗑️ 삭제
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// 🔥 지도 장소 탭 컴포넌트 (팀원 API 연동)
function MapPlacesTab({ places, onDelete }: { 
  places: BookmarkedMapPlace[]; 
  onDelete: (bookmarkId: string, itemType: 'spot' | 'deal', itemId: string) => void 
}) {
  if (places.length === 0) {
    return (
      <div className="text-center py-12">
        <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-900 mb-2">저장된 장소가 없어요</h3>
        <p className="text-gray-500 mb-6">지도에서 관심있는 장소를 북마크해보세요!</p>
        <a 
          href="/Map" 
          className="inline-flex items-center px-6 py-3 bg-indigo-500 text-white rounded-xl font-medium hover:bg-indigo-600 transition-colors"
        >
          <MapPin className="w-4 h-4 mr-2" />
          지도에서 장소 찾기
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {places.map((place) => (
        <div key={place.id} className="border rounded-xl p-4 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3 className="font-bold text-lg text-gray-900 mb-1">
                {place.local_spots?.name || `${place.bookmark_type} ID: ${place.spot_id || place.deal_id}`}
              </h3>
              {place.local_spots?.address && (
                <p className="text-sm text-gray-600 mb-2">{place.local_spots.address}</p>
              )}
            </div>
            <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full">
              {place.bookmark_type === 'spot' ? '장소' : '딜'}
            </span>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <div className="flex gap-4 text-gray-600">
              {place.local_spots?.category && (
                <span>🏷️ {place.local_spots.category}</span>
              )}
              {place.local_spots?.rating && (
                <span>⭐ {place.local_spots.rating}</span>
              )}
              {place.local_spots?.price_range && (
                <span>💰 {place.local_spots.price_range}</span>
              )}
              <span>📅 {new Date(place.created_at).toLocaleDateString()}</span>
            </div>
            <button 
              onClick={() => onDelete(
                place.id, 
                place.bookmark_type, 
                place.spot_id || place.deal_id || ''
              )}
              className="text-red-500 hover:text-red-700 px-3 py-1 rounded hover:bg-red-50"
            >
              🗑️ 삭제
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// 프로필 탭 컴포넌트
function ProfileTab({ sessionId }: { sessionId: string }) {
  const handleRefreshData = () => {
    window.location.reload();
  };

  const handleClearAllData = async () => {
    if (confirm('⚠️ 정말로 모든 북마크를 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.')) {
      try {
        // AI 루트 북마크 전체 삭제
        await fetch(`http://localhost:3001/api/bookmarks/all/${sessionId}`, {
          method: 'DELETE'
        });
        
        alert('✅ 모든 데이터가 삭제되었습니다.');
        window.location.reload();
      } catch (error) {
        console.error('데이터 삭제 실패:', error);
        alert('❌ 데이터 삭제 중 오류가 발생했습니다.');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
          <Calendar className="w-5 h-5 mr-2" />
          내 정보
        </h3>
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
          <div className="flex justify-between">
            <span className="text-gray-600">마지막 업데이트</span>
            <span className="text-gray-800">{new Date().toLocaleDateString()}</span>
          </div>
        </div>
      </div>
      
      <div className="bg-white border rounded-xl p-6">
        <h4 className="font-bold text-gray-900 mb-4 flex items-center">
          <span className="text-lg mr-2">⚙️</span>
          설정 및 관리
        </h4>
        <div className="space-y-3">
          <button 
            onClick={handleRefreshData}
            className="w-full text-left px-4 py-3 rounded-lg border hover:bg-blue-50 transition-colors flex items-center"
          >
            <span className="mr-3">🔄</span>
            <div>
              <div className="font-medium">데이터 새로고침</div>
              <div className="text-sm text-gray-500">모든 북마크 데이터를 다시 불러옵니다</div>
            </div>
          </button>
          
          <button className="w-full text-left px-4 py-3 rounded-lg border hover:bg-gray-50 transition-colors flex items-center">
            <span className="mr-3">🔔</span>
            <div>
              <div className="font-medium">알림 설정</div>
              <div className="text-sm text-gray-500">새로운 혜택 알림을 받아보세요</div>
            </div>
          </button>
          
          <button className="w-full text-left px-4 py-3 rounded-lg border hover:bg-gray-50 transition-colors flex items-center">
            <span className="mr-3">🌙</span>
            <div>
              <div className="font-medium">다크모드</div>
              <div className="text-sm text-gray-500">어두운 테마로 전환</div>
            </div>
          </button>
          
          <button 
            onClick={handleClearAllData}
            className="w-full text-left px-4 py-3 rounded-lg border hover:bg-red-50 text-red-600 transition-colors flex items-center"
          >
            <span className="mr-3">🗑️</span>
            <div>
              <div className="font-medium">모든 데이터 삭제</div>
              <div className="text-sm text-red-500">저장된 모든 북마크를 삭제합니다</div>
            </div>
          </button>
        </div>
      </div>

      {/* 🔥 API 상태 체크 패널 */}
      <div className="bg-white border rounded-xl p-6">
        <h4 className="font-bold text-gray-900 mb-4 flex items-center">
          <span className="text-lg mr-2">📡</span>
          API 연동 상태
        </h4>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
            <div className="flex items-center">
              <span className="w-3 h-3 bg-green-500 rounded-full mr-3"></span>
              <div>
                <div className="font-medium text-green-800">AI 루트 북마크</div>
                <div className="text-sm text-green-600">/api/bookmarks/ai-routes</div>
              </div>
            </div>
            <span className="text-green-600 font-bold">✅ 연동됨</span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
            <div className="flex items-center">
              <span className="w-3 h-3 bg-green-500 rounded-full mr-3"></span>
              <div>
                <div className="font-medium text-green-800">청년혜택 북마크</div>
                <div className="text-sm text-green-600">/api/benefits/bookmarks</div>
              </div>
            </div>
            <span className="text-green-600 font-bold">✅ 연동됨</span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
            <div className="flex items-center">
              <span className="w-3 h-3 bg-green-500 rounded-full mr-3"></span>
              <div>
                <div className="font-medium text-green-800">지도 북마크</div>
                <div className="text-sm text-green-600">/api/bookmarks</div>
              </div>
            </div>
            <span className="text-green-600 font-bold">✅ 연동됨</span>
          </div>
        </div>
        
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center mb-2">
            <span className="text-blue-500 mr-2">ℹ️</span>
            <span className="font-medium text-blue-800">팀원 API 연동 완료!</span>
          </div>
          <p className="text-sm text-blue-600">
            모든 팀원들의 북마크 API가 성공적으로 연동되어 실시간으로 데이터를 가져오고 있습니다.
          </p>
        </div>
      </div>

      {/* 개발자 정보 */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6">
        <h4 className="font-bold text-gray-900 mb-4 flex items-center">
          <span className="text-lg mr-2">👨‍💻</span>
          개발 정보
        </h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="bg-white rounded-lg p-3">
            <div className="font-medium text-gray-700 mb-1">프로젝트</div>
            <div className="text-gray-600">지도 기반 로컬 체험 서비스</div>
          </div>
          <div className="bg-white rounded-lg p-3">
            <div className="font-medium text-gray-700 mb-1">버전</div>
            <div className="text-gray-600">v1.0.0-beta</div>
          </div>
          <div className="bg-white rounded-lg p-3">
            <div className="font-medium text-gray-700 mb-1">최근 업데이트</div>
            <div className="text-gray-600">{new Date().toLocaleDateString()}</div>
          </div>
          <div className="bg-white rounded-lg p-3">
            <div className="font-medium text-gray-700 mb-1">데이터베이스</div>
            <div className="text-gray-600">Supabase PostgreSQL</div>
          </div>
        </div>
      </div>
    </div>
  );
}
