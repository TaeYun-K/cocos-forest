import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

// axios 인스턴스 생성
const apiClient = axios.create({
  baseURL: __DEV__ ? 'https://api.cocos-forest.dev' : 'https://api.cocos-forest.com',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Mock adapter 선언 (개발 환경에서만 초기화)
let mock: MockAdapter | undefined;

// 개발 환경에서만 mock adapter 설정
if (__DEV__) {
  mock = new MockAdapter(apiClient);

  // 요청/응답 인터셉터 (디버깅용)
  apiClient.interceptors.request.use(
    (config) => {
      console.log(`🌐 API Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
      return config;
    },
    (error) => {
      console.error('API Request Error:', error);
      return Promise.reject(error);
    }
  );

  apiClient.interceptors.response.use(
    (response) => {
      console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status}`);
      console.log(`📊 Response data:`, response.data);
      return response;
    },
    (error) => {
      console.error('❌ API Response Error:', error.config?.method?.toUpperCase(), error.config?.url, error.response?.status || 'Network Error');
      return Promise.reject(error);
    }
  );
}

// Mock 설정을 export하여 다른 파일에서 사용할 수 있도록
export { mock };

export default apiClient;