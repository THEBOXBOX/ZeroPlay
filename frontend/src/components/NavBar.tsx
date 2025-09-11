interface NavBarProps {
  activeTab?: string;
}

export default function NavBar({ activeTab = "혜택" }: NavBarProps) {
  return (
    <div className="h-[100px] bg-white border-t border-gray-100">
      <div className="flex justify-around items-center h-full px-4">
        <button className="flex flex-col items-center space-y-1">
          <span className="text-2xl">🏠</span>
          <span className={`text-xs font-medium ${activeTab === "홈" ? "text-blue-600 font-bold" : "text-gray-500"}`}>홈</span>
        </button>
        <button className="flex flex-col items-center space-y-1">
          <span className="text-2xl">🤖</span>
          <span className={`text-xs font-medium ${activeTab === "AI" ? "text-blue-600 font-bold" : "text-gray-500"}`}>AI 루트</span>
        </button>
        <button className="flex flex-col items-center space-y-1">
          <span className="text-2xl">🎁</span>
          <span className={`text-xs font-medium ${activeTab === "혜택" ? "text-blue-600 font-bold" : "text-gray-500"}`}>혜택 정보</span>
        </button>
        <button className="flex flex-col items-center space-y-1">
          <span className="text-2xl">📍</span>
          <span className={`text-xs font-medium ${activeTab === "지도" ? "text-blue-600 font-bold" : "text-gray-500"}`}>지도</span>
        </button>
        <button className="flex flex-col items-center space-y-1">
          <span className="text-2xl">👤</span>
          <span className={`text-xs font-medium ${activeTab === "내정보" ? "text-blue-600 font-bold" : "text-gray-500"}`}>내 정보</span>
        </button>
      </div>
    </div>
  );
}