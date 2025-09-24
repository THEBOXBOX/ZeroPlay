'use client';

import React from 'react';

interface CategoryFilterProps {
  activeCategory: string;
  setActiveCategory: (category: string) => void;
  setShowBottomSheet: (show: boolean) => void;
  setShowLocalDeals: (show: boolean) => void;
  onCategoryChange?: () => void;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({
  activeCategory,
  setActiveCategory,
  setShowBottomSheet,
  setShowLocalDeals,
  onCategoryChange
}) => {
  const categories = [
    { id: '전체', name: '전체', icon: '📍' },
    { id: '맛집', name: '맛집', icon: '🍽️' },
    { id: '카페', name: '카페', icon: '☕' },
    { id: '문화', name: '문화', icon: '🏛️' },
    { id: '체험', name: '체험', icon: '🎨' }
  ];

  return (
    <div className="bg-white px-4 py-3 border-b border-gray-100">
      <div className="flex space-x-2 overflow-x-auto">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => {
              setActiveCategory(category.id);
              setShowBottomSheet(true);
              setShowLocalDeals(false);
              // 🔥 상세보기 모드에서 리스트 모드로 전환
              if (onCategoryChange) {
                onCategoryChange();
              }
            }}
            className={`flex items-center space-x-2 px-4 py-2 rounded-full border transition-all whitespace-nowrap ${
              activeCategory === category.id
                ? 'bg-black text-white border-black'
                : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
            }`}
          >
            <span className="text-sm">{category.icon}</span>
            <span className="text-sm font-medium">{category.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategoryFilter;