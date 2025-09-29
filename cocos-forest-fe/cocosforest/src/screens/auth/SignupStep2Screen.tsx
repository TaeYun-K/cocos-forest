import React, { useState } from 'react';
import {
  View,
  Text,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SignupStep2Form } from '../../types/auth';
import { SignupHeader } from '../../components/auth/SignupHeader';
import { PasswordInput } from '../../components/auth/PasswordInput';
import { PasswordConfirmInput } from '../../components/auth/PasswordConfirmInput';
import { SignupButtons } from '../../components/auth/SignupButtons';
import { signupStep2Styles } from '../../styles/auth/signupStep2Styles';

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

    if (password.length < 8) {
      errors.push('최소 8자 이상 입력해주세요');
    }

    if (password.length > 16) {
      errors.push('최대 16자까지 입력 가능합니다');
    }

    if (!/[a-zA-Z]/.test(password)) {
      errors.push('영문자를 포함해야 합니다');
    }

    if (!/\d/.test(password)) {
      errors.push('숫자를 포함해야 합니다');
    }

    if (!/\W/.test(password)) {
      errors.push('특수문자를 포함해야 합니다');
    }

    if (/\s/.test(password)) {
      errors.push('공백은 사용할 수 없습니다');
    }

    return errors;
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

  const isPasswordValid = validatePassword(form.password).length === 0;
  const isPasswordMatch = form.password === form.passwordConfirm && form.passwordConfirm !== '';

  return (
    <KeyboardAvoidingView
      style={signupStep2Styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={signupStep2Styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <SignupHeader currentStep={2} stepTitle="비밀번호를 설정해주세요" />

        <View style={signupStep2Styles.formContainer}>
          <PasswordInput
            value={form.password}
            onChangeText={(value) => handleInputChange('password', value)}
            showPassword={showPassword}
            onTogglePassword={() => setShowPassword(!showPassword)}
            placeholder="비밀번호를 입력하세요 (8~16자)"
            error={errors.password}
            showStrengthIndicator
            validatePassword={validatePassword}
          />

          <PasswordConfirmInput
            value={form.passwordConfirm}
            onChangeText={(value) => handleInputChange('passwordConfirm', value)}
            showPassword={showPasswordConfirm}
            onTogglePassword={() => setShowPasswordConfirm(!showPasswordConfirm)}
            isPasswordMatch={isPasswordMatch}
            error={errors.passwordConfirm}
          />

          <Text style={signupStep2Styles.passwordHint}>
            비밀번호는 8~16자 영문 대 소문자, 숫자, 특수문자를 사용하세요.
          </Text>

          <SignupButtons
            isLoading={false}
            onBack={handleBack}
            onNext={handleNext}
            onLogin={() => navigation.navigate('Login')}
            disabled={!isPasswordValid || !isPasswordMatch}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default SignupStep2Screen; 