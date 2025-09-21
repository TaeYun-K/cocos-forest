// src/utils/cocoGifSelector.ts

// GIF 파일 경로들
const COCO_GIFS = {
  SMILE: require('../../assets/dashboard/coco-init-unscreen.gif'),
  SAD: require('../../assets/dashboard/coco-sad-unscreen.gif'),
  INIT: require('../../assets/dashboard/coco-init-unscreen.gif'),
} as const;

// 탄소배출량 임계값 설정
const EMISSION_THRESHOLDS = {
  LOW: 0.4,
  AVERAGE: 0.8,
} as const;

/**
 * 탄소배출량에 따라 적절한 코코 GIF를 선택합니다
 *
 * @description
 * 일일 탄소배출량을 기준으로 다음과 같이 GIF를 선택합니다:
 * - 0.4kg 미만: 웃는 코코 (SMILE) - 낮은 배출량
 * - 0.4kg-평균: 기본 코코 (INIT) - 보통 배출량
 * - 평균 초과: 슬픈 코코 (SAD) - 높은 배출량
 *
 * @param carbonEmission - 일일 탄소배출량 (kg), 기본값 0.5
 * @param averageEmission - 평균 탄소배출량 (kg), 기본값 0.8
 * @returns 선택된 GIF 리소스 (require()로 로드된 이미지)
 *
 * @example
 * ```typescript
 * // 낮은 배출량 - 웃는 코코
 * const happyGif = selectCocoGif(0.3);
 *
 * // 높은 배출량 - 슬픈 코코
 * const sadGif = selectCocoGif(1.2, 0.8);
 *
 * // 보통 배출량 - 기본 코코
 * const normalGif = selectCocoGif(0.6, 0.8);
 * ```
 */
export const selectCocoGif = (
  carbonEmission: number = 0.5,
  averageEmission: number = EMISSION_THRESHOLDS.AVERAGE
) => {
  if (carbonEmission < EMISSION_THRESHOLDS.LOW) {
    return COCO_GIFS.SMILE; // 저배출: 웃는 코코
  }

  if (carbonEmission > averageEmission) {
    return COCO_GIFS.SAD; // 고배출: 슬픈 코코
  }

  return COCO_GIFS.INIT; // 중간: 기본 코코
};

/**
 * 탄소배출량 상태를 문자열로 반환합니다
 * @param carbonEmission - 일일 탄소배출량 (kg)
 * @param averageEmission - 평균 탄소배출량 (kg)
 * @returns 배출량 상태 ('low' | 'high' | 'normal')
 */
export const getCarbonEmissionStatus = (
  carbonEmission: number = 0.5,
  averageEmission: number = EMISSION_THRESHOLDS.AVERAGE
): 'low' | 'high' | 'normal' => {
  if (carbonEmission < EMISSION_THRESHOLDS.LOW) {
    return 'low';
  }

  if (carbonEmission > averageEmission) {
    return 'high';
  }

  return 'normal';
};

export { COCO_GIFS, EMISSION_THRESHOLDS };