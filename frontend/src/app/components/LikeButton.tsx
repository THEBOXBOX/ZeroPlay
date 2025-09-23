// ============================================================================
// 좋아요 버튼 컴포넌트
// 파일: frontend/src/components/LikeButton.tsx (새로 생성)
// ============================================================================

import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { SavedRoutesManager } from '@/lib/savedRoutes';

interface LikeButtonProps {
  route: {
    id: string;
    title: string;
    duration: string;
    totalBudget: number;
    places: any[];
    highlights: string[];
    difficulty: 'easy' | 'moderate' | 'hard';
  };
  userMessage?: string;
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const LikeButton: React.FC<LikeButtonProps> = ({
  route,
  userMessage = '',
  className = '',
  showText = false,
  size = 'md'
}) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // 컴포넌트 마운트 시 저장 상태 확인
  useEffect(() => {
    const checkSavedStatus = () => {
      const saved = SavedRoutesManager.isRouteSaved(route.id);
      setIsLiked(saved);
    };

    checkSavedStatus();

    // 다른 곳에서 저장 상태가 변경될 때 감지
    const handleRouteSaved = (event: CustomEvent) => {
      if (event.detail.route.id === route.id) {
        setIsLiked(true);
      }
    };

    const handleRouteRemoved = (event: CustomEvent) => {
      if (event.detail.routeId === route.id) {
        setIsLiked(false);
      }
    };

    const handleAllRoutesCleared = () => {
      setIsLiked(false);
    };

    window.addEventListener('routeSaved', handleRouteSaved as EventListener);
    window.addEventListener('routeRemoved', handleRouteRemoved as EventListener);
    window.addEventListener('allRoutesCleared', handleAllRoutesCleared);

    return () => {
      window.removeEventListener('routeSaved', handleRouteSaved as EventListener);
      window.removeEventListener('routeRemoved', handleRouteRemoved as EventListener);
      window.removeEventListener('allRoutesCleared', handleAllRoutesCleared);
    };
  }, [route.id]);

  // 좋아요 버튼 클릭 처리
  const handleLikeClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      // 애니메이션 시작
      setIsAnimating(true);
      
      // 저장/삭제 토글
      const newLikedState = SavedRoutesManager.toggleSaveRoute(route, userMessage);
      setIsLiked(newLikedState);

      // 성공 피드백 (선택적으로 토스트 메시지 추가 가능)
      if (newLikedState) {
        console.log(`✅ "${route.title}" 코스가 저장되었습니다!`);
      } else {
        console.log(`❌ "${route.title}" 코스가 저장 목록에서 제거되었습니다.`);
      }

      // 애니메이션 종료
      setTimeout(() => setIsAnimating(false), 300);

    } catch (error) {
      console.error('좋아요 처리 중 오류:', error);
      setIsAnimating(false);
    }
  };

  // 크기별 스타일 정의
  const sizeStyles = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const buttonSizeStyles = {
    sm: 'p-1 text-xs',
    md: 'p-2 text-sm',
    lg: 'p-3 text-base'
  };

  return (
    <button
      onClick={handleLikeClick}
      disabled={isAnimating}
      className={`
        inline-flex items-center justify-center gap-1.5 
        rounded-full border-2 transition-all duration-200 
        hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2
        ${isLiked 
          ? 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100 focus:ring-red-500' 
          : 'bg-white border-gray-200 text-gray-400 hover:bg-gray-50 hover:text-red-500 hover:border-red-200 focus:ring-gray-500'
        }
        ${isAnimating ? 'animate-pulse' : ''}
        ${buttonSizeStyles[size]}
        ${className}
      `}
      title={isLiked ? '저장된 코스에서 제거' : '코스 저장하기'}
    >
      <Heart 
        className={`
          ${sizeStyles[size]} transition-all duration-200
          ${isLiked ? 'fill-current text-red-500' : 'text-current'}
          ${isAnimating ? 'animate-ping' : ''}
        `}
      />
      
      {showText && (
        <span className="font-medium">
          {isLiked ? '저장됨' : '저장하기'}
        </span>
      )}
    </button>
  );
};

// ============================================================================
// 저장된 코스 개수 표시 컴포넌트
// ============================================================================

interface SavedRoutesCounterProps {
  className?: string;
}

export const SavedRoutesCounter: React.FC<SavedRoutesCounterProps> = ({
  className = ''
}) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    // 초기 개수 설정
    const updateCount = () => {
      const currentCount = SavedRoutesManager.getSavedRoutesCount();
      setCount(currentCount);
    };

    updateCount();

    // 저장/삭제 이벤트 감지하여 개수 업데이트
    const handleCountUpdate = () => updateCount();

    window.addEventListener('routeSaved', handleCountUpdate);
    window.addEventListener('routeRemoved', handleCountUpdate);
    window.addEventListener('allRoutesCleared', handleCountUpdate);

    return () => {
      window.removeEventListener('routeSaved', handleCountUpdate);
      window.removeEventListener('routeRemoved', handleCountUpdate);
      window.removeEventListener('allRoutesCleared', handleCountUpdate);
    };
  }, []);

  if (count === 0) return null;

  return (
    <span className={`
      inline-flex items-center justify-center
      bg-red-500 text-white text-xs font-bold
      rounded-full w-5 h-5 min-w-5
      ${className}
    `}>
      {count > 99 ? '99+' : count}
    </span>
  );
};