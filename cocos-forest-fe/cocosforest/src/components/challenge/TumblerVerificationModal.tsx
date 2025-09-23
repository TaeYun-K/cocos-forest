import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
} from 'react-native';
import { ocrService } from '../../services/ocrService';

interface TumblerVerificationModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const TumblerVerificationModal: React.FC<TumblerVerificationModalProps> = ({
  visible,
  onClose,
  onSuccess,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleTakePhoto = async () => {
    try {
      const hasPermission = await ocrService.requestCameraPermission();
      if (!hasPermission) {
        Alert.alert('권한 필요', '카메라 권한이 필요합니다.');
        return;
      }

      // 실제 구현에서는 카메라를 열어서 사진을 촬영
      // 여기서는 시뮬레이션
      Alert.alert(
        '사진 촬영',
        '카메라를 열어 영수증을 촬영하세요.',
        [
          { text: '취소', style: 'cancel' },
          { 
            text: '촬영 완료', 
            onPress: () => {
              // 시뮬레이션: 가상의 이미지 URI 설정
              setSelectedImage('simulated_receipt_image.jpg');
            }
          }
        ]
      );
    } catch (error) {
      console.error('Camera error:', error);
      Alert.alert('오류', '카메라를 열 수 없습니다.');
    }
  };

  const handleSelectFromGallery = async () => {
    try {
      const hasPermission = await ocrService.requestGalleryPermission();
      if (!hasPermission) {
        Alert.alert('권한 필요', '갤러리 권한이 필요합니다.');
        return;
      }

      // 실제 구현에서는 갤러리에서 이미지를 선택
      // 여기서는 시뮬레이션
      Alert.alert(
        '갤러리에서 선택',
        '갤러리에서 영수증 사진을 선택하세요.',
        [
          { text: '취소', style: 'cancel' },
          { 
            text: '선택 완료', 
            onPress: () => {
              // 시뮬레이션: 가상의 이미지 URI 설정
              setSelectedImage('simulated_gallery_image.jpg');
            }
          }
        ]
      );
    } catch (error) {
      console.error('Gallery error:', error);
      Alert.alert('오류', '갤러리를 열 수 없습니다.');
    }
  };

  const handleVerifyTumbler = async () => {
    if (!selectedImage) {
      Alert.alert('알림', '먼저 영수증 사진을 선택해주세요.');
      return;
    }

    setIsProcessing(true);
    try {
      const result = await ocrService.verifyTumblerFromReceipt(selectedImage);
      
      if (result.success && result.tumblerDetected) {
        Alert.alert(
          '인증 성공!',
          '텀블러 사용이 확인되었습니다. 400포인트를 획득했습니다!',
          [
            {
              text: '확인',
              onPress: () => {
                onSuccess();
                onClose();
              }
            }
          ]
        );
      } else if (result.success && !result.tumblerDetected) {
        Alert.alert(
          '인증 실패',
          '텀블러 사용이 확인되지 않았습니다. 텀블러를 사용한 영수증을 다시 촬영해주세요.',
          [
            { text: '다시 시도', onPress: () => setSelectedImage(null) },
            { text: '취소', style: 'cancel' }
          ]
        );
      } else {
        Alert.alert('오류', result.error || '인증 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('Verification error:', error);
      Alert.alert('오류', '인증 중 오류가 발생했습니다.');
    } finally {
      setIsProcessing(false);
    }
  };

  const guideSteps = ocrService.getTumblerVerificationGuide();

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>텀블러 인증</Text>
          
          <ScrollView style={styles.guideContainer}>
            <Text style={styles.guideTitle}>인증 방법</Text>
            {guideSteps.map((step, index) => (
              <Text key={index} style={styles.guideStep}>
                {index + 1}. {step}
              </Text>
            ))}
          </ScrollView>

          <View style={styles.imageContainer}>
            {selectedImage ? (
              <View style={styles.imagePreview}>
                <Text style={styles.imageText}>영수증 사진이 선택되었습니다</Text>
                <TouchableOpacity 
                  style={styles.changeImageButton}
                  onPress={() => setSelectedImage(null)}
                >
                  <Text style={styles.changeImageText}>다시 선택</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.imagePlaceholder}>
                <Text style={styles.placeholderText}>영수증 사진을 선택해주세요</Text>
              </View>
            )}
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={handleTakePhoto}
              disabled={isProcessing}
            >
              <Text style={styles.actionButtonText}>📷 사진 촬영</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={handleSelectFromGallery}
              disabled={isProcessing}
            >
              <Text style={styles.actionButtonText}>🖼️ 갤러리에서 선택</Text>
            </TouchableOpacity>
          </View>

          {selectedImage && (
            <TouchableOpacity 
              style={[styles.verifyButton, isProcessing && styles.verifyButtonDisabled]}
              onPress={handleVerifyTumbler}
              disabled={isProcessing}
            >
              <Text style={styles.verifyButtonText}>
                {isProcessing ? '인증 중...' : '텀블러 인증하기'}
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={onClose}
            disabled={isProcessing}
          >
            <Text style={styles.cancelButtonText}>취소</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 20,
    maxHeight: '80%',
    width: '90%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 20,
  },
  guideContainer: {
    marginBottom: 20,
  },
  guideTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 10,
  },
  guideStep: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 5,
  },
  imageContainer: {
    marginBottom: 20,
  },
  imagePreview: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 20,
    alignItems: 'center',
  },
  imageText: {
    fontSize: 14,
    color: '#4caf50',
    fontWeight: '500',
    marginBottom: 10,
  },
  changeImageButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  changeImageText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  imagePlaceholder: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 40,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderStyle: 'dashed',
  },
  placeholderText: {
    fontSize: 14,
    color: '#999',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  verifyButton: {
    backgroundColor: '#4caf50',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  verifyButtonDisabled: {
    backgroundColor: '#ccc',
  },
  verifyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default TumblerVerificationModal;

