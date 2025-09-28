# TIL - 2025년 9월 25일

## OCR API를 위한 이미지 전처리 과정

### 이미지 압축 및 리사이징

```typescript
import * as ImageManipulator from 'expo-image-manipulator';

const compressImage = async (imageUri: string): Promise<string> => {
  try {
    console.log('🔄 이미지 압축 시작:', imageUri);

    const compressedImage = await ImageManipulator.manipulateAsync(
      imageUri,
      [
        { resize: { width: 1024, height: 1024 } }, // 최대 1024x1024로 리사이징
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
    return imageUri; // 압축 실패 시 원본 반환
  }
};
```

### FormData로 이미지 전송 준비

```typescript
const prepareImageForUpload = (compressedImageUri: string) => {
  const formData = new FormData();

  // React Native에서 실제 파일 업로드를 위한 올바른 형식
  const fileData = {
    uri: compressedImageUri,
    type: 'image/jpeg',
    name: 'receipt.jpg',
  };

  formData.append('file', fileData as any);
  return formData;
};
```

### OCR API 호출

```typescript
const callOcrApi = async (imageUri: string) => {
  try {
    // 1. 이미지 압축
    const compressedImageUri = await compressImage(imageUri);

    // 2. FormData 준비
    const formData = prepareImageForUpload(compressedImageUri);

    // 3. API 호출
    const response = await axiosInstance.post('/api/ocr/analyze', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 30000, // OCR 처리 시간 고려하여 타임아웃 증가
    });

    return response.data;
  } catch (error) {
    if (error.response?.status === 413) {
      throw new Error('이미지 파일 크기가 너무 큽니다.');
    }
    throw error;
  }
};
```

### 이미지 품질 최적화 팁

```typescript
// 해상도별 압축 설정
const getCompressionSettings = (originalWidth: number, originalHeight: number) => {
  const maxDimension = Math.max(originalWidth, originalHeight);

  if (maxDimension > 2048) {
    return { resize: { width: 1024 }, compress: 0.6 };
  } else if (maxDimension > 1024) {
    return { resize: { width: 800 }, compress: 0.7 };
  } else {
    return { compress: 0.8 }; // 리사이징 없이 압축만
  }
};
```

## 느낀점

OCR API 사용을 위한 이미지 전처리가 생각보다 중요하다는 것을 깨달았다. 이미지 크기가 너무 크면 업로드 실패하고, 너무 작으면 OCR 정확도가 떨어지기 때문에 적절한 균형을 찾는 것이 핵심이었다. expo-image-manipulator를 활용한 압축과 리사이징으로 API 호출 성공률을 크게 향상시킬 수 있었다.