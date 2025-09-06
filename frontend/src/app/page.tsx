// frontend/src/app/page.tsx (Places 테이블 활용)
'use client';

import { useState, useEffect } from 'react';
import { travelApi } from '../lib/supabase';

interface TravelRecommendation {
  id: number;
  title: string;
  budget: number;
  duration: string;
  highlights: string[];
  description?: string;
  location?: string;
  placeType?: string;
  score?: number;
}

interface YouthBenefit {
  id: number;
  title: string;
  category: string;
  discount: string;
  eligibility: string;
  description: string;
}

export default function Home() {
  const [recommendations, setRecommendations] = useState<TravelRecommendation[]>([]);
  const [benefits, setBenefits] = useState<YouthBenefit[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRecommendations = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Places 테이블에서 추천 데이터 요청 시작...');
      
      const response = await travelApi.getRecommendations({
        budget: 100000,
        interests: ['카페', '포토', '먹거리'],
        duration: '당일',
        companions: '연인'
      });
      
      if (response.success && response.data && response.data.length > 0) {
        // Places 데이터를 프론트엔드 인터페이스에 맞게 변환 (단순화)
        const formattedData: TravelRecommendation[] = response.data.map((item: any) => {
          // 예상 비용 계산 (입장료 기반)
          const estimatedBudget = item.entry_fee > 0 
            ? Math.max(item.entry_fee * 3, 20000) // 입장료 + 식비/교통비 추정
            : 30000; // 무료 장소의 경우 기본 예상 비용

          // 태그를 highlights로 변환 (안전하게 처리)
          let highlights = ['특별한 경험'];
          try {
            if (typeof item.tags === 'string') {
              highlights = JSON.parse(item.tags);
            } else if (Array.isArray(item.tags)) {
              highlights = item.tags;
            }
          } catch (e) {
            console.warn('태그 파싱 실패:', item.tags);
          }

          // 장소 타입에 따른 설명
          const getTypeDescription = (type: string) => {
            switch(type) {
              case 'RESTAURANT': return '맛있는 로컬 맛집';
              case 'CAFE': return '감성 넘치는 카페';
              case 'MUSEUM': return '문화와 역사 체험';
              case 'PARK': return '자연과 함께하는 휴식';
              case 'ATTRACTION': return '특별한 관광 명소';
              default: return '추천 여행지';
            }
          };

          return {
            id: item.id,
            title: item.place_name || `장소 ${item.id}`,
            budget: estimatedBudget,
            duration: `${Math.round(item.avg_stay_minutes / 60) || 1}시간`, // 분을 시간으로 변환
            highlights: highlights,
            description: getTypeDescription(item.place_type),
            location: item.address || '위치 정보 없음',
            placeType: item.place_type,
            score: item.score
          };
        });
        
        setRecommendations(formattedData);
        console.log('추천 데이터 로드 성공:', formattedData);
      } else if (response.success && response.data && response.data.length === 0) {
        console.warn('조건에 맞는 추천 데이터가 없습니다.');
        setRecommendations([]);
      } else {
        throw new Error(response.error || '추천 데이터를 가져올 수 없습니다.');
      }
    } catch (error) {
      console.error('추천 데이터 가져오기 실패:', error);
      setError(error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const fetchBenefits = async () => {
    try {
      console.log('청년 혜택 데이터 요청 시작...');
      
      const response = await travelApi.getYouthBenefits();
      
      if (response.success && response.data && response.data.length > 0) {
        setBenefits(response.data);
        console.log('혜택 데이터 로드 성공:', response.data);
      }
    } catch (error) {
      console.error('혜택 데이터 가져오기 실패:', error);
      // 혜택 데이터는 필수가 아니므로 에러 상태로 설정하지 않음
    }
  };

  // Supabase 연결 테스트
  const testSupabaseConnection = async () => {
    const response = await travelApi.testConnection();
    
    if (!response.success) {
      console.error('Supabase 연결 실패:', response.error);
      return false;
    }
    
    console.log('Supabase 연결 성공!');
    return true;
  };

  useEffect(() => {
    // 컴포넌트 마운트 시 데이터 로드
    const loadData = async () => {
      // 먼저 연결 테스트
      const isConnected = await testSupabaseConnection();
      
      if (!isConnected) {
        setError('Supabase 연결에 실패했습니다. 환경설정을 확인해주세요.');
        return;
      }
      
      // 연결이 성공하면 데이터 로드
      await Promise.all([
        fetchRecommendations(),
        fetchBenefits()
      ]);
    };
    
    loadData();
  }, []);

  // 장소 타입에 따른 아이콘 반환
  const getPlaceIcon = (placeType: string) => {
    switch(placeType) {
      case 'RESTAURANT': return '🍽️';
      case 'CAFE': return '☕';
      case 'MUSEUM': return '🏛️';
      case 'PARK': return '🌳';
      case 'ATTRACTION': return '🏞️';
      default: return '📍';
    }
  };

  // 에러 발생 시 표시할 컴포넌트
  if (error) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-red-600 mb-4">⚠️ 오류 발생</h1>
            <p className="text-gray-700 mb-4">{error}</p>
            <div className="space-y-2 text-sm text-gray-600 bg-gray-100 p-4 rounded-lg">
              <p><strong>해결 방법:</strong></p>
              <p>1. .env.local 파일에 NEXT_PUBLIC_SUPABASE_URL과 NEXT_PUBLIC_SUPABASE_ANON_KEY가 설정되어 있는지 확인</p>
              <p>2. Supabase 프로젝트가 활성화되어 있는지 확인</p>
              <p>3. places 테이블에 데이터가 있는지 확인</p>
              <p>4. 브라우저 개발자 도구 Network 탭에서 Supabase 요청 확인</p>
            </div>
            <button 
              onClick={() => {
                setError(null);
                fetchRecommendations();
              }}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              다시 시도
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            🎒 청년을 위한 국내여행 추천 서비스
          </h1>
          <p className="text-lg text-gray-600">
            합리적인 예산으로 특별한 경험을, 숨겨진 로컬 명소를 발견하세요
          </p>
        </header>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
              <p className="mt-4 text-gray-600">전국 관광지에서 맞춤 여행 코스를 찾고 있어요...</p>
            </div>
          ) : recommendations.length > 0 ? (
            recommendations.map((rec) => (
              <div key={rec.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xl font-semibold text-gray-800">
                    {getPlaceIcon(rec.placeType || '')} {rec.title}
                  </h3>
                  {rec.score && (
                    <span className="text-sm bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                      ⭐ {rec.score.toFixed(1)}
                    </span>
                  )}
                </div>
                
                {rec.location && (
                  <p className="text-sm text-gray-500 mb-2">📍 {rec.location}</p>
                )}
                
                <p className="text-sm text-gray-600 mb-4">{rec.description}</p>
                
                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <p>💰 예상 비용: {rec.budget.toLocaleString()}원</p>
                  <p>⏰ 추천 체류시간: {rec.duration}</p>
                </div>
                
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">특징:</p>
                  <div className="flex flex-wrap gap-2">
                    {rec.highlights.map((highlight, index) => (
                      <span key={index} className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full text-xs">
                        {highlight}
                      </span>
                    ))}
                  </div>
                </div>
                
                <button className="w-full bg-indigo-500 text-white py-2 px-4 rounded-lg hover:bg-indigo-600 transition-colors">
                  상세보기
                </button>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-600">조건에 맞는 추천 장소가 없습니다.</p>
              <p className="text-sm text-gray-500 mt-2">다른 조건으로 검색해보세요.</p>
              <button 
                onClick={fetchRecommendations}
                className="mt-4 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600"
              >
                다시 검색
              </button>
            </div>
          )}
        </div>

        <section className="mt-16 bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            🎁 청년 전용 혜택 정보
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {benefits.length > 0 ? (
              benefits.map((benefit) => (
                <div key={benefit.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-lg">{benefit.title}</h3>
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                      {benefit.category}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-2">{benefit.description}</p>
                  <p className="text-green-600 font-medium text-sm mb-2">{benefit.discount}</p>
                  <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs">
                    {benefit.eligibility}
                  </span>
                </div>
              ))
            ) : (
              // 기본 혜택 정보 표시 (백업)
              <>
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold text-lg mb-2">청년 문화패스</h3>
                  <p className="text-gray-600 text-sm mb-2">월 5만원 문화활동 지원</p>
                  <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs">
                    만 18~34세
                  </span>
                </div>
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold text-lg mb-2">KTX 청년 할인</h3>
                  <p className="text-gray-600 text-sm mb-2">최대 30% 할인</p>
                  <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs">
                    만 13~28세
                  </span>
                </div>
              </>
            )}
          </div>
        </section>

        {/* 디버깅 정보 (개발 환경에서만) */}
        {process.env.NODE_ENV === 'development' && (
          <section className="mt-8 bg-gray-100 rounded-lg p-4">
            <h3 className="text-sm font-bold text-gray-700 mb-2">개발 정보:</h3>
            <div className="text-xs text-gray-600 space-y-1">
              <p>• 총 추천 장소: {recommendations.length}개</p>
              <p>• 데이터 소스: Supabase places 테이블</p>
              <p>• 로드된 혜택: {benefits.length}개</p>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}