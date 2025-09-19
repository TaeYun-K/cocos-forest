import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const AIAnalysisCard: React.FC = () => {
  return (
    <View style={styles.speechBubbleContainer}>
      <View style={styles.speechBubbleOuter}>
        <View style={styles.speechBubble}>
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
        </View>
      </View>
      <View style={styles.speechTailContainer}>
        <View style={styles.speechTailShadow} />
        <View style={styles.speechTail} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  speechBubbleContainer: {
    alignItems: 'center',
    position: 'relative',
  },
  speechBubbleOuter: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 12,
  },
  speechBubble: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 24,
    position: 'relative',
    borderWidth: 2,
    borderColor: '#f8fafc',
    maxWidth: '92%',
    minWidth: 280,
  },
  speechTailContainer: {
    position: 'relative',
    alignItems: 'center',
    marginTop: -3,
  },
  speechTailShadow: {
    position: 'absolute',
    width: 0,
    height: 0,
    borderLeftWidth: 22,
    borderRightWidth: 22,
    borderTopWidth: 22,
    borderStyle: 'solid',
    backgroundColor: 'transparent',
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
    top: 2,
  },
  speechTail: {
    width: 0,
    height: 0,
    borderLeftWidth: 20,
    borderRightWidth: 20,
    borderTopWidth: 20,
    borderStyle: 'solid',
    backgroundColor: 'transparent',
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#ffffff',
  },
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
    width: 44,
    height: 44,
    backgroundColor: '#f0f9ff',
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    borderWidth: 2,
    borderColor: '#e0f2fe',
    shadowColor: '#0ea5e9',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  aiResultIconText: {
    fontSize: 20,
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
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  aiResultBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 0.5,
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