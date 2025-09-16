import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // 추가: 아이콘
import { useAuthStore } from '../../store/authStore';
// import { authService } from '../../services/authService';
import { SignupStep3Form, SignupForm } from '../../types/auth';

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
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <Text style={styles.logo}>logo</Text>
        
        {/* 단계 표시 */}
        <View style={styles.stepContainer}>
          <View style={styles.step}>
            <Text style={styles.stepText}>1</Text>
          </View>
          <View style={[styles.stepLine, styles.completedStepLine]} />
          <View style={styles.step}>
            <Text style={styles.stepText}>2</Text>
          </View>
          <View style={[styles.stepLine, styles.completedStepLine]} />
          <View style={[styles.step, styles.activeStep]}>
            <Text style={styles.activeStepText}>3</Text>
          </View>
        </View>
        
        <Text style={styles.stepTitle}>약관에 동의해주세요</Text>
      </View>

      <View style={styles.formContainer}>
        <ScrollView 
          style={styles.agreementList} 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* 전체 동의 섹션 */}
          <TouchableOpacity 
            style={[
              styles.allAgreementContainer,
              allRequiredAgreed && styles.allAgreementContainerActive
            ]}
            onPress={handleAllAgreementToggle}
          >
            <View style={styles.allCheckboxContainer}>
              <View style={[
                styles.allCheckbox,
                allRequiredAgreed && styles.allCheckboxChecked
              ]}>
                {allRequiredAgreed && (
                  <Ionicons name="checkmark" size={20} color="#FFFFFF" />
                )}
              </View>
              <Text style={[
                styles.allAgreementText,
                allRequiredAgreed && styles.allAgreementTextActive
              ]}>
                전체 동의
              </Text>
            </View>
          </TouchableOpacity>

          {/* 개별 약관 동의 */}
          <View style={styles.individualAgreements}>
            {/* 이용약관 동의 */}
            <TouchableOpacity 
              style={styles.agreementItem} 
              onPress={() => handleAgreementChange('terms')}
            >
              <View style={styles.checkboxContainer}>
                <View style={[styles.checkbox, agreements.terms && styles.checkedCheckbox]}>
                  {agreements.terms && (
                    <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                  )}
                </View>
                <Text style={styles.agreementText}>
                  이용약관 동의 <Text style={styles.required}>(필수)</Text>
                </Text>
              </View>
              <TouchableOpacity style={styles.viewButton}>
                <Text style={styles.viewButtonText}>보기</Text>
              </TouchableOpacity>
            </TouchableOpacity>

            {/* 개인정보처리방침 동의 */}
            <TouchableOpacity 
              style={styles.agreementItem} 
              onPress={() => handleAgreementChange('privacy')}
            >
              <View style={styles.checkboxContainer}>
                <View style={[styles.checkbox, agreements.privacy && styles.checkedCheckbox]}>
                  {agreements.privacy && (
                    <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                  )}
                </View>
                <Text style={styles.agreementText}>
                  개인정보처리방침 동의 <Text style={styles.required}>(필수)</Text>
                </Text>
              </View>
              <TouchableOpacity style={styles.viewButton}>
                <Text style={styles.viewButtonText}>보기</Text>
              </TouchableOpacity>
            </TouchableOpacity>

            {/* 마케팅 정보 수신 동의 */}
            <TouchableOpacity 
              style={styles.agreementItem} 
              onPress={() => handleAgreementChange('marketing')}
            >
              <View style={styles.checkboxContainer}>
                <View style={[styles.checkbox, agreements.marketing && styles.checkedCheckbox]}>
                  {agreements.marketing && (
                    <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                  )}
                </View>
                <Text style={styles.agreementText}>
                  마케팅 정보 수신 동의 <Text style={styles.optional}>(선택)</Text>
                </Text>
              </View>
              <TouchableOpacity style={styles.viewButton}>
                <Text style={styles.viewButtonText}>보기</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          </View>

          {/* 추가 안내 정보 */}
          <View style={styles.infoContainer}>
            <Text style={styles.infoText}>
              • 필수 항목에 동의하지 않으시면 서비스 이용이 제한될 수 있습니다.
            </Text>
            <Text style={styles.infoText}>
              • 선택 항목은 동의하지 않아도 서비스 이용이 가능합니다.
            </Text>
          </View>
        </ScrollView>

        {/* 버튼들 */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={handleBack}
            disabled={isLoading}
          >
            <Text style={styles.backButtonText}>이전</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.nextButton, 
              (!allRequiredAgreed || isLoading) && styles.disabledButton
            ]} 
            onPress={handleSignup}
            disabled={!allRequiredAgreed || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.nextButtonText}>가입완료</Text>
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
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#7CB342',
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
    paddingTop: 40,
  },
  agreementList: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  allAgreementContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  allAgreementContainerActive: {
    backgroundColor: '#E8F5E8',
    borderColor: '#7CB342',
  },
  allCheckboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  allCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#DEE2E6',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  allCheckboxChecked: {
    backgroundColor: '#7CB342',
    borderColor: '#7CB342',
  },
  allAgreementText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#495057',
  },
  allAgreementTextActive: {
    color: '#7CB342',
  },
  individualAgreements: {
    marginBottom: 24,
  },
  agreementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  checkboxContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#DEE2E6',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checkedCheckbox: {
    backgroundColor: '#7CB342',
    borderColor: '#7CB342',
  },
  agreementText: {
    fontSize: 14,
    color: '#333333',
    flex: 1,
  },
  required: {
    color: '#FF5722',
    fontWeight: '500',
  },
  optional: {
    color: '#7CB342',
    fontWeight: '500',
  },
  viewButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#7CB342',
  },
  viewButtonText: {
    fontSize: 12,
    color: '#7CB342',
    fontWeight: '500',
  },
  infoContainer: {
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
  },
  infoText: {
    fontSize: 12,
    color: '#6C757D',
    lineHeight: 18,
    marginBottom: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 20,
    paddingBottom: 16,
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
    paddingBottom: 20,
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

export default SignupStep3Screen;