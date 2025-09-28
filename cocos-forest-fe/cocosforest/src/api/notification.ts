// api/notification.ts
// 나중에 백엔드 연동 시 사용할 함수들

export interface PushTokenRequest {
  pushToken: string;
  deviceType: 'ios' | 'android';
  userId?: string;
}

export const sendTokenToBackend = async (pushToken: string): Promise<void> => {
  try {
    // 기존 baseResponse 형식에 맞춰서 호출
    const response = await fetch('/api/users/push-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Authorization: `Bearer ${userToken}`, // 인증이 필요한 경우
      },
      body: JSON.stringify({
        pushToken,
        deviceType: Platform.OS === 'ios' ? 'ios' : 'android',
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (!result.isSuccess) {
      throw new Error(result.message);
    }

    console.log('✅ 푸시 토큰 서버 등록 성공');
  } catch (error) {
    console.error('❌ 푸시 토큰 서버 등록 실패:', error);
    throw error;
  }
};

// 알림 설정 업데이트 (사용자가 특정 알림을 끄고 싶을 때)
export const updateNotificationSettings = async (settings: {
  paymentNotification: boolean;
  challengeNotification?: boolean;
}): Promise<void> => {
  try {
    const response = await fetch('/api/users/notification-settings', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(settings),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (!result.isSuccess) {
      throw new Error(result.message);
    }

    console.log('✅ 알림 설정 업데이트 성공');
  } catch (error) {
    console.error('❌ 알림 설정 업데이트 실패:', error);
    throw error;
  }
};