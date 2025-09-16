'use client'

import React, { useState, useEffect } from 'react';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface BenefitDetailData {
  id: number;
  title: string;
  organization: string;
  amount: string;
  amountType: string;
  icon: string;
  description: string;
  usageAreas: string[];
  eligibility: {
    age: string;
    income: string;
    other: string;
  };
  applicationInfo: {
    period: string;
    usagePeriod: string;
    paymentMethod: string;
  };
  applicationSteps: string[];
  warnings: string[];
  applicationUrl?: string;
}

interface BenefitDetailPageProps {
  benefit: BenefitDetailData;
}

// 더미 데이터 (나중에 props로 받을 예정)
const dummyBenefit: BenefitDetailData = {
  id: 1,
  title: '청년 문화패스',
  organization: '문화체육관광부 • 2025년',
  amount: '10만원',
  amountType: '연간 지원금 (문화비 형태 지원)',
  icon: '🎭',
  description: '전국 문화시설 이용료, 도서 구입, 공연관람 등에 사용 가능한 문화비를 10만원 지원',
  usageAreas: [
    '공연 관람 (연극, 뮤지컬, 콘서트 등)',
    '전시 관람 (미술관, 박물관, 갤러리 등)',
    '도서 구매 (서점, 온라인 서점)',
    '영화 관람',
  ],
  eligibility: {
    age: '만 19세~24세 (2000~2005년생)',
    income: '중위소득 120% 이하',
    other: '대한민국 국민, 1인 1계정 신청'
  },
  applicationInfo: {
    period: '2025년 9월 1일 ~ 12월 31일',
    usagePeriod: '지급일로부터 12개월',
    paymentMethod: '모바일 및 온라인 형태'
  },
  applicationSteps: [
    '문화패스 앱 다운로드 - App Store 또는 Google Play에서 \'문화패스\' 검색',
    '회원가입 및 본인인증 - 휴대폰 번호와 본인인증을 통한 가입',
    '신청서 작성 - 개인정보와 소득 인증서류 업로드',
    '승인 확인 - 3~5일 후 승인 결과 및 문화비 지급'
  ],
  warnings: [
    '중복 신청시 시간 제약',
    '허위 정보 입력시 사용 제한',
    '소득인증 허위 입력 불가',
    '사용 기간 만료시 사용 소멸'
  ],
  applicationUrl: 'https://culture.go.kr'
};

const BenefitDetailPage: React.FC<BenefitDetailPageProps> = ({ benefit = dummyBenefit }) => {
  const router = useRouter();
  const [isSafariMobile, setIsSafariMobile] = useState(false);

  useEffect(() => {
    // 클라이언트에서만 실행
    const checkSafariMobile = () => {
      return /iPad|iPhone|iPod/.test(navigator.userAgent) && 
        /Safari/.test(navigator.userAgent) && 
        !/Chrome|CriOS|FxiOS/.test(navigator.userAgent);
    };
    
    setIsSafariMobile(checkSafariMobile());
  }, []);

  const handleGoBack = () => {
    router.back();
  };

  const handleApply = () => {
    if (benefit.applicationUrl) {
      window.open(benefit.applicationUrl, '_blank');
    }
  };

  return (
    <>
      <div className="mobile-container bg-white" style={{ 
        height: '100vh',
        overflow: 'hidden',
        position: 'relative'
      }}>
        {/* Scrollable Content */}
        <div style={{
          height: isSafariMobile ? 'calc(100vh - 160px)' : 'calc(100vh - 80px)',
          overflowY: 'auto',
          overflowX: 'hidden',
          WebkitOverflowScrolling: 'touch',
          scrollBehavior: 'auto',
          overscrollBehavior: 'none',
          paddingBottom: isSafariMobile ? '20px' : '0'
        }}>
          {/* Header */}
          <div className="bg-blue-400 text-white">
            <div className="flex items-center justify-between p-4">
              <button onClick={handleGoBack} className="p-2 hover:bg-blue-500 rounded-full">
                <ArrowLeft className="w-5 h-5" />
              </button>
            </div>
            
            {/* Hero Section */}
            <div className="text-center pb-8 px-4">
              <div className="w-16 h-16 bg-white rounded-full mx-auto mb-4 flex items-center justify-center text-2xl">
                {benefit.icon}
              </div>
              <h1 className="text-xl font-bold mb-1">{benefit.title}</h1>
              <p className="text-blue-100 text-sm mb-4">{benefit.organization}</p>
              <div className="text-3xl font-bold mb-1">{benefit.amount}</div>
              <div className="text-blue-100 text-sm">{benefit.amountType}</div>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 space-y-6">
            {/* 혜택 개요 */}
            <section>
              <h2 className="flex items-center text-lg font-semibold mb-3">
                <span className="mr-2">📋</span>
                혜택 개요
              </h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium mb-2">지원 내용</h3>
                <p className="text-gray-700 text-sm leading-relaxed">{benefit.description}</p>
              </div>
            </section>

            {/* 사용 가능 분야 */}
            <section>
              <h3 className="font-medium mb-3">사용 가능 분야</h3>
              <div className="space-y-2">
                {benefit.usageAreas.map((area, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-sm text-gray-700">{area}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* 신청 자격 */}
            <section>
              <h2 className="flex items-center text-lg font-semibold mb-3">
                <span className="mr-2">🏛️</span>
                신청 자격
              </h2>
              <div className="space-y-3">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="font-medium text-sm text-gray-600 mb-1">연령 조건</div>
                  <div className="text-gray-800">{benefit.eligibility.age}</div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="font-medium text-sm text-gray-600 mb-1">소득 조건</div>
                  <div className="text-gray-800">{benefit.eligibility.income}</div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="font-medium text-sm text-gray-600 mb-1">기타 조건</div>
                  <div className="text-gray-800">{benefit.eligibility.other}</div>
                </div>
              </div>
            </section>

            {/* 신청 정보 */}
            <section>
              <h2 className="flex items-center text-lg font-semibold mb-3">
                <span className="mr-2">📅</span>
                신청 정보
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600 text-sm">신청 기간</span>
                  <span className="text-gray-800 text-sm">{benefit.applicationInfo.period}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600 text-sm">사용 기간</span>
                  <span className="text-gray-800 text-sm">{benefit.applicationInfo.usagePeriod}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-600 text-sm">지급 방식</span>
                  <span className="text-gray-800 text-sm">{benefit.applicationInfo.paymentMethod}</span>
                </div>
              </div>
            </section>

            {/* 신청 방법 */}
            <section>
              <h2 className="flex items-center text-lg font-semibold mb-3">
                <span className="mr-2">🔧</span>
                신청 방법
              </h2>
              <div className="space-y-3">
                {benefit.applicationSteps.map((step, index) => (
                  <div key={index} className="flex space-x-3">
                    <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium text-sm text-gray-800 mb-1">
                        {step.split(' - ')[0]}
                      </div>
                      {step.split(' - ')[1] && (
                        <div className="text-xs text-gray-600">
                          {step.split(' - ')[1]}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* 주의 사항 */}
            <section>
              <h2 className="flex items-center text-lg font-semibold mb-3">
                <span className="mr-2">⚠️</span>
                주의 사항
              </h2>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <div className="font-medium text-sm text-yellow-800 mb-2">필수 확인사항</div>
                <ul className="space-y-1">
                  {benefit.warnings.map((warning, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <div className="w-1 h-1 bg-yellow-600 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-sm text-yellow-800">{warning}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* Fixed Bottom CTA - 모바일 컨테이너 밖에 고정 */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '393px',
        height: '80px',
        backgroundColor: 'white',
        borderTop: '1px solid #e5e7eb',
        padding: '16px',
        boxSizing: 'border-box',
        zIndex: 1000
      }}>
        <div className="flex items-center space-x-3 h-full">
          <button
            onClick={() => console.log('북마크 클릭')}
            className="w-12 h-12 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-colors"
          >
            <span className="text-xl">🔖</span>
          </button>
          <button
            onClick={handleApply}
            className="flex-1 h-12 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg flex items-center justify-center space-x-2"
          >
            <span>신청하기</span>
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      </div>
    </>
  );
};

export default BenefitDetailPage;