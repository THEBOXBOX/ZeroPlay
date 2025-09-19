'use client';

import { useState, useEffect } from 'react';
import AppContainer from './components/AppContainer';
import BottomNavigation from './components/BottomNavigation';
import FilterButtons from './components/FilterButtons';
import ChatBot from './components/ChatBot';
import RouteResults from './components/RouteResults';

export interface FilterState {
  budget: string;
  duration: string;
  companions: string;
  interests: string[];
  region: string;
}

export interface RouteRecommendation {
  id: string;
  title: string;
  duration: string;
  totalBudget: number;
  places: Array<{
    id: string;
    name: string;
    type: string;
    duration: string;
    cost: number;
    description: string;
  }>;
  highlights: string[];
  difficulty: 'easy' | 'moderate' | 'hard';
}

type MobileTab = 'chat' | 'filters' | 'results';

export default function AIRoutePage() {
  const [filters, setFilters] = useState<FilterState>({
    budget: '',
    duration: '',
    companions: '',
    interests: [],
    region: ''
  });

  const [currentRoutes, setCurrentRoutes] = useState<RouteRecommendation[]>([]);
  const [activeTab, setActiveTab] = useState<MobileTab>('chat');

  // 결과가 생성되면 결과 탭으로 자동 이동
  useEffect(() => {
    if (currentRoutes.length > 0) {
      setActiveTab('results');
    }
  }, [currentRoutes.length]);

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
  };

  const handleRouteGenerated = (routeData: any) => {
    const newRoute: RouteRecommendation = {
      id: routeData.id.toString(),
      title: routeData.title,
      duration: routeData.duration,
      totalBudget: routeData.totalBudget || 100000,
      places: routeData.places.map((place: any, index: number) => ({
        id: (index + 1).toString(),
        name: place.name,
        type: place.type,
        duration: place.duration,
        cost: place.cost || 20000,
        description: place.description || `${place.name}에서 즐기는 특별한 시간`
      })),
      highlights: routeData.highlights || ['힐링', '맛집', '관광'],
      difficulty: routeData.difficulty || 'easy'
    };

    setCurrentRoutes(prev => [...prev, newRoute]);
  };

  // 활성 필터 개수 계산
  const activeFiltersCount = Object.values(filters).reduce((count, value) => {
    if (Array.isArray(value)) {
      return count + value.length;
    }
    return count + (value ? 1 : 0);
  }, 0);

  return (
    <AppContainer>
      {/* 앱 헤더 */}
      <header className="bg-white border-b border-gray-100 px-4 py-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center mr-3">
              <span className="text-white text-lg font-bold">🤖</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">AI 여행 추천</h1>
              <p className="text-xs text-gray-500">맞춤 여행 코스 생성</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
              <span className="text-gray-600">🔔</span>
            </button>
            <button className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
              <span className="text-gray-600">⚙️</span>
            </button>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 영역 */}
      <div className="flex-1 overflow-hidden bg-gray-50">
        
        {/* 채팅 탭 */}
        {activeTab === 'chat' && (
          <div className="h-full bg-white">
            {/* 상단 탭 인디케이터 */}
            <div className="bg-blue-50 px-4 py-2 border-b">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                <span className="text-sm font-medium text-blue-700">AI 여행 추천</span>
              </div>
            </div>
            <ChatBot 
              onRouteGenerated={handleRouteGenerated} 
              filters={filters}
            />
          </div>
        )}

        {/* 필터 탭 */}
        {activeTab === 'filters' && (
          <div className="h-full overflow-auto">
            <div className="p-4 space-y-4">
              
              {/* 필터 헤더 카드 */}
              <div className="bg-white rounded-2xl shadow-sm p-4 border">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-lg font-bold text-gray-900 flex items-center">
                    <span className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center mr-2 text-sm">
                      ⚙️
                    </span>
                    여행 조건 설정
                  </h2>
                  {activeFiltersCount > 0 && (
                    <span className="bg-indigo-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                      {activeFiltersCount}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600">
                  원하는 여행 스타일을 선택하면 AI가 맞춤 코스를 추천해드려요
                </p>
              </div>

              {/* 필터 컴포넌트 */}
              <div className="bg-white rounded-2xl shadow-sm border">
                <FilterButtons 
                  filters={filters} 
                  onFilterChange={handleFilterChange}
                />
              </div>

              {/* 적용 버튼 */}
              {activeFiltersCount > 0 && (
                <div className="bg-white rounded-2xl shadow-sm p-4 border">
                  <button
                    onClick={() => setActiveTab('chat')}
                    className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-4 px-4 rounded-xl font-bold text-base shadow-lg hover:shadow-xl transition-all transform active:scale-95"
                  >
                    조건 적용하고 AI 추천받기 ✨
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 결과 탭 */}
        {activeTab === 'results' && (
          <div className="h-full overflow-auto">
            <div className="p-4">
              {currentRoutes.length > 0 ? (
                <div className="space-y-4">
                  
                  {/* 결과 헤더 카드 */}
                  <div className="bg-white rounded-2xl shadow-sm p-4 border">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center mr-3">
                          <span className="text-green-600 text-lg">🗺️</span>
                        </div>
                        <div>
                          <h2 className="text-lg font-bold text-gray-900">추천 코스</h2>
                          <p className="text-sm text-gray-600">
                            {currentRoutes.length}개의 맞춤 여행 코스
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setActiveTab('chat')}
                        className="bg-blue-50 text-blue-600 text-sm font-medium px-3 py-2 rounded-lg hover:bg-blue-100 transition-colors"
                      >
                        + 새 코스
                      </button>
                    </div>
                  </div>

                  {/* 결과 리스트 */}
                  <RouteResults routes={currentRoutes} />
                </div>
              ) : (
                <div className="bg-white rounded-2xl shadow-sm p-8 text-center border">
                  <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-2xl flex items-center justify-center">
                    <span className="text-3xl text-gray-400">🗺️</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">아직 추천 코스가 없어요</h3>
                  <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                    AI와 대화하여<br />맞춤 여행 코스를 만들어보세요!
                  </p>
                  <button
                    onClick={() => setActiveTab('chat')}
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all transform active:scale-95"
                  >
                    AI 추천 시작하기 🚀
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 하단 네비게이션 */}
      <BottomNavigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        activeFiltersCount={activeFiltersCount}
        resultsCount={currentRoutes.length}
      />
    </AppContainer>
  );
}