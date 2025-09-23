// backend/src/services/BookmarkService.ts
import { supabase } from '../config/supabase';

export interface BookmarkedRoute {
  id: number;
  user_session_id: string;
  route_data: any;
  title: string;
  total_budget: number;
  duration: string;
  difficulty: string;
  highlights: string[];
  created_at: string;
  updated_at: string;
}

export interface CreateBookmarkRequest {
  sessionId: string;
  routeData: any;
  title: string;
  totalBudget: number;
  duration: string;
  difficulty: string;
  highlights: string[];
}

export class BookmarkService {
  
  /**
   * 코스 북마크 저장
   */
  async saveRoute(bookmarkData: CreateBookmarkRequest): Promise<BookmarkedRoute | null> {
    try {
      const { data, error } = await supabase
        .from('bookmarked_routes')
        .insert({
          user_session_id: bookmarkData.sessionId,
          route_data: bookmarkData.routeData,
          title: bookmarkData.title,
          total_budget: bookmarkData.totalBudget,
          duration: bookmarkData.duration,
          difficulty: bookmarkData.difficulty,
          highlights: bookmarkData.highlights
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error saving bookmark:', error);
      return null;
    }
  }

  /**
   * 사용자의 북마크된 코스 조회
   */
  async getUserBookmarks(sessionId: string): Promise<BookmarkedRoute[]> {
    try {
      const { data, error } = await supabase
        .from('bookmarked_routes')
        .select('*')
        .eq('user_session_id', sessionId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
      return [];
    }
  }

  /**
   * 북마크 삭제
   */
  async deleteBookmark(bookmarkId: number, sessionId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('bookmarked_routes')
        .delete()
        .eq('id', bookmarkId)
        .eq('user_session_id', sessionId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting bookmark:', error);
      return false;
    }
  }

  /**
   * 북마크 수정
   */
  async updateBookmark(bookmarkId: number, sessionId: string, updates: Partial<CreateBookmarkRequest>): Promise<BookmarkedRoute | null> {
    try {
      const updateData: any = {};
      
      if (updates.title) updateData.title = updates.title;
      if (updates.routeData) updateData.route_data = updates.routeData;
      if (updates.totalBudget) updateData.total_budget = updates.totalBudget;
      if (updates.duration) updateData.duration = updates.duration;
      if (updates.difficulty) updateData.difficulty = updates.difficulty;
      if (updates.highlights) updateData.highlights = updates.highlights;
      
      updateData.updated_at = new Date().toISOString();

      const { data, error } = await supabase
        .from('bookmarked_routes')
        .update(updateData)
        .eq('id', bookmarkId)
        .eq('user_session_id', sessionId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating bookmark:', error);
      return null;
    }
  }

  /**
   * 사용자별 북마크 통계
   */
  async getUserBookmarkStats(sessionId: string): Promise<{
    totalBookmarks: number;
    totalBudget: number;
    averageRating: number;
    mostLikedCategory: string;
  }> {
    try {
      const bookmarks = await this.getUserBookmarks(sessionId);
      
      const totalBookmarks = bookmarks.length;
      const totalBudget = bookmarks.reduce((sum, b) => sum + (b.total_budget || 0), 0);
      
      // 가장 많이 북마크한 카테고리 찾기
      const categories: { [key: string]: number } = {};
      bookmarks.forEach(bookmark => {
        const places = bookmark.route_data?.places || [];
        places.forEach((place: any) => {
          const category = place.type || 'unknown';
          categories[category] = (categories[category] || 0) + 1;
        });
      });
      
      const mostLikedCategory = Object.entries(categories)
        .sort(([,a], [,b]) => b - a)[0]?.[0] || 'none';

      return {
        totalBookmarks,
        totalBudget,
        averageRating: 0, // 추후 리뷰 기능 추가시 구현
        mostLikedCategory
      };
    } catch (error) {
      console.error('Error fetching user stats:', error);
      return {
        totalBookmarks: 0,
        totalBudget: 0,
        averageRating: 0,
        mostLikedCategory: 'none'
      };
    }
  }

  /**
   * 개별 장소 북마크 저장
   */
  async savePlaceBookmark(sessionId: string, placeId: number, memo?: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('bookmarked_places')
        .insert({
          user_session_id: sessionId,
          place_id: placeId,
          memo: memo || null
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error saving place bookmark:', error);
      return false;
    }
  }

  /**
   * 사용자의 북마크된 장소 조회
   */
  async getUserPlaceBookmarks(sessionId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('bookmarked_places')
        .select(`
          *,
          travel_destinations (
            id, name, description, address, latitude, longitude,
            rating, image_url, tags, category
          )
        `)
        .eq('user_session_id', sessionId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching place bookmarks:', error);
      return [];
    }
  }

  /**
   * 개별 장소 북마크 삭제
   */
  async deletePlaceBookmark(sessionId: string, placeId: number): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('bookmarked_places')
        .delete()
        .eq('user_session_id', sessionId)
        .eq('place_id', placeId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting place bookmark:', error);
      return false;
    }
  }
}