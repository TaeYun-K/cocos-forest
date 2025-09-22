import { create } from 'zustand';

interface PaymentState {
  // 결제 UI 상태
  showSuccessModal: boolean;
}

interface PaymentActions {
  // 성공 모달 관련
  showPaymentSuccess: (result?: any) => void;
  hidePaymentSuccess: () => void;
}

type PaymentStore = PaymentState & PaymentActions;

const usePaymentStore = create<PaymentStore>((set) => ({
  // 초기 상태
  showSuccessModal: false,

  // 액션들
  showPaymentSuccess: () => set({
    showSuccessModal: true,
  }),

  hidePaymentSuccess: () => set({
    showSuccessModal: false,
  }),
}));

export default usePaymentStore;