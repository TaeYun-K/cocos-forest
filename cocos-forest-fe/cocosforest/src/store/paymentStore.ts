import { create } from 'zustand';

interface PaymentState {
  // 결제 UI 상태
  showSuccessModal: boolean;
  isProcessing: boolean;

  // 결제 결과 상태
  lastPaymentResult: any | null;
  error: string | null;
}

interface PaymentActions {
  // 성공 모달 관련
  setShowSuccessModal: (show: boolean) => void;
  showPaymentSuccess: (result?: any) => void;
  hidePaymentSuccess: () => void;

  // 처리 상태 관련
  setProcessing: (processing: boolean) => void;

  // 에러 관련
  setError: (error: string | null) => void;
  clearError: () => void;

  // 리셋
  reset: () => void;
}

type PaymentStore = PaymentState & PaymentActions;

const usePaymentStore = create<PaymentStore>((set) => ({
  // 초기 상태
  showSuccessModal: false,
  isProcessing: false,
  lastPaymentResult: null,
  error: null,

  // 액션들
  setShowSuccessModal: (show: boolean) => set({ showSuccessModal: show }),

  showPaymentSuccess: (result?: any) => set({
    showSuccessModal: true,
    lastPaymentResult: result,
    error: null
  }),

  hidePaymentSuccess: () => set({
    showSuccessModal: false,
    lastPaymentResult: null
  }),

  setProcessing: (processing: boolean) => set({ isProcessing: processing }),

  setError: (error: string | null) => set({ error }),

  clearError: () => set({ error: null }),

  reset: () => set({
    showSuccessModal: false,
    isProcessing: false,
    lastPaymentResult: null,
    error: null
  }),
}));

export default usePaymentStore;