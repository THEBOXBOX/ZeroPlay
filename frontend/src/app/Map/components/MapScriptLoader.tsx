'use client';

import { useEffect, useState } from 'react';

interface MapScriptLoaderProps {
  children: React.ReactNode;
}

const MapScriptLoader = ({ children }: MapScriptLoaderProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 이미 로드되어 있는지 확인
    if (window.kakao && window.kakao.maps) {
      setIsLoaded(true);
      return;
    }

    const apiKey = process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY;
    
    if (!apiKey) {
      setError('카카오맵 API 키가 설정되지 않았습니다.');
      return;
    }

    // 스크립트 태그 생성
    const script = document.createElement('script');
    script.async = true;
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${apiKey}&autoload=false`;
    
    // 스크립트 로드 완료 처리
    script.onload = () => {
      window.kakao.maps.load(() => {
        setIsLoaded(true);
        console.log('✅ 카카오맵 API 로드 완료');
      });
    };

    // 스크립트 로드 실패 처리
    script.onerror = () => {
      setError('카카오맵 API 로드에 실패했습니다.');
    };

    document.head.appendChild(script);

    // 컴포넌트 언마운트 시 스크립트 제거
    return () => {
      const existingScript = document.querySelector(`script[src*="dapi.kakao.com"]`);
      if (existingScript) {
        document.head.removeChild(existingScript);
      }
    };
  }, []);

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 bg-red-50 border border-red-200 rounded-lg">
        <div className="text-center">
          <p className="text-red-600 font-semibold">❌ 지도 로드 오류</p>
          <p className="text-red-500 text-sm mt-1">{error}</p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 border border-gray-200 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-2">🗺️ 지도 로딩 중...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default MapScriptLoader;