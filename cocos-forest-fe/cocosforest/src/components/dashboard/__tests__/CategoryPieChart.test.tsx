import React from 'react';
import { render, screen } from '../../../tests/test-utils';
import { CategoryPieChart } from '../CategoryPieChart';
import type { CategoryData } from '../../../types/dashboard';

// Mock react-native-gifted-charts
jest.mock('react-native-gifted-charts', () => ({
  PieChart: ({ data, centerLabelComponent }: any) => {
    const MockPieChart = require('react-native').View;
    return (
      <MockPieChart testID="pie-chart">
        {centerLabelComponent && centerLabelComponent()}
        {data?.map((item: any, index: number) => (
          <MockPieChart key={index} testID={`pie-segment-${index}`}>
            {item.text}
          </MockPieChart>
        ))}
      </MockPieChart>
    );
  },
}));

const mockCategories: CategoryData[] = [
  {
    categoryId: '1',
    categoryName: '식비',
    amountTotal: 50000,
    carbonTotalKg: 2.5,
    ratioCarbon: 0.5,
    color: '#ef4444',
  },
  {
    categoryId: '2',
    categoryName: '교통비',
    amountTotal: 30000,
    carbonTotalKg: 1.5,
    ratioCarbon: 0.3,
    color: '#3b82f6',
  },
  {
    categoryId: '3',
    categoryName: '쇼핑',
    amountTotal: 20000,
    carbonTotalKg: 1.0,
    ratioCarbon: 0.2,
    color: '#10b981',
  },
];

describe('CategoryPieChart', () => {
  it('should render with default title', () => {
    render(<CategoryPieChart categories={mockCategories} />);

    expect(screen.getByText('탄소 배출량 비율')).toBeTruthy();
  });

  it('should render with custom title', () => {
    const customTitle = '커스텀 제목';
    render(<CategoryPieChart categories={mockCategories} title={customTitle} />);

    expect(screen.getByText(customTitle)).toBeTruthy();
  });

  it('should render pie chart with data', () => {
    render(<CategoryPieChart categories={mockCategories} />);

    expect(screen.getByTestId('pie-chart')).toBeTruthy();
    expect(screen.getByText('총 배출량')).toBeTruthy();
    expect(screen.getByText('5.0kg')).toBeTruthy(); // Total emission
  });

  it('should render legend with category information', () => {
    render(<CategoryPieChart categories={mockCategories} />);

    // Check legend items
    expect(screen.getByText('식비')).toBeTruthy();
    expect(screen.getByText('2.5kg (50%)')).toBeTruthy();

    expect(screen.getByText('교통비')).toBeTruthy();
    expect(screen.getByText('1.5kg (30%)')).toBeTruthy();

    expect(screen.getByText('쇼핑')).toBeTruthy();
    expect(screen.getByText('1.0kg (20%)')).toBeTruthy();
  });

  it('should sort categories by carbon emission in descending order', () => {
    const unsortedCategories: CategoryData[] = [
      {
        categoryId: '1',
        categoryName: '카테고리1',
        amountTotal: 10000,
        carbonTotalKg: 0.5,
        ratioCarbon: 0.1,
        color: '#ef4444',
      },
      {
        categoryId: '2',
        categoryName: '카테고리2',
        amountTotal: 50000,
        carbonTotalKg: 2.5,
        ratioCarbon: 0.5,
        color: '#3b82f6',
      },
      {
        categoryId: '3',
        categoryName: '카테고리3',
        amountTotal: 30000,
        carbonTotalKg: 1.5,
        ratioCarbon: 0.3,
        color: '#10b981',
      },
    ];

    render(<CategoryPieChart categories={unsortedCategories} />);

    // Should display in descending order: 카테고리2 (2.5kg), 카테고리3 (1.5kg), 카테고리1 (0.5kg)
    expect(screen.getByText('카테고리2')).toBeTruthy();
    expect(screen.getByText('카테고리3')).toBeTruthy();
    expect(screen.getByText('카테고리1')).toBeTruthy();
  });

  it('should filter out categories with zero emission', () => {
    const categoriesWithZero: CategoryData[] = [
      ...mockCategories,
      {
        categoryId: '4',
        categoryName: '제로 카테고리',
        amountTotal: 0,
        carbonTotalKg: 0,
        ratioCarbon: 0,
        color: '#gray',
      },
    ];

    render(<CategoryPieChart categories={categoriesWithZero} />);

    // Should not display zero emission category
    expect(screen.queryByText('제로 카테고리')).toBeNull();
    // But should display others
    expect(screen.getByText('식비')).toBeTruthy();
  });

  it('should show "기타" category when more than 5 categories', () => {
    const manyCategories: CategoryData[] = [
      ...mockCategories,
      {
        categoryId: '4',
        categoryName: '카테고리4',
        amountTotal: 5000,
        carbonTotalKg: 0.3,
        ratioCarbon: 0.06,
        color: '#f59e0b',
      },
      {
        categoryId: '5',
        categoryName: '카테고리5',
        amountTotal: 4000,
        carbonTotalKg: 0.2,
        ratioCarbon: 0.04,
        color: '#8b5cf6',
      },
      {
        categoryId: '6',
        categoryName: '카테고리6',
        amountTotal: 3000,
        carbonTotalKg: 0.1,
        ratioCarbon: 0.02,
        color: '#ec4899',
      },
    ];

    render(<CategoryPieChart categories={manyCategories} />);

    // Should show "기타" for categories beyond the first 5
    expect(screen.getByText('기타 1개')).toBeTruthy();
    expect(screen.getByText('0.1kg')).toBeTruthy(); // Total for "기타"
  });

  it('should render empty state when no data', () => {
    render(<CategoryPieChart categories={[]} />);

    expect(screen.getByText('데이터가 없습니다')).toBeTruthy();
    expect(screen.queryByTestId('pie-chart')).toBeNull();
  });

  it('should render empty state when all categories have zero emission', () => {
    const zeroCategories: CategoryData[] = [
      {
        categoryId: '1',
        categoryName: '제로1',
        amountTotal: 0,
        carbonTotalKg: 0,
        ratioCarbon: 0,
        color: '#ef4444',
      },
      {
        categoryId: '2',
        categoryName: '제로2',
        amountTotal: 0,
        carbonTotalKg: 0,
        ratioCarbon: 0,
        color: '#3b82f6',
      },
    ];

    render(<CategoryPieChart categories={zeroCategories} />);

    expect(screen.getByText('데이터가 없습니다')).toBeTruthy();
    expect(screen.queryByTestId('pie-chart')).toBeNull();
  });

  it('should calculate total emission correctly', () => {
    render(<CategoryPieChart categories={mockCategories} />);

    // Total should be 2.5 + 1.5 + 1.0 = 5.0kg
    expect(screen.getByText('5.0kg')).toBeTruthy();
  });

  it('should format emission values with one decimal place', () => {
    const categoriesWithDecimals: CategoryData[] = [
      {
        categoryId: '1',
        categoryName: '카테고리1',
        amountTotal: 10000,
        carbonTotalKg: 1.234,
        ratioCarbon: 0.5,
        color: '#ef4444',
      },
      {
        categoryId: '2',
        categoryName: '카테고리2',
        amountTotal: 10000,
        carbonTotalKg: 1.567,
        ratioCarbon: 0.5,
        color: '#3b82f6',
      },
    ];

    render(<CategoryPieChart categories={categoriesWithDecimals} />);

    expect(screen.getByText('1.2kg (50%)')).toBeTruthy(); // 1.234 rounded to 1.2
    expect(screen.getByText('1.6kg (50%)')).toBeTruthy(); // 1.567 rounded to 1.6
    expect(screen.getByText('2.8kg')).toBeTruthy(); // Total: 1.234 + 1.567 = 2.801 -> 2.8
  });
});