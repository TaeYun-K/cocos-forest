import React, { useState } from 'react';
import {
  View,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
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

  const { login, isLoading } = useAuthStore();

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
  );
};

export default LoginScreen;