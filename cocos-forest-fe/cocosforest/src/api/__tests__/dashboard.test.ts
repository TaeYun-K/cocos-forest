import MockAdapter from 'axios-mock-adapter';
import axios from 'axios';
import {
  fetchTodayData,
  fetchMonthlyReport,
  fetchDayDetails,
} from '../dashboard';
import { createMockTodayData, createMockDashboardData } from '../../tests/test-utils';

describe('Dashboard API', () => {
  let mockAxios: MockAdapter;

  beforeEach(() => {
    mockAxios = new MockAdapter(axios);
  });

  afterEach(() => {
    mockAxios.restore();
  });

  describe('fetchTodayData', () => {
    it('should fetch today data successfully', async () => {
      const mockData = createMockTodayData();
      const mockResponse = {
        httpStatus: 'OK',
        isSuccess: true,
        message: 'Success',
        code: 200,
        result: mockData,
      };

      mockAxios.onGet('/dashboard/today').reply(200, mockResponse);

      const result = await fetchTodayData();

      expect(result).toEqual(mockData);
    });

    it('should handle API error response', async () => {
      const errorResponse = {
        httpStatus: 'BAD_REQUEST',
        isSuccess: false,
        message: 'Invalid request',
        code: 400,
        result: null,
      };

      mockAxios.onGet('/dashboard/today').reply(400, errorResponse);

      await expect(fetchTodayData()).rejects.toThrow('Invalid request');
    });

    it('should handle network error', async () => {
      mockAxios.onGet('/dashboard/today').networkError();

      await expect(fetchTodayData()).rejects.toThrow('Network Error');
    });

    it('should handle timeout', async () => {
      mockAxios.onGet('/dashboard/today').timeout();

      await expect(fetchTodayData()).rejects.toThrow('timeout');
    });
  });

  describe('fetchMonthlyReport', () => {
    it('should fetch monthly report successfully', async () => {
      const mockData = createMockDashboardData();
      const mockResponse = {
        httpStatus: 'OK',
        isSuccess: true,
        message: 'Success',
        code: 200,
        result: mockData,
      };

      mockAxios.onGet('/dashboard/monthly/2024-01').reply(200, mockResponse);

      const result = await fetchMonthlyReport('2024-01');

      expect(result).toEqual(mockData);
      expect(result.byCategory.every(cat => cat.color)).toBe(true); // Check color assignment
    });

    it('should assign colors to categories', async () => {
      const mockData = createMockDashboardData();
      // Remove colors to test assignment
      mockData.byCategory.forEach(cat => delete cat.color);

      const mockResponse = {
        httpStatus: 'OK',
        isSuccess: true,
        message: 'Success',
        code: 200,
        result: mockData,
      };

      mockAxios.onGet('/dashboard/monthly/2024-01').reply(200, mockResponse);

      const result = await fetchMonthlyReport('2024-01');

      expect(result.byCategory[0].color).toBeDefined();
      expect(result.byCategory[1].color).toBeDefined();
      expect(result.byCategory[0].color).not.toBe(result.byCategory[1].color);
    });

    it('should handle invalid year-month format', async () => {
      await expect(fetchMonthlyReport('invalid-format')).rejects.toThrow();
    });

    it('should handle empty category data', async () => {
      const mockData = createMockDashboardData();
      mockData.byCategory = [];

      const mockResponse = {
        httpStatus: 'OK',
        isSuccess: true,
        message: 'Success',
        code: 200,
        result: mockData,
      };

      mockAxios.onGet('/dashboard/monthly/2024-01').reply(200, mockResponse);

      const result = await fetchMonthlyReport('2024-01');

      expect(result.byCategory).toEqual([]);
    });
  });

  describe('fetchDayDetails', () => {
    it('should fetch day details successfully', async () => {
      const mockData = createMockTodayData();
      const mockResponse = {
        httpStatus: 'OK',
        isSuccess: true,
        message: 'Success',
        code: 200,
        result: mockData,
      };

      mockAxios.onGet('/dashboard/day/2024-01-15').reply(200, mockResponse);

      const result = await fetchDayDetails('2024-01-15', true);

      expect(result).toEqual(mockData);
    });

    it('should include refresh parameter when specified', async () => {
      const mockData = createMockTodayData();
      const mockResponse = {
        httpStatus: 'OK',
        isSuccess: true,
        message: 'Success',
        code: 200,
        result: mockData,
      };

      mockAxios.onGet('/dashboard/day/2024-01-15').reply((config) => {
        expect(config.params?.refresh).toBe('true');
        return [200, mockResponse];
      });

      await fetchDayDetails('2024-01-15', true);
    });

    it('should not include refresh parameter when false', async () => {
      const mockData = createMockTodayData();
      const mockResponse = {
        httpStatus: 'OK',
        isSuccess: true,
        message: 'Success',
        code: 200,
        result: mockData,
      };

      mockAxios.onGet('/dashboard/day/2024-01-15').reply((config) => {
        expect(config.params?.refresh).toBeUndefined();
        return [200, mockResponse];
      });

      await fetchDayDetails('2024-01-15', false);
    });

    it('should handle invalid date format', async () => {
      await expect(fetchDayDetails('invalid-date', false)).rejects.toThrow();
    });
  });


  describe('Error Handling', () => {
    it('should handle 500 server error', async () => {
      mockAxios.onGet('/dashboard/today').reply(500, {
        httpStatus: 'INTERNAL_SERVER_ERROR',
        isSuccess: false,
        message: 'Internal server error',
        code: 500,
        result: null,
      });

      await expect(fetchTodayData()).rejects.toThrow('Internal server error');
    });

    it('should handle malformed response', async () => {
      mockAxios.onGet('/dashboard/today').reply(200, 'invalid json');

      await expect(fetchTodayData()).rejects.toThrow();
    });

    it('should handle missing result field', async () => {
      mockAxios.onGet('/dashboard/today').reply(200, {
        httpStatus: 'OK',
        isSuccess: true,
        message: 'Success',
        code: 200,
        // result field is missing
      });

      await expect(fetchTodayData()).rejects.toThrow();
    });
  });

  describe('Request Configuration', () => {
    it('should include correct headers', async () => {
      const mockData = createMockTodayData();
      const mockResponse = {
        httpStatus: 'OK',
        isSuccess: true,
        message: 'Success',
        code: 200,
        result: mockData,
      };

      mockAxios.onGet('/dashboard/today').reply((config) => {
        expect(config.headers['Content-Type']).toBe('application/json');
        return [200, mockResponse];
      });

      await fetchTodayData();
    });

    it('should handle request timeout configuration', async () => {
      // This would test the axios instance configuration
      // Assuming timeout is configured in the axios instance
      const mockData = createMockTodayData();

      // Simulate a slow response that exceeds timeout
      mockAxios.onGet('/dashboard/today').reply(() => {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve([200, { result: mockData }]);
          }, 10000); // 10 second delay
        });
      });

      // The request should timeout before 10 seconds
      await expect(fetchTodayData()).rejects.toThrow();
    });
  });
});