import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import useDashboardStore from '../../store/dashboardStore';
import { CategorySummary } from './CategorySummary';
import { CategoryPieChart } from './CategoryPieChart';
import { CategoryItem } from './CategoryItem';

export const CategoryReport: React.FC = () => {
  const { selectedYear, selectedMonth, monthlyReportData } = useDashboardStore();

  if (!monthlyReportData) {
    return null;
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