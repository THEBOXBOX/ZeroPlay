'use client';

import { useState, useEffect } from 'react';

interface MapBookmarksProps {
  sessionId: string;
  onCountChange?: (count: number) => void;
}

export default function MapBookmarks({ sessionId, onCountChange }: MapBookmarksProps) {
  const [bookmarks, setBookmarks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // TODO: 팀원이 구현한 map API 연동
    // 예시 코드:
    // const loadMapBookmarks = async () => {
    //   try {
    //     const response = await ApiClient.getMapBookmarks(sessionId);
    //     if (response.success) {
    //       setBookmarks(response.data.bookmarks);
    //       onCountChange?.(response.data.count);
    //     }
    //   } catch (error) {
    //     console.error('지도 북마크 로드 실패:', error);
    //   } finally {
    //     setIsLoading(false);
    //   }
    // };
    // loadMapBookmarks();

    // 임시로 로딩 완료 처리
    setTimeout(() => {
      setIsLoading(false);
      onCountChange?.(0); // 임시로 0개
    }, 1000);
  }, [sessionId, onCountChange]);

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border p-8 text-center">
        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">지도 북마크를 불러오는 중...</p>
      </div>
    );
  }

  // 임시 구현 - 팀원 구현 후 실제 데이터로 교체
  return (
    <div className="bg-white rounded-2xl shadow-sm border p-8 text-center">
      <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <span className="text-2xl text-purple-500">📍</span>
      </div>
      <h3 className="text-lg font-bold text-gray-900 mb-2">지도 장소 북마크</h3>
      <p className="text-sm text-gray-600 mb-6">
        곧 지도 장소 북마크 기능이<br />
        추가될 예정입니다!
      </p>
      
      {/* 개발 상태 표시 */}
      <div className="bg-purple-50 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-center mb-2">
          <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse mr-2"></span>
          <span className="text-xs font-medium text-purple-700">개발 진행중</span>
        </div>
        <p className="text-xs text-purple-600">
          팀원이 지도 기능을 구현하면<br />
          자동으로 북마크 기능이 연동됩니다
        </p>
      </div>

      {/* 예상 기능 미리보기 */}
      <div className="text-left space-y-3">
        <div className="bg-gray-50 rounded-lg p-3 opacity-50">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-gray-800">경복궁</span>
            <span className="text-xs text-gray-500">🏛️ 관광명소</span>
          </div>
          <p className="text-xs text-gray-600">서울시 종로구 • 평점 4.5</p>
          <div className="flex items-center mt-2">
            <span className="text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded-full mr-2">역사</span>
            <span className="text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded-full">전통</span>
          </div>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-3 opacity-50">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-gray-800">홍대 걷고싶은거리</span>
            <span className="text-xs text-gray-500">🎭 핫플레이스</span>
          </div>
          <p className="text-xs text-gray-600">서울시 마포구 • 평점 4.2</p>
          <div className="flex items-center mt-2">
            <span className="text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded-full mr-2">젊음</span>
            <span className="text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded-full">문화</span>
          </div>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-3 opacity-50">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-gray-800">북촌한옥마을</span>
            <span className="text-xs text-gray-500">📸 포토스팟</span>
          </div>
          <p className="text-xs text-gray-600">서울시 종로구 • 평점 4.3</p>
          <div className="flex items-center mt-2">
            <span className="text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded-full mr-2">한옥</span>
            <span className="text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded-full">사진</span>
          </div>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-3 opacity-50">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-gray-800">망원한강공원</span>
            <span className="text-xs text-gray-500">🌳 자연명소</span>
          </div>
          <p className="text-xs text-gray-600">서울시 마포구 • 평점 4.4</p>
          <div className="flex items-center mt-2">
            <span className="text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded-full mr-2">한강</span>
            <span className="text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded-full">피크닉</span>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-3 opacity-50">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-gray-800">이태원 앤틱가구거리</span>
            <span className="text-xs text-gray-500">🛍️ 쇼핑</span>
          </div>
          <p className="text-xs text-gray-600">서울시 용산구 • 평점 4.1</p>
          <div className="flex items-center mt-2">
            <span className="text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded-full mr-2">앤틱</span>
            <span className="text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded-full">빈티지</span>
          </div>
        </div>
      </div>

      {/* 팀원 구현 완료 후 예상되는 실제 기능들 */}
      <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100">
        <h4 className="text-sm font-bold text-purple-800 mb-3">🔮 구현 예정 기능</h4>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="bg-white/60 rounded-lg p-2">
            <div className="text-purple-700 font-medium mb-1">📌 장소 저장</div>
            <div className="text-purple-600">지도에서 관심 장소 북마크</div>
          </div>
          <div className="bg-white/60 rounded-lg p-2">
            <div className="text-purple-700 font-medium mb-1">🏷️ 태그 관리</div>
            <div className="text-purple-600">카테고리별 분류 저장</div>
          </div>
          <div className="bg-white/60 rounded-lg p-2">
            <div className="text-purple-700 font-medium mb-1">📍 위치 정보</div>
            <div className="text-purple-600">정확한 주소와 좌표</div>
          </div>
          <div className="bg-white/60 rounded-lg p-2">
            <div className="text-purple-700 font-medium mb-1">⭐ 개인 평점</div>
            <div className="text-purple-600">나만의 후기와 평점</div>
          </div>
        </div>
      </div>

      {/* 개발 진행 상황 */}
      <div className="mt-6 text-xs text-purple-600 bg-purple-50 px-3 py-2 rounded-lg">
        <div className="flex items-center justify-center mb-1">
          <span className="text-purple-500 mr-1">⚡</span>
          <span className="font-medium">팀원 구현 완료 후 실제 데이터로 교체 예정</span>
        </div>
        <p className="text-purple-500">
          지도 기능과 완전히 연동되어 저장된 장소를 관리할 수 있습니다
        </p>
      </div>

      {/* CTA 버튼 */}
      <div className="mt-6">
        <button
          onClick={() => {
            // 지도 페이지로 이동 (팀원 구현 후)
            alert('지도 기능 구현 완료 후 이용 가능합니다!');
          }}
          className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all opacity-50 cursor-not-allowed"
          disabled
        >
          지도에서 장소 찾기 🗺️
        </button>
      </div>
    </div>
  );
}