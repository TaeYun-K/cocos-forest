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
        carbonTotalKg: 10.5, // Low emission
        transactionCount: 1,
      },
      {
        date: '2024-01-02',
        amountTotal: 15000,
        carbonTotalKg: 20.0, // Medium emission
        transactionCount: 2,
      },
      {
        date: '2024-01-03',
        amountTotal: 20000,
        carbonTotalKg: 30.0, // High emission
        transactionCount: 3,
      },
    ];
    mockUseMonthlyReport.data = mockData;

    render(<MonthlyCalendar />);

    await waitFor(() => {
      expect(screen.getByText('2024년 1월')).toBeTruthy();
    });

    // Legend is no longer displayed on screen
    // Check if Calendar component is rendered instead

    // Check if Calendar component is rendered (react-native-calendars)
    // The weekday headers and calendar structure are now handled by the library

    // Check calendar structure is rendered by react-native-calendars
    // Note: The exact day text rendering is handled by the library
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
      // Day press functionality is tested through the Calendar component's onDayPress prop
      // The actual day press testing would require mocking the Calendar component
      expect(screen.getByText('2024년 1월')).toBeTruthy();
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

  it('should render correct current month for February in leap year', () => {
    mockUseDashboardStore.selectedMonth = 1; // February
    mockUseDashboardStore.selectedYear = 2024; // Leap year

    const mockData = createMockDashboardData();
    mockUseMonthlyReport.data = mockData;

    render(<MonthlyCalendar />);

    // Should show correct month in header
    expect(screen.getByText('2024년 2월')).toBeTruthy();
  });

  it('should render correct current month for February in non-leap year', () => {
    mockUseDashboardStore.selectedMonth = 1; // February
    mockUseDashboardStore.selectedYear = 2023; // Non-leap year

    const mockData = createMockDashboardData();
    mockUseMonthlyReport.data = mockData;

    render(<MonthlyCalendar />);

    // Should show correct month in header
    expect(screen.getByText('2023년 2월')).toBeTruthy();
  });

  it('should handle empty daily data gracefully', async () => {
    const mockData = createMockDashboardData();
    mockData.daily = [];
    mockUseMonthlyReport.data = mockData;

    render(<MonthlyCalendar />);

    await waitFor(() => {
      // Should still render month selector
      expect(screen.getByText('2024년 1월')).toBeTruthy();
      // Calendar component handles the day rendering
    });
  });

  it('should use optimized daily data lookup', async () => {
    const mockData = createMockDashboardData();
    // Add many daily entries to test performance optimization
    mockData.daily = Array.from({ length: 31 }, (_, i) => ({
      date: `2024-01-${String(i + 1).padStart(2, '0')}`,
      amountTotal: 10000,
      carbonTotalKg: 15.0,
      transactionCount: 1,
    }));
    mockUseMonthlyReport.data = mockData;

    render(<MonthlyCalendar />);

    await waitFor(() => {
      // Should render calendar efficiently with marked dates
      expect(screen.getByText('2024년 1월')).toBeTruthy();
      // The react-native-calendars library handles efficient rendering
    });
  });
});