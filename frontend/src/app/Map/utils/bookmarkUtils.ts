// src/app/Map/utils/bookmarkUtils.ts
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

// 북마크 토글 - API 연동
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

// 디버깅용 함수들
export const debugBookmarks = (): void => {
  console.log('🐛 API 버전 사용 중 - localStorage 디버깅 불가');
};

export const clearAllBookmarks = (): void => {
  console.log('🧹 API 버전에서는 개별 삭제만 가능');
};