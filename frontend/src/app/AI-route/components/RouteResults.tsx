'use client';

import { useState } from 'react';

interface Place {
  id: string;
  name: string;
  type: string;
  duration: string;
  cost: number;
  description: string;
}

interface RouteRecommendation {
  id: string;
  title: string;
  duration: string;
  totalBudget: number;
  places: Place[];
  highlights: string[];
  difficulty: 'easy' | 'moderate' | 'hard';
}

interface RouteResultsProps {
  routes: RouteRecommendation[];
  onSaveRoute?: (route: RouteRecommendation) => void;
  onShareRoute?: (route: RouteRecommendation) => void;
}

export default function RouteResults({ routes, onSaveRoute, onShareRoute }: RouteResultsProps) {
  const [savedRoutes, setSavedRoutes] = useState<string[]>([]);
  const [expandedRoutes, setExpandedRoutes] = useState<string[]>([]);

  // 첫 번째 루트는 기본적으로 펼쳐져 있음
  useState(() => {
    if (routes.length > 0 && expandedRoutes.length === 0) {
      setExpandedRoutes([routes[0].id]);
    }
  });

  const toggleRouteExpansion = (routeId: string) => {
    setExpandedRoutes(prev => 
      prev.includes(routeId) 
        ? prev.filter(id => id !== routeId)
        : [...prev, routeId]
    );
  };

  const getPlaceIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'attraction': return '🏛️';
      case 'food': 
      case 'restaurant': return '🍽️';
      case 'culture': return '🎭';
      case 'nature': 
      case 'park': return '🌳';
      case 'shopping': return '🛍️';
      case 'cafe': return '☕';
      default: return '📍';
    }
  };

  const getPlaceTypeText = (type: string) => {
    switch (type.toLowerCase()) {
      case 'attraction': return '관광명소';
      case 'food':
      case 'restaurant': return '맛집';
      case 'culture': return '문화시설';
      case 'nature':
      case 'park': return '자연명소';
      case 'shopping': return '쇼핑';
      case 'cafe': return '카페';
      default: return '기타';
    }
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

  const handleSave = (route: RouteRecommendation) => {
    setSavedRoutes(prev => [...prev, route.id]);
    onSaveRoute?.(route);
  };

  const handleUnsave = (route: RouteRecommendation) => {
    setSavedRoutes(prev => prev.filter(id => id !== route.id));
  };

  return (
    <div className="space-y-4">
      {routes.map((route, routeIndex) => {
        const isExpanded = expandedRoutes.includes(route.id);
        const isSaved = savedRoutes.includes(route.id);
        
        return (
          <div key={route.id} className="bg-white rounded-2xl shadow-sm border overflow-hidden">
            
            {/* 루트 헤더 - 더 컴팩트하게 */}
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 text-white p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs font-bold">
                      #{routeIndex + 1}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${getDifficultyColor(route.difficulty)}`}>
                      {getDifficultyText(route.difficulty)}
                    </span>
                  </div>
                  <h2 className="text-lg font-bold mb-1 leading-tight">{route.title}</h2>
                </div>
                
                {/* 액션 버튼 - 더 작게 */}
                <div className="flex gap-1 flex-shrink-0">
                  <button
                    onClick={() => isSaved ? handleUnsave(route) : handleSave(route)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all text-sm ${
                      isSaved 
                        ? 'bg-red-500 text-white' 
                        : 'bg-white/20 text-white hover:bg-white/30'
                    }`}
                  >
                    {isSaved ? '❤️' : '🤍'}
                  </button>
                  <button
                    onClick={() => onShareRoute?.(route)}
                    className="w-8 h-8 rounded-full bg-white/20 text-white hover:bg-white/30 transition-all flex items-center justify-center text-sm"
                  >
                    📤
                  </button>
                </div>
              </div>
              
              {/* 여행 정보 - 더 컴팩트하게 */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-white/10 rounded-lg p-2">
                  <div className="text-base">⏱️</div>
                  <div className="text-xs font-bold">{route.duration}</div>
                </div>
                <div className="bg-white/10 rounded-lg p-2">
                  <div className="text-base">📍</div>
                  <div className="text-xs font-bold">{route.places.length}곳</div>
                </div>
                <div className="bg-white/10 rounded-lg p-2">
                  <div className="text-base">💰</div>
                  <div className="text-xs font-bold">{Math.floor(route.totalBudget/1000)}만원</div>
                </div>
              </div>
            </div>

            {/* 하이라이트 태그 - 더 컴팩트하게 */}
            <div className="bg-blue-50 p-3">
              <div className="flex flex-wrap gap-1">
                {route.highlights.map((highlight, index) => (
                  <span
                    key={index}
                    className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-bold"
                  >
                    #{highlight}
                  </span>
                ))}
              </div>
            </div>

            {/* 펼치기/접기 버튼 */}
            <div className="border-b">
              <button
                onClick={() => toggleRouteExpansion(route.id)}
                className="w-full p-3 text-center hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
              >
                <span className="font-bold text-gray-700 text-sm">
                  {isExpanded ? '간단히 보기' : '자세히 보기'}
                </span>
                <span className={`transform transition-transform text-gray-400 text-sm ${isExpanded ? 'rotate-180' : ''}`}>
                  ▼
                </span>
              </button>
            </div>

            {/* 여행 일정 */}
            <div className="p-4">
              {isExpanded ? (
                // 상세 보기
                <div className="space-y-3">
                  <h3 className="text-base font-bold text-gray-800 mb-3 flex items-center">
                    🗓️ 여행 일정
                  </h3>
                  {route.places.map((place, index) => (
                    <div key={place.id} className="flex gap-3 p-3 bg-gray-50 rounded-xl">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-base">{getPlaceIcon(place.type)}</span>
                        </div>
                        {index < route.places.length - 1 && (
                          <div className="w-px h-4 bg-gray-300 mx-auto mt-2"></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-bold text-gray-800 text-sm">{place.name}</h4>
                          <span className="text-xs text-gray-500">{place.duration}</span>
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="bg-white px-2 py-0.5 rounded-full text-xs text-gray-600 border font-medium">
                            {getPlaceTypeText(place.type)}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 mb-2 leading-relaxed">{place.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-blue-600">
                            {place.cost === 0 ? '무료' : `${place.cost.toLocaleString()}원`}
                          </span>
                          <button className="text-blue-500 text-xs font-bold px-2 py-1 rounded-lg hover:bg-blue-50 transition-colors">
                            상세보기
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                // 간단 보기
                <div className="space-y-2">
                  <h3 className="text-sm font-bold text-gray-800 mb-2 flex items-center">
                    🗓️ 주요 일정
                  </h3>
                  {route.places.slice(0, 3).map((place, index) => (
                    <div key={place.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded-xl">
                      <span className="text-lg">{getPlaceIcon(place.type)}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-gray-800 truncate text-sm">{place.name}</h4>
                          <div className="flex items-center gap-1 text-xs text-gray-500 flex-shrink-0">
                            <span>{place.duration}</span>
                            <span>•</span>
                            <span>{place.cost === 0 ? '무료' : `${Math.floor(place.cost/1000)}k`}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {route.places.length > 3 && (
                    <div className="text-center py-1">
                      <span className="text-xs text-gray-500">외 {route.places.length - 3}곳 더</span>
                    </div>
                  )}
                </div>
              )}

              {/* 액션 버튼 영역 - 더 컴팩트하게 */}
              <div className="mt-4 space-y-2">
                <button className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 px-4 rounded-xl hover:shadow-lg transition-all font-bold text-sm shadow-md">
                  이 코스로 여행하기 ✈️
                </button>
                <div className="grid grid-cols-2 gap-2">
                  <button className="py-2 px-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors font-bold text-sm">
                    📝 수정
                  </button>
                  <button className="py-2 px-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors font-bold text-sm">
                    📋 일정표
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}