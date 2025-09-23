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
  onBookmarkRoute?: (route: RouteRecommendation) => void; // ✅ 북마크 기능 추가
}

export default function RouteResults({ 
  routes, 
  onSaveRoute, 
  onShareRoute,
  onBookmarkRoute 
}: RouteResultsProps) {
  const [savedRoutes, setSavedRoutes] = useState<string[]>([]);
  const [bookmarkedRoutes, setBookmarkedRoutes] = useState<string[]>([]); // ✅ 북마크 상태
  const [expandedRoutes, setExpandedRoutes] = useState<string[]>([]); // ✅ 기본적으로 모든 카드 닫힘

  const toggleRouteExpansion = (routeId: string) => {
    setExpandedRoutes(prev => 
      prev.includes(routeId) 
        ? prev.filter(id => id !== routeId)
        : [...prev, routeId]
    );
  };

  // ✅ 북마크 토글 함수
  const toggleBookmark = (route: RouteRecommendation) => {
    const isBookmarked = bookmarkedRoutes.includes(route.id);
    
    if (isBookmarked) {
      setBookmarkedRoutes(prev => prev.filter(id => id !== route.id));
    } else {
      setBookmarkedRoutes(prev => [...prev, route.id]);
      onBookmarkRoute?.(route);
    }
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

  // ✅ 실제 예산 계산 함수 (정확한 계산)
  const calculateTotalBudget = (places: Place[]) => {
    return places.reduce((total, place) => total + place.cost, 0);
  };

  return (
    <div className="space-y-4">
      {routes.map((route, routeIndex) => {
        const isExpanded = expandedRoutes.includes(route.id);
        const isSaved = savedRoutes.includes(route.id);
        const isBookmarked = bookmarkedRoutes.includes(route.id);
        const actualTotalBudget = calculateTotalBudget(route.places); // ✅ 실제 예산 계산

        return (
          <div key={route.id} className="bg-white rounded-2xl shadow-md border overflow-hidden hover:shadow-lg transition-shadow">
            
            {/* ✅ 개선된 카드 헤더 - 닫힌 상태에서도 충분한 정보 제공 */}
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 text-white p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs font-bold">
                      코스 #{routeIndex + 1}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold bg-white/20 text-white`}>
                      {getDifficultyText(route.difficulty)}
                    </span>
                  </div>
                  <h2 className="text-lg font-bold mb-1 leading-tight">{route.title}</h2>
                  
                  {/* ✅ 닫힌 상태에서도 보이는 요약 정보 */}
                  <div className="flex items-center gap-3 text-sm opacity-90">
                    <span>⏱️ {route.duration}</span>
                    <span>📍 {route.places.length}곳</span>
                    <span>💰 {Math.floor(actualTotalBudget/10000)}만원</span>
                  </div>
                </div>
                
                {/* ✅ 액션 버튼들 */}
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => toggleBookmark(route)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all text-sm ${
                      isBookmarked 
                        ? 'bg-red-500 text-white shadow-md' 
                        : 'bg-white/20 text-white hover:bg-white/30'
                    }`}
                  >
                    {isBookmarked ? '❤️' : '🤍'}
                  </button>
                  <button
                    onClick={() => onShareRoute?.(route)}
                    className="w-8 h-8 rounded-full bg-white/20 text-white hover:bg-white/30 transition-all flex items-center justify-center text-sm"
                  >
                    📤
                  </button>
                </div>
              </div>
            </div>

            {/* ✅ 하이라이트 태그 - 항상 표시 */}
            <div className="bg-blue-50 p-3">
              <div className="flex flex-wrap gap-1">
                {route.highlights.slice(0, 5).map((highlight, index) => (
                  <span
                    key={index}
                    className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-bold"
                  >
                    #{highlight}
                  </span>
                ))}
                {route.highlights.length > 5 && (
                  <span className="text-blue-500 text-xs px-2 py-1">
                    +{route.highlights.length - 5}개 더
                  </span>
                )}
              </div>
            </div>

            {/* ✅ 간단한 장소 미리보기 - 항상 표시 */}
            <div className="p-4 bg-gray-50">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-gray-800 flex items-center">
                  🗓️ 주요 일정
                </h3>
                <span className="text-xs text-gray-500">
                  총 {route.places.length}곳
                </span>
              </div>
              
              <div className="grid grid-cols-1 gap-2 mb-3">
                {route.places.slice(0, 3).map((place, index) => (
                  <div key={place.id} className="flex items-center gap-3 bg-white p-2 rounded-lg border">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-sm">{getPlaceIcon(place.type)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-gray-800 truncate text-sm">{place.name}</h4>
                        <div className="flex items-center gap-1 text-xs text-gray-500 flex-shrink-0 ml-2">
                          <span>{place.duration}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-gray-500 bg-gray-100 px-1 py-0.5 rounded">
                          {getPlaceTypeText(place.type)}
                        </span>
                        <span className="text-xs font-medium text-blue-600">
                          {place.cost === 0 ? '무료' : `${place.cost.toLocaleString()}원`}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {route.places.length > 3 && (
                <div className="text-center">
                  <span className="text-xs text-gray-500 bg-white px-3 py-1 rounded-full border">
                    외 {route.places.length - 3}곳 더 포함
                  </span>
                </div>
              )}
            </div>

            {/* ✅ 펼치기/접기 버튼 */}
            <div className="border-t bg-white">
              <button
                onClick={() => toggleRouteExpansion(route.id)}
                className="w-full p-3 text-center hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
              >
                <span className="font-medium text-gray-700 text-sm">
                  {isExpanded ? '간단히 보기' : '상세히 보기'}
                </span>
                <span className={`transform transition-transform text-gray-400 text-sm ${isExpanded ? 'rotate-180' : ''}`}>
                  ▼
                </span>
              </button>
            </div>

            {/* ✅ 상세 정보 - 펼쳤을 때만 표시 */}
            {isExpanded && (
              <div className="border-t bg-white">
                <div className="p-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-base font-bold text-gray-800 flex items-center">
                        📋 상세 일정
                      </h3>
                      <div className="text-right text-sm">
                        <div className="font-bold text-blue-600">
                          총 예산: {actualTotalBudget.toLocaleString()}원
                        </div>
                        <div className="text-xs text-gray-500">
                          1인 기준 • 교통비 별도
                        </div>
                      </div>
                    </div>
                    
                    {route.places.map((place, index) => (
                      <div key={place.id} className="flex gap-3 p-3 bg-gray-50 rounded-xl border">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center relative">
                            <span className="text-base">{getPlaceIcon(place.type)}</span>
                            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                              {index + 1}
                            </div>
                          </div>
                          {index < route.places.length - 1 && (
                            <div className="w-px h-4 bg-gray-300 mx-auto mt-2"></div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <h4 className="font-bold text-gray-800 text-sm mb-1">{place.name}</h4>
                              <div className="flex items-center gap-2 mb-2">
                                <span className="bg-white px-2 py-0.5 rounded text-xs text-gray-600 border font-medium">
                                  {getPlaceTypeText(place.type)}
                                </span>
                                <span className="text-xs text-gray-500">
                                  소요시간: {place.duration}
                                </span>
                              </div>
                            </div>
                            <div className="text-right ml-2">
                              <div className="text-sm font-bold text-blue-600">
                                {place.cost === 0 ? '무료' : `${place.cost.toLocaleString()}원`}
                              </div>
                            </div>
                          </div>
                          <p className="text-xs text-gray-600 mb-3 leading-relaxed">
                            {place.description}
                          </p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <button className="text-blue-500 text-xs font-medium px-2 py-1 rounded hover:bg-blue-50 transition-colors border border-blue-200">
                                📍 위치보기
                              </button>
                              <button className="text-gray-500 text-xs font-medium px-2 py-1 rounded hover:bg-gray-50 transition-colors border border-gray-200">
                                ℹ️ 상세정보
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ✅ 하단 액션 영역 - 수정/일정표 버튼 제거, 핵심 기능만 유지 */}
            <div className="bg-white border-t p-4">
              <div className="space-y-3">
                {/* 메인 액션 버튼 */}
                <button 
                  className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 px-4 rounded-xl hover:shadow-lg transition-all font-bold text-sm shadow-md"
                  onClick={() => {
                    // TODO: 실제 예약/선택 로직 구현
                    alert('이 코스를 선택하셨습니다!');
                  }}
                >
                  이 코스 선택하기 ✈️
                </button>
                
                {/* 서브 액션 버튼들 */}
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => toggleBookmark(route)}
                    className={`py-2 px-3 rounded-xl transition-colors font-medium text-sm border-2 ${
                      isBookmarked
                        ? 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100'
                        : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {isBookmarked ? '❤️ 저장됨' : '🤍 저장하기'}
                  </button>
                  <button 
                    onClick={() => onShareRoute?.(route)}
                    className="py-2 px-3 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-colors font-medium text-sm text-gray-600"
                  >
                    📤 공유하기
                  </button>
                </div>
                
                {/* 북마크 성공 메시지 */}
                {isBookmarked && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-2 text-center">
                    <span className="text-green-700 text-xs font-medium">
                      ✅ 마이페이지에서 확인할 수 있어요!
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}