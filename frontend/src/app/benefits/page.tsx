'use client'

import React, { useState, useEffect } from 'react';
import Header from '@/app/benefits/components/Header';
import NavBar from '@/app/benefits/components/NavBar';
import CategoryTabs from '@/app/benefits/components/CategoryTabs';
import BenefitCard from '@/app/benefits/components/BenefitCard';

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
  const [isSafariMobile, setIsSafariMobile] = useState(false);
  
  // 새로 추가된 상태들
  const [programs, setPrograms] = useState<BenefitProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Safari 모바일 감지
    const checkSafariMobile = () => {
      return /iPad|iPhone|iPod/.test(navigator.userAgent) && 
        /Safari/.test(navigator.userAgent) && 
        !/Chrome|CriOS|FxiOS/.test(navigator.userAgent);
    };
    
    setIsSafariMobile(checkSafariMobile());
    
    // API에서 데이터 가져오기
    fetchBenefits();
  }, []);

  const fetchBenefits = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // 백엔드 포트 3001에 맞춰 URL 수정
      const response = await fetch('http://localhost:3001/api/benefits');
      
      if (!response.ok) {
        throw new Error('Failed to fetch benefits');
      }
      
      const result = await response.json();
      
      if (result.success && result.data) {
        setPrograms(result.data);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Failed to fetch benefits:', error);
      setError('데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const regions = ['전국', '서울', '수도권', '강원', '충청', '전라', '경상', '제주'];

  const getCurrentPrograms = (): BenefitProgram[] => {
    let filteredPrograms = programs;

    // 탭 필터링
    if (activeTab === '무료') {
      filteredPrograms = programs.filter(p => p.type === 'free');
    } else if (activeTab === '혜택') {
      filteredPrograms = programs.filter(p => p.type === 'discount');
    }
    // '전체'인 경우는 모든 프로그램

    // 지역 필터링
    if (selectedRegion !== '전국') {
      filteredPrograms = filteredPrograms.filter(p => 
        p.region === selectedRegion || p.region === '전국'
      );
    }

    return filteredPrograms;
  };

  const handleProgramClick = (program: BenefitProgram) => {
    console.log('Selected program:', program);
  };

  const currentPrograms = getCurrentPrograms();

  // 로딩 상태
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl mb-2">로딩 중...</div>
          <div className="text-gray-600">혜택 정보를 불러오고 있습니다.</div>
        </div>
      </div>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <div className="text-xl font-bold text-gray-800 mb-2">오류가 발생했습니다</div>
          <div className="text-gray-600 mb-4">{error}</div>
          <button 
            onClick={fetchBenefits}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

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

      {/* Region Filter - 완전 고정 */}
      <div style={{ 
        position: 'fixed', 
        top: '110px', 
        left: '50%', 
        transform: 'translateX(-50%)', 
        width: '393px',
        height: '60px',
        zIndex: 998,
        background: 'white',
        borderBottom: '1px solid #e5e7eb'
      }}>
        <div className="px-4 py-3">
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
      </div>

      <div className="mobile-container bg-gray-50 flex flex-col h-screen">
        {/* Header + Tab Bar + Region Filter 공간 확보 */}
        <div className="h-[170px]"></div>
        
        {/* 메인 콘텐츠 영역 - 본문만 스크롤 */}
        <div 
          className="overflow-y-auto" 
          style={{
            height: isSafariMobile ? 'calc(100vh - 350px)' : 'calc(100vh - 230px)',
            WebkitOverflowScrolling: 'touch',
            overscrollBehavior: 'none',
            paddingBottom: '20px'
          }}
        >
          {/* Program Cards */}
          <div className="px-4 py-4 space-y-3">
            {currentPrograms.map((program) => (
              <BenefitCard 
                key={program.id} 
                program={program} 
                onClick={handleProgramClick}
              />
            ))}

            {currentPrograms.length === 0 && !loading && (
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