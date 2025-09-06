import express from 'express';
import { TravelController } from '../controllers/TravelController';

const router = express.Router();

// AI 기반 맞춤 코스 추천
router.post('/recommend', TravelController.getRecommendations);

// 지역별 로컬 체험 프로그램 조회
router.get('/local-experiences/:region', TravelController.getLocalExperiences);

// 여행지 상세 정보
router.get('/destination/:id', TravelController.getDestinationDetail);

export default router;