'use client';

import { useEffect, useRef, useState } from 'react';

interface UnifiedMapProps {
  width?: string;
  height?: string;
  level?: number;
}

interface UserLocation {
  lat: number;
  lng: number;
}

const UnifiedMap = ({ 
  width = '100%', 
  height = '500px', 
  level = 3
}: UnifiedMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const userMarker = useRef<any>(null);
  const seoulMarker = useRef<any>(null);
  
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [locationStatus, setLocationStatus] = useState<'idle' | 'requesting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  // 지도 초기화 + 서울시청 마커
  useEffect(() => {
    if (!window.kakao || !window.kakao.maps) {
      console.error('카카오맵 API가 로드되지 않았습니다.');
      return;
    }

    // 서울 시청 중심으로 지도 생성
    const options = {
      center: new window.kakao.maps.LatLng(37.566826, 126.9786567),
      level: level
    };

    if (mapContainer.current) {
      map.current = new window.kakao.maps.Map(mapContainer.current, options);
      console.log('✅ 통합 지도 생성 완료!');
      
      // 서울시청 마커 추가 (MAP-001)
      const seoulPosition = new window.kakao.maps.LatLng(37.566826, 126.9786567);
      seoulMarker.current = new window.kakao.maps.Marker({
        position: seoulPosition,
        title: '서울시청'
      });
      seoulMarker.current.setMap(map.current);
      
      // 서울시청 정보창
      const seoulInfowindow = new window.kakao.maps.InfoWindow({
        content: '<div style="padding:5px;"><strong>📍 서울시청</strong><br/>MAP-001 기본 마커</div>'
      });
      
      // 마커 클릭 이벤트
      window.kakao.maps.event.addListener(seoulMarker.current, 'click', function() {
        seoulInfowindow.open(map.current, seoulMarker.current);
      });
    }
  }, [level]);

  // 현재 위치 요청 함수 (MAP-002)
  const requestLocation = () => {
    console.log('🔍 위치 요청 시작...');
    
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
          map.current.setLevel(2); // 더 자세히 보기
          
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
          
          // 현재 위치 정보창 추가
          const userInfowindow = new window.kakao.maps.InfoWindow({
            content: '<div style="padding:5px;"><strong>🔵 현재 위치</strong><br/>MAP-002 위치 기능</div>',
            position: moveLatLng
          });
          userInfowindow.open(map.current);
          
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
            setErrorMessage(`알 수 없는 오류가 발생했습니다. (코드: ${error.code})`);
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

  // 서울시청으로 돌아가기
  const goToSeoul = () => {
    if (map.current) {
      const seoulPosition = new window.kakao.maps.LatLng(37.566826, 126.9786567);
      map.current.setCenter(seoulPosition);
      map.current.setLevel(3);
    }
  };

  return (
    <div className="space-y-4">
      {/* 컨트롤 패널 */}
      <div className="flex flex-wrap gap-4 p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg">
        {/* 현재 위치 컨트롤 */}
        <div className="flex-1 min-w-64">
          <h3 className="font-semibold text-blue-900 mb-2">📍 MAP-002: 현재 위치</h3>
          <div className="flex gap-2">
            <button
              onClick={requestLocation}
              disabled={locationStatus === 'requesting'}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                locationStatus === 'requesting'
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {locationStatus === 'requesting' ? '🔄 찾는 중...' : '🔵 내 위치 찾기'}
            </button>
            
            <button
              onClick={goToSeoul}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              📍 서울시청으로
            </button>
          </div>
        </div>

        {/* 상태 표시 */}
        <div className="flex-1 min-w-64">
          <h3 className="font-semibold text-gray-800 mb-2">🗺️ 지도 상태</h3>
          <div className="space-y-1 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-green-500">✅</span>
              <span>MAP-001: 서울시청 마커</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={locationStatus === 'success' ? 'text-green-500' : 'text-gray-400'}>
                {locationStatus === 'success' ? '✅' : '⏳'}
              </span>
              <span>MAP-002: 현재 위치 {locationStatus === 'success' ? '표시됨' : '대기 중'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 위치 정보 표시 */}
      {locationStatus === 'success' && userLocation && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800 font-semibold">✅ 현재 위치 표시 완료!</p>
          <p className="text-green-700 text-sm">
            위도: {userLocation.lat.toFixed(6)}, 경도: {userLocation.lng.toFixed(6)}
          </p>
        </div>
      )}

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

      {/* 통합 지도 영역 */}
      <div 
        ref={mapContainer} 
        style={{ width, height }}
        className="rounded-lg border border-gray-200"
      />

      {/* 기능 설명 */}
      <div className="p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold text-gray-800 mb-2">🎯 통합 지도 기능</h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
          <div>
            <h4 className="font-semibold text-green-600 mb-1">✅ MAP-001: 기본 지도</h4>
            <ul className="space-y-1">
              <li>• 📍 서울시청 고정 마커</li>
              <li>• 🖱️ 마커 클릭 시 정보창</li>
              <li>• 🔄 줌인/줌아웃, 드래그</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-blue-600 mb-1">✅ MAP-002: 현재 위치</h4>
            <ul className="space-y-1">
              <li>• 🔵 파란색 원형 위치 마커</li>
              <li>• 🎯 지도 중심 자동 이동</li>
              <li>• ❌ 위치 에러 처리</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnifiedMap;