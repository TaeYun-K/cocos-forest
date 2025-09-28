import { Alert } from 'react-native';

/**
 * 계좌 연결이 필요한 상황에서 사용자를 프로필 화면으로 안내하는 유틸리티
 */
export const redirectToAccountLinking = (navigation: any, errorMessage?: string) => {
  const defaultMessage = '계좌 정보를 불러올 수 없습니다.\n\n먼저 계좌를 연결해주세요.';

  Alert.alert(
    '계좌 연결 필요',
    errorMessage || defaultMessage,
    [
      {
        text: '취소',
        style: 'cancel'
      },
      {
        text: '계좌 연결하기',
        onPress: () => {
          // 프로필 탭으로 이동하고 계좌 연결 모달을 열도록 파라미터 전달
          navigation.navigate('Profile', { openAccountModal: true });
        }
      }
    ]
  );
};

/**
 * API 에러 응답을 분석해서 계좌 연결 관련 에러인지 확인
 */
export const isAccountLinkingError = (error: any): boolean => {
  console.log('🔍 에러 분석 시작:', error);
  console.log('🔍 에러 타입:', typeof error);
  console.log('🔍 에러 메시지:', error?.message);

  // 케이스 1: Axios 에러 객체 (error.response가 있는 경우)
  if (error?.response) {
    const status = error.response.status;
    const message = error.response.data?.message || error.message || '';

    console.log(`📊 에러 상태 코드: ${status}`);
    console.log(`📝 에러 메시지: ${message}`);

    // 400 에러 (잘못된 요청) - 계좌 연결이 안된 상태에서 발생
    if (status === 400) {
      console.log('✅ 400 에러 감지됨 - 계좌 연결 필요');
      return true;
    }
  }
  // 케이스 2: 변환된 Error 객체 (메시지에서 상태코드 추론)
  else if (error?.message) {
    const message = error.message;
    console.log(`📝 변환된 에러 메시지: ${message}`);

    // "잘못된 요청입니다" 메시지는 400 에러를 의미
    if (message.includes('잘못된 요청입니다') ||
        message.includes('파라미터를 확인해주세요') ||
        message.includes('bad request')) {
      console.log('✅ 400 에러 관련 메시지 감지됨 - 계좌 연결 필요');
      return true;
    }

    // 계좌 관련 키워드가 포함된 경우
    const accountKeywords = ['account', '계좌', 'card', '카드', '카드를 연결해주세요'];
    const hasKeyword = accountKeywords.some(keyword =>
      message.toLowerCase().includes(keyword.toLowerCase())
    );

    if (hasKeyword) {
      console.log('✅ 계좌 관련 키워드 감지됨');
      return true;
    }
  } else {
    console.log('⚠️ error.response와 error.message 모두 없음:', error);
  }

  console.log('❌ 계좌 연결 관련 에러가 아님');
  return false;
};

/**
 * 네트워크 에러나 일반적인 API 에러인지 확인
 */
export const isNetworkError = (error: any): boolean => {
  return !error?.response || error.code === 'NETWORK_ERROR';
};