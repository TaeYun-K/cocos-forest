import React, { useState, useEffect } from 'react';
import {
  View,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Modal,
  Image,
  Text,
  StyleSheet,
} from 'react-native';
import { useAuthStore } from '../../store/authStore';
import { LoginForm } from '../../types/auth';
import { LoginHeader } from '../../components/auth/LoginHeader';
import { EmailInput } from '../../components/auth/EmailInput';
import { PasswordInput } from '../../components/auth/PasswordInput';
import { LoginButtons } from '../../components/auth/LoginButtons';
import { loginStyles } from '../../styles/auth/loginStyles';

interface LoginScreenProps {
  navigation: any; // 실제로는 NavigationProp 타입 사용
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const [form, setForm] = useState<LoginForm>({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Partial<LoginForm>>({});
  const [loadingDots, setLoadingDots] = useState('.');

  const { login, isLoading } = useAuthStore();

  // 로딩 애니메이션 효과
  useEffect(() => {
    if (!isLoading) return;

    const interval = setInterval(() => {
      setLoadingDots(prev => {
        if (prev === '.') return '..';
        if (prev === '..') return '...';
        return '.';
      });
    }, 500);

    return () => clearInterval(interval);
  }, [isLoading]);

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
    if (!validateForm()) {
      return;
    }

    try {
      await login(form);
    } catch (error) {
      Alert.alert('로그인 실패', error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.');
    } 
  };

  const handleSignup = () => {
    navigation.navigate('SignupStep1');
  };

  return (
    <>
      <KeyboardAvoidingView
        style={loginStyles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={loginStyles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <LoginHeader />

          <View style={loginStyles.formContainer}>
            <EmailInput
              value={form.email}
              onChangeText={(value) => handleInputChange('email', value)}
              error={errors.email}
            />

            <PasswordInput
              value={form.password}
              onChangeText={(value) => handleInputChange('password', value)}
              showPassword={showPassword}
              onTogglePassword={() => setShowPassword(!showPassword)}
              error={errors.password}
              showForgotPassword
            />

            <LoginButtons
              isLoading={isLoading}
              onLogin={handleLogin}
              onSignup={handleSignup}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* 로딩 오버레이 */}
      <Modal visible={isLoading} transparent animationType="fade">
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingContent}>
            <Image
              source={require('../../../assets/coco-loading-unscreen.gif')}
              style={styles.loadingGif}
              resizeMode="contain"
            />
            <Text style={styles.loadingText}>로딩중{loadingDots}</Text>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  loadingOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContent: {
    backgroundColor: '#ededed',
    borderRadius: 20,
    padding: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  loadingGif: {
    width: 200,
    height: 200,
  },
  loadingText: {
    marginTop: 20,
    fontSize: 18,
    color: '#1f2937',
    fontWeight: '600',
  },
});

export default LoginScreen;