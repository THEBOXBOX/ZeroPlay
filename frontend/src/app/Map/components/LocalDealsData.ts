
// 로컬딜 데이터 타입
export interface LocalDeal {
  id: string;
  spot_id: string;
  title: string;
  description: string;
  deal_type: string;
  deal_value: string;
  original_price: number;
  discounted_price: number;
  deal_image?: string;
  valid_until: string;
  remaining_count: number;
  is_active: boolean;
}

// 실제 DB 연결된 로컬딜 데이터
export const DUMMY_LOCAL_DEALS: LocalDeal[] = [
  // === 체험 (Experience) - 4개 ===
  {
    id: 'deal-001',
    spot_id: '749d64d8-d5a9-4974-81f7-0ab046d75dd0', // 세일화방
    title: '드로잉 클래스 30% 할인!',
    description: '세일화방 원데이 드로잉 클래스 특가 이벤트',
    deal_type: 'PERCENTAGE_DISCOUNT',
    deal_value: '30% 할인',
    original_price: 35000,
    discounted_price: 24500,
    valid_until: '2025-12-31',
    remaining_count: 15,
    is_active: true
  },
  {
    id: 'deal-002',
    spot_id: '1cff6953-5cb7-4053-94c3-ab764eaf106e', // 호미캔즈
    title: '캔들 만들기 체험 1+1',
    description: '캔들 만들기 체험 시 추가 캔들 무료 제공!',
    deal_type: 'BUY_ONE_GET_ONE',
    deal_value: '1+1',
    original_price: 28000,
    discounted_price: 28000,
    valid_until: '2025-10-31',
    remaining_count: 25,
    is_active: true
  },
  {
    id: 'deal-003',
    spot_id: 'b30ebade-7b27-4d07-af80-4ba1b849709b', // 블레싱데이
    title: '체험활동 재료비 무료',
    description: '블레싱데이 체험 프로그램 참가 시 재료비 무료',
    deal_type: 'FREE_ADD_ON',
    deal_value: '재료비 무료',
    original_price: 32000,
    discounted_price: 25000,
    valid_until: '2025-11-30',
    remaining_count: 12,
    is_active: true
  },
  {
    id: 'deal-004',
    spot_id: '1dfcc3a6-b141-44f7-a95e-7e4897f855f2', // 이지댄스 신촌점
    title: '댄스 레슨 첫 달 50% 할인',
    description: '신규 회원 댄스 레슨 첫 달 반값 이벤트',
    deal_type: 'PERCENTAGE_DISCOUNT',
    deal_value: '50% 할인',
    original_price: 120000,
    discounted_price: 60000,
    valid_until: '2025-09-30',
    remaining_count: 8,
    is_active: true
  },

  // === 맛집 (Restaurant) - 6개 ===
  {
    id: 'deal-005',
    spot_id: 'fbc1c663-4cf9-4b07-a93a-49c138545512', // 산울림1992
    title: '런치세트 20% 할인',
    description: '평일 런치타임 세트메뉴 특별 할인',
    deal_type: 'PERCENTAGE_DISCOUNT',
    deal_value: '20% 할인',
    original_price: 15000,
    discounted_price: 12000,
    valid_until: '2025-09-30',
    remaining_count: 30,
    is_active: true
  },
  {
    id: 'deal-006',
    spot_id: '8cb3171c-db90-4d6f-9619-623d19daa6e1', // 신촌형제갈비
    title: '갈비 2인분 주문시 냉면 서비스',
    description: '갈비 2인분 이상 주문 시 물냉면 또는 비빔냉면 무료',
    deal_type: 'FREE_ADD_ON',
    deal_value: '냉면 무료',
    original_price: 45000,
    discounted_price: 45000,
    valid_until: '2025-10-15',
    remaining_count: 50,
    is_active: true
  },
  {
    id: 'deal-007',
    spot_id: 'cc4f8b85-cc81-4b8a-8d63-d717c3d6b31c', // 모듬집
    title: '모듬전 주문시 막걸리 1병 서비스',
    description: '바삭한 모듬전과 함께하는 전통 막걸리',
    deal_type: 'FREE_ADD_ON',
    deal_value: '막걸리 무료',
    original_price: 28000,
    discounted_price: 28000,
    valid_until: '2025-10-31',
    remaining_count: 20,
    is_active: true
  },
  {
    id: 'deal-008',
    spot_id: 'ae3f2819-55d3-4867-b29d-c4d5e1a0b47f', // 신촌칼국수
    title: '칼국수+만두 세트 15% 할인',
    description: '따뜻한 칼국수와 손만두 세트 특가',
    deal_type: 'PERCENTAGE_DISCOUNT',
    deal_value: '15% 할인',
    original_price: 13000,
    discounted_price: 11000,
    valid_until: '2025-11-30',
    remaining_count: 40,
    is_active: true
  },
  {
    id: 'deal-009',
    spot_id: 'd4a97b50-6ff8-455b-8a83-0244354a0e2b', // 고삼이 신촌점
    title: '삼겹살 500g 주문시 음료 무료',
    description: '삼겹살 500g 이상 주문 시 생맥주 또는 소주 1병 서비스',
    deal_type: 'FREE_ADD_ON',
    deal_value: '음료 무료',
    original_price: 25000,
    discounted_price: 25000,
    valid_until: '2025-10-31',
    remaining_count: 35,
    is_active: true
  },
  {
    id: 'deal-010',
    spot_id: '715211eb-f127-44f4-bda3-e5f75ae94613', // 신촌수제비
    title: '수제비 2그릇 주문시 1그릇 추가',
    description: '따뜻한 수제비 2그릇 주문 시 1그릇 더 드려요',
    deal_type: 'BUY_TWO_GET_ONE',
    deal_value: '2+1',
    original_price: 16000,
    discounted_price: 16000,
    valid_until: '2025-11-15',
    remaining_count: 25,
    is_active: true
  }
];

// ============================================================================
// 로컬딜 헬퍼 함수들
// ============================================================================

/**
 * 특정 스팟이 활성화된 로컬딜을 가지고 있는지 확인
 */
export const hasLocalDeal = (spotId: string): boolean => {
  return DUMMY_LOCAL_DEALS.some(deal => deal.spot_id === spotId && deal.is_active);
};

/**
 * 특정 스팟의 로컬딜 정보 가져오기
 */
export const getLocalDealForSpot = (spotId: string): LocalDeal | undefined => {
  return DUMMY_LOCAL_DEALS.find(deal => deal.spot_id === spotId && deal.is_active);
};

/**
 * 로컬딜을 보유한 스팟 ID 목록 가져오기
 */
export const getLocalDealSpotIds = (): string[] => {
  return DUMMY_LOCAL_DEALS
    .filter(deal => deal.is_active)
    .map(deal => deal.spot_id);
};