'use client';

import Script from 'next/script';

const KakaoMapScript = () => {
  // 환경변수에서 키 가져오기
  const kakaoMapKey = process.env.NEXT_PUBLIC_KAKAO_MAP_KEY;
  
  console.log('🔍 KakaoMapScript 실행');
  console.log('  - NEXT_PUBLIC_KAKAO_MAP_KEY:', kakaoMapKey);
  console.log('  - 키 길이:', kakaoMapKey?.length);
  
  // 키가 없으면 스크립트 로드 안함
  if (!kakaoMapKey) {
    console.error('🚨 카카오맵 API 키가 설정되지 않았습니다!');
    console.error('📝 .env.local 파일에 NEXT_PUBLIC_KAKAO_MAP_KEY를 설정해주세요');
    return null;
  }
  
  const scriptSrc = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${kakaoMapKey}&autoload=false&libraries=services,clusterer,drawing`;
  console.log('📡 카카오맵 스크립트 URL:', scriptSrc);
  
  return (
    <Script
      src={scriptSrc}
      strategy="afterInteractive"
      onLoad={() => {
        console.log('✅ 카카오맵 API 스크립트 로드 완료!');
        console.log('✅ window.kakao 객체:', window.kakao);
      }}
      onError={(e) => {
        console.error('❌ 카카오맵 API 스크립트 로드 실패:', e);
        console.error('🔗 요청 URL:', scriptSrc);
        console.error('🔑 API 키:', kakaoMapKey);
        console.error('💡 확인사항:');
        console.error('  1. 카카오 개발자센터에서 JavaScript 키인지 확인');
        console.error('  2. 웹 플랫폼에 http://localhost:3000 등록했는지 확인');
        console.error('  3. 카카오맵 API 활성화했는지 확인');
      }}
    />
  );
};

export default KakaoMapScript;