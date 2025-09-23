// frontend/src/lib/api.ts (업데이트된 버전)

const API_BASE_URL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:3001/api' 
  : '/api';

export class ApiClient {
  private static async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    console.log(`API 호출: ${API_BASE_URL}${endpoint}`);

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      console.log(`응답 상태: ${response.status}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API 에러: ${response.status} - ${errorText}`);
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('응답 데이터:', data);
      return data;
    } catch (error) {
      console.error('API 호출 실패:', error);
      throw error;
    }
  }

  // ============================================================================
  // AI 관련 API
  // ============================================================================

  // AI 채팅 API
  static async chatWithAI(message: string, sessionId?: string) {
    return this.request('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ message, sessionId }),
    });
  }

  // AI 코스 생성 API
  static async generateAIRoutes(message: string, filters: any, sessionId?: string) {
    return this.request('/ai/generate-routes', {
      method: 'POST',
      body: JSON.stringify({ message, filters, sessionId }),
    });
  }

  // 필터 기반 장소 검색 API
  static async searchPlaces(filters: any) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        params.append(key, value.join(','));
      } else if (value) {
        params.append(key, String(value));
      }
    });
    return this.request(`/ai/search-places?${params.toString()}`);
  }

  // ============================================================================
  // 북마크 관련 API
  // ============================================================================

  // AI 루트 북마크 저장
  static async saveAIRouteBookmark(sessionId: string, routeData: any) {
    return this.request('/bookmarks/ai-route', {
      method: 'POST',
      body: JSON.stringify({ sessionId, routeData }),
    });
  }

  // AI 루트 북마크 목록 조회
  static async getAIBookmarks(sessionId: string) {
    return this.request(`/bookmarks/ai-routes/${sessionId}`);
  }

  // AI 루트 북마크 삭제
  static async deleteAIBookmark(bookmarkId: string, sessionId: string) {
    return this.request(`/bookmarks/ai-route/${bookmarkId}`, {
      method: 'DELETE',
      body: JSON.stringify({ sessionId }),
    });
  }

  // 북마크 통계 조회
  static async getBookmarkSummary(sessionId: string) {
    return this.request(`/bookmarks/summary/${sessionId}`);
  }

  // 모든 북마크 삭제 (✅ 추가된 메서드)
  static async deleteAllBookmarks(sessionId: string) {
    return this.request(`/bookmarks/all/${sessionId}`, {
      method: 'DELETE',
    });
  }

  // ============================================================================
  // 청년혜택 북마크 관련 API (팀원 구현 후 활성화)
  // ============================================================================

  // 청년혜택 북마크 저장
  static async saveBenefitBookmark(sessionId: string, benefitData: any) {
    return this.request('/bookmarks/benefit', {
      method: 'POST',
      body: JSON.stringify({ sessionId, benefitData }),
    });
  }

  // 청년혜택 북마크 목록 조회
  static async getBenefitBookmarks(sessionId: string) {
    return this.request(`/bookmarks/benefits/${sessionId}`);
  }

  // 청년혜택 북마크 삭제
  static async deleteBenefitBookmark(bookmarkId: string, sessionId: string) {
    return this.request(`/bookmarks/benefit/${bookmarkId}`, {
      method: 'DELETE',
      body: JSON.stringify({ sessionId }),
    });
  }

  // ============================================================================
  // 지도 북마크 관련 API (팀원 구현 후 활성화)
  // ============================================================================

  // 지도 장소 북마크 저장
  static async saveMapBookmark(sessionId: string, placeData: any) {
    return this.request('/bookmarks/map-place', {
      method: 'POST',
      body: JSON.stringify({ sessionId, placeData }),
    });
  }

  // 지도 장소 북마크 목록 조회
  static async getMapBookmarks(sessionId: string) {
    return this.request(`/bookmarks/map-places/${sessionId}`);
  }

  // 지도 장소 북마크 삭제
  static async deleteMapBookmark(bookmarkId: string, sessionId: string) {
    return this.request(`/bookmarks/map-place/${bookmarkId}`, {
      method: 'DELETE',
      body: JSON.stringify({ sessionId }),
    });
  }

  // ============================================================================
  // 기존 여행 관련 API
  // ============================================================================

  // 여행 추천 API
  static async getRecommendations(data: any) {
    return this.request('/travel/recommend', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // 청년 혜택 API
  static async getYouthBenefits() {
    return this.request('/benefit/youth');
  }

  // 지역별 할인 정보 API
  static async getRegionalDiscounts(region: string) {
    return this.request(`/benefit/regional/${region}`);
  }

  // ============================================================================
  // 유틸리티 메서드들
  // ============================================================================

  // API 상태 확인
  static async checkHealth() {
    return this.request('/health');
  }

  // 에러 리포팅
  static async reportError(error: any, context?: string) {
    return this.request('/error-report', {
      method: 'POST',
      body: JSON.stringify({ 
        error: error.message || error,
        context,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent
      }),
    }).catch(() => {
      console.warn('에러 리포팅 실패');
    });
  }
}