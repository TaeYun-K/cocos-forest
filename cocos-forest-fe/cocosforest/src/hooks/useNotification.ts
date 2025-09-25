// hooks/useNotifications.ts
import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { useNotificationStore } from '../store/notification';

// 알림 표시 설정
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export const useNotifications = () => {
  const { setCurrentNotification, setPushToken } = useNotificationStore();
  
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();

  useEffect(() => {
    // 1. 앱이 활성 상태일 때 알림을 받는 리스너
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('📱 알림 수신:', notification);
      
      // 결제 관련 알림인지 확인
      if (notification.request.content.data?.type === 'payment') {
        setCurrentNotification(notification);
        
        // 결제 알림 처리 로직
        handlePaymentNotification(notification);
      }
    });

    // 2. 사용자가 알림을 탭했을 때의 리스너
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('👆 알림 탭:', response);
      
      // 알림 탭 시 현재 알림 상태 초기화 (사라지게 함)
      setCurrentNotification(null);
      
      // 여기서 나중에 네비게이션 처리 가능
      // 예: navigation.navigate('PaymentDetail', { paymentId: response.notification.request.content.data?.paymentId });
    });

    return () => {
      // 컴포넌트 언마운트 시 리스너 정리
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, [setCurrentNotification]);

  // 결제 알림 처리 함수
  const handlePaymentNotification = (notification: Notifications.Notification) => {
    const { data } = notification.request.content;
    
    console.log('💳 결제 알림 처리:', {
      paymentId: data?.paymentId,
      amount: data?.amount,
      merchantName: data?.merchantName,
      category: data?.category,
    });

    // 여기서 결제 정보를 기반으로 추가 처리
    // 예: 탄소 배출량 계산, 챌린지 업데이트 등
  };

  return {
    // 필요한 함수들을 반환 (나중에 확장 가능)
  };
};