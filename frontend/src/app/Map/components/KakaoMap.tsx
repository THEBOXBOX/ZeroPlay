'use client';

import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    kakao: any;
    moveToCurrentLocation?: () => void;
  }
}

interface KakaoMapProps {
  width?: string;
  height?: string;
  level?: number;
  lat?: number;
  lng?: number;
  onMapClick?: () => void;
  showCurrentLocation?: boolean;
}

const KakaoMap = ({
  width = '100%',
  height = '400px',
  level = 3,
  lat = 37.566826,
  lng = 126.9786567,
  onMapClick,
  showCurrentLocation = true,
}: KakaoMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const clickHandlerRef = useRef<((...args: any[]) => void) | null>(null);
  const currentMarkerRef = useRef<any>(null);      // 현재위치 마커 보관(중복 방지)
  const currentInfoRef = useRef<any>(null);        // 현재위치 인포윈도우 보관

  /** 1) 지도 생성: 마운트 시 1번만 */
  useEffect(() => {
    const initializeMap = () => {
      if (!mapContainer.current) return;

      const center = new window.kakao.maps.LatLng(lat, lng);
      const options = { center, level };
      mapRef.current = new window.kakao.maps.Map(mapContainer.current, options);
      const map = mapRef.current;

      console.log('✅ 카카오맵 생성 완료!');

      // 현재 위치 표시(초기 1회)
      if (showCurrentLocation && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const cLat = position.coords.latitude;
            const cLng = position.coords.longitude;
            const pos = new window.kakao.maps.LatLng(cLat, cLng);

            const imageSrc =
              'data:image/svg+xml;base64,' +
              btoa(`
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20">
                  <circle cx="10" cy="10" r="8" fill="#4285F4" stroke="#ffffff" stroke-width="2"/>
                  <circle cx="10" cy="10" r="3" fill="#ffffff"/>
                </svg>
              `);
            const size = new window.kakao.maps.Size(20, 20);
            const img = new window.kakao.maps.MarkerImage(imageSrc, size);

            // 중복 생성 방지
            if (!currentMarkerRef.current) {
              currentMarkerRef.current = new window.kakao.maps.Marker({ position: pos, image: img });
              currentMarkerRef.current.setMap(map);
            }
            if (!currentInfoRef.current) {
              currentInfoRef.current = new window.kakao.maps.InfoWindow({
                content: '<div style="padding:5px;font-size:12px;">📱 현재 위치</div>',
              });
              currentInfoRef.current.open(map, currentMarkerRef.current);
            }
          },
          (err) => console.log('위치 정보를 가져올 수 없습니다:', err.message)
        );
      }

      // GPS 버튼용 전역 함수
      window.moveToCurrentLocation = () => {
        if (!mapRef.current || !navigator.geolocation) return;
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const move = new window.kakao.maps.LatLng(position.coords.latitude, position.coords.longitude);
            mapRef.current.setCenter(move);
            console.log('🎯 현재 위치로 이동!');
          },
          (error) => alert('위치 정보를 가져올 수 없습니다: ' + error.message)
        );
      };
    };

    const tryLoad = () => {
      if (window.kakao?.maps?.load) {
        window.kakao.maps.load(initializeMap);
        return true;
      }
      return false;
    };

    if (!tryLoad()) {
      const id = setInterval(() => {
        if (tryLoad()) clearInterval(id);
      }, 50);
      return () => clearInterval(id);
    }

    return () => {
      if (mapRef.current && clickHandlerRef.current) {
        window.kakao.maps.event.removeListener(mapRef.current, 'click', clickHandlerRef.current);
      }
      window.moveToCurrentLocation = undefined;
      mapRef.current = null;
      clickHandlerRef.current = null;
      currentMarkerRef.current = null;
      currentInfoRef.current = null;
    };
  }, []); // ✅ 지도는 한 번만 생성

  /** 2) 좌표/레벨 바뀔 때 지도 상태만 업데이트 (재생성 X) */
  useEffect(() => {
    if (!mapRef.current) return;
    const nextCenter = new window.kakao.maps.LatLng(lat, lng);
    mapRef.current.setCenter(nextCenter);
    if (typeof level === 'number') {
      mapRef.current.setLevel(level);
    }
  }, [lat, lng, level]);

  /** 3) 클릭 핸들러는 별도로 부착/해제 */
  useEffect(() => {
    if (!mapRef.current) return;

    if (!onMapClick) {
      // 기존 핸들러 제거
      if (clickHandlerRef.current) {
        window.kakao.maps.event.removeListener(mapRef.current, 'click', clickHandlerRef.current);
        clickHandlerRef.current = null;
      }
      return;
    }

    const handler = () => onMapClick();
    clickHandlerRef.current = handler;
    window.kakao.maps.event.addListener(mapRef.current, 'click', handler);

    return () => {
      if (clickHandlerRef.current) {
        window.kakao.maps.event.removeListener(mapRef.current, 'click', clickHandlerRef.current);
        clickHandlerRef.current = null;
      }
    };
  }, [onMapClick]);

  return (
    <div ref={mapContainer} style={{ width, height }} className="rounded-lg" />
  );
};

export default KakaoMap;