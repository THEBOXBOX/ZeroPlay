'use client';

import { ReactNode } from 'react';

interface AppContainerProps {
  children: ReactNode;
}

export default function AppContainer({ children }: AppContainerProps) {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      {/* 앱 컨테이너 - 모바일 크기 */}
      <div className="w-full max-w-sm mx-auto bg-white shadow-2xl rounded-3xl overflow-hidden h-[844px] flex flex-col relative">
        {/* 상태바 시뮬레이션 */}
        <div className="bg-black text-white text-xs py-1 px-4 flex justify-between items-center">
          <span>9:41</span>
          <div className="flex items-center space-x-1">
            <div className="flex space-x-1">
              <div className="w-1 h-1 bg-white rounded-full"></div>
              <div className="w-1 h-1 bg-white rounded-full"></div>
              <div className="w-1 h-1 bg-white rounded-full"></div>
              <div className="w-1 h-1 bg-white rounded-full"></div>
            </div>
            <div className="w-4 h-2 border border-white rounded-sm">
              <div className="w-3 h-1 bg-white rounded-sm"></div>
            </div>
            <div className="w-6 h-3 bg-white rounded-sm"></div>
          </div>
        </div>
        
        {/* 메인 콘텐츠 */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  );
}