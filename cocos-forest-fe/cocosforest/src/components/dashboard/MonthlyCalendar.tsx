import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import useDashboardStore from '../../store/dashboardStore';

export const MonthlyCalendar: React.FC = () => {
  const {
    selectedYear,
    selectedMonth,
    monthlyReportData,
    handleDayPress,
    handlePreviousMonth,
    handleNextMonth
  } = useDashboardStore();
  const monthNames = [
    '1월', '2월', '3월', '4월', '5월', '6월',
    '7월', '8월', '9월', '10월', '11월', '12월'
  ];

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
      // monthlyReportData.daily에서 해당 날짜의 탄소배출량 찾기
      const dayStr = String(day).padStart(2, '0');
      const dailyData = monthlyReportData?.daily?.find(d => d.date.endsWith(`-${dayStr}`));
      const emission = dailyData?.carbonTotalKg || 0;
      days.push(
        <TouchableOpacity key={day} style={styles.calendarDay} onPress={() => handleDayPress(day)}>
          <View style={[styles.calendarDayBackground, { backgroundColor: getEmissionColor(emission) }]} />
          <Text style={styles.calendarDayText}>{day}</Text>
        </TouchableOpacity>
      );
    }

    return days;
  };

  return (
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
  );
};

const styles = StyleSheet.create({
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
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
});