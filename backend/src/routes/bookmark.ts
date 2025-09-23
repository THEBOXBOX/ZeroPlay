// backend/src/routes/bookmark.ts (수정된 버전)
import express from 'express';
import { BookmarkController } from '../controllers/BookmarkController';

const router = express.Router();
const bookmarkController = new BookmarkController();

// ============================================================================
// AI 루트 북마크 관련 라우트
// ============================================================================

// AI 루트 북마크 저장
router.post('/ai-route', (req, res) => bookmarkController.saveAIRoute(req, res));

// AI 루트 북마크 목록 조회
router.get('/ai-routes/:sessionId', (req, res) => bookmarkController.getAIBookmarks(req, res));

// AI 루트 북마크 삭제
router.delete('/ai-route/:bookmarkId', (req, res) => bookmarkController.deleteAIBookmark(req, res));

// ============================================================================
// 청년 혜택 북마크 관련 라우트 (팀원 구현 후 활성화)
// ============================================================================

// 청년 혜택 북마크 저장
router.post('/benefit', (req, res) => bookmarkController.saveBenefitBookmark(req, res));

// 청년 혜택 북마크 목록 조회
router.get('/benefits/:sessionId', (req, res) => bookmarkController.getBenefitBookmarks(req, res));

// 청년 혜택 북마크 삭제
router.delete('/benefit/:bookmarkId', (req, res) => bookmarkController.deleteBenefitBookmark(req, res));

// ============================================================================
// 지도 장소 북마크 관련 라우트 (팀원 구현 후 활성화)
// ============================================================================

// 지도 장소 북마크 저장
router.post('/map-place', (req, res) => bookmarkController.saveMapPlaceBookmark(req, res));

// 지도 장소 북마크 목록 조회
router.get('/map-places/:sessionId', (req, res) => bookmarkController.getMapPlaceBookmarks(req, res));

// 지도 장소 북마크 삭제
router.delete('/map-place/:bookmarkId', (req, res) => bookmarkController.deleteMapPlaceBookmark(req, res));

// ============================================================================
// 통합 북마크 관련 라우트
// ============================================================================

// 북마크 통계 조회
router.get('/summary/:sessionId', (req, res) => bookmarkController.getBookmarkSummary(req, res));

// 모든 북마크 삭제
router.delete('/all/:sessionId', (req, res) => bookmarkController.deleteAllBookmarks(req, res));

export default router;