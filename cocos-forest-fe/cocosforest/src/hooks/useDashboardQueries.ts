import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchMonthlyReport, fetchDayDetails, fetchTodayData } from '../api/dashboard';
import { QUERY_CONFIG, getDateBasedCacheConfig } from '../config/queryConfig';
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
    ...QUERY_CONFIG.MONTHLY_REPORT,
    ...QUERY_CONFIG.BACKGROUND_REFETCH,
    retry: (failureCount: number, error: any) => {
      // 400 에러는 즉시 실패
      if (error.response?.status === 400) return false;
      return failureCount < 2;
    },
  });
};

// Day Details Query Hook
export const useDayDetails = (year: number, month: number, day: number, enabled: boolean = true) => {
  const date = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  const cacheConfig = getDateBasedCacheConfig(date);

  return useQuery<DayData>({
    queryKey: dashboardQueryKeys.dayDetail(date),
    queryFn: () => fetchDayDetails(date, true),
    enabled,
    ...cacheConfig,
    ...QUERY_CONFIG.BACKGROUND_REFETCH,
    retry: (failureCount: number, error: any) => {
      // 400 에러는 즉시 실패
      if (error.response?.status === 400) return false;
      return failureCount < 2;
    },
  });
};

// Today Data Query Hook
export const useTodayData = () => {
  return useQuery<DayData>({
    queryKey: dashboardQueryKeys.todayData(),
    queryFn: fetchTodayData,
    ...QUERY_CONFIG.TODAY_DATA,
    ...QUERY_CONFIG.BACKGROUND_REFETCH,
    retry: (failureCount: number, error: any) => {
      // 400 에러는 즉시 실패
      if (error.response?.status === 400) return false;
      return failureCount < 3;
    },
  });
};

// Prefetch 함수들 (성능 최적화용)
export const useDashboardPrefetch = () => {
  const queryClient = useQueryClient();

  const prefetchMonthlyReport = (year: number, month: number) => {
    const yearMonth = `${year}-${String(month + 1).padStart(2, '0')}`;

    // 이미 캐시된 데이터가 있고 stale하지 않으면 prefetch 건너뛰기
    const existingData = queryClient.getQueryData(dashboardQueryKeys.monthlyReport(yearMonth));
    const queryState = queryClient.getQueryState(dashboardQueryKeys.monthlyReport(yearMonth));

    if (existingData && queryState?.dataUpdatedAt &&
        Date.now() - queryState.dataUpdatedAt < QUERY_CONFIG.MONTHLY_REPORT.staleTime) {
      return Promise.resolve();
    }

    return queryClient.prefetchQuery({
      queryKey: dashboardQueryKeys.monthlyReport(yearMonth),
      queryFn: () => fetchMonthlyReport(yearMonth),
      ...QUERY_CONFIG.MONTHLY_REPORT,
    });
  };

  const prefetchDayDetails = (year: number, month: number, day: number) => {
    const date = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const cacheConfig = getDateBasedCacheConfig(date);

    // 이미 캐시된 데이터가 있고 stale하지 않으면 prefetch 건너뛰기
    const existingData = queryClient.getQueryData(dashboardQueryKeys.dayDetail(date));
    const queryState = queryClient.getQueryState(dashboardQueryKeys.dayDetail(date));

    if (existingData && queryState?.dataUpdatedAt &&
        Date.now() - queryState.dataUpdatedAt < cacheConfig.staleTime) {
      return Promise.resolve();
    }

    return queryClient.prefetchQuery({
      queryKey: dashboardQueryKeys.dayDetail(date),
      queryFn: () => fetchDayDetails(date, true),
      ...cacheConfig,
    });
  };

  const prefetchAdjacentMonths = (currentYear: number, currentMonth: number) => {
    // 이전 월과 다음 월 prefetch
    const promises = [];

    // 이전 월
    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    promises.push(prefetchMonthlyReport(prevYear, prevMonth));

    // 다음 월
    const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
    const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;
    promises.push(prefetchMonthlyReport(nextYear, nextMonth));

    return Promise.all(promises);
  };

  return {
    prefetchMonthlyReport,
    prefetchDayDetails,
    prefetchAdjacentMonths,
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