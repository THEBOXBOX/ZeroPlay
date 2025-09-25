'use client';

import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { addBookmark, removeBookmark, isBookmarked } from '../../utils/bookmarkUtils';

export interface BookmarkButtonProps {
  itemId: string;
  itemType: 'spot' | 'deal';
  variant?: 'default' | 'small' | 'icon-only';
  className?: string;
  onStatusChange?: (isBookmarked: boolean) => void;
  disabled?: boolean;
}

const generateTempUserId = (): string => {
  if (typeof window !== 'undefined' && 'crypto' in window && 'randomUUID' in window.crypto) {
    return window.crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

const getUserId = (): string => {
  if (typeof window === 'undefined') return '00000000-0000-4000-8000-000000000000';
  
  let userId = localStorage.getItem('temp_user_id');
  if (!userId) {
    userId = generateTempUserId();
    localStorage.setItem('temp_user_id', userId);
  }
  return userId;
};

const BookmarkButton: React.FC<BookmarkButtonProps> = ({
  itemId,
  itemType,
  variant = 'icon-only',
  className = '',
  onStatusChange,
  disabled = false
}) => {
  const [isBookmarkActive, setIsBookmarkActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const userId = getUserId();

  // 초기 북마크 상태 확인
  useEffect(() => {
    const checkBookmarkStatus = async () => {
      if (!itemId) return;
      
      setIsInitialLoading(true);
      try {
        const result = await isBookmarked(userId, itemId, itemType);
        if (result.success) {
          setIsBookmarkActive(result.isBookmarked || false);
        }
      } catch (error) {
        console.error('북마크 상태 확인 오류:', error);
      } finally {
        setIsInitialLoading(false);
      }
    };

    checkBookmarkStatus();
  }, [itemId, itemType, userId]);

  // 🛡️ 안전한 북마크 토글 (서버 응답 후 UI 업데이트)
  const handleBookmarkClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (disabled || isLoading) return;

    setIsLoading(true);
    
    try {
      let result;
      
      if (isBookmarkActive) {
        // 현재 북마크되어 있다면 제거
        result = await removeBookmark(userId, itemId, itemType);
      } else {
        // 현재 북마크되어 있지 않다면 추가
        result = await addBookmark(userId, itemId, itemType);
      }

      if (result.success) {
        // 성공: 상태 토글
        const newBookmarkState = !isBookmarkActive;
        setIsBookmarkActive(newBookmarkState);
        onStatusChange?.(newBookmarkState);
        console.log(newBookmarkState ? '북마크 추가됨' : '북마크 제거됨');
      } else {
        // 실패 처리
        if (result.error?.includes('이미 북마크')) {
          // 이미 북마크되어 있다면 상태를 true로 설정
          setIsBookmarkActive(true);
          onStatusChange?.(true);
          console.log('이미 북마크되어 있음 (상태 동기화)');
        } else if (result.error?.includes('북마크를 찾을 수 없습니다')) {
          // 북마크가 없다면 상태를 false로 설정  
          setIsBookmarkActive(false);
          onStatusChange?.(false);
          console.log('북마크가 없음 (상태 동기화)');
        } else {
          console.error('북마크 처리 실패:', result.error);
          // 사용자에게 알림 (선택사항)
          // alert('북마크 처리 중 오류가 발생했습니다.');
        }
      }
    } catch (error) {
      console.error('북마크 처리 중 오류:', error);
      // alert('북마크 처리 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 기본 스타일
  const baseClasses = variant === 'default' 
    ? "flex-1 py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 border"
    : "transition-colors";

  const statusClasses = variant === 'default'
    ? (isBookmarkActive
        ? "bg-red-50 hover:bg-red-100 text-red-600 border-red-200"
        : "bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-200")
    : "";

  const disabledClasses = (disabled || isLoading) ? "opacity-50 cursor-not-allowed" : "cursor-pointer";

  const buttonClasses = `${baseClasses} ${statusClasses} ${disabledClasses} ${className}`;

  // 초기 로딩 중이면 회색 하트 표시
  if (isInitialLoading) {
    return (
      <button disabled className={buttonClasses}>
        <Heart className={`${variant === 'default' ? 'w-4 h-4' : 'w-5 h-5'} text-gray-300 animate-pulse`} />
        {variant === 'default' && <span className="text-gray-400">확인중...</span>}
      </button>
    );
  }

  return (
    <button
      onClick={handleBookmarkClick}
      disabled={disabled || isLoading}
      className={buttonClasses}
      title={isBookmarkActive ? '북마크 제거' : '북마크 추가'}
    >
      {isLoading ? (
        <>
          <div className="w-5 h-5 animate-spin rounded-full border-2 border-gray-300 border-t-red-500" />
          {variant === 'default' && <span>처리중...</span>}
        </>
      ) : (
        <>
          <Heart 
            className={`${variant === 'default' ? 'w-4 h-4' : 'w-5 h-5'} transition-colors ${
              isBookmarkActive 
                ? 'fill-red-500 text-red-500' 
                : 'text-gray-400 hover:text-red-500'
            }`}
          />
          {variant === 'default' && (
            <span>
              {isBookmarkActive ? '북마크됨' : '북마크'}
            </span>
          )}
        </>
      )}
    </button>
  );
};

export default BookmarkButton;

// ============================================================================
// 경량화된 북마크 버튼 (바텀시트용) - 상태를 외부에서 받아서 표시만 담당
// ============================================================================

export interface OptimizedBookmarkButtonProps {
  spotId: string;
  variant?: 'default' | 'icon-only';
  className?: string;
  bookmarkStatuses: Record<string, boolean>;
  bookmarkLoading: boolean;
  onBookmarkToggle: (spotId: string, isCurrentlyBookmarked: boolean) => void;
}

export const OptimizedBookmarkButton: React.FC<OptimizedBookmarkButtonProps> = ({ 
  spotId, 
  variant = 'default', 
  className = '',
  bookmarkStatuses,
  bookmarkLoading,
  onBookmarkToggle
}) => {
  const isBookmarkedState = bookmarkStatuses[spotId] || false;
  
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onBookmarkToggle(spotId, isBookmarkedState);
  };

  if (variant === 'icon-only') {
    return (
      <button 
        onClick={handleClick}
        className={`${className}`}
        disabled={bookmarkLoading}
      >
        <Heart 
          className={`w-5 h-5 transition-colors ${
            isBookmarkedState 
              ? 'text-red-500 fill-red-500' 
              : 'text-gray-400 hover:text-red-400'
          }`} 
        />
      </button>
    );
  }

  return (
    <button 
      onClick={handleClick}
      className={`flex items-center space-x-2 px-3 py-2 border rounded-lg transition-colors ${
        isBookmarkedState 
          ? 'border-red-200 bg-red-50 text-red-600' 
          : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-red-200 hover:bg-red-50 hover:text-red-600'
      } ${className}`}
      disabled={bookmarkLoading}
    >
      <Heart 
        className={`w-4 h-4 ${
          isBookmarkedState ? 'fill-red-500 text-red-500' : ''
        }`} 
      />
      <span className="text-sm">
        {isBookmarkedState ? '저장됨' : '저장'}
      </span>
    </button>
  );
};