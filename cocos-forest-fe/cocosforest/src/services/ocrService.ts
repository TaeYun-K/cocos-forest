import { Alert } from 'react-native';
import * as ImageManipulator from 'expo-image-manipulator';
import { axiosInstance } from '../api/axios';

export interface OCRResult {
  success: boolean;
  text?: string;
  tumblerDetected?: boolean;
  error?: string;
  awarded?: boolean;
  points?: number;
  userChallengeId?: number;
  reason?: string;
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
   * 이미지를 압축합니다 (파일 크기 제한 해결)
   */
  private async compressImage(imageUri: string): Promise<string> {
    try {
      console.log('🔄 이미지 압축 시작:', imageUri);

      const compressedImage = await ImageManipulator.manipulateAsync(
        imageUri,
        [
          { resize: { width: 1024, height: 1024 } }, // 최대 1024x1024로 리사이즈
        ],
        {
          compress: 0.7, // 70% 품질로 압축
          format: ImageManipulator.SaveFormat.JPEG,
        }
      );

      console.log('✅ 이미지 압축 완료:', compressedImage.uri);
      return compressedImage.uri;
    } catch (error) {
      console.error('❌ 이미지 압축 실패:', error);
      // 압축 실패 시 원본 반환
      return imageUri;
    }
  }

  /**
   * 영수증 이미지에서 텀블러 사용을 확인합니다. (실제 API 호출)
   */
  async verifyTumblerFromReceipt(imageUri: string): Promise<OCRResult> {
    try {
      console.log('📤 텀블러 OCR 인증 API 호출:', imageUri);

      // 이미지 압축
      const compressedImageUri = await this.compressImage(imageUri);

      // FormData 생성
      const formData = new FormData();

      // React Native에서 실제 파일 업로드를 위한 올바른 형식
      const fileData = {
        uri: compressedImageUri,
        type: 'image/jpeg',
        name: 'receipt.jpg',
      };

      formData.append('file', fileData as any);

      // API 호출 (Content-Type을 명시적으로 삭제하여 브라우저가 자동으로 설정하도록 함)
      const response = await axiosInstance.post('/api/challenges/tumbler/verify', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        transformRequest: (data) => {
          return data;
        },
      });

      console.log('✅ 텀블러 OCR 인증 API 응답:', response.data);

      if (response.data.isSuccess && response.data.result) {
        const result = response.data.result;

        if (result.success) {
          return {
            success: true,
            tumblerDetected: true,
            awarded: result.awarded,
            points: result.points,
            userChallengeId: result.userChallengeId,
            reason: result.reason,
            text: result.reason,
          };
        } else {
          return {
            success: false,
            tumblerDetected: false,
            error: result.reason || '텀블러가 감지되지 않았습니다. 텀블러가 포함된 영수증을 다시 촬영해주세요.',
          };
        }
      } else {
        return {
          success: false,
          error: response.data.message || '서버에서 오류가 발생했습니다.',
        };
      }
    } catch (error: any) {
      console.error('❌ 텀블러 OCR 인증 오류:', error);

      // 네트워크 오류 처리
      if (error.response) {
        const status = error.response.status;
        const message = error.response.data?.message || '서버 오류가 발생했습니다.';

        // 413 오류 (파일 크기 초과) 특별 처리
        if (status === 413) {
          return {
            success: false,
            error: '이미지 파일 크기가 너무 큽니다. 더 작은 이미지를 업로드해주세요.',
          };
        }

        return {
          success: false,
          error: `서버 오류 (${status}): ${message}`,
        };
      } else if (error.request) {
        return {
          success: false,
          error: '네트워크 연결을 확인해주세요.',
        };
      } else {
        return {
          success: false,
          error: '인증 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
        };
      }
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