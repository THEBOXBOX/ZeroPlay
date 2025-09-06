'use client';

import { useState } from 'react';
import FilterButtons from './components/FilterButtons';
import ChatBot from './components/ChatBot';
import RouteResults from './components/RouteResults';

export interface FilterState {
  budget: string;
  duration: string;
  companions: string;
  interests: string[];
  region: string;
}

export interface ChatMessage {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  routes?: RouteRecommendation[];
}

export interface RouteRecommendation {
  id: string;
  title: string;
  duration: string;
  totalBudget: number;
  places: Array<{
    id: string;
    name: string;
    type: string;
    duration: string;
    cost: number;
    description: string;
  }>;
  highlights: string[];
  difficulty: 'easy' | 'moderate' | 'hard';
}

export default function AIRoutePage() {
  const [filters, setFilters] = useState<FilterState>({
    budget: '',
    duration: '',
    companions: '',
    interests: [],
    region: ''
  });

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'bot',
      content: '안녕하세요! 🎒 AI 여행 코스 추천 서비스입니다. 어떤 여행을 계획하고 계신가요?',
      timestamp: new Date()
    }
  ]);

  const [currentRoutes, setCurrentRoutes] = useState<RouteRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    // 필터 변경 시 AI에게 알림 메시지 추가
    const filterMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: `필터 설정: ${Object.entries(newFilters)
        .filter(([_, value]) => value && (Array.isArray(value) ? value.length > 0 : true))
        .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
        .join(', ')}`,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, filterMessage]);
    
    // AI 응답 시뮬레이션
    setTimeout(() => {
      const botResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: '설정해주신 조건에 맞는 여행 코스를 찾아보겠습니다! 더 구체적인 요청사항이 있으시면 말씀해 주세요.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botResponse]);
    }, 1000);
  };

  const handleSendMessage = async (message: string) => {
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: message,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    // AI 응답 시뮬레이션 (실제로는 API 호출)
    setTimeout(() => {
      // 샘플 루트 데이터
      const sampleRoutes: RouteRecommendation[] = [
        {
          id: '1',
          title: '강릉 바다 힐링 코스',
          duration: '1박 2일',
          totalBudget: 85000,
          places: [
            {
              id: '1',
              name: '강릉 안목해변',
              type: 'ATTRACTION',
              duration: '2시간',
              cost: 0,
              description: '커피거리와 함께 즐기는 해변'
            },
            {
              id: '2',
              name: '테라로사 커피공장',
              type: 'CAFE',
              duration: '1시간',
              cost: 15000,
              description: '유명 로스터리 카페'
            },
            {
              id: '3',
              name: '강릉중앙시장',
              type: 'RESTAURANT',
              duration: '1.5시간',
              cost: 25000,
              description: '현지 맛집 투어'
            }
          ],
          highlights: ['바다뷰', '커피투어', '로컬맛집'],
          difficulty: 'easy'
        },
        {
          id: '2',
          title: '속초 자연 탐방 코스',
          duration: '당일',
          totalBudget: 65000,
          places: [
            {
              id: '4',
              name: '설악산 국립공원',
              type: 'PARK',
              duration: '4시간',
              cost: 3000,
              description: '자연 트레킹 코스'
            },
            {
              id: '5',
              name: '속초해수욕장',
              type: 'ATTRACTION',
              duration: '2시간',
              cost: 0,
              description: '해변 산책과 휴식'
            }
          ],
          highlights: ['자연탐방', '트레킹', '힐링'],
          difficulty: 'moderate'
        }
      ];

      const botResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: '조건에 맞는 여행 코스를 찾았습니다! 아래 추천 코스들을 확인해보세요.',
        timestamp: new Date(),
        routes: sampleRoutes
      };

      setMessages(prev => [...prev, botResponse]);
      setCurrentRoutes(sampleRoutes);
      setIsLoading(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">🤖 AI 여행 코스 추천</h1>
              <p className="text-sm text-gray-600 mt-1">
                AI가 당신만을 위한 맞춤 여행 코스를 제안해드립니다
              </p>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              <span>AI 연결됨</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-140px)]">
          
          {/* Left Panel - Filters */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 h-full">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <span className="w-5 h-5 bg-indigo-100 rounded-full flex items-center justify-center mr-2">
                  ⚙️
                </span>
                여행 조건 설정
              </h2>
              <FilterButtons 
                filters={filters} 
                onFilterChange={handleFilterChange}
              />
            </div>
          </div>

          {/* Right Panel - Chat & Results */}
          <div className="lg:col-span-2 flex flex-col space-y-4">
            
            {/* Results Section */}
            {currentRoutes.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6 flex-1 overflow-auto">
                <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <span className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mr-2">
                    🗺️
                  </span>
                  추천 코스
                </h2>
                <RouteResults routes={currentRoutes} />
              </div>
            )}

            {/* Chat Section */}
            <div className="bg-white rounded-xl shadow-lg flex flex-col h-96">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                  <span className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center mr-2">
                    💬
                  </span>
                  AI 여행 어시스턴트
                </h2>
              </div>
              
              <ChatBot
                messages={messages}
                onSendMessage={handleSendMessage}
                isLoading={isLoading}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}