import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import useDashboardStore from '../store/dashboardStore';
import { useMonthlyReport, useTodayData } from '../hooks/useDashboardQueries';
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
  } = useDashboardStore();

  // React Query hooks
  const { data: todayData, isLoading: todayLoading, error: todayError } = useTodayData();
  const { data: monthlyReportData, isLoading: monthlyLoading, error: monthlyError } = useMonthlyReport(selectedYear, selectedMonth);

  // GIF 선택 로직
  const getCocoGif = () => {
    const todayEmission = todayData?.totals?.carbonTotalKg || 0.5;
    const averageEmission = 0.8;

    if (todayEmission < 0.4) {
      return require('../assets/coco-smile-unscreen.gif');
    } else if (todayEmission > averageEmission) {
      return require('../assets/coco-sad-unscreen.gif');
    } else {
      return require('../assets/coco-init-unscreen.gif');
    }
  };


  // 로딩 상태 통합
  const isLoading = todayLoading || monthlyLoading;




  return (
    <SafeAreaView style={commonStyles.container}>
      <ScrollView style={commonStyles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={commonStyles.scrollContent}>

        {/* AI 분석 결과 */}
        <View style={[commonStyles.section, { marginBottom: -155 }]}>
          <AIAnalysisCard />
        </View>

        {/* Coco GIF */}
        <View style={[commonStyles.section, { paddingVertical: 0, marginTop: -25 }]}>
          <Image
            source={getCocoGif()}
            style={{
              width: 600,
              height: 600,
              alignSelf: 'center',
            }}
            resizeMode="contain"
          />
        </View>

        {/* 오늘 탄소 배출 현황 */}
        <View style={[commonStyles.section, { marginTop: -180 }]}>
          <TodayEmissionStatus />
        </View>

        {/* 탭 형태로 합쳐진 분석 섹션 */}
        <View style={commonStyles.section}>
          <View style={commonStyles.card}>
            {/* 탭 헤더 */}
            <View style={tabStyles.tabContainer}>
              <TouchableOpacity
                style={[tabStyles.tab, activeTab === 0 && tabStyles.activeTab]}
                onPress={() => setActiveTab(0)}
              >
                <Text style={[tabStyles.tabText, activeTab === 0 && tabStyles.activeTabText]}>
                  일별
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[tabStyles.tab, activeTab === 1 && tabStyles.activeTab]}
                onPress={() => {
                  setActiveTab(1);
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