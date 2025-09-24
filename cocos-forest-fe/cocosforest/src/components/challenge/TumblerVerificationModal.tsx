import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
  Linking,
  Platform,
  Dimensions,
} from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { ocrService } from '../../services/ocrService';

interface TumblerVerificationModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onFailure?: () => void;
}

const TumblerVerificationModal: React.FC<TumblerVerificationModalProps> = ({
  visible,
  onClose,
  onSuccess,
  onFailure,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [facing, setFacing] = useState<CameraType>('back');
  const [hasPhotoTaken, setHasPhotoTaken] = useState(false); // 실제 사진 촬영 여부 추적
  
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);

  // 카메라 권한 상태 확인 및 모달 열릴 때 상태 초기화
  useEffect(() => {
    if (visible) {
      checkCameraPermission();
      // 모달이 열릴 때 상태 초기화
      setSelectedImage(null);
      setHasPhotoTaken(false);
    }
  }, [visible]);

  const checkCameraPermission = async () => {
    try {
      // 에뮬레이터 환경 감지
      const isEmulator = __DEV__ && Platform.OS === 'android';
      
      if (isEmulator) {
        console.log('📱 에뮬레이터 환경에서 카메라 권한 확인');
        // 에뮬레이터에서는 카메라 권한을 항상 허용으로 처리
        return;
      }
      
      if (!permission?.granted) {
        await requestPermission();
      }
    } catch (error) {
      console.error('Camera permission error:', error);
    }
  };

  // 설정으로 이동하는 함수
  const openSettings = () => {
    Alert.alert(
      '카메라 권한 필요',
      '텀블러 인증을 위해 카메라 권한이 필요합니다. 설정에서 카메라 권한을 허용해주세요.',
      [
        { text: '취소', style: 'cancel' },
        { 
          text: '설정으로 이동', 
          onPress: () => {
            if (Platform.OS === 'ios') {
              Linking.openURL('app-settings:');
            } else {
              Linking.openSettings();
            }
          }
        }
      ]
    );
  };

  // 카메라로 직접 촬영
  const handleTakePhoto = async () => {
    try {
      // 에뮬레이터 환경 감지
      const isEmulator = __DEV__ && Platform.OS === 'android';
      
      if (isEmulator) {
        console.log('📱 에뮬레이터 환경에서 카메라 시뮬레이션');
        
        // 에뮬레이터에서는 카메라 대신 시뮬레이션된 이미지 사용
        Alert.alert(
          '에뮬레이터 모드',
          '에뮬레이터에서는 카메라 대신 시뮬레이션된 이미지를 사용합니다.',
          [
            { 
              text: '시뮬레이션 이미지 사용', 
              onPress: () => {
                setSelectedImage('emulator_simulated_image.jpg');
                setHasPhotoTaken(true); // 에뮬레이터 시뮬레이션도 사진 촬영으로 간주
              }
            },
            { text: '취소', style: 'cancel' }
          ]
        );
        return;
      }

      if (!permission?.granted) {
        const permissionResult = await requestPermission();
        if (!permissionResult.granted) {
          openSettings();
          return;
        }
      }

      setShowCamera(true);
    } catch (error) {
      console.error('Camera error:', error);
      Alert.alert('오류', '카메라를 열 수 없습니다.');
    }
  };

  // 카메라에서 사진 촬영
  const takePicture = async () => {
    try {
      if (!cameraRef.current) return;

      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
      });

      setSelectedImage(photo.uri);
      setHasPhotoTaken(true); // 실제 사진 촬영 완료
      setShowCamera(false);
      console.log('📷 사진 촬영 완료:', photo.uri);
    } catch (error) {
      console.error('Take photo error:', error);
      Alert.alert('오류', '사진 촬영 중 오류가 발생했습니다.');
    }
  };

  // 카메라 닫기
  const closeCamera = () => {
    setShowCamera(false);
  };



  const handleVerifyTumbler = async () => {
    // 사진이 선택되지 않았거나 실제로 촬영되지 않은 경우
    if (!selectedImage || !hasPhotoTaken) {
      Alert.alert('알림', '먼저 영수증을 촬영해주세요.');
      return;
    }

    setIsProcessing(true);
    try {
      const result = await ocrService.verifyTumblerFromReceipt(selectedImage);
      
      if (result.success && result.tumblerDetected) {
        const pointsText = result.points ? `${result.points}포인트` : '포인트';
        console.log('✅ 텀블러 인증 성공:', {
          points: result.points,
          userChallengeId: result.userChallengeId,
          reason: result.reason
        });
        
        Alert.alert(
          '인증 성공!',
          `텀블러 사용이 확인되었습니다. ${pointsText}를 획득했습니다!`,
          [
            {
              text: '확인',
              onPress: () => {
                console.log('🔄 텀블러 인증 성공 콜백 호출');
                onSuccess();
                onClose();
              }
            }
          ]
        );
      } else if (result.success && !result.tumblerDetected) {
        Alert.alert(
          '인증 실패',
          result.reason || '텀블러 사용이 확인되지 않았습니다. 텀블러를 사용한 영수증을 다시 촬영해주세요.',
        [
          { 
            text: '다시 시도', 
            onPress: () => {
              setSelectedImage(null);
              setHasPhotoTaken(false); // 사진 촬영 상태도 초기화
              onFailure?.(); // 실패 콜백 호출
            }
          },
          { text: '취소', style: 'cancel', onPress: onClose }
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

  // 카메라 권한이 없을 때
  if (showCamera && !permission?.granted) {
    return (
      <Modal
        visible={showCamera}
        animationType="slide"
        onRequestClose={closeCamera}
      >
        <View style={styles.cameraContainer}>
          <View style={styles.permissionContainer}>
            <Text style={styles.permissionTitle}>카메라 권한이 필요합니다</Text>
            <Text style={styles.permissionText}>
              텀블러 인증을 위해 카메라 권한을 허용해주세요.
            </Text>
            <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
              <Text style={styles.permissionButtonText}>권한 허용</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={closeCamera}>
              <Text style={styles.cancelButtonText}>취소</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  // 카메라 화면이 표시될 때
  if (showCamera && permission?.granted) {
    return (
      <Modal
        visible={showCamera}
        animationType="slide"
        onRequestClose={closeCamera}
      >
        <View style={styles.cameraContainer}>
          <CameraView
            ref={cameraRef}
            style={styles.camera}
            facing={facing}
          />
          
          <View style={styles.cameraControls}>
            <TouchableOpacity style={styles.cameraButton} onPress={closeCamera}>
              <Text style={styles.cameraButtonText}>✕</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
              <View style={styles.captureButtonInner} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.cameraButton} 
              onPress={() => setFacing(current => (current === 'back' ? 'front' : 'back'))}
            >
              <Text style={styles.cameraButtonText}>🔄</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.cameraGuide}>
            <Text style={styles.cameraGuideText}>영수증을 화면에 맞춰 촬영해주세요</Text>
          </View>
        </View>
      </Modal>
    );
  }

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
            
            {/* 에뮬레이터 환경 안내 */}
            {__DEV__ && Platform.OS === 'android' && (
              <View style={styles.emulatorNotice}>
                <Text style={styles.emulatorNoticeTitle}>📱 에뮬레이터 모드</Text>
                <Text style={styles.emulatorNoticeText}>
                  에뮬레이터에서는 실제 카메라 대신 시뮬레이션된 이미지를 사용합니다.
                </Text>
              </View>
            )}
          </ScrollView>

          <View style={styles.imageContainer}>
            {selectedImage ? (
              <View style={styles.imagePreview}>
                <Text style={styles.imageText}>영수증 사진이 선택되었습니다</Text>
                <TouchableOpacity 
                  style={styles.changeImageButton}
                  onPress={() => {
                    setSelectedImage(null);
                    setHasPhotoTaken(false); // 사진 촬영 상태도 초기화
                  }}
                >
                  <Text style={styles.changeImageText}>다시 선택</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.imagePlaceholder}>
                <Text style={styles.placeholderText}>영수증을 촬영해주세요</Text>
              </View>
            )}
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.primaryButton]}
              onPress={handleTakePhoto}
              disabled={isProcessing}
            >
              <Text style={styles.actionButtonText}>📷 영수증 촬영하기</Text>
            </TouchableOpacity>
          </View>

          {selectedImage && hasPhotoTaken && (
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

          {(!selectedImage || !hasPhotoTaken) && (
            <View style={styles.disabledVerifyButton}>
              <Text style={styles.disabledVerifyButtonText}>
                먼저 영수증을 촬영해주세요
              </Text>
            </View>
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
    marginBottom: 20,
  },
  actionButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
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
  disabledVerifyButton: {
    backgroundColor: '#f5f5f5',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  disabledVerifyButtonText: {
    color: '#999',
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
  // 카메라 관련 스타일
  cameraContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  cameraControls: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  cameraButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  captureButton: {
    backgroundColor: '#fff',
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  captureButtonInner: {
    backgroundColor: '#007AFF',
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  placeholder: {
    width: 50,
    height: 50,
  },
  cameraGuide: {
    position: 'absolute',
    top: 100,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 15,
    borderRadius: 10,
  },
  cameraGuideText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '500',
  },
  // 주요 버튼 스타일
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  // 에뮬레이터 안내 스타일
  emulatorNotice: {
    backgroundColor: '#fff3cd',
    borderColor: '#ffeaa7',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginTop: 10,
  },
  emulatorNoticeTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#856404',
    marginBottom: 4,
  },
  emulatorNoticeText: {
    fontSize: 12,
    color: '#856404',
    lineHeight: 16,
  },
  // 권한 관련 스타일
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#000',
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
    textAlign: 'center',
  },
  permissionText: {
    fontSize: 16,
    color: '#ccc',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  permissionButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 8,
    marginBottom: 16,
  },
  permissionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default TumblerVerificationModal;

