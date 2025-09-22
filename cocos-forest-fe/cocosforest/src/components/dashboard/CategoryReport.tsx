import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import useDashboardStore from '../../store/dashboardStore';
import { useMonthlyReport } from '../../hooks/useDashboardQueries';
import { CategorySummary } from './CategorySummary';
import { CategoryPieChart } from './CategoryPieChart';
import { CategoryItem } from './CategoryItem';
import { CategoryDetailModal } from './CategoryDetailModal';
import { LoadingSpinner, ErrorMessage } from '../common';

/**
 * 카테고리별 탄소 배출량 분석을 표시하는 컴포넌트
 *
 * @description
 * - 월별 카테고리별 탄소 배출량 데이터를 시각적으로 표시
 * - 파이차트를 통한 비율 표시
 * - 카테고리별 상세 분석 리스트
 * - 월별 요약 정보 제공
 * - 에러 및 로딩 상태 처리
 *
 * @component
 * @example
 * ```tsx
 * <CategoryReport />
 * ```
 *
 * @features
 * - 📊 카테고리별 요약 및 파이차트
 * - 📋 정렬된 카테고리 분석 리스트
 * - 🔄 자동 데이터 새로고침
 * - 💰 결제 금액 및 탄소 배출량 표시
 * - ⚡ 메모이제이션된 카테고리 정렬
 * - 🎨 일관된 UI/UX
 */
export const CategoryReport: React.FC = () => {
  const {
    selectedYear,
    selectedMonth,
    showCategoryModal,
    categoryModalData,
    categoryModalLoading,
    closeCategoryModal
  } = useDashboardStore();
  const { data: monthlyReportData, isLoading, error, refetch } = useMonthlyReport(selectedYear, selectedMonth);

  const sortedCategories = useMemo(() => {
    if (!monthlyReportData?.byCategory) return [];
    return monthlyReportData.byCategory
      .slice()
      .sort((a, b) => b.carbonTotalKg - a.carbonTotalKg);
  }, [monthlyReportData?.byCategory]);

  if (isLoading) {
    return <LoadingSpinner message="카테고리 데이터를 불러오는 중..." />;
  }

  if (error || !monthlyReportData) {
    return (
      <ErrorMessage
        title="카테고리 데이터 오류"
        message="카테고리 데이터를 불러올 수 없습니다. 네트워크 연결을 확인해 주세요."
        onRetry={refetch}
      />
    );
  }

  return (
    <View>
      <CategorySummary
        monthlyReportData={monthlyReportData}
        selectedYear={selectedYear}
        selectedMonth={selectedMonth}
      />

      {/* 파이차트 */}
      <CategoryPieChart
        categories={monthlyReportData.byCategory}
        title="카테고리별 탄소 배출량 비율"
      />

      {/* 카테고리별 상세 분석 */}
      <Text style={styles.sectionTitle}>카테고리별 분석</Text>
      <View style={styles.categoryList}>
        {sortedCategories.map((item, index) => (
          <CategoryItem
            key={item.categoryId}
            item={item}
            index={index}
          />
        ))}
      </View>

      {/* 카테고리 상세 모달 */}
      <CategoryDetailModal
        visible={showCategoryModal}
        onClose={closeCategoryModal}
        data={categoryModalData}
        loading={categoryModalLoading}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
    marginTop: 8,
  },
  categoryList: {
    gap: 12,
  },
});