import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
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
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <SignupHeader currentStep={2} stepTitle="비밀번호를 설정해주세요" />

        <View style={styles.formContainer}>
          <PasswordInput
            value={form.password}
            onChangeText={(value) => handleInputChange('password', value)}
            showPassword={showPassword}
            onTogglePassword={() => setShowPassword(!showPassword)}
            placeholder="비밀번호를 입력하세요 (최소 6자)"
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

          <Text style={styles.passwordHint}>
            비밀번호는 6자 이상이어야 하며, 영문자와 숫자를 포함해야 합니다.
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#7CB342',
  },
  scrollContent: {
    flexGrow: 1,
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
  passwordHint: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 30,
    lineHeight: 16,
  },
});

export default SignupStep2Screen; 