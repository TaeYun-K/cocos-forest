// src/constants/dashboardStyles.ts

/**
 * 대시보드 관련 스타일 상수들
 */
export const DASHBOARD_STYLE_CONSTANTS = {
  // 코코 GIF 이미지 크기
  COCO_GIF: {
    WIDTH: 600,
    HEIGHT: 600,
  },

  // 섹션 마진값들
  SECTION_MARGINS: {
    AI_ANALYSIS_BOTTOM: -155,
    COCO_GIF_TOP: 0,
    TODAY_EMISSION_TOP: -180,
  },

  // 패딩값들
  SECTION_PADDING: {
    VERTICAL: 0,
  },
} as const;

/**
 * 카테고리별 색상 팔레트
 */
export const CATEGORY_COLORS = [
  '#ef4444', // 빨간색
  '#f97316', // 주황색
  '#eab308', // 노란색
  '#22c55e', // 초록색
  '#3b82f6', // 파란색
  '#8b5cf6', // 보라색
  '#ec4899', // 분홍색
  '#06b6d4', // 청록색
  '#84cc16', // 라임색
  '#f59e0b', // 호박색
] as const;

/**
 * 색상 인덱스를 기반으로 카테고리 색상을 반환합니다
 * @param index - 카테고리 인덱스
 * @returns 해당하는 색상
 */
export const getCategoryColor = (index: number): string => {
  return CATEGORY_COLORS[index % CATEGORY_COLORS.length];
};