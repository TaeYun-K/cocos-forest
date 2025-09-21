import { useMemo } from 'react';
import useDashboardStore from '../store/dashboardStore';
import usePaymentStore from '../store/paymentStore';
import { useMonthlyReport, useTodayData } from './useDashboardQueries';
import { usePaymentActions } from './usePaymentActions';
import { selectCocoGif } from '../utils/cocoGifSelector';

/**
 * 대시보드 관련 모든 비즈니스 로직을 통합 관리하는 커스텀 훅
 */
export const useDashboard = () => {
  // Dashboard 상태
  const {
    selectedMonth,
    selectedYear,
    selectedDay,
    activeTab,
    showDetailCard,
    setActiveTab,
    closeDayDetail,
  } = useDashboardStore();

  // Payment 상태 및 액션
  const { showSuccessModal } = usePaymentStore();
  const { handlePaymentSuccess, handlePaymentModalConfirm } = usePaymentActions();

  // React Query hooks
  const { data: todayData, isLoading: todayLoading, error: todayError } = useTodayData();
  const { data: monthlyReportData, isLoading: monthlyLoading, error: monthlyError } = useMonthlyReport(selectedYear, selectedMonth);

  // 파생된 상태들
  const isLoading = useMemo(() => todayLoading || monthlyLoading, [todayLoading, monthlyLoading]);
  const cocoGif = useMemo(() => selectCocoGif(todayData?.totals?.carbonTotalKg), [todayData?.totals?.carbonTotalKg]);

  // 탭 변경 핸들러
  const handleTabChange = (tabIndex: number) => {
    setActiveTab(tabIndex);
    if (showDetailCard) {
      closeDayDetail();
    }
  };

  return {
    // 상태
    selectedMonth,
    selectedYear,
    selectedDay,
    activeTab,
    showDetailCard,
    showSuccessModal,
    isLoading,

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
    handlePaymentSuccess,
    handlePaymentModalConfirm,
  };
};