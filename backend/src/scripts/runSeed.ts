import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { seedData } from './seedData';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ SUPABASE_URL 또는 SUPABASE_SERVICE_KEY가 없습니다.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

(async () => {
  try {
    console.log('🚀 시드 데이터 스크립트 시작');
    await seedData(supabase);
    process.exit(0);
  } catch (err) {
    console.error('❌ 시드 데이터 삽입 중 오류:', err);
    process.exit(1);
  }
})();
