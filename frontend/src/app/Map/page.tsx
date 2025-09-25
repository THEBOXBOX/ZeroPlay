// src/app/Map/page.tsx
'use client';

import React from 'react';
import MapView from './components/view/MapView';
import Header from '../components/Header'; // 공통 헤더 import
import BottomNavBar from '../components/NavBar'; // 공통 네비바 import

const MapPage = () => {
  const [activeTab, setActiveTab] = React.useState('지도');

  return (
    <div className="min-h-screen bg-gray-20 flex items-center justify-center">
      <div className="w-[393px] h-screen bg-white flex flex-col relative overflow-hidden shadow-lg">
        {/* 공통 헤더 컴포넌트 사용 */}
        <div className="flex-shrink-0">
          <Header 
            title="mySUBWAY"
            onSearchClick={() => console.log('검색 클릭')}
            onNotificationClick={() => console.log('알림 클릭')}
            onSettingsClick={() => console.log('설정 클릭')}
            className="h-[70px] border-b border-gray-100"
          />
        </div>
        
        {/* 지도 메인 컴포넌트 - 남은 공간 모두 차지 */}
        <div className="flex-1 overflow-hidden">
          <MapView />
        </div>
        
        {/* 공통 하단 네비게이션 */}
        <div className="flex-shrink-0">
          <BottomNavBar
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        </div>
      </div>
    </div>
  );
};

export default MapPage;