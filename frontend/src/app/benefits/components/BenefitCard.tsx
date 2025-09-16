'use client'

import React from 'react';
import { ExternalLink } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface BenefitProgram {
  id: number;
  title: string;
  organization: string;
  amount: string;
  amountType: string;
  tags: string[];
  period: string;
  age: string;
  details: string;
  category: string;
  region: string;
  type: string;
}

interface BenefitCardProps {
  program: BenefitProgram;
  onClick?: (program: BenefitProgram) => void;
}

const BenefitCard: React.FC<BenefitCardProps> = ({ program, onClick }) => {
  const router = useRouter();

  const handleCardClick = () => {
    // 세부페이지로 이동
    router.push(`/benefits/${program.id}`);
    
    // 기존 onClick도 호출 (필요한 경우)
    if (onClick) {
      onClick(program);
    }
  };

  const getAmountColor = (amountType: string) => {
    switch(amountType) {
      case '지원금': return 'text-red-500';
      case '할인': return 'text-red-500';
      case '쿠폰': return 'text-red-500';
      default: return 'text-green-500';
    }
  };

  const getTagColor = (tag: string) => {
    if (tag === '신규') return 'bg-green-100 text-green-700';
    if (tag === '인기') return 'bg-blue-100 text-blue-700';
    if (tag === '여행필수') return 'bg-purple-100 text-purple-700';
    if (tag === '지역') return 'bg-orange-100 text-orange-700';
    if (tag === '자연') return 'bg-green-100 text-green-700';
    if (tag === '힐링') return 'bg-blue-100 text-blue-700';
    if (tag === '교통') return 'bg-indigo-100 text-indigo-700';
    if (tag === '숙박') return 'bg-pink-100 text-pink-700';
    if (tag === '지역특화') return 'bg-yellow-100 text-yellow-700';
    return 'bg-gray-100 text-gray-600';
  };

  return (
    <div 
      onClick={handleCardClick}
      className="relative bg-white rounded-2xl border border-gray-200 overflow-hidden hover:border-gray-300 hover:shadow-md transition-all cursor-pointer"
    >
      {/* Top white section */}
      <div className="bg-white p-5 pb-3">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 mb-1">{program.title}</h3>
            <p className="text-sm text-gray-600">{program.organization}</p>
          </div>
          <div className="text-right">
            <div className={`text-xl font-bold ${getAmountColor(program.amountType)}`}>
              {program.amount}
            </div>
            <div className="text-sm text-gray-500">{program.amountType}</div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {program.tags.map((tag, tagIndex) => (
            <span
              key={tagIndex}
              className={`px-3 py-1 rounded-full text-xs font-medium ${getTagColor(tag)}`}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Bottom gray section */}
      <div className="bg-gray-50 px-5 py-3 border-t border-gray-200">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">신청기간</span>
            <span className="text-gray-700">{program.period}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">대상</span>
            <span className="text-gray-700">{program.age}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">상세</span>
            <div className="text-blue-600 font-medium flex items-center space-x-1">
              <span>자세히 보기</span>
              <ExternalLink className="w-3 h-3" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BenefitCard;