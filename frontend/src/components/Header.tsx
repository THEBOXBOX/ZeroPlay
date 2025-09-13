import React from 'react';

interface HeaderProps {
  showBackButton?: boolean;
  onBackClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ showBackButton = false, onBackClick }) => {
  return (
    <div className="bg-white border-b border-gray-200 px-4 h-[60px] flex items-center justify-between w-full">
      {showBackButton ? (
        <button 
          onClick={onBackClick}
          className="flex items-center space-x-2"
        >
          <span className="text-lg text-gray-600">←</span>
        </button>
      ) : (
        <div className="w-5 h-5" />
      )}
      
      <div className="text-lg font-bold">
        <span className="text-gray-800">MY</span>
        <span className="text-orange-500">지</span>
        <span className="text-green-500">하</span>
        <span className="text-blue-500">철</span>
      </div>
      
      <div className="flex items-center space-x-4">
        <span className="text-lg">🔔</span>
        <span className="text-lg">⚙️</span>
      </div>
    </div>
  );
};

export default Header;