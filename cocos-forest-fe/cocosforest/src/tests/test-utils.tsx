import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createTestQueryClient } from './setup';

// 테스트용 Provider 컴포넌트
const AllTheProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = createTestQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

// 커스텀 render 함수
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

// 테스트용 유틸리티 함수들
export const createMockDashboardData = () => ({
  userCardId: 'test-card-id',
  yearMonth: '2024-01',
  currency: 'KRW',
  totals: {
    amountTotal: 150000,
    carbonTotalKg: 2.5,
    transactionCount: 15,
  },
  daily: [
    {
      date: '2024-01-01',
      amountTotal: 10000,
      carbonTotalKg: 0.2,
      transactionCount: 1,
    },
    {
      date: '2024-01-02',
      amountTotal: 15000,
      carbonTotalKg: 0.3,
      transactionCount: 2,
    },
  ],
  byCategory: [
    {
      categoryId: 'food',
      categoryName: '음식점',
      amountTotal: 50000,
      carbonTotalKg: 1.0,
      ratioAmount: 0.33,
      ratioCarbon: 0.4,
      color: '#ef4444',
    },
    {
      categoryId: 'transport',
      categoryName: '교통',
      amountTotal: 30000,
      carbonTotalKg: 0.8,
      ratioAmount: 0.2,
      ratioCarbon: 0.32,
      color: '#3b82f6',
    },
  ],
});

export const createMockTodayData = () => ({
  userCardId: 'test-card-id',
  date: '2024-01-15',
  currency: 'KRW',
  meta: {
    durationMs: 100,
    error: null,
    lockAcquired: true,
    retry: 0,
  },
  totals: {
    amountTotal: 25000,
    carbonTotalKg: 0.5,
    transactionCount: 3,
  },
  transactions: [
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
      carbonKg: 0.2,
      carbonCoefId: 'food-coef',
    },
  ],
});

// re-export everything
export * from '@testing-library/react-native';

// override render method
export { customRender as render };

// export test utilities
export { createTestQueryClient };