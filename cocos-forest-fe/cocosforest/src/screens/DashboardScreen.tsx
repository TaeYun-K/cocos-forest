import React, { memo, useRef, useState, useCallback, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet, RefreshControl } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native';
import { useDashboard } from '../hooks/useDashboard';
import { useQueryClient } from '@tanstack/react-query';
import { dashboardQueryKeys, useTodayData, useMonthlyReport } from '../hooks/useDashboardQueries';
import { DASHBOARD_STYLE_CONSTANTS } from '../constants/dashboardStyles';
import { commonStyles, tabStyles } from '../styles/commonStyles';
import {
  AIAnalysisCard,
  TodayEmissionStatus,
  MonthlyCalendar,
  CategoryReport,
  DayDetailCard,
  TabSelector
} from '../components/dashboard';
import { ErrorBoundary, UnifiedHeader } from '../components/common';
import { redirectToAccountLinking, isAccountLinkingError } from '../utils/accountLinkingUtils';

const DashboardScreen = memo(() => {
  const scrollViewRef = useRef<ScrollView>(null);
  const queryClient = useQueryClient();
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);
  const [hasShownAccountError, setHasShownAccountError] = useState(false);

  const {
    // 상태
    activeTab,
    showDetailCard,
    selectedDay,
    selectedMonth,
    selectedYear,
    aiCardRefreshKey,

    // 데이터
    cocoGif,

    // 액션
    handleTabChange,
  } = useDashboard();

  // 대시보드 데이터 쿼리들을 직접 구독해서 에러 감지
  const { error: todayDataError } = useTodayData();
  const { error: monthlyReportError } = useMonthlyReport(selectedYear, selectedMonth);

  // 새로고침 함수
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // 현재 월의 데이터와 오늘 데이터를 새로고침
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.todayData() }),
        queryClient.invalidateQueries({
          queryKey: dashboardQueryKeys.monthlyReport(`${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}`)
        }),
        // 선택된 날짜 상세 정보도 새로고침
        selectedDay && queryClient.invalidateQueries({
          queryKey: dashboardQueryKeys.dayDetail(`${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`)
        })
      ].filter(Boolean));
    } catch (error) {
      console.error('Dashboard refresh error:', error);

      // 계좌 연결 관련 에러인지 확인하고 프로필 화면으로 안내
      if (isAccountLinkingError(error)) {
        redirectToAccountLinking(navigation, '대시보드 데이터를 불러오는데 실패했습니다.\n\n계좌 연결 후 다시 시도해주세요.');
      }
    } finally {
      setRefreshing(false);
    }
  }, [queryClient, selectedYear, selectedMonth, selectedDay, navigation]);

  // 탭이 포커스될 때 최상단으로 스크롤
  useFocusEffect(
    React.useCallback(() => {
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    }, [])
  );

  // 400 에러 감지 시 계좌 연결 안내 (즉시 실행)
  useEffect(() => {
    if (hasShownAccountError) return;

    // 하나의 에러만 감지되어도 즉시 처리
    const firstError = todayDataError || monthlyReportError;

    if (firstError && isAccountLinkingError(firstError)) {
      console.log('🚀 빠른 에러 감지: 계좌 연결 필요');
      setHasShownAccountError(true);
      redirectToAccountLinking(navigation, '대시보드 데이터를 불러오는데 실패했습니다.\n\n계좌 연결 후 다시 시도해주세요.');
    }
  }, [todayDataError, monthlyReportError, navigation, hasShownAccountError]);





  return (
    <ErrorBoundary>
      <SafeAreaView style={commonStyles.safeContainer}>
          <ScrollView
            ref={scrollViewRef}
            style={commonStyles.scrollView}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={commonStyles.scrollContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor="#15803d"
                colors={['#15803d']}
              />
            }
          >

        <UnifiedHeader title="대시보드" />

        {/* AI 분석 결과 */}
        <View style={[commonStyles.section, { marginBottom: DASHBOARD_STYLE_CONSTANTS.SECTION_MARGINS.AI_ANALYSIS_BOTTOM }]}>
          <AIAnalysisCard key={aiCardRefreshKey} />
        </View>

        {/* Coco GIF */}
        <View style={[commonStyles.section, {
          paddingVertical: DASHBOARD_STYLE_CONSTANTS.SECTION_PADDING.VERTICAL,
          marginTop: DASHBOARD_STYLE_CONSTANTS.SECTION_MARGINS.COCO_GIF_TOP
        }]}>
          <Image
            source={cocoGif}
            style={{
              width: DASHBOARD_STYLE_CONSTANTS.COCO_GIF.WIDTH,
              height: DASHBOARD_STYLE_CONSTANTS.COCO_GIF.HEIGHT,
              alignSelf: 'center',
            }}
            resizeMode="contain"
          />
        </View>

        {/* 오늘 탄소 배출 현황 */}
        <View style={[commonStyles.section, { marginTop: DASHBOARD_STYLE_CONSTANTS.SECTION_MARGINS.TODAY_EMISSION_TOP }]}>
          <TodayEmissionStatus />
        </View>

        {/* 탭 형태로 합쳐진 분석 섹션 */}
        <View style={commonStyles.section}>
          <View style={commonStyles.card}>
            {/* 탭 헤더 */}
            <TabSelector
              activeTab={activeTab}
              onTabChange={handleTabChange}
              tabs={['일별', '카테고리별']}
            />

            {/* 탭 컨텐츠 */}
            {activeTab === 0 ? (
              <MonthlyCalendar />
            ) : (
              <CategoryReport />
            )}
          </View>
        </View>

        {/* 날짜 상세 카드 */}
        {showDetailCard && selectedDay && (
          <DayDetailCard />
        )}

        </ScrollView>
      </SafeAreaView>
    </ErrorBoundary>
  );
});

DashboardScreen.displayName = 'DashboardScreen';

const styles = StyleSheet.create({});

export default DashboardScreen;