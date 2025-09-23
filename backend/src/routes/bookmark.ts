import express from 'express';
import { BookmarkController } from '../controllers/BookmarkController';

const router = express.Router();
const bookmarkController = new BookmarkController();

// AI 루트 북마크
router.post('/ai-route', bookmarkController.saveAIRoute);
router.get('/ai-routes/:sessionId', bookmarkController.getAIBookmarks);
router.delete('/ai-route/:bookmarkId', bookmarkController.deleteAIBookmark);

// 북마크 통계
router.get('/summary/:sessionId', bookmarkController.getBookmarkSummary);

export default router;