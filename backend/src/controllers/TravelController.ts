import { Request, Response } from 'express';

export class TravelController {
  // AI 기반 맞춤 코스 추천
  static async getRecommendations(req: Request, res: Response) {
    try {
      const { budget, interests, duration, companions } = req.body;
      
      // TODO: AI 추천 로직 구현
      const mockRecommendations = [
        {
          id: 1,
          title: "강릉 로컬 카페투어",
          budget: 80000,
          duration: "1박 2일",
          highlights: ["숨겨진 로컬 카페", "바다뷰 맛집", "사진 명소"],
          estimatedCost: {
            transportation: 30000,
            accommodation: 35000,
            food: 15000
          }
        }
      ];

      res.json({
        success: true,
        data: mockRecommendations
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to get recommendations'
      });
    }
  }

  // 지역별 로컬 체험 프로그램 조회
  static async getLocalExperiences(req: Request, res: Response) {
    try {
      const { region } = req.params;
      
      // TODO: 데이터베이스 연동
      const mockExperiences = [
        {
          id: 1,
          name: "도자기 만들기 체험",
          region: region,
          price: 25000,
          duration: "2시간",
          rating: 4.8,
          isYouthOwned: true
        }
      ];

      res.json({
        success: true,
        data: mockExperiences
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to get local experiences'
      });
    }
  }

  // 여행지 상세 정보
  static async getDestinationDetail(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      // TODO: 데이터베이스에서 상세 정보 조회
      const mockDetail = {
        id: parseInt(id),
        name: "강릉 안목해변",
        description: "커피거리로 유명한 해변",
        photos: [],
        crowdLevel: "보통",
        bestPhotoSpots: ["일출 포인트", "커피거리 입구"],
        localTips: ["평일 오전 방문 권장", "주차장 혼잡 주의"]
      };

      res.json({
        success: true,
        data: mockDetail
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to get destination detail'
      });
    }
  }
}