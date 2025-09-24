/**
 * 임시 사용자 ID 생성
 */
export const generateTempUserId = (): string => {
  if (typeof window !== 'undefined' && 'crypto' in window && 'randomUUID' in window.crypto) {
    return window.crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

/**
 * 사용자 ID 가져오기 (localStorage에서 조회하거나 새로 생성)
 */
export const getUserId = (): string => {
  if (typeof window === 'undefined') return '00000000-0000-4000-8000-000000000000';
  
  let userId = localStorage.getItem('temp_user_id');
  if (!userId) {
    userId = generateTempUserId();
    localStorage.setItem('temp_user_id', userId);
  }
  return userId;
};