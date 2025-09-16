'use client';
import { useEffect, useState } from 'react';

declare global {
  interface Window {
    kakao: any;
  }
}

export function useKakaoSdk() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // 이미 로드되어 있으면 즉시 true
    if (window.kakao?.maps) {
      setLoaded(true);
      return;
    }

    // 스크립트 중복 방지
    const EXISTING_ID = 'kakao-maps-sdk';
    const existing = document.getElementById(EXISTING_ID);

    const waitForMaps = () => {
      const t = setInterval(() => {
        if (window.kakao?.maps) {
          clearInterval(t);
          setLoaded(true);
        }
      }, 50);
      return () => clearInterval(t);
    };

    if (existing) {
      return waitForMaps();
    }

    const script = document.createElement('script');
    script.id = EXISTING_ID;
    script.async = true;
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_APPKEY}&autoload=false`;
    script.onload = () => {
      // autoload=false이므로 여기서 load 콜백 호출
      // @ts-ignore
      window.kakao.maps.load(() => {
        setLoaded(true);
      });
    };
    script.onerror = () => {
      console.error('카카오맵 SDK 로드 실패');
    };
    document.head.appendChild(script);
  }, []);

  return loaded;
}