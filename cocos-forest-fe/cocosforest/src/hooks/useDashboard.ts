import { useMemo, useEffect } from 'react';
import useDashboardStore from '../store/dashboardStore';
import { useMonthlyReport, useTodayData, useDashboardPrefetch } from './useDashboardQueries';
import { selectCocoGif } from '../utils/cocoGifSelector';
import { useImagePreloader } from '../utils/imagePreloader';

/**
 * 대시보드 관련 모든 비즈니스 로직을 통합 관리하는 커스텀 훅
 *
 * @description 대시보드 화면에서 필요한 모든 상태와 액션을 통합 제공
 * - 선택된 날짜/월/년도 상태 관리
 * - 탭 활성 상태 및 상세 카드 표시 상태
 * - 오늘 데이터 및 월별 리포트 데이터 조회
 * - 이미지 프리로딩 및 성능 최적화
 *
 * @returns {Object} 대시보드 관련 상태와 액션들
 * @returns {number} returns.selectedMonth - 현재 선택된 월 (0-11)
 * @returns {number} returns.selectedYear - 현재 선택된 년도
 * @returns {number|null} returns.selectedDay - 현재 선택된 일 (null이면 선택되지 않음)
 * @returns {number} returns.activeTab - 현재 활성 탭 (0: 일별, 1: 카테고리별)
 * @returns {boolean} returns.showDetailCard - 날짜 상세 카드 표시 여부
 * @returns {boolean} returns.isLoading - 데이터 로딩 상태
 * @returns {any} returns.todayData - 오늘 데이터
 * @returns {any} returns.monthlyReportData - 월별 리포트 데이터
 * @returns {any} returns.cocoGif - 탄소 배출량에 따른 코코 GIF
 * @returns {Function} returns.handleTabChange - 탭 변경 핸들러
 *
 * @example
 * ```tsx
 * const {
 *   selectedMonth,
 *   activeTab,
 *   isLoading,
 *   todayData,
 *   handleTabChange,
 * } = useDashboard();
 *
 * // 탭 변경
 * handleTabChange(1); // 카테고리별 탭으로 변경
 * ```
 */
export const useDashboard = () => {
  // Dashboard 상태
  const {
    selectedMonth,
    selectedYear,
    selectedDay,
    activeTab,
    showDetailCard,
    aiCardRefreshKey,
    setActiveTab,
    closeDayDetail,
    refreshAICard,
  } = useDashboardStore();


  // React Query hooks
  const { data: todayData, isLoading: todayLoading, error: todayError } = useTodayData();
  const { data: monthlyReportData, isLoading: monthlyLoading, error: monthlyError } = useMonthlyReport(selectedYear, selectedMonth);

  // 성능 최적화 hooks
  const { prefetchAdjacentMonths } = useDashboardPrefetch();
  const { preloadCocoGifs } = useImagePreloader();

  // 이미지 프리로딩
  useEffect(() => {
    preloadCocoGifs();
  }, [preloadCocoGifs]);

  // 파생된 상태들
  const isLoading = useMemo(() => todayLoading || monthlyLoading, [todayLoading, monthlyLoading]);
  const cocoGif = useMemo(() => selectCocoGif((todayData as any)?.totals?.carbonTotalKg), [todayData]);

  // 탭 변경 핸들러
  const handleTabChange = (tabIndex: number) => {
    setActiveTab(tabIndex);
    if (showDetailCard) {
      closeDayDetail();
    }

    // 탭 변경 시 인접 월 데이터 미리 로드
    prefetchAdjacentMonths(selectedYear, selectedMonth);
  };

  return {
    // 상태
    selectedMonth,
    selectedYear,
    selectedDay,
    activeTab,
    showDetailCard,
    isLoading,
    aiCardRefreshKey,

    // 데이터
    todayData,
    monthlyReportData,
    cocoGif,

    // 에러
    todayError,
    monthlyError,

    // 액션
    handleTabChange,
    closeDayDetail,
    refreshAICard,
  };
};