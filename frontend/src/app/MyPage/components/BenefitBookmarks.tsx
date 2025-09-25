'use client';

import { useState, useEffect } from 'react';

interface BenefitBookmarksProps {
  sessionId: string;
  onCountChange?: (count: number) => void;
}

export default function BenefitBookmarks({ sessionId, onCountChange }: BenefitBookmarksProps) {
  const [bookmarks, setBookmarks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // TODO: 팀원이 구현한 benefit API 연동
    // 예시 코드:
    // const loadBenefitBookmarks = async () => {
    //   try {
    //     const response = await ApiClient.getBenefitBookmarks(sessionId);
    //     if (response.success) {
    //       setBookmarks(response.data.bookmarks);
    //       onCountChange?.(response.data.count);
    //     }
    //   } catch (error) {
    //     console.error('혜택 북마크 로드 실패:', error);
    //   } finally {
    //     setIsLoading(false);
    //   }
    // };
    // loadBenefitBookmarks();

    // 임시로 로딩 완료 처리
    setTimeout(() => {
      setIsLoading(false);
      onCountChange?.(0); // 임시로 0개
    }, 1000);
  }, [sessionId, onCountChange]);

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border p-8 text-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">청년혜택 북마크를 불러오는 중...</p>
      </div>
    );
  }

  // 임시 구현 - 팀원 구현 후 실제 데이터로 교체
  return (
    <div className="bg-white rounded-2xl shadow-sm border p-8 text-center">
      <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <span className="text-2xl text-blue-500">🎯</span>
      </div>
      <h3 className="text-lg font-bold text-gray-900 mb-2">청년혜택 북마크</h3>
      <p className="text-sm text-gray-600 mb-6">
        곧 청년혜택 북마크 기능이<br />
        추가될 예정입니다!
      </p>
      
      {/* 개발 상태 표시 */}
      <div className="bg-blue-50 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-center mb-2">
          <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse mr-2"></span>
          <span className="text-xs font-medium text-blue-700">개발 진행중</span>
        </div>
        <p className="text-xs text-blue-600">
          팀원이 청년혜택 기능을 구현하면<br />
          자동으로 북마크 기능이 연동됩니다
        </p>
      </div>

      {/* 예상 기능 미리보기 */}
      <div className="text-left space-y-3">
        <div className="bg-gray-50 rounded-lg p-3 opacity-50">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-gray-800">청년내일채움공제</span>
            <span className="text-xs text-gray-500">💰 300만원</span>
          </div>
          <p className="text-xs text-gray-600">만 34세 이하 구직자 지원</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3 opacity-50">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-gray-800">청년도약계좌</span>
            <span className="text-xs text-gray-500">💳 적금</span>
          </div>
          <p className="text-xs text-gray-600">5년 만기 청년 전용 적금</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3 opacity-50">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-gray-800">K-패스 할인</span>
            <span className="text-xs text-gray-500">🚌 교통비</span>
          </div>
          <p className="text-xs text-gray-600">대중교통 20-53% 할인</p>
        </div>
      </div>

      <div className="mt-6 text-xs text-blue-600 bg-blue-50 px-3 py-2 rounded-lg">
        팀원 구현 완료 후 실제 데이터로 교체 예정
      </div>
    </div>
  );
}