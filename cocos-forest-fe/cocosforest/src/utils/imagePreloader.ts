import { Image } from 'react-native';
import { COCO_GIFS } from './cocoGifSelector';

/**
 * 이미지 프리로딩을 위한 유틸리티
 */
class ImagePreloader {
  private preloadedImages = new Set<string>();

  /**
   * 단일 이미지 프리로드
   */
  async preloadImage(source: any): Promise<void> {
    return new Promise((resolve, reject) => {
      // require()로 로드된 이미지는 number 타입이므로 prefetch가 불가능
      if (typeof source === 'number') {
        // require() 이미지는 이미 번들에 포함되어 있으므로 즉시 resolve
        resolve();
        return;
      }

      // URI 형태의 이미지만 prefetch
      if (source && typeof source === 'string') {
        Image.prefetch(source)
          .then(() => {
            this.preloadedImages.add(source);
            resolve();
          })
          .catch(reject);
      } else if (source && source.uri) {
        Image.prefetch(source.uri)
          .then(() => {
            this.preloadedImages.add(source.uri);
            resolve();
          })
          .catch(reject);
      } else {
        resolve();
      }
    });
  }

  /**
   * 여러 이미지 동시 프리로드
   */
  async preloadImages(sources: any[]): Promise<void> {
    const promises = sources.map(source =>
      this.preloadImage(source).catch(console.warn)
    );

    await Promise.allSettled(promises);
  }

  /**
   * 코코 GIF들 프리로드
   */
  async preloadCocoGifs(): Promise<void> {
    const gifSources = Object.values(COCO_GIFS);
    await this.preloadImages(gifSources);
  }

  /**
   * 프리로드 상태 확인
   */
  isPreloaded(source: string): boolean {
    return this.preloadedImages.has(source);
  }

  /**
   * 캐시 클리어
   */
  clearCache(): void {
    this.preloadedImages.clear();
  }
}

export const imagePreloader = new ImagePreloader();

/**
 * 이미지 프리로딩 훅
 */
export const useImagePreloader = () => {
  const preloadCocoGifs = async () => {
    try {
      await imagePreloader.preloadCocoGifs();
    } catch (error) {
      console.warn('이미지 프리로딩 실패:', error);
    }
  };

  return {
    preloadCocoGifs,
    preloadImage: imagePreloader.preloadImage.bind(imagePreloader),
    preloadImages: imagePreloader.preloadImages.bind(imagePreloader),
    isPreloaded: imagePreloader.isPreloaded.bind(imagePreloader),
  };
};