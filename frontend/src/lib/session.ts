// ============================================================================
// 세션 관리 유틸리티
// 파일: frontend/src/lib/session.ts (새로 생성)
// ============================================================================

// 브라우저 세션 ID 생성 및 관리
export class SessionManager {
    private static readonly SESSION_KEY = 'zeroplay_session_id';
    private static readonly SESSION_EXPIRY_KEY = 'zeroplay_session_expiry';
    private static readonly SESSION_DURATION = 30 * 24 * 60 * 60 * 1000; // 30일
  
    /**
     * 세션 ID 가져오기 (없으면 새로 생성)
     */
    static getSessionId(): string {
      if (typeof window === 'undefined') return '';
      
      let sessionId = localStorage.getItem(this.SESSION_KEY);
      const expiry = localStorage.getItem(this.SESSION_EXPIRY_KEY);
      
      // 세션이 없거나 만료된 경우 새로 생성
      if (!sessionId || !expiry || Date.now() > parseInt(expiry)) {
        sessionId = this.generateSessionId();
        this.setSession(sessionId);
      }
      
      return sessionId;
    }
  
    /**
     * 새 세션 ID 생성
     */
    private static generateSessionId(): string {
      const timestamp = Date.now().toString(36);
      const randomPart = Math.random().toString(36).substring(2, 15);
      const additionalRandom = Math.random().toString(36).substring(2, 9);
      
      return `session_${timestamp}_${randomPart}_${additionalRandom}`;
    }
  
    /**
     * 세션 설정
     */
    private static setSession(sessionId: string): void {
      if (typeof window === 'undefined') return;
      
      const expiryTime = Date.now() + this.SESSION_DURATION;
      
      localStorage.setItem(this.SESSION_KEY, sessionId);
      localStorage.setItem(this.SESSION_EXPIRY_KEY, expiryTime.toString());
    }
  
    /**
     * 세션 클리어
     */
    static clearSession(): void {
      if (typeof window === 'undefined') return;
      
      localStorage.removeItem(this.SESSION_KEY);
      localStorage.removeItem(this.SESSION_EXPIRY_KEY);
    }
  
    /**
     * 세션 유효성 검사
     */
    static isValidSession(sessionId: string): boolean {
      if (!sessionId || sessionId.length < 10) return false;
      
      const expiry = localStorage.getItem(this.SESSION_EXPIRY_KEY);
      if (!expiry || Date.now() > parseInt(expiry)) return false;
      
      return true;
    }
  
    /**
     * 세션 연장
     */
    static extendSession(): void {
      const sessionId = this.getSessionId();
      if (sessionId) {
        this.setSession(sessionId);
      }
    }
  
    /**
     * 세션 정보 가져오기
     */
    static getSessionInfo(): { sessionId: string; expiryDate: Date | null; isValid: boolean } {
      const sessionId = this.getSessionId();
      const expiry = localStorage.getItem(this.SESSION_EXPIRY_KEY);
      
      return {
        sessionId,
        expiryDate: expiry ? new Date(parseInt(expiry)) : null,
        isValid: this.isValidSession(sessionId)
      };
    }
  
    /**
     * 디버그 정보 출력
     */
    static debug(): void {
      if (typeof window === 'undefined') return;
      
      const info = this.getSessionInfo();
      console.log('🔍 Session Debug Info:', {
        sessionId: info.sessionId,
        expiryDate: info.expiryDate?.toLocaleString(),
        isValid: info.isValid,
        timeUntilExpiry: info.expiryDate ? 
          Math.round((info.expiryDate.getTime() - Date.now()) / (1000 * 60 * 60)) + ' hours' : 
          'N/A'
      });
    }
  }