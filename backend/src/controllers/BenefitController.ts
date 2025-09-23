import { Request, Response } from 'express';
import { supabase } from '../config/supabase';

type RegionCode =
  | 'all' | 'national' | 'seoul' | 'capital_area'
  | 'gangwon' | 'chungcheong' | 'jeolla' | 'gyeongsang' | 'jeju';

// 지역 매핑 - 프론트엔드 지역명 → 백엔드 region_id
const REGION_MAPPING = {
  '전체': 'all',
  '전국': 'national', 
  '서울': 'seoul',
  '수도권': 'capital_area',
  '강원': 'gangwon',
  '충청': 'chungcheong', 
  '전라': 'jeolla',
  '경상': 'gyeongsang',
  '제주': 'jeju'
};

const CAPITAL_AREA_SET = ['incheon', 'gyeonggi', 'capital_area'];

function parseOrgYear(provider?: string) {
  const org = provider?.split('•')[0]?.trim() || provider || '';
  const yearMatch = provider?.match(/(\d{4})\s*년/);
  const year = yearMatch ? yearMatch[1] : '';
  return { organization: org, year };
}

function getAmountTypeKorean(amountType: string): string {
  const map: Record<string, string> = {
    cash: '현금지원',
    grant: '지원금',
    discount_rate: '할인',
    coupon: '쿠폰',
    voucher: '바우처',
    points: '포인트',
    free: '무료',
    education: '교육',
    unlimited_pass: '무제한',
  };
  return map[amountType] || '혜택';
}

function determineType(amountType: string): 'free' | 'discount' {
  // 무료 타입들
  const freeTypes = ['free', 'education'];
  
  // 나머지는 모두 혜택(할인/지원금) 타입
  return freeTypes.includes(amountType) ? 'free' : 'discount';
}

export class BenefitController {
  static async getBenefits(req: Request, res: Response): Promise<void> {
    try {
      const rawCategory = String(req.query.category ?? '전체');
      const rawRegion   = String(req.query.region ?? '전체');
      const rawType     = String(req.query.type ?? '전체');

      console.log('받은 파라미터:', { rawCategory, rawRegion, rawType });

      // 정규화
      const categoryParam = rawCategory === '전체' ? 'all' : rawCategory;
      
      // 지역 매핑 적용
      const regionParam = REGION_MAPPING[rawRegion as keyof typeof REGION_MAPPING] || 'all';
      
      // 타입 매핑: "혜택" → "discount", "무료" → "free"
      const typeParam =
        rawType === '전체' ? 'all' :
        rawType === '무료' ? 'free' :
        rawType === '혜택' ? 'discount' : 'all';

      console.log('매핑된 파라미터:', { categoryParam, regionParam, typeParam });

      const needRegionFilter = regionParam !== 'all';

      const selectBase = needRegionFilter
        ? `
          id, title, provider, category_id, amount, amount_type,
          target_summary, period_text, is_ongoing, deadline_status,
          priority, status, created_at, updated_at,
          benefit_regions!inner(region_id),
          benefit_tag_relations(benefit_tags(name))
        `
        : `
          id, title, provider, category_id, amount, amount_type,
          target_summary, period_text, is_ongoing, deadline_status,
          priority, status, created_at, updated_at,
          benefit_regions(region_id),
          benefit_tag_relations(benefit_tags(name))
        `;

      let query = supabase
        .from('benefits')
        .select(selectBase)
        .eq('status', 'active')
        .order('priority', { ascending: true })
        .order('updated_at', { ascending: false })
        .order('id', { ascending: false });

      // 카테고리 필터
      if (categoryParam !== 'all') {
        const cat = categoryParam === '무료' ? 'free' : categoryParam;
        query = query.eq('category_id', cat);
      }

      // 지역 필터 적용
      if (needRegionFilter) {
        console.log('지역 필터 적용:', regionParam);
        
        if (regionParam === 'capital_area') {
          // 수도권: 인천, 경기, capital_area 모두 포함
          query = query.in('benefit_regions.region_id', CAPITAL_AREA_SET);
        } else {
          // 일반 지역
          query = query.eq('benefit_regions.region_id', regionParam);
        }
      }

      const { data, error } = await query;
      if (error) {
        console.error('Database error:', error);
        res.status(500).json({ success: false, error: 'Database error' });
        return;
      }

      console.log('데이터베이스 조회 결과:', data?.length || 0, '개');

      const formatted = (data ?? []).map((row: any) => {
        const { organization, year } = parseOrgYear(row.provider);
        const tags =
          (row.benefit_tag_relations ?? [])
            .map((r: any) => r.benefit_tags?.name)
            .filter(Boolean);

        const regions =
          (row.benefit_regions ?? [])
            .map((r: any) => r.region_id);

        const amountTypeKo = getAmountTypeKorean(row.amount_type);
        const type = determineType(row.amount_type);

        return {
          id: row.id,
          title: row.title || '제목 없음',
          organization: `${organization}${year ? ` • ${year}년` : ''}`,
          year,
          amount: row.amount || '미정',
          amountType: amountTypeKo,
          category: row.category_id,
          period: row.period_text || '상시',
          age: row.target_summary || '전 연령',
          details: '상세보기를 통해 확인하세요',
          region: regions[0] || 'national',
          regions,
          is_ongoing: !!row.is_ongoing,
          tags,
          priority: row.priority,
          deadline_status: row.deadline_status,
          type,
          amount_type: row.amount_type
        };
      });

      // 타입 필터 적용 (데이터 변환 후)
      let result = formatted;
      if (typeParam !== 'all') {
        console.log('타입 필터 적용 전:', result.length, '개');
        console.log('필터 조건:', typeParam);
        
        if (typeParam === 'free') {
          result = result.filter(v => v.type === 'free');
        } else if (typeParam === 'discount') {
          result = result.filter(v => v.type === 'discount');
        }
        
        console.log('타입 필터 적용 후:', result.length, '개');
      }

      console.log('최종 반환 데이터:', result.length, '개');
      res.json({ success: true, data: result, count: result.length });
    } catch (e) {
      console.error('Server error:', e);
      res.status(500).json({ success: false, error: 'Server error' });
    }
  }

  // 상세 조회
  static async getBenefitById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const { data, error } = await supabase
        .from('benefits')
        .select(`
          id, title, provider, category_id, amount, amount_type,
          target_summary, period_text, is_ongoing,
          website_url,
          detailed_content, eligibility_details, application_process, important_notes,
          priority, created_at, updated_at,
          benefit_regions(region_id),
          benefit_tag_relations(benefit_tags(name))
        `)
        .eq('id', id)
        .eq('status', 'active')
        .single();

      if (error || !data) {
        console.error('Database error:', error);
        res.status(404).json({ success: false, error: 'Benefit not found' });
        return;
      }

      const { organization, year } = parseOrgYear(data.provider);
      const regions = (data.benefit_regions ?? []).map((r: any) => r.region_id);
      const tags = (data.benefit_tag_relations ?? [])
        .map((r: any) => r.benefit_tags?.name)
        .filter(Boolean);

      const detail = {
        id: data.id,
        title: data.title,
        organization,
        year,
        category: data.category_id,
        amount: data.amount,
        amount_type: data.amount_type,
        amountTypeKorean: getAmountTypeKorean(data.amount_type),
        eligibility: data.target_summary,
        period: data.period_text,
        is_ongoing: !!data.is_ongoing,
        website_url: data.website_url || '',
        application_url: data.website_url || '',
        info_url: data.website_url || '',
        phone_number: '',
        detailed_content: data.detailed_content || '상세 내용이 준비 중입니다.',
        eligibility_details: data.eligibility_details || '자격 조건을 확인해주세요.',
        application_process: data.application_process || '신청 방법을 확인해주세요.',
        important_notes: data.important_notes || '유의사항을 확인해주세요.',
        priority: data.priority,
        regions,
        tags,
        created_at: data.created_at,
        updated_at: data.updated_at,
      };

      res.json({ success: true, data: detail });
    } catch (e) {
      console.error('Server error:', e);
      res.status(500).json({ success: false, error: 'Server error' });
    }
  }


  // 북마크 추가
  static async addBookmark(req: Request, res: Response): Promise<void> {
    try {
      const { benefit_id } = req.body;
      const user_id = req.headers['x-user-id'] || 'anonymous';

      // 이미 북마크했는지 확인
      const { data: existing } = await supabase
        .from('benefit_bookmarks')
        .select('id')
        .eq('benefit_id', benefit_id)
        .eq('user_id', user_id)
        .single();

      if (existing) {
        res.status(400).json({ success: false, error: 'Already bookmarked' });
        return;
      }

      const { data, error } = await supabase
        .from('benefit_bookmarks')
        .insert([{ benefit_id, user_id }])
        .select()
        .single();

      if (error) {
        console.error('북마크 추가 오류:', error);
        res.status(500).json({ success: false, error: 'Database error' });
        return;
      }

      res.json({ success: true, data });
    } catch (e) {
      console.error('Server error:', e);
      res.status(500).json({ success: false, error: 'Server error' });
    }
  }

  // 북마크 삭제
  static async removeBookmark(req: Request, res: Response): Promise<void> {
    try {
      const { benefit_id } = req.params;
      const user_id = req.headers['x-user-id'] || 'anonymous';

      const { error } = await supabase
        .from('benefit_bookmarks')
        .delete()
        .eq('benefit_id', benefit_id)
        .eq('user_id', user_id);

      if (error) {
        console.error('북마크 삭제 오류:', error);
        res.status(500).json({ success: false, error: 'Database error' });
        return;
      }

      res.json({ success: true });
    } catch (e) {
      console.error('Server error:', e);
      res.status(500).json({ success: false, error: 'Server error' });
    }
  }

  // 내 북마크 목록 조회
  static async getMyBookmarks(req: Request, res: Response): Promise<void> {
    try {
      const user_id = req.headers['x-user-id'] || 'anonymous';

      const { data, error } = await supabase
        .from('benefit_bookmarks')
        .select(`
          benefit_id,
          created_at,
          benefits!inner(
            id, title, provider, amount, amount_type,
            category_id, target_summary, period_text,
            benefit_regions(region_id),
            benefit_tag_relations(benefit_tags(name))
          )
        `)
        .eq('user_id', user_id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('북마크 조회 오류:', error);
        res.status(500).json({ success: false, error: 'Database error' });
        return;
      }

      const formatted = (data ?? []).map((row: any) => {
        const benefit = row.benefits;
        const { organization, year } = parseOrgYear(benefit.provider);
        const tags = (benefit.benefit_tag_relations ?? [])
          .map((r: any) => r.benefit_tags?.name)
          .filter(Boolean);
        const regions = (benefit.benefit_regions ?? [])
          .map((r: any) => r.region_id);

        const amountTypeKo = getAmountTypeKorean(benefit.amount_type);
        const type = determineType(benefit.amount_type);

        return {
          id: benefit.id,
          title: benefit.title,
          organization: `${organization}${year ? ` • ${year}년` : ''}`,
          year,
          amount: benefit.amount,
          amountType: amountTypeKo,
          category: benefit.category_id,
          period: benefit.period_text,
          age: benefit.target_summary,
          region: regions[0] || 'national',
          regions,
          tags,
          type,
          amount_type: benefit.amount_type,
          bookmarked_at: row.created_at
        };
      });

      res.json({ success: true, data: formatted, count: formatted.length });
    } catch (e) {
      console.error('Server error:', e);
      res.status(500).json({ success: false, error: 'Server error' });
    }
  }

  // 북마크 상태 확인
  static async checkBookmarkStatus(req: Request, res: Response): Promise<void> {
    try {
      const { benefit_id } = req.params;
      const user_id = req.headers['x-user-id'] || 'anonymous';

      const { data, error } = await supabase
        .from('benefit_bookmarks')
        .select('id')
        .eq('benefit_id', benefit_id)
        .eq('user_id', user_id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('북마크 상태 확인 오류:', error);
        res.status(500).json({ success: false, error: 'Database error' });
        return;
      }

      res.json({ success: true, isBookmarked: !!data });
    } catch (e) {
      console.error('Server error:', e);
      res.status(500).json({ success: false, error: 'Server error' });
    }
  }


  private static getAmountTypeKorean = getAmountTypeKorean;
  private static determineType = determineType;

  static async getYouthBenefits(req: Request, res: Response) { /* ... */ }
  static async getRegionalDiscounts(req: Request, res: Response) { /* ... */ }
}