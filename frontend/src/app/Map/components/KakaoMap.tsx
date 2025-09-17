// src/app/Map/components/KakaoMap.tsx - 툴팁 위치 계산 추가
'use client';

import { useEffect, useRef } from 'react';
import { LocalSpot, CATEGORY_COLORS } from '../lib/api';

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
  spots?: LocalSpot[];
  onSpotClick?: (spot: LocalSpot, screenPosition?: { x: number; y: number }) => void; // 🔥 screenPosition 추가
}

const KakaoMap = ({
  width = '100%',
  height = '400px',
  level = 3,
  lat = 37.566826,
  lng = 126.9786567,
  onMapClick,
  showCurrentLocation = true,
  spots = [],
  onSpotClick,
}: KakaoMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const clickHandlerRef = useRef<((...args: any[]) => void) | null>(null);
  const currentMarkerRef = useRef<any>(null);
  const currentInfoRef = useRef<any>(null);
  const spotMarkersRef = useRef<any[]>([]);

  /** 지도 생성: 마운트 시 1번만 */
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
  }, []);

  /** 좌표/레벨 바뀔 때 지도 상태만 업데이트 */
  useEffect(() => {
    if (!mapRef.current) return;
    const nextCenter = new window.kakao.maps.LatLng(lat, lng);
    mapRef.current.setCenter(nextCenter);
    if (typeof level === 'number') {
      mapRef.current.setLevel(level);
    }
  }, [lat, lng, level]);

  /** 클릭 핸들러 부착/해제 */
  useEffect(() => {
    if (!mapRef.current) return;

    if (!onMapClick) {
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

  // 🔥 지도 좌표를 화면 좌표로 변환하는 함수
  const getScreenPosition = (latLng: any): { x: number; y: number } | null => {
    if (!mapRef.current || !mapContainer.current) return null;

    try {
      // 카카오맵 projection 사용해서 화면 좌표 계산
      const projection = mapRef.current.getProjection();
      const point = projection.pointFromCoords(latLng);
      
      // 지도 컨테이너의 절대 위치 계산
      const mapRect = mapContainer.current.getBoundingClientRect();
      
      return {
        x: mapRect.left + point.x,
        y: mapRect.top + point.y
      };
    } catch (error) {
      console.warn('화면 좌표 계산 실패:', error);
      return null;
    }
  };

  // 🔥 핀 생성 함수
  const createSpotMarker = (spot: LocalSpot) => {
    const color = CATEGORY_COLORS[spot.category];
    const categoryText = {
      experience: 'EX',
      culture: 'CU', 
      restaurant: 'RE',
      cafe: 'CA',
    }[spot.category];

    const svgContent = `
      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="35" viewBox="0 0 28 35">
        <path d="M14 0C6.268 0 0 6.268 0 14c0 14 14 21 14 21s14-7 14-21C28 6.268 21.732 0 14 0z" fill="${color}"/>
        <circle cx="14" cy="14" r="7" fill="white"/>
        <text x="14" y="17" text-anchor="middle" font-size="5" font-weight="bold" fill="${color}">${categoryText}</text>
      </svg>
    `;

    const imageSrc = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgContent);
    const size = new window.kakao.maps.Size(28, 35);
    const offset = new window.kakao.maps.Point(14, 35);
    
    return new window.kakao.maps.MarkerImage(imageSrc, size, { offset });
  };

  // 🔥 스팟 핀 표시
  useEffect(() => {
    if (!mapRef.current) return;

    console.log('🔄 [KakaoMap] 핀 업데이트 시작:', spots.length, '개');

    // 기존 스팟 마커들 제거
    spotMarkersRef.current.forEach(marker => marker.setMap(null));
    spotMarkersRef.current = [];

    // 새로운 스팟 마커들 생성
    spots.forEach((spot) => {
      try {
        const position = new window.kakao.maps.LatLng(spot.latitude, spot.longitude);
        const markerImage = createSpotMarker(spot);
        
        const marker = new window.kakao.maps.Marker({
          position,
          image: markerImage,
          title: spot.name,
        });

        marker.setMap(mapRef.current);
        spotMarkersRef.current.push(marker);

        // 🔥 마커 클릭 이벤트 - 화면 좌표 계산 포함
        window.kakao.maps.event.addListener(marker, 'click', () => {
          console.log('📍 [KakaoMap] 스팟 클릭:', spot.name);
          
          if (onSpotClick) {
            // 화면 좌표 계산
            const screenPosition = getScreenPosition(position);
            
            if (screenPosition) {
              console.log('🎯 [KakaoMap] 화면 좌표:', screenPosition);
              onSpotClick(spot, screenPosition);
            } else {
              // 좌표 계산 실패 시 화면 중앙에 표시
              const fallbackPosition = {
                x: window.innerWidth / 2,
                y: window.innerHeight / 2
              };
              console.warn('⚠️ [KakaoMap] 좌표 계산 실패 - 중앙에 표시');
              onSpotClick(spot, fallbackPosition);
            }
          }
        });

        console.log('📍 [KakaoMap] 스팟 마커 생성:', spot.name, spot.category);
      } catch (err) {
        console.error('❌ [KakaoMap] 스팟 마커 생성 실패:', spot.name, err);
      }
    });

    console.log('✅ [KakaoMap] 핀 업데이트 완료:', spotMarkersRef.current.length, '개');
  }, [spots, onSpotClick]);

  return (
    <div ref={mapContainer} style={{ width, height }} className="rounded-lg" />
  );
};

export default KakaoMap;