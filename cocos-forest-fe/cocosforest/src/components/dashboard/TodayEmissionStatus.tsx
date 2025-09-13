import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import useDashboardStore from '../../store/dashboardStore';

interface TodayEmissionStatusProps {
  // props 제거 - store에서 직접 가져올 예정
}

export const TodayEmissionStatus: React.FC<TodayEmissionStatusProps> = () => {
  const { todayData } = useDashboardStore();

  const todayEmission = todayData?.totals?.carbonTotalKg || 0.5;
  const averageEmission = 0.8;
  const emissionDifference = averageEmission - todayEmission;
  const emissionPercentage = (todayEmission / averageEmission) * 100;

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>오늘 탄소 배출 현황</Text>

      {/* 현재 배출량 표시 */}
      <View style={styles.emissionStatus}>
        <View style={styles.emissionValueContainer}>
          <Text style={styles.emissionValue}>{todayEmission}kg</Text>
          <Text style={styles.emissionValueLabel}>오늘 배출량</Text>
        </View>
        <View style={styles.emissionAverageContainer}>
          <Text style={styles.emissionAverage}>{averageEmission}kg</Text>
          <Text style={styles.emissionAverageLabel}>평균 배출량</Text>
        </View>
      </View>

      {/* 게이지 바 */}
      <View style={styles.gaugeContainer}>
        <View style={styles.gaugeBackground}>
          <View
            style={[
              styles.gaugeFill,
              {
                width: `${Math.min(emissionPercentage, 100)}%`,
                backgroundColor: todayEmission < 0.4 ? '#15803d' : todayEmission < 0.8 ? '#eab308' : '#ef4444'
              }
            ]}
          />
          <View style={styles.gaugeLabels}>
            <Text style={styles.gaugeLabelStart}>0kg</Text>
            <Text style={styles.gaugeLabelEnd}>0.8kg</Text>
          </View>
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
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
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
    fontSize: 32,
    fontWeight: 'bold',
    color: '#15803d',
  },
  emissionValueLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  emissionAverageContainer: {
    alignItems: 'center',
  },
  emissionAverage: {
    fontSize: 20,
    fontWeight: '600',
    color: '#9ca3af',
  },
  emissionAverageLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  gaugeContainer: {
    marginBottom: 20,
  },
  gaugeBackground: {
    height: 24,
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    position: 'relative',
    overflow: 'hidden',
  },
  gaugeFill: {
    height: '100%',
    borderRadius: 12,
    position: 'absolute',
    left: 0,
    top: 0,
  },
  gaugeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    position: 'absolute',
    width: '100%',
    top: -20,
  },
  gaugeLabelStart: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '600',
  },
  gaugeLabelEnd: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '600',
  },
  comparisonMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  comparisonIcon: {
    marginRight: 12,
  },
  comparisonIconText: {
    fontSize: 20,
  },
  comparisonText: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
  },
  comparisonHighlight: {
    fontWeight: 'bold',
    color: '#15803d',
  },
});