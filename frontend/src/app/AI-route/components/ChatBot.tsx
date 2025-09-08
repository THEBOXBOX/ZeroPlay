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
      content: '안녕하세요! 🎒 AI 여행 코스 추천 서비스입니다. 어떤 여행을 계획하고 계신가요?',
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
            title: '부산 감성 여행 코스',
            duration: '2박 3일',
            places: [
              { name: '해운대 해수욕장', type: 'attraction', duration: '2시간' },
              { name: '감천문화마을', type: 'culture', duration: '3시간' },
              { name: '자갈치시장', type: 'food', duration: '1시간' }
            ]
          });
        }, 2000);
      }
    }, 1000 + Math.random() * 2000);
  };

  const getAIResponse = (userInput: string): string => {
    const responses = [
      '좋은 선택이네요! 더 구체적인 정보를 알려주시면 맞춤 코스를 추천해드릴게요.',
      '그 지역은 정말 멋진 곳이에요! 어떤 컨셉의 여행을 원하시나요?',
      '예산과 동행인에 대해서도 알려주시면 더 정확한 추천이 가능해요.',
      '잠시만요, 최적의 여행 코스를 찾고 있어요! 🔍',
      '완벽한 여행 코스를 생성했어요! 결과 탭에서 확인해보세요.'
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
    // 자동으로 전송
    setTimeout(() => {
      if (question === inputValue) { // 값이 정상적으로 설정되었는지 확인
        handleSendMessage();
      }
    }, 100);
  };

  const quickQuestions = [
    '부산 2박 3일 코스 추천해줘',
    '제주도 맛집 여행 코스',
    '서울 데이트 코스 추천',
    '경주 역사 문화 여행'
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
            <div
              className={`max-w-[85%] px-4 py-3 rounded-2xl ${
                message.type === 'user'
                  ? 'bg-blue-500 text-white rounded-br-md'
                  : 'bg-gray-100 text-gray-800 rounded-bl-md'
              }`}
            >
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {message.content}
              </p>
              <span className={`text-xs opacity-70 mt-2 block ${
                message.type === 'user' ? 'text-right' : 'text-left'
              }`}>
                {message.timestamp.toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </span>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 px-4 py-3 rounded-2xl rounded-bl-md">
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

      {/* 빠른 질문 버튼들 */}
      {messages.length === 1 && (
        <div className="px-4 pb-3 border-t bg-gray-50">
          <p className="text-sm font-medium text-gray-700 mb-3 pt-3">💡 빠른 질문을 선택해보세요</p>
          <div className="space-y-2">
            {quickQuestions.map((question, index) => (
              <button
                key={index}
                onClick={() => handleQuickQuestion(question)}
                className="w-full text-left bg-white hover:bg-blue-50 px-4 py-3 rounded-xl transition-colors border border-gray-200 shadow-sm min-h-[48px] flex items-center"
              >
                <span className="mr-3 text-blue-500">💬</span>
                <span className="text-sm text-gray-700">{question}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 입력 영역 */}
      <div className="border-t bg-white p-4 pb-6">
        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="여행 계획을 알려주세요..."
              className="w-full border border-gray-300 rounded-full px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[48px] resize-none"
              disabled={isLoading}
            />
          </div>
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
            className="bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center min-w-[48px] min-h-[48px] shadow-lg"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
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