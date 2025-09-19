const API_BASE_URL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:3001/api' 
  : '/api';

export class ApiClient {
  private static async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    console.log(`API 호출: ${API_BASE_URL}${endpoint}`); // 디버깅용

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      console.log(`응답 상태: ${response.status}`); // 디버깅용

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API 에러: ${response.status} - ${errorText}`);
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('응답 데이터:', data); // 디버깅용
      return data;
    } catch (error) {
      console.error('API 호출 실패:', error);
      throw error;
    }
  }

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

// 코스 평가 API
static async rateRoute(routeId: string, rating: number, feedback?: string, sessionId?: string) {
  return this.request('/ai/rate-route', {
    method: 'POST',
    body: JSON.stringify({ routeId, rating, feedback, sessionId }),
  });
}

  // 여행 추천 API (기존 엔드포인트 사용)
  static async getRecommendations(data: any) {
    return this.request('/travel/recommend', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // 청년 혜택 API (기존 엔드포인트 사용)
  static async getYouthBenefits() {
    return this.request('/benefit/youth');
  }

  // 지역별 할인 정보 API
  static async getRegionalDiscounts(region: string) {
    return this.request(`/benefit/regional/${region}`);
  }
}