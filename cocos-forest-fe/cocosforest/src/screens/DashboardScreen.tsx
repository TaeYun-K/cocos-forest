import { useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import useDashboardStore from '../store/dashboardStore';
import { commonStyles, tabStyles } from '../styles/commonStyles';
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
    // 액션
    setActiveTab,
    handleCloseDetailCard,
    loadTodayData,
    loadMonthlyReport,
    initializeDashboard
  } = useDashboardStore();


  // 초기 데이터 로딩 및 월 변경 시 데이터 리로딩
  useEffect(() => {
    initializeDashboard(selectedYear, selectedMonth);
  }, [selectedYear, selectedMonth, initializeDashboard]);




  return (
    <SafeAreaView style={commonStyles.container}>
      <ScrollView style={commonStyles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={commonStyles.scrollContent}>

        {/* AI 분석 결과 */}
        <View style={commonStyles.section}>
          <AIAnalysisCard />
        </View>

        {/* 오늘 탄소 배출 현황 */}
        <View style={commonStyles.section}>
          <TodayEmissionStatus />
        </View>

        {/* 탭 형태로 합쳐진 분석 섹션 */}
        <View style={commonStyles.section}>
          <View style={commonStyles.card}>
            {/* 탭 헤더 */}
            <View style={tabStyles.tabContainer}>
              <TouchableOpacity
                style={[tabStyles.tab, activeTab === 0 && tabStyles.activeTab]}
onPress={() => {
                  setActiveTab(0);
                  // 일별 탭 클릭 시 오늘 데이터 로딩
                  loadTodayData();
                }}
              >
                <Text style={[tabStyles.tabText, activeTab === 0 && tabStyles.activeTabText]}>
                  일별
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[tabStyles.tab, activeTab === 1 && tabStyles.activeTab]}
onPress={() => {
                  setActiveTab(1);
                  // 카테고리별 탭 클릭 시 월별 리포트 로딩
                  loadMonthlyReport(selectedYear, selectedMonth);
                  if (showDetailCard) {
                    handleCloseDetailCard();
                  }
                }}
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
    </SafeAreaView>
  );
}

// 스타일은 commonStyles로 이동됨