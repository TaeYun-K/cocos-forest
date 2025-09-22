import { useCallback } from 'react';
import usePaymentStore from '../store/paymentStore';
import useDashboardStore from '../store/dashboardStore';
import { useDashboardInvalidation } from './useDashboardQueries';

/**
 * 결제 관련 액션들을 통합 관리하는 커스텀 훅
 */
export const usePaymentActions = () => {
  const { showPaymentSuccess, hidePaymentSuccess } = usePaymentStore();
  const { refreshAICard } = useDashboardStore();
  const { invalidateTodayData, invalidateAllDashboard } = useDashboardInvalidation();

  const handlePaymentSuccess = useCallback(() => {
    // 1. UI 상태 업데이트
    showPaymentSuccess();

    // 2. 관련 데이터 갱신
    invalidateTodayData();
    invalidateAllDashboard();

    // 3. AI 카드 새로고침
    refreshAICard();
  }, [showPaymentSuccess, invalidateTodayData, invalidateAllDashboard, refreshAICard]);

  const handlePaymentModalConfirm = useCallback(() => {
    hidePaymentSuccess();
  }, [hidePaymentSuccess]);

  return {
    handlePaymentSuccess,
    handlePaymentModalConfirm,
  };
};