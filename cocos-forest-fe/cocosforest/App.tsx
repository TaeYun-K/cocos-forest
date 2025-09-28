// App.tsx
import { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { Platform, View, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { NavigationContainer } from "@react-navigation/native";
import { QueryClientProvider } from "@tanstack/react-query";
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import * as Clipboard from 'expo-clipboard';
import Constants from 'expo-constants';
import { useFonts } from 'expo-font';

import { RootNavigator } from "./src/navigation/RootNavigator";
import { validateEnv } from "./src/config/env";
import { queryClient } from "./src/config/queryClient";
import { useNotifications } from "./src/hooks/useNotification";
import { useNotificationStore } from "./src/store/notification";

// 푸시 알림 등록 에러 처리
function handleRegistrationError(errorMessage: string) {
  console.error('Push notification registration error:', errorMessage);
  
  // 에뮬레이터인 경우 다른 메시지
  if (!Device.isDevice) {
    console.warn('🔄 에뮬레이터에서는 푸시 알림을 사용할 수 없습니다.');
  }
}

// 푸시 알림 토큰 등록 함수 (에뮬레이터 대응)
async function registerForPushNotificationsAsync() {
  // 에뮬레이터인 경우 모킹된 토큰 반환
  if (!Device.isDevice) {
    console.warn('📱 에뮬레이터에서는 가짜 토큰을 생성합니다.');
    const mockToken = `ExponentPushToken[EMULATOR_MOCK_${Date.now()}]`;
    console.log('🔑 Mock Push Token:', mockToken);
    return mockToken;
  }

  // Android 알림 채널 설정
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  // 기존 권한 상태 확인
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  // 권한이 없으면 요청
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  
  if (finalStatus !== 'granted') {
    handleRegistrationError('Permission not granted to get push token for push notification!');
    return null;
  }
  
  // 프로젝트 ID 가져오기
  const projectId =
    Constants?.expoConfig?.extra?.eas?.projectId ??
    Constants?.easConfig?.projectId;
  
  if (!projectId) {
    handleRegistrationError('Project ID not found');
    return null;
  }
  
  try {
    const pushTokenString = (
      await Notifications.getExpoPushTokenAsync({
        projectId,
      })
    ).data;
    
    console.log('🔑 Push Token:', pushTokenString);
    return pushTokenString;
  } catch (e: unknown) {
    handleRegistrationError(`Failed to get push token: ${e}`);
    return null;
  }
}

export default function App() {
  const { setPushToken } = useNotificationStore();
  
  // 알림 훅 사용 (리스너들이 여기서 등록됨)
  useNotifications();

  const [fontsLoaded] = useFonts({
    'Hakgyoansim_EohangkkumigiOTFB': require('./assets/fonts/Hakgyoansim_EohangkkumigiOTFB.otf'),
    'Jalnan2': require('./assets/fonts/Jalnan2.otf'),
  });

  useEffect(() => {
    // 환경변수 검증
    validateEnv();
    
   // 푸시 알림 초기화 (수정된 부분)
const initializeNotifications = async () => {
  try {
    const token = await registerForPushNotificationsAsync();
    if (token) {
      setPushToken(token);
      console.log('✅ 푸시 토큰 저장 완료');
      
      // 에뮬레이터용 추가 정보
      if (!Device.isDevice) {
        console.log('📌 에뮬레이터 사용 중 - 실제 푸시 알림 테스트를 위해서는 실제 디바이스가 필요합니다.');
        console.log('🔗 테스트 URL: https://expo.dev/notifications');
      }
      
      // 백엔드에 토큰 전송 함수
      const sendTokenToBackend = async (token: string) => {
        try {
          console.log('🚀 서버에 토큰 전송 시작:', token);
          
          const response = await fetch('https://j13e205.p.ssafy.io/dev/api/push-token', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              token: token,
              userId: 'current-user-id', // 실제 사용자 ID로 변경 필요
              deviceType: 'android',
              deviceInfo: {
                isDevice: Device.isDevice,
                deviceName: Device.deviceName,
                osName: Device.osName,
                osVersion: Device.osVersion
              }
            })
          });
          
          if (response.ok) {
            const responseData = await response.text();
            console.log('✅ 토큰이 서버에 성공적으로 전송됨');
            console.log('📤 서버 응답:', responseData);
          } else {
            console.log('❌ 서버 응답 에러:', response.status, response.statusText);
          }
        } catch (error) {
          console.log('❌ 토큰 전송 실패:', error);
        }
      };

      // 실제로 서버에 토큰 전송 (이 부분이 빠져있었음!)
      await sendTokenToBackend(token);
    }
  } catch (error) {
    console.error('❌ 푸시 알림 초기화 실패:', error);
  }
};

    // 폰트 로딩이 완료된 후 알림 초기화
    if (fontsLoaded) {
      initializeNotifications();
    }
  }, [fontsLoaded, setPushToken]);

  // 폰트 로딩 중일 때 로딩 화면 표시
  if (!fontsLoaded) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <View style={styles.container}>
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
        <StatusBar style="dark" backgroundColor="#000000" />
      </View>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  infoButton: {
    backgroundColor: '#34C759',
    padding: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  infoButtonText: {
    color: 'white',
    fontSize: 11,
    fontWeight: 'bold',
    textAlign: 'center',
  }
});