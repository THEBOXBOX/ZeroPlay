'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

export default function TestPage() {
  const [backendTest, setBackendTest] = useState<any>(null)
  const [frontendTest, setFrontendTest] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    testConnections()
  }, [])

  const testConnections = async () => {
    setLoading(true)
    
    // 1️⃣ Backend API 테스트
    try {
      const backendResponse = await fetch('http://localhost:3001/api/test/db-connection')
      const backendData = await backendResponse.json()
      setBackendTest(backendData)
    } catch (error) {
      setBackendTest({ 
        success: false, 
        message: 'Backend 서버 연결 실패',
        error: (error as Error).message 
      })
    }

    // 2️⃣ Frontend Supabase 직접 테스트
    try {
      const { data, error } = await supabase
        .from('local_spots')
        .select('id')
        .limit(1)
      
      if (error) {
        setFrontendTest({ 
          success: false, 
          message: 'Frontend Supabase 연결 실패',
          error: error.message 
        })
      } else {
        setFrontendTest({ 
          success: true, 
          message: 'Frontend Supabase 연결 성공!',
          data 
        })
      }
    } catch (error) {
      setFrontendTest({ 
        success: false, 
        message: 'Frontend 연결 에러',
        error: (error as Error).message 
      })
    }

    setLoading(false)
  }

  const testBackendSpots = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/test/spots')
      const data = await response.json()
      alert(`Backend 스팟 데이터: ${JSON.stringify(data, null, 2)}`)
    } catch (error) {
      alert(`Backend API 에러: ${(error as Error).message}`)
    }
  }

  const testFrontendSpots = async () => {
    try {
      const { data, error } = await supabase
        .from('local_spots')
        .select('*')
        .limit(3)
      
      if (error) {
        alert(`Frontend Supabase 에러: ${error.message}`)
      } else {
        alert(`Frontend 스팟 데이터: ${JSON.stringify(data, null, 2)}`)
      }
    } catch (error) {
      alert(`Frontend 에러: ${(error as Error).message}`)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">연결 테스트 중...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8 text-center">🧪 Supabase 연동 테스트</h1>
      
      {/* Backend 테스트 결과 */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-2xl font-semibold mb-4">🔧 Backend 연결 테스트</h2>
        <div className={`p-4 rounded-lg ${backendTest?.success ? 'bg-green-100 border border-green-300' : 'bg-red-100 border border-red-300'}`}>
          <div className={`text-lg font-medium ${backendTest?.success ? 'text-green-800' : 'text-red-800'}`}>
            {backendTest?.success ? '✅ 성공' : '❌ 실패'}
          </div>
          <div className="text-sm mt-2">
            <strong>메시지:</strong> {backendTest?.message}
          </div>
          {backendTest?.error && (
            <div className="text-sm mt-1 text-red-600">
              <strong>에러:</strong> {backendTest.error}
            </div>
          )}
        </div>
        <button 
          onClick={testBackendSpots}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Backend 스팟 데이터 가져오기 테스트
        </button>
      </div>

      {/* Frontend 테스트 결과 */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-2xl font-semibold mb-4">🖥️ Frontend 연결 테스트</h2>
        <div className={`p-4 rounded-lg ${frontendTest?.success ? 'bg-green-100 border border-green-300' : 'bg-red-100 border border-red-300'}`}>
          <div className={`text-lg font-medium ${frontendTest?.success ? 'text-green-800' : 'text-red-800'}`}>
            {frontendTest?.success ? '✅ 성공' : '❌ 실패'}
          </div>
          <div className="text-sm mt-2">
            <strong>메시지:</strong> {frontendTest?.message}
          </div>
          {frontendTest?.error && (
            <div className="text-sm mt-1 text-red-600">
              <strong>에러:</strong> {frontendTest.error}
            </div>
          )}
        </div>
        <button 
          onClick={testFrontendSpots}
          className="mt-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Frontend 스팟 데이터 가져오기 테스트
        </button>
      </div>

      {/* 재테스트 버튼 */}
      <div className="text-center">
        <button 
          onClick={testConnections}
          className="px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 text-lg"
        >
          🔄 다시 테스트하기
        </button>
      </div>

      {/* 설정 가이드 */}
      <div className="bg-gray-100 rounded-lg p-6 mt-8">
        <h3 className="text-lg font-semibold mb-3">❌ 연결 실패 시 확인사항</h3>
        <ul className="text-sm space-y-1 list-disc list-inside">
          <li><strong>Backend:</strong> <code>backend/.env</code> 파일의 SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY 확인</li>
          <li><strong>Frontend:</strong> <code>frontend/.env.local</code> 파일의 NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY 확인</li>
          <li><strong>서버:</strong> Backend 서버가 localhost:3001에서 실행 중인지 확인</li>
          <li><strong>DB:</strong> Supabase에서 통합 스키마 SQL이 실행되었는지 확인</li>
        </ul>
      </div>
    </div>
  )
}