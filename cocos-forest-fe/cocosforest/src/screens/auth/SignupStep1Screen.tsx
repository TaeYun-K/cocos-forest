import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView, // 추가: 키보드 대응
} from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // 추가: 아이콘
import { authService } from '../../services/authService';
import { SignupStep1Form } from '../../types/auth';

interface SignupStep1ScreenProps {
  navigation: any;
  route: {
    params?: {
      signupData?: any;
    };
  };
}

export const SignupStep1Screen: React.FC<SignupStep1ScreenProps> = ({ navigation, route }) => {
  const [form, setForm] = useState<SignupStep1Form>({
    nickname: route.params?.signupData?.nickname || '',
    email: route.params?.signupData?.email || '',
    verificationCode: route.params?.signupData?.verificationCode || '',
    phoneNumber: route.params?.signupData?.phoneNumber || '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isNicknameChecked, setIsNicknameChecked] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [errors, setErrors] = useState<Partial<SignupStep1Form>>({}); // 추가: 에러 상태

  const handleInputChange = (field: keyof SignupStep1Form, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    
    // 입력 시 에러 초기화
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
    
    // 닉네임이나 이메일이 변경되면 중복확인 상태 초기화
    if (field === 'nickname') {
      setIsNicknameChecked(false);
    }
    if (field === 'email') {
      setIsEmailVerified(false);
      setIsCodeSent(false);
    }
  };

  const checkNicknameDuplicate = async () => {
    if (!form.nickname.trim()) {
      Alert.alert('오류', '닉네임을 입력해주세요.');
      return;
    }

    if (form.nickname.includes(' ')) {
      Alert.alert('오류', '닉네임에는 공백을 포함할 수 없습니다.');
      return;
    }

    try {
      setIsLoading(true);
      const isDuplicate = await authService.checkNicknameDuplicate(form.nickname);
      
      if (isDuplicate) {
        Alert.alert('중복확인', '이미 사용 중인 닉네임입니다.');
        setIsNicknameChecked(false);
      } else {
        Alert.alert('중복확인', '사용 가능한 닉네임입니다.');
        setIsNicknameChecked(true);
      }
    } catch (error) {
      Alert.alert('오류', '닉네임 중복확인에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const sendVerificationCode = async () => {
    if (!form.email.trim()) {
      Alert.alert('오류', '이메일을 입력해주세요.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      Alert.alert('오류', '올바른 이메일 형식을 입력해주세요.');
      return;
    }

    try {
      setIsLoading(true);
      const isDuplicate = await authService.checkEmailDuplicate(form.email);
      
      if (isDuplicate) {
        Alert.alert('오류', '이미 사용 중인 이메일입니다.');
        return;
      }

      await authService.sendVerificationCode(form.email);
      setIsCodeSent(true);
      Alert.alert('인증번호 발송', '이메일로 인증번호가 발송되었습니다.\n(목업: 1234)');
    } catch (error) {
      Alert.alert('오류', '인증번호 발송에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const verifyCode = async () => {
    if (!form.verificationCode.trim()) {
      Alert.alert('오류', '인증번호를 입력해주세요.');
      return;
    }

    try {
      setIsLoading(true);
      const isValid = await authService.verifyCode(form.email, form.verificationCode);
      
      if (isValid) {
        setIsEmailVerified(true);
        Alert.alert('인증완료', '이메일 인증이 완료되었습니다.');
      } else {
        Alert.alert('인증실패', '올바른 인증번호를 입력해주세요.');
      }
    } catch (error) {
      Alert.alert('오류', '인증번호 확인에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 전화번호 포맷팅 함수 추가
  const formatPhoneNumber = (text: string) => {
    const numbers = text.replace(/[^\d]/g, '');
    
    if (numbers.length <= 3) {
      return numbers;
    } else if (numbers.length <= 7) {
      return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    } else {
      return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
    }
  };

  const handlePhoneChange = (text: string) => {
    const formatted = formatPhoneNumber(text);
    handleInputChange('phoneNumber', formatted);
  };

  const handleNext = () => {
    if (!form.nickname.trim()) {
      Alert.alert('오류', '닉네임을 입력해주세요.');
      return;
    }

    if (!isNicknameChecked) {
      Alert.alert('오류', '닉네임 중복확인을 완료해주세요.');
      return;
    }

    if (!form.email.trim()) {
      Alert.alert('오류', '이메일을 입력해주세요.');
      return;
    }

    if (!isEmailVerified) {
      Alert.alert('오류', '이메일 인증을 완료해주세요.');
      return;
    }

    if (!form.phoneNumber.trim()) {
      Alert.alert('오류', '전화번호를 입력해주세요.');
      return;
    }

    const phoneRegex = /^01[016789]\d{8}$/;
    if (!phoneRegex.test(form.phoneNumber.replace(/-/g, ''))) {
      Alert.alert('오류', '올바른 전화번호 형식을 입력해주세요.');
      return;
    }

    // 2단계로 이동 (비밀번호 설정)
    navigation.navigate('SignupStep2', { signupData: form });
  };

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.logo}>logo</Text>
          
          {/* 단계 표시 */}
          <View style={styles.stepContainer}>
            <View style={[styles.step, styles.activeStep]}>
              <Text style={styles.activeStepText}>1</Text>
            </View>
            <View style={styles.stepLine} />
            <View style={styles.step}>
              <Text style={styles.stepText}>2</Text>
            </View>
            <View style={styles.stepLine} />
            <View style={styles.step}>
              <Text style={styles.stepText}>3</Text>
            </View>
          </View>
          
          <Text style={styles.stepTitle}>기본 정보를 입력해주세요</Text>
        </View>

        <View style={styles.formContainer}>
          {/* 닉네임 입력 */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>닉네임 *</Text>
            <View style={styles.inputWithButton}>
              <View style={[
                styles.inputWrapper,
                { flex: 1, marginRight: 8 },
                errors.nickname && styles.inputWrapperError
              ]}>
                <TextInput
                  style={styles.input}
                  placeholder="coco"
                  placeholderTextColor="#A0A0A0"
                  value={form.nickname}
                  onChangeText={(value) => handleInputChange('nickname', value)}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
              <TouchableOpacity 
                style={[styles.checkButton, isNicknameChecked && styles.checkedButton]}
                onPress={checkNicknameDuplicate}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={[styles.checkButtonText, isNicknameChecked && styles.checkedButtonText]}>
                    {isNicknameChecked ? '확인됨' : '중복확인'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
            {errors.nickname && (
              <Text style={styles.errorText}>{errors.nickname}</Text>
            )}
            <Text style={styles.helperText}>사용 가능한 닉네임입니다</Text>
          </View>

          {/* 이메일 입력 */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>이메일 *</Text>
            <View style={styles.inputWithButton}>
              <View style={[
                styles.inputWrapper,
                { flex: 1, marginRight: 8 },
                errors.email && styles.inputWrapperError
              ]}>
                <TextInput
                  style={styles.input}
                  placeholder="coco@gmail.com"
                  placeholderTextColor="#A0A0A0"
                  value={form.email}
                  onChangeText={(value) => handleInputChange('email', value)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
              <TouchableOpacity 
                style={[
                  styles.checkButton,
                  isCodeSent && styles.checkedButton
                ]}
                onPress={sendVerificationCode}
                disabled={isLoading || isEmailVerified}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={[
                    styles.checkButtonText,
                    isCodeSent && styles.checkedButtonText
                  ]}>
                    {isEmailVerified ? '인증완료' : isCodeSent ? '재발송' : '인증'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
            {errors.email && (
              <Text style={styles.errorText}>{errors.email}</Text>
            )}
            
            {/* 인증번호 입력 */}
            {isCodeSent && !isEmailVerified && (
              <View style={styles.verificationContainer}>
                <View style={[
                  styles.inputWrapper,
                  { flex: 1, marginRight: 8 },
                  errors.verificationCode && styles.inputWrapperError
                ]}>
                  <TextInput
                    style={styles.input}
                    placeholder="1234"
                    placeholderTextColor="#A0A0A0"
                    value={form.verificationCode}
                    onChangeText={(value) => handleInputChange('verificationCode', value)}
                    keyboardType="number-pad"
                    maxLength={6}
                  />
                </View>
                <TouchableOpacity 
                  style={styles.verifyButton}
                  onPress={verifyCode}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.checkButtonText}>인증확인</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* 전화번호 입력 */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>전화번호 *</Text>
            <View style={[
              styles.inputWrapper,
              errors.phoneNumber && styles.inputWrapperError
            ]}>
              <TextInput
                style={styles.input}
                placeholder="010-1234-5678"
                placeholderTextColor="#A0A0A0"
                value={form.phoneNumber}
                onChangeText={handlePhoneChange}
                keyboardType="phone-pad"
                maxLength={13}
              />
            </View>
            {errors.phoneNumber && (
              <Text style={styles.errorText}>{errors.phoneNumber}</Text>
            )}
          </View>

          {/* 버튼들 */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.backButton} onPress={handleBack}>
              <Text style={styles.backButtonText}>이전</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.nextButton, isLoading && styles.disabledButton]} 
              onPress={handleNext}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.nextButtonText}>다음</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>이미 계정이 있으신가요? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}>로그인하기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#7CB342',
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    alignItems: 'center',
  },
  logo: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontStyle: 'italic',
    marginBottom: 30,
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  step: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    // 추가: 그림자 효과
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  activeStep: {
    backgroundColor: '#FFFFFF',
  },
  stepLine: {
    width: 60,
    height: 2,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 10,
  },
  stepText: {
    fontSize: 16,
    color: '#7CB342',
    fontWeight: 'bold',
  },
  activeStepText: {
    fontSize: 16,
    color: '#7CB342',
    fontWeight: 'bold',
  },
  stepTitle: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  formContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24, // 더 둥글게
    borderTopRightRadius: 24,
    paddingHorizontal: 30,
    paddingTop: 30,
    paddingBottom: 40, // 추가: 하단 패딩
  },
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
    backgroundColor: '#7CB342',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
    minHeight: 50, // 추가: 최소 높이
  },
  checkedButton: {
    backgroundColor: '#4CAF50',
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
  helperText: {
    fontSize: 12,
    color: '#7CB342',
    marginTop: 5,
  },
  verificationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  verifyButton: {
    backgroundColor: '#7CB342',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
    minHeight: 50, // 추가: 최소 높이
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 15,
    marginTop: 30,
    marginBottom: 20,
  },
  backButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#7CB342', // 색상 변경
    borderRadius: 25, // 더 둥글게
    paddingVertical: 16,
    alignItems: 'center',
    minHeight: 52, // 추가: 최소 높이
  },
  backButtonText: {
    color: '#7CB342', // 색상 변경
    fontSize: 16,
    fontWeight: '600', // 더 굵게
  },
  nextButton: {
    flex: 1,
    backgroundColor: '#7CB342',
    borderRadius: 25, // 더 둥글게
    paddingVertical: 16,
    alignItems: 'center',
    minHeight: 52, // 추가: 최소 높이
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600', // 더 굵게
  },
  disabledButton: {
    backgroundColor: '#A0A0A0',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10, // 추가: 상단 여백
  },
  loginText: {
    fontSize: 14,
    color: '#666666',
  },
  loginLink: {
    fontSize: 14,
    color: '#7CB342',
    fontWeight: 'bold',
  },
});

export default SignupStep1Screen;