// frontend/src/app/AI-route/components/BottomNavigation.tsx (높이 조정 버전)
'use client';

type MobileTab = 'chat' | 'filters' | 'results';

interface BottomNavigationProps {
  activeTab: MobileTab;
  onTabChange: (tab: MobileTab) => void;
  activeFiltersCount: number;
  resultsCount: number;
}

export default function BottomNavigation({ 
  activeTab, 
  onTabChange, 
  activeFiltersCount, 
  resultsCount 
}: BottomNavigationProps) {
  const tabs = [
    {
      id: 'filters' as MobileTab,
      icon: '⚙️',
      label: '여행 조건',
      activeColor: 'bg-indigo-50 text-indigo-600',
      disabled: false,
      badge: activeFiltersCount
    },
    {
      id: 'chat' as MobileTab,
      icon: '💬',
      label: 'AI 추천',
      activeColor: 'bg-blue-50 text-blue-600',
      disabled: false
    },
    {
      id: 'results' as MobileTab,
      icon: '🗺️',
      label: '추천 결과',
      activeColor: 'bg-green-50 text-green-600',
      disabled: resultsCount === 0,
      badge: resultsCount
    }
  ];

  return (
    // 🔥 높이를 60px로 통일하고 패딩 조정
    <div className="bg-white border-t border-gray-200 px-2 py-1 flex-shrink-0 h-[60px]">
      <div className="flex justify-around h-full items-center">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            disabled={tab.disabled}
            className={`flex flex-col items-center py-1 px-2 rounded-xl transition-all duration-200 min-w-0 flex-1 mx-1 relative ${
              activeTab === tab.id
                ? tab.activeColor + ' shadow-sm'
                : tab.disabled
                ? 'text-gray-300'
                : 'text-gray-500 hover:bg-gray-50 active:bg-gray-100'
            }`}
          >
            {/* 🔥 아이콘 크기 조정 */}
            <span className="text-base mb-0.5">{tab.icon}</span>
            {/* 🔥 텍스트 크기 조정 */}
            <span className="text-xs font-medium leading-tight text-center">{tab.label}</span>
            
            {/* 배지 - 위치 조정 */}
            {tab.badge !== undefined && tab.badge > 0 && (
              <span className={`absolute -top-0.5 -right-0.5 text-white text-xs rounded-full min-w-[16px] h-[16px] flex items-center justify-center px-1 text-[10px] font-bold shadow-sm ${
                tab.id === 'filters' ? 'bg-red-500' : 'bg-green-500'
              }`}>
                {tab.badge > 99 ? '99+' : tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}