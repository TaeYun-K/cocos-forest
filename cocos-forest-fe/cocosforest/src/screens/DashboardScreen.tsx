import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import useDashboardStore from '../store/dashboardStore';
import {
  AIAnalysisCard,
  TodayEmissionStatus,
  MonthlyCalendar,
  CategoryReport,
  DayDetailCard
} from '../components/dashboard';

export default function DashboardScreen() {
  const {
    // 상태
    selectedMonth,
    selectedYear,
    selectedDay,
    activeTab,
    showDetailCard,
    dailyEmissions,
    monthlyReportData,
    dayData,
    todayData,
    loading,
    // 액션
    setActiveTab,
    handleDayPress,
    handleCloseDetailCard,
    handlePreviousMonth,
    handleNextMonth,
    loadTodayData,
    loadMonthlyReport,
    initializeDashboard
  } = useDashboardStore();


  // 초기 데이터 로딩 및 월 변경 시 데이터 리로딩
  useEffect(() => {
    initializeDashboard(selectedYear, selectedMonth);
  }, [selectedYear, selectedMonth, initializeDashboard]);




  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* AI 분석 결과 */}
        <View style={styles.section}>
          <AIAnalysisCard />
        </View>

        {/* 오늘 탄소 배출 현황 */}
        <View style={styles.section}>
          <TodayEmissionStatus />
        </View>

        {/* 탭 형태로 합쳐진 분석 섹션 */}
        <View style={styles.section}>
          <View style={styles.card}>
            {/* 탭 헤더 */}
            <View style={styles.tabContainer}>
              <TouchableOpacity
                style={[styles.tab, activeTab === 0 && styles.activeTab]}
onPress={() => {
                  setActiveTab(0);
                  // 일별 탭 클릭 시 오늘 데이터 로딩
                  loadTodayData();
                }}
              >
                <Text style={[styles.tabText, activeTab === 0 && styles.activeTabText]}>
                  일별
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tab, activeTab === 1 && styles.activeTab]}
onPress={() => {
                  setActiveTab(1);
                  // 카테고리별 탭 클릭 시 월별 리포트 로딩
                  loadMonthlyReport(selectedYear, selectedMonth);
                  if (showDetailCard) {
                    handleCloseDetailCard();
                  }
                }}
              >
                <Text style={[styles.tabText, activeTab === 1 && styles.activeTabText]}>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fefdf8',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  section: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#15803d',
    shadowColor: '#15803d',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  activeTabText: {
    color: '#ffffff',
  },
});