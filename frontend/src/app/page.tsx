'use client';

import { useState, useEffect } from 'react';

interface TravelRecommendation {
  id: number;
  title: string;
  budget: number;
  duration: string;
  highlights: string[];
}

export default function Home() {
  const [recommendations, setRecommendations] = useState<TravelRecommendation[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/travel/recommend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          budget: 100000,
          interests: ['카페', '바다'],
          duration: '1박 2일',
          companions: '연인'
        }),
      });
      
      const data = await response.json();
      if (data.success) {
        setRecommendations(data.data);
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

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
              <p className="mt-4 text-gray-600">맞춤 여행 코스를 찾고 있어요...</p>
            </div>
          ) : (
            recommendations.map((rec) => (
              <div key={rec.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                <h3 className="text-xl font-semibold text-gray-800 mb-3">
                  {rec.title}
                </h3>
                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <p>💰 예산: {rec.budget.toLocaleString()}원</p>
                  <p>⏰ 기간: {rec.duration}</p>
                </div>
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">하이라이트:</p>
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
          )}
        </div>

        <section className="mt-16 bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            🎁 청년 전용 혜택 정보
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
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
          </div>
        </section>
      </div>
    </main>
  );
}