import React from 'react';

interface CategoryTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const CategoryTabs: React.FC<CategoryTabsProps> = ({ activeTab, onTabChange }) => {
  const tabs = ['전체', '혜택', '무료'];

  return (
    <div className="flex w-full h-full">
      {tabs.map((tab, index) => (
        <button
          key={tab}
          onClick={() => onTabChange(tab)}
          className={`flex-1 h-full text-sm font-semibold transition-all duration-200 ${
            activeTab === tab
              ? 'bg-black text-white'
              : 'bg-white text-gray-600 hover:bg-gray-50'
          } ${index < tabs.length - 1 ? 'border-r border-gray-300' : ''}`}
          style={{ borderRadius: 0 }}
        >
          {tab}
        </button>
      ))}
    </div>
  );
};

export default CategoryTabs;