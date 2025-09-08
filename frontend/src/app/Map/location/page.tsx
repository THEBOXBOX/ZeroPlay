import { MapScriptLoader, LocationMap } from '../components';
import Link from 'next/link';

export default function LocationPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <nav className="flex items-center gap-2 text-sm text-gray-600 mb-4">
          <Link href="/" className="hover:text-blue-600">전체 프로젝트</Link>
          <span>›</span>
          <Link href="/Map" className="hover:text-blue-600">Map Epic</Link>
          <span>›</span>
          <span className="text-gray-900">현재 위치</span>
        </nav>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          📍 MAP-002: 현재 위치 기능
        </h1>
        <p className="text-gray-600">
          사용자 위치 권한 요청 및 지도에 현재 위치 표시
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-gray-800">
            🔍 위치 기반 지도
          </h2>
          <p className="text-gray-600 text-sm">
            "내 위치 찾기" 버튼을 클릭하여 현재 위치를 확인해보세요.
          </p>
        </div>
        
        <MapScriptLoader>
          <LocationMap 
            width="100%" 
            height="500px" 
            level={3}
          />
        </MapScriptLoader>

        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-gray-800 mb-2">✅ MAP-002 구현 기능:</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>📱 브라우저 위치 권한 요청</li>
            <li>🔵 현재 위치에 파란색 원형 마커 표시</li>
            <li>🎯 지도 중심을 현재 위치로 자동 이동</li>
            <li>❌ 위치 거부/실패 시 에러 처리</li>
            <li>🔄 위치 재요청 기능</li>
          </ul>
        </div>
        
        <div className="mt-6 flex gap-4">
          <Link 
            href="/Map" 
            className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            ← MAP-001로 돌아가기
          </Link>
          <button 
            disabled
            className="bg-gray-300 text-gray-500 px-6 py-3 rounded-lg font-medium cursor-not-allowed"
          >
            다음: MAP-003 DB 스키마 →
          </button>
        </div>
      </div>
    </div>
  );
}