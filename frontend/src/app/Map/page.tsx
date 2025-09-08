import { MapScriptLoader, UnifiedMap } from './components';
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
              MAP-001 ✅ + MAP-002 ✅ 하나의 지도에 통합!
            </p>
          </div>
          <Link 
            href="/Map/location" 
            className="bg-gray-400 hover:bg-gray-500 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            개발 버전 보기
          </Link>
        </div>
      </div>

      {/* 통합 지도 */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-gray-800">
            🎯 MAP-001 + MAP-002 통합 지도
          </h2>
          <p className="text-gray-600 text-sm">
            서울시청 기본 마커 + 현재 위치 기능이 하나의 지도에 통합되었습니다.
          </p>
        </div>
        
        <MapScriptLoader>
          <UnifiedMap 
            width="100%" 
            height="600px" 
            level={3}
          />
        </MapScriptLoader>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* MAP-001 */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">MAP-001</h3>
            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">완료</span>
          </div>
          <h4 className="font-semibold text-gray-900 mb-2">기본 지도 컴포넌트</h4>
          <p className="text-gray-600 text-sm mb-3">카카오맵 API 기본 설정 및 지도 렌더링</p>
          <ul className="text-xs text-gray-500 space-y-1">
            <li>✅ 지도 렌더링</li>
            <li>✅ 서울시청 마커</li>
            <li>✅ 정보창</li>
            <li>✅ 줌/드래그</li>
          </ul>
        </div>

        {/* MAP-002 */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">MAP-002</h3>
            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">완료</span>
          </div>
          <h4 className="font-semibold text-gray-900 mb-2">현재 위치 기능</h4>
          <p className="text-gray-600 text-sm mb-3">사용자 위치 권한 요청 및 표시</p>
          <ul className="text-xs text-gray-500 space-y-1">
            <li>✅ 위치 권한 요청</li>
            <li>✅ 파란색 원형 마커</li>
            <li>✅ 지도 중심 이동</li>
            <li>✅ 에러 처리</li>
          </ul>
        </div>

        {/* MAP-003 */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">MAP-003</h3>
            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">다음</span>
          </div>
          <h4 className="font-semibold text-gray-900 mb-2">DB 스키마 설계</h4>
          <p className="text-gray-600 text-sm mb-3">로컬 스팟 데이터 구조 설계</p>
          <button 
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm transition-colors w-full"
          >
            곧 시작!
          </button>
        </div>
      </div>

      <div className="mt-8 p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">🎉 통합 지도 완성!</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-green-600 mb-2">✅ 하나의 지도에 통합된 기능:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• 📍 서울시청 고정 마커 (MAP-001)</li>
              <li>• 🔵 현재 위치 표시 (MAP-002)</li>
              <li>• 🎯 위치 간 쉬운 이동</li>
              <li>• 🖱️ 직관적인 컨트롤 패널</li>
              <li>• ❌ 통합 에러 처리</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-blue-600 mb-2">🔄 다음 작업:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• MAP-003: 로컬 스팟 DB 스키마 설계</li>
              <li>• MAP-004: 더미 데이터 생성 (20개)</li>
              <li>• MAP-005: 스팟 데이터 지도 표시</li>
              <li>• MAP-006: 카테고리별 핀 구분</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}