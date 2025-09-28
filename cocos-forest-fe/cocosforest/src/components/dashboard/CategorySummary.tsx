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
  // 활성 일수 계산 (거래가 있는 날의 수)
  const daysActive = monthlyReportData.daily.filter(day => day.transactionCount > 0).length;

  // 일평균 탄소 배출량 계산
  const avgPerDayCarbonKg = daysActive > 0
    ? (monthlyReportData.totals.carbonTotalKg / daysActive).toFixed(2)
    : '0.00';
  return (
    <View>
      <Text style={styles.cardTitle}>
        {selectedYear}년 {selectedMonth + 1}월 리포트
      </Text>

      {/* 월별 요약 섹션 */}
      <View style={styles.monthlyStatsContainer}>
        <View style={styles.statsGrid}>
          <View style={[styles.statHighlight, styles.paymentCard]}>
            <View style={styles.cardIcon}>
              <Text style={styles.iconText}>💳</Text>
            </View>
            <Text style={styles.statMainValue}>
              ₩{monthlyReportData.totals.amountTotal.toLocaleString()}
            </Text>
            <Text style={styles.statMainLabel}>총 결제금액</Text>
          </View>
          <View style={[styles.statHighlight, styles.carbonCard]}>
            <View style={styles.cardIcon}>
              <Text style={styles.iconText}>🌲</Text>
            </View>
            <Text style={[styles.statMainValue, { color: '#dc2626' }]}>
              {monthlyReportData.totals.carbonTotalKg}kg
            </Text>
            <Text style={styles.statMainLabel}>총 탄소배출</Text>
          </View>
        </View>

        <View style={styles.additionalStats}>
          <View style={styles.statRow}>
            <View style={styles.statRowIcon}>
              <Text style={styles.miniIcon}>📊</Text>
            </View>
            <Text style={styles.statSecondaryLabel}>거래 건수</Text>
            <Text style={styles.statSecondaryValue}>
              {monthlyReportData.totals.transactionCount}건
            </Text>
          </View>
          <View style={styles.statRow}>
            <View style={styles.statRowIcon}>
              <Text style={styles.miniIcon}>📅</Text>
            </View>
            <Text style={styles.statSecondaryLabel}>활성 일수</Text>
            <Text style={styles.statSecondaryValue}>
              {daysActive}일
            </Text>
          </View>
          <View style={styles.statRow}>
            <View style={styles.statRowIcon}>
              <Text style={styles.miniIcon}>🌱</Text>
            </View>
            <Text style={styles.statSecondaryLabel}>일평균 배출량</Text>
            <Text style={[styles.statSecondaryValue, { color: '#dc2626', fontWeight: '600' }]}>
              {avgPerDayCarbonKg}kg CO₂
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
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 0,
    borderLeftWidth: 0,
    borderColor: 'transparent',
    borderLeftColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  paymentCard: {
    backgroundColor: '#E8F5E9',
  },
  carbonCard: {
    backgroundColor: '#E8F5E9',
  },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconText: {
    fontSize: 20,
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
    backgroundColor: '#E8F5E9',
    borderRadius: 16,
    padding: 20,
    gap: 12,
    borderWidth: 1,
    borderColor: '#C8E6C9',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  statRowIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  miniIcon: {
    fontSize: 12,
  },
  statSecondaryLabel: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  statSecondaryValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1f2937',
  },
});