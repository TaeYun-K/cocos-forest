import axios from 'axios';

// axios 인스턴스 생성 및 fetch adapter 설정
const apiClient = axios.create({
  baseURL: 'http://localhost:3000', // MSW가 인터셉트할 수 있는 절대 URL 사용
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  adapter: 'fetch', // MSW와 호환되는 fetch adapter 사용
});

export default apiClient;