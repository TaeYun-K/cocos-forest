import * as React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';

interface ProfileData {
  name: string;
  phone: string;
  nickname: string;
  email: string;
  verificationCode: string;
}

interface ProfileEditModalProps {
  visible: boolean;
  onClose: () => void;
  profileData: ProfileData;
  onInputChange: (field: string, value: string) => void;
  onNicknameCheck: () => void;
  onEmailVerification: () => void;
  onSaveProfile: () => void;
  nicknameError: string;
  nicknameChecked: boolean;
  nicknameAvailable: boolean;
  emailVerificationSent: boolean;
}

const ProfileEditModal: React.FC<ProfileEditModalProps> = ({
  visible,
  onClose,
  profileData,
  onInputChange,
  onNicknameCheck,
  onEmailVerification,
  onSaveProfile,
  nicknameError,
  nicknameChecked,
  nicknameAvailable,
  emailVerificationSent,
}) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>프로필 수정</Text>
          
          <ScrollView style={styles.modalScrollView} showsVerticalScrollIndicator={false}>
            {/* 이름 */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>이름</Text>
              <TextInput
                style={[styles.textInput, styles.disabledInput]}
                value={profileData.name}
                editable={false}
                placeholder="이름을 입력하세요"
              />
            </View>

            {/* 전화번호 */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>전화번호</Text>
              <TextInput
                style={[styles.textInput, styles.disabledInput]}
                value={profileData.phone}
                editable={false}
                placeholder="전화번호를 입력하세요"
                keyboardType="phone-pad"
              />
            </View>

            {/* 닉네임 */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>닉네임</Text>
              <View style={styles.nicknameContainer}>
                <TextInput
                  style={[styles.textInput, styles.nicknameInput]}
                  value={profileData.nickname}
                  onChangeText={(value) => onInputChange('nickname', value)}
                  placeholder="닉네임을 입력하세요"
                />
                <TouchableOpacity style={styles.checkButton} onPress={onNicknameCheck}>
                  <Text style={styles.checkButtonText}>중복확인</Text>
                </TouchableOpacity>
              </View>
              {nicknameChecked && (
                <Text style={[
                  styles.errorText, 
                  nicknameAvailable ? styles.successText : styles.errorText
                ]}>
                  {nicknameError}
                </Text>
              )}
            </View>

            {/* 이메일 */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>이메일</Text>
              <View style={styles.emailContainer}>
                <TextInput
                  style={[styles.textInput, styles.emailInput]}
                  value={profileData.email}
                  onChangeText={(value) => onInputChange('email', value)}
                  placeholder="이메일을 입력하세요"
                  keyboardType="email-address"
                />
                <TouchableOpacity style={styles.verifyButton} onPress={onEmailVerification}>
                  <Text style={styles.verifyButtonText}>인증</Text>
                </TouchableOpacity>
              </View>
              {emailVerificationSent && (
                <Text style={styles.verificationText}>
                  인증코드가 {profileData.email}로 발송되었습니다
                </Text>
              )}
            </View>

            {/* 인증코드 */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>인증코드</Text>
              <TextInput
                style={styles.textInput}
                value={profileData.verificationCode}
                onChangeText={(value) => onInputChange('verificationCode', value)}
                placeholder="인증코드를 입력하세요"
                keyboardType="number-pad"
              />
            </View>
          </ScrollView>

          {/* 버튼들 */}
          <View style={styles.modalButtons}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>취소</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={onSaveProfile}>
              <Text style={styles.saveButtonText}>저장</Text>
            </TouchableOpacity>
          </View>
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
    paddingHorizontal: 20,
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    maxHeight: '85%',
    flex: 1,
  },
  modalScrollView: {
    flex: 1,
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  disabledInput: {
    backgroundColor: '#f5f5f5',
    color: '#999',
    borderColor: '#e0e0e0',
  },
  nicknameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nicknameInput: {
    flex: 1,
    marginRight: 8,
  },
  checkButton: {
    borderWidth: 1,
    borderColor: '#15803d',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  checkButtonText: {
    color: '#15803d',
    fontSize: 14,
    fontWeight: '500',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 12,
    marginTop: 4,
  },
  successText: {
    color: '#15803d',
    fontSize: 12,
    marginTop: 4,
  },
  emailContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emailInput: {
    flex: 1,
    marginRight: 8,
  },
  verifyButton: {
    borderWidth: 1,
    borderColor: '#15803d',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  verifyButtonText: {
    color: '#15803d',
    fontSize: 14,
    fontWeight: '500',
  },
  verificationText: {
    color: '#666',
    fontSize: 12,
    marginTop: 4,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  cancelButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#15803d',
    borderRadius: 8,
    paddingVertical: 12,
    marginRight: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#15803d',
    fontSize: 16,
    fontWeight: '500',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#15803d',
    borderRadius: 8,
    paddingVertical: 12,
    marginLeft: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default ProfileEditModal;

