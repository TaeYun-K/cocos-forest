// src/utils/cocoGifSelector.ts

// GIF 파일 경로들
const COCO_GIFS = {
  SMILE: require('../../assets/dashboard/coco-smile-unscreen.gif'),
  SAD: require('../../assets/dashboard/coco-sad-unscreen.gif'),
} as const;

// 탄소배출량 임계값 설정
const EMISSION_THRESHOLDS = {
  AVERAGE: 26.02,
} as const;

/**
 * 탄소배출량에 따라 적절한 코코 GIF를 선택합니다
 *
 * @description
 * 일일 탄소배출량을 기준으로 다음과 같이 GIF를 선택합니다:
 * - 평균(26.02kg) 초과: 슬픈 코코 (SAD)
 * - 평균(26.02kg) 이하: 웃는 코코 (SMILE)
 *
 * @param carbonEmission - 일일 탄소배출량 (kg), 기본값 0.5
 * @param averageEmission - 평균 탄소배출량 (kg), 기본값 26.02
 * @returns 선택된 GIF 리소스 (require()로 로드된 이미지)
 *
 * @example
 * ```typescript
 * // 높은 배출량 - 슬픈 코코
 * const sadGif = selectCocoGif(30.0, 26.02);
 *
 * // 낮은 배출량 - 웃는 코코
 * const happyGif = selectCocoGif(20.0, 26.02);
 * ```
 */
export const selectCocoGif = (
  carbonEmission: number = 0.5,
  averageEmission: number = EMISSION_THRESHOLDS.AVERAGE
) => {
  if (carbonEmission > averageEmission) {
    return COCO_GIFS.SAD; // 평균 초과: 슬픈 코코
  }

  return COCO_GIFS.SMILE; // 평균 이하: 웃는 코코
};

/**
 * 탄소배출량 상태를 문자열로 반환합니다
 * @param carbonEmission - 일일 탄소배출량 (kg)
 * @param averageEmission - 평균 탄소배출량 (kg)
 * @returns 배출량 상태 ('high' | 'normal')
 */
export const getCarbonEmissionStatus = (
  carbonEmission: number = 0.5,
  averageEmission: number = EMISSION_THRESHOLDS.AVERAGE
): 'high' | 'normal' => {
  if (carbonEmission > averageEmission) {
    return 'high';
  }

  return 'normal';
};

export { COCO_GIFS, EMISSION_THRESHOLDS };