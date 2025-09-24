// ============================================================================
// 카테고리 관련 헬퍼 함수들
// 파일: frontend/src/app/Map/components/CategoryHelper.ts
// ============================================================================

import { LocalSpot, CATEGORY_MAP_REVERSE } from '../lib/api';

/**
 * 카테고리별 아이콘 매핑 (undefined 값도 처리)
 */
export const getCategoryIcon = (category?: LocalSpot['category']): string => {
  const icons: Record<LocalSpot['category'], string> = {
    experience: '🎨',
    culture: '🏛️',
    restaurant: '🍽️',
    cafe: '☕',
  };
  return category ? (icons[category] || '📍') : '📍';
};

/**
 * 카테고리별 한글명 반환 (undefined 값도 처리)
 */
export const getCategoryName = (category?: LocalSpot['category']): string => {
  if (!category) return '기타';
  return CATEGORY_MAP_REVERSE[category] || category;
};

/**
 * 한글 카테고리명을 영문 키로 변환
 */
export const getCategoryKeyFromKorean = (koreanCategory: string): LocalSpot['category'] | null => {
  const categoryMap: Record<string, LocalSpot['category']> = {
    '체험': 'experience',
    '문화': 'culture',
    '맛집': 'restaurant',
    '카페': 'cafe'
  };
  return categoryMap[koreanCategory] || null;
};

/**
 * 모든 카테고리 목록 반환 (필터 등에서 사용)
 */
export const getAllCategories = () => {
  return [
    { id: '전체', name: '전체', icon: '📍', key: null },
    { id: '맛집', name: '맛집', icon: '🍽️', key: 'restaurant' as const },
    { id: '카페', name: '카페', icon: '☕', key: 'cafe' as const },
    { id: '문화', name: '문화', icon: '🏛️', key: 'culture' as const },
    { id: '체험', name: '체험', icon: '🎨', key: 'experience' as const }
  ];
};