import React, { useState } from 'react';
import {
  View,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useAuthStore } from '../../store/authStore';
import { SignupStep3Form, SignupForm } from '../../types/auth';
import { SignupHeader } from '../../components/auth/SignupHeader';
import { AgreementSection } from '../../components/auth/AgreementSection';
import { SignupButtons } from '../../components/auth/SignupButtons';
import { signupStep3Styles } from '../../styles/auth/signupStep3Styles';

interface SignupStep3ScreenProps {
  navigation: any;
  route: {
    params: {
      signupData: any;
    };
  };
}

export const SignupStep3Screen: React.FC<SignupStep3ScreenProps> = ({ navigation, route }) => {
  const { signupData } = route.params;
  
  const [agreements, setAgreements] = useState<SignupStep3Form['agreements']>({
    terms: false,
    privacy: false,
    marketing: false,
  });

  const [isLoading, setIsLoading] = useState(false);
  const { signup } = useAuthStore();

  const handleAgreementChange = (type: keyof SignupStep3Form['agreements']) => {
    setAgreements(prev => ({
      ...prev,
      [type]: !prev[type],
    }));
  };

  // 전체 동의 토글 함수 추가
  const handleAllAgreementToggle = () => {
    const allRequired = agreements.terms && agreements.privacy;
    const newValue = !allRequired;
    
    setAgreements({
      terms: newValue,
      privacy: newValue,
      marketing: newValue,
    });
  };

  const handleSignup = async () => {
    if (!agreements.terms) {
      Alert.alert('약관 동의', '이용약관 동의는 필수입니다.');
      return;
    }

    if (!agreements.privacy) {
      Alert.alert('약관 동의', '개인정보처리방침 동의는 필수입니다.');
      return;
    }

    const completeSignupData: SignupForm = {
      ...signupData,
      agreements,
    };

    try {
      setIsLoading(true);
      await signup(completeSignupData);
      
      Alert.alert(
        '회원가입 완료', 
        '코코와 함께하는 탄소 절약 챌린지에 오신 것을 환영합니다!'
      );
    } catch (error) {
      Alert.alert('회원가입 실패', error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const allRequiredAgreed = agreements.terms && agreements.privacy;

  return (
    <KeyboardAvoidingView
      style={signupStep3Styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <SignupHeader currentStep={3} stepTitle="약관에 동의해주세요" />

      <View style={signupStep3Styles.formContainer}>
        <AgreementSection
          agreements={agreements}
          onAgreementChange={handleAgreementChange}
          onAllAgreementToggle={handleAllAgreementToggle}
        />

        <SignupButtons
          isLoading={isLoading}
          onBack={handleBack}
          onNext={handleSignup}
          onLogin={() => navigation.navigate('Login')}
          disabled={!allRequiredAgreed}
          nextButtonText="가입완료"
        />
      </View>
    </KeyboardAvoidingView>
  );
};

export default SignupStep3Screen;