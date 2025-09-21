import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import useDashboardStore from '../../store/dashboardStore';
import { useMonthlyReport } from '../../hooks/useDashboardQueries';
import { LoadingSpinner, ErrorMessage } from '../common';

export const MonthlyCalendar: React.FC = () => {
  const {
    selectedYear,
    selectedMonth,
    openDayDetail,
    changeMonth
  } = useDashboardStore();

  const { data: monthlyReportData, isLoading, error, refetch } = useMonthlyReport(selectedYear, selectedMonth);

  const monthNames = useMemo(() => [
    '1월', '2월', '3월', '4월', '5월', '6월',
    '7월', '8월', '9월', '10월', '11월', '12월'
  ], []);

  // 탄소 배출량에 따른 색상 결정 (kg 단위에 맞게 조정)
  const getEmissionColor = useMemo(() => (emission: number) => {
    if (emission >= 0.8) return '#ef4444'; // 0.8kg 이상: 높음 (빨강)
    if (emission >= 0.4) return '#eab308';  // 0.4-0.8kg: 보통 (노랑)
    return '#15803d'; // 0.4kg 미만: 낮음 (초록)
  }, []);

  // 달력 생성을 위한 계산값들 메모이제이션
  const calendarData = useMemo(() => {
    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    const firstDay = new Date(selectedYear, selectedMonth, 1).getDay();

    return { daysInMonth, firstDay };
  }, [selectedYear, selectedMonth]);

  // 일별 데이터를 Map으로 변환하여 O(1) 조회 가능하게 최적화
  const dailyDataMap = useMemo(() => {
    if (!monthlyReportData?.daily) return new Map();

    const map = new Map();
    monthlyReportData.daily.forEach(dayData => {
      const day = dayData.date.split('-').pop();
      map.set(day, dayData.carbonTotalKg || 0);
    });
    return map;
  }, [monthlyReportData?.daily]);

  const renderCalendar = () => {
    const { daysInMonth, firstDay } = calendarData;
    const days: React.ReactNode[] = [];

    // 빈 칸 추가
    for (let i = 0; i < firstDay; i++) {
      days.push(<View key={`empty-${i}`} style={styles.calendarEmptyDay} />);
    }

    // 날짜 추가
    for (let day = 1; day <= daysInMonth; day++) {
      const dayStr = String(day).padStart(2, '0');
      const emission = dailyDataMap.get(dayStr) || 0;
      days.push(
        <TouchableOpacity key={day} style={styles.calendarDay} onPress={() => openDayDetail(day)}>
          <View style={[styles.calendarDayBackground, { backgroundColor: getEmissionColor(emission) }]} />
          <Text style={styles.calendarDayText}>{day}</Text>
        </TouchableOpacity>
      );
    }

    return days;
  };

  if (isLoading) {
    return (
      <View>
        <View style={styles.calendarHeader}>
          <Text style={styles.cardTitle}>월별 탄소 배출량</Text>
          <View style={styles.monthSelector}>
            <TouchableOpacity style={styles.monthButton} onPress={() => changeMonth('prev')}>
              <Text style={styles.monthButtonText}>←</Text>
            </TouchableOpacity>
            <Text style={styles.monthText}>
              {selectedYear}년 {monthNames[selectedMonth]}
            </Text>
            <TouchableOpacity style={styles.monthButton} onPress={() => changeMonth('next')}>
              <Text style={styles.monthButtonText}>→</Text>
            </TouchableOpacity>
          </View>
        </View>
        <LoadingSpinner message="월별 데이터를 불러오는 중..." />
      </View>
    );
  }

  if (error) {
    return (
      <View>
        <View style={styles.calendarHeader}>
          <Text style={styles.cardTitle}>월별 탄소 배출량</Text>
          <View style={styles.monthSelector}>
            <TouchableOpacity style={styles.monthButton} onPress={() => changeMonth('prev')}>
              <Text style={styles.monthButtonText}>←</Text>
            </TouchableOpacity>
            <Text style={styles.monthText}>
              {selectedYear}년 {monthNames[selectedMonth]}
            </Text>
            <TouchableOpacity style={styles.monthButton} onPress={() => changeMonth('next')}>
              <Text style={styles.monthButtonText}>→</Text>
            </TouchableOpacity>
          </View>
        </View>
        <ErrorMessage
          title="월별 데이터 오류"
          message="월별 탄소 배출량 데이터를 불러올 수 없습니다."
          onRetry={refetch}
        />
      </View>
    );
  }

  return (
    <View>
      <View style={styles.calendarHeader}>
        <Text style={styles.cardTitle}>월별 탄소 배출량</Text>
        <View style={styles.monthSelector}>
          <TouchableOpacity style={styles.monthButton} onPress={() => changeMonth('prev')}>
            <Text style={styles.monthButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.monthText}>
            {selectedYear}년 {monthNames[selectedMonth]}
          </Text>
          <TouchableOpacity style={styles.monthButton} onPress={() => changeMonth('next')}>
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