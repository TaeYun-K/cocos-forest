// API 설정 파일
// 백엔드 개발 완료 후 실제 API 주소로 변경

export const API_CONFIG = {
  // 백엔드 API 사용
  USE_MOCK_API: false,
  
  // 실제 백엔드 API 주소
  BASE_URL: 'https://j13e205.p.ssafy.io/dev', // 개발 환경
  // BASE_URL: 'https://your-production-api.com', // 운영 환경
  
  // 챌린지 API 엔드포인트
  CHALLENGE_ENDPOINTS: {
    STATUS: '/api/challenges/status',
    TODAY: '/api/challenges/today',
    CLAIM: '/api/challenges',
    COMPLETE: '/api/challenges',
    ATTENDANCE: '/api/challenges/attendance',
    STEPS: '/api/challenges/steps',
    TRANSPORT: '/api/challenges/transport',
    TUMBLER: '/api/challenges/tumbler',
    REWARD: '/api/challenges/reward',
    RESET: '/api/challenges/reset',
  },
  
  // 결제내역 API 엔드포인트 (이미 구현됨)
  FINANCE_ENDPOINTS: {
    DAILY_DETAILS: '/api/finance/user-cards/transactions/daily-details',
    MONTHLY_SUMMARY: '/api/finance/user-cards/transactions/monthly-summary',
  }
};

// 백엔드 API 사용 여부 확인
export const isBackendApiReady = (): boolean => {
  return !API_CONFIG.USE_MOCK_API;
};

// API 주소 생성 헬퍼
export const getApiUrl = (endpoint: string): string => {
  if (API_CONFIG.USE_MOCK_API) {
    return endpoint; // 가상 API는 endpoint만 반환
  }
  // endpoint가 이미 전체 URL을 포함하고 있는지 확인
  if (endpoint.startsWith('http')) {
    return endpoint;
  }
  // endpoint가 /로 시작하지 않으면 / 추가
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return normalizedEndpoint; // baseURL은 axios 인스턴스에서 처리
};

