import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView, // 추가: 키보드 대응
} from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // 추가: 아이콘
import { useAuthStore } from '../../store/authStore';
import { LoginForm } from '../../types/auth';

interface LoginScreenProps {
  navigation: any; // 실제로는 NavigationProp 타입 사용
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const [form, setForm] = useState<LoginForm>({
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Partial<LoginForm>>({}); // 추가: 에러 상태
  
  const { login } = useAuthStore();

  const handleInputChange = (field: keyof LoginForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    
    // 입력 시 해당 필드 에러 초기화
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  // 추가: 폼 유효성 검사
  const validateForm = (): boolean => {
    const newErrors: Partial<LoginForm> = {};
    
    // 이메일 검증
    if (!form.email.trim()) {
      newErrors.email = '이메일을 입력해주세요';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = '올바른 이메일 형식이 아닙니다';
    }
    
    // 비밀번호 검증
    if (!form.password.trim()) {
      newErrors.password = '비밀번호를 입력해주세요';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    // 유효성 검사 먼저 실행
    if (!validateForm()) {
      return;
    }

    try {
      setIsLoading(true);
      await login(form);
      // 네비게이션은 AuthStore의 상태 변화로 자동 처리됨
    } catch (error) {
      Alert.alert('로그인 실패', error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = () => {
    navigation.navigate('SignupStep1');
  };

  const handleForgotPassword = () => {
    Alert.alert('비밀번호 찾기', '개발 중인 기능입니다.');
  };

  const handleGoogleLogin = () => {
    Alert.alert('구글 로그인', '개발 중인 기능입니다.');
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
          <Text style={styles.subtitle}>코코와 함께하는</Text>
          <Text style={styles.subtitle}>탄소 절약 챌린지</Text>
          
          {/* 코코넛 캐릭터 이미지 */}
          <View style={styles.characterContainer}>
            {/* 이미지가 있다면 주석 해제 */}
            {/* <Image 
              source={require('../../../assets/coconut-character.png')}
              style={styles.characterImage}
              resizeMode="contain"
            /> */}
            {/* 임시 아이콘 */}
            <Ionicons name="leaf" size={50} color="#7CB342" />
          </View>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>로그인</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>이메일</Text>
            <View style={[
              styles.inputWrapper,
              errors.email && styles.inputWrapperError
            ]}>
              <TextInput
                style={styles.input}
                placeholder="이메일을 입력하세요"
                placeholderTextColor="#A0A0A0"
                value={form.email}
                onChangeText={(value) => handleInputChange('email', value)}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
            {errors.email && (
              <Text style={styles.errorText}>{errors.email}</Text>
            )}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>비밀번호</Text>
            <View style={[
              styles.passwordContainer,
              errors.password && styles.inputWrapperError
            ]}>
              <TextInput
                style={styles.passwordInput}
                placeholder="비밀번호를 입력하세요"
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
            
            <TouchableOpacity onPress={handleForgotPassword}>
              <Text style={styles.forgotPassword}>비밀번호를 잊으셨나요?</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={[styles.loginButton, isLoading && styles.disabledButton]} 
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.loginButtonText}>로그인</Text>
            )}
          </TouchableOpacity>

          {/* 또는 구분선 추가 */}
          <Text style={styles.orText}>또는</Text>

          <TouchableOpacity style={styles.googleButton} onPress={handleGoogleLogin}>
            <Text style={styles.googleButtonText}>G  구글로 로그인</Text>
          </TouchableOpacity>

          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>계정이 없으신가요? </Text>
            <TouchableOpacity onPress={handleSignup}>
              <Text style={styles.signupLink}>가입하기</Text>
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
    backgroundColor: '#7CB342', // 녹색 배경
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 20, // 추가: 하단 여백
  },
  logo: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontStyle: 'italic',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 5,
  },
  characterContainer: {
    width: 120,
    height: 120,
    backgroundColor: '#FFFFFF',
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
    // 추가: 그림자 효과
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  characterImage: {
    width: 80,
    height: 80,
  },
  formContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24, // 더 둥글게
    borderTopRightRadius: 24,
    paddingHorizontal: 30,
    paddingTop: 30,
    paddingBottom: 40,
    minHeight: 400,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 30,
    textAlign: 'center', // 추가: 중앙 정렬
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
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    backgroundColor: '#FAFAFA',
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
  forgotPassword: {
    fontSize: 14,
    color: '#7CB342',
    textAlign: 'right',
    marginTop: 8,
  },
  loginButton: {
    backgroundColor: '#7CB342',
    borderRadius: 25, // 더 둥글게
    paddingVertical: 16, // 더 높게
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 15,
    minHeight: 52, // 추가: 최소 높이
  },
  disabledButton: {
    backgroundColor: '#A0A0A0',
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600', // 더 굵게
  },
  orText: {
    fontSize: 14,
    color: '#A0A0A0',
    textAlign: 'center',
    marginBottom: 15,
  },
  googleButton: {
    borderWidth: 1,
    borderColor: '#7CB342',
    borderRadius: 25, // 더 둥글게
    paddingVertical: 16, // 더 높게
    alignItems: 'center',
    marginBottom: 20,
    minHeight: 52, // 추가: 최소 높이
  },
  googleButtonText: {
    color: '#7CB342',
    fontSize: 16,
    fontWeight: '600', // 더 굵게
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10, // 추가: 상단 여백
  },
  signupText: {
    fontSize: 14,
    color: '#666666',
  },
  signupLink: {
    fontSize: 14,
    color: '#7CB342',
    fontWeight: 'bold',
  },
});

export default LoginScreen;