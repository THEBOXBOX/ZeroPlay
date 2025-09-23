import { Request, Response } from 'express';
import { supabase } from '../config/supabase';

export class BookmarkController {
  /**
   * AI 루트 북마크 저장
   */
  saveAIRoute = async (req: Request, res: Response): Promise<void> => {
    try {
      const { sessionId, routeData } = req.body;

      if (!sessionId || !routeData) {
        res.status(400).json({
          success: false,
          message: 'sessionId와 routeData가 필요합니다.'
        });
        return;
      }

      // 중복 체크
      const { data: existingBookmark } = await supabase
        .from('ai_bookmarks')
        .select('id')
        .eq('user_session_id', sessionId)
        .eq('route_id', routeData.id)
        .single();

      if (existingBookmark) {
        res.status(409).json({
          success: false,
          message: '이미 북마크된 코스입니다.'
        });
        return;
      }

      // 북마크 저장
      const { data, error } = await supabase
        .from('ai_bookmarks')
        .insert([
          {
            user_session_id: sessionId,
            route_id: routeData.id,
            title: routeData.title,
            route_data: routeData,
            created_at: new Date().toISOString()
          }
        ])
        .select()
        .single();

      if (error) throw error;

      res.json({
        success: true,
        data: {
          bookmarkId: data.id,
          message: '북마크에 저장되었습니다!'
        }
      });
    } catch (error) {
      console.error('Error saving AI route bookmark:', error);
      res.status(500).json({
        success: false,
        message: '북마크 저장 중 오류가 발생했습니다.'
      });
    }
  };

  /**
   * AI 루트 북마크 목록 조회
   */
  getAIBookmarks = async (req: Request, res: Response): Promise<void> => {
    try {
      const { sessionId } = req.params;

      if (!sessionId) {
        res.status(400).json({
          success: false,
          message: 'sessionId가 필요합니다.'
        });
        return;
      }

      const { data, error } = await supabase
        .from('ai_bookmarks')
        .select('*')
        .eq('user_session_id', sessionId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      res.json({
        success: true,
        data: {
          bookmarks: data || [],
          count: data?.length || 0
        }
      });
    } catch (error) {
      console.error('Error fetching AI bookmarks:', error);
      res.status(500).json({
        success: false,
        message: '북마크 목록 조회 중 오류가 발생했습니다.'
      });
    }
  };

  /**
   * AI 루트 북마크 삭제
   */
  deleteAIBookmark = async (req: Request, res: Response): Promise<void> => {
    try {
      const { bookmarkId } = req.params;
      const { sessionId } = req.body;

      if (!bookmarkId || !sessionId) {
        res.status(400).json({
          success: false,
          message: 'bookmarkId와 sessionId가 필요합니다.'
        });
        return;
      }

      const { error } = await supabase
        .from('ai_bookmarks')
        .delete()
        .eq('id', bookmarkId)
        .eq('user_session_id', sessionId);

      if (error) throw error;

      res.json({
        success: true,
        message: '북마크가 삭제되었습니다.'
      });
    } catch (error) {
      console.error('Error deleting AI bookmark:', error);
      res.status(500).json({
        success: false,
        message: '북마크 삭제 중 오류가 발생했습니다.'
      });
    }
  };

  /**
   * 전체 북마크 통계 조회 (마이페이지용)
   */
  getBookmarkSummary = async (req: Request, res: Response): Promise<void> => {
    try {
      const { sessionId } = req.params;

      if (!sessionId) {
        res.status(400).json({
          success: false,
          message: 'sessionId가 필요합니다.'
        });
        return;
      }

      // AI 루트 북마크 수
      const { data: aiBookmarks } = await supabase
        .from('ai_bookmarks')
        .select('id')
        .eq('user_session_id', sessionId);

      // 청년혜택 북마크 수 (가정)
      const { data: benefitBookmarks } = await supabase
        .from('benefit_bookmarks')
        .select('id')
        .eq('user_session_id', sessionId);

      // 지도 북마크 수 (가정)  
      const { data: mapBookmarks } = await supabase
        .from('map_bookmarks')
        .select('id')
        .eq('user_session_id', sessionId);

      res.json({
        success: true,
        data: {
          aiRoutes: aiBookmarks?.length || 0,
          benefits: benefitBookmarks?.length || 0,
          mapPlaces: mapBookmarks?.length || 0,
          total: (aiBookmarks?.length || 0) + (benefitBookmarks?.length || 0) + (mapBookmarks?.length || 0)
        }
      });
    } catch (error) {
      console.error('Error fetching bookmark summary:', error);
      res.status(500).json({
        success: false,
        message: '북마크 통계 조회 중 오류가 발생했습니다.'
      });
    }
  };
}