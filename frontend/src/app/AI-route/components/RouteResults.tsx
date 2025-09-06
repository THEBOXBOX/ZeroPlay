'use client';

import { useState } from 'react';

interface Place {
  name: string;
  type: 'attraction' | 'food' | 'culture' | 'nature' | 'shopping';
  duration: string;
  description?: string;
  cost?: number;
  rating?: number;
}

interface RouteData {
  id: number;
  title: string;
  duration: string;
  places: Place[];
  totalCost?: number;
  summary?: string;
}

interface RouteResultProps {
  routeData: RouteData | null;
  onSaveRoute?: (route: RouteData) => void;
  onShareRoute?: (route: RouteData) => void;
}

export default function RouteResult({ routeData, onSaveRoute, onShareRoute }: RouteResultProps) {
  const [savedRoutes, setSavedRoutes] = useState<number[]>([]);
  const [activeTab, setActiveTab] = useState<'timeline' | 'map' | 'budget'>('timeline');

  if (!routeData) {
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

  const getPlaceIcon = (type: Place['type']) => {
    switch (type) {
      case 'attraction': return '🏛️';
      case 'food': return '🍽️';
      case 'culture': return '🎭';
      case 'nature': return '🌳';
      case 'shopping': return '🛍️';
      default: return '📍';
    }
  };

  const getPlaceTypeText = (type: Place['type']) => {
    switch (type) {
      case 'attraction': return '관광명소';
      case 'food': return '맛집';
      case 'culture': return '문화시설';
      case 'nature': return '자연명소';
      case 'shopping': return '쇼핑';
      default: return '기타';
    }
  };

  const handleSave = () => {
    setSavedRoutes(prev => [...prev, routeData.id]);
    onSaveRoute?.(routeData);
  };

  const isSaved = savedRoutes.includes(routeData.id);

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* 헤더 */}
      <div className="bg-gradient-to-r from-green-500 to-blue-600 text-white p-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">{routeData.title}</h2>
            <div className="flex items-center gap-4 text-sm">
              <span className="bg-white/20 px-3 py-1 rounded-full">
                ⏱️ {routeData.duration}
              </span>
              <span className="bg-white/20 px-3 py-1 rounded-full">
                📍 {routeData.places.length}개 장소
              </span>
              {routeData.totalCost && (
                <span className="bg-white/20 px-3 py-1 rounded-full">
                  💰 {routeData.totalCost.toLocaleString()}원
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className={`px-4 py-2 rounded-lg transition-colors ${
                isSaved 
                  ? 'bg-white/20 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {isSaved ? '✓ 저장됨' : '💾 저장'}
            </button>
            <button
              onClick={() => onShareRoute?.(routeData)}
              className="bg-white text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              📤 공유
            </button>
          </div>
        </div>
      </div>

      {/* 탭 네비게이션 */}
      <div className="border-b">
        <div className="flex">
          {[
            { key: 'timeline', label: '일정', icon: '📅' },
            { key: 'map', label: '지도', icon: '🗺️' },
            { key: 'budget', label: '예산', icon: '💰' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 탭 콘텐츠 */}
      <div className="p-6">
        {activeTab === 'timeline' && (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg mb-4">여행 일정</h3>
            {routeData.places.map((place, index) => (
              <div key={index} className="flex items-start gap-4 p-4 border rounded-lg hover:shadow-md transition-shadow">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-lg">
                    {getPlaceIcon(place.type)}
                  </div>
                  {index < routeData.places.length - 1 && (
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
                    {place.rating && (
                      <span className="text-xs text-yellow-600">
                        ⭐ {place.rating}
                      </span>
                    )}
                  </div>
                  {place.description && (
                    <p className="text-sm text-gray-600">{place.description}</p>
                  )}
                  {place.cost && (
                    <p className="text-sm text-blue-600 mt-1">
                      예상 비용: {place.cost.toLocaleString()}원
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'map' && (
          <div className="text-center py-12">
            <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center mb-4">
              <div className="text-gray-500">
                <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 01.553-.894L9 2l6 3 6-3v15l-6 3-6-3z" />
                </svg>
                <p className="text-lg font-medium">지도 기능</p>
                <p className="text-sm">곧 업데이트 예정입니다</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              {routeData.places.map((place, index) => (
                <div key={index} className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs">
                      {index + 1}
                    </span>
                    <span className="font-medium">{place.name}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'budget' && (
          <div>
            <h3 className="font-semibold text-lg mb-4">예산 분석</h3>
            <div className="space-y-4">
              {routeData.places.map((place, index) => (
                place.cost && (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="flex items-center gap-2">
                      <span>{getPlaceIcon(place.type)}</span>
                      <span className="font-medium">{place.name}</span>
                    </span>
                    <span className="text-blue-600 font-medium">
                      {place.cost.toLocaleString()}원
                    </span>
                  </div>
                )
              ))}
              
              {routeData.totalCost && (
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between text-lg font-bold">
                    <span>총 예상 비용</span>
                    <span className="text-blue-600">{routeData.totalCost.toLocaleString()}원</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    * 개인별 예상 비용이며, 실제 비용과 차이가 있을 수 있습니다.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 액션 버튼 */}
      <div className="border-t bg-gray-50 p-4">
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
  );
}