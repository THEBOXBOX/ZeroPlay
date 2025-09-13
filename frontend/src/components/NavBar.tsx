import React from 'react';

interface NavBarProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

const NavBar: React.FC<NavBarProps> = ({ activeTab = '혜택 정보', onTabChange }) => {
  const navItems = [
    { icon: '🏠', label: '홈', key: '홈' },
    { icon: '🤖', label: 'AI 루트', key: 'AI 루트' },
    { icon: '🎯', label: '혜택 정보', key: '혜택 정보' },
    { icon: '🗺️', label: '지도', key: '지도' },
    { icon: '👤', label: '내 정보', key: '내 정보' }
  ];

  return (
    <div className="bg-white border-t border-gray-200 h-[80px] flex items-center justify-center w-full">
      <div className="flex justify-around w-full px-4">
        {navItems.map((item, index) => (
          <button
            key={index}
            onClick={() => onTabChange?.(item.key)}
            className={`flex flex-col items-center space-y-1 py-2 ${
              activeTab === item.key ? 'text-black' : 'text-gray-400'
            }`}
          >
            <span className="text-lg">{item.icon}</span>
            <span className="text-xs font-medium">{item.label}</span>
          </button>
        ))}
      </div>
      {/* 홈 인디케이터 */}
      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-black rounded-full"></div>
    </div>
  );
};

export default NavBar;