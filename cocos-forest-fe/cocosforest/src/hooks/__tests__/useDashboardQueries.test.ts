import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import {
  useMonthlyReport,
  useTodayData,
  useDayDetails,
  useDashboardPrefetch,
  dashboardQueryKeys,
} from '../useDashboardQueries';
import { createTestQueryClient, createMockDashboardData, createMockTodayData } from '../../tests/test-utils';

// API mocks
jest.mock('../../api/dashboard', () => ({
  fetchMonthlyReport: jest.fn(),
  fetchTodayData: jest.fn(),
  fetchDayDetails: jest.fn(),
}));

describe('useDashboardQueries', () => {
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

  describe('useMonthlyReport', () => {
    it('should fetch monthly report data successfully', async () => {
      const mockData = createMockDashboardData();
      const { fetchMonthlyReport } = require('../../api/dashboard');
      fetchMonthlyReport.mockResolvedValue(mockData);

      const { result } = renderHook(() => useMonthlyReport(2024, 0), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockData);
      expect(fetchMonthlyReport).toHaveBeenCalledWith('2024-01');
    });

    it('should handle monthly report fetch error', async () => {
      const { fetchMonthlyReport } = require('../../api/dashboard');
      fetchMonthlyReport.mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useMonthlyReport(2024, 0), { wrapper });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeDefined();
    });

    it('should format year-month correctly', async () => {
      const { fetchMonthlyReport } = require('../../api/dashboard');
      fetchMonthlyReport.mockResolvedValue(createMockDashboardData());

      renderHook(() => useMonthlyReport(2024, 11), { wrapper });

      await waitFor(() => {
        expect(fetchMonthlyReport).toHaveBeenCalledWith('2024-12');
      });
    });
  });

  describe('useTodayData', () => {
    it('should fetch today data successfully', async () => {
      const mockData = createMockTodayData();
      const { fetchTodayData } = require('../../api/dashboard');
      fetchTodayData.mockResolvedValue(mockData);

      const { result } = renderHook(() => useTodayData(), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockData);
      expect(fetchTodayData).toHaveBeenCalledTimes(1);
    });

    it('should handle today data fetch error', async () => {
      const { fetchTodayData } = require('../../api/dashboard');
      fetchTodayData.mockRejectedValue(new Error('API error'));

      const { result } = renderHook(() => useTodayData(), { wrapper });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeDefined();
    });
  });

  describe('useDayDetails', () => {
    it('should fetch day details when enabled', async () => {
      const mockData = createMockTodayData();
      const { fetchDayDetails } = require('../../api/dashboard');
      fetchDayDetails.mockResolvedValue(mockData);

      const { result } = renderHook(
        () => useDayDetails(2024, 0, 15, true),
        { wrapper }
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockData);
      expect(fetchDayDetails).toHaveBeenCalledWith('2024-01-15', true);
    });

    it('should not fetch when disabled', () => {
      const { fetchDayDetails } = require('../../api/dashboard');

      renderHook(() => useDayDetails(2024, 0, 15, false), { wrapper });

      expect(fetchDayDetails).not.toHaveBeenCalled();
    });

    it('should format date correctly with leading zeros', async () => {
      const { fetchDayDetails } = require('../../api/dashboard');
      fetchDayDetails.mockResolvedValue(createMockTodayData());

      renderHook(() => useDayDetails(2024, 0, 5, true), { wrapper });

      await waitFor(() => {
        expect(fetchDayDetails).toHaveBeenCalledWith('2024-01-05', true);
      });
    });
  });

  describe('useDashboardPrefetch', () => {
    it('should prefetch monthly report', async () => {
      const mockData = createMockDashboardData();
      const { fetchMonthlyReport } = require('../../api/dashboard');
      fetchMonthlyReport.mockResolvedValue(mockData);

      const { result } = renderHook(() => useDashboardPrefetch(), { wrapper });

      await result.current.prefetchMonthlyReport(2024, 5);

      expect(fetchMonthlyReport).toHaveBeenCalledWith('2024-06');
    });

    it('should prefetch adjacent months correctly', async () => {
      const mockData = createMockDashboardData();
      const { fetchMonthlyReport } = require('../../api/dashboard');
      fetchMonthlyReport.mockResolvedValue(mockData);

      const { result } = renderHook(() => useDashboardPrefetch(), { wrapper });

      await result.current.prefetchAdjacentMonths(2024, 5); // June

      // Should prefetch May (prev) and July (next)
      expect(fetchMonthlyReport).toHaveBeenCalledWith('2024-05');
      expect(fetchMonthlyReport).toHaveBeenCalledWith('2024-07');
    });

    it('should handle year boundaries in adjacent months', async () => {
      const mockData = createMockDashboardData();
      const { fetchMonthlyReport } = require('../../api/dashboard');
      fetchMonthlyReport.mockResolvedValue(mockData);

      const { result } = renderHook(() => useDashboardPrefetch(), { wrapper });

      // Test January (should go to previous year)
      await result.current.prefetchAdjacentMonths(2024, 0);

      expect(fetchMonthlyReport).toHaveBeenCalledWith('2023-12'); // Previous year Dec
      expect(fetchMonthlyReport).toHaveBeenCalledWith('2024-02'); // Next month

      jest.clearAllMocks();

      // Test December (should go to next year)
      await result.current.prefetchAdjacentMonths(2024, 11);

      expect(fetchMonthlyReport).toHaveBeenCalledWith('2024-11'); // Previous month
      expect(fetchMonthlyReport).toHaveBeenCalledWith('2025-01'); // Next year Jan
    });

    it('should skip prefetch if data is already fresh', async () => {
      const mockData = createMockDashboardData();
      const { fetchMonthlyReport } = require('../../api/dashboard');
      fetchMonthlyReport.mockResolvedValue(mockData);

      // Pre-populate cache
      queryClient.setQueryData(
        dashboardQueryKeys.monthlyReport('2024-06'),
        mockData
      );

      const { result } = renderHook(() => useDashboardPrefetch(), { wrapper });

      await result.current.prefetchMonthlyReport(2024, 5);

      // Should not call fetch since data is fresh
      expect(fetchMonthlyReport).not.toHaveBeenCalled();
    });
  });

  describe('Query Keys', () => {
    it('should generate correct query keys', () => {
      expect(dashboardQueryKeys.all).toEqual(['dashboard']);
      expect(dashboardQueryKeys.monthlyReport('2024-01')).toEqual([
        'dashboard',
        'monthlyReports',
        '2024-01',
      ]);
      expect(dashboardQueryKeys.dayDetail('2024-01-15')).toEqual([
        'dashboard',
        'dayDetails',
        '2024-01-15',
      ]);
      expect(dashboardQueryKeys.todayData()).toEqual(['dashboard', 'todayData']);
    });
  });
});