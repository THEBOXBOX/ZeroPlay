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
  { value: 'under_50000', label: '5만원 이하', icon: '💰', desc: '가성비 여행' },
  { value: '50000_100000', label: '5-10만원', icon: '💵', desc: '적당한 예산' },
  { value: '100000_200000', label: '10-20만원', icon: '💸', desc: '여유로운 여행' },
  { value: 'over_200000', label: '20만원 이상', icon: '💎', desc: '프리미엄 여행' }
];

const durationOptions = [
  { value: 'half_day', label: '반나절', icon: '🌅', desc: '3-4시간' },
  { value: 'one_day', label: '당일치기', icon: '☀️', desc: '하루 여행' },
  { value: 'two_days', label: '1박 2일', icon: '🌙', desc: '주말 여행' },
  { value: 'three_days', label: '2박 3일', icon: '🌟', desc: '휴가 여행' },
  { value: 'long_term', label: '3박 이상', icon: '🏖️', desc: '장기 여행' }
];

const companionOptions = [
  { value: 'solo', label: '혼자서', icon: '🚶‍♂️', desc: '나만의 시간' },
  { value: 'couple', label: '연인과', icon: '💕', desc: '로맨틱 여행' },
  { value: 'friends', label: '친구들과', icon: '👥', desc: '우정 여행' },
  { value: 'family', label: '가족과', icon: '👨‍👩‍👧‍👦', desc: '가족 여행' }
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
  { value: 'sudogwon', label: '수도권', icon: '🏘️' },
  { value: 'gangwon', label: '강원도', icon: '⛰️' },
  { value: 'chungcheong', label: '충청도', icon: '🌸' },
  { value: 'gyeongsang', label: '경상도', icon: '🏯' },
  { value: 'jeolla', label: '전라도', icon: '🌾' },
  { value: 'jeju', label: '제주도', icon: '🌺' }
];

export default function FilterButtons({ filters, onFilterChange }: FilterButtonsProps) {
  const handleSingleSelect = (key: keyof FilterState, value: string) => {
    if (key === 'interests') return;
    
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
    <div className="space-y-10 p-3">
      
      {/* 초기화 버튼 */}
      {hasActiveFilters && (
        <div className="flex justify-end">
          <button
            onClick={clearFilters}
            className="text-red-500 text-sm font-bold px-3 py-2 rounded-lg hover:bg-red-50 transition-colors"
          >
            🗑️ 모두 초기화
          </button>
        </div>
      )}

      {/* 예산 섹션 */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-3 flex items-center">
          💰 예산 설정
          {filters.budget && (
            <span className="ml-2 w-2 h-2 bg-blue-500 rounded-full"></span>
          )}
        </h3>
        <div className="space-y-2">
          {budgetOptions.map(option => (
            <button
              key={option.value}
              onClick={() => handleSingleSelect('budget', option.value)}
              className={`w-full p-3 rounded-xl text-left transition-all flex items-center ${
                filters.budget === option.value
                  ? 'bg-blue-500 text-white shadow-md transform scale-[1.02]'
                  : 'bg-white text-gray-700 hover:bg-blue-50 border border-gray-200 shadow-sm'
              }`}
            >
              <span className="text-xl mr-3">{option.icon}</span>
              <div className="flex-1">
                <div className="font-bold text-sm">{option.label}</div>
                <div className={`text-xs ${
                  filters.budget === option.value ? 'text-blue-100' : 'text-gray-500'
                }`}>{option.desc}</div>
              </div>
              {filters.budget === option.value && (
                <span className="text-lg">✓</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* 기간 섹션 */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-3 flex items-center">
          ⏰ 여행 기간
          {filters.duration && (
            <span className="ml-2 w-2 h-2 bg-green-500 rounded-full"></span>
          )}
        </h3>
        <div className="space-y-2">
          {durationOptions.map(option => (
            <button
              key={option.value}
              onClick={() => handleSingleSelect('duration', option.value)}
              className={`w-full p-3 rounded-xl text-left transition-all flex items-center ${
                filters.duration === option.value
                  ? 'bg-green-500 text-white shadow-md transform scale-[1.02]'
                  : 'bg-white text-gray-700 hover:bg-green-50 border border-gray-200 shadow-sm'
              }`}
            >
              <span className="text-xl mr-3">{option.icon}</span>
              <div className="flex-1">
                <div className="font-bold text-sm">{option.label}</div>
                <div className={`text-xs ${
                  filters.duration === option.value ? 'text-green-100' : 'text-gray-500'
                }`}>{option.desc}</div>
              </div>
              {filters.duration === option.value && (
                <span className="text-lg">✓</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* 동행 섹션 */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-3 flex items-center">
          👥 동행자
          {filters.companions && (
            <span className="ml-2 w-2 h-2 bg-purple-500 rounded-full"></span>
          )}
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {companionOptions.map(option => (
            <button
              key={option.value}
              onClick={() => handleSingleSelect('companions', option.value)}
              className={`p-3 rounded-xl text-center transition-all flex flex-col items-center justify-center ${
                filters.companions === option.value
                  ? 'bg-purple-500 text-white shadow-md transform scale-[1.02]'
                  : 'bg-white text-gray-700 hover:bg-purple-50 border border-gray-200 shadow-sm'
              }`}
            >
              <span className="text-xl mb-1">{option.icon}</span>
              <div className="font-bold text-xs">{option.label}</div>
              <div className={`text-xs ${
                filters.companions === option.value ? 'text-purple-100' : 'text-gray-500'
              }`}>{option.desc}</div>
              {filters.companions === option.value && (
                <span className="text-sm mt-1">✓</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* 관심사 섹션 */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-3 flex items-center">
          ❤️ 관심사
          {filters.interests.length > 0 && (
            <span className="ml-2 bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full font-bold">
              {filters.interests.length}개
            </span>
          )}
        </h3>
        <p className="text-xs text-gray-600 mb-3">여러 개를 선택할 수 있어요!</p>
        <div className="grid grid-cols-2 gap-2">
          {interestOptions.map(option => (
            <button
              key={option.value}
              onClick={() => handleMultiSelect(option.value)}
              className={`p-3 rounded-xl text-center transition-all flex flex-col items-center justify-center ${
                filters.interests.includes(option.value)
                  ? 'bg-red-500 text-white shadow-md transform scale-[1.02]'
                  : 'bg-white text-gray-700 hover:bg-red-50 border border-gray-200 shadow-sm'
              }`}
            >
              <span className="text-xl mb-1">{option.icon}</span>
              <div className="font-bold text-xs">{option.label}</div>
              {filters.interests.includes(option.value) && (
                <span className="text-sm mt-1">✓</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* 지역 섹션 */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-3 flex items-center">
          📍 여행 지역
          {filters.region && (
            <span className="ml-2 w-2 h-2 bg-indigo-500 rounded-full"></span>
          )}
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {regionOptions.map(option => (
            <button
              key={option.value}
              onClick={() => handleSingleSelect('region', option.value)}
              className={`p-3 rounded-xl text-center transition-all flex flex-col items-center justify-center ${
                filters.region === option.value
                  ? 'bg-indigo-500 text-white shadow-md transform scale-[1.02]'
                  : 'bg-white text-gray-700 hover:bg-indigo-50 border border-gray-200 shadow-sm'
              }`}
            >
              <span className="text-xl mb-1">{option.icon}</span>
              <div className="font-bold text-xs">{option.label}</div>
              {filters.region === option.value && (
                <span className="text-sm mt-1">✓</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* 선택된 조건 요약 */}
      {hasActiveFilters && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
          <h4 className="text-sm font-bold text-blue-800 mb-3 flex items-center">
            ✨ 선택된 여행 조건
            <span className="ml-2 bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full font-bold">
              {[filters.budget, filters.duration, filters.companions, filters.region].filter(Boolean).length + filters.interests.length}개
            </span>
          </h4>
          
          <div className="space-y-2">
            {filters.budget && (
              <div className="flex items-center text-xs text-blue-700">
                <span className="mr-2">💰</span>
                <span className="font-bold">{budgetOptions.find(opt => opt.value === filters.budget)?.label}</span>
              </div>
            )}
            {filters.duration && (
              <div className="flex items-center text-xs text-blue-700">
                <span className="mr-2">⏰</span>
                <span className="font-bold">{durationOptions.find(opt => opt.value === filters.duration)?.label}</span>
              </div>
            )}
            {filters.companions && (
              <div className="flex items-center text-xs text-blue-700">
                <span className="mr-2">👥</span>
                <span className="font-bold">{companionOptions.find(opt => opt.value === filters.companions)?.label}</span>
              </div>
            )}
            {filters.region && (
              <div className="flex items-center text-xs text-blue-700">
                <span className="mr-2">📍</span>
                <span className="font-bold">{regionOptions.find(opt => opt.value === filters.region)?.label}</span>
              </div>
            )}
            {filters.interests.length > 0 && (
              <div className="flex items-start text-xs text-blue-700">
                <span className="mr-2 mt-0.5">❤️</span>
                <div className="flex flex-wrap gap-1">
                  {filters.interests.map(interest => (
                    <span key={interest} className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-bold">
                      {interestOptions.find(opt => opt.value === interest)?.label}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}