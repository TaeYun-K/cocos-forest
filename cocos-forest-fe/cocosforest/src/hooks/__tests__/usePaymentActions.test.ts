import { renderHook, act } from '@testing-library/react-native';
import { usePaymentActions } from '../usePaymentActions';

// Store mocks
const mockShowPaymentSuccess = jest.fn();
const mockHidePaymentSuccess = jest.fn();
const mockInvalidateTodayData = jest.fn();
const mockInvalidateAllDashboard = jest.fn();

jest.mock('../../store/paymentStore', () => ({
  __esModule: true,
  default: () => ({
    showPaymentSuccess: mockShowPaymentSuccess,
    hidePaymentSuccess: mockHidePaymentSuccess,
  }),
}));

jest.mock('../useDashboardQueries', () => ({
  useDashboardInvalidation: () => ({
    invalidateTodayData: mockInvalidateTodayData,
    invalidateAllDashboard: mockInvalidateAllDashboard,
  }),
}));

describe('usePaymentActions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should provide payment action handlers', () => {
    const { result } = renderHook(() => usePaymentActions());

    expect(typeof result.current.handlePaymentSuccess).toBe('function');
    expect(typeof result.current.handlePaymentModalConfirm).toBe('function');
  });

  it('should handle payment success correctly', () => {
    const { result } = renderHook(() => usePaymentActions());

    act(() => {
      result.current.handlePaymentSuccess();
    });

    expect(mockShowPaymentSuccess).toHaveBeenCalledTimes(1);
    expect(mockInvalidateTodayData).toHaveBeenCalledTimes(1);
    expect(mockInvalidateAllDashboard).toHaveBeenCalledTimes(1);
  });

  it('should handle payment modal confirm correctly', () => {
    const { result } = renderHook(() => usePaymentActions());

    act(() => {
      result.current.handlePaymentModalConfirm();
    });

    expect(mockHidePaymentSuccess).toHaveBeenCalledTimes(1);
  });

  it('should maintain stable function references', () => {
    const { result, rerender } = renderHook(() => usePaymentActions());

    const initialHandlePaymentSuccess = result.current.handlePaymentSuccess;
    const initialHandlePaymentModalConfirm = result.current.handlePaymentModalConfirm;

    rerender();

    expect(result.current.handlePaymentSuccess).toBe(initialHandlePaymentSuccess);
    expect(result.current.handlePaymentModalConfirm).toBe(initialHandlePaymentModalConfirm);
  });

  it('should execute actions in correct order for payment success', () => {
    const callOrder: string[] = [];

    mockShowPaymentSuccess.mockImplementation(() => {
      callOrder.push('showPaymentSuccess');
    });

    mockInvalidateTodayData.mockImplementation(() => {
      callOrder.push('invalidateTodayData');
    });

    mockInvalidateAllDashboard.mockImplementation(() => {
      callOrder.push('invalidateAllDashboard');
    });

    const { result } = renderHook(() => usePaymentActions());

    act(() => {
      result.current.handlePaymentSuccess();
    });

    expect(callOrder).toEqual([
      'showPaymentSuccess',
      'invalidateTodayData',
      'invalidateAllDashboard',
    ]);
  });
});