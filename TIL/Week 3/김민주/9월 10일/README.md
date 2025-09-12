## 9/10 (수) - 디렉토리 구조 설계 및 코드 마이그레이션

### 오늘 한 일
React Native CLI 프로젝트의 체계적인 디렉토리 구조를 설계하고, 기존 React 웹 코드를 React Native용으로 변환하는 작업을 수행했다.

### 디렉토리 구조 설계
Feature-based 구조로 설계하여 유지보수성과 확장성을 고려:
```
src/
├── screens/ (화면별 컴포넌트)
├── components/ (재사용 컴포넌트)
├── navigation/ (네비게이션 로직)
├── services/ (API 통신)
├── hooks/ (커스텀 훅)
├── types/ (TypeScript 타입 정의)
├── utils/ (유틸리티 함수)
└── styles/ (공통 스타일)
```

### React → React Native 변환 작업
주요 변환 포인트들:
- `<div>` → `<View>`
- `<p>`, `<span>` → `<Text>`
- `<button>` → `<TouchableOpacity>`
- CSS 스타일 → StyleSheet 객체
- 이벤트 핸들러 (`onClick` → `onPress`)

### 배운 점
체계적인 디렉토리 구조는 프로젝트 초기에 설계하는 것이 중요하다. React와 React Native의 컴포넌트 차이점을 이해하고 일괄 변환 스크립트를 작성하면 효율적이다.