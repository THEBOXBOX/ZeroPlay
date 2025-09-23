'use client';

interface LocalDealsSectionProps {
  title?: string;
  limit?: number;
  layout?: 'card' | 'list';
}

export default function LocalDealsSection({ 
  title = "단기간 오픈! 여름을 가지로 받는 로컬딜",
  limit,
  layout = 'list'
}: LocalDealsSectionProps) {
  const deals = [
    { id: 1, title: "City Escape", description: "Short description...", tag: "New" },
    { id: 2, title: "Beach Getaway", description: "Short description...", tag: "Limited Offer" },
    { id: 3, title: "Mountain Adventure", description: "Short description...", tag: "Book Now" },
    { id: 4, title: "Urban Explorer", description: "Short description...", tag: "Hot Deal" }
  ];

  const displayDeals = limit ? deals.slice(0, limit) : deals;

  return (
    <section className="py-6 px-4">
      <div className="mb-4 flex items-center">
        <span className="text-orange-500 mr-2"></span>
        <h2 className="text-lg font-bold text-gray-800">{title}</h2>
      </div>
      
      <div className={`grid ${layout === 'card' ? 'grid-cols-2' : 'grid-cols-2'} gap-4`}>
        {displayDeals.map((deal) => (
          <div key={deal.id} className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-100">
            {layout === 'card' ? (
              <>
                <div className="h-24 bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center">
                  <span className="text-white text-xs">📷</span>
                </div>
                <div className="p-3">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-medium text-sm">{deal.title}</h3>
                    <span className="bg-orange-100 text-orange-700 text-xs px-2 py-1 rounded">{deal.tag}</span>
                  </div>
                  <p className="text-xs text-gray-600 mb-2">{deal.description}</p>
                  <button className="text-xs text-blue-600 font-medium">자세히 보기</button>
                </div>
              </>
            ) : (
              <div className="flex">
                <div className="w-24 h-20 bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center">
                  <span className="text-white text-xs">📷</span>
                </div>
                <div className="flex-1 p-3">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-medium text-sm">{deal.title}</h3>
                    <span className="bg-orange-100 text-orange-700 text-xs px-2 py-1 rounded">{deal.tag}</span>
                  </div>
                  <p className="text-xs text-gray-600 mb-2">{deal.description}</p>
                  <button className="text-xs text-blue-600 font-medium">자세히 보기</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      
      <button className="w-full mt-4 py-3 bg-orange-50 text-orange-600 rounded-lg font-medium">
        더 많은 로컬딜 보기
      </button>
    </section>
  );
}