// app/Map/components/ClientMapPage.tsx
'use client';

import React from 'react';
import MapView from './MapView';
import Header from '../../components/Header'; // 공통 헤더 import
import BottomNavBar from '../../components/NavBar'; // 공통 네비바 import
import { Bell, Settings, Search, Home, Route, Gift, MapPin, User } from 'lucide-react';

export default function ClientMapPage({ appKey }: { appKey: string }) {
  const [activeTab, setActiveTab] = React.useState('지도');

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

      {/* 헤더 */}
      <div className="flex-shrink-0">
        <Header 
          title="mySUBWAY"
          onSearchClick={() => console.log('검색 클릭')}
          onNotificationClick={() => console.log('알림 클릭')}
          onSettingsClick={() => console.log('설정 클릭')}
          className="h-[60px] border-b border-gray-100"
        />
      </div>

      {/* 지도 */}
      <div className="flex-1 overflow-hidden">
        <MapView/> {/* ✅ 여기서 반드시 appKey 전달 */}
      </div>

      {/* 하단 네비 */}
      <div className="flex-shrink-0">
        <BottomNavBar
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      </div>
    </div>
  );
}