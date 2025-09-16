// src/api/dashboard.ts
import apiClient from './axios';
import type {
  DayData,
  MonthlyReportData
} from '../types/dashboard';

// 고정 cardId
const CARD_ID = "1003-a139e9f23f1a4cc";

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
  const response = await apiClient.get(`/api/cards/${CARD_ID}/transactions/day`, {
    params: {
      date,
      force,
      timeoutMs: 5000,
      includeCarbon: true,
      includeMeta: true
    }
  });
  return response.data;
};

/**
 * 월별 리포트 데이터를 가져옵니다. (Monthly API)
 * @param yearMonth - 조회할 월 (YYYY-MM)
 * @returns 월별 리포트 데이터
 */
export const fetchMonthlyReport = async (
  yearMonth: string
): Promise<MonthlyReportData> => {
  const response = await apiClient.get(`/api/cards/${CARD_ID}/transactions/month-summary`, {
    params: {
      yearMonth,
      includeByCategory: true,
      includeFreshness: true
    }
  });
  return response.data;
};

/**
 * 오늘 날짜의 일별 데이터 가져오기
 */
export const fetchTodayData = async (): Promise<DayData> => {
  const today = new Date();
  const dateString = today.toISOString().split('T')[0]; // YYYY-MM-DD 형식

  return fetchDayDetails(dateString, true);
};

