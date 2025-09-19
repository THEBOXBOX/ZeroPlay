// app/api/bookmarks/route.ts - 실제 DB 스키마에 맞춘 버전
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// GET: 사용자 북마크 목록 조회
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');
    
    console.log('🔍 GET /api/bookmarks 요청:', { userId });
    
    if (!userId) {
      console.error('❌ user_id 누락');
      return NextResponse.json(
        { error: 'user_id는 필수 파라미터입니다.' },
        { status: 400 }
      );
    }

    // 🔥 실제 DB 스키마에 맞춘 쿼리 (존재하는 컬럼만 조회)
    const { data: bookmarks, error } = await supabase
      .from('map_bookmarks')
      .select(`
        id,
        bookmark_type,
        created_at,
        spot_id,
        deal_id,
        local_spots:spot_id (
          id,
          name,
          category,
          address,
          description,
          images,
          rating,
          review_count,
          latitude,
          longitude,
          price_range,
          is_active
        ),
        local_deals:deal_id (
          id,
          title,
          description,
          deal_type,
          deal_value,
          original_price,
          start_date,
          end_date,
          is_active
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    console.log('📊 북마크 조회 결과:', { 
      bookmarksCount: bookmarks?.length || 0, 
      error: error?.message || null 
    });

    if (error) {
      console.error('💥 북마크 조회 오류:', error);
      return NextResponse.json(
        { error: '북마크를 불러오는데 실패했습니다.', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true,
      bookmarks: bookmarks || [] 
    });

  } catch (error) {
    console.error('💥 API 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// POST: 북마크 추가
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    const body = await request.json();
    
    const { user_id, spot_id, deal_id, bookmark_type } = body;
    
    console.log('➕ POST /api/bookmarks 요청:', body);

    // 필수 필드 검증
    if (!user_id || !bookmark_type) {
      console.error('❌ 필수 필드 누락:', { user_id, bookmark_type });
      return NextResponse.json(
        { error: 'user_id와 bookmark_type은 필수 필드입니다.' },
        { status: 400 }
      );
    }

    if (bookmark_type === 'spot' && !spot_id) {
      console.error('❌ spot_id 누락');
      return NextResponse.json(
        { error: 'spot 북마크에는 spot_id가 필요합니다.' },
        { status: 400 }
      );
    }

    if (bookmark_type === 'deal' && !deal_id) {
      console.error('❌ deal_id 누락');
      return NextResponse.json(
        { error: 'deal 북마크에는 deal_id가 필요합니다.' },
        { status: 400 }
      );
    }

    // 이미 북마크되어 있는지 확인 (간단한 쿼리)
    let checkQuery = supabase
      .from('map_bookmarks')
      .select('id')
      .eq('user_id', user_id);

    if (bookmark_type === 'spot') {
      checkQuery = checkQuery.eq('spot_id', spot_id);
    } else {
      checkQuery = checkQuery.eq('deal_id', deal_id);
    }

    const { data: existingBookmarks } = await checkQuery;

    if (existingBookmarks && existingBookmarks.length > 0) {
      console.log('⚠️ 이미 북마크 존재:', existingBookmarks[0]);
      return NextResponse.json(
        { error: '이미 북마크에 추가된 항목입니다.' },
        { status: 409 }
      );
    }

    // 북마크 추가
    const insertData = {
      user_id,
      bookmark_type,
      spot_id: bookmark_type === 'spot' ? spot_id : null,
      deal_id: bookmark_type === 'deal' ? deal_id : null,
    };

    console.log('💾 북마크 추가 데이터:', insertData);

    const { data, error } = await supabase
      .from('map_bookmarks')
      .insert([insertData])
      .select()
      .single();

    if (error) {
      console.error('💥 북마크 추가 오류:', error);
      return NextResponse.json(
        { error: '북마크 추가에 실패했습니다.', details: error.message },
        { status: 500 }
      );
    }

    console.log('✅ 북마크 추가 성공:', data);

    return NextResponse.json({ 
      success: true,
      message: '북마크가 추가되었습니다.',
      bookmark: data 
    });

  } catch (error) {
    console.error('💥 API 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// DELETE: 북마크 삭제
export async function DELETE(request: NextRequest) {
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    const { searchParams } = new URL(request.url);
    
    const userId = searchParams.get('user_id');
    const spotId = searchParams.get('spot_id');
    const dealId = searchParams.get('deal_id');

    console.log('🗑️ DELETE /api/bookmarks 요청:', { userId, spotId, dealId });

    if (!userId) {
      console.error('❌ user_id 누락');
      return NextResponse.json(
        { error: 'user_id는 필수 파라미터입니다.' },
        { status: 400 }
      );
    }

    if (!spotId && !dealId) {
      console.error('❌ spot_id, deal_id 모두 누락');
      return NextResponse.json(
        { error: 'spot_id 또는 deal_id 중 하나는 필수입니다.' },
        { status: 400 }
      );
    }

    let query = supabase
      .from('map_bookmarks')
      .delete()
      .eq('user_id', userId);

    if (spotId) {
      query = query.eq('spot_id', spotId);
    }
    if (dealId) {
      query = query.eq('deal_id', dealId);
    }

    const { error } = await query;

    if (error) {
      console.error('💥 북마크 삭제 오류:', error);
      return NextResponse.json(
        { error: '북마크 삭제에 실패했습니다.', details: error.message },
        { status: 500 }
      );
    }

    console.log('✅ 북마크 삭제 성공');

    return NextResponse.json({ 
      success: true,
      message: '북마크가 삭제되었습니다.' 
    });

  } catch (error) {
    console.error('💥 API 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}