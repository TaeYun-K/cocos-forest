// src/api/dashboard.ts
import apiClient from './axios';
import logger from '../utils/logger';
import { getCategoryColor } from '../constants/dashboardStyles';
import type {
  DayData,
  MonthlyReportData,
  CategoryMonthlyDetails,
  CategoryMonthlyDetailsResponse,
  PaymentRequest,
  PaymentResponse,
  PaymentResult
} from '../types/dashboard';

/**
 * API 에러 처리 유틸리티 함수
 * @param error - 에러 객체
 * @param operation - 수행 중이던 작업명
 * @returns 표준화된 에러
 */
const handleApiError = (error: any, operation: string): Error => {
  if (error.response?.status === 500) {
    return new Error(`${operation} 중 서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.`);
  } else if (error.response?.status === 404) {
    return new Error(`${operation}: 요청한 데이터를 찾을 수 없습니다.`);
  } else if (error.response?.status === 400) {
    return new Error(`${operation}: 잘못된 요청입니다. 파라미터를 확인해주세요.`);
  } else if (error.response?.status === 401) {
    return new Error(`${operation}: 인증이 필요합니다.`);
  } else if (error.response?.status === 403) {
    return new Error(`${operation}: 접근 권한이 없습니다.`);
  } else {
    return new Error(`${operation} 중 네트워크 오류가 발생했습니다. 연결 상태를 확인해주세요.`);
  }
};

/**
 * 특정 날짜의 상세 데이터를 가져옵니다. (Daily API)
 * @param date - 조회할 날짜 (YYYY-MM-DD)
 * @param force - 캐시가 최신이어도 강제 동기화
 * @returns 일일 상세 데이터
 */
export const fetchDayDetails = async (
  date: string,
  force: boolean = true
): Promise<DayData> => {
  try {
    logger.apiStart(`fetchDayDetails: ${date}`, { date, force });

    const response = await apiClient.get(`/api/finance/user-cards/transactions/daily-details`, {
      params: {
        date,
        force,
        timeoutMs: 5000,
        includeCarbon: true,
        includeMeta: true
      }
    });

    logger.apiSuccess(`fetchDayDetails: ${date}`);

    // 탄소배출량 로그 출력
    const carbonValue = response.data?.result?.totals?.carbonTotalKg;
    logger.carbonData(`일일 탄소배출량 (${date})`, carbonValue || 0);

    return response.data.result;
  } catch (error) {
    logger.apiError(`fetchDayDetails: ${date}`, error);
    throw handleApiError(error, '일별 상세 데이터 조회');
  }
};

/**
 * 월별 리포트 데이터를 가져옵니다. (Monthly API)
 * @param yearMonth - 조회할 월 (YYYY-MM)
 * @returns 월별 리포트 데이터
 */
export const fetchMonthlyReport = async (
  yearMonth: string
): Promise<MonthlyReportData> => {
  try {
    logger.apiStart(`fetchMonthlyReport: ${yearMonth}`, { yearMonth });

    const response = await apiClient.get(`/api/finance/user-cards/transactions/monthly-summary`, {
      params: {
        yearMonth,
        includeByCategory: true,
        includeFreshness: true
      }
    });

    logger.apiSuccess(`fetchMonthlyReport: ${yearMonth}`);

    // 월별 탄소배출량 로그 출력
    const monthlyCarbon = response.data?.result?.totals?.carbonTotalKg;
    const activeDays = response.data?.result?.totals?.daysActive;
    logger.carbonData(`월별 탄소배출량 (${yearMonth})`, monthlyCarbon || 0, { activeDays });

    // API 응답을 컴포넌트가 기대하는 형태로 변환
    const transformedData = {
      ...response.data.result,
      byCategory: response.data.result.byCategory?.map((category: any, index: number) => ({
        ...category,
        color: category.color || getCategoryColor(index) // color 필드가 없으면 기본 색상 사용
      })) || []
    };

    return transformedData;
  } catch (error) {
    logger.apiError(`fetchMonthlyReport: ${yearMonth}`, error);
    throw handleApiError(error, '월별 리포트 조회');
  }
};

/**
 * 카테고리별 월별 상세 데이터를 가져옵니다.
 * @param userCardId - 사용자 카드 ID
 * @param yearMonth - 조회할 월 (YYYY-MM)
 * @param categoryId - 카테고리 ID
 * @returns 카테고리별 월별 상세 데이터
 */
export const fetchCategoryMonthlyDetails = async (
  userCardId: string,
  yearMonth: string,
  categoryId: string
): Promise<CategoryMonthlyDetails> => {
  try {
    const params = { yearMonth, categoryId };
    logger.apiStart(`fetchCategoryMonthlyDetails: ${categoryId}`, { userCardId, yearMonth, categoryId });

    const response = await apiClient.get(
      `/api/finance/user-cards/transactions/${categoryId}`,
      { params }
    ) as { data: CategoryMonthlyDetailsResponse };

    logger.apiSuccess(`fetchCategoryMonthlyDetails: ${categoryId}`);

    // API 응답 구조 확인 및 result 반환
    if (response.data.isSuccess && response.data.result) {
      return response.data.result;
    } else {
      throw new Error(response.data.message || '카테고리 상세 데이터 조회에 실패했습니다.');
    }
  } catch (error: any) {
    logger.apiError(`fetchCategoryMonthlyDetails: ${categoryId}`, error);
    throw handleApiError(error, '카테고리 상세 데이터 조회');
  }
};

/**
 * 오늘 날짜의 일별 데이터 가져오기
 */
export const fetchTodayData = async (): Promise<DayData> => {
  const today = new Date();
  const dateString = today.toISOString().split('T')[0]; // YYYY-MM-DD 형식

  logger.info(`오늘 데이터 조회: ${dateString}`);
  const result = await fetchDayDetails(dateString, true);
  logger.carbonData('오늘 탄소배출량', result?.totals?.carbonTotalKg || 0);

  return result;
};

/**
 * 새로운 결제 추가
 * @param userId - 사용자 ID
 * @param userCardId - 사용자 카드 ID
 * @param paymentData - 결제 요청 데이터
 * @returns 결제 결과
 */
export const addNewPayment = async (
  userId: number,
  userCardId: number,
  paymentData?: PaymentRequest
): Promise<PaymentResult> => {
  try {
    const requestBody: PaymentRequest = paymentData || {
      merchantId: 14261,
      paymentBalance: 50000
    };

    logger.apiStart('addNewPayment', { userId, userCardId, paymentData: requestBody });

    const response = await apiClient.post(`/api/finance/user-cards/transactions/pay`, requestBody) as { data: PaymentResponse };

    logger.apiSuccess('addNewPayment');

    if (response.data.isSuccess && response.data.result) {
      return response.data.result;
    } else {
      throw new Error(response.data.message || '결제 처리에 실패했습니다.');
    }
  } catch (error) {
    logger.apiError('addNewPayment', error);
    throw handleApiError(error, '결제 처리');
  }
};

