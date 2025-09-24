'use client';

import React from 'react';
import { Home, Route, Gift, MapPin, User } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
}

interface BottomNavBarProps {
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
  customItems?: NavItem[];
}

const defaultNavItems: NavItem[] = [
  {
    id: '홈',
    label: '홈',
    icon: Home,
    href: '/'
  },
  {
    id: 'AI 루트',
    label: 'AI 루트',
    icon: Route,
    href: '/AI-route'
  },
  {
    id: '혜택 정보',
    label: '혜택 정보',
    icon: Gift,
    href: '/benefits'
  },
  {
    id: '지도',
    label: '지도',
    icon: MapPin,
    href: '/Map'
  },
  {
    id: '내 정보',
    label: '내 정보',
    icon: User,
    href: '/MyPage'
  }
];

const BottomNavBar: React.FC<BottomNavBarProps> = ({
  activeTab = '지도',
  onTabChange,
  customItems
}) => {
  const router = useRouter();
  const navItems = customItems || defaultNavItems;

  const handleTabClick = (tabId: string, href: string) => {
    // 기존 onTabChange 호출 (로컬 상태 업데이트용)
    if (onTabChange) {
      onTabChange(tabId);
    }
    
    // 페이지 이동
    router.push(href);
  };

  return (
    <div className="bg-white border-t border-gray-200 px-2 py-1 h-[70px]">
      <div className="flex justify-around items-center h-full">
        {navItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => handleTabClick(item.id, item.href)}
              className={`flex flex-col items-center py-1 px-2 transition-colors ${
                isActive 
                  ? 'text-black' 
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <IconComponent className="w-4 h-4 mb-0.5" />
              <span className="text-xs">{item.label}</span>
              {isActive && (
                <div className="w-6 h-0.5 bg-black mt-0.5 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNavBar;