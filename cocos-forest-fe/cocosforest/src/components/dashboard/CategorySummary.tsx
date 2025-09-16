import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { MonthlyReportData } from '../../types/dashboard';

interface CategorySummaryProps {
  monthlyReportData: MonthlyReportData;
  selectedYear: number;
  selectedMonth: number;
}

export const CategorySummary: React.FC<CategorySummaryProps> = ({
  monthlyReportData,
  selectedYear,
  selectedMonth
}) => {
  return (
    <View>
      <Text style={styles.cardTitle}>
        {selectedYear}년 {selectedMonth + 1}월 리포트
      </Text>

      {/* 월별 요약 섹션 */}
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
});