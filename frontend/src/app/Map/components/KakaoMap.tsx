'use client';

import { useEffect, useRef } from 'react';

interface KakaoMapProps {
  width?: string;
  height?: string;
  level?: number;
  lat?: number;
  lng?: number;
}

const KakaoMap = ({ 
  width = '100%', 
  height = '400px', 
  level = 3,
  lat = 37.566826, // 서울 시청 기본 좌표
  lng = 126.9786567 
}: KakaoMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);

  useEffect(() => {
    // 카카오맵 스크립트 로드 확인
    if (!window.kakao || !window.kakao.maps) {
      console.error('카카오맵 API가 로드되지 않았습니다.');
      return;
    }

    // 지도 옵션 설정
    const options = {
      center: new window.kakao.maps.LatLng(lat, lng),
      level: level
    };

    // 지도 생성
    if (mapContainer.current) {
      map.current = new window.kakao.maps.Map(mapContainer.current, options);
      
      console.log('✅ 카카오맵 생성 완료!');
      
      // 현재 위치 마커 추가 (시청 위치)
      const markerPosition = new window.kakao.maps.LatLng(lat, lng);
      const marker = new window.kakao.maps.Marker({
        position: markerPosition
      });
      marker.setMap(map.current);
      
      // 정보창 추가
      const infowindow = new window.kakao.maps.InfoWindow({
        content: '<div style="padding:5px;">📍 서울시청 (테스트 위치)</div>'
      });
      infowindow.open(map.current, marker);
    }
  }, [lat, lng, level]);

  return (
    <div 
      ref={mapContainer} 
      style={{ width, height }}
      className="rounded-lg border border-gray-200"
    />
  );
};

export default KakaoMap;