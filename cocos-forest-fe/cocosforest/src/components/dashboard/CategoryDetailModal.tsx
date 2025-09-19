import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView
} from 'react-native';
import type { CategoryMonthlyDetails } from '../../types/dashboard';
import { Card } from '../common';

interface CategoryDetailModalProps {
  visible: boolean;
  onClose: () => void;
  data: CategoryMonthlyDetails | null;
  loading: boolean;
}

export const CategoryDetailModal: React.FC<CategoryDetailModalProps> = ({
  visible,
  onClose,
  data,
  loading
}) => {
  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>
            {data?.categoryName} 상세 분석
          </Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>데이터를 불러오는 중...</Text>
          </View>
        ) : data ? (
          // 에러 상태 확인
          (data as any).error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorTitle}>데이터 조회 실패</Text>
              <Text style={styles.errorMessage}>{(data as any).error}</Text>
              <Text style={styles.errorDetail}>
                카테고리: {data.categoryName}
              </Text>
            </View>
          ) : (
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
              {/* 월별 총계 */}
              <Card variant="medium">
                <Text style={styles.sectionTitle}>월별 총계</Text>
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>결제금액</Text>
                  <Text style={styles.totalValue}>₩{data.totals?.amountTotal?.toLocaleString() || '0'}</Text>
                </View>
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>탄소배출량</Text>
                  <Text style={styles.totalValue}>{data.totals?.carbonTotalKg || 0}kg CO₂</Text>
                </View>
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>거래 건수</Text>
                  <Text style={styles.totalValue}>{data.totals?.transactionCount || 0}건</Text>
                </View>
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>평균 거래금액</Text>
                  <Text style={styles.totalValue}>₩{data.totals?.transactionCount ? Math.round(data.totals.amountTotal / data.totals.transactionCount).toLocaleString() : '0'}</Text>
                </View>
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>평균 탄소배출량</Text>
                  <Text style={styles.totalValue}>{data.totals?.transactionCount ? (data.totals.carbonTotalKg / data.totals.transactionCount).toFixed(2) : '0.00'}kg CO₂</Text>
                </View>
              </Card>

              {/* 거래 내역 */}
              <Text style={styles.sectionTitle}>거래 내역</Text>
              {data.transactions && data.transactions.length > 0 ? (
                data.transactions.map((transaction, index) => (
                  <Card key={transaction.externalTransactionId} variant="small" style={styles.transactionCard}>
                    <View style={styles.transactionHeader}>
                      <Text style={styles.merchantName}>{transaction.merchantName || '알 수 없음'}</Text>
                      <Text style={styles.transactionAmount}>₩{transaction.amountKrw?.toLocaleString() || '0'}</Text>
                    </View>
                    <View style={styles.transactionDetails}>
                      <Text style={styles.transactionDate}>
                        {transaction.txDate || ''} {transaction.txTime || ''}
                      </Text>
                      <Text style={styles.transactionCarbon}>
                        {transaction.carbonKg || 0}kg CO₂
                      </Text>
                    </View>
                    <Text style={styles.cardInfo}>
                      {transaction.cardName || ''} ****{transaction.cardLast4 || ''}
                    </Text>
                  </Card>
                ))
              ) : (
                <Card variant="small">
                  <Text style={styles.noDataText}>이 카테고리에는 거래 내역이 없습니다.</Text>
                </Card>
              )}
            </ScrollView>
          )
        ) : (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>데이터를 불러올 수 없습니다.</Text>
          </View>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
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
  content: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ef4444',
    marginBottom: 12,
  },
  errorMessage: {
    fontSize: 16,
    color: '#ef4444',
    textAlign: 'center',
    marginBottom: 8,
  },
  errorDetail: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
    marginTop: 8,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  totalLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  totalValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  transactionCard: {
    marginBottom: 12,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  merchantName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    flex: 1,
  },
  transactionAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  transactionDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 12,
    color: '#6b7280',
  },
  transactionCarbon: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '500',
  },
  cardInfo: {
    fontSize: 11,
    color: '#9ca3af',
  },
  noDataText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});