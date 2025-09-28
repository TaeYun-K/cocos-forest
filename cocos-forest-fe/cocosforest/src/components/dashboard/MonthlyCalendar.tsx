import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Calendar, DateData, LocaleConfig } from 'react-native-calendars';
import useDashboardStore from '../../store/dashboardStore';
import { useMonthlyReport } from '../../hooks/useDashboardQueries';
import { LoadingSpinner, ErrorMessage } from '../common';

// 한국어 로케일 설정
LocaleConfig.locales['ko'] = {
  monthNames: [
    '1월', '2월', '3월', '4월', '5월', '6월',
    '7월', '8월', '9월', '10월', '11월', '12월'
  ],
  monthNamesShort: [
    '1월', '2월', '3월', '4월', '5월', '6월',
    '7월', '8월', '9월', '10월', '11월', '12월'
  ],
  dayNames: ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'],
  dayNamesShort: ['일', '월', '화', '수', '목', '금', '토'],
  today: '오늘'
};
LocaleConfig.defaultLocale = 'ko';

/**
 * 월별 탄소 배출량을 달력 형태로 표시하는 컴포넌트
 *
 * @description
 * - 선택된 월의 일별 탄소 배출량을 색상으로 구분하여 달력에 표시
 * - 월 네비게이션 기능 제공 (이전/다음 월)
 * - 날짜 클릭 시 해당 날짜의 상세 정보를 표시
 * - 배출량 범례 제공 (낮음/보통/높음)
 * - 성능 최적화된 데이터 조회 및 렌더링
 *
 * @component
 * @example
 * ```tsx
 * <MonthlyCalendar />
 * ```
 *
 * @features
 * - 🎨 탄소 배출량에 따른 시각적 표시 (색상 구분)
 * - 📅 직관적인 달력 UI
 * - 🔄 월 네비게이션
 * - 📊 실시간 데이터 반영
 * - ⚡ 메모이제이션을 통한 성능 최적화
 * - 🔄 로딩 및 에러 상태 처리
 */
export const MonthlyCalendar: React.FC = () => {
  const {
    selectedYear,
    selectedMonth,
    openDayDetail,
    changeMonth
  } = useDashboardStore();

  const { data: monthlyReportData, isLoading, error, refetch } = useMonthlyReport(selectedYear, selectedMonth);


  // 탄소 배출량에 따른 색상 결정 (kg 단위에 맞게 조정)
  const getEmissionColor = useMemo(() => (emission: number) => {
    if (emission >= 26.02) return '#ef4444'; // 26.02kg 이상: 높음 (빨강)
    if (emission >= 13.01) return '#eab308';  // 13.01-26.02kg: 보통 (노랑)
    return '#15803d'; // 13.01kg 미만: 낮음 (초록)
  }, []);

  // 탄소배출량 데이터를 markedDates로 변환
  const markedDates = useMemo(() => {
    if (!monthlyReportData?.daily) return {};

    const marked: { [key: string]: any } = {};
    monthlyReportData.daily.forEach(dayData => {
      const emission = dayData.carbonTotalKg || 0;
      const color = getEmissionColor(emission);

      marked[dayData.date] = {
        customStyles: {
          container: {
            backgroundColor: color,
            borderRadius: 8,
          },
          text: {
            color: '#ffffff',
            fontWeight: '600',
          },
        },
      };
    });

    return marked;
  }, [monthlyReportData?.daily, getEmissionColor]);

  // 현재 월의 날짜 문자열 생성
  const currentMonth = useMemo(() => {
    return `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}`;
  }, [selectedYear, selectedMonth]);

  // 날짜 선택 핸들러
  const onDayPress = (day: DateData) => {
    const dayNumber = parseInt(day.dateString.split('-')[2], 10);
    openDayDetail(dayNumber);
  };

  if (isLoading) {
    return (
      <View>
        <View style={styles.monthSelector}>
          <TouchableOpacity style={styles.monthButton} onPress={() => changeMonth('prev')}>
            <Text style={styles.monthButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.monthText}>
            {selectedYear}년 {selectedMonth + 1}월
          </Text>
          <TouchableOpacity style={styles.monthButton} onPress={() => changeMonth('next')}>
            <Text style={styles.monthButtonText}>→</Text>
          </TouchableOpacity>
        </View>
        <LoadingSpinner message="월별 데이터를 불러오는 중..." />
      </View>
    );
  }

  if (error) {
    return (
      <View>
        <View style={styles.monthSelector}>
          <TouchableOpacity style={styles.monthButton} onPress={() => changeMonth('prev')}>
            <Text style={styles.monthButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.monthText}>
            {selectedYear}년 {selectedMonth + 1}월
          </Text>
          <TouchableOpacity style={styles.monthButton} onPress={() => changeMonth('next')}>
            <Text style={styles.monthButtonText}>→</Text>
          </TouchableOpacity>
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
      <View style={styles.monthSelector}>
        <TouchableOpacity style={styles.monthButton} onPress={() => changeMonth('prev')}>
          <Text style={styles.monthButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.monthText}>
          {selectedYear}년 {selectedMonth + 1}월
        </Text>
        <TouchableOpacity style={styles.monthButton} onPress={() => changeMonth('next')}>
          <Text style={styles.monthButtonText}>→</Text>
        </TouchableOpacity>
      </View>


      {/* Calendar 컴포넌트 */}
      <Calendar
        key={currentMonth}
        current={currentMonth + '-01'}
        onDayPress={onDayPress}
        markedDates={markedDates}
        markingType={'custom'}
        firstDay={0}
        theme={{
          backgroundColor: 'transparent',
          calendarBackground: 'transparent',
          textSectionTitleColor: '#6b7280',
          selectedDayBackgroundColor: '#3b82f6',
          selectedDayTextColor: '#ffffff',
          todayTextColor: '#3b82f6',
          dayTextColor: '#1f2937',
          textDisabledColor: '#d1d5db',
          dotColor: '#3b82f6',
          selectedDotColor: '#ffffff',
          arrowColor: '#6b7280',
          monthTextColor: '#1f2937',
          indicatorColor: '#3b82f6',
          textDayFontWeight: '600',
          textMonthFontWeight: 'bold',
          textDayHeaderFontWeight: '600',
          textDayFontSize: 12,
          textMonthFontSize: 16,
          textDayHeaderFontSize: 12,
        }}
        hideArrows={true}
        hideExtraDays={true}
        disableMonthChange={true}
        style={styles.calendarStyle}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  monthSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 24,
    paddingVertical: 8,
  },
  monthButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  monthButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#374151',
  },
  monthText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    minWidth: 120,
    textAlign: 'center',
  },
  calendarStyle: {
    borderRadius: 8,
    elevation: 0,
    shadowOpacity: 0,
  },
});