import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView, // 추가: 키보드 대응
} from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // 추가: 아이콘
import { SignupStep2Form } from '../../types/auth';

interface SignupStep2ScreenProps {
  navigation: any;
  route: {
    params: {
      signupData: any;
    };
  };
}

export const SignupStep2Screen: React.FC<SignupStep2ScreenProps> = ({ navigation, route }) => {
  const { signupData } = route.params;
  
  const [form, setForm] = useState<SignupStep2Form>({
    password: '',
    passwordConfirm: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [errors, setErrors] = useState<Partial<SignupStep2Form>>({}); // 추가: 에러 상태

  const handleInputChange = (field: keyof SignupStep2Form, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    
    // 입력 시 에러 초기화
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validatePassword = (password: string): string[] => {
    const errors: string[] = [];
    
    if (password.length < 6) {
      errors.push('최소 6자 이상 입력해주세요');
    }
    
    if (password.length > 20) {
      errors.push('최대 20자까지 입력 가능합니다');
    }
    
    if (!/[a-zA-Z]/.test(password)) {
      errors.push('영문자를 포함해야 합니다');
    }
    
    if (!/\d/.test(password)) {
      errors.push('숫자를 포함해야 합니다');
    }
    
    return errors;
  };

  const getPasswordStrength = (password: string): { level: number; text: string; color: string } => {
    if (password.length === 0) {
      return { level: 0, text: '', color: '#E0E0E0' };
    }
    
    const errors = validatePassword(password);
    if (errors.length > 2) {
      return { level: 1, text: '약함', color: '#FF5722' };
    } else if (errors.length > 0) {
      return { level: 2, text: '보통', color: '#FF9800' };
    } else {
      return { level: 3, text: '강함', color: '#4CAF50' };
    }
  };

  const handleNext = () => {
    const passwordErrors = validatePassword(form.password);
    if (passwordErrors.length > 0) {
      Alert.alert('비밀번호 오류', passwordErrors.join('\n'));
      return;
    }

    if (form.password !== form.passwordConfirm) {
      Alert.alert('비밀번호 확인', '비밀번호가 일치하지 않습니다.');
      return;
    }

    // 3단계로 이동 (약관 동의)
    navigation.navigate('SignupStep3', { 
      signupData: {
        ...signupData,
        password: form.password,
        passwordConfirm: form.passwordConfirm,
      }
    });
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const passwordStrength = getPasswordStrength(form.password);
  const isPasswordValid = validatePassword(form.password).length === 0;
  const isPasswordMatch = form.password === form.passwordConfirm && form.passwordConfirm !== '';

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
            <View style={styles.step}>
              <Text style={styles.stepText}>1</Text>
            </View>
            <View style={[styles.stepLine, styles.completedStepLine]} />
            <View style={[styles.step, styles.activeStep]}>
              <Text style={styles.activeStepText}>2</Text>
            </View>
            <View style={styles.stepLine} />
            <View style={styles.step}>
              <Text style={styles.stepText}>3</Text>
            </View>
          </View>
          
          <Text style={styles.stepTitle}>비밀번호를 설정해주세요</Text>
        </View>

        <View style={styles.formContainer}>
          {/* 비밀번호 입력 */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>비밀번호 *</Text>
            <View style={[
              styles.passwordContainer,
              errors.password && styles.inputWrapperError
            ]}>
              <TextInput
                style={styles.passwordInput}
                placeholder="비밀번호를 입력하세요 (최소 6자)"
                placeholderTextColor="#A0A0A0"
                value={form.password}
                onChangeText={(value) => handleInputChange('password', value)}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity 
                style={styles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons
                  name={showPassword ? 'eye-off' : 'eye'}
                  size={20}
                  color="#A0A0A0"
                />
              </TouchableOpacity>
            </View>
            {errors.password && (
              <Text style={styles.errorText}>{errors.password}</Text>
            )}
            
            {/* 비밀번호 강도 표시 */}
            {form.password !== '' && (
              <View style={styles.strengthContainer}>
                <Text style={styles.strengthLabel}>강도: </Text>
                <View style={styles.strengthBars}>
                  {[1, 2, 3].map((level) => (
                    <View
                      key={level}
                      style={[
                        styles.strengthBar,
                        {
                          backgroundColor: level <= passwordStrength.level 
                            ? passwordStrength.color 
                            : '#E0E0E0'
                        }
                      ]}
                    />
                  ))}
                </View>
                <Text style={[styles.strengthText, { color: passwordStrength.color }]}>
                  {passwordStrength.text}
                </Text>
              </View>
            )}
          </View>

          {/* 비밀번호 확인 */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>비밀번호 확인 *</Text>
            <View style={[
              styles.passwordContainer,
              errors.passwordConfirm && styles.inputWrapperError
            ]}>
              <TextInput
                style={styles.passwordInput}
                placeholder="12345678"
                placeholderTextColor="#A0A0A0"
                value={form.passwordConfirm}
                onChangeText={(value) => handleInputChange('passwordConfirm', value)}
                secureTextEntry={!showPasswordConfirm}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity 
                style={styles.eyeButton}
                onPress={() => setShowPasswordConfirm(!showPasswordConfirm)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons
                  name={showPasswordConfirm ? 'eye-off' : 'eye'}
                  size={20}
                  color="#A0A0A0"
                />
              </TouchableOpacity>
            </View>
            {errors.passwordConfirm && (
              <Text style={styles.errorText}>{errors.passwordConfirm}</Text>
            )}
            
            {/* 비밀번호 일치 확인 */}
            {form.passwordConfirm !== '' && (
              <Text style={[
                styles.matchText,
                { color: isPasswordMatch ? '#4CAF50' : '#FF5722' }
              ]}>
                {isPasswordMatch ? '비밀번호가 일치합니다' : '비밀번호가 일치하지 않습니다'}
              </Text>
            )}
          </View>

          <Text style={styles.passwordHint}>
            비밀번호는 6자 이상이어야 하며, 영문자와 숫자를 포함해야 합니다.
          </Text>

          {/* 버튼들 */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.backButton} onPress={handleBack}>
              <Text style={styles.backButtonText}>이전</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.nextButton, 
                (!isPasswordValid || !isPasswordMatch) && styles.disabledButton
              ]} 
              onPress={handleNext}
              disabled={!isPasswordValid || !isPasswordMatch}
            >
              <Text style={styles.nextButtonText}>다음</Text>
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
  completedStepLine: {
    backgroundColor: '#4CAF50',
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
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 30,
    paddingTop: 30,
    paddingBottom: 40,
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
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    backgroundColor: '#FAFAFA',
  },
  inputWrapperError: {
    borderColor: '#FF4444',
    backgroundColor: '#FFF8F8',
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
  },
  eyeButton: {
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  errorText: {
    fontSize: 12,
    color: '#FF4444',
    marginTop: 4,
  },
  strengthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  strengthLabel: {
    fontSize: 12,
    color: '#666666',
    marginRight: 8,
  },
  strengthBars: {
    flexDirection: 'row',
    marginRight: 8,
  },
  strengthBar: {
    width: 20,
    height: 4,
    marginRight: 2,
    borderRadius: 2,
  },
  strengthText: {
    fontSize: 12,
    fontWeight: '500',
  },
  matchText: {
    fontSize: 12,
    marginTop: 5,
    fontWeight: '500',
  },
  passwordHint: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 30,
    lineHeight: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 20,
  },
  backButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#7CB342',
    borderRadius: 25,
    paddingVertical: 16,
    alignItems: 'center',
    minHeight: 52,
  },
  backButtonText: {
    color: '#7CB342',
    fontSize: 16,
    fontWeight: '600',
  },
  nextButton: {
    flex: 1,
    backgroundColor: '#7CB342',
    borderRadius: 25,
    paddingVertical: 16,
    alignItems: 'center',
    minHeight: 52,
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: '#A0A0A0',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
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

export default SignupStep2Screen; 