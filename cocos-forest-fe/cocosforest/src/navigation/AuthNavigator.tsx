import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthStackParamList } from '../types/navigation';

// 개선된 화면들 import
import { LoginScreen } from '../screens/auth/LoginScreen';
import { SignupStep1Screen } from '../screens/auth/SignupStep1Screen';
import { SignupStep2Screen } from '../screens/auth/SignupStep2Screen';
import { SignupStep3Screen } from '../screens/auth/SignupStep3Screen';

const Stack = createStackNavigator<AuthStackParamList>();

export const AuthNavigator: React.FC = () => {
  return (
    <Stack.Navigator 
      screenOptions={{
        headerShown: false, // 모든 화면에서 헤더 숨김
        gestureEnabled: true, // Android 뒤로가기 제스처 활성화
        cardStyle: { backgroundColor: '#7CB342' }, // 화면 전환 시 배경색
      }}
    >
      <Stack.Screen 
        name="Login" 
        component={LoginScreen}
        options={{
          title: '로그인',
        }}
      />
      
      <Stack.Screen 
        name="SignupStep1" 
        component={SignupStep1Screen}
        options={{
          title: '기본 정보 입력',
        }}
      />
      
      <Stack.Screen 
        name="SignupStep2" 
        component={SignupStep2Screen}
        options={{
          title: '비밀번호 설정',
        }}
      />
      
      <Stack.Screen 
        name="SignupStep3" 
        component={SignupStep3Screen}
        options={{
          title: '약관 동의',
        }}
      />
    </Stack.Navigator>
  );
};