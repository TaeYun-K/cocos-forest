import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fetchDailyEmissions, fetchMonthlyReport, fetchDayDetails, fetchTodayData } from '../api/dashboard';
import type { MonthlyReportData, DayData } from '../types/dashboard';
import {
  AIAnalysisCard,
  TodayEmissionStatus,
  MonthlyCalendar,
  CategoryReport,
  DayDetailCard
} from '../components/dashboard';

export default function DashboardScreen() {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [activeTab, setActiveTab] = useState(0); // 0: 월별 달력, 1: 카테고리별
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [showDetailCard, setShowDetailCard] = useState(false);

  // API 데이터 상태
  const [dailyEmissions, setDailyEmissions] = useState<{ [key: number]: number }>({});
  const [monthlyReportData, setMonthlyReportData] = useState<MonthlyReportData | null>(null);
  const [dayData, setDayData] = useState<DayData | null>(null);
  const [todayData, setTodayData] = useState<DayData | null>(null); // 오늘의 탄소 배출 현황용
  const [loading, setLoading] = useState(false);

  // 데이터 로딩 함수들
  const loadDailyEmissions = async (year: number, month: number) => {
    try {
      setLoading(true);
      const data = await fetchDailyEmissions(year, month + 1); // month는 0부터 시작하므로 +1
      setDailyEmissions(data.emissions);
    } catch (error) {
      console.error('Failed to load daily emissions:', error);
      // 기본값으로 빈 객체 설정
      setDailyEmissions({});
    } finally {
      setLoading(false);
    }
  };

  const loadMonthlyReport = async (year: number, month: number) => {
    try {
      setLoading(true);
      // 새로운 API 형식에 맞게 yearMonth 포맷 변경 (YYYY-MM)
      const yearMonth = `${year}-${String(month + 1).padStart(2, '0')}`;
      const data = await fetchMonthlyReport(yearMonth);
      setMonthlyReportData(data);
    } catch (error) {
      console.error('Failed to load monthly report:', error);
      // 기본값으로 빈 데이터 설정
      setMonthlyReportData(null);
    } finally {
      setLoading(false);
    }
  };

  const loadDayDetails = async (year: number, month: number, day: number) => {
    try {
      console.log(`🔄 Loading day details for ${year}-${month + 1}-${day}`);
      setLoading(true);
      // 새로운 API 형식에 맞게 날짜 포맷 변경 (YYYY-MM-DD)
      const date = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const data = await fetchDayDetails(date, true); // force=true로 설정
      console.log(`📊 Day data received:`, data);
      setDayData(data);
      console.log(`✅ Day data state updated`);
    } catch (error) {
      console.error('Failed to load day details:', error);
      // 기본값으로 null 설정
      setDayData(null);
      throw error; // 에러를 다시 던져서 handleDayPress에서 catch할 수 있도록
    } finally {
      setLoading(false);
    }
  };

  // 오늘 데이터 로딩
  const loadTodayData = async () => {
    try {
      console.log(`🔄 Loading today's data`);
      setLoading(true);
      const data = await fetchTodayData();
      console.log(`📊 Today data received:`, data);
      setTodayData(data);
      console.log(`✅ Today data state updated`);
    } catch (error) {
      console.error('Failed to load today data:', error);
      // 기본값으로 null 설정
      setTodayData(null);
    } finally {
      setLoading(false);
    }
  };

  // 초기 데이터 로딩
  useEffect(() => {
    loadDailyEmissions(selectedYear, selectedMonth);
    loadMonthlyReport(selectedYear, selectedMonth);
    loadTodayData(); // 오늘 데이터도 초기에 로딩
  }, [selectedYear, selectedMonth]);

  // 오늘 탄소 배출량 데이터 (API 연동)
  const todayEmission = todayData?.totals?.carbonTotalKg || 0.5; // kg (기본값 0.5kg)
  const averageEmission = 0.8; // kg (평균값은 고정, kg 단위에 맞게 조정)
  const emissionDifference = averageEmission - todayEmission;
  const emissionPercentage = (todayEmission / averageEmission) * 100;

  const handleDayPress = async (day: number) => {
    console.log(`📅 Day pressed: ${day}`);
    console.log(`📊 Current states - selectedDay: ${selectedDay}, showDetailCard: ${showDetailCard}`);
    
    setSelectedDay(day);
    console.log(`📍 Selected day set to: ${day}`);
    
    try {
      await loadDayDetails(selectedYear, selectedMonth, day);
      console.log(`✅ Day details loaded successfully for ${selectedYear}-${selectedMonth}-${day}`);
      setShowDetailCard(true);
      console.log(`🎯 Show detail card set to: true`);
    } catch (error) {
      console.error(`❌ Failed to load day details:`, error);
    }
  };

  const handleCloseDetailCard = () => {
    setShowDetailCard(false);
    setSelectedDay(null);
  };

  // 월 변경 함수들
  const handlePreviousMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
    // 상세 카드가 열려있으면 닫기
    if (showDetailCard) {
      handleCloseDetailCard();
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
    // 상세 카드가 열려있으면 닫기
    if (showDetailCard) {
      handleCloseDetailCard();
    }
  };


  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* AI 분석 결과 */}
        <View style={styles.section}>
          <AIAnalysisCard />
        </View>

        {/* 오늘 탄소 배출 현황 */}
        <View style={styles.section}>
          <TodayEmissionStatus
            todayEmission={todayEmission}
            averageEmission={averageEmission}
          />
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
              <MonthlyCalendar
                selectedYear={selectedYear}
                selectedMonth={selectedMonth}
                dailyEmissions={dailyEmissions}
                onDayPress={handleDayPress}
                onPreviousMonth={handlePreviousMonth}
                onNextMonth={handleNextMonth}
              />
            ) : (
              <CategoryReport
                selectedYear={selectedYear}
                selectedMonth={selectedMonth}
                monthlyReportData={monthlyReportData}
              />
            )}
          </View>
        </View>

        {/* 날짜 상세 카드 */}
        {showDetailCard && selectedDay && (
          <DayDetailCard
            selectedYear={selectedYear}
            selectedMonth={selectedMonth}
            selectedDay={selectedDay}
            dayData={dayData}
            onClose={handleCloseDetailCard}
          />
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