interface BenefitCardProps {
  benefit: {
    id: number;
    title: string;
    target_audience: string;
    category: string;
    region: string;
    discount_rate: string;
    valid_from: string;
    valid_until: string;
  };
  onClick?: () => void;
}

export default function BenefitCard({ benefit, onClick }: BenefitCardProps) {
  return (
    <div 
      className="bg-white rounded-2xl shadow-md border border-gray-100 p-5 cursor-pointer hover:shadow-lg transition-shadow"
      onClick={onClick}
    >
      {/* 제목과 할인율 */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1 pr-4">
          <h3 className="text-xl font-black text-gray-900 mb-1 leading-tight">
            {benefit.title}
          </h3>
          <p className="text-sm text-gray-500 font-medium">{benefit.target_audience}</p>
        </div>
        <div className="text-right flex-shrink-0">
          <div className="text-2xl font-black text-red-600">{benefit.discount_rate}</div>
          <div className="text-xs text-gray-400 font-medium">지원금</div>
        </div>
      </div>

      {/* 태그들 */}
      <div className="flex space-x-2 mb-5">
        <span className="px-3 py-1.5 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-lg">
          {benefit.category}
        </span>
        <span className="px-3 py-1.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded-lg">
          {benefit.region}
        </span>
      </div>

      {/* 구분선 */}
      <div className="border-t border-gray-200 pt-4">
        <div className="space-y-2.5 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-gray-500 font-medium">신청기간</span>
            <span className="text-gray-800 font-semibold">~ 12월 31일</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-500 font-medium">대상</span>
            <span className="text-gray-800 font-semibold">19-24세 청년</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-500 font-medium">상태</span>
            <span className="text-blue-600 font-semibold underline">신청 가능</span>
          </div>
        </div>
      </div>
    </div>
  );
}