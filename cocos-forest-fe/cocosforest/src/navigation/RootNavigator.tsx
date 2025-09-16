// src/navigation/RootNavigator.tsx

import React, { useEffect } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuthStore } from '../store/authStore';
import { RootStackParamList } from '../types/navigation';

import { AuthNavigator } from './AuthNavigator';
import { MainNavigator } from './MainNavigator';

const Stack = createStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  const { isAuthenticated, isLoading, initialize } = useAuthStore();

  // 앱 시작 시 저장된 인증 정보 복원
  useEffect(() => {
    initialize();
  }, [initialize]);

  // 로딩 중일 때 스플래시 화면 표시
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7CB342" />
      </View>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'none', // 인증 상태 변경 시 애니메이션 없음
      }}
    >
      {isAuthenticated ? (
        // 인증된 사용자: 메인 앱 표시
        <Stack.Screen name="Main" component={MainNavigator} />
      ) : (
        // 인증되지 않은 사용자: 인증 화면 표시
        <Stack.Screen name="Auth" component={AuthNavigator} />
      )}
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#7CB342', // 앱 테마 색상으로 로딩 화면
  },
});