'use client'

import React, { useState } from 'react';
import Header from '@/components/Header';
import NavBar from '@/components/NavBar';
import CategoryTabs from '@/components/CategoryTabs';
import BenefitCard from '@/components/BenefitCard';

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

const YouthBenefitsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('전체');
  const [selectedRegion, setSelectedRegion] = useState('전국');
  const [showRegionDropdown, setShowRegionDropdown] = useState(false);

  const regions = ['전국', '서울', '수도권', '강원', '충청', '전라', '경상', '제주'];

  const freePrograms: BenefitProgram[] = [
    {
      id: 1,
      title: '청년 문화패스',
      organization: '문화체육관광부',
      amount: '10만원',
      amountType: '지원금',
      tags: ['신규', '인기'],
      period: '~ 12월 31일',
      age: '19-24세 청년',
      details: '선착순 신청가능',
      category: 'culture',
      region: '전국',
      type: 'free'
    },
    {
      id: 2,
      title: '숲나들e',
      organization: '산림청',
      amount: '무료',
      amountType: '체험',
      tags: ['자연', '힐링'],
      period: '연중',
      age: '전 연령',
      details: '전국 자연휴양림 무료입장',
      category: 'nature',
      region: '전국',
      type: 'free'
    },
    {
      id: 3,
      title: '서울 청년 문화공간',
      organization: '서울시',
      amount: '무료',
      amountType: '이용권',
      tags: ['지역'],
      period: '연중',
      age: '만 19-34세',
      details: '청년센터 무료 이용',
      category: 'culture',
      region: '서울',
      type: 'free'
    }
  ];

  const benefitPrograms: BenefitProgram[] = [
    {
      id: 4,
      title: 'KTX 청년 할인',
      organization: '한국철도공사',
      amount: '30%',
      amountType: '할인',
      tags: ['여행필수', '교통'],
      period: '~ 6월 31일',
      age: '19-24세 청년',
      details: '선착순 예매',
      category: 'transport',
      region: '전국',
      type: 'discount'
    },
    {
      id: 5,
      title: '제주 청년 숙박지원',
      organization: '제주특별자치도',
      amount: '5만원',
      amountType: '쿠폰',
      tags: ['지역', '숙박'],
      period: '~ 11월 30일',
      age: '도외 거주 청년',
      details: '1박당 최대 5만원',
      category: 'accommodation',
      region: '제주',
      type: 'discount'
    },
    {
      id: 6,
      title: '경기 청년 여행지원',
      organization: '경기도',
      amount: '20%',
      amountType: '할인',
      tags: ['지역특화'],
      period: '~ 10월 31일',
      age: '경기도 거주 청년',
      details: '도내 관광지 할인',
      category: 'tourism',
      region: '경기',
      type: 'discount'
    }
  ];

  const getAllPrograms = (): BenefitProgram[] => {
    return [...freePrograms, ...benefitPrograms];
  };

  const getCurrentPrograms = (): BenefitProgram[] => {
    let programs: BenefitProgram[];
    
    if (activeTab === '전체') {
      programs = getAllPrograms();
    } else if (activeTab === '무료') {
      programs = freePrograms;
    } else { // 혜택
      programs = benefitPrograms;
    }

    return selectedRegion === '전국' 
      ? programs 
      : programs.filter(program => program.region === selectedRegion || program.region === '전국');
  };

  const handleProgramClick = (program: BenefitProgram) => {
    console.log('Selected program:', program);
  };

  const currentPrograms = getCurrentPrograms();

  return (
    <>
      {/* Header를 모바일 컨테이너 밖에 고정 */}
      <div style={{ 
        position: 'fixed', 
        top: 0, 
        left: '50%', 
        transform: 'translateX(-50%)', 
        width: '393px',
        height: '60px',
        zIndex: 1000
      }}>
        <Header />
      </div>

      {/* Tab Bar - CategoryTabs 컴포넌트 사용 */}
      <div style={{ 
        position: 'fixed', 
        top: '60px', 
        left: '50%', 
        transform: 'translateX(-50%)', 
        width: '393px',
        height: '50px',
        zIndex: 999,
        background: 'white',
        borderBottom: '1px solid #e5e7eb'
      }}>
        <CategoryTabs activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      <div className="mobile-container bg-gray-50 flex flex-col h-screen">
        {/* Header + Tab Bar 공간 확보 */}
        <div className="h-[110px]"></div>
        
        {/* 메인 콘텐츠 영역 - 본문만 스크롤 */}
        <div className="flex-1 overflow-y-auto pb-[80px]">
          {/* Region Filter */}
          <div className="px-4 py-3 bg-white border-b border-gray-100 sticky top-0 z-10">
            <div className="relative">
              <button
                onClick={() => setShowRegionDropdown(!showRegionDropdown)}
                className="flex items-center justify-between w-full max-w-xs px-4 py-2 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
              >
                <div className="flex items-center space-x-2">
                  <span className="text-sm">📍</span>
                  <span className="text-sm font-medium">{selectedRegion}</span>
                </div>
                <span className={`text-gray-500 transition-transform text-sm ${showRegionDropdown ? 'rotate-180' : ''}`}>▼</span>
              </button>
              
              {showRegionDropdown && (
                <div className="absolute top-full left-0 mt-1 w-full max-w-xs bg-white border border-gray-200 rounded-lg shadow-lg z-20 max-h-60 overflow-y-auto">
                  {regions.map((region) => (
                    <button
                      key={region}
                      onClick={() => {
                        setSelectedRegion(region);
                        setShowRegionDropdown(false);
                      }}
                      className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors ${
                        selectedRegion === region ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700'
                      }`}
                    >
                      {region}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Program Cards */}
          <div className="px-4 py-4 space-y-3">
            {currentPrograms.map((program, index) => (
              <BenefitCard 
                key={index} 
                program={program} 
                onClick={handleProgramClick}
              />
            ))}

            {currentPrograms.length === 0 && (
              <div className="text-center py-16">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">🎁</span>
                </div>
                <p className="text-gray-500 text-sm">
                  {selectedRegion}에서 이용 가능한 {activeTab === '전체' ? '' : activeTab} 프로그램이 없습니다.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* NavBar를 모바일 컨테이너 밖에 고정 */}
      <div style={{ 
        position: 'fixed', 
        bottom: 0, 
        left: '50%', 
        transform: 'translateX(-50%)', 
        width: '393px',
        height: '80px',
        zIndex: 1000
      }}>
        <NavBar />
      </div>
    </>
  );
};

export default YouthBenefitsPage;