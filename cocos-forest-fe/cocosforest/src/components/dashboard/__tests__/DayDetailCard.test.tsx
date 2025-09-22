import React from 'react';
import { render, screen, fireEvent, waitFor } from '../../../tests/test-utils';
import { DayDetailCard } from '../DayDetailCard';
import { createMockTodayData } from '../../../tests/test-utils';

// Store mock
const mockUseDashboardStore = {
  selectedYear: 2024,
  selectedMonth: 0,
  selectedDay: 15,
  closeDayDetail: jest.fn(),
};

jest.mock('../../../store/dashboardStore', () => ({
  __esModule: true,
  default: () => mockUseDashboardStore,
}));

// Queries mock
const mockUseDayDetails = {
  data: null,
  isLoading: false,
  error: null,
};

jest.mock('../../../hooks/useDashboardQueries', () => ({
  useDayDetails: () => mockUseDayDetails,
}));

describe('DayDetailCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseDayDetails.data = null;
    mockUseDayDetails.isLoading = false;
    mockUseDayDetails.error = null;
    mockUseDashboardStore.selectedDay = 15;
  });

  it('should not render when selectedDay is null', () => {
    mockUseDashboardStore.selectedDay = null;

    const { container } = render(<DayDetailCard />);

    expect(container.children.length).toBe(0);
  });

  it('should render loading state', () => {
    mockUseDayDetails.isLoading = true;

    render(<DayDetailCard />);

    expect(screen.getByText('2024년 1월 15일')).toBeTruthy();
    expect(screen.getByText('데이터를 불러오는 중...')).toBeTruthy();
  });

  it('should render error state', () => {
    mockUseDayDetails.error = new Error('Network error');

    render(<DayDetailCard />);

    expect(screen.getByText('2024년 1월 15일')).toBeTruthy();
    expect(screen.getByText('데이터를 불러올 수 없습니다.')).toBeTruthy();
  });

  it('should render day detail data successfully', async () => {
    const mockData = createMockTodayData();
    mockData.totals = {
      amountTotal: 50000,
      carbonTotalKg: 1.2,
      transactionCount: 5,
    };
    mockUseDayDetails.data = mockData;

    render(<DayDetailCard />);

    await waitFor(() => {
      // Header
      expect(screen.getByText('2024년 1월 15일')).toBeTruthy();
      expect(screen.getByText('실시간 동기화 완료')).toBeTruthy();

      // Total emission card
      expect(screen.getByText('총 탄소 배출량')).toBeTruthy();
      expect(screen.getByText('1.2kg CO₂')).toBeTruthy();

      // Stats
      expect(screen.getByText('50,000원')).toBeTruthy();
      expect(screen.getByText('총 결제금액')).toBeTruthy();
      expect(screen.getByText('5건')).toBeTruthy();
      expect(screen.getByText('거래 건수')).toBeTruthy();

      // Transactions section
      expect(screen.getByText('거래 내역')).toBeTruthy();
    });
  });

  it('should render transaction details correctly', async () => {
    const mockData = createMockTodayData();
    mockData.transactions = [
      {
        externalTransactionId: 'tx-1',
        approvedAt: '2024-01-15T10:00:00Z',
        txDate: '2024-01-15',
        txTime: '10:00',
        amountKrw: 12000,
        status: 'approved',
        merchantName: '스타벅스',
        categoryId: 'food',
        categoryName: '음식점',
        cardLast4: '1234',
        issuerCode: 'KB',
        cardName: 'KB국민카드',
        source: 'card',
        carbonKg: 0.3,
        carbonCoefId: 'food-coef',
      },
      {
        externalTransactionId: 'tx-2',
        approvedAt: '2024-01-15T14:30:00Z',
        txDate: '2024-01-15',
        txTime: '14:30',
        amountKrw: 8500,
        status: 'approved',
        merchantName: '지하철',
        categoryId: 'transport',
        categoryName: '교통',
        cardLast4: '5678',
        issuerCode: 'NH',
        cardName: 'NH농협카드',
        source: 'card',
        carbonKg: 0.1,
        carbonCoefId: 'transport-coef',
      },
    ];
    mockUseDayDetails.data = mockData;

    render(<DayDetailCard />);

    await waitFor(() => {
      // First transaction
      expect(screen.getByText('스타벅스')).toBeTruthy();
      expect(screen.getByText('10:00')).toBeTruthy();
      expect(screen.getByText('12,000원')).toBeTruthy();
      expect(screen.getByText('0.3kg CO₂')).toBeTruthy();
      expect(screen.getByText('음식점')).toBeTruthy();
      expect(screen.getByText('KB국민카드 ****1234')).toBeTruthy();

      // Second transaction
      expect(screen.getByText('지하철')).toBeTruthy();
      expect(screen.getByText('14:30')).toBeTruthy();
      expect(screen.getByText('8,500원')).toBeTruthy();
      expect(screen.getByText('0.1kg CO₂')).toBeTruthy();
      expect(screen.getByText('교통')).toBeTruthy();
      expect(screen.getByText('NH농협카드 ****5678')).toBeTruthy();
    });
  });

  it('should handle close button click', async () => {
    const mockData = createMockTodayData();
    mockUseDayDetails.data = mockData;

    render(<DayDetailCard />);

    await waitFor(() => {
      const closeButton = screen.getByText('✕');
      fireEvent.press(closeButton);

      expect(mockUseDashboardStore.closeDayDetail).toHaveBeenCalledTimes(1);
    });
  });

  it('should display correct month name', () => {
    mockUseDashboardStore.selectedMonth = 11; // December
    mockUseDashboardStore.selectedYear = 2023;
    mockUseDashboardStore.selectedDay = 25;

    render(<DayDetailCard />);

    expect(screen.getByText('2023년 12월 25일')).toBeTruthy();
  });

  it('should handle empty transactions', async () => {
    const mockData = createMockTodayData();
    mockData.transactions = [];
    mockUseDayDetails.data = mockData;

    render(<DayDetailCard />);

    await waitFor(() => {
      expect(screen.getByText('거래 내역')).toBeTruthy();
      // Should still render the transactions section even if empty
    });
  });

  it('should format large amounts correctly', async () => {
    const mockData = createMockTodayData();
    mockData.totals.amountTotal = 1234567;
    mockData.transactions[0].amountKrw = 999999;
    mockUseDayDetails.data = mockData;

    render(<DayDetailCard />);

    await waitFor(() => {
      expect(screen.getByText('1,234,567원')).toBeTruthy();
      expect(screen.getByText('999,999원')).toBeTruthy();
    });
  });

  it('should calculate average values correctly', async () => {
    const mockData = createMockTodayData();
    mockData.totals = {
      amountTotal: 150000,
      carbonTotalKg: 3.0,
      transactionCount: 5,
    };
    mockUseDayDetails.data = mockData;

    render(<DayDetailCard />);

    await waitFor(() => {
      expect(screen.getByText('150,000원')).toBeTruthy();
      expect(screen.getByText('3kg CO₂')).toBeTruthy();
      expect(screen.getByText('5건')).toBeTruthy();
    });
  });
});