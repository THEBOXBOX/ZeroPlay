// app/Map/components/ClientMapPage.tsx
'use client';

import React from 'react';
import MapView from './MapView';
import { Bell, Settings, Search, Home, Route, Gift, MapPin, User } from 'lucide-react';

export default function ClientMapPage({ appKey }: { appKey: string }) {
  const [activeTab, setActiveTab] = React.useState('지도');

  const Header = () => (
    <div className="bg-white px-4 py-2 flex items-center justify-between border-b border-gray-100 h-[60px]">
      <div className="flex items-center">
        <div className="flex items-center bg-gray-100 px-2 py-1 rounded-lg">
          <span className="text-black font-bold text-sm">my</span>
          <span className="text-orange-500 font-bold text-sm">SUBWAY</span>
          <span className="text-xs text-gray-500 ml-1">(임시로고)</span>
        </div>
      </div>
      <div className="flex items-center space-x-3">
        <Search className="w-5 h-5 text-gray-600" />
        <Bell className="w-5 h-5 text-gray-600" />
        <Settings className="w-5 h-5 text-gray-600" />
      </div>
    </div>
  );

  const BottomNav = () => (
    <div className="bg-white border-t border-gray-200 px-2 py-1 h-[60px]">
      <div className="flex justify-around items-center h-full">
        {[
          { id: '홈', icon: Home, label: '홈' },
          { id: 'AI 루트', icon: Route, label: 'AI 루트' },
          { id: '혜택 정보', icon: Gift, label: '혜택 정보' },
          { id: '지도', icon: MapPin, label: '지도' },
          { id: '내 정보', icon: User, label: '내 정보' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center py-1 px-2 ${
              activeTab === tab.id ? 'text-black' : 'text-gray-400'
            }`}
          >
            <tab.icon className="w-4 h-4 mb-0.5" />
            <span className="text-xs">{tab.label}</span>
            {activeTab === tab.id && (
              <div className="w-6 h-0.5 bg-black mt-0.5 rounded-full" />
            )}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-md mx-auto bg-gray-50 h-screen flex flex-col relative overflow-hidden border border-gray-300">
      {/* 상태바 (아이폰 기준) */}
      <div className="bg-white px-4 py-1 flex justify-between items-center text-sm font-medium flex-shrink-0 h-[25px]">
        <span>9:41</span>
        <div className="flex items-center space-x-1">
          <div className="flex space-x-1">
            <div className="w-1 h-1 bg-black rounded-full"></div>
            <div className="w-1 h-1 bg-black rounded-full"></div>
            <div className="w-1 h-1 bg-black rounded-full"></div>
            <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
          </div>
          <span className="ml-2">📶</span>
          <span>🔋</span>
        </div>
      </div>

      {/* 헤더 */}
      <div className="flex-shrink-0">
        <Header />
      </div>

      {/* 지도 */}
      <div className="flex-1 overflow-hidden">
        <MapView appKey={appKey} /> {/* ✅ 여기서 반드시 appKey 전달 */}
      </div>

      {/* 하단 네비 */}
      <div className="flex-shrink-0">
        <BottomNav />
      </div>
    </div>
  );
}