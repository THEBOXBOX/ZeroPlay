import express from 'express';
import { AIController } from '../controllers/AIController';

const router = express.Router();
const aiController = new AIController();

// AI 채팅
router.post('/chat', aiController.chatWithAI);

// AI 코스 생성
router.post('/generate-routes', aiController.generateRoutes);

// 필터 기반 장소 검색 (테스트용)
router.get('/search-places', aiController.searchPlaces);

export default router;