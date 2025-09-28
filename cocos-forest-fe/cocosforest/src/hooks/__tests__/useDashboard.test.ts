import { renderHook, act } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useDashboard } from '../useDashboard';
import { createTestQueryClient, createMockDashboardData, createMockTodayData } from '../../tests/test-utils';

// API mocks
jest.mock('../../api/dashboard', () => ({
  fetchTodayData: jest.fn(),
  fetchMonthlyReport: jest.fn(),
}));

// Store mocks
jest.mock('../../store/dashboardStore', () => ({
  __esModule: true,
  default: () => ({
    selectedMonth: 0,
    selectedYear: 2024,
    selectedDay: null,
    activeTab: 0,
    showDetailCard: false,
    setActiveTab: jest.fn(),
    closeDayDetail: jest.fn(),
  }),
}));


describe('useDashboard', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = createTestQueryClient();
    jest.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );

  it('should return initial state correctly', () => {
    const { result } = renderHook(() => useDashboard(), { wrapper });

    expect(result.current.selectedMonth).toBe(0);
    expect(result.current.selectedYear).toBe(2024);
    expect(result.current.selectedDay).toBe(null);
    expect(result.current.activeTab).toBe(0);
    expect(result.current.showDetailCard).toBe(false);
    expect(result.current.isLoading).toBe(true); // 초기 로딩 상태
  });

  it('should handle tab change correctly', () => {
    const mockSetActiveTab = jest.fn();
    const mockCloseDayDetail = jest.fn();

    // Store mock 재정의
    require('../../store/dashboardStore').default.mockReturnValue({
      selectedMonth: 0,
      selectedYear: 2024,
      selectedDay: 1,
      activeTab: 0,
      showDetailCard: true,
      setActiveTab: mockSetActiveTab,
      closeDayDetail: mockCloseDayDetail,
    });

    const { result } = renderHook(() => useDashboard(), { wrapper });

    act(() => {
      result.current.handleTabChange(1);
    });

    expect(mockSetActiveTab).toHaveBeenCalledWith(1);
    expect(mockCloseDayDetail).toHaveBeenCalled();
  });

  it('should calculate isLoading correctly', () => {
    // 로딩 상태 테스트를 위해 mock 데이터 설정
    const { fetchTodayData, fetchMonthlyReport } = require('../../api/dashboard');

    fetchTodayData.mockResolvedValue(createMockTodayData());
    fetchMonthlyReport.mockResolvedValue(createMockDashboardData());

    const { result } = renderHook(() => useDashboard(), { wrapper });

    // 초기에는 로딩 상태여야 함
    expect(result.current.isLoading).toBe(true);
  });

  it('should select cocoGif based on carbon emission', async () => {
    const mockTodayData = createMockTodayData();
    mockTodayData.totals.carbonTotalKg = 0.3; // 낮은 배출량

    const { fetchTodayData } = require('../../api/dashboard');
    fetchTodayData.mockResolvedValue(mockTodayData);

    const { result } = renderHook(() => useDashboard(), { wrapper });

    // 데이터 로딩 완료까지 대기
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    expect(result.current.cocoGif).toBeDefined();
  });


  it('should prefetch adjacent months on tab change', () => {
    const mockPrefetchAdjacentMonths = jest.fn();

    // useDashboardPrefetch mock
    jest.doMock('../useDashboardQueries', () => ({
      ...jest.requireActual('../useDashboardQueries'),
      useDashboardPrefetch: () => ({
        prefetchAdjacentMonths: mockPrefetchAdjacentMonths,
      }),
    }));

    const { result } = renderHook(() => useDashboard(), { wrapper });

    act(() => {
      result.current.handleTabChange(1);
    });

    expect(mockPrefetchAdjacentMonths).toHaveBeenCalledWith(2024, 0);
  });
});