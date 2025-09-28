import { useEffect, useRef, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { dashboardQueryKeys } from './useDashboardQueries';

/**
 * 스마트한 백그라운드 새로고침을 위한 커스텀 훅
 */
export const useSmartRefresh = () => {
  const queryClient = useQueryClient();
  const appStateRef = useRef(AppState.currentState);
  const lastRefreshRef = useRef<Date | null>(null);

  /**
   * 앱이 포어그라운드로 돌아왔을 때 새로고침 여부 결정
   */
  const shouldRefreshOnForeground = useCallback((): boolean => {
    const now = new Date();
    const lastRefresh = lastRefreshRef.current;

    // 첫 번째 포어그라운드 전환이거나 5분 이상 지났으면 새로고침
    if (!lastRefresh || now.getTime() - lastRefresh.getTime() > 5 * 60 * 1000) {
      return true;
    }

    return false;
  }, []);

  /**
   * 중요한 데이터만 선택적으로 새로고침
   */
  const refreshCriticalData = useCallback(() => {
    if (!shouldRefreshOnForeground()) return;

    console.log('🔄 포어그라운드 전환 - 중요 데이터 새로고침');

    // 오늘 데이터만 새로고침 (가장 중요)
    queryClient.invalidateQueries({
      queryKey: dashboardQueryKeys.todayData(),
    });

    // 현재 월 데이터 새로고침
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const yearMonth = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;

    queryClient.invalidateQueries({
      queryKey: dashboardQueryKeys.monthlyReport(yearMonth),
    });

    lastRefreshRef.current = new Date();
  }, [queryClient, shouldRefreshOnForeground]);

  /**
   * 특정 시간대에만 자동 새로고침 (배터리 절약)
   */
  const isActiveHours = useCallback((): boolean => {
    const now = new Date();
    const hour = now.getHours();

    // 오전 6시 ~ 오후 11시만 활성 시간으로 간주
    return hour >= 6 && hour <= 23;
  }, []);

  /**
   * 네트워크 상태 고려한 새로고침
   */
  const conditionalRefresh = useCallback((queryKey: readonly unknown[]) => {
    if (!isActiveHours()) {
      console.log('⏰ 비활성 시간대 - 새로고침 건너뛰기');
      return;
    }

    queryClient.invalidateQueries({ queryKey });
  }, [queryClient, isActiveHours]);

  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (appStateRef.current.match(/inactive|background/) && nextAppState === 'active') {
        // 백그라운드에서 포어그라운드로 전환
        refreshCriticalData();
      }
      appStateRef.current = nextAppState;
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription?.remove();
    };
  }, [refreshCriticalData]);

  return {
    refreshCriticalData,
    conditionalRefresh,
    isActiveHours,
  };
};