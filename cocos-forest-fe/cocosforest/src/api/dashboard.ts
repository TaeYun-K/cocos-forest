// src/services/dashboard.ts
import apiClient from './axios';
import type { 
  DailyEmissions, 
  MonthlyReportData, 
  DayData 
} from '../types/dashboard';

/**
 * 일일 탄소 배출량 데이터를 가져옵니다.
 * @param year - 조회할 년도
 * @param month - 조회할 월 (1-12)
 * @returns 일일 탄소 배출량 데이터
 */
export const fetchDailyEmissions = async (
  year: number, 
  month: number
): Promise<DailyEmissions> => {
  const response = await apiClient.get(`/api/dashboard/daily-emissions/${year}/${month}`);
  return response.data;
};

/**
 * 월별 리포트 데이터를 가져옵니다.
 * @param year - 조회할 년도
 * @param month - 조회할 월 (1-12)
 * @returns 월별 리포트 데이터
 */
export const fetchMonthlyReport = async (
  year: number, 
  month: number
): Promise<MonthlyReportData> => {
  const response = await apiClient.get(`/api/dashboard/monthly-report/${year}/${month}`);
  return response.data;
};

/**
 * 특정 날짜의 상세 데이터를 가져옵니다.
 * @param year - 조회할 년도
 * @param month - 조회할 월 (1-12)
 * @param day - 조회할 일 (1-31)
 * @returns 일일 상세 데이터
 */
export const fetchDayDetails = async (
  year: number, 
  month: number, 
  day: number
): Promise<DayData> => {
  const response = await apiClient.get(`/api/dashboard/day-details/${year}/${month}/${day}`);
  return response.data;
};

// 편의성을 위한 현재 월 데이터 가져오기
export const fetchCurrentMonthData = async (): Promise<{
  emissions: DailyEmissions;
  report: MonthlyReportData;
}> => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  const [emissions, report] = await Promise.all([
    fetchDailyEmissions(year, month),
    fetchMonthlyReport(year, month)
  ]);

  return { emissions, report };
};

// 오늘 날짜의 일별 데이터 가져오기
export const fetchTodayData = async (): Promise<DayData> => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1; // 0부터 시작하므로 +1
  const day = now.getDate();

  return fetchDayDetails(year, month, day);
};

// 여러 월 데이터를 한번에 가져오기
export const fetchMultipleMonthsData = async (
  startYear: number,
  startMonth: number,
  endYear: number,
  endMonth: number
): Promise<MonthlyReportData[]> => {
  const requests: Promise<MonthlyReportData>[] = [];
  
  let currentYear = startYear;
  let currentMonth = startMonth;
  
  while (currentYear < endYear || (currentYear === endYear && currentMonth <= endMonth)) {
    requests.push(fetchMonthlyReport(currentYear, currentMonth));
    
    currentMonth++;
    if (currentMonth > 12) {
      currentMonth = 1;
      currentYear++;
    }
  }
  
  return Promise.all(requests);
};