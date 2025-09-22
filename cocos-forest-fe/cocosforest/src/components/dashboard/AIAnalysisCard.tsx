import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { fetchTodayData, fetchAIAnalysis } from '../../api/dashboard';
import logger from '../../utils/logger';

export const AIAnalysisCard: React.FC = () => {
  const [aiAdvice, setAiAdvice] = useState<string>('AI 분석을 준비 중입니다...');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadAIAnalysis = async () => {
      try {
        setIsLoading(true);

        // 1. 오늘의 데이터 가져오기
        const todayData = await fetchTodayData();
        logger.info('오늘 데이터 로드 완료', { carbonTotal: todayData.totals?.carbonTotalKg });

        // 2. AI 분석 요청
        const analysisResult = await fetchAIAnalysis(todayData);
        setAiAdvice(analysisResult);

        logger.info('AI 분석 완료');
      } catch (error) {
        logger.error('AI 분석 실패', error);
        setAiAdvice('AI 분석을 불러올 수 없습니다. 잠시 후 다시 시도해주세요.');
      } finally {
        setIsLoading(false);
      }
    };

    loadAIAnalysis();
  }, []);
  return (
    <View style={styles.speechBubbleContainer}>
      <View style={styles.speechBubbleOuter}>
        <View style={styles.speechBubble}>
          <View style={styles.aiResultContent}>
            <Text style={styles.aiResultText}>
              {aiAdvice}
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
    fontWeight: 'bold',
  },
  aiResultHighlight: {
    fontWeight: '600',
    color: '#1f2937',
  },
});