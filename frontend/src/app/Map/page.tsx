import { MapScriptLoader, KakaoMap } from './components';
import Link from 'next/link';

export default function MapMainPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <nav className="flex items-center gap-2 text-sm text-gray-600 mb-4">
          <Link href="/" className="hover:text-blue-600">전체 프로젝트</Link>
          <span>›</span>
          <span className="text-gray-900">Map Epic</span>
        </nav>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              🗺️ Epic 2: 지도 기반 로컬 체험 서비스
            </h1>
            <p className="text-gray-600">
              MAP-001: 카카오맵 기본 컴포넌트 ✅ 완료!
            </p>
          </div>
          <Link 
            href="/Map/location" 
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            다음: MAP-002 현재 위치 →
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-gray-800">
            📍 서울 시청 중심 지도
          </h2>
          <p className="text-gray-600 text-sm">
            기본 마커와 정보창이 표시됩니다.
          </p>
        </div>
        
        <MapScriptLoader>
          <KakaoMap 
            width="100%" 
            height="500px" 
            level={3}
            lat={37.566826}  // 서울 시청
            lng={126.9786567}
          />
        </MapScriptLoader>

        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-gray-800 mb-2">✅ MAP-001 완료!</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>✅ 지도가 정상적으로 로드됨</li>
            <li>✅ 서울 시청 위치가 중앙에 표시됨</li>
            <li>✅ 마커와 정보창이 표시됨</li>
            <li>✅ 지도 줌인/줌아웃 작동</li>
            <li>✅ 지도 드래그 작동</li>
          </ul>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* MAP-001 */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">MAP-001</h3>
            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">완료</span>
          </div>
          <h4 className="font-semibold text-gray-900 mb-2">기본 지도 컴포넌트</h4>
          <p className="text-gray-600 text-sm">카카오맵 API 기본 설정 및 지도 렌더링</p>
        </div>

        {/* MAP-002 */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">MAP-002</h3>
            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">진행중</span>
          </div>
          <h4 className="font-semibold text-gray-900 mb-2">현재 위치 기능</h4>
          <p className="text-gray-600 text-sm mb-4">사용자 위치 권한 요청 및 표시</p>
          <Link 
            href="/Map/location" 
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm transition-colors"
          >
            개발 중
          </Link>
        </div>

        {/* MAP-003 */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-gray-300">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">MAP-003</h3>
            <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">대기</span>
          </div>
          <h4 className="font-semibold text-gray-900 mb-2">DB 스키마 설계</h4>
          <p className="text-gray-600 text-sm mb-4">로컬 스팟 데이터 구조 설계</p>
          <button 
            disabled
            className="bg-gray-300 text-gray-500 px-4 py-2 rounded text-sm cursor-not-allowed"
          >
            대기 중
          </button>
        </div>
      </div>
    </div>
  );
}