'use client';

import { useState, useEffect } from 'react';
import { SessionManager } from '@/lib/session';
import { Heart, MapPin, Gift, Route, Calendar } from 'lucide-react';
// 🔥 공통 헤더와 네비바 import
import Header from '../components/Header';
import BottomNavBar from '../components/NavBar';

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

// 🔥 임시 유저 ID 생성 함수
const getTempUserId = (): string => {
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

export default function MyPage() {
  const [activeTab, setActiveTab] = useState<MyPageTab>('ai-routes');
  const [navActiveTab, setNavActiveTab] = useState('내 정보');
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

  // 🔥 첫 번째 파일의 실시간 동기화 유지
  useEffect(() => {
    // 지도에서 북마크 변경 시 마이페이지 업데이트
    const handleMapBookmarkChange = (event: CustomEvent) => {
      console.log('🔄 지도 북마크 변경 감지:', event.detail);
      
      // 북마크 목록 새로고침
      loadAllBookmarks(sessionId);
    };

    // 이벤트 리스너 등록
    window.addEventListener('mapBookmarkChanged', handleMapBookmarkChange as EventListener);
    
    return () => {
      window.removeEventListener('mapBookmarkChanged', handleMapBookmarkChange as EventListener);
    };
  }, [sessionId]);

  // 🔥 첫 번째 파일의 상대경로 API 사용 유지
  const loadMapBookmarks = async (): Promise<BookmarkedMapPlace[]> => {
    try {
      console.log('📡 지도 북마크 API 호출...');
      
      const userId = getTempUserId();
      console.log('🆔 사용할 User ID:', userId);
      
      // 🔥 첫 번째 파일의 상대경로 사용
      const response = await fetch(`/api/bookmarks?user_id=${userId}`, {
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
        console.log('✅ 지도 북마크 파싱 성공:', result.bookmarks.length, '개');
        return result.bookmarks;
      }

      return [];
    } catch (error) {
      console.error('❌ 지도 북마크 로딩 실패:', error);
      return [];
    }
  };

  // 기존 데이터 로딩 로직
  const loadAllBookmarks = async (sessionId: string) => {
    setLoading(true);
    console.log('🔄 모든 북마크 데이터 로딩 시작...');

    try {
      // 병렬로 모든 API 호출
      const [aiRoutesResult, benefitsResult, mapPlacesResult] = await Promise.allSettled([
        loadAIRoutes(sessionId),
        loadBenefitBookmarks(),
        loadMapBookmarks() // 🔥 첫 번째 파일의 함수 사용
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

  // 청년혜택 북마크 로딩 (팀원 API 사용)
  const loadBenefitBookmarks = async (): Promise<BookmarkedBenefit[]> => {
    try {
      console.log('📡 청년혜택 북마크 API 호출...');
      
      const response = await fetch('http://localhost:3001/api/benefits/bookmarks', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': 'anonymous'
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

  // 🔥 첫 번째 파일의 상대경로 삭제 API 사용 유지
  const handleDeleteMapBookmark = async (bookmarkId: string, itemType: 'spot' | 'deal', itemId: string) => {
    try {
      console.log('🗑️ 지도 북마크 삭제 시도:', { bookmarkId, itemType, itemId });
      
      const userId = getTempUserId();
      const params = itemType === 'spot' ? `spot_id=${itemId}` : `deal_id=${itemId}`;
      
      // 🔥 첫 번째 파일의 상대경로 사용
      const response = await fetch(`/api/bookmarks?user_id=${userId}&${params}`, {
        method: 'DELETE'
      });

      console.log('🗑️ 삭제 응답 상태:', response.status);

      if (response.ok) {
        setMapPlaces(prev => prev.filter(place => place.id !== bookmarkId));
        alert('✅ 지도 북마크가 삭제되었습니다.');
        console.log('✅ 지도 북마크 삭제 성공');
      } else {
        const errorText = await response.text();
        console.error('❌ 삭제 실패:', errorText);
        throw new Error(`삭제 실패: ${response.status}`);
      }
    } catch (error) {
      console.error('지도 북마크 삭제 실패:', error);
      alert('❌ 삭제 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 max-w-[393px] mx-auto">
      {/* 🔥 공통 헤더 */}
      <div className="fixed top-0 left-1/2 transform -translate-x-1/2 w-full max-w-[393px] z-50">
        <Header 
          title="mySUBWAY"
          showSearch={false}
          onNotificationClick={() => console.log('알림 클릭')}
          onSettingsClick={() => console.log('설정 클릭')}
          className="h-[60px] border-b border-gray-100"
        />
      </div>

      {/* 🔥 메인 콘텐츠 - 두 번째 파일의 개선된 여백 적용 */}
      <div 
        className="bg-white flex flex-col"
        style={{ 
          marginTop: '60px', 
          // 🔥 두 번째 파일의 개선사항: 공통 네비바 높이를 70px로 맞춤
          marginBottom: '70px',
          minHeight: 'calc(100vh - 130px)',
          maxWidth: '393px'
        }}
      >
        {/* 마이페이지 헤더 */}
        <div className="bg-white border-b border-gray-100 px-4 py-3">
          <div className="flex items-center">
            <Heart className="w-6 h-6 text-red-500 mr-3" />
            <div>
              <h1 className="text-lg font-bold text-gray-900">마이페이지</h1>
              <p className="text-xs text-gray-500">내가 저장한 여행 정보들</p>
            </div>
          </div>
        </div>

        {/* 요약 통계 카드 */}
        <div className="px-4 py-4 bg-gray-50">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-lg shadow-sm border p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500">전체 북마크</p>
                  <p className="text-lg font-bold text-gray-900">{stats.totalBookmarks}</p>
                </div>
                <Heart className="w-6 h-6 text-red-500" />
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500">예상 총 예산</p>
                  <p className="text-lg font-bold text-blue-600">
                    {Math.floor(stats.totalBudget / 10000)}만원
                  </p>
                </div>
                <span className="text-xl">💰</span>
              </div>
            </div>
          </div>
        </div>

        {/* 탭 네비게이션 - 모바일 최적화 */}
        <div className="bg-white border-b border-gray-200">
          <div className="px-4 py-2">
            <div className="flex space-x-2 overflow-x-auto">
              {[
                { id: 'ai-routes', label: 'AI 코스', icon: Route, count: getTabCounts()['ai-routes'] },
                { id: 'benefits', label: '청년 혜택', icon: Gift, count: getTabCounts()['benefits'] },
                { id: 'map-places', label: '저장 장소', icon: MapPin, count: getTabCounts()['map-places'] },
                { id: 'profile', label: '내 정보', icon: Calendar, count: 0 }
              ].map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as MyPageTab)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg border transition-all whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'bg-blue-500 text-white border-blue-500'
                        : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <IconComponent className="w-4 h-4" />
                    <span className="text-sm font-medium">{tab.label}</span>
                    {tab.count > 0 && (
                      <span className={`text-xs rounded-full px-2 py-0.5 font-bold ${
                        activeTab === tab.id 
                          ? 'bg-white/20 text-white' 
                          : 'bg-blue-100 text-blue-600'
                      }`}>
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 🔥 탭 콘텐츠 - 두 번째 파일의 개선된 스크롤 영역 적용 */}
        <div 
          className="flex-1 overflow-auto px-4 py-4"
          style={{ 
            height: 'calc(100vh - 330px)', // 🔥 두 번째 파일의 높이를 더 넉넉하게 조정
            paddingBottom: '20px' // 🔥 두 번째 파일의 하단 패딩 추가
          }}
        >
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

      {/* 🔥 공통 하단 네비게이션 */}
      <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-[393px] z-50">
        <BottomNavBar
          activeTab={navActiveTab}
          onTabChange={setNavActiveTab}
        />
      </div>
    </div>
  );
}

// AI 추천 코스 탭 컴포넌트 - 모바일 최적화
function AIRoutesTab({ routes, onDelete }: { routes: BookmarkedAIRoute[]; onDelete: (id: number) => void }) {
  if (routes.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Route className="w-8 h-8 text-gray-300" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">저장된 AI 추천 코스가 없어요</h3>
        <p className="text-sm text-gray-500 mb-6">AI와 대화하여 맞춤 여행 코스를 받고 저장해보세요!</p>
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
    <div className="space-y-4 pb-6"> {/* 🔥 두 번째 파일의 pb-6 추가 */}
      {routes.map((route) => (
        <div key={route.id} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <div className="flex items-start justify-between mb-3">
            <h3 className="font-bold text-base text-gray-900 flex-1 pr-2">{route.title}</h3>
            <span className="text-xs text-gray-500 whitespace-nowrap">
              {new Date(route.created_at).toLocaleDateString()}
            </span>
          </div>
          
          <div className="flex items-center gap-4 text-xs text-gray-600 mb-3">
            <span className="flex items-center"><Route className="w-3 h-3 mr-1" /> {route.duration_hours}시간</span>
            <span className="flex items-center"><MapPin className="w-3 h-3 mr-1" /> {route.places_count}곳</span>
            <span className="flex items-center">💰 {route.total_budget?.toLocaleString()}원</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <button className="text-blue-500 text-xs font-medium px-3 py-1 rounded border border-blue-200 hover:bg-blue-50">
                상세보기
              </button>
            </div>
            <button 
              onClick={() => onDelete(route.id)}
              className="text-red-500 text-xs hover:text-red-700 px-3 py-1 rounded hover:bg-red-50"
            >
              🗑️ 삭제
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// 🔥 청년 혜택 탭 컴포넌트 (모바일 최적화)
function BenefitsTab({ benefits, onDelete }: { benefits: BookmarkedBenefit[]; onDelete: (id: number) => void }) {
  if (benefits.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Gift className="w-8 h-8 text-gray-300" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">저장된 청년 혜택이 없어요</h3>
        <p className="text-sm text-gray-500 mb-6">청년 혜택을 둘러보고 유용한 정보를 저장해보세요!</p>
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
    <div className="space-y-4 pb-6"> {/* 🔥 두 번째 파일의 pb-6 추가 */}
      {benefits.map((benefit) => (
        <div key={benefit.id} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3 className="font-bold text-base text-gray-900 mb-1">{benefit.title}</h3>
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
            {benefit.tags?.slice(0, 2).map((tag, index) => (
              <span key={index} className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                {tag}
              </span>
            ))}
          </div>

          <div className="flex items-center justify-between text-xs">
            <div className="flex gap-3 text-gray-600">
              <span>📅 {benefit.period}</span>
              <span>👥 {benefit.age}</span>
            </div>
            <button 
              onClick={() => onDelete(benefit.id)}
              className="text-red-500 hover:text-red-700 px-3 py-1 rounded hover:bg-red-50"
            >
              🗑️삭제
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// 🔥 개선된 지도 장소 탭 컴포넌트
function MapPlacesTab({ places, onDelete }: { 
  places: BookmarkedMapPlace[]; 
  onDelete: (bookmarkId: string, itemType: 'spot' | 'deal', itemId: string) => void 
}) {
  console.log('🗺️ MapPlacesTab 렌더링:', places);
  
  if (places.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <MapPin className="w-8 h-8 text-gray-300" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">저장된 장소가 없어요</h3>
        <p className="text-sm text-gray-500 mb-6">지도에서 관심있는 장소를 북마크해보세요!</p>
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
    <div className="space-y-4 pb-6"> {/* 🔥 두 번째 파일의 pb-6 추가 */}
      {places.map((place) => (
        <div key={place.id} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3 className="font-bold text-base text-gray-900 mb-1">
                {place.local_spots?.name || `${place.bookmark_type} ID: ${place.spot_id || place.deal_id}`}
              </h3>
              {place.local_spots?.address && (
                <p className="text-sm text-gray-600 mb-2">{place.local_spots.address}</p>
              )}
              {/* 🔥 추가 정보 표시 */}
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <span>📅 {new Date(place.created_at).toLocaleDateString()}</span>
                {place.local_spots?.category && (
                  <span>🏷️ {place.local_spots.category}</span>
                )}
                {place.local_spots?.rating && (
                  <span>⭐ {place.local_spots.rating}</span>
                )}
              </div>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full mb-2">
                {place.bookmark_type === 'spot' ? '장소' : '딜'}
              </span>
              <button 
                onClick={() => onDelete(
                  place.id, 
                  place.bookmark_type, 
                  place.spot_id || place.deal_id || ''
                )}
                className="text-red-500 hover:text-red-700 px-2 py-1 rounded hover:bg-red-50 text-xs"
              >
                🗑️ 삭제
              </button>
            </div>
          </div>
        </div>
      ))}
      
      {/* 🔥 첫 번째 파일의 디버그 정보 제거 (두 번째 파일에서는 제거됨) */}
    </div>
  );
}

// 프로필 탭 컴포넌트 (모바일 최적화)
function ProfileTab({ sessionId }: { sessionId: string }) {
  const handleRefreshData = () => {
    window.location.reload();
  };

  const handleClearAllData = async () => {
    if (confirm('⚠️ 정말로 모든 북마크를 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.')) {
      try {
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
    <div className="space-y-4 pb-6"> {/* 🔥 두 번째 파일의 pb-6 추가 */}
      <div className="bg-white rounded-xl p-4 border border-gray-200">
        <h3 className="text-base font-bold text-gray-900 mb-3 flex items-center">
          <Calendar className="w-4 h-4 mr-2" />
          내 정보
        </h3>
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">세션 ID</span>
            <span className="text-xs font-mono text-gray-800">
              {sessionId.slice(0, 15)}...
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">계정 타입</span>
            <span className="text-gray-800">브라우저 세션</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">지도 User ID</span>
            <span className="text-xs font-mono text-gray-800">
              {getTempUserId().slice(0, 8)}...
            </span>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-xl p-4 border border-gray-200">
        <h4 className="font-bold text-gray-900 mb-4 flex items-center text-sm">
          <span className="mr-2">⚙️</span>
          설정 및 관리
        </h4>
        <div className="space-y-3">
          <button 
            onClick={handleRefreshData}
            className="w-full text-left px-3 py-2 rounded-lg border hover:bg-blue-50 transition-colors flex items-center text-sm"
          >
            <span className="mr-3">🔄</span>
            <div>
              <div className="font-medium">데이터 새로고침</div>
              <div className="text-xs text-gray-500">모든 북마크 데이터를 다시 불러옵니다</div>
            </div>
          </button>
          
          <button 
            onClick={handleClearAllData}
            className="w-full text-left px-3 py-2 rounded-lg border hover:bg-red-50 text-red-600 transition-colors flex items-center text-sm"
          >
            <span className="mr-3">🗑️</span>
            <div>
              <div className="font-medium">모든 데이터 삭제</div>
              <div className="text-xs text-red-500">저장된 모든 북마크를 삭제합니다</div>
            </div>
          </button>
        </div>
      </div>

      {/* API 상태 체크 패널 (모바일 최적화) */}
      <div className="bg-white rounded-xl p-4 border border-gray-200">
        <h4 className="font-bold text-gray-900 mb-4 flex items-center text-sm">
          <span className="mr-2">📡</span>
          API 연동 상태
        </h4>
        <div className="space-y-2">
          {[
            { name: 'AI 루트 북마크', status: '연동됨' },
            { name: '청년혜택 북마크', status: '연동됨' },
            { name: '지도 북마크', status: '연동됨' }
          ].map((api, index) => (
            <div key={index} className="flex items-center justify-between p-2 bg-green-50 rounded-lg">
              <div className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                <span className="text-xs font-medium text-green-800">{api.name}</span>
              </div>
              <span className="text-green-600 font-bold text-xs">✅ {api.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}