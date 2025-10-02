import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { colors } from '../../styles/commonStyles';

interface EmailVerificationInputProps {
  email: string;
  verificationCode: string;
  onEmailChange: (value: string) => void;
  onVerificationCodeChange: (value: string) => void;
  onCheckEmailDuplicate: () => void;
  onSendCode: () => void;
  onVerifyCode: () => void;
  isLoading: boolean;
  isEmailDuplicateChecked: boolean;
  isCodeSent: boolean;
  isEmailVerified: boolean;
  emailError?: string;
  codeError?: string;
  timeLeft?: number;
  formatTime?: (seconds: number) => string;
}

export const EmailVerificationInput: React.FC<EmailVerificationInputProps> = ({
  email,
  verificationCode,
  onEmailChange,
  onVerificationCodeChange,
  onCheckEmailDuplicate,
  onSendCode,
  onVerifyCode,
  isLoading,
  isEmailDuplicateChecked,
  isCodeSent,
  isEmailVerified,
  emailError,
  codeError,
  timeLeft = 0,
  formatTime,
}) => {
  return (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>이메일 *</Text>
      <View style={styles.inputWithButton}>
        <View style={[
          styles.inputWrapper,
          { flex: 1, marginRight: 8 },
          emailError && styles.inputWrapperError
        ]}>
          <TextInput
            style={styles.input}
            placeholder="coco@gmail.com"
            placeholderTextColor="#A0A0A0"
            value={email}
            onChangeText={onEmailChange}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>
        <TouchableOpacity
          style={[
            styles.checkButton,
            isEmailDuplicateChecked && styles.checkedButton
          ]}
          onPress={onCheckEmailDuplicate}
          disabled={isLoading || isEmailDuplicateChecked}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={[
              styles.checkButtonText,
              isEmailDuplicateChecked && styles.checkedButtonText
            ]}>
              {isEmailDuplicateChecked ? '확인완료' : '중복확인'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
      {emailError && (
        <Text style={styles.errorText}>{emailError}</Text>
      )}
      {isEmailDuplicateChecked && (
        <Text style={styles.successText}>사용 가능한 이메일입니다.</Text>
      )}

      {isEmailDuplicateChecked && (
        <View style={styles.sendCodeContainer}>
          <TouchableOpacity
            style={[
              styles.sendCodeButton,
              isCodeSent && styles.checkedButton
            ]}
            onPress={onSendCode}
            disabled={isLoading || isEmailVerified}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={[
                styles.checkButtonText,
                isCodeSent && styles.checkedButtonText
              ]}>
                {isEmailVerified ? '인증완료' : isCodeSent ? '재발송' : '인증번호 발송'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      {isCodeSent && !isEmailVerified && (
        <View style={styles.verificationContainer}>
          <View style={[
            styles.inputWrapper,
            styles.verificationInputWrapper,
            codeError && styles.inputWrapperError
          ]}>
            <TextInput
              style={styles.input}
              placeholder="인증번호 6자리를 입력하세요"
              placeholderTextColor="#A0A0A0"
              value={verificationCode}
              onChangeText={onVerificationCodeChange}
              keyboardType="number-pad"
              maxLength={6}
            />
          </View>
          <TouchableOpacity
            style={styles.verifyButton}
            onPress={onVerifyCode}
            disabled={isLoading || timeLeft === 0}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.checkButtonText}>인증확인</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      {isCodeSent && !isEmailVerified && timeLeft > 0 && formatTime && (
        <View style={styles.timerContainer}>
          <Text style={styles.timerText}>
            남은 시간: {formatTime(timeLeft)}
          </Text>
        </View>
      )}

      {codeError && (
        <Text style={styles.errorText}>{codeError}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    color: '#333333',
    marginBottom: 8,
    fontWeight: '500',
  },
  inputWrapper: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    backgroundColor: '#FAFAFA',
  },
  input: {
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
  },
  inputWrapperError: {
    borderColor: '#FF4444',
    backgroundColor: '#FFF8F8',
  },
  inputWithButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
    minHeight: 50,
  },
  checkedButton: {
    backgroundColor: colors.success,
  },
  checkButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  checkedButtonText: {
    color: '#FFFFFF',
  },
  errorText: {
    fontSize: 12,
    color: '#FF4444',
    marginTop: 4,
  },
  verificationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  verificationInputWrapper: {
    flex: 1,
    marginRight: 8,
  },
  verifyButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
    minHeight: 50,
  },
  timerContainer: {
    marginTop: 8,
    alignItems: 'center',
  },
  timerText: {
    fontSize: 14,
    color: '#FF6B35',
    fontWeight: '500',
  },
  successText: {
    fontSize: 12,
    color: colors.success,
    marginTop: 4,
  },
  sendCodeContainer: {
    marginTop: 10,
  },
  sendCodeButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    width: '100%',
  },
});