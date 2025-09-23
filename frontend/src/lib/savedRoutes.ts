// ============================================================================
// 저장된 코스 관리 시스템
// 파일: frontend/src/lib/savedRoutes.ts (새로 생성)
// ============================================================================

export interface SavedRoute {
    id: string;
    title: string;
    duration: string;
    totalBudget: number;
    places: {
      name: string;
      type: string;
      duration: string;
      cost: number;
      description: string;
    }[];
    highlights: string[];
    difficulty: 'easy' | 'moderate' | 'hard';
    savedAt: string; // 저장된 시각
    userMessage?: string; // 사용자가 입력한 검색어
  }
  
  export class SavedRoutesManager {
    private static readonly STORAGE_KEY = 'zeroplay_saved_routes';
  
    /**
     * 코스를 좋아요 목록에 저장
     */
    static saveRoute(route: any, userMessage?: string): void {
      try {
        const savedRoute: SavedRoute = {
          id: route.id || `saved_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          title: route.title,
          duration: route.duration,
          totalBudget: route.totalBudget,
          places: route.places,
          highlights: route.highlights,
          difficulty: route.difficulty,
          savedAt: new Date().toISOString(),
          userMessage: userMessage || ''
        };
  
        const existingRoutes = this.getSavedRoutes();
        
        // 이미 저장된 코스인지 확인
        const isAlreadySaved = existingRoutes.some(r => r.id === savedRoute.id);
        if (isAlreadySaved) {
          console.log('이미 저장된 코스입니다.');
          return;
        }
  
        // 새 코스를 맨 앞에 추가
        const updatedRoutes = [savedRoute, ...existingRoutes];
        
        // 최대 50개까지만 저장 (성능 고려)
        const limitedRoutes = updatedRoutes.slice(0, 50);
        
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(limitedRoutes));
        
        console.log(`✅ 코스 저장됨: ${savedRoute.title}`);
        
        // 저장 성공 이벤트 발생 (다른 컴포넌트에서 감지 가능)
        window.dispatchEvent(new CustomEvent('routeSaved', { 
          detail: { route: savedRoute } 
        }));
        
      } catch (error) {
        console.error('코스 저장 중 오류:', error);
      }
    }
  
    /**
     * 저장된 모든 코스 조회
     */
    static getSavedRoutes(): SavedRoute[] {
      try {
        const saved = localStorage.getItem(this.STORAGE_KEY);
        if (!saved) return [];
        
        const routes = JSON.parse(saved) as SavedRoute[];
        
        // 날짜 순으로 정렬 (최신순)
        return routes.sort((a, b) => 
          new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime()
        );
      } catch (error) {
        console.error('저장된 코스 조회 중 오류:', error);
        return [];
      }
    }
  
    /**
     * 특정 코스가 저장되어 있는지 확인
     */
    static isRouteSaved(routeId: string): boolean {
      const savedRoutes = this.getSavedRoutes();
      return savedRoutes.some(route => route.id === routeId);
    }
  
    /**
     * 저장된 코스 삭제
     */
    static removeSavedRoute(routeId: string): boolean {
      try {
        const savedRoutes = this.getSavedRoutes();
        const filteredRoutes = savedRoutes.filter(route => route.id !== routeId);
        
        if (filteredRoutes.length === savedRoutes.length) {
          console.log('삭제할 코스를 찾을 수 없습니다.');
          return false;
        }
        
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredRoutes));
        
        console.log(`✅ 코스 삭제됨: ${routeId}`);
        
        // 삭제 성공 이벤트 발생
        window.dispatchEvent(new CustomEvent('routeRemoved', { 
          detail: { routeId } 
        }));
        
        return true;
      } catch (error) {
        console.error('코스 삭제 중 오류:', error);
        return false;
      }
    }
  
    /**
     * 모든 저장된 코스 삭제
     */
    static clearAllSavedRoutes(): void {
      try {
        localStorage.removeItem(this.STORAGE_KEY);
        console.log('✅ 모든 저장된 코스가 삭제되었습니다.');
        
        // 전체 삭제 이벤트 발생
        window.dispatchEvent(new CustomEvent('allRoutesCleared'));
      } catch (error) {
        console.error('저장된 코스 전체 삭제 중 오류:', error);
      }
    }
  
    /**
     * 저장된 코스 개수 조회
     */
    static getSavedRoutesCount(): number {
      return this.getSavedRoutes().length;
    }
  
    /**
     * 코스 저장/삭제 토글
     */
    static toggleSaveRoute(route: any, userMessage?: string): boolean {
      const routeId = route.id;
      const isSaved = this.isRouteSaved(routeId);
      
      if (isSaved) {
        this.removeSavedRoute(routeId);
        return false; // 삭제됨
      } else {
        this.saveRoute(route, userMessage);
        return true; // 저장됨
      }
    }
  
    /**
     * 저장된 코스를 카테고리별로 그룹화
     */
    static getSavedRoutesByCategory(): { [category: string]: SavedRoute[] } {
      const savedRoutes = this.getSavedRoutes();
      const grouped: { [category: string]: SavedRoute[] } = {};
  
      savedRoutes.forEach(route => {
        const category = route.difficulty || 'unknown';
        if (!grouped[category]) {
          grouped[category] = [];
        }
        grouped[category].push(route);
      });
  
      return grouped;
    }
  
    /**
     * 검색어로 저장된 코스 필터링
     */
    static searchSavedRoutes(query: string): SavedRoute[] {
      const savedRoutes = this.getSavedRoutes();
      const lowercaseQuery = query.toLowerCase();
  
      return savedRoutes.filter(route => 
        route.title.toLowerCase().includes(lowercaseQuery) ||
        route.places.some(place => 
          place.name.toLowerCase().includes(lowercaseQuery) ||
          place.description.toLowerCase().includes(lowercaseQuery)
        ) ||
        route.highlights.some(highlight => 
          highlight.toLowerCase().includes(lowercaseQuery)
        ) ||
        (route.userMessage && route.userMessage.toLowerCase().includes(lowercaseQuery))
      );
    }
  
    /**
     * 저장된 코스 통계 정보
     */
    static getSavedRoutesStats() {
      const savedRoutes = this.getSavedRoutes();
      
      if (savedRoutes.length === 0) {
        return {
          totalRoutes: 0,
          totalBudget: 0,
          avgBudget: 0,
          difficultyStats: {},
          mostPopularPlace: null
        };
      }
  
      const totalBudget = savedRoutes.reduce((sum, route) => sum + route.totalBudget, 0);
      const avgBudget = Math.round(totalBudget / savedRoutes.length);
  
      // 난이도별 통계
      const difficultyStats = savedRoutes.reduce((stats, route) => {
        const difficulty = route.difficulty || 'unknown';
        stats[difficulty] = (stats[difficulty] || 0) + 1;
        return stats;
      }, {} as { [key: string]: number });
  
      // 가장 인기 있는 장소 찾기
      const placeCount: { [placeName: string]: number } = {};
      savedRoutes.forEach(route => {
        route.places.forEach(place => {
          placeCount[place.name] = (placeCount[place.name] || 0) + 1;
        });
      });
  
      const mostPopularPlace = Object.entries(placeCount).reduce((a, b) => 
        placeCount[a[0]] > placeCount[b[0]] ? a : b, 
        ['', 0]
      )[0] || null;
  
      return {
        totalRoutes: savedRoutes.length,
        totalBudget,
        avgBudget,
        difficultyStats,
        mostPopularPlace
      };
    }
  }