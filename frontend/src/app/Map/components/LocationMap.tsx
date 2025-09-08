'use client';

import { useEffect, useRef, useState } from 'react';

interface LocationMapProps {
  width?: string;
  height?: string;
  level?: number;
}

interface UserLocation {
  lat: number;
  lng: number;
}

const LocationMap = ({ 
  width = '100%', 
  height = '500px', 
  level = 3
}: LocationMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const userMarker = useRef<any>(null);
  
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [locationStatus, setLocationStatus] = useState<'idle' | 'requesting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  // 지도 초기화
  useEffect(() => {
    if (!window.kakao || !window.kakao.maps) {
      console.error('카카오맵 API가 로드되지 않았습니다.');
      return;
    }

    // 기본 위치로 지도 생성 (서울 시청)
    const options = {
      center: new window.kakao.maps.LatLng(37.566826, 126.9786567),
      level: level
    };

    if (mapContainer.current) {
      map.current = new window.kakao.maps.Map(mapContainer.current, options);
      console.log('✅ 위치 기능 지도 생성 완료!');
    }
  }, [level]);

  // 현재 위치 요청 함수
  const requestLocation = () => {
    console.log('🔍 위치 요청 시작...');
    console.log('🌐 현재 URL:', window.location.href);
    console.log('🔒 HTTPS 여부:', window.location.protocol === 'https:');
    
    if (!navigator.geolocation) {
      setLocationStatus('error');
      setErrorMessage('이 브라우저는 위치 서비스를 지원하지 않습니다.');
      return;
    }

    setLocationStatus('requesting');
    setErrorMessage('');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const location = { lat: latitude, lng: longitude };
        
        setUserLocation(location);
        setLocationStatus('success');
        
        // 지도 중심을 현재 위치로 이동
        if (map.current) {
          const moveLatLng = new window.kakao.maps.LatLng(latitude, longitude);
          map.current.setCenter(moveLatLng);
          
          // 기존 사용자 마커 제거
          if (userMarker.current) {
            userMarker.current.setMap(null);
          }
          
          // 현재 위치에 파란색 원형 마커 추가
          const circle = new window.kakao.maps.Circle({
            center: moveLatLng,
            radius: 50, // 50미터 반경
            strokeWeight: 2,
            strokeColor: '#0066ff',
            strokeOpacity: 0.8,
            fillColor: '#0066ff',
            fillOpacity: 0.3
          });
          
          circle.setMap(map.current);
          userMarker.current = circle;
          
          // 정보창 추가
          const infowindow = new window.kakao.maps.InfoWindow({
            content: '<div style="padding:5px;">📍 현재 위치</div>',
            position: moveLatLng
          });
          infowindow.open(map.current);
          
          console.log('✅ 현재 위치 표시 완료:', location);
        }
      },
      (error) => {
        setLocationStatus('error');
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setErrorMessage('위치 접근이 거부되었습니다. 브라우저 설정에서 위치 권한을 허용해주세요.');
            break;
          case error.POSITION_UNAVAILABLE:
            setErrorMessage('위치 정보를 사용할 수 없습니다.');
            break;
          case error.TIMEOUT:
            setErrorMessage('위치 요청 시간이 초과되었습니다.');
            break;
          default:
            setErrorMessage('알 수 없는 오류가 발생했습니다.');
            break;
        }
        
        console.error('❌ 위치 요청 실패:', error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  return (
    <div className="space-y-4">
      {/* 위치 요청 컨트롤 */}
      <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
        <div>
          <h3 className="font-semibold text-blue-900">📍 현재 위치 찾기</h3>
          <p className="text-sm text-blue-700">
            {locationStatus === 'idle' && '위치 권한을 허용하면 현재 위치를 지도에 표시합니다.'}
            {locationStatus === 'requesting' && '위치를 찾는 중입니다...'}
            {locationStatus === 'success' && `현재 위치: ${userLocation?.lat.toFixed(6)}, ${userLocation?.lng.toFixed(6)}`}
            {locationStatus === 'error' && '위치 요청에 실패했습니다.'}
          </p>
        </div>
        
        <button
          onClick={requestLocation}
          disabled={locationStatus === 'requesting'}
          className={`px-6 py-3 rounded-lg font-medium transition-colors ${
            locationStatus === 'requesting'
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {locationStatus === 'requesting' ? '🔄 찾는 중...' : '📍 내 위치 찾기'}
        </button>
      </div>

      {/* 에러 메시지 */}
      {locationStatus === 'error' && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 font-semibold">❌ 위치 오류</p>
          <p className="text-red-500 text-sm mt-1">{errorMessage}</p>
          <button
            onClick={requestLocation}
            className="mt-2 text-sm bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition-colors"
          >
            다시 시도
          </button>
        </div>
      )}

      {/* 지도 영역 */}
      <div 
        ref={mapContainer} 
        style={{ width, height }}
        className="rounded-lg border border-gray-200"
      />
    </div>
  );
};

export default LocationMap;