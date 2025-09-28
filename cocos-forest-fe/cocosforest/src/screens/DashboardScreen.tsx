import React, { memo, useRef, useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native';
import { useDashboard } from '../hooks/useDashboard';
import { useQueryClient } from '@tanstack/react-query';
import { dashboardQueryKeys } from '../hooks/useDashboardQueries';
import { DASHBOARD_STYLE_CONSTANTS } from '../constants/dashboardStyles';
import { commonStyles, tabStyles } from '../styles/commonStyles';
import {
  AIAnalysisCard,
  TodayEmissionStatus,
  MonthlyCalendar,
  CategoryReport,
  DayDetailCard
} from '../components/dashboard';
import { ErrorBoundary, UnifiedHeader } from '../components/common';

const DashboardScreen = memo(() => {
  const scrollViewRef = useRef<ScrollView>(null);
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);

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
    } finally {
      setRefreshing(false);
    }
  }, [queryClient, selectedYear, selectedMonth, selectedDay]);

  // 탭이 포커스될 때 최상단으로 스크롤
  useFocusEffect(
    React.useCallback(() => {
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    }, [])
  );





  return (
    <ErrorBoundary>
      <SafeAreaView style={commonStyles.container}>
        <View style={commonStyles.container}>
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
            <View style={tabStyles.tabContainer}>
              <TouchableOpacity
                style={[tabStyles.tab, activeTab === 0 && tabStyles.activeTab]}
                onPress={() => handleTabChange(0)}
              >
                <Text style={[tabStyles.tabText, activeTab === 0 && tabStyles.activeTabText]}>
                  일별
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[tabStyles.tab, activeTab === 1 && tabStyles.activeTab]}
                onPress={() => handleTabChange(1)}
              >
                <Text style={[tabStyles.tabText, activeTab === 1 && tabStyles.activeTabText]}>
                  카테고리별
                </Text>
              </TouchableOpacity>
            </View>

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
        </View>
      </SafeAreaView>
    </ErrorBoundary>
  );
});

DashboardScreen.displayName = 'DashboardScreen';

const styles = StyleSheet.create({});

export default DashboardScreen;