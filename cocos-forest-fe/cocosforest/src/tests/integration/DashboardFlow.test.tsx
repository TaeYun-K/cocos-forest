import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '../test-utils';
import MockAdapter from 'axios-mock-adapter';
import axios from 'axios';
import { DashboardScreen } from '../../screens/DashboardScreen';
import { createMockDashboardData, createMockTodayData } from '../test-utils';

// Navigation mock
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
    goBack: jest.fn(),
  }),
  useRoute: () => ({
    params: {},
  }),
}));

// AsyncStorage mock
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

describe('Dashboard Integration Tests', () => {
  let mockAxios: MockAdapter;

  beforeEach(() => {
    mockAxios = new MockAdapter(axios);
    jest.clearAllMocks();
  });

  afterEach(() => {
    mockAxios.restore();
  });

  describe('Dashboard Screen Flow', () => {
    it('should load and display dashboard data successfully', async () => {
      // Setup mock data
      const mockTodayData = createMockTodayData();
      const mockMonthlyData = createMockDashboardData();

      // Mock API responses
      mockAxios.onGet('/dashboard/today').reply(200, {
        httpStatus: 'OK',
        isSuccess: true,
        result: mockTodayData,
      });

      mockAxios.onGet(/\/dashboard\/monthly\/\d{4}-\d{2}/).reply(200, {
        httpStatus: 'OK',
        isSuccess: true,
        result: mockMonthlyData,
      });

      render(<DashboardScreen />);

      // Should show loading initially
      expect(screen.getByText('데이터를 불러오는 중...')).toBeTruthy();

      // Wait for data to load
      await waitFor(() => {
        expect(screen.getByText('월별 탄소 배출량')).toBeTruthy();
      });

      // Verify today's emission status is displayed
      await waitFor(() => {
        expect(screen.getByText('오늘의 탄소 배출량')).toBeTruthy();
      });

      // Verify monthly calendar is displayed
      expect(screen.getByText('일별')).toBeTruthy();
      expect(screen.getByText('카테고리별')).toBeTruthy();
    });

    it('should switch between tabs correctly', async () => {
      const mockTodayData = createMockTodayData();
      const mockMonthlyData = createMockDashboardData();

      mockAxios.onGet('/dashboard/today').reply(200, {
        httpStatus: 'OK',
        isSuccess: true,
        result: mockTodayData,
      });

      mockAxios.onGet(/\/dashboard\/monthly\/\d{4}-\d{2}/).reply(200, {
        httpStatus: 'OK',
        isSuccess: true,
        result: mockMonthlyData,
      });

      render(<DashboardScreen />);

      await waitFor(() => {
        expect(screen.getByText('일별')).toBeTruthy();
        expect(screen.getByText('카테고리별')).toBeTruthy();
      });

      // Click on category tab
      const categoryTab = screen.getByText('카테고리별');
      fireEvent.press(categoryTab);

      await waitFor(() => {
        expect(screen.getByText('카테고리별 분석')).toBeTruthy();
      });

      // Click back to daily tab
      const dailyTab = screen.getByText('일별');
      fireEvent.press(dailyTab);

      await waitFor(() => {
        expect(screen.getByText('월별 탄소 배출량')).toBeTruthy();
      });
    });

    it('should handle day selection and show detail card', async () => {
      const mockTodayData = createMockTodayData();
      const mockMonthlyData = createMockDashboardData();
      const mockDayData = createMockTodayData();

      mockAxios.onGet('/dashboard/today').reply(200, {
        httpStatus: 'OK',
        isSuccess: true,
        result: mockTodayData,
      });

      mockAxios.onGet(/\/dashboard\/monthly\/\d{4}-\d{2}/).reply(200, {
        httpStatus: 'OK',
        isSuccess: true,
        result: mockMonthlyData,
      });

      mockAxios.onGet(/\/dashboard\/day\/\d{4}-\d{2}-\d{2}/).reply(200, {
        httpStatus: 'OK',
        isSuccess: true,
        result: mockDayData,
      });

      render(<DashboardScreen />);

      await waitFor(() => {
        expect(screen.getByText('월별 탄소 배출량')).toBeTruthy();
      });

      // Click on a day (assume day 15 exists)
      const day15 = screen.getByText('15');
      fireEvent.press(day15);

      // Should show day detail card
      await waitFor(() => {
        expect(screen.getByText(/\d{4}년 \d{1,2}월 15일/)).toBeTruthy();
        expect(screen.getByText('실시간 동기화 완료')).toBeTruthy();
      });

      // Should be able to close the detail card
      const closeButton = screen.getByText('✕');
      fireEvent.press(closeButton);

      await waitFor(() => {
        expect(screen.queryByText('실시간 동기화 완료')).toBeNull();
      });
    });

    it('should handle payment flow', async () => {
      const mockTodayData = createMockTodayData();
      const mockMonthlyData = createMockDashboardData();
      const mockPaymentResult = {
        transactionUniqueNo: 'tx-123456',
        categoryId: 'food',
        categoryName: '음식점',
        merchantId: 123,
        merchantName: '스타벅스',
        transactionDate: '2024-01-15',
        transactionTime: '10:30:00',
        paymentBalance: 25000,
        savedTransactionId: 789,
        status: 'SUCCESS',
      };

      mockAxios.onGet('/dashboard/today').reply(200, {
        httpStatus: 'OK',
        isSuccess: true,
        result: mockTodayData,
      });

      mockAxios.onGet(/\/dashboard\/monthly\/\d{4}-\d{2}/).reply(200, {
        httpStatus: 'OK',
        isSuccess: true,
        result: mockMonthlyData,
      });

      mockAxios.onPost('/payment/pay').reply(200, {
        httpStatus: 'OK',
        isSuccess: true,
        result: mockPaymentResult,
      });

      render(<DashboardScreen />);

      await waitFor(() => {
        expect(screen.getByText('결제하기')).toBeTruthy();
      });

      // Click payment button
      const paymentButton = screen.getByText('결제하기');
      fireEvent.press(paymentButton);

      // Should show success modal after payment
      await waitFor(() => {
        expect(screen.getByText('결제가 완료되었습니다!')).toBeTruthy();
      });

      // Close success modal
      const confirmButton = screen.getByText('확인');
      fireEvent.press(confirmButton);

      await waitFor(() => {
        expect(screen.queryByText('결제가 완료되었습니다!')).toBeNull();
      });
    });

    it('should handle month navigation', async () => {
      const mockTodayData = createMockTodayData();
      const mockJanuaryData = createMockDashboardData();
      const mockDecemberData = createMockDashboardData();

      mockAxios.onGet('/dashboard/today').reply(200, {
        httpStatus: 'OK',
        isSuccess: true,
        result: mockTodayData,
      });

      // January data
      mockAxios.onGet('/dashboard/monthly/2024-01').reply(200, {
        httpStatus: 'OK',
        isSuccess: true,
        result: mockJanuaryData,
      });

      // December data (previous month)
      mockAxios.onGet('/dashboard/monthly/2023-12').reply(200, {
        httpStatus: 'OK',
        isSuccess: true,
        result: mockDecemberData,
      });

      render(<DashboardScreen />);

      await waitFor(() => {
        expect(screen.getByText('2024년 1월')).toBeTruthy();
      });

      // Click previous month button
      const prevButton = screen.getByText('←');
      fireEvent.press(prevButton);

      await waitFor(() => {
        expect(screen.getByText('2023년 12월')).toBeTruthy();
      });

      // Click next month button
      const nextButton = screen.getByText('→');
      fireEvent.press(nextButton);

      await waitFor(() => {
        expect(screen.getByText('2024년 1월')).toBeTruthy();
      });
    });

    it('should handle error states gracefully', async () => {
      // Mock API errors
      mockAxios.onGet('/dashboard/today').reply(500, {
        httpStatus: 'INTERNAL_SERVER_ERROR',
        isSuccess: false,
        message: 'Server error',
      });

      mockAxios.onGet(/\/dashboard\/monthly\/\d{4}-\d{2}/).reply(404, {
        httpStatus: 'NOT_FOUND',
        isSuccess: false,
        message: 'Data not found',
      });

      render(<DashboardScreen />);

      // Should show error states
      await waitFor(() => {
        expect(screen.getByText('오류가 발생했습니다')).toBeTruthy();
      });

      // Should provide retry functionality
      const retryButtons = screen.getAllByText('다시 시도');
      expect(retryButtons.length).toBeGreaterThan(0);

      // Test retry functionality
      mockAxios.onGet('/dashboard/today').reply(200, {
        httpStatus: 'OK',
        isSuccess: true,
        result: createMockTodayData(),
      });

      fireEvent.press(retryButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('오늘의 탄소 배출량')).toBeTruthy();
      });
    });

    it('should prefetch adjacent months data', async () => {
      const mockTodayData = createMockTodayData();
      const mockCurrentMonthData = createMockDashboardData();

      let requestCount = 0;

      mockAxios.onGet('/dashboard/today').reply(200, {
        httpStatus: 'OK',
        isSuccess: true,
        result: mockTodayData,
      });

      mockAxios.onGet(/\/dashboard\/monthly\/\d{4}-\d{2}/).reply(() => {
        requestCount++;
        return [200, {
          httpStatus: 'OK',
          isSuccess: true,
          result: mockCurrentMonthData,
        }];
      });

      render(<DashboardScreen />);

      await waitFor(() => {
        expect(screen.getByText('카테고리별')).toBeTruthy();
      });

      // Switch tabs to trigger prefetch
      const categoryTab = screen.getByText('카테고리별');
      fireEvent.press(categoryTab);

      await waitFor(() => {
        // Should have made requests for current month + adjacent months
        expect(requestCount).toBeGreaterThan(1);
      });
    });
  });

  describe('Performance and Optimization', () => {
    it('should handle large datasets efficiently', async () => {
      const mockTodayData = createMockTodayData();
      const mockMonthlyData = createMockDashboardData();

      // Create large dataset
      mockMonthlyData.daily = Array.from({ length: 31 }, (_, i) => ({
        date: `2024-01-${String(i + 1).padStart(2, '0')}`,
        amountTotal: Math.floor(Math.random() * 50000),
        carbonTotalKg: Math.random() * 2,
        transactionCount: Math.floor(Math.random() * 10),
      }));

      mockMonthlyData.byCategory = Array.from({ length: 10 }, (_, i) => ({
        categoryId: `category-${i}`,
        categoryName: `카테고리 ${i}`,
        amountTotal: Math.floor(Math.random() * 100000),
        carbonTotalKg: Math.random() * 5,
        ratioAmount: Math.random(),
        ratioCarbon: Math.random(),
      }));

      mockAxios.onGet('/dashboard/today').reply(200, {
        httpStatus: 'OK',
        isSuccess: true,
        result: mockTodayData,
      });

      mockAxios.onGet(/\/dashboard\/monthly\/\d{4}-\d{2}/).reply(200, {
        httpStatus: 'OK',
        isSuccess: true,
        result: mockMonthlyData,
      });

      const startTime = Date.now();

      render(<DashboardScreen />);

      await waitFor(() => {
        expect(screen.getByText('월별 탄소 배출량')).toBeTruthy();
      });

      const renderTime = Date.now() - startTime;

      // Should render within reasonable time (less than 2 seconds)
      expect(renderTime).toBeLessThan(2000);

      // Should handle category tab switch efficiently
      const categoryTab = screen.getByText('카테고리별');
      const tabSwitchStart = Date.now();

      fireEvent.press(categoryTab);

      await waitFor(() => {
        expect(screen.getByText('카테고리별 분석')).toBeTruthy();
      });

      const tabSwitchTime = Date.now() - tabSwitchStart;
      expect(tabSwitchTime).toBeLessThan(1000);
    });
  });
});