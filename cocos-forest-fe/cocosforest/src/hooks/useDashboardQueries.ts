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
    ...QUERY_CONFIG.ERROR_HANDLING,
  });
};

// Day Details Query Hook
export const useDayDetails = (year: number, month: number, day: number, enabled: boolean = true) => {
  const date = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  const cacheConfig = getDateBasedCacheConfig(date);

  // 임시로 API 호출 비활성화하고 더미 데이터 반환
  const createDummyData = (): DayData => ({
    date,
    totals: {
      amountTotal: 150000,
      transactionCount: 5,
      carbonTotalKg: 12.5,
    },
    transactions: [
      {
        id: '1',
        merchantName: '서울메트로',
        amountKrw: 1500,
        carbonKg: 0.8,
        txTime: '08:30',
        categoryName: '대중교통',
        cardName: '신한카드',
        cardLast4: '1234',
      },
      {
        id: '2',
        merchantName: '스타벅스',
        amountKrw: 4500,
        carbonKg: 1.2,
        txTime: '10:15',
        categoryName: '카페',
        cardName: '신한카드',
        cardLast4: '1234',
      },
      {
        id: '3',
        merchantName: '편의점',
        amountKrw: 3500,
        carbonKg: 0.5,
        txTime: '12:30',
        categoryName: '생활용품',
        cardName: '신한카드',
        cardLast4: '1234',
      },
      {
        id: '4',
        merchantName: '지하철',
        amountKrw: 1400,
        carbonKg: 0.7,
        txTime: '18:20',
        categoryName: '대중교통',
        cardName: '신한카드',
        cardLast4: '1234',
      },
      {
        id: '5',
        merchantName: '마트',
        amountKrw: 135000,
        carbonKg: 9.3,
        txTime: '19:45',
        categoryName: '식품',
        cardName: '신한카드',
        cardLast4: '1234',
      },
    ],
  });

  return useQuery<DayData>({
    queryKey: dashboardQueryKeys.dayDetail(date),
    queryFn: () => {
      // 임시로 더미 데이터 반환
      console.log(`📊 더미 데이터 반환: ${date}`);
      return Promise.resolve(createDummyData());
    },
    enabled,
    ...cacheConfig,
    ...QUERY_CONFIG.BACKGROUND_REFETCH,
    ...QUERY_CONFIG.ERROR_HANDLING,
  });
};

// Today Data Query Hook
export const useTodayData = () => {
  // 임시로 더미 데이터 반환
  const createTodayDummyData = (): DayData => {
    const today = new Date();
    const date = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    
    return {
      date,
      totals: {
        amountTotal: 150000,
        transactionCount: 5,
        carbonTotalKg: 12.5,
      },
      transactions: [
        {
          id: '1',
          merchantName: '서울메트로',
          amountKrw: 1500,
          carbonKg: 0.8,
          txTime: '08:30',
          categoryName: '대중교통',
          cardName: '신한카드',
          cardLast4: '1234',
        },
        {
          id: '2',
          merchantName: '스타벅스',
          amountKrw: 4500,
          carbonKg: 1.2,
          txTime: '10:15',
          categoryName: '카페',
          cardName: '신한카드',
          cardLast4: '1234',
        },
        {
          id: '3',
          merchantName: '편의점',
          amountKrw: 3500,
          carbonKg: 0.5,
          txTime: '12:30',
          categoryName: '생활용품',
          cardName: '신한카드',
          cardLast4: '1234',
        },
        {
          id: '4',
          merchantName: '지하철',
          amountKrw: 1400,
          carbonKg: 0.7,
          txTime: '18:20',
          categoryName: '대중교통',
          cardName: '신한카드',
          cardLast4: '1234',
        },
        {
          id: '5',
          merchantName: '마트',
          amountKrw: 135000,
          carbonKg: 9.3,
          txTime: '19:45',
          categoryName: '식품',
          cardName: '신한카드',
          cardLast4: '1234',
        },
      ],
    };
  };

  return useQuery<DayData>({
    queryKey: dashboardQueryKeys.todayData(),
    queryFn: () => {
      console.log('📊 오늘 데이터 더미 반환');
      return Promise.resolve(createTodayDummyData());
    },
    ...QUERY_CONFIG.TODAY_DATA,
    ...QUERY_CONFIG.BACKGROUND_REFETCH,
    ...QUERY_CONFIG.ERROR_HANDLING,
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