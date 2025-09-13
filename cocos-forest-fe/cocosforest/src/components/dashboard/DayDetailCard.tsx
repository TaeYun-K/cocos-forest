import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import useDashboardStore from '../../store/dashboardStore';
import type { DayData } from '../../types/dashboard';

interface DayDetailCardProps {
  // props 제거 - store에서 직접 가져올 예정
}

export const DayDetailCard: React.FC<DayDetailCardProps> = () => {
  const {
    selectedYear,
    selectedMonth,
    selectedDay,
    dayData,
    handleCloseDetailCard
  } = useDashboardStore();
  const monthNames = [
    '1월', '2월', '3월', '4월', '5월', '6월',
    '7월', '8월', '9월', '10월', '11월', '12월'
  ];

  if (!selectedDay) return null;

  return (
    <View style={styles.inlineDetailCard}>
      <View style={styles.detailCard}>
        {/* 카드 상단 핸들 */}
        <View style={styles.cardHandle} />

        {/* 헤더 */}
        <View style={styles.detailHeader}>
          <View style={styles.detailHeaderLeft}>
            <Text style={styles.detailDate}>
              {selectedYear}년 {monthNames[selectedMonth]} {selectedDay}일
            </Text>
            <View style={styles.syncStatus}>
              <View style={styles.syncDot} />
              <Text style={styles.syncText}>실시간 동기화 완료</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.closeButton} onPress={handleCloseDetailCard}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* 총 배출량 및 결제 정보 */}
        {dayData && (
          <View style={styles.totalSection}>
            <View style={styles.totalEmissionCard}>
              <Text style={styles.totalEmissionLabel}>총 탄소 배출량</Text>
              <Text style={styles.totalEmissionValue}>
                {dayData.totals.carbonTotalKg}kg CO₂
              </Text>
            </View>
            <View style={styles.totalStatsGrid}>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>
                  {dayData.totals.amountTotal.toLocaleString()}원
                </Text>
                <Text style={styles.statLabel}>총 결제금액</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>
                  {dayData.totals.transactionCount}건
                </Text>
                <Text style={styles.statLabel}>거래 건수</Text>
              </View>
            </View>
          </View>
        )}

        {/* 거래 내역 */}
        {dayData && (
          <View style={styles.transactionsSection}>
            <Text style={styles.transactionsTitle}>거래 내역</Text>
            <ScrollView style={styles.transactionsScrollView} showsVerticalScrollIndicator={false}>
              {dayData.transactions.map((transaction, index) => (
                <View key={index} style={styles.transactionItem}>
                  <View style={styles.transactionHeader}>
                    <View style={styles.transactionMerchant}>
                      <Text style={styles.merchantName}>{transaction.merchantName}</Text>
                      <Text style={styles.transactionTime}>{transaction.txTime}</Text>
                    </View>
                    <View style={styles.transactionAmount}>
                      <Text style={styles.amountValue}>
                        {transaction.amountKrw.toLocaleString()}원
                      </Text>
                      <Text style={styles.carbonValue}>
                        {transaction.carbonKg}kg CO₂
                      </Text>
                    </View>
                  </View>
                  <View style={styles.transactionDetails}>
                    <View style={styles.categoryTag}>
                      <Text style={styles.categoryText}>{transaction.categoryName}</Text>
                    </View>
                    <Text style={styles.cardInfo}>
                      {transaction.cardName} ****{transaction.cardLast4}
                    </Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  inlineDetailCard: {
    marginTop: 16,
    marginHorizontal: 16,
    marginBottom: 24,
  },
  detailCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    paddingTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  cardHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#d1d5db',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  detailHeaderLeft: {
    flex: 1,
  },
  detailDate: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  syncStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  syncDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10b981',
  },
  syncText: {
    fontSize: 12,
    color: '#6b7280',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: '#6b7280',
  },
  totalSection: {
    marginBottom: 24,
  },
  totalEmissionCard: {
    backgroundColor: '#f0fdf4',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
  },
  totalEmissionLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  totalEmissionValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#15803d',
  },
  totalStatsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  transactionsSection: {
    flex: 1,
  },
  transactionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  transactionsScrollView: {
    maxHeight: 400,
  },
  transactionItem: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  transactionMerchant: {
    flex: 1,
  },
  merchantName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  transactionTime: {
    fontSize: 12,
    color: '#6b7280',
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  amountValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 2,
  },
  carbonValue: {
    fontSize: 12,
    color: '#15803d',
    fontWeight: '600',
  },
  transactionDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryTag: {
    backgroundColor: '#dbeafe',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryText: {
    fontSize: 12,
    color: '#1e40af',
    fontWeight: '600',
  },
  cardInfo: {
    fontSize: 12,
    color: '#6b7280',
  },
});