'use client';

import { useState, useEffect } from 'react';
import BenefitCard from '@/components/BenefitCard';
import CategoryTabs from '@/components/CategoryTabs';

interface Benefit {
  id: number;
  title: string;
  description: string;
  target_audience: string;
  category: string;
  region: string;
  discount_rate: string;
  valid_from: string;
  valid_until: string;
}

const categories = [
  { name: '전체', icon: '' },
  { name: '교통', icon: '' },
  { name: '숙박', icon: '' },
  { name: '문화', icon: '' },
  { name: '지역', icon: '' }
];

export default function BenefitsPage() {
  const [benefits, setBenefits] = useState<Benefit[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [loading, setLoading] = useState(true);

  const fetchBenefits = async (category?: string) => {
    setLoading(true);
    try {
      const url = category && category !== '전체' 
        ? `http://localhost:3001/api/benefit?category=${category}`
        : 'http://localhost:3001/api/benefit';
      
      const response = await fetch(url);
      const data = await response.json();
      setBenefits(data.data || []);
    } catch (error) {
      console.error('혜택 데이터 가져오기 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBenefits(selectedCategory);
  }, [selectedCategory]);

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-center">
      {/* 정확한 iPhone 16 사이즈 393x852 고정 */}
      <div className="w-[393px] h-[852px] bg-white relative overflow-hidden shadow-xl">
        
        {/* Header - 정확히 120px */}
        <div className="absolute top-0 left-0 w-full h-[120px] bg-white border-b border-gray-200">
          <div className="h-[60px] flex items-center justify-between px-4 pt-2">
            <div className="flex items-center">
              <span className="text-xs text-gray-400 font-medium">MY</span>
              <span className="ml-1 font-bold text-lg">
                <span className="text-yellow-500">SUB</span>
                <span className="text-green-500">WAY</span>
              </span>
            </div>
            <div className="flex space-x-3">
              <button className="text-lg">🔔</button>
              <button className="text-lg">⚙️</button>
            </div>
          </div>
          <div className="h-[60px] px-4 flex items-center">
            <CategoryTabs 
              categories={categories}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
            />
          </div>
        </div>

        {/* 컨텐츠 영역 - 정확히 632px (852 - 120 - 100) */}
        <div className="absolute top-[120px] left-0 w-full h-[632px] overflow-y-auto bg-gray-50">
          <div className="flex justify-end px-4 pt-3 pb-2">
            <button className="flex items-center text-sm text-gray-500 font-medium">
              추천순 <span className="ml-1 text-xs">▼</span>
            </button>
          </div>
          
          <div className="px-4 pb-4 space-y-3">
            {loading ? (
              <div className="text-center py-12 text-gray-500">로딩 중...</div>
            ) : (
              benefits.map((benefit) => (
                <BenefitCard
                  key={benefit.id}
                  benefit={benefit}
                  onClick={() => console.log('혜택 클릭:', benefit.id)}
                />
              ))
            )}
          </div>
        </div>

        {/* NavBar - 정확히 100px */}
        <div className="absolute bottom-0 left-0 w-full h-[100px] bg-white border-t border-gray-200">
          <div className="flex justify-around items-center h-full">
            <button className="flex flex-col items-center space-y-1">
              <span className="text-xl">🏠</span>
              <span className="text-xs text-gray-500 font-medium">홈</span>
            </button>
            <button className="flex flex-col items-center space-y-1">
              <span className="text-xl">🤖</span>
              <span className="text-xs text-gray-500 font-medium">AI 루트</span>
            </button>
            <button className="flex flex-col items-center space-y-1">
              <span className="text-xl">🎁</span>
              <span className="text-xs font-bold text-blue-600">혜택 정보</span>
            </button>
            <button className="flex flex-col items-center space-y-1">
              <span className="text-xl">📍</span>
              <span className="text-xs text-gray-500 font-medium">지도</span>
            </button>
            <button className="flex flex-col items-center space-y-1">
              <span className="text-xl">👤</span>
              <span className="text-xs text-gray-500 font-medium">내 정보</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}