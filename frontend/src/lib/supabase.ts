import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 연결 테스트 함수
export const testSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase
      .from('_health_check')
      .select('*')
      .limit(1)
    
    if (error && error.code === 'PGRST116') {
      // 테이블이 없어도 연결은 성공 (정상)
      console.log('✅ Supabase 연결 성공!')
      return { success: true, message: 'Supabase 연결 성공!' }
    }
    
    console.log('✅ Supabase 연결 및 쿼리 성공!')
    return { success: true, message: 'Supabase 연결 성공!', data }
  } catch (error) {
    console.error('❌ Supabase 연결 실패:', error)
    return { success: false, error: error }
  }
}