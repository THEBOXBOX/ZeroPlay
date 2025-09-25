// ============================================================================
// 카테고리 필터링 및 데이터 표시 로직 커스텀 훅
// 파일: frontend/src/app/Map/hooks/useDisplayData.ts
// ============================================================================

import { useMemo } from 'react';
import { LocalSpot, CATEGORY_MAP_REVERSE } from '../lib/api';
import { hasLocalDeal } from '../components/localdeals/LocalDealsData';

interface UseDisplayDataReturn {
  displayData: LocalSpot[];
}

export const useDisplayData = (
  spots: LocalSpot[],
  showLocalDeals: boolean,
  activeCategory: string
): UseDisplayDataReturn => {

  // 표시할 데이터 계산 (메모이제이션)
  const displayData = useMemo((): LocalSpot[] => {
    if (showLocalDeals) {
      const localDealSpots = spots.filter(spot => hasLocalDeal(spot.id));
      console.log('🎟️ 로컬딜 보유 스팟:', localDealSpots.length, '개');
      return localDealSpots;
    } else if (activeCategory === '전체') {
      return spots;
    } else {
      const categoryKey = {
        '체험': 'experience',
        '문화': 'culture',
        '맛집': 'restaurant',
        '카페': 'cafe'
      }[activeCategory] as keyof typeof CATEGORY_MAP_REVERSE;
      
      if (categoryKey) {
        return spots.filter(spot => spot.category === categoryKey);
      }
      return spots;
    }
  }, [spots, showLocalDeals, activeCategory]);

  return {
    displayData,
  };
};