import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fetchDailyEmissions, fetchMonthlyReport, fetchDayDetails, fetchTodayData } from '../api/dashboard';
import type { MonthlyReportData, DayData } from '../types/dashboard'

export default function DashboardScreen() {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [activeTab, setActiveTab] = useState(0); // 0: 월별 달력, 1: 카테고리별
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [showDetailCard, setShowDetailCard] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current; // 초기값: 높이 0으로 숨겨진 상태

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

  // 탄소 배출량에 따른 색상 결정 (kg 단위에 맞게 조정)
  const getEmissionColor = (emission: number) => {
    if (emission >= 0.8) return '#ef4444'; // 0.8kg 이상: 높음 (빨강)
    if (emission >= 0.4) return '#eab308';  // 0.4-0.8kg: 보통 (노랑)
    return '#15803d'; // 0.4kg 미만: 낮음 (초록)
  };

  // 달력 생성
  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay();
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(selectedMonth, selectedYear);
    const firstDay = getFirstDayOfMonth(selectedMonth, selectedYear);
    const days: React.ReactNode[] = [];

    // 빈 칸 추가
    for (let i = 0; i < firstDay; i++) {
      days.push(<View key={`empty-${i}`} style={styles.calendarEmptyDay} />);
    }

    // 날짜 추가
    for (let day = 1; day <= daysInMonth; day++) {
      const emission = dailyEmissions[day] || 0;
      days.push(
        <TouchableOpacity key={day} style={styles.calendarDay} onPress={() => handleDayPress(day)}>
          <View style={[styles.calendarDayBackground, { backgroundColor: getEmissionColor(emission) }]} />
          <Text style={styles.calendarDayText}>{day}</Text>
        </TouchableOpacity>
      );
    }

    return days;
  };

  const monthNames = [
    '1월', '2월', '3월', '4월', '5월', '6월',
    '7월', '8월', '9월', '10월', '11월', '12월'
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* AI 분석 결과 */}
        <View style={styles.section}>
          <View style={styles.card}>
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

        {/* 오늘 탄소 배출 현황 */}
        <View style={styles.section}>
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
              // 월별 탄소 배출량 달력
              <View>
                <View style={styles.calendarHeader}>
                  <Text style={styles.cardTitle}>월별 탄소 배출량</Text>
                  <View style={styles.monthSelector}>
                    <TouchableOpacity style={styles.monthButton} onPress={handlePreviousMonth}>
                      <Text style={styles.monthButtonText}>←</Text>
                    </TouchableOpacity>
                    <Text style={styles.monthText}>
                      {selectedYear}년 {monthNames[selectedMonth]}
                    </Text>
                    <TouchableOpacity style={styles.monthButton} onPress={handleNextMonth}>
                      <Text style={styles.monthButtonText}>→</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                
                {/* 범례 */}
                <View style={styles.legend}>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendColor, { backgroundColor: '#15803d' }]} />
                    <Text style={styles.legendText}>낮음 (~0.4kg)</Text>
                  </View>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendColor, { backgroundColor: '#eab308' }]} />
                    <Text style={styles.legendText}>보통 (0.4-0.8kg)</Text>
                  </View>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendColor, { backgroundColor: '#ef4444' }]} />
                    <Text style={styles.legendText}>높음 (0.8kg+)</Text>
                  </View>
                </View>

                {/* 요일 헤더 */}
                <View style={styles.weekDaysHeader}>
                  {['일', '월', '화', '수', '목', '금', '토'].map(day => (
                    <Text key={day} style={styles.weekDayText}>{day}</Text>
                  ))}
                </View>

                {/* 달력 */}
                <View style={styles.calendar}>
                  {renderCalendar()}
                </View>

              </View>
            ) : (
              // 월별 카테고리 리포트
              <View>
                <Text style={styles.cardTitle}>
                  {selectedYear}년 {selectedMonth + 1}월 리포트
                </Text>
                
                {/* 월별 요약 섹션 */}
                {monthlyReportData && (
                  <View style={styles.monthlyStatsContainer}>
                    <View style={styles.statsGrid}>
                      <View style={styles.statHighlight}>
                        <Text style={styles.statMainValue}>
                          ₩{monthlyReportData.totals.amountTotal.toLocaleString()}
                        </Text>
                        <Text style={styles.statMainLabel}>총 결제금액</Text>
                      </View>
                      <View style={styles.statHighlight}>
                        <Text style={[styles.statMainValue, { color: '#ef4444' }]}>
                          {monthlyReportData.totals.carbonTotalKg}kg
                        </Text>
                        <Text style={styles.statMainLabel}>총 탄소배출</Text>
                      </View>
                    </View>
                    
                    <View style={styles.additionalStats}>
                      <View style={styles.statRow}>
                        <Text style={styles.statSecondaryLabel}>거래 건수</Text>
                        <Text style={styles.statSecondaryValue}>
                          {monthlyReportData.totals.transactionCount}건
                        </Text>
                      </View>
                      <View style={styles.statRow}>
                        <Text style={styles.statSecondaryLabel}>활성 일수</Text>
                        <Text style={styles.statSecondaryValue}>
                          {monthlyReportData.totals.daysActive}일
                        </Text>
                      </View>
                      <View style={styles.statRow}>
                        <Text style={styles.statSecondaryLabel}>일평균 배출량</Text>
                        <Text style={[styles.statSecondaryValue, { color: '#ef4444', fontWeight: '600' }]}>
                          {monthlyReportData.totals.avgPerDayCarbonKg}kg CO₂
                        </Text>
                      </View>
                    </View>
                  </View>
                )}

                {/* 카테고리별 상세 분석 */}
                <Text style={styles.sectionTitle}>카테고리별 분석</Text>
                <View style={styles.categoryList}>
                  {monthlyReportData?.byCategory
                    .sort((a, b) => b.carbonTotalKg - a.carbonTotalKg)
                    .map((item, index) => (
                    <View key={item.categoryId} style={styles.categoryItemDetailed}>
                      <View style={styles.categoryHeader}>
                        <View style={styles.categoryLeft}>
                          <View style={[styles.categoryColor, { backgroundColor: item.color }]} />
                          <Text style={styles.categoryName}>{item.categoryName}</Text>
                          {index === 0 && (
                            <View style={styles.topEmitterBadge}>
                              <Text style={styles.topEmitterText}>최다 배출</Text>
                            </View>
                          )}
                        </View>
                        <View style={styles.categoryRight}>
                          <Text style={styles.categoryAmount}>{item.carbonTotalKg}kg CO₂</Text>
                          <Text style={styles.categoryPercentage}>
                            {Math.round(item.ratioCarbon * 100)}%
                          </Text>
                        </View>
                      </View>
                      
                      <View style={styles.categoryDetails}>
                        <View style={styles.categoryDetailRow}>
                          <Text style={styles.categoryDetailLabel}>결제금액</Text>
                          <Text style={styles.categoryDetailValue}>
                            ₩{item.amountTotal.toLocaleString()}
                          </Text>
                        </View>
                        <View style={styles.categoryDetailRow}>
                          <Text style={styles.categoryDetailLabel}>금액 비중</Text>
                          <Text style={styles.categoryDetailValue}>
                            {Math.round(item.ratioAmount * 100)}%
                          </Text>
                        </View>
                      </View>
                      
                      {/* 탄소 배출량 비중 바 */}
                      <View style={styles.emissionBar}>
                        <View 
                          style={[
                            styles.emissionFill, 
                            { 
                              width: `${item.ratioCarbon * 100}%`,
                              backgroundColor: item.color 
                            }
                          ]} 
                        />
                      </View>
                    </View>
                  ))}
                </View>

              </View>
            )}
          </View>
        </View>

        {/* 달력 카드 하단 상세 정보 카드 */}
        {(() => {
          console.log(`🔍 Render check - showDetailCard: ${showDetailCard}, selectedDay: ${selectedDay}, dayData: ${!!dayData}`);
          return null;
        })()}
        {showDetailCard && selectedDay && (
          <View style={styles.inlineDetailCard}>
            <View style={styles.detailCard}>
              {/* 카드 상단 핸들 */}
              <View style={styles.cardHandle} />
              
              {/* 헤더 */}
              <View style={styles.detailHeader}>
                <View style={styles.detailHeaderLeft}>
                  <Text style={styles.detailDate}>
                    {selectedYear}년 {monthNames[selectedMonth]} {selectedDay}일
                  </Text>
                  <View style={styles.syncStatus}>
                    <View style={styles.syncDot} />
                    <Text style={styles.syncText}>실시간 동기화 완료</Text>
                  </View>
                </View>
                <TouchableOpacity 
                  style={styles.closeButton}
                  onPress={handleCloseDetailCard}
                >
                  <Text style={styles.closeButtonText}>✕</Text>
                </TouchableOpacity>
              </View>

              {/* 총 배출량 및 결제 정보 */}
              {dayData && (
                <View style={styles.totalSection}>
                  <View style={styles.totalEmissionCard}>
                    <Text style={styles.totalEmissionLabel}>총 탄소 배출량</Text>
                    <Text style={styles.totalEmissionValue}>
                      {dayData.totals.carbonTotalKg}kg CO₂
                    </Text>
                  </View>
                  <View style={styles.totalStatsGrid}>
                    <View style={styles.statCard}>
                      <Text style={styles.statValue}>
                        {dayData.totals.amountTotal.toLocaleString()}원
                      </Text>
                      <Text style={styles.statLabel}>총 결제금액</Text>
                    </View>
                    <View style={styles.statCard}>
                      <Text style={styles.statValue}>
                        {dayData.totals.transactionCount}건
                      </Text>
                      <Text style={styles.statLabel}>거래 건수</Text>
                    </View>
                  </View>
                </View>
              )}

              {/* 거래 내역 */}
              {dayData && (
                <View style={styles.transactionsSection}>
                  <Text style={styles.transactionsTitle}>거래 내역</Text>
                  <ScrollView style={styles.transactionsScrollView} showsVerticalScrollIndicator={false}>
                    {dayData.transactions.map((transaction, index) => (
                    <View key={index} style={styles.transactionItem}>
                      <View style={styles.transactionHeader}>
                        <View style={styles.transactionMerchant}>
                          <Text style={styles.merchantName}>{transaction.merchantName}</Text>
                          <Text style={styles.transactionTime}>{transaction.txTime}</Text>
                        </View>
                        <View style={styles.transactionAmount}>
                          <Text style={styles.amountValue}>
                            {transaction.amountKrw.toLocaleString()}원
                          </Text>
                          <Text style={styles.carbonValue}>
                            {transaction.carbonKg}kg CO₂
                          </Text>
                        </View>
                      </View>
                      <View style={styles.transactionDetails}>
                        <View style={styles.categoryTag}>
                          <Text style={styles.categoryText}>{transaction.categoryName}</Text>
                        </View>
                        <Text style={styles.cardInfo}>
                          {transaction.cardName} ****{transaction.cardLast4}
                        </Text>
                      </View>
                    </View>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>
          </View>
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
    paddingBottom: 100, // 하단에 충분한 여백 추가
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
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  processSteps: {
    gap: 16,
  },
  processStep: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  processIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  processIconText: {
    fontSize: 16,
  },
  processContent: {
    flex: 1,
  },
  processTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  processDescription: {
    fontSize: 12,
    color: '#6b7280',
  },
  processArrow: {
    fontSize: 16,
    color: '#6b7280',
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  monthSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  monthButton: {
    padding: 4,
  },
  monthButtonText: {
    fontSize: 16,
    color: '#6b7280',
  },
  monthText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 2,
  },
  legendText: {
    fontSize: 12,
    color: '#6b7280',
  },
  weekDaysHeader: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekDayText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    paddingVertical: 8,
  },
  calendar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarEmptyDay: {
    width: '14.28%',
    height: 32,
    marginBottom: 4,
  },
  calendarDay: {
    width: '14.28%',
    height: 32,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  calendarDayBackground: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 8,
    opacity: 0.8,
  },
  calendarDayText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
    zIndex: 1,
  },
  chartContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  chartPlaceholder: {
    width: 192,
    height: 192,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
  },
  chartText: {
    fontSize: 32,
    marginBottom: 8,
  },
  chartSubtext: {
    fontSize: 14,
    color: '#6b7280',
  },
  categoryList: {
    gap: 12,
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  categoryColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  categoryRight: {
    alignItems: 'flex-end',
  },
  categoryAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 2,
  },
  categoryPercentage: {
    fontSize: 12,
    color: '#6b7280',
  },
  suggestionCard: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
    padding: 16,
    backgroundColor: 'rgba(21, 128, 61, 0.1)',
    borderRadius: 12,
  },
  suggestionIcon: {
    width: 32,
    height: 32,
    backgroundColor: 'rgba(21, 128, 61, 0.2)',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  suggestionIconText: {
    fontSize: 14,
  },
  suggestionContent: {
    flex: 1,
  },
  suggestionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  suggestionText: {
    fontSize: 12,
    color: '#6b7280',
    lineHeight: 16,
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
  // AI 분석 결과 스타일
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
  // 오늘 탄소 배출 현황 스타일
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
  // 슬라이딩 카드 스타일
  detailCardContainer: {
    marginTop: 16,
    overflow: 'hidden',
  },
  inlineDetailCard: {
    marginTop: 16,
    marginHorizontal: 16,
    marginBottom: 24, // 하단 마진 추가
  },
  detailCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    paddingTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  cardHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#d1d5db',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  detailHeaderLeft: {
    flex: 1,
  },
  detailDate: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  syncStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  syncDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10b981',
  },
  syncText: {
    fontSize: 12,
    color: '#6b7280',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: '#6b7280',
  },
  totalSection: {
    marginBottom: 24,
  },
  totalEmissionCard: {
    backgroundColor: '#f0fdf4',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
  },
  totalEmissionLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  totalEmissionValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#15803d',
  },
  totalStatsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  transactionsSection: {
    flex: 1,
  },
  transactionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  transactionsList: {
    flex: 1,
  },
  transactionsScrollView: {
    maxHeight: 400, // 높이 제한 완화
  },
  transactionItem: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  transactionMerchant: {
    flex: 1,
  },
  merchantName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  transactionTime: {
    fontSize: 12,
    color: '#6b7280',
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  amountValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 2,
  },
  carbonValue: {
    fontSize: 12,
    color: '#15803d',
    fontWeight: '600',
  },
  transactionDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryTag: {
    backgroundColor: '#dbeafe',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryText: {
    fontSize: 12,
    color: '#1e40af',
    fontWeight: '600',
  },
  cardInfo: {
    fontSize: 12,
    color: '#6b7280',
  },
  // 월별 리포트 스타일들
  monthlyStatsContainer: {
    marginBottom: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  statHighlight: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },
  statMainValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  statMainLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '600',
  },
  additionalStats: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 16,
    gap: 8,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statSecondaryLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  statSecondaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
    marginTop: 8,
  },
  categoryItemDetailed: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  topEmitterBadge: {
    backgroundColor: '#fef3c7',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8,
  },
  topEmitterText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#d97706',
  },
  categoryDetails: {
    gap: 8,
    marginBottom: 12,
  },
  categoryDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryDetailLabel: {
    fontSize: 13,
    color: '#6b7280',
  },
  categoryDetailValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1f2937',
  },
  emissionBar: {
    height: 6,
    backgroundColor: '#f3f4f6',
    borderRadius: 3,
    overflow: 'hidden',
  },
  emissionFill: {
    height: '100%',
    borderRadius: 3,
  },
  insightCard: {
    backgroundColor: '#f0fdf4',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  insightIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#15803d',
  },
  insightText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 8,
  },
  insightHighlight: {
    fontWeight: 'bold',
    color: '#dc2626',
  },
  comparisonTip: {
    backgroundColor: '#dcfce7',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
});