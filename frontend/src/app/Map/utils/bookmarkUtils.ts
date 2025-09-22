// src/app/Map/utils/bookmarkUtils.ts
// 임시 localStorage 버전 (API 문제 해결 전까지 사용)

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

const BOOKMARK_STORAGE_KEY = 'temp_bookmarks';

// 로컬 스토리지에서 북마크 가져오기
const getLocalBookmarks = (): BookmarkData[] => {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(BOOKMARK_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('북마크 로딩 오류:', error);
    return [];
  }
};

// 로컬 스토리지에 북마크 저장
const saveLocalBookmarks = (bookmarks: BookmarkData[]): void => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(BOOKMARK_STORAGE_KEY, JSON.stringify(bookmarks));
  } catch (error) {
    console.error('북마크 저장 오류:', error);
  }
};

// 북마크 추가
export const addBookmark = async (
  userId: string, 
  itemId: string, 
  type: 'spot' | 'deal'
): Promise<{ success: boolean; error?: string }> => {
  console.log('🔖 addBookmark (localStorage):', { userId, itemId, type });
  
  try {
    const bookmarks = getLocalBookmarks();
    
    // 중복 체크
    const exists = bookmarks.some(bookmark => {
      if (type === 'spot') {
        return bookmark.user_id === userId && bookmark.spot_id === itemId;
      } else {
        return bookmark.user_id === userId && bookmark.deal_id === itemId;
      }
    });

    if (exists) {
      console.log('⚠️ 이미 북마크 존재');
      return { success: false, error: '이미 북마크에 추가된 항목입니다.' };
    }

    // 새 북마크 추가
    const newBookmark: BookmarkData = {
      id: `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      user_id: userId,
      bookmark_type: type,
      created_at: new Date().toISOString(),
      ...(type === 'spot' ? { spot_id: itemId } : { deal_id: itemId })
    };

    bookmarks.push(newBookmark);
    saveLocalBookmarks(bookmarks);

    console.log('✅ 북마크 추가 성공 (localStorage)');
    return { success: true };
  } catch (error) {
    console.error('💥 북마크 추가 오류 (localStorage):', error);
    return { success: false, error: '북마크 추가 중 오류가 발생했습니다.' };
  }
};

// 북마크 삭제
export const removeBookmark = async (
  userId: string, 
  itemId: string, 
  type: 'spot' | 'deal'
): Promise<{ success: boolean; error?: string }> => {
  console.log('🗑️ removeBookmark (localStorage):', { userId, itemId, type });
  
  try {
    let bookmarks = getLocalBookmarks();
    
    // 삭제할 북마크 찾아서 제거
    const initialLength = bookmarks.length;
    bookmarks = bookmarks.filter(bookmark => {
      if (bookmark.user_id !== userId) return true;
      
      if (type === 'spot') {
        return bookmark.spot_id !== itemId;
      } else {
        return bookmark.deal_id !== itemId;
      }
    });

    if (bookmarks.length === initialLength) {
      console.log('⚠️ 삭제할 북마크 없음');
      return { success: false, error: '삭제할 북마크를 찾을 수 없습니다.' };
    }

    saveLocalBookmarks(bookmarks);

    console.log('✅ 북마크 삭제 성공 (localStorage)');
    return { success: true };
  } catch (error) {
    console.error('💥 북마크 삭제 오류 (localStorage):', error);
    return { success: false, error: '북마크 삭제 중 오류가 발생했습니다.' };
  }
};

// 사용자 북마크 목록 조회
export const getUserBookmarks = async (
  userId: string
): Promise<{ success: boolean; bookmarks?: BookmarkData[]; error?: string }> => {
  console.log('📋 getUserBookmarks (localStorage):', { userId });
  
  try {
    const bookmarks = getLocalBookmarks();
    const userBookmarks = bookmarks.filter(bookmark => bookmark.user_id === userId);

    console.log('✅ 북마크 조회 성공 (localStorage):', { count: userBookmarks.length });
    return { success: true, bookmarks: userBookmarks };
  } catch (error) {
    console.error('💥 북마크 조회 오류 (localStorage):', error);
    return { success: false, error: '북마크 조회 중 오류가 발생했습니다.' };
  }
};

// 특정 아이템이 북마크되어 있는지 확인
export const isBookmarked = async (
  userId: string, 
  itemId: string, 
  type: 'spot' | 'deal'
): Promise<{ success: boolean; isBookmarked?: boolean; error?: string }> => {
  console.log('🔍 isBookmarked (localStorage):', { userId, itemId, type });
  
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

    console.log('🔍 북마크 확인 결과 (localStorage):', { bookmarked });
    return { success: true, isBookmarked: bookmarked };
  } catch (error) {
    console.error('💥 북마크 확인 오류 (localStorage):', error);
    return { success: false, error: '북마크 확인 중 오류가 발생했습니다.' };
  }
};

// 북마크 토글 (수정된 버전 - 중복 체크 개선)
export const toggleBookmark = async (
  userId: string, 
  itemId: string, 
  type: 'spot' | 'deal'
): Promise<{ success: boolean; isBookmarked?: boolean; error?: string }> => {
  console.log('🔄 toggleBookmark (localStorage):', { userId, itemId, type });
  
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
      console.log('✅ 토글 성공 (localStorage), 새 상태:', newBookmarkState);
      return { success: true, isBookmarked: newBookmarkState };
    } else {
      console.error('❌ 토글 실패:', result.error);
      return { success: false, error: result.error };
    }
  } catch (error) {
    console.error('💥 북마크 토글 오류 (localStorage):', error);
    return { success: false, error: '북마크 처리 중 오류가 발생했습니다.' };
  }
};

// 디버깅용 함수들
export const debugBookmarks = (): void => {
  if (typeof window === 'undefined') return;
  
  const bookmarks = getLocalBookmarks();
  console.log('🐛 전체 북마크 목록:', bookmarks);
};

export const clearAllBookmarks = (): void => {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem(BOOKMARK_STORAGE_KEY);
  console.log('🧹 모든 북마크 삭제됨');
};

// 일괄 북마크 상태 조회 (성능 최적화용)
export const getMultipleBookmarkStatus = async (
  itemIds: string[], 
  itemType: 'spot' | 'deal'
): Promise<Record<string, boolean>> => {
  console.log('🔍 일괄 북마크 상태 조회 (localStorage):', { count: itemIds.length, itemType });
  
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

    console.log('✅ 일괄 북마크 조회 성공 (localStorage):', { 
      총개수: itemIds.length, 
      북마크된개수: Object.values(statusMap).filter(Boolean).length 
    });
    
    return statusMap;
  } catch (error) {
    console.error('💥 일괄 북마크 조회 오류 (localStorage):', error);
    
    // 실패 시 모든 항목을 false로 반환
    const fallback: Record<string, boolean> = {};
    itemIds.forEach(id => {
      fallback[id] = false;
    });
    return fallback;
  }
};