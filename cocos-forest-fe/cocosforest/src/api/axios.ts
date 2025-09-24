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
        console.log(`🔐 전체 토큰 길이: ${token.length}자`);
        console.log(`🔐 Authorization 헤더: Bearer ${token.substring(0, 50)}...`);
      } else {
        console.log('⚠️ 저장된 토큰이 없습니다 - 인증이 필요한 API 호출 시 403 에러가 발생할 수 있습니다');
        console.log('⚠️ AsyncStorage 키:', ENV.AUTH_TOKEN_KEY);
      }
    } catch (error) {
      console.error('토큰 로드 오류:', error);
    }

    if (ENV.IS_DEV) {
      console.log(`🌐 API Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
      console.log('📋 Request Headers:', JSON.stringify(config.headers, null, 2));
      if (config.data) {
        console.log('📊 Request Data:', JSON.stringify(config.data, null, 2));
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
      console.log('🔄 401 Unauthorized - 토큰 재발급 시도');
      try {
        const refreshToken = await AsyncStorage.getItem(ENV.REFRESH_TOKEN_KEY);
        if (refreshToken) {
          console.log('🔄 Refresh Token 발견, 재발급 시도');
          // TODO: 실제 토큰 재발급 API 호출 구현
          // const newToken = await refreshAccessToken(refreshToken);
          // await AsyncStorage.setItem(ENV.AUTH_TOKEN_KEY, newToken);
          console.log('⚠️ 토큰 재발급 로직이 구현되지 않았습니다. 로그인이 필요합니다.');
        } else {
          console.log('❌ Refresh Token이 없습니다. 로그인이 필요합니다.');
        }
      } catch (refreshError) {
        console.error('토큰 재발급 실패:', refreshError);
        // 리프레시 토큰도 만료된 경우 로그아웃 처리
        await AsyncStorage.removeItem(ENV.AUTH_TOKEN_KEY);
        await AsyncStorage.removeItem(ENV.REFRESH_TOKEN_KEY);
        console.log('🧹 저장된 토큰을 삭제했습니다. 로그인이 필요합니다.');
      }
    }

    // 403 에러 시 인증 상태 확인 및 안내
    if (error.response?.status === 403) {
      const token = await AsyncStorage.getItem(ENV.AUTH_TOKEN_KEY);
      console.error('🚫 403 Forbidden 오류 발생');
      console.error('🚫 요청 URL:', error.config?.url);
      console.error('🚫 요청 메서드:', error.config?.method);
      console.error('🚫 응답 상태:', error.response?.status);
      console.error('🚫 응답 데이터:', error.response?.data);
      console.error('🚫 요청 헤더:', JSON.stringify(error.config?.headers, null, 2));
      
      if (!token) {
        console.error('🚫 403 Forbidden: 인증 토큰이 없습니다. 로그인이 필요합니다.');
        console.error('🚫 AsyncStorage 키:', ENV.AUTH_TOKEN_KEY);
        error.message = '로그인이 필요합니다. 로그인 후 다시 시도해주세요.';
        
        // 토큰이 없는 경우 자동으로 로그아웃 상태로 설정
        try {
          await AsyncStorage.removeItem(ENV.AUTH_TOKEN_KEY);
          await AsyncStorage.removeItem(ENV.REFRESH_TOKEN_KEY);
          await AsyncStorage.removeItem(ENV.AUTH_USER_KEY);
          console.log('🧹 토큰이 없어 저장된 인증 정보를 삭제했습니다.');
        } catch (cleanupError) {
          console.error('🧹 인증 정보 삭제 실패:', cleanupError);
        }
      } else {
        console.error('🚫 403 Forbidden: 인증 토큰이 유효하지 않거나 권한이 없습니다.');
        console.error('🚫 저장된 토큰:', token.substring(0, 50) + '...');
        console.error('🚫 토큰 길이:', token.length);
        console.error('🚫 토큰 형식 확인:', token.startsWith('eyJ') ? 'JWT 형식' : 'JWT 형식이 아님');
        
        // 토큰이 있지만 403 오류가 발생한 경우, 토큰이 만료되었을 가능성이 높음
        console.log('🔄 토큰이 만료되었을 가능성이 있습니다. 로그인이 필요합니다.');
        error.message = '인증이 만료되었습니다. 로그인을 다시 해주세요.';
      }
    }

    // 500 에러 시 서버 오류 안내
    if (error.response?.status === 500) {
      console.error('🚨 500 Internal Server Error: 서버에서 내부 오류가 발생했습니다.');
      error.message = '서버에서 일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
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

// 토큰 상태 디버깅 함수
export const debugTokenStatus = async () => {
  try {
    const token = await AsyncStorage.getItem(ENV.AUTH_TOKEN_KEY);
    const refreshToken = await AsyncStorage.getItem(ENV.REFRESH_TOKEN_KEY);
    const user = await AsyncStorage.getItem(ENV.AUTH_USER_KEY);
    
    console.log('🔍 === 토큰 상태 디버깅 ===');
    console.log('🔍 AUTH_TOKEN_KEY:', ENV.AUTH_TOKEN_KEY);
    console.log('🔍 REFRESH_TOKEN_KEY:', ENV.REFRESH_TOKEN_KEY);
    console.log('🔍 AUTH_USER_KEY:', ENV.AUTH_USER_KEY);
    console.log('🔍 Access Token:', token ? `${token.substring(0, 50)}... (길이: ${token.length})` : '없음');
    console.log('🔍 Refresh Token:', refreshToken ? `${refreshToken.substring(0, 50)}... (길이: ${refreshToken.length})` : '없음');
    console.log('🔍 User Info:', user ? '있음' : '없음');
    console.log('🔍 ========================');
    
    return {
      hasAccessToken: !!token,
      hasRefreshToken: !!refreshToken,
      hasUser: !!user,
      tokenLength: token?.length || 0,
      refreshTokenLength: refreshToken?.length || 0
    };
  } catch (error) {
    console.error('🔍 토큰 상태 확인 실패:', error);
    return null;
  }
};

// 서버 연결 테스트 함수
export const testServerConnection = async () => {
  try {
    console.log('🌐 === 서버 연결 테스트 시작 ===');
    console.log('🌐 API_BASE_URL:', ENV.API_BASE_URL);
    
    // 헬스체크 엔드포인트 테스트
    const healthResponse = await apiClient.get('/api/health');
    console.log('🌐 헬스체크 응답:', healthResponse.status, healthResponse.data);
    
    // 토큰 없이 접근 가능한 엔드포인트 테스트
    const publicResponse = await apiClient.get('/api/public/test');
    console.log('🌐 공개 엔드포인트 응답:', publicResponse.status, publicResponse.data);
    
    console.log('🌐 === 서버 연결 테스트 완료 ===');
    return { success: true, healthStatus: healthResponse.status };
  } catch (error: any) {
    console.error('🌐 === 서버 연결 테스트 실패 ===');
    console.error('🌐 오류 타입:', error.name);
    console.error('🌐 오류 메시지:', error.message);
    console.error('🌐 응답 상태:', error.response?.status);
    console.error('🌐 응답 데이터:', error.response?.data);
    console.error('🌐 요청 URL:', error.config?.url);
    console.error('🌐 요청 메서드:', error.config?.method);
    console.error('🌐 ================================');
    
    return { 
      success: false, 
      error: error.message,
      status: error.response?.status,
      data: error.response?.data
    };
  }
};

// Mock 설정을 export하여 다른 파일에서 사용할 수 있도록
export { mock };

export default apiClient;
export { apiClient as axiosInstance };