import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

// axios 인스턴스 생성
const apiClient = axios.create({
  // 다양한 로컬 서버 주소 옵션들:
  // 'http://localhost:8080'     - 일반적인 localhost (웹 브라우저용)
  // 'http://10.0.2.2:8080'     - Android 에뮬레이터용
  // 'http://127.0.0.1:8080'    - 로컬 루프백 주소
  // 'http://192.168.x.x:8080'  - 실제 IP 주소 (WiFi 네트워크)
  baseURL: __DEV__ ? 'http://192.168.30.191:8080' : 'https://api.cocos-forest.com',
  timeout: 15000, // 타임아웃을 15초로 증가
  headers: {
    'Content-Type': 'application/json',
  },
});

// Mock adapter 완전 비활성화 - 실제 백엔드 API만 사용
// let mock: MockAdapter | undefined;

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

// Mock 완전 비활성화
// export { mock };

export default apiClient;