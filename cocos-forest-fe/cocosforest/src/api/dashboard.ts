// src/api/dashboard.ts
import apiClient from './axios';
import type {
  DayData,
  MonthlyReportData,
  CategoryMonthlyDetails,
  CategoryMonthlyDetailsResponse
} from '../types/dashboard';

// 고정 cardId
const CARD_ID = "1";

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
    console.log(`🔍 fetchDayDetails 시작: ${date}`);

    const response = await apiClient.get(`/api/finance/user-cards/transactions/daily-details`, {
      params: {
        date,
        force,
        timeoutMs: 5000,
        includeCarbon: true,
        includeMeta: true
      }
    });

    console.log(`✅ fetchDayDetails 성공: ${date}`);
    console.log('📦 응답 데이터:', response.data);

    // 탄소배출량 로그 출력
    const carbonValue = response.data?.result?.totals?.carbonTotalKg;
    console.log(`🌱 일일 탄소배출량 (${date}): ${carbonValue}kg`);
    console.log('📊 totals 객체:', response.data?.result?.totals);

    return response.data.result;
  } catch (error) {
    console.error(`❌ fetchDayDetails 에러: ${date}`, error);
    throw error;
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
    console.log(`🔍 fetchMonthlyReport 시작: ${yearMonth}`);

    const response = await apiClient.get(`/api/finance/user-cards/transactions/monthly-summary`, {
      params: {
        yearMonth,
        includeByCategory: true,
        includeFreshness: true
      }
    });

    console.log(`✅ fetchMonthlyReport 성공: ${yearMonth}`);
    console.log('📦 월별 응답 데이터:', response.data);

    // 월별 탄소배출량 로그 출력
    const monthlyCarbon = response.data?.result?.totals?.carbonTotalKg;
    const activeDays = response.data?.result?.totals?.daysActive;
    console.log(`🌱 월별 탄소배출량 (${yearMonth}): ${monthlyCarbon}kg (${activeDays}일 활동)`);
    console.log('📊 월별 totals 객체:', response.data?.result?.totals);

    // 카테고리별 색상 매핑
    const categoryColors = [
      '#ef4444', // 빨간색
      '#f97316', // 주황색
      '#eab308', // 노란색
      '#22c55e', // 초록색
      '#3b82f6', // 파란색
      '#8b5cf6', // 보라색
      '#ec4899', // 분홍색
      '#06b6d4', // 청록색
      '#84cc16', // 라임색
      '#f59e0b', // 호박색
    ];

    // API 응답을 컴포넌트가 기대하는 형태로 변환
    const transformedData = {
      ...response.data.result,
      yearMonth, // API에서 제공되지 않는 필드 추가
      byCategory: response.data.result.byCategory?.map((category: any, index: number) => ({
        ...category,
        color: category.color || categoryColors[index % categoryColors.length] // color 필드가 없으면 기본 색상 사용
      })) || []
    };

    return transformedData;
  } catch (error) {
    console.error(`❌ fetchMonthlyReport 에러: ${yearMonth}`, error);
    throw error;
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
    console.log(`🔍 fetchCategoryMonthlyDetails 시작:`);
    console.log(`  - userCardId: ${userCardId}`);
    console.log(`  - yearMonth: ${yearMonth}`);
    console.log(`  - categoryId: ${categoryId}`);

    const params = { yearMonth, categoryId };
    console.log(`📋 API 요청 파라미터:`, params);

    const response = await apiClient.get<CategoryMonthlyDetailsResponse>(
      `/api/finance/user-cards/transactions/${categoryId}`,
      { params }
    );

    console.log(`✅ fetchCategoryMonthlyDetails 성공: ${categoryId}`);
    console.log('📦 Raw Response Object:', response);
    console.log('📦 Response Data:', response.data);
    console.log('📦 Response Status:', response.status);
    console.log('📦 Response Headers:', response.headers);

    // API 응답 구조 확인 및 result 반환
    if (response.data.isSuccess && response.data.result) {
      return response.data.result;
    } else {
      throw new Error(response.data.message || '카테고리 상세 데이터 조회에 실패했습니다.');
    }
  } catch (error: any) {
    console.error(`❌ fetchCategoryMonthlyDetails 에러: ${categoryId}`);
    console.error(`📦 Error Response Object:`, error.response);
    console.error(`📦 Error Response Data:`, error.response?.data);
    console.error(`📦 Error Response Status:`, error.response?.status);
    console.error(`📦 Error Response Headers:`, error.response?.headers);
    console.error(`📦 Error Message:`, error.message);
    console.error(`📦 Full Error:`, error);

    // 에러 메시지 개선
    if (error.response?.status === 500) {
      throw new Error('서버에서 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    } else if (error.response?.status === 404) {
      throw new Error('해당 카테고리의 데이터를 찾을 수 없습니다.');
    } else if (error.response?.status === 400) {
      throw new Error('잘못된 요청입니다. 파라미터를 확인해주세요.');
    } else {
      throw new Error('네트워크 오류가 발생했습니다. 연결 상태를 확인해주세요.');
    }
  }
};

/**
 * 오늘 날짜의 일별 데이터 가져오기
 */
export const fetchTodayData = async (): Promise<DayData> => {
  const today = new Date();
  const dateString = today.toISOString().split('T')[0]; // YYYY-MM-DD 형식

  console.log(`📅 오늘 데이터 조회: ${dateString}`);
  const result = await fetchDayDetails(dateString, true);
  console.log(`🌱 오늘 탄소배출량: ${result?.totals?.carbonTotalKg}kg`);

  return result;
};

/**
 * 새로운 결제 추가
 * @param userId - 사용자 ID
 * @param userCardId - 사용자 카드 ID
 * @returns 결제 결과
 */
export const addNewPayment = async (
  userId: number,
  userCardId: number
): Promise<any> => {
  try {
    console.log(`💳 새로운 결제 추가 시작: userId=${userId}, userCardId=${userCardId}`);

    const requestBody = {
      merchantId: 14261,
      paymentBalance: 50000
    };

    console.log('📦 결제 요청 데이터:', requestBody);

    const response = await apiClient.post(`/api/finance/user-cards/transactions/pay`, requestBody);

    console.log(`✅ 결제 추가 성공`);
    console.log('📦 결제 응답 데이터:', response.data);

    return response.data;
  } catch (error) {
    console.error(`❌ 결제 추가 에러:`, error);
    throw error;
  }
};

