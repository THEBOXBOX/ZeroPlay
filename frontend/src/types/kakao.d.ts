// 카카오맵 TypeScript 타입 정의
declare global {
  interface Window {
    kakao: any;
  }
}

export interface KakaoMapProps {
  width?: string;
  height?: string;
  level?: number;
  lat?: number;
  lng?: number;
}

export interface MapPosition {
  lat: number;
  lng: number;
}

export interface MarkerData {
  id: string;
  position: MapPosition;
  title: string;
  category: 'experience' | 'culture' | 'restaurant' | 'deal';
}

export {};