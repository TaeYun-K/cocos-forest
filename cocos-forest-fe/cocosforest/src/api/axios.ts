import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ENV } from '../config/env';

// axios 인스턴스 생성
const apiClient = axios.create({
  baseURL: ENV.API_BASE_URL,
  timeout: ENV.API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터 - 인증 토큰 추가
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem(ENV.AUTH_TOKEN_KEY);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log(`🔐 토큰 추가됨: ${token.substring(0, 20)}...`);
      } else {
        console.log('⚠️ 저장된 토큰이 없습니다');
      }
    } catch (error) {
      console.error('토큰 로드 오류:', error);
    }

    if (ENV.IS_DEV) {
      console.log(`🌐 API Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
      console.log('📋 Request Headers:', config.headers);
      if (config.data) {
        console.log('📊 Request Data:', config.data);
      }
    }
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// 응답 인터셉터 - 토큰 만료 처리
apiClient.interceptors.response.use(
  (response) => {
    if (ENV.IS_DEV) {
      console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status}`);
      console.log(`📊 Response data:`, response.data);
    }
    return response;
  },
  async (error) => {
    if (ENV.IS_DEV) {
      console.error('❌ API Response Error:', error.config?.method?.toUpperCase(), error.config?.url, error.response?.status || 'Network Error');
    }

    // 401 에러 시 토큰 재발급 시도
    if (error.response?.status === 401) {
      try {
        const refreshToken = await AsyncStorage.getItem(ENV.REFRESH_TOKEN_KEY);
        if (refreshToken) {
          // 토큰 재발급 로직 (필요시 구현)
          console.log('토큰 재발급 필요');
        }
      } catch (refreshError) {
        console.error('토큰 재발급 실패:', refreshError);
        // 리프레시 토큰도 만료된 경우 로그아웃 처리
        await AsyncStorage.removeItem(ENV.AUTH_TOKEN_KEY);
        await AsyncStorage.removeItem(ENV.REFRESH_TOKEN_KEY);
      }
    }

    return Promise.reject(error);
  }
);

// Mock adapter 선언 (개발 환경에서만 초기화)
let mock: MockAdapter | undefined;

// 개발 환경에서만 mock adapter 설정 (실제 API 연동 시 비활성화)
if (ENV.IS_DEV && false) { // false로 설정하여 Mock 비활성화
  mock = new MockAdapter(apiClient);
}

// Mock 설정을 export하여 다른 파일에서 사용할 수 있도록
export { mock };

export default apiClient;