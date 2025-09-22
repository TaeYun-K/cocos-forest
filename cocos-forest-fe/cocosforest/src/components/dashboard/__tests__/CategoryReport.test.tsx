import React from 'react';
import { render, screen, waitFor } from '../../../tests/test-utils';
import { CategoryReport } from '../CategoryReport';
import { createMockDashboardData } from '../../../tests/test-utils';

// Store mock
const mockUseDashboardStore = {
  selectedYear: 2024,
  selectedMonth: 0,
  showCategoryModal: false,
  categoryModalData: null,
  categoryModalLoading: false,
  closeCategoryModal: jest.fn(),
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

// Component mocks
jest.mock('../CategorySummary', () => ({
  CategorySummary: ({ monthlyReportData }: any) => (
    <div data-testid="category-summary">
      Category Summary - {monthlyReportData.yearMonth}
    </div>
  ),
}));

jest.mock('../CategoryPieChart', () => ({
  CategoryPieChart: ({ categories }: any) => (
    <div data-testid="category-pie-chart">
      Pie Chart - {categories.length} categories
    </div>
  ),
}));

jest.mock('../CategoryItem', () => ({
  CategoryItem: ({ item, index }: any) => (
    <div data-testid={`category-item-${index}`}>
      {item.categoryName} - {item.carbonTotalKg}kg
    </div>
  ),
}));

jest.mock('../CategoryDetailModal', () => ({
  CategoryDetailModal: ({ visible }: any) => (
    visible ? <div data-testid="category-detail-modal">Detail Modal</div> : null
  ),
}));

describe('CategoryReport', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset mock data
    mockUseMonthlyReport.data = null;
    mockUseMonthlyReport.isLoading = false;
    mockUseMonthlyReport.error = null;
  });

  it('should render loading state', () => {
    mockUseMonthlyReport.isLoading = true;

    render(<CategoryReport />);

    expect(screen.getByText('카테고리 데이터를 불러오는 중...')).toBeTruthy();
  });

  it('should render error state with retry option', () => {
    mockUseMonthlyReport.error = new Error('Network error');

    render(<CategoryReport />);

    expect(screen.getByText('카테고리 데이터 오류')).toBeTruthy();
    expect(screen.getByText('카테고리 데이터를 불러올 수 없습니다. 네트워크 연결을 확인해 주세요.')).toBeTruthy();
    expect(screen.getByText('다시 시도')).toBeTruthy();
  });

  it('should render monthly report data successfully', async () => {
    const mockData = createMockDashboardData();
    mockUseMonthlyReport.data = mockData;

    render(<CategoryReport />);

    await waitFor(() => {
      expect(screen.getByTestId('category-summary')).toBeTruthy();
      expect(screen.getByTestId('category-pie-chart')).toBeTruthy();
    });

    // Check if categories are sorted by carbon emission (highest first)
    expect(screen.getByTestId('category-item-0')).toBeTruthy();
    expect(screen.getByTestId('category-item-1')).toBeTruthy();
  });

  it('should sort categories by carbon emission in descending order', async () => {
    const mockData = createMockDashboardData();
    // Ensure different carbon values for sorting test
    mockData.byCategory[0].carbonTotalKg = 0.5;
    mockData.byCategory[1].carbonTotalKg = 1.2;
    mockUseMonthlyReport.data = mockData;

    render(<CategoryReport />);

    await waitFor(() => {
      // First item should be transport (1.2kg) - higher emission
      expect(screen.getByTestId('category-item-0')).toBeTruthy();
      expect(screen.getByText('교통 - 1.2kg')).toBeTruthy();

      // Second item should be food (0.5kg) - lower emission
      expect(screen.getByTestId('category-item-1')).toBeTruthy();
      expect(screen.getByText('음식점 - 0.5kg')).toBeTruthy();
    });
  });

  it('should render section title', async () => {
    const mockData = createMockDashboardData();
    mockUseMonthlyReport.data = mockData;

    render(<CategoryReport />);

    await waitFor(() => {
      expect(screen.getByText('카테고리별 분석')).toBeTruthy();
    });
  });

  it('should not render modal when showCategoryModal is false', async () => {
    const mockData = createMockDashboardData();
    mockUseMonthlyReport.data = mockData;
    mockUseDashboardStore.showCategoryModal = false;

    render(<CategoryReport />);

    await waitFor(() => {
      expect(screen.queryByTestId('category-detail-modal')).toBeNull();
    });
  });

  it('should render modal when showCategoryModal is true', async () => {
    const mockData = createMockDashboardData();
    mockUseMonthlyReport.data = mockData;
    mockUseDashboardStore.showCategoryModal = true;

    render(<CategoryReport />);

    await waitFor(() => {
      expect(screen.getByTestId('category-detail-modal')).toBeTruthy();
    });
  });

  it('should handle empty category data', async () => {
    const mockData = createMockDashboardData();
    mockData.byCategory = [];
    mockUseMonthlyReport.data = mockData;

    render(<CategoryReport />);

    await waitFor(() => {
      expect(screen.getByTestId('category-summary')).toBeTruthy();
      expect(screen.getByTestId('category-pie-chart')).toBeTruthy();
      expect(screen.getByText('카테고리별 분석')).toBeTruthy();

      // No category items should be rendered
      expect(screen.queryByTestId('category-item-0')).toBeNull();
    });
  });
});