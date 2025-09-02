import { Request, Response } from 'express';

export class BenefitController {
  // 청년 혜택 정보 조회
  static async getYouthBenefits(req: Request, res: Response) {
    try {
      const mockBenefits = [
        {
          id: 1,
          title: "청년 문화패스",
          category: "문화",
          discount: "월 5만원 지원",
          eligibility: "만 18~34세",
          description: "공연, 전시, 영화 등 문화활동 지원"
        },
        {
          id: 2,
          title: "KTX 청년 할인",
          category: "교통",
          discount: "최대 30% 할인",
          eligibility: "만 13~28세",
          description: "KTX 승차권 할인"
        }
      ];

      res.json({
        success: true,
        data: mockBenefits
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to get youth benefits'
      });
    }
  }

  // 지역별 할인 정보
  static async getRegionalDiscounts(req: Request, res: Response) {
    try {
      const { region } = req.params;
      
      const mockDiscounts = [
        {
          id: 1,
          businessName: "강릉 로컬 카페",
          discount: "아메리카노 1+1",
          region: region,
          validUntil: "2024-12-31"
        }
      ];

      res.json({
        success: true,
        data: mockDiscounts
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to get regional discounts'
      });
    }
  }
}