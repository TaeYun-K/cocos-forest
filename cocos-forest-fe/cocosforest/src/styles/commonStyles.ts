import { StyleSheet } from 'react-native';

// 공통 색상 팔레트
export const colors = {
  // 기본 색상
  background: '#ededed',
  white: '#ffffff',
  black: '#000000',

  // 텍스트 색상
  textPrimary: '#1f2937',
  textSecondary: '#6b7280',
  textTertiary: '#9ca3af',
  textWhite: '#ffffff',

  // 테마 색상
  primary: '#15803d',        // 메인 그린
  primaryLight: '#16a34a',   // 밝은 그린
  primaryDark: '#166534',    // 어두운 그린
  secondary: '#3b82f6',      // 블루
  secondaryLight: '#0ea5e9', // 밝은 블루
  warning: '#eab308',        // 경고 (노란색)
  warningLight: '#fbbf24',
  danger: '#ef4444',         // 위험 (빨간색)
  dangerDark: '#dc2626',
  success: '#10b981',        // 성공 (초록)
  successDark: '#059669',
  info: '#84cc16',           // 정보 (라임)

  // 회색 계열
  gray50: '#f9fafb',
  gray100: '#f3f4f6',
  gray200: '#e5e7eb',
  gray300: '#d1d5db',
  gray400: '#9ca3af',
  gray500: '#6b7280',
  gray600: '#4b5563',
  gray700: '#374151',
  gray800: '#1f2937',
  gray900: '#111827',

  // 배경 색상
  greenLight: '#f0fdf4',
  blueLight: '#f0f9ff',
  yellowLight: '#fef3c7',
  redLight: '#fef2f2',
  grayLight: '#f8fafc',

  // 투명도
  transparentBlack: 'rgba(0, 0, 0, 0.5)',
  transparentWhite: 'rgba(255, 255, 255, 0.1)',
};

// 공통 스타일
export const commonStyles = StyleSheet.create({
  // 컨테이너 스타일
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  // 상태바를 고려한 SafeAreaView 컨테이너
  safeContainer: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: 8, // 상태바와 헤더 사이 추가 여백
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

  // 카드 스타일
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },

  cardSmall: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },

  // 텍스트 스타일
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },

  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },

  bodyText: {
    fontSize: 14,
    color: colors.textSecondary,
  },

  captionText: {
    fontSize: 12,
    color: colors.textSecondary,
  },

  // 버튼 스타일
  button: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },

  buttonPrimary: {
    backgroundColor: colors.primary,
  },

  buttonSecondary: {
    backgroundColor: colors.gray100,
  },

  buttonDanger: {
    backgroundColor: colors.danger,
  },

  buttonSuccess: {
    backgroundColor: colors.success,
  },

  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.primary,
  },

  buttonDisabled: {
    backgroundColor: colors.gray300,
    opacity: 0.6,
  },

  buttonText: {
    fontSize: 14,
    fontWeight: '600',
  },

  buttonTextPrimary: {
    color: colors.white,
  },

  buttonTextSecondary: {
    color: colors.textSecondary,
  },

  buttonTextOutline: {
    color: colors.primary,
  },

  buttonLarge: {
    paddingVertical: 16,
    paddingHorizontal: 24,
  },

  buttonSmall: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },

  // 배지 스타일
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },

  badgeSuccess: {
    backgroundColor: colors.greenLight,
  },

  badgeWarning: {
    backgroundColor: colors.yellowLight,
  },

  badgeDanger: {
    backgroundColor: '#fef2f2',
  },

  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },

  badgeTextSuccess: {
    color: colors.primary,
  },

  badgeTextWarning: {
    color: '#d97706',
  },

  badgeTextDanger: {
    color: colors.danger,
  },

  // 레이아웃 스타일
  row: {
    flexDirection: 'row',
  },

  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  rowCenter: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  column: {
    flexDirection: 'column',
  },

  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  flex1: {
    flex: 1,
  },

  // 간격 스타일
  marginBottom8: {
    marginBottom: 8,
  },

  marginBottom12: {
    marginBottom: 12,
  },

  marginBottom16: {
    marginBottom: 16,
  },

  marginBottom20: {
    marginBottom: 20,
  },

  marginBottom24: {
    marginBottom: 24,
  },

  marginTop8: {
    marginTop: 8,
  },

  marginTop16: {
    marginTop: 16,
  },

  gap4: {
    gap: 4,
  },

  gap8: {
    gap: 8,
  },

  gap12: {
    gap: 12,
  },

  gap16: {
    gap: 16,
  },
});

// 탭 관련 스타일
export const tabStyles = StyleSheet.create({
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.gray100,
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
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },

  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },

  activeTabText: {
    color: colors.white,
  },
});

// 게이지 관련 스타일
export const gaugeStyles = StyleSheet.create({
  gaugeContainer: {
    marginBottom: 20,
  },

  gaugeBackground: {
    height: 24,
    backgroundColor: colors.gray100,
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

  gaugeLabelText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
  },
});

// 통계 관련 스타일
export const statsStyles = StyleSheet.create({
  statsGrid: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },

  statCard: {
    flex: 1,
    backgroundColor: colors.gray50,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },

  statHighlight: {
    flex: 1,
    backgroundColor: colors.grayLight,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: colors.secondary,
  },

  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 4,
  },

  statMainValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 4,
  },

  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },

  statMainLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
  },
});

// 모달 관련 스타일
export const modalStyles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: colors.transparentBlack,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },

  container: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxWidth: 400,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },

  containerSmall: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    width: '80%',
    maxWidth: 320,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },

  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 16,
    textAlign: 'center',
  },

  message: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 20,
  },

  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },

  buttonFlex: {
    flex: 1,
  },

  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 8,
    borderRadius: 20,
    backgroundColor: colors.gray100,
  },

  closeButtonText: {
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: 'bold',
  },
});

// 입력 필드 관련 스타일
export const inputStyles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },

  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 8,
  },

  input: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray200,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 14,
    color: colors.textPrimary,
  },

  inputFocused: {
    borderColor: colors.primary,
    borderWidth: 2,
  },

  inputError: {
    borderColor: colors.danger,
  },

  errorText: {
    fontSize: 12,
    color: colors.danger,
    marginTop: 4,
  },

  helperText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
});