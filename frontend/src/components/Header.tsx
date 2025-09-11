export default function Header() {
  return (
    <div className="h-[120px] bg-white border-b border-gray-100 flex items-center justify-between px-5">
      <div className="flex items-center">
        <span className="text-xs text-gray-400 font-medium">MY</span>
        <span className="ml-2 font-black text-lg">
          <span className="text-yellow-500">SUB</span>
          <span className="text-green-500">WAY</span>
        </span>
      </div>
      <div className="flex space-x-4">
        <button className="text-lg">🔔</button>
        <button className="text-lg">⚙️</button>
      </div>
    </div>
  );
}