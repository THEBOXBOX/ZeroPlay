import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            🗺️ 로컬 체험 지도 프로젝트
          </h1>
          <p className="text-xl text-gray-600 mb-12">
            청년들을 위한 지역별 특색 있는 로컬 스팟과 실시간 할인정보 서비스
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {/* Epic 1 */}
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-gray-500">
              <div className="text-center">
                <div className="text-3xl mb-4">🏗️</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Epic 1</h3>
                <p className="text-gray-600 text-sm mb-4">기반 인프라 구축</p>
                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">완료</span>
              </div>
            </div>

            {/* Epic 2 */}
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
              <div className="text-center">
                <div className="text-3xl mb-4">🗺️</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Epic 2</h3>
                <p className="text-gray-600 text-sm mb-4">지도 기반 로컬 체험 서비스</p>
                <Link 
                  href="/Map" 
                  className="inline-block bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm transition-colors"
                >
                  진행 중
                </Link>
              </div>
            </div>

            {/* Epic 3 */}
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
              <div className="text-center">
                <div className="text-3xl mb-4">🎯</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Epic 3</h3>
                <p className="text-gray-600 text-sm mb-4">청년 혜택 정보 제공</p>
                <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">대기</span>
              </div>
            </div>

            {/* Epic 4 */}
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
              <div className="text-center">
                <div className="text-3xl mb-4">🤖</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Epic 4</h3>
                <p className="text-gray-600 text-sm mb-4">AI 기반 맞춤 코스 추천</p>
                <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">대기</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-8">
            <h3 className="text-2xl font-semibold text-gray-800 mb-6">📊 전체 프로젝트 진행 상황</h3>
            <div className="grid md:grid-cols-3 gap-6 text-left">
              <div>
                <h4 className="font-semibold text-green-600 mb-3">✅ 완료 (Epic 1)</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Next.js 프로젝트 설정</li>
                  <li>• Supabase 데이터베이스 연동</li>
                  <li>• 기본 API 서버 구축</li>
                  <li>• 공통 UI 컴포넌트</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold text-blue-600 mb-3">🔄 진행 중 (Epic 2)</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• MAP-001: 기본 지도 ✅</li>
                  <li>• MAP-002: 현재 위치 🔄</li>
                  <li>• MAP-003: DB 스키마 ⏳</li>
                  <li>• MAP-004: 더미 데이터 ⏳</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-600 mb-3">⏳ 예정 (Epic 3,4)</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• 청년 혜택 데이터 수집</li>
                  <li>• 혜택 정보 UI 구현</li>
                  <li>• AI 추천 알고리즘</li>
                  <li>• 코스 생성 기능</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}