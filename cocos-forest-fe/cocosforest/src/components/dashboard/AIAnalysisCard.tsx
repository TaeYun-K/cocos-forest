import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from '../common';

export const AIAnalysisCard: React.FC = () => {
  return (
    <Card>
      <View style={styles.aiResultHeader}>
        <View style={styles.aiResultIcon}>
          <Text style={styles.aiResultIconText}>🤖</Text>
        </View>
        <View style={styles.aiResultTitleContainer}>
          <Text style={styles.cardTitle}>AI 분석 결과</Text>
          <Text style={styles.aiResultSubtitle}>실시간 분석 완료</Text>
        </View>
        <View style={styles.aiResultBadge}>
          <Text style={styles.aiResultBadgeText}>NEW</Text>
        </View>
      </View>

      <View style={styles.aiResultContent}>
        <Text style={styles.aiResultText}>
          📊 <Text style={styles.aiResultHighlight}>오늘 소비 패턴 분석:</Text> 교통비 지출이 평소보다 25% 증가했습니다.
        </Text>
        <Text style={styles.aiResultText}>
          🌱 <Text style={styles.aiResultHighlight}>환경 영향:</Text> 대중교통 이용률이 높아 탄소 배출량이 평균 대비 36% 감소했어요.
        </Text>
        <Text style={styles.aiResultText}>
          💡 <Text style={styles.aiResultHighlight}>맞춤 제안:</Text> 내일은 자전거 이용을 추천드립니다. 추가로 5kg CO₂를 절약할 수 있어요.
        </Text>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  aiResultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  aiResultIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#f0f9ff',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  aiResultIconText: {
    fontSize: 18,
  },
  aiResultTitleContainer: {
    flex: 1,
  },
  aiResultSubtitle: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  aiResultBadge: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  aiResultBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  aiResultContent: {
    gap: 12,
  },
  aiResultText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  aiResultHighlight: {
    fontWeight: '600',
    color: '#1f2937',
  },
});