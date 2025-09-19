import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchMonthlyReport, fetchDayDetails, fetchTodayData } from '../api/dashboard';
import type { MonthlyReportData, DayData } from '../types/dashboard';

// Query Keys
export const dashboardQueryKeys = {
  all: ['dashboard'] as const,
  monthlyReports: () => [...dashboardQueryKeys.all, 'monthlyReports'] as const,
  monthlyReport: (yearMonth: string) => [...dashboardQueryKeys.monthlyReports(), yearMonth] as const,
  dayDetails: () => [...dashboardQueryKeys.all, 'dayDetails'] as const,
  dayDetail: (date: string) => [...dashboardQueryKeys.dayDetails(), date] as const,
  todayData: () => [...dashboardQueryKeys.all, 'todayData'] as const,
};

// Monthly Report Query Hook
export const useMonthlyReport = (year: number, month: number) => {
  const yearMonth = `${year}-${String(month + 1).padStart(2, '0')}`;

  return useQuery<MonthlyReportData>({
    queryKey: dashboardQueryKeys.monthlyReport(yearMonth),
    queryFn: () => fetchMonthlyReport(yearMonth),
    staleTime: 5 * 60 * 1000, // 5분
    gcTime: 10 * 60 * 1000, // 10분
  });
};

// Day Details Query Hook
export const useDayDetails = (year: number, month: number, day: number, enabled: boolean = true) => {
  const date = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  return useQuery<DayData>({
    queryKey: dashboardQueryKeys.dayDetail(date),
    queryFn: () => fetchDayDetails(date, true),
    enabled,
    staleTime: 5 * 60 * 1000, // 5분
    gcTime: 10 * 60 * 1000, // 10분
  });
};

// Today Data Query Hook
export const useTodayData = () => {
  return useQuery<DayData>({
    queryKey: dashboardQueryKeys.todayData(),
    queryFn: fetchTodayData,
    staleTime: 2 * 60 * 1000, // 2분 (오늘 데이터는 더 자주 업데이트)
    gcTime: 5 * 60 * 1000, // 5분
    refetchInterval: 5 * 60 * 1000, // 5분마다 자동 리프레시
  });
};

// Prefetch 함수들 (성능 최적화용)
export const useDashboardPrefetch = () => {
  const queryClient = useQueryClient();

  const prefetchMonthlyReport = (year: number, month: number) => {
    const yearMonth = `${year}-${String(month + 1).padStart(2, '0')}`;
    return queryClient.prefetchQuery({
      queryKey: dashboardQueryKeys.monthlyReport(yearMonth),
      queryFn: () => fetchMonthlyReport(yearMonth),
      staleTime: 5 * 60 * 1000,
    });
  };

  const prefetchDayDetails = (year: number, month: number, day: number) => {
    const date = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return queryClient.prefetchQuery({
      queryKey: dashboardQueryKeys.dayDetail(date),
      queryFn: () => fetchDayDetails(date, true),
      staleTime: 5 * 60 * 1000,
    });
  };

  return {
    prefetchMonthlyReport,
    prefetchDayDetails,
  };
};

// 캐시 무효화 함수들
export const useDashboardInvalidation = () => {
  const queryClient = useQueryClient();

  const invalidateMonthlyReport = (year: number, month: number) => {
    const yearMonth = `${year}-${String(month + 1).padStart(2, '0')}`;
    return queryClient.invalidateQueries({
      queryKey: dashboardQueryKeys.monthlyReport(yearMonth),
    });
  };

  const invalidateDayDetails = (year: number, month: number, day: number) => {
    const date = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return queryClient.invalidateQueries({
      queryKey: dashboardQueryKeys.dayDetail(date),
    });
  };

  const invalidateTodayData = () => {
    return queryClient.invalidateQueries({
      queryKey: dashboardQueryKeys.todayData(),
    });
  };

  const invalidateAllDashboard = () => {
    return queryClient.invalidateQueries({
      queryKey: dashboardQueryKeys.all,
    });
  };

  return {
    invalidateMonthlyReport,
    invalidateDayDetails,
    invalidateTodayData,
    invalidateAllDashboard,
  };
};