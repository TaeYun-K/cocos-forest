import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import useDashboardStore from '../../store/dashboardStore';
import { useMonthlyReport } from '../../hooks/useDashboardQueries';
import { CategorySummary } from './CategorySummary';
import { CategoryPieChart } from './CategoryPieChart';
import { CategoryItem } from './CategoryItem';
import { CategoryDetailModal } from './CategoryDetailModal';

export const CategoryReport: React.FC = () => {
  const {
    selectedYear,
    selectedMonth,
    showCategoryModal,
    categoryModalData,
    categoryModalLoading,
    closeCategoryModal
  } = useDashboardStore();
  const { data: monthlyReportData, isLoading, error } = useMonthlyReport(selectedYear, selectedMonth);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>카테고리 데이터를 불러오는 중...</Text>
      </View>
    );
  }

  if (error || !monthlyReportData) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>카테고리 데이터를 불러올 수 없습니다.</Text>
      </View>
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
        {monthlyReportData.byCategory
          .sort((a, b) => b.carbonTotalKg - a.carbonTotalKg)
          .map((item, index) => (
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
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
  },
});