// src/app/Map/hooks/useLocalSpots.ts - Map 전용 데이터 훅
'use client';

import { useState, useEffect } from 'react';
import { fetchLocalSpots, LocalSpot } from '../lib/api';

export interface UseLocalSpotsResult {
  spots: LocalSpot[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useLocalSpots(
  category: string = '전체',
  limit: number = 50
): UseLocalSpotsResult {
  const [spots, setSpots] = useState<LocalSpot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSpots = async () => {
    try {
      console.log('🔄 [Map Hook] 데이터 로딩 시작:', { category, limit });
      setLoading(true);
      setError(null);

      const response = await fetchLocalSpots(category, limit);
      
      if (response.success) {
        console.log('✅ [Map Hook] 데이터 로딩 성공:', response.spots.length, '개');
        setSpots(response.spots);
        setError(null);
      } else {
        console.error('❌ [Map Hook] 데이터 로딩 실패:', response.error);
        setError(response.error || '데이터를 불러올 수 없습니다.');
        setSpots([]);
      }
    } catch (err) {
      console.error('❌ [Map Hook] 예상치 못한 에러:', err);
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
      setSpots([]);
    } finally {
      setLoading(false);
    }
  };

  // 카테고리가 변경될 때마다 데이터 다시 로드
  useEffect(() => {
    loadSpots();
  }, [category, limit]);

  const refetch = () => {
    console.log('🔄 [Map Hook] 수동 새로고침 요청');
    loadSpots();
  };

  return {
    spots,
    loading,
    error,
    refetch,
  };
}