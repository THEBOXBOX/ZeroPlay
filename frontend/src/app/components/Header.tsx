'use client';

import React from 'react';
import { Search, Bell, Settings } from 'lucide-react';

interface HeaderProps {
  title?: string;
  logoSrc?: string; // 이미지 로고용
  showSearch?: boolean;
  showNotification?: boolean;
  showSettings?: boolean; // Settings 버튼 추가
  onSearchClick?: () => void;
  onNotificationClick?: () => void;
  onSettingsClick?: () => void;
  className?: string;
}

const Header: React.FC<HeaderProps> = ({
  title = "mySUBWAY",
  logoSrc,
  showSearch = true,
  showNotification = true,
  showSettings = true,
  onSearchClick,
  onNotificationClick,
  onSettingsClick,
  className = ""
}) => {
  return (
    <div 
      className={`bg-white px-4 py-2 flex items-center justify-between border-b border-gray-100 ${className}`}
    >
      {/* 로고 영역 */}
      <div className="flex items-center">
        {logoSrc ? (
          <img 
            src={logoSrc} 
            alt={title}
            className="h-8 w-auto" // 로고 이미지 크기
          />
        ) : (
          // 임시 텍스트 로고 (mySUBWAY 스타일)
          <div className="flex items-center bg-gray-100 px-2 py-1 rounded-lg">
            <span className="text-black font-bold text-sm">my</span>
            <span className="text-orange-500 font-bold text-sm">SUBWAY</span>
            <span className="text-xs text-gray-500 ml-1">(임시로고)</span>
          </div>
        )}
      </div>
      
      {/* 액션 버튼들 */}
      <div className="flex items-center space-x-3">
        {showSearch && (
          <button 
            onClick={onSearchClick}
            className="p-1 text-gray-600 hover:text-gray-900 transition-colors"
            aria-label="검색"
          >
            <Search className="w-5 h-5" />
          </button>
        )}
        
        {showNotification && (
          <button 
            onClick={onNotificationClick}
            className="p-1 text-gray-600 hover:text-gray-900 transition-colors"
            aria-label="알림"
          >
            <Bell className="w-5 h-5" />
          </button>
        )}

        {showSettings && (
          <button 
            onClick={onSettingsClick}
            className="p-1 text-gray-600 hover:text-gray-900 transition-colors"
            aria-label="설정"
          >
            <Settings className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
};

export default Header;