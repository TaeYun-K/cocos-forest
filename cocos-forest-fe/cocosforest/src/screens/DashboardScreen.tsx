import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDashboard } from '../hooks/useDashboard';
import { DASHBOARD_STYLE_CONSTANTS } from '../constants/dashboardStyles';
import { commonStyles, tabStyles } from '../styles/commonStyles';
import {
  AIAnalysisCard,
  TodayEmissionStatus,
  MonthlyCalendar,
  CategoryReport,
  DayDetailCard,
  PaymentButton,
  PaymentSuccessModal
} from '../components/dashboard';

export default function DashboardScreen() {
  const {
    // 상태
    activeTab,
    showDetailCard,
    selectedDay,
    showSuccessModal,
    isLoading,

    // 데이터
    cocoGif,

    // 액션
    handleTabChange,
    closeDayDetail,
    handlePaymentSuccess,
    handlePaymentModalConfirm,
  } = useDashboard();





  return (
    <SafeAreaView style={commonStyles.container}>
      <ScrollView style={commonStyles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={commonStyles.scrollContent}>

        {/* 결제하기 버튼 */}
        <View style={commonStyles.section}>
          <PaymentButton onPaymentSuccess={handlePaymentSuccess} />
        </View>

        {/* AI 분석 결과 */}
        <View style={[commonStyles.section, { marginBottom: DASHBOARD_STYLE_CONSTANTS.SECTION_MARGINS.AI_ANALYSIS_BOTTOM }]}>
          <AIAnalysisCard />
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

      {/* 결제 성공 모달 */}
      <PaymentSuccessModal
        visible={showSuccessModal}
        onConfirm={handlePaymentModalConfirm}
      />
    </SafeAreaView>
  );
}

// 스타일은 commonStyles로 이동됨