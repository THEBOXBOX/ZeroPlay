import express from 'express';
import { BenefitController } from '../controllers/BenefitController';

const router = express.Router();

// 혜택 목록 조회 (카테고리 필터링이 핵심)
router.get('/', BenefitController.getBenefits);

// 특정 혜택 상세 조회
router.get('/:id', BenefitController.getBenefitById);

export default router;  // 이 줄이 중요!