'use client';

import { useState } from 'react';

export interface FilterState {
  budget: string;
  duration: string;
  companions: string;
  interests: string[];
  region: string;
}

interface FilterButtonsProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
}

const budgetOptions = [
  { value: 'under_50000', label: '5만원 이하', icon: '💰' },
  { value: '50000_100000', label: '5-10만원', icon: '💵' },
  { value: '100000_200000', label: '10-20만원', icon: '💸' },
  { value: 'over_200000', label: '20만원 이상', icon: '💎' }
];

const durationOptions = [
  { value: 'half_day', label: '반나절', icon: '🌅' },
  { value: 'one_day', label: '당일', icon: '☀️' },
  { value: 'two_days', label: '1박 2일', icon: '🌙' },
  { value: 'three_days', label: '2박 3일', icon: '🌟' },
  { value: 'long_term', label: '3박 이상', icon: '🏖️' }
];

const companionOptions = [
  { value: 'solo', label: '혼자', icon: '🚶‍♂️' },
  { value: 'couple', label: '연인', icon: '💕' },
  { value: 'friends', label: '친구들', icon: '👥' },
  { value: 'family', label: '가족', icon: '👨‍👩‍👧‍👦' }
];

const interestOptions = [
  { value: 'nature', label: '자연', icon: '🌿' },
  { value: 'culture', label: '문화', icon: '🏛️' },
  { value: 'food', label: '맛집', icon: '🍜' },
  { value: 'cafe', label: '카페', icon: '☕' },
  { value: 'photo', label: '포토스팟', icon: '📸' },
  { value: 'activity', label: '액티비티', icon: '🏃‍♂️' },
  { value: 'healing', label: '힐링', icon: '🧘‍♀️' },
  { value: 'shopping', label: '쇼핑', icon: '🛍️' }
];

const regionOptions = [
  { value: 'seoul', label: '서울', icon: '🏙️' },
  { value: 'busan', label: '부산', icon: '🌊' },
  { value: 'gangwon', label: '강원도', icon: '⛰️' },
  { value: 'gyeonggi', label: '경기도', icon: '🏘️' },
  { value: 'jeju', label: '제주도', icon: '🌺' },
  { value: 'gyeongsang', label: '경상도', icon: '🏯' },
  { value: 'jeolla', label: '전라도', icon: '🌾' },
  { value: 'chungcheong', label: '충청도', icon: '🌸' }
];

export default function FilterButtons({ filters, onFilterChange }: FilterButtonsProps) {
  const [expandedSections, setExpandedSections] = useState({
    budget: true,
    duration: true,
    companions: true,
    interests: false,
    region: false
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleSingleSelect = (key: keyof FilterState, value: string) => {
    if (key === 'interests') return; // interests는 다중 선택이므로 제외
    
    onFilterChange({
      ...filters,
      [key]: filters[key] === value ? '' : value
    });
  };

  const handleMultiSelect = (value: string) => {
    const currentInterests = filters.interests;
    const newInterests = currentInterests.includes(value)
      ? currentInterests.filter(item => item !== value)
      : [...currentInterests, value];
    
    onFilterChange({
      ...filters,
      interests: newInterests
    });
  };

  const clearFilters = () => {
    onFilterChange({
      budget: '',
      duration: '',
      companions: '',
      interests: [],
      region: ''
    });
  };

  const hasActiveFilters = Object.values(filters).some(value => 
    Array.isArray(value) ? value.length > 0 : value !== ''
  );

  return (
    <div className="space-y-4">
      
      {/* Clear Button */}
      {hasActiveFilters && (
        <button
          onClick={clearFilters}
          className="w-full py-2 px-3 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        >
          🗑️ 필터 초기화
        </button>
      )}

      {/* Budget Section */}
      <div className="border border-gray-200 rounded-lg">
        <button
          onClick={() => toggleSection('budget')}
          className="w-full p-3 text-left flex items-center justify-between hover:bg-gray-50 rounded-t-lg"
        >
          <span className="font-medium text-gray-800">💰 예산</span>
          <span className={`transform transition-transform ${expandedSections.budget ? 'rotate-180' : ''}`}>
            ▼
          </span>
        </button>
        
        {expandedSections.budget && (
          <div className="p-3 pt-0 grid grid-cols-1 gap-2">
            {budgetOptions.map(option => (
              <button
                key={option.value}
                onClick={() => handleSingleSelect('budget', option.value)}
                className={`p-2 text-sm rounded-md text-left transition-colors ${
                  filters.budget === option.value
                    ? 'bg-indigo-100 text-indigo-700 border border-indigo-300'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                }`}
              >
                {option.icon} {option.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Duration Section */}
      <div className="border border-gray-200 rounded-lg">
        <button
          onClick={() => toggleSection('duration')}
          className="w-full p-3 text-left flex items-center justify-between hover:bg-gray-50 rounded-t-lg"
        >
          <span className="font-medium text-gray-800">⏰ 기간</span>
          <span className={`transform transition-transform ${expandedSections.duration ? 'rotate-180' : ''}`}>
            ▼
          </span>
        </button>
        
        {expandedSections.duration && (
          <div className="p-3 pt-0 grid grid-cols-1 gap-2">
            {durationOptions.map(option => (
              <button
                key={option.value}
                onClick={() => handleSingleSelect('duration', option.value)}
                className={`p-2 text-sm rounded-md text-left transition-colors ${
                  filters.duration === option.value
                    ? 'bg-indigo-100 text-indigo-700 border border-indigo-300'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                }`}
              >
                {option.icon} {option.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Companions Section */}
      <div className="border border-gray-200 rounded-lg">
        <button
          onClick={() => toggleSection('companions')}
          className="w-full p-3 text-left flex items-center justify-between hover:bg-gray-50 rounded-t-lg"
        >
          <span className="font-medium text-gray-800">👥 동행</span>
          <span className={`transform transition-transform ${expandedSections.companions ? 'rotate-180' : ''}`}>
            ▼
          </span>
        </button>
        
        {expandedSections.companions && (
          <div className="p-3 pt-0 grid grid-cols-2 gap-2">
            {companionOptions.map(option => (
              <button
                key={option.value}
                onClick={() => handleSingleSelect('companions', option.value)}
                className={`p-2 text-sm rounded-md text-center transition-colors ${
                  filters.companions === option.value
                    ? 'bg-indigo-100 text-indigo-700 border border-indigo-300'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <div>{option.icon}</div>
                <div className="text-xs mt-1">{option.label}</div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Interests Section */}
      <div className="border border-gray-200 rounded-lg">
        <button
          onClick={() => toggleSection('interests')}
          className="w-full p-3 text-left flex items-center justify-between hover:bg-gray-50 rounded-t-lg"
        >
          <span className="font-medium text-gray-800">
            ❤️ 관심사 
            {filters.interests.length > 0 && (
              <span className="ml-2 inline-flex items-center justify-center w-5 h-5 text-xs bg-indigo-100 text-indigo-700 rounded-full">
                {filters.interests.length}
              </span>
            )}
          </span>
          <span className={`transform transition-transform ${expandedSections.interests ? 'rotate-180' : ''}`}>
            ▼
          </span>
        </button>
        
        {expandedSections.interests && (
          <div className="p-3 pt-0 grid grid-cols-2 gap-2">
            {interestOptions.map(option => (
              <button
                key={option.value}
                onClick={() => handleMultiSelect(option.value)}
                className={`p-2 text-sm rounded-md text-center transition-colors ${
                  filters.interests.includes(option.value)
                    ? 'bg-indigo-100 text-indigo-700 border border-indigo-300'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <div>{option.icon}</div>
                <div className="text-xs mt-1">{option.label}</div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Region Section */}
      <div className="border border-gray-200 rounded-lg">
        <button
          onClick={() => toggleSection('region')}
          className="w-full p-3 text-left flex items-center justify-between hover:bg-gray-50 rounded-t-lg"
        >
          <span className="font-medium text-gray-800">📍 지역</span>
          <span className={`transform transition-transform ${expandedSections.region ? 'rotate-180' : ''}`}>
            ▼
          </span>
        </button>
        
        {expandedSections.region && (
          <div className="p-3 pt-0 grid grid-cols-2 gap-2">
            {regionOptions.map(option => (
              <button
                key={option.value}
                onClick={() => handleSingleSelect('region', option.value)}
                className={`p-2 text-sm rounded-md text-center transition-colors ${
                  filters.region === option.value
                    ? 'bg-indigo-100 text-indigo-700 border border-indigo-300'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <div>{option.icon}</div>
                <div className="text-xs mt-1">{option.label}</div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="text-sm font-medium text-blue-800 mb-2">선택된 조건:</h4>
          <div className="space-y-1 text-xs text-blue-700">
            {filters.budget && <div>💰 {budgetOptions.find(opt => opt.value === filters.budget)?.label}</div>}
            {filters.duration && <div>⏰ {durationOptions.find(opt => opt.value === filters.duration)?.label}</div>}
            {filters.companions && <div>👥 {companionOptions.find(opt => opt.value === filters.companions)?.label}</div>}
            {filters.region && <div>📍 {regionOptions.find(opt => opt.value === filters.region)?.label}</div>}
            {filters.interests.length > 0 && (
              <div>❤️ {filters.interests.map(interest => 
                interestOptions.find(opt => opt.value === interest)?.label
              ).join(', ')}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}