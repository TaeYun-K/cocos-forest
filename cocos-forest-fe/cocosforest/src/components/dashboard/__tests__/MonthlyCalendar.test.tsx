import React from 'react';
import { render, screen, fireEvent, waitFor } from '../../../tests/test-utils';
import { MonthlyCalendar } from '../MonthlyCalendar';
import { createMockDashboardData } from '../../../tests/test-utils';

// Store mock
const mockUseDashboardStore = {
  selectedYear: 2024,
  selectedMonth: 0, // January
  openDayDetail: jest.fn(),
  changeMonth: jest.fn(),
};

jest.mock('../../../store/dashboardStore', () => ({
  __esModule: true,
  default: () => mockUseDashboardStore,
}));

// Queries mock
const mockUseMonthlyReport = {
  data: null,
  isLoading: false,
  error: null,
  refetch: jest.fn(),
};

jest.mock('../../../hooks/useDashboardQueries', () => ({
  useMonthlyReport: () => mockUseMonthlyReport,
}));

describe('MonthlyCalendar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseMonthlyReport.data = null;
    mockUseMonthlyReport.isLoading = false;
    mockUseMonthlyReport.error = null;
    mockUseDashboardStore.selectedYear = 2024;
    mockUseDashboardStore.selectedMonth = 0;
  });

  it('should render loading state', () => {
    mockUseMonthlyReport.isLoading = true;

    render(<MonthlyCalendar />);

    expect(screen.getByText('월별 탄소 배출량')).toBeTruthy();
    expect(screen.getByText('2024년 1월')).toBeTruthy();
    expect(screen.getByText('월별 데이터를 불러오는 중...')).toBeTruthy();
  });

  it('should render error state with retry option', () => {
    mockUseMonthlyReport.error = new Error('Network error');

    render(<MonthlyCalendar />);

    expect(screen.getByText('월별 데이터 오류')).toBeTruthy();
    expect(screen.getByText('월별 탄소 배출량 데이터를 불러올 수 없습니다.')).toBeTruthy();
    expect(screen.getByText('다시 시도')).toBeTruthy();
  });

  it('should render calendar with data successfully', async () => {
    const mockData = createMockDashboardData();
    mockData.daily = [
      {
        date: '2024-01-01',
        amountTotal: 10000,
        carbonTotalKg: 0.3, // Low emission
        transactionCount: 1,
      },
      {
        date: '2024-01-02',
        amountTotal: 15000,
        carbonTotalKg: 0.6, // Medium emission
        transactionCount: 2,
      },
      {
        date: '2024-01-03',
        amountTotal: 20000,
        carbonTotalKg: 1.0, // High emission
        transactionCount: 3,
      },
    ];
    mockUseMonthlyReport.data = mockData;

    render(<MonthlyCalendar />);

    await waitFor(() => {
      expect(screen.getByText('월별 탄소 배출량')).toBeTruthy();
      expect(screen.getByText('2024년 1월')).toBeTruthy();
    });

    // Check legend
    expect(screen.getByText('낮음 (~0.4kg)')).toBeTruthy();
    expect(screen.getByText('보통 (0.4-0.8kg)')).toBeTruthy();
    expect(screen.getByText('높음 (0.8kg+)')).toBeTruthy();

    // Check weekday headers
    expect(screen.getByText('일')).toBeTruthy();
    expect(screen.getByText('월')).toBeTruthy();
    expect(screen.getByText('화')).toBeTruthy();
    expect(screen.getByText('수')).toBeTruthy();
    expect(screen.getByText('목')).toBeTruthy();
    expect(screen.getByText('금')).toBeTruthy();
    expect(screen.getByText('토')).toBeTruthy();

    // Check calendar days (January 2024 starts on Monday)
    expect(screen.getByText('1')).toBeTruthy();
    expect(screen.getByText('31')).toBeTruthy();
  });

  it('should handle month navigation', async () => {
    const mockData = createMockDashboardData();
    mockUseMonthlyReport.data = mockData;

    render(<MonthlyCalendar />);

    await waitFor(() => {
      const prevButton = screen.getByText('←');
      const nextButton = screen.getByText('→');

      fireEvent.press(prevButton);
      expect(mockUseDashboardStore.changeMonth).toHaveBeenCalledWith('prev');

      fireEvent.press(nextButton);
      expect(mockUseDashboardStore.changeMonth).toHaveBeenCalledWith('next');
    });
  });

  it('should handle day press', async () => {
    const mockData = createMockDashboardData();
    mockUseMonthlyReport.data = mockData;

    render(<MonthlyCalendar />);

    await waitFor(() => {
      const day15 = screen.getByText('15');
      fireEvent.press(day15);

      expect(mockUseDashboardStore.openDayDetail).toHaveBeenCalledWith(15);
    });
  });

  it('should display correct month name for different months', () => {
    mockUseDashboardStore.selectedMonth = 11; // December
    mockUseDashboardStore.selectedYear = 2023;

    const mockData = createMockDashboardData();
    mockUseMonthlyReport.data = mockData;

    render(<MonthlyCalendar />);

    expect(screen.getByText('2023년 12월')).toBeTruthy();
  });

  it('should render correct number of days for February in leap year', () => {
    mockUseDashboardStore.selectedMonth = 1; // February
    mockUseDashboardStore.selectedYear = 2024; // Leap year

    const mockData = createMockDashboardData();
    mockUseMonthlyReport.data = mockData;

    render(<MonthlyCalendar />);

    // February 2024 has 29 days
    expect(screen.getByText('29')).toBeTruthy();
  });

  it('should render correct number of days for February in non-leap year', () => {
    mockUseDashboardStore.selectedMonth = 1; // February
    mockUseDashboardStore.selectedYear = 2023; // Non-leap year

    const mockData = createMockDashboardData();
    mockUseMonthlyReport.data = mockData;

    render(<MonthlyCalendar />);

    // February 2023 has 28 days
    expect(screen.getByText('28')).toBeTruthy();
    expect(screen.queryByText('29')).toBeNull();
  });

  it('should handle empty daily data gracefully', async () => {
    const mockData = createMockDashboardData();
    mockData.daily = [];
    mockUseMonthlyReport.data = mockData;

    render(<MonthlyCalendar />);

    await waitFor(() => {
      // Should still render calendar structure
      expect(screen.getByText('월별 탄소 배출량')).toBeTruthy();
      expect(screen.getByText('1')).toBeTruthy();
      expect(screen.getByText('31')).toBeTruthy();
    });
  });

  it('should use optimized daily data lookup', async () => {
    const mockData = createMockDashboardData();
    // Add many daily entries to test performance optimization
    mockData.daily = Array.from({ length: 31 }, (_, i) => ({
      date: `2024-01-${String(i + 1).padStart(2, '0')}`,
      amountTotal: 10000,
      carbonTotalKg: 0.5,
      transactionCount: 1,
    }));
    mockUseMonthlyReport.data = mockData;

    render(<MonthlyCalendar />);

    await waitFor(() => {
      // Should render all days efficiently
      expect(screen.getByText('1')).toBeTruthy();
      expect(screen.getByText('31')).toBeTruthy();
    });
  });
});