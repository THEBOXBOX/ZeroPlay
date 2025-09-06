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
  const [activeTab, setActiveTab] = useState<'timeline' | 'map' | 'budget'>('timeline');

  if (!routes || routes.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="text-gray-400 mb-4">
          <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 01.553-.894L9 2l6 3 6-3v15l-6 3-6-3z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-600 mb-2">여행 코스가 생성되지 않았어요</h3>
        <p className="text-sm text-gray-500">AI 어시스턴트와 대화하여 맞춤 여행 코스를 만들어보세요!</p>
      </div>
    );
  }

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
      case 'easy': return 'bg-green-100 text-green-800';
      case 'moderate': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
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

  return (
    <div className="space-y-6">
      {routes.map((route) => (
        <div key={route.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* 헤더 */}
          <div className="bg-gradient-to-r from-green-500 to-blue-600 text-white p-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-2">{route.title}</h2>
                <div className="flex items-center gap-4 text-sm">
                  <span className="bg-white/20 px-3 py-1 rounded-full">
                    ⏱️ {route.duration}
                  </span>
                  <span className="bg-white/20 px-3 py-1 rounded-full">
                    📍 {route.places.length}개 장소
                  </span>
                  <span className="bg-white/20 px-3 py-1 rounded-full">
                    💰 {route.totalBudget.toLocaleString()}원
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(route.difficulty)}`}>
                    {getDifficultyText(route.difficulty)}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleSave(route)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    savedRoutes.includes(route.id)
                      ? 'bg-white/20 text-white' 
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {savedRoutes.includes(route.id) ? '✓ 저장됨' : '💾 저장'}
                </button>
                <button
                  onClick={() => onShareRoute?.(route)}
                  className="bg-white text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  📤 공유
                </button>
              </div>
            </div>
          </div>

          {/* 하이라이트 */}
          <div className="p-4 bg-blue-50">
            <div className="flex flex-wrap gap-2">
              {route.highlights.map((highlight, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-blue-500 text-white rounded-full text-sm font-medium"
                >
                  #{highlight}
                </span>
              ))}
            </div>
          </div>

          {/* 일정 */}
          <div className="p-6">
            <h3 className="font-semibold text-lg mb-4">여행 일정</h3>
            <div className="space-y-4">
              {route.places.map((place, index) => (
                <div key={place.id} className="flex items-start gap-4 p-4 border rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-lg">
                      {getPlaceIcon(place.type)}
                    </div>
                    {index < route.places.length - 1 && (
                      <div className="w-px h-8 bg-gray-300 mx-auto mt-2"></div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium text-gray-800">{place.name}</h4>
                      <span className="text-sm text-gray-500">{place.duration}</span>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                        {getPlaceTypeText(place.type)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{place.description}</p>
                    <p className="text-sm text-blue-600 mt-1">
                      예상 비용: {place.cost === 0 ? '무료' : `${place.cost.toLocaleString()}원`}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* 액션 버튼 */}
            <div className="border-t bg-gray-50 p-4 mt-6 -mx-6 -mb-6">
              <div className="flex gap-3">
                <button className="flex-1 bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 transition-colors font-medium">
                  이 코스로 여행하기
                </button>
                <button className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  수정하기
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}