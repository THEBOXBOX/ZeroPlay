'use client';

import { useState, useRef, useEffect } from 'react';

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
}

interface ChatBotProps {
  onRouteGenerated?: (routeData: any) => void;
}

export default function ChatBot({ onRouteGenerated }: ChatBotProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'bot',
      content: '안녕하세요! 🎒\nAI 여행 추천 서비스입니다.\n어떤 여행을 계획하고 계신가요?',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    // 키보드 숨기기
    if (inputRef.current) {
      inputRef.current.blur();
    }

    // AI 응답 시뮬레이션
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: getAIResponse(inputValue),
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botResponse]);
      setIsLoading(false);

      // 코스 생성 시뮬레이션
      if (inputValue.includes('추천') || inputValue.includes('코스')) {
        setTimeout(() => {
          onRouteGenerated?.({
            id: Date.now(),
            title: '속초 맛집 투어 코스',
            duration: '8시간',
            totalBudget: 75000,
            places: [
              { 
                name: '강릉 커피 빌리지', 
                type: 'cafe', 
                duration: '2시간',
                cost: 12000,
                description: '바다를 보며 즐기는 프리미엄 커피'
              },
              { 
                name: '안목해변 카페거리', 
                type: 'cafe', 
                duration: '1시간 30분',
                cost: 8000,
                description: '커피와 바다가 만나는 로맨틱 카페거리'
              },
              { 
                name: '속초 중앙시장', 
                type: 'food', 
                duration: '3시간',
                cost: 25000,
                description: '속초의 신선한 해산물과 전통 음식'
              },
              { 
                name: '테라로사 강릉본점', 
                type: 'cafe', 
                duration: '1시간 30분',
                cost: 25000,
                description: '강릉을 대표하는 스페셜티 커피 성지'
              }
            ],
            highlights: ['맛집투어', '카페', '바다뷰', '포토스팟'],
            difficulty: 'easy'
          });
        }, 2000);
      }
    }, 1000 + Math.random() * 2000);
  };

  const getAIResponse = (userInput: string): string => {
    const responses = [
      '좋은 선택이네요! 🎯\n더 구체적인 정보를 알려주시면\n맞춤 코스를 추천해드릴게요.',
      '그 지역은 정말 멋진 곳이에요! ✨\n어떤 컨셉의 여행을 원하시나요?\n(맛집, 카페, 관광, 힐링 등)',
      '예산과 동행인에 대해서도\n알려주시면 더 정확한\n추천이 가능해요! 💡',
      '잠시만요, 최적의 여행 코스를\n찾고 있어요! 🔍\n곧 완성될 예정입니다.',
      '완벽한 여행 코스를 생성했어요! 🎉\n하단의 [추천 결과] 탭에서\n확인해보세요!'
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleQuickQuestion = (question: string) => {
    setInputValue(question);
    setTimeout(() => {
      handleSendMessage();
    }, 100);
  };

  const quickQuestions = [
    '무엇을 도와드릴까요?',
    '새로운 여행 계획을 세우려고 합니다',
    '무엇을 도와드릴까요?',
    '무엇을 도와드릴까요?',
    '새로운 여행 계획을 세우려고 합니다',
    '무엇을 도와드릴까요?',
    '새로운 여행 계획을 세우려고 합니다'
  ];

  return (
    <div className="h-full bg-white flex flex-col">
      
      {/* 메시지 영역 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {/* 봇 아바타 */}
            {message.type === 'bot' && (
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-3 flex-shrink-0 mt-1">
                <span className="text-white text-sm">🤖</span>
              </div>
            )}
            
            <div
              className={`max-w-[75%] px-4 py-3 rounded-2xl ${
                message.type === 'user'
                  ? 'bg-blue-500 text-white rounded-br-md shadow-md'
                  : 'bg-gray-100 text-gray-800 rounded-bl-md border'
              }`}
            >
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {message.content}
              </p>
              <span className={`text-xs opacity-70 mt-2 block ${
                message.type === 'user' ? 'text-right text-blue-100' : 'text-left text-gray-500'
              }`}>
                {message.timestamp.toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </span>
            </div>

            {/* 유저 아바타 */}
            {message.type === 'user' && (
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center ml-3 flex-shrink-0 mt-1">
                <span className="text-white text-sm">👤</span>
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
              <span className="text-white text-sm">🤖</span>
            </div>
            <div className="bg-gray-100 px-4 py-3 rounded-2xl rounded-bl-md border">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 빠른 응답 버튼들 - 와이어프레임의 3번째 이미지 참고 */}
      <div className="px-4 py-3 bg-gray-50 border-t">
        <div className="space-y-2">
          {quickQuestions.slice(0, Math.min(4, quickQuestions.length)).map((question, index) => (
            <div key={index} className="flex justify-between items-center">
              {index % 2 === 0 ? (
                // 좌측 버튼 (봇)
                <>
                  <button
                    onClick={() => handleQuickQuestion(question)}
                    className="bg-white hover:bg-gray-50 px-4 py-3 rounded-2xl transition-colors border shadow-sm flex items-center max-w-[75%]"
                  >
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center mr-2 flex-shrink-0">
                      <span className="text-white text-xs">🤖</span>
                    </div>
                    <span className="text-sm text-gray-700 text-left">{question}</span>
                  </button>
                  <div className="w-8 h-8"></div> {/* 우측 공간 */}
                </>
              ) : (
                // 우측 버튼 (유저)
                <>
                  <div className="w-8 h-8"></div> {/* 좌측 공간 */}
                  <button
                    onClick={() => handleQuickQuestion(question)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-2xl transition-colors shadow-sm flex items-center max-w-[75%]"
                  >
                    <span className="text-sm text-left">{question}</span>
                    <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center ml-2 flex-shrink-0">
                      <span className="text-blue-500 text-xs">👤</span>
                    </div>
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 입력 영역 */}
      <div className="bg-white p-4 border-t">
        <div className="bg-gray-100 rounded-2xl p-2 flex items-center gap-3">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="AI 코스 추천 받기"
            className="flex-1 bg-transparent px-3 py-2 text-base focus:outline-none placeholder-gray-500"
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
            className="bg-blue-500 text-white rounded-xl hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center w-10 h-10 shadow-sm"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}