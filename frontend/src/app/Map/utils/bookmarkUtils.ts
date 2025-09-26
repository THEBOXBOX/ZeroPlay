// frontend/src/app/Map/utils/bookmarkUtils.ts (수정된 완전 버전)
// 실제 API 연동 버전 - localStorage 대신 DB 사용

export interface BookmarkData {
  id: string;
  user_id: string;
  spot_id?: string;
  deal_id?: string;
  bookmark_type: 'spot' | 'deal';
  created_at: string;
  local_spots?: any;
  local_deals?: any;
}

// ============================================================================
// 마이페이지 동기화를 위한 이벤트 발생 함수
// ============================================================================

const notifyBookmarkChange = (action: 'add' | 'remove' | 'update', itemId: string, itemType: 'spot' | 'deal') => {
  window.dispatchEvent(new CustomEvent('mapBookmarkChanged', {
    detail: { 
      action, 
      itemId, 
      itemType,
      timestamp: Date.now() 
    }
  }));
  console.log(`🔔 북마크 변경 이벤트 발생: ${action} ${itemType} ${itemId}`);
};

// 북마크 추가 - API 연동
export const addBookmark = async (
  userId: string, 
  itemId: string, 
  type: 'spot' | 'deal'
): Promise<{ success: boolean; error?: string }> => {
  console.log('🔖 addBookmark (API):', { userId, itemId, type });
  
  try {
    const requestBody = {
      user_id: userId,
      bookmark_type: type,
      ...(type === 'spot' ? { spot_id: itemId } : { deal_id: itemId })
    };

    const response = await fetch('/api/bookmarks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();

    if (response.ok && data.success) {
      console.log('✅ 북마크 추가 성공 (API):', data);
      
      // 🔥 추가: 마이페이지에 변경사항 알림
      notifyBookmarkChange('add', itemId, type);
      
      return { success: true };
    } else {
      console.error('❌ 북마크 추가 실패 (API):', data);
      return { 
        success: false, 
        error: data.error || '북마크 추가에 실패했습니다.' 
      };
    }
  } catch (error) {
    console.error('💥 북마크 추가 오류 (API):', error);
    return { success: false, error: '네트워크 오류가 발생했습니다.' };
  }
};

// 북마크 삭제 - API 연동
export const removeBookmark = async (
  userId: string, 
  itemId: string, 
  type: 'spot' | 'deal'
): Promise<{ success: boolean; error?: string }> => {
  console.log('🗑️ removeBookmark (API):', { userId, itemId, type });
  
  try {
    const params = new URLSearchParams({
      user_id: userId,
      ...(type === 'spot' ? { spot_id: itemId } : { deal_id: itemId })
    });

    const response = await fetch(`/api/bookmarks?${params}`, {
      method: 'DELETE'
    });

    const data = await response.json();

    if (response.ok && data.success) {
      console.log('✅ 북마크 삭제 성공 (API):', data);
      
      // 🔥 추가: 마이페이지에 변경사항 알림
      notifyBookmarkChange('remove', itemId, type);
      
      return { success: true };
    } else {
      console.error('❌ 북마크 삭제 실패 (API):', data);
      return { 
        success: false, 
        error: data.error || '북마크 삭제에 실패했습니다.' 
      };
    }
  } catch (error) {
    console.error('💥 북마크 삭제 오류 (API):', error);
    return { success: false, error: '네트워크 오류가 발생했습니다.' };
  }
};

// 사용자 북마크 목록 조회 - API 연동
export const getUserBookmarks = async (
  userId: string
): Promise<{ success: boolean; bookmarks?: BookmarkData[]; error?: string }> => {
  console.log('📋 getUserBookmarks (API):', { userId });
  
  try {
    const response = await fetch(`/api/bookmarks?user_id=${userId}`, {
      method: 'GET'
    });

    const data = await response.json();

    if (response.ok && data.success) {
      console.log('✅ 북마크 조회 성공 (API):', { count: data.bookmarks?.length });
      return { success: true, bookmarks: data.bookmarks || [] };
    } else {
      console.error('❌ 북마크 조회 실패 (API):', data);
      return { 
        success: false, 
        error: data.error || '북마크 조회에 실패했습니다.' 
      };
    }
  } catch (error) {
    console.error('💥 북마크 조회 오류 (API):', error);
    return { success: false, error: '네트워크 오류가 발생했습니다.' };
  }
};

// 특정 아이템이 북마크되어 있는지 확인 - API 연동
export const isBookmarked = async (
  userId: string, 
  itemId: string, 
  type: 'spot' | 'deal'
): Promise<{ success: boolean; isBookmarked?: boolean; error?: string }> => {
  console.log('🔍 isBookmarked (API):', { userId, itemId, type });
  
  try {
    const result = await getUserBookmarks(userId);
    
    if (!result.success || !result.bookmarks) {
      return { success: false, error: result.error };
    }

    const bookmarked = result.bookmarks.some(bookmark => {
      if (type === 'spot') {
        return bookmark.spot_id === itemId;
      } else {
        return bookmark.deal_id === itemId;
      }
    });

    console.log('🔍 북마크 확인 결과 (API):', { bookmarked });
    return { success: true, isBookmarked: bookmarked };
  } catch (error) {
    console.error('💥 북마크 확인 오류 (API):', error);
    return { success: false, error: '북마크 확인 중 오류가 발생했습니다.' };
  }
};

// 북마크 토글 - API 연동 (개선된 버전)
export const toggleBookmark = async (
  userId: string, 
  itemId: string, 
  type: 'spot' | 'deal'
): Promise<{ success: boolean; isBookmarked?: boolean; error?: string }> => {
  console.log('🔄 toggleBookmark (API):', { userId, itemId, type });
  
  try {
    // 현재 북마크 상태 확인
    const checkResult = await isBookmarked(userId, itemId, type);
    
    if (!checkResult.success) {
      console.error('❌ 북마크 상태 확인 실패:', checkResult.error);
      return { success: false, error: checkResult.error };
    }

    const currentlyBookmarked = checkResult.isBookmarked || false;
    console.log('🔄 현재 북마크 상태:', currentlyBookmarked);

    // 토글 실행
    let result;
    if (currentlyBookmarked) {
      console.log('🗑️ 북마크 삭제 실행');
      result = await removeBookmark(userId, itemId, type);
    } else {
      console.log('➕ 북마크 추가 실행');
      result = await addBookmark(userId, itemId, type);
    }

    if (result.success) {
      const newBookmarkState = !currentlyBookmarked;
      console.log('✅ 토글 성공 (API), 새 상태:', newBookmarkState);
      return { success: true, isBookmarked: newBookmarkState };
    } else {
      console.error('❌ 토글 실패:', result.error);
      return { success: false, error: result.error };
    }
  } catch (error) {
    console.error('💥 북마크 토글 오류 (API):', error);
    return { success: false, error: '북마크 처리 중 오류가 발생했습니다.' };
  }
};

// 일괄 북마크 상태 조회 (성능 최적화용) - API 연동
export const getMultipleBookmarkStatus = async (
  itemIds: string[], 
  itemType: 'spot' | 'deal'
): Promise<Record<string, boolean>> => {
  console.log('🔍 일괄 북마크 상태 조회 (API):', { count: itemIds.length, itemType });
  
  if (itemIds.length === 0) {
    return {};
  }

  // 임시 userId 가져오기
  const userId = typeof window !== 'undefined' 
    ? localStorage.getItem('temp_user_id') || '00000000-0000-4000-8000-000000000000'
    : '00000000-0000-4000-8000-000000000000';

  try {
    const result = await getUserBookmarks(userId);
    
    if (!result.success || !result.bookmarks) {
      // 실패 시 모든 항목을 false로 반환
      const fallback: Record<string, boolean> = {};
      itemIds.forEach(id => {
        fallback[id] = false;
      });
      return fallback;
    }

    // 결과 매핑
    const statusMap: Record<string, boolean> = {};
    
    // 모든 item_ids를 false로 초기화
    itemIds.forEach(id => {
      statusMap[id] = false;
    });

    // 북마크된 항목들을 true로 설정
    result.bookmarks.forEach(bookmark => {
      const itemId = itemType === 'spot' ? bookmark.spot_id : bookmark.deal_id;
      if (itemId && itemIds.includes(itemId)) {
        statusMap[itemId] = true;
      }
    });

    console.log('✅ 일괄 북마크 조회 성공 (API):', { 
      총개수: itemIds.length, 
      북마크된개수: Object.values(statusMap).filter(Boolean).length 
    });
    
    return statusMap;
  } catch (error) {
    console.error('💥 일괄 북마크 조회 오류 (API):', error);
    
    // 실패 시 모든 항목을 false로 반환
    const fallback: Record<string, boolean> = {};
    itemIds.forEach(id => {
      fallback[id] = false;
    });
    return fallback;
  }
};

// ============================================================================
// 디버깅 및 관리 유틸리티 함수들
// ============================================================================

// 디버깅용 함수들
export const debugBookmarks = async (): Promise<void> => {
  console.log('🐛 북마크 디버그 (API 버전)');
  
  const userId = typeof window !== 'undefined' 
    ? localStorage.getItem('temp_user_id') || '00000000-0000-4000-8000-000000000000'
    : '00000000-0000-4000-8000-000000000000';
    
  try {
    const result = await getUserBookmarks(userId);
    
    if (result.success && result.bookmarks) {
      console.log('📊 현재 저장된 북마크:');
      console.table(result.bookmarks.map(bookmark => ({
        id: bookmark.id.slice(0, 8) + '...',
        type: bookmark.bookmark_type,
        spot_id: bookmark.spot_id?.slice(0, 8) + '...' || 'N/A',
        deal_id: bookmark.deal_id?.slice(0, 8) + '...' || 'N/A',
        created: new Date(bookmark.created_at).toLocaleString()
      })));
      
      console.log(`📈 총 북마크 수: ${result.bookmarks.length}개`);
      console.log(`📍 스팟 북마크: ${result.bookmarks.filter(b => b.bookmark_type === 'spot').length}개`);
      console.log(`🎟️ 딜 북마크: ${result.bookmarks.filter(b => b.bookmark_type === 'deal').length}개`);
    } else {
      console.log('❌ 북마크 조회 실패:', result.error);
    }
  } catch (error) {
    console.error('💥 디버그 중 오류:', error);
  }
};

// 북마크 개수 조회
export const getBookmarkCount = async (type?: 'spot' | 'deal'): Promise<number> => {
  const userId = typeof window !== 'undefined' 
    ? localStorage.getItem('temp_user_id') || '00000000-0000-4000-8000-000000000000'
    : '00000000-0000-4000-8000-000000000000';

  try {
    const result = await getUserBookmarks(userId);
    
    if (!result.success || !result.bookmarks) {
      return 0;
    }

    if (type) {
      return result.bookmarks.filter(bookmark => bookmark.bookmark_type === type).length;
    }
    
    return result.bookmarks.length;
  } catch (error) {
    console.error('북마크 개수 조회 실패:', error);
    return 0;
  }
};

// 전체 북마크 삭제 (관리자용)
export const clearAllBookmarks = async (): Promise<{ success: boolean; error?: string }> => {
  const userId = typeof window !== 'undefined' 
    ? localStorage.getItem('temp_user_id') || '00000000-0000-4000-8000-000000000000'
    : '00000000-0000-4000-8000-000000000000';

  try {
    const result = await getUserBookmarks(userId);
    
    if (!result.success || !result.bookmarks) {
      return { success: true }; // 이미 비어있음
    }

    // 모든 북마크를 순차적으로 삭제
    for (const bookmark of result.bookmarks) {
      const itemId = bookmark.spot_id || bookmark.deal_id;
      if (itemId) {
        await removeBookmark(userId, itemId, bookmark.bookmark_type);
        await new Promise(resolve => setTimeout(resolve, 100)); // 100ms 대기
      }
    }

    console.log('🧹 모든 북마크가 삭제되었습니다.');
    
    // 전체 삭제 알림
    notifyBookmarkChange('remove', 'all', 'spot');
    
    return { success: true };
  } catch (error) {
    console.error('전체 북마크 삭제 실패:', error);
    return { success: false, error: '전체 삭제 중 오류가 발생했습니다.' };
  }
};

// ============================================================================
// 추가 유틸리티 함수들
// ============================================================================

// 북마크 상태가 변경될 때 실행될 콜백 등록
export const onBookmarkChange = (callback: (detail: any) => void): (() => void) => {
  const handler = (event: CustomEvent) => {
    callback(event.detail);
  };

  window.addEventListener('mapBookmarkChanged', handler as EventListener);
  
  // cleanup 함수 반환
  return () => {
    window.removeEventListener('mapBookmarkChanged', handler as EventListener);
  };
};

// 최근 북마크한 항목 조회 (최대 N개)
export const getRecentBookmarks = async (limit: number = 10): Promise<BookmarkData[]> => {
  const userId = typeof window !== 'undefined' 
    ? localStorage.getItem('temp_user_id') || '00000000-0000-4000-8000-000000000000'
    : '00000000-0000-4000-8000-000000000000';

  try {
    const result = await getUserBookmarks(userId);
    
    if (!result.success || !result.bookmarks) {
      return [];
    }

    // 생성일 기준으로 정렬하여 최근 N개 반환
    return result.bookmarks
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, limit);
  } catch (error) {
    console.error('최근 북마크 조회 실패:', error);
    return [];
  }
};

// 북마크 통계 조회
export const getBookmarkStats = async () => {
  const userId = typeof window !== 'undefined' 
    ? localStorage.getItem('temp_user_id') || '00000000-0000-4000-8000-000000000000'
    : '00000000-0000-4000-8000-000000000000';

  try {
    const result = await getUserBookmarks(userId);
    
    if (!result.success || !result.bookmarks) {
      return {
        total: 0,
        spots: 0,
        deals: 0,
        thisWeek: 0,
        thisMonth: 0
      };
    }

    const bookmarks = result.bookmarks;
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    return {
      total: bookmarks.length,
      spots: bookmarks.filter(b => b.bookmark_type === 'spot').length,
      deals: bookmarks.filter(b => b.bookmark_type === 'deal').length,
      thisWeek: bookmarks.filter(b => new Date(b.created_at) > weekAgo).length,
      thisMonth: bookmarks.filter(b => new Date(b.created_at) > monthAgo).length
    };
  } catch (error) {
    console.error('북마크 통계 조회 실패:', error);
    return {
      total: 0,
      spots: 0,
      deals: 0,
      thisWeek: 0,
      thisMonth: 0
    };
  }
};