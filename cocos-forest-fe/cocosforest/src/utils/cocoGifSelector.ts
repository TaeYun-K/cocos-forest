// src/utils/cocoGifSelector.ts

// GIF 파일 경로들
const COCO_GIFS = {
  SMILE: require('../assets/coco-smile-unscreen.gif'),
  SAD: require('../assets/coco-sad-unscreen.gif'),
  INIT: require('../assets/coco-init-unscreen.gif'),
} as const;

// 탄소배출량 임계값 설정
const EMISSION_THRESHOLDS = {
  LOW: 0.4,
  AVERAGE: 0.8,
} as const;

/**
 * 탄소배출량에 따라 적절한 코코 GIF를 선택합니다
 * @param carbonEmission - 일일 탄소배출량 (kg)
 * @param averageEmission - 평균 탄소배출량 (kg), 기본값 0.8
 * @returns 선택된 GIF 리소스
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