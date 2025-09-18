import { Request, Response } from 'express';
import { supabase } from '../config/supabase';

export class BenefitController {
  static async getBenefits(req: Request, res: Response): Promise<void> {
    try {
      const { category, region, type } = req.query;
      
      let query = supabase
        .from('benefits')
        .select(`
          id,
          title,
          provider,
          amount,
          amount_type,
          target_summary,
          period_text,
          description,
          category_id,
          status
        `)
        .eq('status', 'active');

      // 카테고리 필터링
      if (category && category !== '전체') {
        query = query.eq('category_id', category);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Database error:', error);
        res.status(500).json({ error: 'Database error' });
        return;
      }

      // 프론트엔드 형식에 맞게 변환
      const formattedData = data?.map(item => ({
        id: item.id,
        title: item.title || '제목 없음',
        organization: item.provider || '주관기관 미정',
        amount: BenefitController.formatAmount(item.amount, item.amount_type),
        amountType: BenefitController.getAmountTypeKorean(item.amount_type),
        tags: BenefitController.generateTags(item.amount_type, item.category_id),
        period: item.period_text || '상시',
        age: item.target_summary || '전 연령',
        details: item.description || '상세 정보가 준비 중입니다.',
        category: item.category_id,
        region: '전국', // 임시
        type: BenefitController.determineType(item.amount, item.amount_type)
      }));

      res.json({
        success: true,
        data: formattedData || []
      });
    } catch (error) {
      console.error('Server error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }

  static async getBenefitById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      const { data, error } = await supabase
        .from('benefits')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Database error:', error);
        res.status(404).json({ error: 'Benefit not found' });
        return;
      }

      res.json({ success: true, data });
    } catch (error) {
      console.error('Server error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }

  // 헬퍼 메서드들
  private static formatAmount(amount: string, amountType: string): string {
    if (!amount) return '미정';
    
    // 이미 올바른 금액 형식인 경우
    if (amount.includes('원') || amount.includes('%') || amount === '무료') {
      return amount;
    }
    
    // amount_type이 실제 금액에 들어간 경우 처리
    switch(amountType) {
      case 'free':
        return '무료';
      case 'cash':
        return amount.includes('원') ? amount : `${amount}`;
      case 'discount_rate':
        return amount.includes('%') ? amount : `${amount}%`;
      case 'coupon':
        return amount.includes('쿠폰') ? amount : `${amount} 쿠폰`;
      default:
        return amount;
    }
  }

  private static getAmountTypeKorean(amountType: string): string {
    switch(amountType) {
      case 'free':
        return '체험';
      case 'cash':
        return '지원금';
      case 'discount_rate':
        return '할인';
      case 'coupon':
        return '쿠폰';
      default:
        return '혜택';
    }
  }

  private static generateTags(amountType: string, categoryId: string): string[] {
    const tags = [];
    
    // amount_type 기반 태그
    if (amountType === 'free') tags.push('무료');
    if (amountType === 'cash') tags.push('현금지원');
    if (amountType === 'discount_rate') tags.push('할인');
    
    // category 기반 태그
    switch(categoryId) {
      case 'culture':
        tags.push('문화');
        break;
      case 'transportation':
        tags.push('교통');
        break;
      case 'accommodation':
        tags.push('숙박');
        break;
      case 'regional':
        tags.push('지역특화');
        break;
    }
    
    // 기본 태그
    tags.push('정부지원');
    
    return tags.slice(0, 3); // 최대 3개만
  }

  private static determineType(amount: string, amountType: string): string {
    if (amountType === 'free' || amount === '무료') {
      return 'free';
    }
    return 'discount';
  }

  // 기존 메서드들 유지
  static async getYouthBenefits(req: Request, res: Response) {
    // 기존 코드...
  }

  static async getRegionalDiscounts(req: Request, res: Response) {
    // 기존 코드...
  }
}