'use client';

interface BenefitsSectionProps {
  title?: string;
  limit?: number;
  showMore?: boolean;
}

export default function BenefitsSection({ 
  title = "청년 혜택 정보", 
  limit,
  showMore = true 
}: BenefitsSectionProps) {
  const benefits = [
    {
      id: 1,
      title: "KTX 청년 할인",
      discount: "30%",
      description: "만 6세~만 28세 청년을 위한 KTX 할인",
      category: "교통",
      color: "text-red-600",
      bgColor: "bg-red-50"
    },
    {
      id: 2,
      title: "문화누리카드",
      discount: "10만원",
      description: "문화예술 및 여행 바우처 지원",
      category: "문화",
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      id: 3,
      title: "청년도약계좌",
      discount: "5%",
      description: "목돈 마련을 위한 청년 전용 적금",
      category: "금융",
      color: "text-green-600",
      bgColor: "bg-green-50"
    }
  ];

  const displayBenefits = limit ? benefits.slice(0, limit) : benefits;

  return (
    <section className="py-6 px-4">
      <div className="mb-4 flex items-center">
        <span className="text-blue-500 mr-2"></span>
        <h2 className="text-lg font-bold text-gray-800">{title}</h2>
      </div>
      
      <div className="space-y-3">
        {displayBenefits.map((benefit) => (
          <div key={benefit.id} className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 min-h-32">
            <div className="flex justify-between items-start mb-4">
              {/* 좌측: 제목 + 카테고리 + 설명 */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold text-gray-800">{benefit.title}</h3>
                  <span className={`text-xs px-2 py-1 rounded-full ${benefit.bgColor} ${benefit.color}`}>
                    {benefit.category}
                  </span>
                </div>
                <p className="text-xs text-gray-600">{benefit.description}</p>
              </div>
              
              {/* 우측: 할인금액 */}
              <div className="ml-4 text-right">
                <span className={`text-xl font-bold ${benefit.color}`}>{benefit.discount}</span>
                <div className="text-xs text-gray-500">할인</div>
              </div>
            </div>
            
            {/* 하단: 신청가능 + 신청하기 */}
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">신청가능</span>
              <button className="text-xs text-blue-600 font-medium">신청하기</button>
            </div>
          </div>
        ))}
      </div>
      
      {showMore && (
        <button className="w-full mt-4 py-3 bg-blue-50 text-blue-600 rounded-lg font-medium">
          더 많은 혜택 보기
        </button>
      )}
    </section>
  );
}