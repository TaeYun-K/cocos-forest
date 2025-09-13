# TIL - 2025년 9월 12일

## React Native의 데이터 모킹

### 문제 상황
React Native 프로젝트에서 API 모킹을 위해 MSW(Mock Service Worker)/native를 도입했으나 실패하고, 결국 axios-mock-adapter로 변경하여 성공

### MSW/native 실패 원인 분석

```typescript
// MSW 방식 - 실패한 설정
const apiClient = axios.create({
  baseURL: 'http://localhost:3000', // MSW가 인터셉트할 수 있는 절대 URL 사용
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  adapter: 'fetch', // MSW와 호환되는 fetch adapter 사용
});
```

- 네트워크 요청은 인터셉트되지만, axios에 이 결과를 전달하지 못하여 데이터 반환 문제 발생


### axios-mock-adapter 적용

#### 1. 구현 방식의 차이점

| MSW/native | axios-mock-adapter |
|------------|-------------------|
| Service Worker 기반 | axios 라이브러리 내부 인터셉션 |
| 네트워크 레이어에서 작동 | 애플리케이션 레이어에서 작동 |
| 브라우저 환경 특화 | 환경 무관 |
| fetch API 의존 | axios 인스턴스 의존 |

## 💡 배운 점

- **웹 개발**: MSW가 이상적 (Service Worker 활용)
- **React Native**: axios-mock-adapter가 더 안정적

React Native 환경에서는 브라우저 기반 도구들이 예상과 다르게 동작할 수 있다는 것을 체감했다. 
**환경의 특성을 이해하고 그에 맞는 도구를 선택하는 것**이 개발 효율성에 큰 영향을 미친다. 
MSW는 웹에서는 훌륭하지만, axios를 사용하는 React Native 프로젝트에서는 axios-mock-adapter가 더 합리적인 선택이었다.