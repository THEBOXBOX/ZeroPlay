import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// 한글 → DB enum 매핑 (테이블 스키마 그대로 사용)
const CATEGORY_MAP = {
  '체험': 'experience',
  '문화': 'culture',
  '맛집': 'restaurant',
  '카페': 'cafe',
} as const;

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const categoryParam = searchParams.get('category');  // '전체' | '체험' | '문화' | '맛집' | '카페' | null
    const limitParam = searchParams.get('limit');
    const limit = Math.min(parseInt(limitParam || '50', 10) || 50, 200);

    // ✅ SQL 안 씀: supabase-js로 간단 select만
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    let query = supabase
      .from('local_spots')
      .select('*')
      .eq('is_active', true)
      .limit(limit);

    if (categoryParam && categoryParam !== '전체') {
      const dbCat =
        CATEGORY_MAP[categoryParam as keyof typeof CATEGORY_MAP] ?? null;
      if (dbCat) query = query.eq('category', dbCat);
    }

    const { data: rows, error } = await query;
    if (error) throw error;

    return NextResponse.json(
      {
        success: true,
        count: rows?.length ?? 0,
        spots: rows ?? [],
        filters: {
          category: categoryParam ?? null,
          limit,
        },
      },
      { status: 200 }
    );
  } catch (e: any) {
    console.error('/api/spots GET error:', e?.message || e);
    // 실패도 래핑 구조 유지
    return NextResponse.json(
      {
        success: false,
        count: 0,
        spots: [],
        filters: { category: null, limit: 0 },
        error: String(e?.message || e),
      },
      { status: 200 }
    );
  }
}