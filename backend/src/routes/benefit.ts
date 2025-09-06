import express from 'express';
import { BenefitController } from '../controllers/BenefitController';

const router = express.Router();

// 청년 혜택 정보 조회
router.get('/youth', BenefitController.getYouthBenefits);

// 지역별 할인 정보
router.get('/regional/:region', BenefitController.getRegionalDiscounts);

export default router;