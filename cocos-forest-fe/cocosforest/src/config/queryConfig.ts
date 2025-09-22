// src/config/queryConfig.ts

/**
 * React Query 캐싱 전략 설정
 * 데이터 특성에 따라 차별화된 캐싱 정책 적용
 */

// 기본 시간 단위 (밀리초)
const MINUTES = 60 * 1000;
const HOURS = 60 * MINUTES;

export const QUERY_CONFIG = {
  // 오늘 데이터 - 실시간성이 중요
  TODAY_DATA: {
    staleTime: 2 * MINUTES,           // 2분 후 stale
    gcTime: 10 * MINUTES,             // 10분간 캐시 유지
    refetchInterval: 5 * MINUTES,     // 5분마다 자동 갱신
    retry: 3,                         // 3회 재시도
    retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
  },

  // 월별 리포트 - 상대적으로 안정적인 데이터
  MONTHLY_REPORT: {
    staleTime: 15 * MINUTES,          // 15분 후 stale
    gcTime: 2 * HOURS,                // 2시간간 캐시 유지
    retry: 2,                         // 2회 재시도
    retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 10000),
  },

  // 일별 상세 - 과거 데이터는 변경 가능성 낮음
  DAY_DETAILS: {
    staleTime: 30 * MINUTES,          // 30분 후 stale
    gcTime: 4 * HOURS,                // 4시간간 캐시 유지
    retry: 2,                         // 2회 재시도
    retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 10000),
  },

  // 카테고리 상세 - 상대적으로 안정적
  CATEGORY_DETAILS: {
    staleTime: 20 * MINUTES,          // 20분 후 stale
    gcTime: 3 * HOURS,                // 3시간간 캐시 유지
    retry: 2,                         // 2회 재시도
    retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 10000),
  },

  // 백그라운드 새로고침 설정
  BACKGROUND_REFETCH: {
    refetchOnWindowFocus: true,       // 창 포커스 시 새로고침
    refetchOnReconnect: true,         // 네트워크 재연결 시 새로고침
    refetchOnMount: true,             // 마운트 시 새로고침
  },

  // 에러 처리 설정
  ERROR_HANDLING: {
    retry: (failureCount: number, error: any) => {
      // 네트워크 에러는 3회까지 재시도
      if (!error.response && failureCount < 3) return true;

      // 일시적 서버 에러는 2회까지 재시도
      const retryableStatuses = [408, 429, 500, 502, 503, 504];
      if (retryableStatuses.includes(error.response?.status) && failureCount < 2) {
        return true;
      }

      return false;
    },
    retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
  },
} as const;

/**
 * 날짜 기반 캐싱 전략
 * 과거 데이터일수록 더 오래 캐시
 */
export const getDateBasedCacheConfig = (date: string) => {
  const targetDate = new Date(date);
  const today = new Date();
  const daysDiff = Math.floor((today.getTime() - targetDate.getTime()) / (1000 * 60 * 60 * 24));

  if (daysDiff === 0) {
    // 오늘 데이터
    return QUERY_CONFIG.TODAY_DATA;
  } else if (daysDiff <= 7) {
    // 최근 1주일 데이터
    return {
      ...QUERY_CONFIG.DAY_DETAILS,
      staleTime: 20 * MINUTES,
      gcTime: 2 * HOURS,
    };
  } else {
    // 1주일 이전 데이터 - 더 오래 캐시
    return {
      ...QUERY_CONFIG.DAY_DETAILS,
      staleTime: 2 * HOURS,
      gcTime: 24 * HOURS,
    };
  }
};