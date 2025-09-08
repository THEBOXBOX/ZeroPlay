'use client';

import { useState, useEffect } from 'react';
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
    <div className="h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
      
      {/* 모바일 헤더 */}
      <header className="bg-white shadow-sm border-b flex-shrink-0">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-bold text-gray-800 truncate">🤖 AI 여행 추천</h1>
              <p className="text-xs text-gray-600 truncate">
                {activeTab === 'chat' && '맞춤 여행 코스를 상담해보세요'}
                {activeTab === 'filters' && '여행 조건을 설정해주세요'}
                {activeTab === 'results' && `${currentRoutes.length}개의 추천 코스`}
              </p>
            </div>
            <div className="flex items-center space-x-1 text-xs text-gray-500 flex-shrink-0">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              <span>AI 연결됨</span>
            </div>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 영역 */}
      <div className="flex-1 overflow-hidden">
        
        {/* 채팅 탭 */}
        {activeTab === 'chat' && (
          <div className="h-full bg-white">
            <ChatBot onRouteGenerated={handleRouteGenerated} />
          </div>
        )}

        {/* 필터 탭 */}
        {activeTab === 'filters' && (
          <div className="h-full overflow-auto bg-gray-50">
            <div className="p-4 space-y-4">
              
              {/* 필터 헤더 */}
              <div className="bg-white rounded-lg shadow-sm p-4">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-semibold text-gray-800">여행 조건 설정</h2>
                  {activeFiltersCount > 0 && (
                    <span className="bg-indigo-100 text-indigo-700 text-sm px-3 py-1 rounded-full font-medium">
                      {activeFiltersCount}개 선택됨
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600">
                  원하는 여행 스타일을 선택하면 AI가 맞춤 코스를 추천해드려요
                </p>
              </div>

              {/* 필터 컴포넌트 */}
              <div className="bg-white rounded-lg shadow-sm p-4">
                <FilterButtons 
                  filters={filters} 
                  onFilterChange={handleFilterChange}
                />
              </div>

              {/* 적용 버튼 */}
              {activeFiltersCount > 0 && (
                <div className="bg-white rounded-lg shadow-sm p-4">
                  <button
                    onClick={() => setActiveTab('chat')}
                    className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-600 transition-colors min-h-[48px]"
                  >
                    필터 적용하고 채팅 시작하기
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 결과 탭 */}
        {activeTab === 'results' && (
          <div className="h-full overflow-auto bg-gray-50">
            <div className="p-4">
              {currentRoutes.length > 0 ? (
                <div className="space-y-4">
                  
                  {/* 결과 헤더 */}
                  <div className="bg-white rounded-lg shadow-sm p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                          <span className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-2 text-sm">
                            🗺️
                          </span>
                          추천 코스
                        </h2>
                        <p className="text-sm text-gray-600 mt-1">
                          {currentRoutes.length}개의 맞춤 여행 코스를 찾았어요
                        </p>
                      </div>
                      <button
                        onClick={() => setActiveTab('chat')}
                        className="text-blue-500 text-sm font-medium px-3 py-1 rounded-lg hover:bg-blue-50 transition-colors"
                      >
                        새 코스 요청
                      </button>
                    </div>
                  </div>

                  {/* 결과 리스트 */}
                  <RouteResults routes={currentRoutes} />
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                  <div className="text-gray-400 mb-4">
                    <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center text-3xl">
                      🗺️
                    </div>
                  </div>
                  <h3 className="text-xl font-medium text-gray-600 mb-2">아직 추천 코스가 없어요</h3>
                  <p className="text-base text-gray-500 mb-6">
                    채팅에서 AI와 대화하여 맞춤 여행 코스를 만들어보세요!
                  </p>
                  <button
                    onClick={() => setActiveTab('chat')}
                    className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors font-medium min-h-[48px]"
                  >
                    채팅 시작하기
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 하단 네비게이션 */}
      <div className="bg-white border-t border-gray-200 px-2 py-2 flex-shrink-0">
        <div className="flex justify-around max-w-sm mx-auto">
          
          {/* 채팅 탭 */}
          <button 
            onClick={() => setActiveTab('chat')}
            className={`flex flex-col items-center py-2 px-4 rounded-lg transition-colors min-w-0 flex-1 mx-1 ${
              activeTab === 'chat' 
                ? 'bg-blue-100 text-blue-600' 
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <span className="text-xl mb-1">💬</span>
            <span className="text-xs font-medium">채팅</span>
          </button>
          
          {/* 필터 탭 */}
          <button 
            onClick={() => setActiveTab('filters')}
            className={`flex flex-col items-center py-2 px-4 rounded-lg transition-colors min-w-0 flex-1 mx-1 relative ${
              activeTab === 'filters' 
                ? 'bg-indigo-100 text-indigo-600' 
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <span className="text-xl mb-1">⚙️</span>
            <span className="text-xs font-medium">필터</span>
            {activeFiltersCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-[20px] h-5 flex items-center justify-center px-1">
                {activeFiltersCount}
              </span>
            )}
          </button>
          
          {/* 결과 탭 */}
          <button 
            onClick={() => setActiveTab('results')}
            className={`flex flex-col items-center py-2 px-4 rounded-lg transition-colors min-w-0 flex-1 mx-1 relative ${
              activeTab === 'results' 
                ? 'bg-green-100 text-green-600' 
                : currentRoutes.length === 0 
                  ? 'text-gray-400' 
                  : 'text-gray-600 hover:bg-gray-50'
            }`}
            disabled={currentRoutes.length === 0}
          >
            <span className="text-xl mb-1">🗺️</span>
            <span className="text-xs font-medium">결과</span>
            {currentRoutes.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full min-w-[20px] h-5 flex items-center justify-center px-1">
                {currentRoutes.length}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}