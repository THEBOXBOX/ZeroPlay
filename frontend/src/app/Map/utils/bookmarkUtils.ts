// utils/bookmarkUtils.ts - 디버깅 강화 버전
export interface BookmarkData {
  id?: string;
  user_id: string;
  spot_id?: string;
  deal_id?: string;
  bookmark_type: 'spot' | 'deal';
  created_at?: string;
  local_spots?: any;
  local_deals?: any;
}

// 북마크 추가
export const addBookmark = async (
  userId: string, 
  itemId: string, 
  type: 'spot' | 'deal'
): Promise<{ success: boolean; error?: string }> => {
  console.log('🔖 addBookmark 호출:', { userId, itemId, type });
  
  try {
    const body = {
      user_id: userId,
      bookmark_type: type,
      ...(type === 'spot' ? { spot_id: itemId } : { deal_id: itemId })
    };

    console.log('📤 POST 요청 body:', body);

    const response = await fetch('/api/bookmarks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    console.log('📥 POST 응답 상태:', response.status);

    const data = await response.json();
    console.log('📥 POST 응답 데이터:', data);

    if (!response.ok) {
      console.error('❌ POST 실패:', data);
      return { success: false, error: data.error };
    }

    console.log('✅ 북마크 추가 성공');
    return { success: true };
  } catch (error) {
    console.error('💥 북마크 추가 오류:', error);
    return { success: false, error: '북마크 추가 중 오류가 발생했습니다.' };
  }
};

// 북마크 삭제
export const removeBookmark = async (
  userId: string, 
  itemId: string, 
  type: 'spot' | 'deal'
): Promise<{ success: boolean; error?: string }> => {
  console.log('🗑️ removeBookmark 호출:', { userId, itemId, type });
  
  try {
    const params = new URLSearchParams({
      user_id: userId,
      ...(type === 'spot' ? { spot_id: itemId } : { deal_id: itemId })
    });

    const url = `/api/bookmarks?${params.toString()}`;
    console.log('📤 DELETE 요청 URL:', url);

    const response = await fetch(url, {
      method: 'DELETE',
    });

    console.log('📥 DELETE 응답 상태:', response.status);

    const data = await response.json();
    console.log('📥 DELETE 응답 데이터:', data);

    if (!response.ok) {
      console.error('❌ DELETE 실패:', data);
      return { success: false, error: data.error };
    }

    console.log('✅ 북마크 삭제 성공');
    return { success: true };
  } catch (error) {
    console.error('💥 북마크 삭제 오류:', error);
    return { success: false, error: '북마크 삭제 중 오류가 발생했습니다.' };
  }
};

// 사용자 북마크 목록 조회
export const getUserBookmarks = async (
  userId: string
): Promise<{ success: boolean; bookmarks?: BookmarkData[]; error?: string }> => {
  console.log('📋 getUserBookmarks 호출:', { userId });
  
  try {
    const params = new URLSearchParams({
      user_id: userId
    });

    const url = `/api/bookmarks?${params.toString()}`;
    console.log('📤 GET 요청 URL:', url);

    const response = await fetch(url, {
      method: 'GET',
    });

    console.log('📥 GET 응답 상태:', response.status);

    const data = await response.json();
    console.log('📥 GET 응답 데이터:', data);

    if (!response.ok) {
      console.error('❌ GET 실패:', data);
      return { success: false, error: data.error };
    }

    const bookmarks = data.bookmarks || [];
    console.log('✅ 북마크 조회 성공:', { count: bookmarks.length });
    
    return { success: true, bookmarks };
  } catch (error) {
    console.error('💥 북마크 조회 오류:', error);
    return { success: false, error: '북마크 조회 중 오류가 발생했습니다.' };
  }
};

// 특정 아이템이 북마크되어 있는지 확인
export const isBookmarked = async (
  userId: string, 
  itemId: string, 
  type: 'spot' | 'deal'
): Promise<{ success: boolean; isBookmarked?: boolean; error?: string }> => {
  console.log('🔍 isBookmarked 호출:', { userId, itemId, type });
  
  try {
    const result = await getUserBookmarks(userId);
    
    if (!result.success || !result.bookmarks) {
      console.error('❌ 북마크 목록 조회 실패:', result.error);
      return { success: false, error: result.error };
    }

    const bookmarked = result.bookmarks.some(bookmark => {
      if (type === 'spot') {
        return bookmark.spot_id === itemId;
      } else {
        return bookmark.deal_id === itemId;
      }
    });

    console.log('🔍 북마크 확인 결과:', { bookmarked });
    return { success: true, isBookmarked: bookmarked };
  } catch (error) {
    console.error('💥 북마크 확인 오류:', error);
    return { success: false, error: '북마크 확인 중 오류가 발생했습니다.' };
  }
};

// 북마크 토글 (추가/삭제)
export const toggleBookmark = async (
  userId: string, 
  itemId: string, 
  type: 'spot' | 'deal'
): Promise<{ success: boolean; isBookmarked?: boolean; error?: string }> => {
  console.log('🔄 toggleBookmark 호출:', { userId, itemId, type });
  
  try {
    // 먼저 현재 북마크 상태 확인
    const checkResult = await isBookmarked(userId, itemId, type);
    
    if (!checkResult.success) {
      console.error('❌ 북마크 상태 확인 실패:', checkResult.error);
      return { success: false, error: checkResult.error };
    }

    const currentlyBookmarked = checkResult.isBookmarked;
    console.log('🔄 현재 북마크 상태:', currentlyBookmarked);

    // 북마크 상태에 따라 추가하거나 삭제
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
      console.log('✅ 토글 성공, 새 상태:', newBookmarkState);
      return { success: true, isBookmarked: newBookmarkState };
    } else {
      console.error('❌ 토글 실패:', result.error);
      return { success: false, error: result.error };
    }
  } catch (error) {
    console.error('💥 북마크 토글 오류:', error);
    return { success: false, error: '북마크 처리 중 오류가 발생했습니다.' };
  }
};