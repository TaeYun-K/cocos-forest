import messaging from '@react-native-firebase/messaging';
import { Platform, PermissionsAndroid } from 'react-native';
import apiClient from '../api/axios';

class FirebaseService {
  constructor() {
    this.init();
  }

  // Firebase 초기화
  init = async () => {
    try {
      // Firebase 메시징 권한 요청
      await this.requestUserPermission();
      
      // FCM 토큰 가져오기
      const token = await this.getFCMToken();
      console.log('FCM Token:', token);
      
      // 메시지 리스너 설정
      this.setupMessageListeners();
      
      // 기본 토픽 구독
      await this.subscribeToDefaultTopics();
      
    } catch (error) {
      console.error('Firebase 초기화 실패:', error);
    }
  };

  // 알림 권한 요청
  requestUserPermission = async () => {
    if (Platform.OS === 'ios') {
      // iOS 권한 요청
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        console.log('iOS 알림 권한 승인됨');
      } else {
        console.log('iOS 알림 권한 거부됨');
      }
    } else if (Platform.OS === 'android') {
      // Android 권한 요청 (Android 13+)
      if (Platform.Version >= 33) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
        );
        
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          console.log('Android 알림 권한 승인됨');
        } else {
          console.log('Android 알림 권한 거부됨');
        }
      }
    }
  };

  // FCM 토큰 가져오기
  getFCMToken = async () => {
    try {
      const token = await messaging().getToken();
      
      // 토큰을 백엔드 서버로 전송 (사용자 등록/로그인 시)
      // await this.sendTokenToServer(token);
      
      return token;
    } catch (error) {
      console.error('FCM 토큰 가져오기 실패:', error);
      return null;
    }
  };

  // 백엔드 서버로 토큰 전송
  sendTokenToServer = async (token) => {
    try {
      const response = await apiClient.post<BaseResponse<any>>("/api/fcm/");
      
      if (response.ok) {
        console.log('FCM 토큰 서버 전송 성공');
      }
    } catch (error) {
      console.error('FCM 토큰 서버 전송 실패:', error);
    }
  };

  // 메시지 리스너 설정
  setupMessageListeners = () => {
    // 앱이 포그라운드에 있을 때 메시지 수신
    messaging().onMessage(async remoteMessage => {
      console.log('포그라운드 메시지 수신:', remoteMessage);
      
      // 커스텀 알림 표시 (선택사항)
      this.showCustomNotification(remoteMessage);
    });

    // 백그라운드/종료 상태에서 알림 클릭으로 앱 열기
    messaging().onNotificationOpenedApp(remoteMessage => {
      console.log('백그라운드에서 알림 클릭:', remoteMessage);
      
      // 특정 화면으로 네비게이션
      this.handleNotificationNavigation(remoteMessage);
    });

    // 앱이 종료된 상태에서 알림 클릭으로 앱 시작
    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          console.log('앱 종료 상태에서 알림 클릭:', remoteMessage);
          this.handleNotificationNavigation(remoteMessage);
        }
      });

    // 토큰 갱신 감지
    messaging().onTokenRefresh(token => {
      console.log('FCM 토큰 갱신:', token);
      this.sendTokenToServer(token);
    });
  };

  // 커스텀 알림 표시 (앱이 활성화 상태일 때)
  showCustomNotification = (remoteMessage) => {
    // React Native의 Alert 또는 커스텀 알림 컴포넌트 사용
    console.log('알림 제목:', remoteMessage.notification?.title);
    console.log('알림 내용:', remoteMessage.notification?.body);
    
    // TODO: 커스텀 알림 UI 표시
  };

  // 알림 클릭 시 네비게이션 처리
  handleNotificationNavigation = (remoteMessage) => {
    const { data } = remoteMessage;
    
    // 알림에 포함된 데이터에 따라 다른 화면으로 이동
    switch (data?.type) {
      case 'CHALLENGE_COMPLETE':
        // 챌린지 완료 화면으로 이동
        console.log('챌린지 화면으로 이동');
        break;
      case 'CARBON_REPORT':
        // 탄소 리포트 화면으로 이동
        console.log('리포트 화면으로 이동');
        break;
      case 'DAILY_REMINDER':
        // 메인 화면으로 이동
        console.log('메인 화면으로 이동');
        break;
      default:
        // 기본적으로 메인 화면으로 이동
        console.log('메인 화면으로 이동');
    }
  };

  // 기본 토픽 구독
  subscribeToDefaultTopics = async () => {
    try {
      // 전체 사용자 알림 토픽 구독
      await messaging().subscribeToTopic('cocos-forest-daily');
      await messaging().subscribeToTopic('cocos-forest-notice');
      
      console.log('기본 토픽 구독 완료');
    } catch (error) {
      console.error('토픽 구독 실패:', error);
    }
  };

  // 특정 토픽 구독
  subscribeToTopic = async (topicName) => {
    try {
      await messaging().subscribeToTopic(topicName);
      console.log(`토픽 구독 완료: ${topicName}`);
    } catch (error) {
      console.error(`토픽 구독 실패: ${topicName}`, error);
    }
  };

  // 특정 토픽 구독 해제
  unsubscribeFromTopic = async (topicName) => {
    try {
      await messaging().unsubscribeFromTopic(topicName);
      console.log(`토픽 구독 해제 완료: ${topicName}`);
    } catch (error) {
      console.error(`토픽 구독 해제 실패: ${topicName}`, error);
    }
  };

  // 사용자 설정에 따른 토픽 관리
  updateNotificationSettings = async (settings) => {
    try {
      // 아침 알림 설정
      if (settings.morningReminder) {
        await this.subscribeToTopic('morning-reminder');
      } else {
        await this.unsubscribeFromTopic('morning-reminder');
      }

      // 저녁 요약 설정
      if (settings.eveningSummary) {
        await this.subscribeToTopic('evening-summary');
      } else {
        await this.unsubscribeFromTopic('evening-summary');
      }

      console.log('알림 설정 업데이트 완료');
    } catch (error) {
      console.error('알림 설정 업데이트 실패:', error);
    }
  };

  // FCM 토큰 반환 (필요시 다른 컴포넌트에서 사용)
  getCurrentToken = async () => {
    try {
      return await messaging().getToken();
    } catch (error) {
      console.error('토큰 가져오기 실패:', error);
      return null;
    }
  };
}

// Firebase 서비스 인스턴스 생성 및 export
const firebaseService = new FirebaseService();

export default firebaseService;