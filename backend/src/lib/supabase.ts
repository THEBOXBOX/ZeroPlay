import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// 환경변수 명시적 로드
dotenv.config()

console.log('🔍 환경변수 확인:')
console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? '✅ 설정됨' : '❌ 없음')
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ 설정됨' : '❌ 없음')

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl) {
  throw new Error('❌ SUPABASE_URL 환경변수가 설정되지 않았습니다!')
}

if (!supabaseKey) {
  throw new Error('❌ SUPABASE_SERVICE_ROLE_KEY 환경변수가 설정되지 않았습니다!')
}

export const supabase = createClient(supabaseUrl, supabaseKey)