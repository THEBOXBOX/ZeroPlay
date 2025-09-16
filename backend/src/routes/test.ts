// backend/src/routes/test.ts (새 파일 생성)
import { Router } from 'express'
import { supabase } from '../config/supabase'

const router = Router()

// 1️⃣ DB 연결 확인
router.get('/db-connection', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('local_spots')
      .select('id')
      .limit(1)
    
    if (error) {
      return res.status(500).json({ 
        success: false, 
        message: 'DB 연결 실패', 
        error: error.message 
      })
    }

    return res.json({ 
      success: true, 
      message: 'DB 연결 성공!', 
      data 
    })
  } catch (error) {
    return res.status(500).json({ 
      success: false, 
      message: '연결 에러', 
      error: (error as Error).message 
    })
  }
})

// 2️⃣ 샘플 데이터 가져오기
router.get('/spots', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('local_spots')
      .select('*')
      .limit(5)
    
    if (error) {
      return res.status(500).json({ 
        success: false, 
        error: error.message 
      })
    }

    return res.json({ 
      success: true, 
      count: data.length,
      spots: data 
    })
  } catch (error) {
    return res.status(500).json({ 
      success: false, 
      error: (error as Error).message 
    })
  }
})

export default router