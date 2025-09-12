## 9/9 (화) - React Native 개발 환경 선택 및 기술 스택 확정

### 오늘 한 일
React Native CLI와 Expo를 비교 분석하여 개발 환경을 선택하고, 프론트엔드 전체 기술 스택을 확정했다.

### React Native CLI vs Expo 비교

**CLI 선택 이유:**
- 네이티브 모듈 접근 가능 (금융 API 연동 시 보안성)
- 3D 렌더링을 위한 커스텀 뷰 구현 필요
- 성능 최적화 여지가 많음
- 향후 확장성 고려

**Expo 대비 단점:**
- 복잡한 초기 환경 설정
- Android Studio, Xcode 설정 필요

### 기술 스택 확정
- **코어**: React Native CLI
- **언어**: TypeScript (타입 안정성)
- **상태 관리**: Zustand (가벼움, 직관적 API)
- **데이터 페칭**: React Query (캐싱, 동기화)
- **API 모킹**: MSW (선택사항, 백엔드 개발 전 테스트용)
- **코드 품질**: ESLint & Prettier

### 배운 점
각 라이브러리의 장단점을 비교할 때 학습 곡선과 프로젝트 복잡도를 함께 고려해야 한다. Zustand는 Redux 대비 보일러플레이트가 적어 빠른 개발에 유리하다.