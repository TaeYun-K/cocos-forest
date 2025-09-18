import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { authService } from '../../services/authService';
import { SignupStep1Form } from '../../types/auth';
import { SignupHeader } from '../../components/auth/SignupHeader';
import { NicknameInput } from '../../components/auth/NicknameInput';
import { EmailVerificationInput } from '../../components/auth/EmailVerificationInput';
import { PhoneInput } from '../../components/auth/PhoneInput';
import { SignupButtons } from '../../components/auth/SignupButtons';
import { signupStep1Styles } from '../../styles/auth/signupStep1Styles';

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
  const [timeLeft, setTimeLeft] = useState(0); // 타이머 상태 (초 단위)
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // 타이머 시작 함수
  const startTimer = () => {
    setTimeLeft(180); // 3분 = 180초
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  // 타이머 정리 함수
  const clearTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setTimeLeft(0);
  };

  // 타이머 효과
  useEffect(() => {
    if (timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearTimer();
            Alert.alert('시간 만료', '인증 시간이 만료되었습니다. 다시 인증번호를 요청해주세요.');
            setIsCodeSent(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [timeLeft]);

  // 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      clearTimer();
    };
  }, []);

  // 시간 포맷팅 함수 (MM:SS)
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

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
      clearTimer(); // 이메일 변경 시 타이머 리셋
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
      startTimer(); // 인증번호 발송 후 타이머 시작
      Alert.alert('인증번호 발송', '이메일로 인증번호가 발송되었습니다.\n3분 내에 인증을 완료해주세요.');
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
        clearTimer(); // 인증 성공 시 타이머 정리
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
      style={signupStep1Styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={signupStep1Styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <SignupHeader currentStep={1} stepTitle="기본 정보를 입력해주세요" />

        <View style={signupStep1Styles.formContainer}>
          <NicknameInput
            value={form.nickname}
            onChangeText={(value) => handleInputChange('nickname', value)}
            onCheckDuplicate={checkNicknameDuplicate}
            isLoading={isLoading}
            isChecked={isNicknameChecked}
            error={errors.nickname}
          />

          <EmailVerificationInput
            email={form.email}
            verificationCode={form.verificationCode}
            onEmailChange={(value) => handleInputChange('email', value)}
            onVerificationCodeChange={(value) => handleInputChange('verificationCode', value)}
            onSendCode={sendVerificationCode}
            onVerifyCode={verifyCode}
            isLoading={isLoading}
            isCodeSent={isCodeSent}
            isEmailVerified={isEmailVerified}
            emailError={errors.email}
            codeError={errors.verificationCode}
            timeLeft={timeLeft}
            formatTime={formatTime}
          />

          <PhoneInput
            value={form.phoneNumber}
            onChangeText={handlePhoneChange}
            error={errors.phoneNumber}
          />

          <SignupButtons
            isLoading={isLoading}
            onBack={handleBack}
            onNext={handleNext}
            onLogin={() => navigation.navigate('Login')}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default SignupStep1Screen;