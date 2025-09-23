import { Alert } from 'react-native';

export interface OCRResult {
  success: boolean;
  text?: string;
  tumblerDetected?: boolean;
  error?: string;
}

class OCRService {
  // 텀블러 관련 키워드들
  private tumblerKeywords = [
    '텀블러', 'tumbler', '컵', 'cup', '다회용', '재사용', '리유저블',
    '에코', 'eco', '환경', 'environment', '지속가능', 'sustainable'
  ];

  // 카페 관련 키워드들 (영수증에서 확인)
  private cafeKeywords = [
    '스타벅스', 'starbucks', '이디야', 'ediya', '투썸', 'twosome',
    '커피빈', 'coffeebean', '빽다방', 'paik', '카페', 'cafe', '커피', 'coffee'
  ];

  /**
   * 이미지에서 텍스트를 추출하고 텀블러 사용 여부를 판단합니다.
   * 실제 구현에서는 Google ML Kit, Tesseract.js 등을 사용할 수 있습니다.
   */
  async extractTextFromImage(imageUri: string): Promise<OCRResult> {
    try {
      // 실제 구현에서는 여기서 OCR 라이브러리를 사용하여 텍스트 추출
      // 여기서는 시뮬레이션으로 구현
      
      // 시뮬레이션: 랜덤하게 텀블러 감지 결과 반환
      const isTumblerDetected = Math.random() > 0.3; // 70% 확률로 텀블러 감지
      
      if (isTumblerDetected) {
        return {
          success: true,
          text: '텀블러 사용 확인됨',
          tumblerDetected: true,
        };
      } else {
        return {
          success: true,
          text: '텀블러가 감지되지 않음',
          tumblerDetected: false,
        };
      }
    } catch (error) {
      console.error('OCR processing error:', error);
      return {
        success: false,
        error: '이미지 처리 중 오류가 발생했습니다.',
      };
    }
  }

  /**
   * 텍스트에서 텀블러 관련 키워드를 검색합니다.
   */
  private searchTumblerKeywords(text: string): boolean {
    const lowerText = text.toLowerCase();
    return this.tumblerKeywords.some(keyword => 
      lowerText.includes(keyword.toLowerCase())
    );
  }

  /**
   * 텍스트에서 카페 관련 키워드를 검색합니다.
   */
  private searchCafeKeywords(text: string): boolean {
    const lowerText = text.toLowerCase();
    return this.cafeKeywords.some(keyword => 
      lowerText.includes(keyword.toLowerCase())
    );
  }

  /**
   * 영수증 이미지에서 텀블러 사용을 확인합니다.
   */
  async verifyTumblerFromReceipt(imageUri: string): Promise<OCRResult> {
    try {
      const ocrResult = await this.extractTextFromImage(imageUri);
      
      if (!ocrResult.success) {
        return ocrResult;
      }

      const text = ocrResult.text || '';
      const hasTumblerKeyword = this.searchTumblerKeywords(text);
      const hasCafeKeyword = this.searchCafeKeywords(text);

      // 카페 영수증이면서 텀블러 키워드가 있는 경우
      const tumblerDetected = hasCafeKeyword && hasTumblerKeyword;

      return {
        success: true,
        text: ocrResult.text,
        tumblerDetected,
      };
    } catch (error) {
      console.error('Tumbler verification error:', error);
      return {
        success: false,
        error: '텀블러 인증 중 오류가 발생했습니다.',
      };
    }
  }

  /**
   * 카메라 권한을 요청합니다.
   */
  async requestCameraPermission(): Promise<boolean> {
    try {
      // 실제 구현에서는 react-native-permissions를 사용
      // 여기서는 시뮬레이션
      return true;
    } catch (error) {
      console.error('Camera permission error:', error);
      return false;
    }
  }

  /**
   * 갤러리 권한을 요청합니다.
   */
  async requestGalleryPermission(): Promise<boolean> {
    try {
      // 실제 구현에서는 react-native-permissions를 사용
      // 여기서는 시뮬레이션
      return true;
    } catch (error) {
      console.error('Gallery permission error:', error);
      return false;
    }
  }

  /**
   * 텀블러 인증을 위한 가이드 메시지를 반환합니다.
   */
  getTumblerVerificationGuide(): string[] {
    return [
      '카페에서 텀블러를 사용한 영수증을 촬영해주세요.',
      '영수증에 "텀블러", "다회용", "리유저블" 등의 키워드가 포함되어야 합니다.',
      '명확하고 선명한 사진을 촬영해주세요.',
      '영수증의 텍스트가 잘 보이도록 촬영해주세요.',
    ];
  }
}

export const ocrService = new OCRService();

