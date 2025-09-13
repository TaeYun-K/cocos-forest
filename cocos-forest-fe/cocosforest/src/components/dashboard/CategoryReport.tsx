import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { MonthlyReportData } from '../../types/dashboard';

interface CategoryReportProps {
  selectedYear: number;
  selectedMonth: number;
  monthlyReportData: MonthlyReportData | null;
}

export const CategoryReport: React.FC<CategoryReportProps> = ({
  selectedYear,
  selectedMonth,
  monthlyReportData
}) => {
  return (
    <View>
      <Text style={styles.cardTitle}>
        {selectedYear}년 {selectedMonth + 1}월 리포트
      </Text>

      {/* 월별 요약 섹션 */}
      {monthlyReportData && (
        <View style={styles.monthlyStatsContainer}>
          <View style={styles.statsGrid}>
            <View style={styles.statHighlight}>
              <Text style={styles.statMainValue}>
                ₩{monthlyReportData.totals.amountTotal.toLocaleString()}
              </Text>
              <Text style={styles.statMainLabel}>총 결제금액</Text>
            </View>
            <View style={styles.statHighlight}>
              <Text style={[styles.statMainValue, { color: '#ef4444' }]}>
                {monthlyReportData.totals.carbonTotalKg}kg
              </Text>
              <Text style={styles.statMainLabel}>총 탄소배출</Text>
            </View>
          </View>

          <View style={styles.additionalStats}>
            <View style={styles.statRow}>
              <Text style={styles.statSecondaryLabel}>거래 건수</Text>
              <Text style={styles.statSecondaryValue}>
                {monthlyReportData.totals.transactionCount}건
              </Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statSecondaryLabel}>활성 일수</Text>
              <Text style={styles.statSecondaryValue}>
                {monthlyReportData.totals.daysActive}일
              </Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statSecondaryLabel}>일평균 배출량</Text>
              <Text style={[styles.statSecondaryValue, { color: '#ef4444', fontWeight: '600' }]}>
                {monthlyReportData.totals.avgPerDayCarbonKg}kg CO₂
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* 카테고리별 상세 분석 */}
      <Text style={styles.sectionTitle}>카테고리별 분석</Text>
      <View style={styles.categoryList}>
        {monthlyReportData?.byCategory
          .sort((a, b) => b.carbonTotalKg - a.carbonTotalKg)
          .map((item, index) => (
            <View key={item.categoryId} style={styles.categoryItemDetailed}>
              <View style={styles.categoryHeader}>
                <View style={styles.categoryLeft}>
                  <View style={[styles.categoryColor, { backgroundColor: item.color }]} />
                  <Text style={styles.categoryName}>{item.categoryName}</Text>
                  {index === 0 && (
                    <View style={styles.topEmitterBadge}>
                      <Text style={styles.topEmitterText}>최다 배출</Text>
                    </View>
                  )}
                </View>
                <View style={styles.categoryRight}>
                  <Text style={styles.categoryAmount}>{item.carbonTotalKg}kg CO₂</Text>
                  <Text style={styles.categoryPercentage}>
                    {Math.round(item.ratioCarbon * 100)}%
                  </Text>
                </View>
              </View>

              <View style={styles.categoryDetails}>
                <View style={styles.categoryDetailRow}>
                  <Text style={styles.categoryDetailLabel}>결제금액</Text>
                  <Text style={styles.categoryDetailValue}>
                    ₩{item.amountTotal.toLocaleString()}
                  </Text>
                </View>
                <View style={styles.categoryDetailRow}>
                  <Text style={styles.categoryDetailLabel}>금액 비중</Text>
                  <Text style={styles.categoryDetailValue}>
                    {Math.round(item.ratioAmount * 100)}%
                  </Text>
                </View>
              </View>

              {/* 탄소 배출량 비중 바 */}
              <View style={styles.emissionBar}>
                <View
                  style={[
                    styles.emissionFill,
                    {
                      width: `${item.ratioCarbon * 100}%`,
                      backgroundColor: item.color
                    }
                  ]}
                />
              </View>
            </View>
          ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  monthlyStatsContainer: {
    marginBottom: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  statHighlight: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },
  statMainValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  statMainLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '600',
  },
  additionalStats: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 16,
    gap: 8,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statSecondaryLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  statSecondaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
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
  categoryItemDetailed: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  categoryColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  topEmitterBadge: {
    backgroundColor: '#fef3c7',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8,
  },
  topEmitterText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#d97706',
  },
  categoryRight: {
    alignItems: 'flex-end',
  },
  categoryAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 2,
  },
  categoryPercentage: {
    fontSize: 12,
    color: '#6b7280',
  },
  categoryDetails: {
    gap: 8,
    marginBottom: 12,
  },
  categoryDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryDetailLabel: {
    fontSize: 13,
    color: '#6b7280',
  },
  categoryDetailValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1f2937',
  },
  emissionBar: {
    height: 6,
    backgroundColor: '#f3f4f6',
    borderRadius: 3,
    overflow: 'hidden',
  },
  emissionFill: {
    height: '100%',
    borderRadius: 3,
  },
});