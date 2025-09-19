import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTodayData } from '../../hooks/useDashboardQueries';
import { Card } from '../common';

export const TodayEmissionStatus: React.FC = () => {
  const { data: todayData, isLoading, error } = useTodayData();

  const todayEmission = todayData?.totals?.carbonTotalKg ?? 0.5;
  const averageEmission = 0.8;
  const emissionDifference = averageEmission - todayEmission;

  // 배출량에 따른 색상 결정
  const getEmissionColor = () => {
    if (todayEmission < 0.4) {
      return '#15803d'; // 녹색 - 좋음
    } else if (todayEmission > averageEmission) {
      return '#ef4444'; // 빨간색 - 나쁨
    } else {
      return '#eab308'; // 노란색 - 보통
    }
  };

  if (isLoading) {
    return (
      <Card style={styles.compactCard}>
        <Text style={styles.cardTitle}>오늘 탄소 배출 현황</Text>
        <Text style={styles.loadingText}>데이터를 불러오는 중...</Text>
      </Card>
    );
  }

  if (error) {
    return (
      <Card style={styles.compactCard}>
        <Text style={styles.cardTitle}>오늘 탄소 배출 현황</Text>
        <Text style={styles.errorText}>데이터를 불러올 수 없습니다.</Text>
      </Card>
    );
  }

  return (
    <Card style={styles.compactCard}>
      <Text style={styles.cardTitle}>오늘 탄소 배출 현황</Text>

      {/* 현재 배출량 표시 */}
      <View style={styles.emissionStatus}>
        <View style={styles.emissionValueContainer}>
          <Text style={[styles.emissionValue, { color: getEmissionColor() }]}>{todayEmission}kg</Text>
          <Text style={styles.emissionValueLabel}>오늘 배출량</Text>
        </View>
        <View style={styles.emissionAverageContainer}>
          <Text style={styles.emissionAverage}>{averageEmission}kg</Text>
          <Text style={styles.emissionAverageLabel}>평균 배출량</Text>
        </View>
      </View>

      {/* 비교 메시지 */}
      <View style={styles.comparisonMessage}>
        <View style={styles.comparisonIcon}>
          <Text style={styles.comparisonIconText}>🎉</Text>
        </View>
        <Text style={styles.comparisonText}>
          평균 배출량보다 <Text style={styles.comparisonHighlight}>{emissionDifference}kg</Text> 적게 배출했어요!
        </Text>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  compactCard: {
    padding: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  emissionStatus: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  emissionValueContainer: {
    alignItems: 'center',
  },
  emissionValue: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  emissionValueLabel: {
    fontSize: 11,
    color: '#6b7280',
    marginTop: 3,
  },
  emissionAverageContainer: {
    alignItems: 'center',
  },
  emissionAverage: {
    fontSize: 18,
    fontWeight: '600',
    color: '#9ca3af',
  },
  emissionAverageLabel: {
    fontSize: 11,
    color: '#6b7280',
    marginTop: 3,
  },
  comparisonMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    padding: 12,
    borderRadius: 10,
    marginBottom: 0,
  },
  comparisonIcon: {
    marginRight: 10,
  },
  comparisonIconText: {
    fontSize: 18,
  },
  comparisonText: {
    fontSize: 13,
    color: '#374151',
    flex: 1,
  },
  comparisonHighlight: {
    fontWeight: 'bold',
    color: '#15803d',
  },
  loadingText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    paddingVertical: 20,
  },
  errorText: {
    fontSize: 14,
    color: '#ef4444',
    textAlign: 'center',
    paddingVertical: 20,
  },
});