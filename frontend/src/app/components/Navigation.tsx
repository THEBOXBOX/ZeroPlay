// frontend/src/components/Navigation.tsx (새로 생성)
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SavedRoutesCounter } from './LikeButton';

export default function Navigation() {
  const pathname = usePathname();

  const navItems = [
    {
      href: '/',
      label: '홈',
      icon: '🏠',
      active: pathname === '/'
    },
    {
      href: '/AI-route',
      label: 'AI 추천',
      icon: '🤖',
      active: pathname === '/AI-route'
    },
    {
      href: '/benefits',
      label: '청년 혜택',
      icon: '🎁',
      active: pathname === '/benefits'
    },
    {
      href: '/map',
      label: '지도',
      icon: '🗺️',
      active: pathname === '/map'
    },
    {
      href: '/mypage',
      label: '마이페이지',
      icon: '👤',
      active: pathname === '/mypage',
      badge: true // 북마크 개수 표시
    }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="max-w-md mx-auto">
        <div className="flex justify-around items-center py-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center py-2 px-3 rounded-xl transition-all duration-200 relative ${
                item.active
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span className="text-xl mb-1">{item.icon}</span>
              <span className="text-xs font-medium">{item.label}</span>
              
              {/* 북마크 개수 뱃지 (마이페이지만) */}
              {item.badge && (
                <div className="absolute -top-1 -right-1">
                  <SavedRoutesCounter />
                </div>
              )}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}