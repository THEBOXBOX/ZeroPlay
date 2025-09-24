'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

// 정렬 옵션 타입 - export 추가
export type SortOption = 'recommended' | 'distance' | 'rating';

// 정렬 드롭다운 컴포넌트
interface SortDropdownProps {
  currentSort: SortOption;
  onSortChange: (sort: SortOption) => void;
  userLocation?: { lat: number; lng: number } | null;
}

const SortDropdown: React.FC<SortDropdownProps> = ({ 
  currentSort, 
  onSortChange,
  userLocation 
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const sortOptions = [
    { value: 'recommended' as SortOption, label: '추천순'},
    { 
      value: 'distance' as SortOption, 
      label: '거리순', 
      disabled: !userLocation 
    },
    { value: 'rating' as SortOption, label: '평점순'}
  ];

  const currentOption = sortOptions.find(option => option.value === currentSort);

  return (
    <div className="relative mt-2">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
      >
        <span className="text-sm"></span>
        <span className="text-sm font-medium text-gray-700">
          {currentOption?.label}
        </span>
        <ChevronDown 
          className={`w-4 h-4 text-gray-500 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`} 
        />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-30"
            onClick={() => setIsOpen(false)}
          />
          
          <div className="absolute top-full right-0 mt-2 w-32 bg-white border border-gray-200 rounded-lg shadow-lg z-40">
            {sortOptions.map((option, index) => (
              <button
                key={option.value}
                onClick={() => {
                  if (!option.disabled) {
                    onSortChange(option.value);
                    setIsOpen(false);
                  }
                }}
                disabled={option.disabled}
                className={`w-full flex items-center space-x-2 px-3 py-2 text-sm text-left hover:bg-gray-50 transition-colors
                  ${option.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                  ${currentSort === option.value ? 'bg-blue-50 text-blue-600' : 'text-gray-700'}
                  ${index === 0 ? 'rounded-t-lg' : ''}
                  ${index === sortOptions.length - 1 ? 'rounded-b-lg' : ''}
                `}
              >
                <span></span>
                <span className="font-medium">{option.label}</span>
                {currentSort === option.value && (
                  <span className="ml-auto text-blue-600">✓</span>
                )}
                {option.disabled && (
                  <span className="ml-auto text-gray-400 text-xs">위치필요</span>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default SortDropdown;