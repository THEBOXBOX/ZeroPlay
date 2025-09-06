'use client';

import { useState } from 'react';
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

export default function AIRoutePage() {
  const [filters, setFilters] = useState<FilterState>({
    budget: '',
    duration: '',
    companions: '',
    interests: [],
    region: ''
  });

  const [currentRoutes, setCurrentRoutes] = useState<RouteRecommendation[]>([]);

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
  };

  const handleRouteGenerated = (routeData: any) => {
    // ChatBot에서 생성된 루트 데이터를 처리
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">🤖 AI 여행 코스 추천</h1>
              <p className="text-sm text-gray-600 mt-1">
                AI가 당신만을 위한 맞춤 여행 코스를 제안해드립니다
              </p>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              <span>AI 연결됨</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-140px)]">
          
          {/* Left Panel - Filters */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 h-full">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <span className="w-5 h-5 bg-indigo-100 rounded-full flex items-center justify-center mr-2">
                  ⚙️
                </span>
                여행 조건 설정
              </h2>
              <FilterButtons 
                filters={filters} 
                onFilterChange={handleFilterChange}
              />
            </div>
          </div>

          {/* Right Panel - Chat & Results */}
          <div className="lg:col-span-2 flex flex-col space-y-4">
            
            {/* Results Section */}
            {currentRoutes.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6 flex-1 overflow-auto">
                <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <span className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mr-2">
                    🗺️
                  </span>
                  추천 코스
                </h2>
                <RouteResults routes={currentRoutes} />
              </div>
            )}

            {/* Chat Section */}
            <div className="bg-white rounded-xl shadow-lg flex flex-col h-96">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                  <span className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center mr-2">
                    💬
                  </span>
                  AI 여행 어시스턴트
                </h2>
              </div>
              
              <ChatBot onRouteGenerated={handleRouteGenerated} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}