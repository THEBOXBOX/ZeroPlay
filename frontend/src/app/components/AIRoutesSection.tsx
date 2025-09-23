'use client';

interface AIRoutesSectionProps {
  title?: string;
  showRoutes?: boolean;  // boolean은 이걸로 변경
  routes?: Array<{       // 실제 routes 데이터 타입 정의
    id: string;
    title: string;
    description: string;
    duration: string;
    budget: string;
  }>;
}

export default function AIRoutesSection({ 
      title = "AI 루트 추천",
      showRoutes = true,     // 변수명 변경
      routes = [             // 기본 데이터 제공
        {
          id: '1',
          title: '홍대 청년 핫플 투어',
          description: '핫한 카페와 맛집을 돌아보는 코스',
          duration: '3시간',
          budget: '2만원대'
        },
        {
          id: '2', 
          title: '강남 럭셔리 코스',
          description: '프리미엄 브런치와 디저트 명소',
          duration: '4시간',
          budget: '5만원대'
        },
        {
          id: '3',
          title: '서촌 힐링 투어', 
          description: '조용한 골목과 전통차 체험',
          duration: '2시간',
          budget: '1만원대'
        }
      ]
      }: AIRoutesSectionProps) {
        return (
          <section className="py-6 px-4 bg-white">
            <div className="mb-4 flex items-center">
              <span className="text-purple-500 mr-2"></span>
              <h2 className="text-lg font-bold text-gray-800">{title}</h2>
            </div>
            
            {showRoutes && (
        <div className="space-y-0 border-t border-gray-100">
          {routes.map(route => (
            <div key={route.id} className="flex items-center p-4 border-b border-gray-50">
              {/* 왼쪽 아이콘 */}
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                <span className="text-purple-600 text-lg">🗺️</span>
              </div>
              
              {/* 중간 정보 */}
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800 text-sm">{route.title}</h3>
                <p className="text-xs text-gray-600 mt-1">{route.description}</p>
                <div className="flex items-center mt-2">
                  <span className="text-xs text-gray-500">{route.duration}</span>
                </div>
              </div>
              
              {/* 오른쪽 가격 */}
              <div className="text-right">
                <span className="text-sm font-bold text-purple-600">{route.budget}</span>
              </div>
            </div>
          ))}
        </div>
      )}
      
            <button className="w-full py-3 bg-purple-500 text-white rounded-lg font-medium mt-4">
              AI와 여행 계획 세우기
            </button>
          
          </section>
  );
}